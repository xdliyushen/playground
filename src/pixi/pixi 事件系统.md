# pixi 基本介绍
pixi 是一个 2D 动画框架。在之前活动中有使用过，也取得了一些效果。

todo 贴活动的图

todo 事件绑定 demo

todo statesystem 如何进行状态对比？

todo 如何捕获、冒泡？

基本用法 基本渲染流程图

引出事件 -> 点击检测的原理 -> 事件触发的原理 -> 着重 move 和 click 的触发流程

优化点

pixi 只绑定了这些事件： pointerdown pointerup pointercancel pointermove pointerleave（对应 pointerout） pointerover

# 基本知识
## mouse、touch、pointer 事件的异同？

一句话概括：Pointer Events API 是 html 的事件规范之一，它主要目的是用来将鼠标（mouse）、触摸（touch)和触控笔（pen）三种事件整合为统一的API。

Pointer Event 继承自 Mouse Event，因此具有 Mouse Event 的所有属性。除此之外，它还具有一些其他值得注意的属性：
- pointerId：每个 Pointer Event 的唯一标识符。常用于判断多点触控。
- pointerType：Pointer 类别，值有 mouse、pen 和 touch。
- isPrimary：表示该指针是否是通过该类型的首选设备输入的。

参考资料：https://zhuanlan.zhihu.com/p/27542280
原文：https://mobiforge.com/design-development/html5-pointer-events-api-combining-touch-mouse-and-pen

参考资料：https://developer.mozilla.org/zh-CN/docs/Web/API/Pointer_events

# 两种绑定方法
## on 绑定调用栈分析

以这段代码为例
```js
sprite.on('pointerdown', onClick);
```

- EventEmitter.prototype.on(event, fn, context)
    - 参数解析
        - event：事件名称
        - fn：事件函数
        - context：todo 作用未知，但在 new EE 的时候看到往里面传了

    1. addListener(this, event, fn, context, false)
        - 参数分析（上面写的都是传的值，下面写的是参数名）
            - emitter：在这里 this 指向当前的 sprite，在 new EE 的时候用到了
            - event：事件名
            - fn：事件函数
            - context：todo 上下文，作用未知
            - once：是否只触发一次，这里恒为 false，如果需要只触发一次的话，应该使用 once 而不是 on 来绑定事件。

        1. const listener = new EE(fn, context || emitter, once)
            EE 是 EventEmitter 的缩写，里面共有三个属性：
            - fn：事件函数
            - context：上下文
            - once：是否只执行一次
        2. const evt = event;
            保存事件名，这里实际上做的比较复杂一点点，实际上的代码为：
            const evt = prefix ? prefix + event : event;
            这是为了兼容而做的。todo 什么兼容？？
        3. 下面是一段比较长的 if else 区域，分别来看
            1. 
            ```js
            if (!emitter._events[evt]) {
                // todo 逗号与分好有区别吗？？
                emitter._events[evt] = listener,
                emitter._eventsCount++;
            }
            ```
            这段代码主要处理改 sprite 上还没有绑定同类事件的情况
            
            2. 
            ```js
            else if (!emitter._events[evt].fn) {
                emitter._events[evt].push(listener);
            }
            ```
            这段代码应该是会在第三次及以后绑定同名事件的时候执行。
            pixi 用于保存事件对象（EE）和对应事件处理函数的数据结构有点奇怪，当有多个事件处理函数时，`emitter._events[evt]` 为：
            ```js
            // 第一个为时间事件对象，后面都是事件处理函数
            [EE, fn1, fn2, ...]
            ```

            3. 
            ```js
            else {
                emitter._events[evt] = [emitter._events[evt], listener];
            }
            ```
            第二次绑定同名事件时会执行。
        4. return emitter;
            这里也就是 sprite。


## 直接绑定调用栈分析
下面来看看直接绑定的话调用栈是怎样的。

同样的，以 pointerdown 事件为例：

```js
sprite.pointerdown = onClick;
```

注意到二者的区别：
使用 on 绑定，sprite._event 下会出现个新的 EE 对象。
直接使用这种方式绑定，只会多加个属性，sprite._event 为 null。

没啥好说的，啥也没调用，只是改了个属性值而已。

todo 直接绑定是怎么触发事件的？

# 事件绑到哪里去了？什么时候绑上去的？
事件时创建 application 的时候直接绑上去的，绑定的地方是 canvas（也就是 app.view）。

```js
const app = new PIXI.Application({ 
    backgroundColor: 0x1099bb,
});
```

