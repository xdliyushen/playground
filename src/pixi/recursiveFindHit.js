/* eslint-disable */
// recursiveFindHit 注释版
// eslint-disable-next-line no-undef
TreeSearch.prototype.recursiveFindHit = function (interactionEvent, displayObject, func, hitTest, interactive) {
    if (!displayObject || !displayObject.visible) {
        return false;
    }
    const point = interactionEvent.data.global;
    // 三个优化点：
    // 1. 有选择性的进行点击检测。只有两种情况下才会对元素进行点击检测：
    //     1. 该 sprite 的 interactive 为 ture
    //     2. 该 sprite 的父元素 interactive 为 true 且父元素的子元素中还没有元素被点击
    // 2. 只要有一个 sprite 被点击后，就可以继续渲染，避免进行多余的点击检测
    // 3. 如果 sprite 的子元素被点击了，那么该元素也一定被点击了，就不用进行额外的点击检测了。

    // 当前元素是否可交互
    interactive = displayObject.interactive || interactive;
    let hit = false;
    // 父元素是否可交互，向下传递
    let interactiveParent = interactive;
    // Flag here can set to false if the event is outside the parents hitArea or mask
    let hitTestChildren = true;
    // 针对 hitArea 做的处理：在 sprite、graphics 中均有此属性，hitarea 可定义可点击的区域
    if (displayObject.hitArea) {
        if (hitTest) {
            displayObject.worldTransform.applyInverse(point, this._tempPoint);
            // 检测点击时的 pointer 坐标是否在 hitarea 内
            // 无需递归点击检测，无需继续检测子元素
            if (!displayObject.hitArea.contains(this._tempPoint.x, this._tempPoint.y)) {
                hitTest = false;
                // 不检测子元素
                hitTestChildren = false;
            } else {
                hit = true;
            }
        }
        interactiveParent = false;
    }
    // 针对 mask 做的处理
    else if (displayObject._mask) {
        if (hitTest) {
            // 检测点击时的 pointer 坐标是否在 mask 内
            // 但仍需检测子元素，以确保 mouseout 正常生成
            // https://github.com/pixijs/pixi.js/issues/5135
            if (!(displayObject._mask.containsPoint && displayObject._mask.containsPoint(point))) {
                hitTest = false;
            }
        }
    }

    if (hitTestChildren && displayObject.interactiveChildren && displayObject.children) {
        const children = displayObject.children;
        for (let i = children.length - 1; i >= 0; i--) {
            const child = children[i];
            // 递归
            const childHit = this.recursiveFindHit(interactionEvent, child, func, hitTest, interactiveParent);
            if (childHit) {
                // 检测父元素是否仍存在
                if (!child.parent) {
                    continue;
                }
                // 无需继续检测该元素下的其他元素
                interactiveParent = false;

                if (childHit) {
                    // 点击事件发生了
                    // 仍需遍历其他子元素，但无需执行点击检测了
                    if (interactionEvent.target) {
                        hitTest = false;
                    }
                    hit = true;
                }
            }
        }
    }

    if (interactive) {
        // interactionEvent.target 指向的是被点击的 sprite
        // 如果仍需进行点击检测 && interactionEvent.target 为空（表示未找到被点击的 sprite）
        if (hitTest && !interactionEvent.target) {
            // 不存在 hitarea，表示整个 sprite 都是可点击的
            if (!displayObject.hitArea && displayObject.containsPoint) {
                if (displayObject.containsPoint(point)) {
                    hit = true;
                }
            }
        }
        if (displayObject.interactive) {
            if (hit && !interactionEvent.target) {
                // 只有此处对 target 进行了赋值，可以看到 target = 被点击的、层级最深的元素
                interactionEvent.target = displayObject;
            }
            if (func) {
                // 触发事件处理函数
                func(interactionEvent, displayObject, !!hit);
            }
        }
    }
    return hit;
};
