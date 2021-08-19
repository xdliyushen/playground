/* eslint-disable */
InteractionManager.prototype.processPointerUp = function (interactionEvent, displayObject, hit) {
    const data = interactionEvent.data;
    const id = interactionEvent.data.identifier;
    const trackingData = displayObject.trackedPointers[id];
    const isTouch = data.pointerType === 'touch';
    const isMouse = (data.pointerType === 'mouse' || data.pointerType === 'pen');
    // need to track mouse down status in the mouse block so that we can emit
    // event in a later block
    let isMouseTap = false;
    // Mouse only
    if (isMouse) {
        const isRightButton = data.button === 2;
        // { LEFT_DOWN: 2, NONE: 0, OVER: 1, RIGHT_DOWN: 4 }
        const flags = InteractionTrackingData.FLAGS;
        const test = isRightButton ? flags.RIGHT_DOWN : flags.LEFT_DOWN;
        // todo 这个到底是怎么算出来的？？
        // todo 试一下在外面点 在里面 up
        const isDown = trackingData !== undefined && (trackingData.flags & test);
        if (hit) {
            // dispatchEvent 的解析见 dispatchEvent.js
            // 关键代码！！首先触发 mouseup 事件
            this.dispatchEvent(displayObject, isRightButton ? 'rightup' : 'mouseup', interactionEvent);
            if (isDown) {
                this.dispatchEvent(displayObject, isRightButton ? 'rightclick' : 'click', interactionEvent);
                // because we can confirm that the mousedown happened on this object, flag for later emit of pointertap
                isMouseTap = true;
            }
        } else if (isDown) {
            // 这个元素之前被点了 但是 up 不在这个元素上，因此要触发 mouseupoutside/rightupoutside
            this.dispatchEvent(displayObject, isRightButton ? 'rightupoutside' : 'mouseupoutside', interactionEvent);
        }
        // update the down state of the tracking data
        if (trackingData) {
            if (isRightButton) {
                trackingData.rightDown = false;
            } else {
                trackingData.leftDown = false;
            }
        }
    }
    // Pointers and Touches, and Mouse
    if (hit) {
        this.dispatchEvent(displayObject, 'pointerup', interactionEvent);
        if (isTouch) { this.dispatchEvent(displayObject, 'touchend', interactionEvent); }
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
    } else if (trackingData) {
        this.dispatchEvent(displayObject, 'pointerupoutside', interactionEvent);
        if (isTouch) { this.dispatchEvent(displayObject, 'touchendoutside', interactionEvent); }
    }
    // Only remove the tracking data if there is no over/down state still associated with it
    if (trackingData && trackingData.none) {
        delete displayObject.trackedPointers[id];
    }
};
