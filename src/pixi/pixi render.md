todo pixi render 流程
todo pixi 绘制的过程
todo 有无内置优化点？？
todo 还支持什么别的渲染模式吗？？除了 canvas

# Sprite 是如何绘制到 canvas 上的？
```js
const app = new PIXI.Application({ backgroundColor: 0x1099bb });
const sprite = PIXI.Sprite.from('https://pixijs.io/examples-v4/examples/assets/bunny.png');

sprite.anchor.set(0.5);
sprite.x = app.screen.width / 2;
sprite.y = app.screen.height / 2;

app.stage.addChild(sprite);
document.getElementById('pixi-container').appendChild(app.view);
```

我们暂时不关心 app 和 sprite 是如何创建的，聚焦在以下两行代码：
```js
// 将 sprite 添加到 app 的画布上
app.stage.addChild(sprite);
// 将 canvas 添加到 DOM 中
document.getElementById('pixi-container').appendChild(app.view);
```

首先来看下 addChild 的时候发生了什么。

## app.stage.addChild(sprite)
```js
Container.prototype.addChild = function (...args) {
    // ...
    // 如果有多个 child 被添加，则递归调用该方法

    const child = args[0];

    // if the child has a parent then lets remove it as PixiJS objects can only exist in one place
    if (child.parent) {
        child.parent.removeChild(child);
    }

    child.parent = this;
    this.children.push(child);

    // 触发事件
    this.onChildrenChange(this.children.length - 1);
    this.emit('childAdded', child, this, this.children.length - 1);
    child.emit('added', this);
}
```

接下来我们来看，在 addChild 之后，pixi 是如何更新视图的。

## 视图更新
PIXI 是通过 ticker 更新的，每个 app 都有一个。

### 第一个 ticker
renderer 自带一个 ticker 用于处理事件。
todo 怎么从 renderer 中取到这个东西？？
todo 换个地方
```js
// Render.initPlugins
AbstractRenderer.prototype.initPlugins = function (staticMap) {
    // staticMap 中包含七个 plugin
    for (var o in staticMap) {
        this.plugins[o] = new (staticMap[o])(this);
    }
};
```
todo 作用？
staticMap 中包含的七个 plugin 分别是：
- accessibility: ƒ AccessibilityManager(renderer)
- batch: ƒ BatchPlugin(renderer)
- extract: ƒ Extract(renderer)
- interaction: ƒ InteractionManager(renderer, options)
- particle: ƒ ParticleRenderer(renderer)
- prepare: ƒ Prepare(renderer)
- tilingSprite:function TilingSpriteRenderer(renderer)

```js
InteractionManager.prototype.setTargetElement = function (element, resolution) {
    if (resolution === void 0) { resolution = 1; }
    this.removeTickerListener();
    this.removeEvents();
    this.interactionDOMElement = element;
    this.resolution = resolution;
    this.addEvents();
    this.addTickerListener();
};

InteractionManager.prototype.addTickerListener = function () {
    if (this.tickerAdded || !this.interactionDOMElement || !this._useSystemTicker) {
        return;
    }

    // 重点：this.tickerUpdate 做了什么？
    Ticker.system.add(this.tickerUpdate, this, UPDATE_PRIORITY.INTERACTION);
    this.tickerAdded = true;
};

InteractionManager.prototype.tickerUpdate = function (deltaTime) {
    this._deltaTime += deltaTime;

    if (this._deltaTime < this.interactionFrequency) {
        return;
    }

    this._deltaTime = 0;
    // 注意这里的 this.update 和下面 tick 的 update 不一样，这里是 InteractionManager.update，下面是 Ticker.update
    this.update();
};
```

Ticker 是如何创建的？
Ticker.system 是一个系统自带的 Ticker 实例，Ticker 的构造函数中包含如下代码：
```js
// The first listener. All new listeners added are chained on this.
this._head = new TickerListener(null, null, Infinity);

// 在这里, 一个 Ticker 被正式添加到 requestAnimationFrame 中
this._tick = (time: number): void => {
    this._requestId = null;

    if (this.started) {
        // todo 关注的重点, 我们后面来看
        this.update(time);

        // Listener side effects may have modified ticker state.
        if (this.started && this._requestId === null && this._head.next) {
            this._requestId = requestAnimationFrame(this._tick);
        }
    }
};
```

