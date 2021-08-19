/**
 * DisplayObjects with the {@link PIXI.interactiveTarget} mixin use this class to track interactions
 *
 * @class
 * @private
 * @memberof PIXI
 */
const InteractionTrackingData = /** @class */ (function () {
    /**
     * @param {number} pointerId - Unique pointer id of the event
     * @private
     */
    function InteractionTrackingData(pointerId) {
        this._pointerId = pointerId;
        this._flags = InteractionTrackingData.FLAGS.NONE;
    }
    /**
     *
     * @private
     * @param {number} flag - The interaction flag to set
     * @param {boolean} yn - Should the flag be set or unset
     */
    InteractionTrackingData.prototype._doSet = function (flag, yn) {
        if (yn) {
            this._flags = this._flags | flag;
        } else {
            this._flags = this._flags & (~flag);
        }
    };
    Object.defineProperty(InteractionTrackingData.prototype, 'pointerId', {
        /**
         * Unique pointer id of the event
         *
         * @readonly
         * @private
         * @member {number}
         */
        get() {
            return this._pointerId;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(InteractionTrackingData.prototype, 'flags', {
        /**
         * State of the tracking data, expressed as bit flags
         *
         * @private
         * @member {number}
         */
        get() {
            return this._flags;
        },
        set(flags) {
            this._flags = flags;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(InteractionTrackingData.prototype, 'none', {
        /**
         * Is the tracked event inactive (not over or down)?
         *
         * @private
         * @member {number}
         */
        get() {
            return this._flags === InteractionTrackingData.FLAGS.NONE;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(InteractionTrackingData.prototype, 'over', {
        /**
         * Is the tracked event over the DisplayObject?
         *
         * @private
         * @member {boolean}
         */
        get() {
            return (this._flags & InteractionTrackingData.FLAGS.OVER) !== 0;
        },
        set(yn) {
            this._doSet(InteractionTrackingData.FLAGS.OVER, yn);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(InteractionTrackingData.prototype, 'rightDown', {
        /**
         * Did the right mouse button come down in the DisplayObject?
         *
         * @private
         * @member {boolean}
         */
        get() {
            return (this._flags & InteractionTrackingData.FLAGS.RIGHT_DOWN) !== 0;
        },
        set(yn) {
            this._doSet(InteractionTrackingData.FLAGS.RIGHT_DOWN, yn);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(InteractionTrackingData.prototype, 'leftDown', {
        /**
         * Did the left mouse button come down in the DisplayObject?
         *
         * @private
         * @member {boolean}
         */
        get() {
            return (this._flags & InteractionTrackingData.FLAGS.LEFT_DOWN) !== 0;
        },
        set(yn) {
            this._doSet(InteractionTrackingData.FLAGS.LEFT_DOWN, yn);
        },
        enumerable: false,
        configurable: true
    });
    InteractionTrackingData.FLAGS = Object.freeze({
        NONE: 0,
        OVER: 1 << 0,
        LEFT_DOWN: 1 << 1,
        RIGHT_DOWN: 1 << 2,
    });
    return InteractionTrackingData;
}());
