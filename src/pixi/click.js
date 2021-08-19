/* eslint-disable */
InteractionManager.prototype.onPointerDown = function (originalEvent) {
    // ...

    // 生成 touch events、mouse event 以及原生 event
    const events = this.normalizeToPointerData(originalEvent);

    // ...

    const eventLen = events.length;

    for (let i = 0; i < eventLen; i++) {
        // ...

        // 进行点击检测并触发事件
        this.processInteractive(interactionEvent, this.lastObjectRendered, this.processPointerDown, true);

        this.emit('pointerdown', interactionEvent);
       
        // ...
        // 触发其他事件
    }
};

InteractionManager.prototype.processInteractive = function (interactionEvent, displayObject, func, hitTest) {
    // 点击检测
    this.search.findHit(interactionEvent, displayObject, func, hitTest);

    // ...
};

TreeSearch.prototype.findHit = function (interactionEvent, displayObject, func, hitTest) {
    this.recursiveFindHit(interactionEvent, displayObject, func, hitTest, false);
};

TreeSearch.prototype.recursiveFindHit = function (interactionEvent, displayObject, func, hitTest, interactive) {
    // ...
    // 判断点击坐标是否在 sprite 的 hitArea 和 mask 内

    // 递归检测子元素
    if (hitTestChildren && displayObject.interactiveChildren && displayObject.children) {
        const children = displayObject.children;
        for (let i = children.length - 1; i >= 0; i--) {
            const child = children[i];

            const childHit = this.recursiveFindHit(interactionEvent, child, func, hitTest, interactiveParent);

            // 如果子元素被点击了, 则父元素肯定也被点击, 因此后续无需继续进行点击检测
            if (childHit) {
                // ...
                if (interactionEvent.target) {
                    hitTest = false;
                }
                hit = true;
            }
        }
    }
        

    if (interactive) {
        // ...
        // 检测点击坐标是否在当前 sprite 内

        if (displayObject.interactive) {
            if (hit && !interactionEvent.target) {
                interactionEvent.target = displayObject;
            }
            // processXXX
            if (func) {
                func(interactionEvent, displayObject, !!hit);
            }
        }
    }
    return hit;
};

InteractionManager.prototype.processPointerDown = function (interactionEvent, displayObject, hit) {
    if (hit) {
        if (!displayObject.trackedPointers[id]) {
            displayObject.trackedPointers[id] = new InteractionTrackingData(id);
        }

        // 触发 pointerdown 事件
        this.dispatchEvent(displayObject, 'pointerdown', interactionEvent);

        if (data.pointerType === 'touch') {
            this.dispatchEvent(displayObject, 'touchstart', interactionEvent);
        } else if (data.pointerType === 'mouse' || data.pointerType === 'pen') {
            const isRightButton = data.button === 2;
            if (isRightButton) {
                displayObject.trackedPointers[id].rightDown = true;
            } else {
                // FLAGS: { NONE: 0, OVER: 1 << 0, LEFT_DOWN: 1 << 1, RIGHT_DOWN: 1 << 2 }
                // 注意这里 左键点击为 true 同时设置 flag 为 LEFT_DOWN
                displayObject.trackedPointers[id].leftDown = true;
            }
            this.dispatchEvent(displayObject, isRightButton ? 'rightdown' : 'mousedown', interactionEvent);
        }
    }
};

InteractionManager.prototype.dispatchEvent = function (displayObject, eventString, eventData) {
    if (!eventData.stopPropagationHint || displayObject === eventData.stopsPropagatingAt) {
        eventData.currentTarget = displayObject;
        eventData.type = eventString;
        // 触发 on 绑定的事件
        displayObject.emit(eventString, eventData);
        // 触发直接通过属性绑定的事件
        if (displayObject[eventString]) {
            displayObject[eventString](eventData);
        }
    }
};

InteractionManager.prototype.onPointerUp = function (event) {
    // ...
    this.onPointerComplete(event, false, this.processPointerUp);
};

InteractionManager.prototype.onPointerComplete = function (originalEvent, cancelled, func) {
    // ...
    for (let i = 0; i < eventLen; i++) {
        // ...

        // 重要代码
        this.processInteractive(interactionEvent, this.lastObjectRendered, func, cancelled || !eventAppend);
        // 
        this.emit(cancelled ? 'pointercancel' : `pointerup${eventAppend}`, interactionEvent);
        if (event.pointerType === 'mouse' || event.pointerType === 'pen') {
            const isRightButton = event.button === 2;
            this.emit(isRightButton ? `rightup${eventAppend}` : `mouseup${eventAppend}`, interactionEvent);
        } else if (event.pointerType === 'touch') {
            this.emit(cancelled ? 'touchcancel' : `touchend${eventAppend}`, interactionEvent);
            this.releaseInteractionDataForPointerId(event.pointerId);
        }
    }
};

InteractionManager.prototype.processPointerUp = function (interactionEvent, displayObject, hit) {
    // ...

    // Mouse
    if (isMouse) {
        const isRightButton = data.button === 2;
        const flags = InteractionTrackingData.FLAGS;
        const test = isRightButton ? flags.RIGHT_DOWN : flags.LEFT_DOWN;
        const isDown = trackingData !== undefined && (trackingData.flags & test);
        if (hit) {
            this.dispatchEvent(displayObject, isRightButton ? 'rightup' : 'mouseup', interactionEvent);
            if (isDown) {
                this.dispatchEvent(displayObject, isRightButton ? 'rightclick' : 'click', interactionEvent);
                isMouseTap = true;
            }
        } else if (isDown) {
            this.dispatchEvent(displayObject, isRightButton ? 'rightupoutside' : 'mouseupoutside', interactionEvent);
        }
        // 更新点击数据
        if (trackingData) {
            if (isRightButton) {
                trackingData.rightDown = false;
            } else {
                trackingData.leftDown = false;
            }
        }
    }
    
    // Pointers、Touches、Mouse
    if (hit) {
        this.dispatchEvent(displayObject, 'pointerup', interactionEvent);
        if (isTouch) { this.dispatchEvent(displayObject, 'touchend', interactionEvent); }
        if (trackingData) {
            if (!isMouse || isMouseTap) {
                this.dispatchEvent(displayObject, 'pointertap', interactionEvent);
            }
            if (isTouch) {
                this.dispatchEvent(displayObject, 'tap', interactionEvent);
                trackingData.over = false;
            }
        }
    } else if (trackingData) {
        this.dispatchEvent(displayObject, 'pointerupoutside', interactionEvent);
        if (isTouch) { this.dispatchEvent(displayObject, 'touchendoutside', interactionEvent); }
    }
    // 清除这次点击数据
    if (trackingData && trackingData.none) {
        delete displayObject.trackedPointers[id];
    }
};