现在让我们回过头看看 Ticker.system.add 做了什么。
```js
Ticker.prototype.add = function (fn, context, priority = UPDATE_PRIORITY.NORMAL) {
    return this._addListener(new TickerListener(fn, context, priority));
};

// TickerListener
// 这东西是个链表, 前一个连着后一个
function TickerListener(fn, context = null, priority = 0, once = false) {
    /**
     * The handler function to execute.
     * @private
     * @member {Function}
     */
    this.fn = fn;
    /**
     * The calling to execute.
     * @private
     * @member {*}
     */
    this.context = context;
    /**
     * The current priority.
     * @private
     * @member {number}
     */
    this.priority = priority;
    /**
     * If this should only execute once.
     * @private
     * @member {boolean}
     */
    this.once = once;
    /**
     * The next item in chain.
     * @private
     * @member {TickerListener}
     */
    this.next = null;
    /**
     * The previous item in chain.
     * @private
     * @member {TickerListener}
     */
    this.previous = null;
    /**
     * `true` if this listener has been destroyed already.
     * @member {boolean}
     * @private
     */
    this._destroyed = false;
}

// addListener
Ticker.prototype._addListener = function (listener) {
    // 将当前这个 listener 添加到 listener 的链表结构中
    var current = this._head.next;
    var previous = this._head;

    // Add the first item
    if (!current) {
        listener.connect(previous);
    } else {
        // 按照优先级排序
        while (current) {
            if (listener.priority > current.priority) {
                listener.connect(previous);
                break;
            }
            previous = current;
            current = current.next;
        }

        // Not yet connected
        if (!listener.previous) {
            listener.connect(previous);
        }
    }

    this._startIfPossible();

    return this;
};

Ticker.prototype._startIfPossible = function () {
    if (this.started) {
        this._requestIfNeeded();
    }
    else if (this.autoStart) {
        this.start();
    }
};

Ticker.prototype.start = function () {
    if (!this.started) {
        this.started = true;
        this._requestIfNeeded();
    }
};

Ticker.prototype._requestIfNeeded = function () {
    if (this._requestId === null && this._head.next) {
        // ensure callbacks get correct delta
        this.lastTime = performance.now();
        this._lastFrame = this.lastTime;
        // 将 tick 添加到 requestAnimationFrame
        this._requestId = requestAnimationFrame(this._tick);
    }
};
```

todo 接下来来看看 Ticker.update 做了什么。
```js
```

### 第二个 ticker
todo ？ 这个 ticker 是挂载在 app 下的。
后面还有 initPlugins，应该是 Application 调用的，这一调用又干了什么呢？
Application._plugins 里有三个 plugin：
- ƒ ResizePlugin()：为 Application 提供 resize、resizeTo 等能力。
- ƒ TickerPlugin()：为 Application 提供 ticker、start、stop 等属性。注意：之前看到的 ticker 是 renderer 中的，这里的是 Application 中的。
还有个值得注意的地方：
```js
ticker.add(this.render, this, UPDATE_PRIORITY.LOW);

// this.render
/**
* Render the current stage.
*/
Application.prototype.render = function () {
    // todo 这个 render 干了什么？？
    this.renderer.render(this.stage);
};
```
todo 两个 render 的话有什么联系吗？？为什么需要两个 ticker 呢？

- ƒ AppLoaderPlugin()：提供 loader 的相关能力。