调用栈分析
**这部分的代码做的工作比较多，因此只分析关键部分的代码，其他的忽略。**
- new PIXI.Application(options)
    - 这段代码创建了 render，其中 render 下有 view 属性，也就是我们的 canvas 标签。下面我们来看看 view 是在哪里创建的。
    ```js
        import { autoDetectRenderer } from '@pixi/core';
        // ...
        this.renderer = autoDetectRenderer(options);
    ```
        - 这段代码还是创建 render

        ```js
            function autoDetectRenderer(options) {
                return Renderer.create(options);
            }
        ```
            - Renderer.create

            ```js
                // 这里是用一个函数实现的，我们暂时不去纠结
                if (isWebGLSupported) {
                    return new Renderer(options);
                }
            ```
                - Render
                Render 这个类继承自 AbstractRenderer

                ```js
                    super(RENDERER_TYPE.WEBGL, options);
                ```
                    - AbstractRenderer 
                    最终我们 view 是在这里创建的。

                    ```js
                    function AbstractRenderer(type, options) {
                        // ...
                        this.view = options.view || document.createElement('canvas');
                        // ...
                    }
                    ```
                    到这里，我们的 view 就创建完成了，下面来看看事件是在什么时候绑定到这个 canvas 上的。
                
                - Render
                还是 Render，在所有的属性初始化完成后，可以发现这样一行代码：

                ```js
                    // todo 这个是哪里来的？？
                    this.initPlugins(Renderer.__plugins);
                ```
                这个方法是从 AbstractRender 上继承而来的。
                    - AbstractRenderer.prototype.initPlugins

                        ```js
                            AbstractRenderer.prototype.initPlugins = function (staticMap) {
                                for (var key in staticMap) {
                                    this.plugins[key] = new (staticMap[key])(this);
                                }
                            };
                        ```
                        staticMap 是一个对象：

                        ```js
                        {
                            accessibility: () => {},
                            batch: () => {},
                            extract: () => {},
                            // 我们着重要看的是这个
                            interaction: () => {},
                            particle: () => {},
                            prepare: () => {},
                            tilingSprite: () => {},
                        }
                        ```
                            - new interaction(this)（伪代码）
                                这东西实际上是一个名叫 InteractionManager 的类，继承自 EventEmitter。

                                ```js
                                function InteractionManager() {
                                    // ... 属性设置等
                                    // 另一个值得注意的东西：用于搜索事件是在哪个 sprite 上触发的
                                    _this.search = new TreeSearch();
                                    // ...

                                    // 绑定事件
                                    this.setTargetElement(this.renderer.view, this.renderer.resolution);
                                    // ...
                                }
                                ```
                                    - InteractionManager.prototype.setTargetElement

                                    ```js
                                    InteractionManager.prototype.setTargetElement = function (element, resolution) {
                                        if (resolution === void 0) { resolution = 1; }
                                        this.removeTickerListener();
                                        this.removeEvents();
                                        this.interactionDOMElement = element;
                                        this.resolution = resolution;
                                        // 注意这个方法
                                        this.addEvents();
                                        // todo tickerlistener 是干嘛的？？
                                        this.addTickerListener();
                                    };
                                    ```
                                        - addEvents()

                                            ```js
                                            InteractionManager.prototype.addEvents = function () {
                                                if (this.eventsAdded || !this.interactionDOMElement) {
                                                    return;
                                                }

                                                var style = this.interactionDOMElement.style;

                                                // 一些给 canvas 交互用的属性配置
                                                if (window.navigator.msPointerEnabled) {
                                                    style.msContentZooming = 'none';
                                                    style.msTouchAction = 'none';
                                                }
                                                else if (this.supportsPointerEvents) {
                                                    style.touchAction = 'none';
                                                }

                                                // 在 canvas 和 window 上绑定事件
                                                // todo 为啥有的事件要绑在 window 上绑定？有的要绑定在 canvas 上？
                                                /**
                                                * These events are added first, so that if pointer events are normalized, they are fired
                                                * in the same order as non-normalized events. ie. pointer event 1st, mouse / touch 2nd
                                                */
                                                if (this.supportsPointerEvents) {
                                                    window.document.addEventListener('pointermove', this.onPointerMove, true);
                                                    this.interactionDOMElement.addEventListener('pointerdown', this.onPointerDown, true);
                                                    // pointerout is fired in addition to pointerup (for touch events) and pointercancel
                                                    // we already handle those, so for the purposes of what we do in onPointerOut, we only
                                                    // care about the pointerleave event
                                                    this.interactionDOMElement.addEventListener('pointerleave', this.onPointerOut, true);
                                                    this.interactionDOMElement.addEventListener('pointerover', this.onPointerOver, true);
                                                    window.addEventListener('pointercancel', this.onPointerCancel, true);
                                                    window.addEventListener('pointerup', this.onPointerUp, true);
                                                }
                                                else {
                                                    window.document.addEventListener('mousemove', this.onPointerMove, true);
                                                    this.interactionDOMElement.addEventListener('mousedown', this.onPointerDown, true);
                                                    this.interactionDOMElement.addEventListener('mouseout', this.onPointerOut, true);
                                                    this.interactionDOMElement.addEventListener('mouseover', this.onPointerOver, true);
                                                    window.addEventListener('mouseup', this.onPointerUp, true);
                                                }
                                                // always look directly for touch events so that we can provide original data
                                                // In a future version we should change this to being just a fallback and rely solely on
                                                // PointerEvents whenever available
                                                if (this.supportsTouchEvents) {
                                                    this.interactionDOMElement.addEventListener('touchstart', this.onPointerDown, true);
                                                    this.interactionDOMElement.addEventListener('touchcancel', this.onPointerCancel, true);
                                                    this.interactionDOMElement.addEventListener('touchend', this.onPointerUp, true);
                                                    this.interactionDOMElement.addEventListener('touchmove', this.onPointerMove, true);
                                                }

                                                this.eventsAdded = true;
                                            };
                                            ```



