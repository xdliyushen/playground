__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, 'InteractionData', () => InteractionData);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, 'InteractionEvent', () => InteractionEvent);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, 'InteractionManager', () => InteractionManager);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, 'InteractionTrackingData', () => InteractionTrackingData);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, 'interactiveTarget', () => interactiveTarget);
/* harmony import */ const _pixi_math__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @pixi/math */ './node_modules/@pixi/math/lib/math.es.js');
/* harmony import */ const _pixi_ticker__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @pixi/ticker */ './node_modules/@pixi/ticker/lib/ticker.es.js');
/* harmony import */ const _pixi_display__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @pixi/display */ './node_modules/@pixi/display/lib/display.es.js');
/* harmony import */ const _pixi_utils__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @pixi/utils */ './node_modules/@pixi/utils/lib/utils.es.js');
/*!
 * @pixi/interaction - v5.3.9
 * Compiled Wed, 24 Mar 2021 19:54:16 UTC
 *
 * @pixi/interaction is licensed under the MIT License.
 * http://www.opensource.org/licenses/mit-license
 */


/*! *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */
/* global Reflect, Promise */

var extendStatics = function (d, b) {
    extendStatics = Object.setPrototypeOf
        || ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; })
        || function (d, b) { for (const p in b) { if (b.hasOwnProperty(p)) { d[p] = b[p]; } } };
    return extendStatics(d, b);
};

function __extends(d, b) {
    extendStatics(d, b);
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}


/**
 * Interface for classes that represent a hit area.
 *
 * It is implemented by the following classes:
 * - {@link PIXI.Circle}
 * - {@link PIXI.Ellipse}
 * - {@link PIXI.Polygon}
 * - {@link PIXI.RoundedRectangle}
 *
 * @interface IHitArea
 * @memberof PIXI
 */
/**
 * Checks whether the x and y coordinates given are contained within this area
 *
 * @method
 * @name contains
 * @memberof PIXI.IHitArea#
 * @param {number} x - The X coordinate of the point to test
 * @param {number} y - The Y coordinate of the point to test
 * @return {boolean} Whether the x/y coordinates are within this area
 */
/**
 * Default property values of interactive objects
 * Used by {@link PIXI.InteractionManager} to automatically give all DisplayObjects these properties
 *
 * @private
 * @name interactiveTarget
 * @type {Object}
 * @memberof PIXI
 * @example
 *      function MyObject() {}
 *
 *      Object.assign(
 *          DisplayObject.prototype,
 *          PIXI.interactiveTarget
 *      );
 */
var interactiveTarget = {
    /**
     * Enable interaction events for the DisplayObject. Touch, pointer and mouse
     * events will not be emitted unless `interactive` is set to `true`.
     *
     * @example
     * const sprite = new PIXI.Sprite(texture);
     * sprite.interactive = true;
     * sprite.on('tap', (event) => {
     *    //handle event
     * });
     * @member {boolean}
     * @memberof PIXI.DisplayObject#
     */
    interactive: false,
    /**
     * Determines if the children to the displayObject can be clicked/touched
     * Setting this to false allows PixiJS to bypass a recursive `hitTest` function
     *
     * @member {boolean}
     * @memberof PIXI.Container#
     */
    interactiveChildren: true,
    /**
     * Interaction shape. Children will be hit first, then this shape will be checked.
     * Setting this will cause this shape to be checked in hit tests rather than the displayObject's bounds.
     *
     * @example
     * const sprite = new PIXI.Sprite(texture);
     * sprite.interactive = true;
     * sprite.hitArea = new PIXI.Rectangle(0, 0, 100, 100);
     * @member {PIXI.IHitArea}
     * @memberof PIXI.DisplayObject#
     */
    hitArea: null,
    /**
     * If enabled, the mouse cursor use the pointer behavior when hovered over the displayObject if it is interactive
     * Setting this changes the 'cursor' property to `'pointer'`.
     *
     * @example
     * const sprite = new PIXI.Sprite(texture);
     * sprite.interactive = true;
     * sprite.buttonMode = true;
     * @member {boolean}
     * @memberof PIXI.DisplayObject#
     */
    get buttonMode() {
        return this.cursor === 'pointer';
    },
    set buttonMode(value) {
        if (value) {
            this.cursor = 'pointer';
        } else if (this.cursor === 'pointer') {
            this.cursor = null;
        }
    },
    /**
     * This defines what cursor mode is used when the mouse cursor
     * is hovered over the displayObject.
     *
     * @example
     * const sprite = new PIXI.Sprite(texture);
     * sprite.interactive = true;
     * sprite.cursor = 'wait';
     * @see https://developer.mozilla.org/en/docs/Web/CSS/cursor
     *
     * @member {string}
     * @memberof PIXI.DisplayObject#
     */
    cursor: null,
    /**
     * Internal set of all active pointers, by identifier
     *
     * @member {Map<number, InteractionTrackingData>}
     * @memberof PIXI.DisplayObject#
     * @private
     */
    get trackedPointers() {
        if (this._trackedPointers === undefined) { this._trackedPointers = {}; }
        return this._trackedPointers;
    },
    /**
     * Map of all tracked pointers, by identifier. Use trackedPointers to access.
     *
     * @private
     * @type {Map<number, InteractionTrackingData>}
     */
    _trackedPointers: undefined,
};

// Mix interactiveTarget into DisplayObject.prototype,
// after deprecation has been handled
_pixi_display__WEBPACK_IMPORTED_MODULE_2__.DisplayObject.mixin(interactiveTarget);
const MOUSE_POINTER_ID = 1;
// helpers for hitTest() - only used inside hitTest()
const hitTestEvent = {
    target: null,
    data: {
        global: null,
    },
};

// # sourceMappingURL=interaction.es.js.map