### 第一次 ticker 执行
todo 真的是 renderer 的 ticker 吗？
接下来，renderer.tick 在 requestAnimationFrames 中被触发了。最终执行的代码如下：
```js
this._tick = function (time) {
    _this._requestId = null;
    if (_this.started) {
        // 重点！！来看下这个
        _this.update(time);
        
        // Listener side effects may have modified ticker state.
        if (_this.started && _this._requestId === null && _this._head.next) {
            _this._requestId = requestAnimationFrame(_this._tick);
        }
    }
};

// this.update
// performance.now() 返回的时间戳没有被限制在一毫秒的精确度内，相反，它们以浮点数的形式表示时间，精度最高可达微秒级。
Ticker.prototype.update = function (currentTime = performance.now()) {
    var elapsedMS;

    if (currentTime > this.lastTime) {
        // ... 时间处理

        // head 存放的是默认的，什么都没有，head.next 以及之后的才是通过 add 添加的更新
        var head = this._head;
        // Invoke listeners added to internal emitter
        var listener = head.next;
        while (listener) {
            // 执行所有更新, 这次更新这里执行的函数是 InteractionManager.prototype.tickerUpdate -> InteractionManager.prototype.update
            listener = listener.emit(this.deltaTime);
        }
        // 如果 head.next 为空，则表明无可用 ticker 更新项，因此不执行更新
        if (!head.next) {
            this._cancelIfNeeded();
        }
    }
    else {
        // todo 这三个是干嘛的？
        this.deltaTime = this.deltaMS = this.elapsedMS = 0;
    }
    this.lastTime = currentTime;
};

// todo 感觉是用于处理一些事件的, 比如 mousemove 等, 可以确认一下
InteractionManager.prototype.update = function () {
    if (!this.interactionDOMElement) {
        return;
    }
    // if the user move the mouse this check has already been done using the mouse move!
    if (this._didMove) {
        this._didMove = false;
        return;
    }
    this.cursor = null;
    // Resets the flag as set by a stopPropagation call. This flag is usually reset by a user interaction of any kind,
    // but there was a scenario of a display object moving under a static mouse cursor.
    // In this case, mouseover and mouseevents would not pass the flag test in dispatchEvent function
    for (var k in this.activeInteractionData) {
        // eslint-disable-next-line no-prototype-builtins
        if (this.activeInteractionData.hasOwnProperty(k)) {
            var interactionData = this.activeInteractionData[k];
            if (interactionData.originalEvent && interactionData.pointerType !== 'touch') {
                var interactionEvent = this.configureInteractionEventForDOMEvent(this.eventData, interactionData.originalEvent, interactionData);
                this.processInteractive(interactionEvent, this.lastObjectRendered, this.processPointerOverOut, true);
            }
        }
    }

    this.setCursorMode(this.cursor);
};

// 用于设置鼠标样式
// todo buttonMode 是不是通过这个实现的？感觉不太可能 因为需要经过 hit test
InteractionManager.prototype.setCursorMode = function (mode) {
    mode = mode || 'default';
    // if the mode didn't actually change, bail early
    if (this.currentCursorMode === mode) {
        return;
    }
    this.currentCursorMode = mode;
    var style = this.cursorStyles[mode];
    // only do things if there is a cursor style for it
    if (style) {
        switch (typeof style) {
            case 'string':
                // string styles are handled as cursor CSS
                this.interactionDOMElement.style.cursor = style;
                break;
            case 'function':
                // functions are just called, and passed the cursor mode
                style(mode);
                break;
            case 'object':
                // if it is an object, assume that it is a dictionary of CSS styles,
                // apply it to the interactionDOMElement
                Object.assign(this.interactionDOMElement.style, style);
                break;
        }
    }
    else if (typeof mode === 'string' && !Object.prototype.hasOwnProperty.call(this.cursorStyles, mode)) {
        // if it mode is a string (not a Symbol) and cursorStyles doesn't have any entry
        // for the mode, then assume that the dev wants it to be CSS for the cursor.
        this.interactionDOMElement.style.cursor = mode;
    }
};
```

### 第二次 ticker 执行
最终执行的是这个。
```js
Application.prototype.render = function () {
    this.renderer.render(this.stage);
};

/**
    * Renders the object to its WebGL view
    *
    * @param {PIXI.DisplayObject} displayObject - The object to be rendered.
    * @param {PIXI.RenderTexture} [renderTexture] - The render texture to render to.
    * @param {boolean} [clear=true] - Should the canvas be cleared before the new render.
    * @param {PIXI.Matrix} [transform] - A transform to apply to the render texture before rendering.
    * @param {boolean} [skipUpdateTransform=false] - Should we skip the update transform pass?
    */
Renderer.prototype.render = function (displayObject, renderTexture, clear, transform, skipUpdateTransform) {
    // todo 好复杂 吐了
    // can be handy to know!
    this.renderingToScreen = !renderTexture;
    this.runners.prerender.emit();
    this.emit('prerender');
    // apply a transform at a GPU level
    this.projection.transform = transform;
    // no point rendering if our context has been blown up!
    if (this.context.isLost) {
        return;
    }
    if (!renderTexture) {
        this._lastObjectRendered = displayObject;
    }
    if (!skipUpdateTransform) {
        // update the scene graph
        var cacheParent = displayObject.enableTempParent();
        displayObject.updateTransform();
        displayObject.disableTempParent(cacheParent);
        // displayObject.hitArea = //TODO add a temp hit area
    }
    this.renderTexture.bind(renderTexture);
    this.batch.currentRenderer.start();
    if (clear !== undefined ? clear : this.clearBeforeRender) {
        this.renderTexture.clear();
    }
    displayObject.render(this);
    // apply transform..
    this.batch.currentRenderer.flush();
    if (renderTexture) {
        renderTexture.baseTexture.update();
    }
    this.runners.postrender.emit();
    // reset transform after render
    this.projection.transform = null;
    this.emit('postrender');
};
```
todo Application.tikcer 指向的是哪里？？