至此我们看到了事件是如何绑定在 canvas 上的。注意到 canvas 上只绑定了几个事件，但 pixi 提供的事件绑定函数却远远大于这个数字。这就涉及到事件合成机制。
下面接着来看事件是如何触发以及如何合成的的。

# 事件触发
首先来看看 canvas 上绑定的事件是哪里来的：
```js
InteractionManager.prototype.onPointerDown = function () { 
    // ...
}
```

我们之前绑定的是 pointerdown 事件，因此我们先来看这个触发这个事件会发生什么：

调用栈分析：
- InteractionManager.prototype.onPointerDown
    - 
    ```js
        var events = this.normalizeToPointerData(originalEvent);
    ```
        - InteractionManager.prototype.normalizeToPointerData
            这个方法的用途用注释的话说来就是：确保原生的 event 中包含所有一个普通 pointer event 所需要的数据。

            > Ensures that the original event object contains all data that a regular pointer event would have

            主要处理当传入的 event 为 mouse event 或 touch event 时的情况，将两种 event 转化为 pointer event。
        - 
    - （这段代码不是十分重要）这段代码依然在处理 mouse event 或 touch event，因为只有这两种需要经过 normalized 的 event，其 isNormalized 属性才为 true。
    ```js
    if (this.autoPreventDefault && events[0].isNormalized) {
        var cancelable = originalEvent.cancelable || !('cancelable' in originalEvent);
        if (cancelable) {
            originalEvent.preventDefault();
        }
    }
    ```
    - all magic happens here.
    ```js
    // [PointerEvent]
    var eventLen = events.length;

    for (var i = 0; i < eventLen; i++) {
        var event = events[i];

        var interactionData = this.getInteractionDataForPointerId(event);

        var interactionEvent = this.configureInteractionEventForDOMEvent(this.eventData, event, interactionData);

        interactionEvent.data.originalEvent = originalEvent;

        this.processInteractive(interactionEvent, this.lastObjectRendered, this.processPointerDown, true);

        this.emit('pointerdown', interactionEvent);

        // 执行额外的 touch 事件处理函数
        if (event.pointerType === 'touch') {
            this.emit('touchstart', interactionEvent);
        }
        // emit a mouse event for "pen" pointers, the way a browser would emit a fallback event

        // 判断是不是右键点击事件
        else if (event.pointerType === 'mouse' || event.pointerType === 'pen') {
            var isRightButton = event.button === 2;
            this.emit(isRightButton ? 'rightdown' : 'mousedown', this.eventData);
        }
    }
    ```
        -  var interactionData = this.getInteractionDataForPointerId(event);
            我们只关注一下这个方法里会执行到的代码就好了。
            - InteractionManager.prototype.getInteractionDataForPointerId(event)

            ```js
                var pointerId = event.pointerId;
                var interactionData;

                if (pointerId === MOUSE_POINTER_ID || event.pointerType === 'mouse') {
                    // 在初始化的时候建立的 可以回过头去看看
                    // todo 分析下 this.mouse 创建时的代码
                    interactionData = this.mouse;
                }

                // ... 一些 if else 用于处理 mouse event 和 touch event

                // 将一些属性复制到 interactionData 也就是 this.mouse 上，如：button、buttons、width、height 等
                interactionData.copyEvent(event);

                return interactionData;
            ```
        - var interactionEvent = this.configureInteractionEventForDOMEvent(this.eventData, event, interactionData);
            this.eventData 也是初始化的时候建立的
            todo 分析下 this.eventData 创建时的代码
            - InteractionManager.prototype.configureInteractionEventForDOMEvent(interactionEvent, pointerEvent, interactionData)
                > Configure an InteractionEvent to wrap a DOM PointerEvent and InteractionData
                配置一个包含了 DOM PointerEvent 和 InteractionData 的 InteractionEvent。

                ```js
                 InteractionManager.prototype.configureInteractionEventForDOMEvent = function (interactionEvent, pointerEvent, interactionData) {
                    interactionEvent.data = interactionData;

                    this.mapPositionToPoint(interactionData.global, pointerEvent.clientX, pointerEvent.clientY);

                    // ...

                    interactionData.originalEvent = pointerEvent;
                    interactionEvent.reset();

                    return interactionEvent;
                };
                ```
                todo 这个 global 是哪里来的？？
                - this.mapPositionToPoint(interactionData.global, pointerEvent.clientX, pointerEvent.clientY);
                    - 将点击事件中的 x y 换算为 pixi canvas 坐标中的 x y，并将其保存在 point 中

                    ```js
                    InteractionManager.prototype.mapPositionToPoint = function (point, x, y) {
                        var rect;

                        // 注意：this.interactionDOMElement 在 setTargetElement 中已被设置为 canvas 元素
                        // 获取 canvas 元素的尺寸
                        rect = this.interactionDOMElement.getBoundingClientRect();

                        var resolutionMultiplier = 1.0 / this.resolution;

                        point.x = ((x - rect.left) * (this.interactionDOMElement.width / rect.width)) * resolutionMultiplier;
                        point.y = ((y - rect.top) * (this.interactionDOMElement.height / rect.height)) * resolutionMultiplier;
                    };
                    ```
                - interactionData.originalEvent = pointerEvent;
                - interactionEvent.reset();
                    todo 应该不是这个原因 所以为啥要 reset？
                    interactionEvent 是所有事件共用的，所以每次使用完后要进行 reset
        - interactionEvent.data.originalEvent = originalEvent;
        - this.processInteractive(interactionEvent, this.lastObjectRendered, this.processPointerDown, true);
            检测点击的到底是哪个 sprite，并执行对应的事件函数，并更新
            todo 看看 render.lastObjectRendered 的赋值规则

            ```js
            InteractionManager.prototype.processInteractive = function (interactionEvent, displayObject, func, hitTest) {
                // 找出点击事件会落到哪个 sprite 上, 并执行事件处理函数
                var hit = this.search.findHit(interactionEvent, displayObject, func, hitTest);

                var delayedEvents = this.delayedEvents;
                if (!delayedEvents.length) {
                    return hit;
                }

                // ...
            };
            ```
                - this.search.findHit(interactionEvent, displayObject, func, hitTest);
                    最终调用的是 TreeSearch.prototype.recursiveFindHit
                        在找到对应 sprite 后会直接执行对应的事件处理函数
                        todo 深入一点调用栈
        - this.emit('pointerdown', interactionEvent);
            执行绑定在最外层的 pointerdown 事件处理函数，todo 为了模拟冒泡？ todo 为什么不在 processInteractive 里直接做了？
        - 后面的代码是为了执行额外的事件处理函数，如 touch、rightmouse 等。

                

