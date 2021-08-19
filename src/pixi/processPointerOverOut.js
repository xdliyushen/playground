/* eslint-disable */
/**
 * Processes the result of the pointer over/out check and dispatches the event if need be
 *
 * @private
 * @param {PIXI.InteractionEvent} interactionEvent - The interaction event wrapping the DOM event
 * @param {PIXI.Container|PIXI.Sprite|PIXI.TilingSprite} displayObject - The display object that was tested
 * @param {boolean} hit - the result of the hit test on the display object
 */
InteractionManager.prototype.processPointerOverOut = function (interactionEvent, displayObject, hit) {
    var data = interactionEvent.data;
    var id = interactionEvent.data.identifier;
    var isMouse = (data.pointerType === 'mouse' || data.pointerType === 'pen');
    var trackingData = displayObject.trackedPointers[id];
    // if we just moused over the display object, then we need to track that state
    if (hit && !trackingData) {
        trackingData = displayObject.trackedPointers[id] = new InteractionTrackingData(id);
    }
    if (trackingData === undefined) { return; }
    if (hit && this.mouseOverRenderer) {
        if (!trackingData.over) {
            trackingData.over = true;
            this.delayDispatchEvent(displayObject, 'pointerover', interactionEvent);
            if (isMouse) {
                this.delayDispatchEvent(displayObject, 'mouseover', interactionEvent);
            }
        }
        // only change the cursor if it has not already been changed (by something deeper in the
        // display tree)
        if (isMouse && this.cursor === null) {
            this.cursor = displayObject.cursor;
        }
    }
    else if (trackingData.over) {
        trackingData.over = false;
        this.dispatchEvent(displayObject, 'pointerout', this.eventData);
        if (isMouse) {
            this.dispatchEvent(displayObject, 'mouseout', interactionEvent);
        }
        // if there is no mouse down information for the pointer, then it is safe to delete
        if (trackingData.none) {
            delete displayObject.trackedPointers[id];
        }
    }
};