> 为什么每一秒 getInteractionDataForPointerId 都在被触发？？
破案了，人家不是每一秒都在触发，只是 pointermove 的时候被触发了。

todo click 合成

# 更新流程
上面的代码告诉我们事件是如何触发的，但需要注意的是**事件触发并不等于更新**！我们的视图还并没有发生变化，下面我们来看下更新流程。

首先我们先倒回到 app 被创建的时候，有一个部分之前被省略了，那就是 setTargetElement 中的 addTickerListener：
```js
InteractionManager.prototype.setTargetElement = function (element, resolution) {
    // ..
    this.addTickerListener();
};
```
todo 深入调用栈

前面添加的 ticker 会在 requestAnimationFrames 中执行。

tick 源码
```js
// Ticker 类
this._tick = function (time) {
    _this._requestId = null;
    if (_this.started) {
        // 更新方法
        _this.update(time);

        // 实现链式调用 tick.next
        if (_this.started && _this._requestId === null && _this._head.next) {
            _this._requestId = requestAnimationFrame(_this._tick);
        }
    }
};
```

下面来看看 Ticker.update 做了什么：
```js
 /**
    * Triggers an update. An update entails setting the
    * current {@link PIXI.Ticker#elapsedMS},
    * the current {@link PIXI.Ticker#deltaTime},
    * invoking all listeners with current deltaTime,
    * and then finally setting {@link PIXI.Ticker#lastTime}
    * with the value of currentTime that was provided.
    * This method will be called automatically by animation
    * frame callbacks if the ticker instance has been started
    * and listeners are added.
    *
    * @param {number} [currentTime=performance.now()] - the current time of execution
*/
Ticker.prototype.update = function (currentTime) {
    if (currentTime === void 0) { currentTime = performance.now(); }
    var elapsedMS;
    // If the difference in time is zero or negative, we ignore most of the work done here.
    // If there is no valid difference, then should be no reason to let anyone know about it.
    // A zero delta, is exactly that, nothing should update.
    //
    // The difference in time can be negative, and no this does not mean time traveling.
    // This can be the result of a race condition between when an animation frame is requested
    // on the current JavaScript engine event loop, and when the ticker's start method is invoked
    // (which invokes the internal _requestIfNeeded method). If a frame is requested before
    // _requestIfNeeded is invoked, then the callback for the animation frame the ticker requests,
    // can receive a time argument that can be less than the lastTime value that was set within
    // _requestIfNeeded. This difference is in microseconds, but this is enough to cause problems.
    //
    // This check covers this browser engine timing issue, as well as if consumers pass an invalid
    // currentTime value. This may happen if consumers opt-out of the autoStart, and update themselves.
    if (currentTime > this.lastTime) {
        // Save uncapped elapsedMS for measurement
        elapsedMS = this.elapsedMS = currentTime - this.lastTime;
        // cap the milliseconds elapsed used for deltaTime
        if (elapsedMS > this._maxElapsedMS) {
            elapsedMS = this._maxElapsedMS;
        }
        elapsedMS *= this.speed;
        // If not enough time has passed, exit the function.
        // Get ready for next frame by setting _lastFrame, but based on _minElapsedMS
        // adjustment to ensure a relatively stable interval.
        if (this._minElapsedMS) {
            var delta = currentTime - this._lastFrame | 0;
            if (delta < this._minElapsedMS) {
                return;
            }
            this._lastFrame = currentTime - (delta % this._minElapsedMS);
        }
        this.deltaMS = elapsedMS;
        this.deltaTime = this.deltaMS * _pixi_settings__WEBPACK_IMPORTED_MODULE_0__["settings"].TARGET_FPMS;
        // Cache a local reference, in-case ticker is destroyed
        // during the emit, we can still check for head.next
        var head = this._head;
        // Invoke listeners added to internal emitter
        var listener = head.next;
        while (listener) {
            listener = listener.emit(this.deltaTime);
        }
        if (!head.next) {
            this._cancelIfNeeded();
        }
    }
    else {
        this.deltaTime = this.deltaMS = this.elapsedMS = 0;
    }
    this.lastTime = currentTime;
};
```

# click 的触发流程
- window 上的 pointerup 捕捉到事件：InteractionManage.onPointerUp
  this.onPointerComplete(event, false, this.processPointerUp);
  - InteractionManage.prototype.onPointerComplete(originalEvent, cancelled, func)
        在这里比较重要的代码：
        ```js
            // perform hit testing for events targeting our canvas or cancel events
            // 触发子元素上的事件
            this.processInteractive(interactionEvent, this.lastObjectRendered, func, cancelled || !eventAppend);

            // 触发此元素上的事件
            this.emit(cancelled ? 'pointercancel' : "pointerup" + eventAppend, interactionEvent);
            if (event.pointerType === 'mouse' || event.pointerType === 'pen') {
                var isRightButton = event.button === 2;
                this.emit(isRightButton ? "rightup" + eventAppend : "mouseup" + eventAppend, interactionEvent);
            }
            else if (event.pointerType === 'touch') {
                this.emit(cancelled ? 'touchcancel' : "touchend" + eventAppend, interactionEvent);
                this.releaseInteractionDataForPointerId(event.pointerId);
            }
        ```
        this.lastObjectRendered 指向 canvas。
        func 最终指向 this.processPointerUp

        - InteractionManager.prototype.processInteractive(interactionEvent, displayObject, func, hitTest)
        在这里会执行 hitTest，代码如下：
        ```js
            var hit = this.search.findHit(interactionEvent, displayObject, func, hitTest);
        ```
            - findHit

            ```js
            this.recursiveFindHit(interactionEvent, displayObject, func, hitTest, false);
            ```
                - TreeSearch.prototype.recursiveFindHit(interactionEvent, displayObject, func, hitTest, interactive)
                    代码分析见 ./recursiveFindHit.js

                    关于点击检测，pixi 做了三个优化：
                    1. 有选择性的进行点击检测。只有两种情况下才会对元素进行点击检测：
                       1. 该 sprite 的 interactive 为 ture
                       2. 该 sprite 的父元素 interactive 为 true 且父元素的子元素中还没有元素被点击
                    2. 只要有一个 sprite 被点击后，就可以继续渲染，避免进行多余的点击检测
                    3. 如果 sprite 的子元素被点击了，那么该元素也一定被点击了，就不用进行额外的点击检测了。

                    优化建议：如果一个元素不是 interactive 的，且其子元素也都不是 interactive 的，那么可以将该元素的 interactiveChildren 设为 false，这会让 pixi 忽略检测该元素及子元素，将提升 pixi 点击检测的效率。

                    todo pixi 是如何模拟捕获和冒泡的？？

                    ```js
                    // 处理事件的代码
                    // 这里的 func 为 this.processPointerUp，displayObject 为被点击的 sprite
                    func(interactionEvent, displayObject, !!hit);
                    ```

                        - InteractionManager.prototype.processPointerUp = function (interactionEvent, displayObject, hit) 
                        详细解析见 ./processPointerUp.js

A click event fires after the pointerdown and pointerup events, in that order. If the mouse is moved over another DisplayObject after the pointerdown event, the click event is fired on the most specific common ancestor of the two target DisplayObjects.

# pointerup
这个触发链路就和 click 完全一样了。甚至可以说 click 就是通过 pointerup 才触发的。

```js
/**
 * Is called when the pointer button is released on the renderer element
 *
 * @private
 * @param {PointerEvent} event - The DOM event of a pointer button being released
 */
InteractionManager.prototype.onPointerUp = function (event) {
    // if we support touch events, then only use those for touch events, not pointer events
    if (this.supportsTouchEvents && event.pointerType === 'touch')
        { return; }
    // 注意这里是 onPointerComplete
    this.onPointerComplete(event, false, this.processPointerUp);
};

/**
 * Processes the result of the pointer up check and dispatches the event if need be
 *
 * @private
 * @param {PIXI.InteractionEvent} interactionEvent - The interaction event wrapping the DOM event
 * @param {PIXI.Container|PIXI.Sprite|PIXI.TilingSprite} displayObject - The display object that was tested
 * @param {boolean} hit - the result of the hit test on the display object
 */
InteractionManager.prototype.processPointerUp = function (interactionEvent, displayObject, hit) {
    var data = interactionEvent.data;
    var id = interactionEvent.data.identifier;
    var trackingData = displayObject.trackedPointers[id];
    var isTouch = data.pointerType === 'touch';
    var isMouse = (data.pointerType === 'mouse' || data.pointerType === 'pen');
    // need to track mouse down status in the mouse block so that we can emit
    // event in a later block
    var isMouseTap = false;
    // Mouse only
    if (isMouse) {
        var isRightButton = data.button === 2;
        var flags = InteractionTrackingData.FLAGS;
        var test = isRightButton ? flags.RIGHT_DOWN : flags.LEFT_DOWN;
        var isDown = trackingData !== undefined && (trackingData.flags & test);
        if (hit) {
            this.dispatchEvent(displayObject, isRightButton ? 'rightup' : 'mouseup', interactionEvent);
            if (isDown) {
                this.dispatchEvent(displayObject, isRightButton ? 'rightclick' : 'click', interactionEvent);
                // because we can confirm that the mousedown happened on this object, flag for later emit of pointertap
                isMouseTap = true;
            }
        }
        else if (isDown) {
            this.dispatchEvent(displayObject, isRightButton ? 'rightupoutside' : 'mouseupoutside', interactionEvent);
        }
        // update the down state of the tracking data
        if (trackingData) {
            if (isRightButton) {
                trackingData.rightDown = false;
            }
            else {
                trackingData.leftDown = false;
            }
        }
    }
    // Pointers and Touches, and Mouse
    if (hit) {
        this.dispatchEvent(displayObject, 'pointerup', interactionEvent);
        if (isTouch)
            { this.dispatchEvent(displayObject, 'touchend', interactionEvent); }
        if (trackingData) {
            // emit pointertap if not a mouse, or if the mouse block decided it was a tap
            if (!isMouse || isMouseTap) {
                this.dispatchEvent(displayObject, 'pointertap', interactionEvent);
            }
            if (isTouch) {
                this.dispatchEvent(displayObject, 'tap', interactionEvent);
                // touches are no longer over (if they ever were) when we get the touchend
                // so we should ensure that we don't keep pretending that they are
                trackingData.over = false;
            }
        }
    }
    else if (trackingData) {
        this.dispatchEvent(displayObject, 'pointerupoutside', interactionEvent);
        if (isTouch)
            { this.dispatchEvent(displayObject, 'touchendoutside', interactionEvent); }
    }
    // Only remove the tracking data if there is no over/down state still associated with it
    if (trackingData && trackingData.none) {
        delete displayObject.trackedPointers[id];
    }
}
```

# pointerdown
值得说的就这俩函数，中间都是一样的。
```js
/**
 * Is called when the pointer button is pressed down on the renderer element
 *
 * @private
 * @param {PointerEvent} originalEvent - The DOM event of a pointer button being pressed down
 */
InteractionManager.prototype.onPointerDown = function (originalEvent) {
    // if we support touch events, then only use those for touch events, not pointer events
    if (this.supportsTouchEvents && originalEvent.pointerType === 'touch')
        { return; }
    var events = this.normalizeToPointerData(originalEvent);
    /**
     * No need to prevent default on natural pointer events, as there are no side effects
     * Normalized events, however, may have the double mousedown/touchstart issue on the native android browser,
     * so still need to be prevented.
     */
    // Guaranteed that there will be at least one event in events, and all events must have the same pointer type
    if (this.autoPreventDefault && events[0].isNormalized) {
        var cancelable = originalEvent.cancelable || !('cancelable' in originalEvent);
        if (cancelable) {
            originalEvent.preventDefault();
        }
    }
    var eventLen = events.length;
    for (var i = 0; i < eventLen; i++) {
        var event = events[i];
        var interactionData = this.getInteractionDataForPointerId(event);
        var interactionEvent = this.configureInteractionEventForDOMEvent(this.eventData, event, interactionData);
        interactionEvent.data.originalEvent = originalEvent;

        // 最关键的区别在这里 上面的基本都一样
        this.processInteractive(interactionEvent, this.lastObjectRendered, this.processPointerDown, true);
        this.emit('pointerdown', interactionEvent);
        if (event.pointerType === 'touch') {
            this.emit('touchstart', interactionEvent);
        }
        // emit a mouse event for "pen" pointers, the way a browser would emit a fallback event
        else if (event.pointerType === 'mouse' || event.pointerType === 'pen') {
            var isRightButton = event.button === 2;
            this.emit(isRightButton ? 'rightdown' : 'mousedown', this.eventData);
        }
    }
};

/**
 * Processes the result of the pointer down check and dispatches the event if need be
 *
 * @private
 * @param {PIXI.InteractionEvent} interactionEvent - The interaction event wrapping the DOM event
 * @param {PIXI.Container|PIXI.Sprite|PIXI.TilingSprite} displayObject - The display object that was tested
 * @param {boolean} hit - the result of the hit test on the display object
 */
InteractionManager.prototype.processPointerDown = function (interactionEvent, displayObject, hit) {
    var data = interactionEvent.data;
    var id = interactionEvent.data.identifier;
    if (hit) {
        if (!displayObject.trackedPointers[id]) {
            displayObject.trackedPointers[id] = new InteractionTrackingData(id);
        }
        this.dispatchEvent(displayObject, 'pointerdown', interactionEvent);
        if (data.pointerType === 'touch') {
            this.dispatchEvent(displayObject, 'touchstart', interactionEvent);
        }
        else if (data.pointerType === 'mouse' || data.pointerType === 'pen') {
            var isRightButton = data.button === 2;
            if (isRightButton) {
                displayObject.trackedPointers[id].rightDown = true;
            }
            else {
                displayObject.trackedPointers[id].leftDown = true;
            }
            this.dispatchEvent(displayObject, isRightButton ? 'rightdown' : 'mousedown', interactionEvent);
        }
    }
};


```

# pointermove
与预想的不同的是，默认情况下，pointermove 会在鼠标在窗口内任意位置移动时触发，而不只是仅仅在绑定的 sprite 上触发。

可通过如下属性修改：
```js
// 只有在对应元素上移动时才触发 move 事件
app.renderer.plugins.interaction.moveWhenInside = true;
```

```js
/**
 * Is called when the pointer moves across the renderer element
 *
 * @private
 * @param {PointerEvent} originalEvent - The DOM event of a pointer moving
 */
InteractionManager.prototype.onPointerMove = function (originalEvent) {
    // if we support touch events, then only use those for touch events, not pointer events
    if (this.supportsTouchEvents && originalEvent.pointerType === 'touch')
        { return; }
    var events = this.normalizeToPointerData(originalEvent);
    if (events[0].pointerType === 'mouse' || events[0].pointerType === 'pen') {
        this._didMove = true;
        this.cursor = null;
    }
    var eventLen = events.length;
    for (var i = 0; i < eventLen; i++) {
        var event = events[i];
        var interactionData = this.getInteractionDataForPointerId(event);
        var interactionEvent = this.configureInteractionEventForDOMEvent(this.eventData, event, interactionData);
        interactionEvent.data.originalEvent = originalEvent;
        // 关键代码
        this.processInteractive(interactionEvent, this.lastObjectRendered, this.processPointerMove, true);
        this.emit('pointermove', interactionEvent);
        if (event.pointerType === 'touch')
            { this.emit('touchmove', interactionEvent); }
        if (event.pointerType === 'mouse' || event.pointerType === 'pen')
            { this.emit('mousemove', interactionEvent); }
    }
    if (events[0].pointerType === 'mouse') {
        this.setCursorMode(this.cursor);
        // TODO BUG for parents interactive object (border order issue)
    }
};

/**
 * This function is provides a neat way of crawling through the scene graph and running a
 * specified function on all interactive objects it finds. It will also take care of hit
 * testing the interactive objects and passes the hit across in the function.
 *
 * @protected
 * @param {PIXI.InteractionEvent} interactionEvent - event containing the point that
 *  is tested for collision
 * @param {PIXI.Container|PIXI.Sprite|PIXI.TilingSprite} displayObject - the displayObject
 *  that will be hit test (recursively crawls its children)
 * @param {Function} [func] - the function that will be called on each interactive object. The
 *  interactionEvent, displayObject and hit will be passed to the function
 * @param {boolean} [hitTest] - indicates whether we want to calculate hits
 *  or just iterate through all interactive objects
 */
InteractionManager.prototype.processInteractive = function (interactionEvent, displayObject, func, hitTest) {
    var hit = this.search.findHit(interactionEvent, displayObject, func, hitTest);

    // 注意这里！！这里不为空 内有两个 event：mouseover 和 pointerover
    var delayedEvents = this.delayedEvents;
    if (!delayedEvents.length) {
        return hit;
    }
    // Reset the propagation hint, because we start deeper in the tree again.
    interactionEvent.stopPropagationHint = false;
    var delayedLen = delayedEvents.length;
    this.delayedEvents = [];
    for (var i = 0; i < delayedLen; i++) {
        var _a = delayedEvents[i], displayObject_1 = _a.displayObject, eventString = _a.eventString, eventData = _a.eventData;
        // When we reach the object we wanted to stop propagating at,
        // set the propagation hint.
        if (eventData.stopsPropagatingAt === displayObject_1) {
            eventData.stopPropagationHint = true;
        }
        this.dispatchEvent(displayObject_1, eventString, eventData);
    }
    return hit;
};

/**
 * Processes the result of the pointer move check and dispatches the event if need be
 *
 * @private
 * @param {PIXI.InteractionEvent} interactionEvent - The interaction event wrapping the DOM event
 * @param {PIXI.Container|PIXI.Sprite|PIXI.TilingSprite} displayObject - The display object that was tested
 * @param {boolean} hit - the result of the hit test on the display object
 */
InteractionManager.prototype.processPointerMove = function (interactionEvent, displayObject, hit) {
    var data = interactionEvent.data;
    var isTouch = data.pointerType === 'touch';
    var isMouse = (data.pointerType === 'mouse' || data.pointerType === 'pen');
    if (isMouse) {
        // 注意这里！！详解见 processPointerOverOut.js
        this.processPointerOverOut(interactionEvent, displayObject, hit);
    }
    if (!this.moveWhenInside || hit) {
        this.dispatchEvent(displayObject, 'pointermove', interactionEvent);
        if (isTouch)
            { this.dispatchEvent(displayObject, 'touchmove', interactionEvent); }
        if (isMouse)
            { this.dispatchEvent(displayObject, 'mousemove', interactionEvent); }
    }
};
```

# pointercancel 
onPointerComplete

```js
/**
 * Processes the result of the pointer cancel check and dispatches the event if need be
 *
 * @private
 * @param {PIXI.InteractionEvent} interactionEvent - The interaction event wrapping the DOM event
 * @param {PIXI.Container|PIXI.Sprite|PIXI.TilingSprite} displayObject - The display object that was tested
 */
InteractionManager.prototype.processPointerCancel = function (interactionEvent, displayObject) {
    var data = interactionEvent.data;
    var id = interactionEvent.data.identifier;
    if (displayObject.trackedPointers[id] !== undefined) {
        // 注意这里 到这里为止一次点击事件就处理完毕了 因此要删除对应的 pointer 数据
        delete displayObject.trackedPointers[id];
        this.dispatchEvent(displayObject, 'pointercancel', interactionEvent);
        if (data.pointerType === 'touch') {
            this.dispatchEvent(displayObject, 'touchcancel', interactionEvent);
        }
    }
};
```

# pointerover
这个是源码。但并不是触发的真正流程。
```js
/**
 * Is called when the pointer is moved into the renderer element
 *
 * @private
 * @param {PointerEvent} originalEvent - The DOM event of a pointer button being moved into the renderer view
 */
InteractionManager.prototype.onPointerOver = function (originalEvent) {
    const events = this.normalizeToPointerData(originalEvent);
    // Only mouse and pointer can call onPointerOver, so events will always be length 1
    const event = events[0];
    const interactionData = this.getInteractionDataForPointerId(event);
    const interactionEvent = this.configureInteractionEventForDOMEvent(this.eventData, event, interactionData);
    interactionEvent.data.originalEvent = event;
    if (event.pointerType === 'mouse') {
        this.mouseOverRenderer = true;
    }
    this.emit('pointerover', interactionEvent);
    if (event.pointerType === 'mouse' || event.pointerType === 'pen') {
        this.emit('mouseover', interactionEvent);
    }
};
``` 
真正的流程为：
onPointerOver 触发 -> mouseOverRenderer = true
this.mouseOverRenderer = true;

ticker -> update -> processInteractive（执行点击检测）-> 如果为 true processPointerOverOut（如果 hit && mouseOverRenderer = true，则将 pointerover 和 mouseover 加入到 delayEvents 中）

onPointerMove 触发 -> this.processInteractive(interactionEvent, this.lastObjectRendered, this.processPointerMove, true); -> 
# pointerout
todo 如何触发？

# wheel
todo 如何触发

# 多点触控怎么办？？
displayObject.trackedPointers 在多点触控时应该有多个，依次触发事件就好

todo capture 事件和原事件有何区别？

# update 代码解析


底层默认使用 webgl api 来渲染，也可使用 canvas api 来渲染。Application forceCanvas 属性。
每次默认都会清空画布 renderer.clearBeforeRender todo 如果不清除的话会如何？
Webgl 基础概念：
	1. shader 着色器：着色器分为二类，顶点着色器（vertex shader）和片段着色器（fragment shader），前者控制位置和尺寸，后者控制颜色。
    2. 属性（Attributes）和 buffer：buffer 用于储存数据，这些数据会被发送到 gpu，attributes 用于指明怎么从缓冲中获取所需数据并将它提供给顶点着色器
    3. Uniforms 全局变量：全局变量在着色程序运行前赋值，在运行过程中全局有效。
    4. 纹理（Textures）：纹理是一个数据序列，可以在着色程序运行中随意读取其中的数据。
    5. 可变量（Varyings）：可变量是一种顶点着色器给片断着色器传值的方式，依照渲染的图元是点， 线还是三角形，顶点着色器中设置的可变量会在片断着色器运行中获取不同的插值。

渲染时有 maxtexture 的限制，一次最多 16 个 todo 如果超过 16 个会如何？

todo gl api：activeTexture bindTexture drawElements

batch 是如何工作的？？

texture 会重复创建吗？

statesystem.checks 根据设置，检测某些属性有没有变化，如果变化了，则要更改 webgl 的设置

