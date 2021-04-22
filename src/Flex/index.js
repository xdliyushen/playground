import React from 'react';
import './index.less';

/*
    flex 规则
    A flex item is fully inflexible if both its flex-grow and flex-shrink values are zero, and flexible otherwise.
    flex-grow：默认为1，按比例分配剩余空间。如果所有子元素的 flex-grow 属性加起来不到 1，则剩余空间填不满，但此时每个子元素分配到的额外空间还是按比例来的。
    flex-grow 表示当前这个元素需要请求剩余空间的百分比数（0.1表示10%，ect），如果所有的 flex-grow 加起来小于 1，表示他们需要的额外空间的总量小于 100%。
    flex-shrink：默认为1。
*/
// flex-shrink 的计算公式
// 各个项目缩小的比例：每个项目的宽度 * 设定的 flex-shrink
const Flex = () => (
    // todo 问题1：为什么设置了 flex-shrink，但是最终两个元素还是超出了 container 的宽度？
    // todo 问题2：当 left 和 right 只有其中一个具有 text 时，为什么设置 width 100% 两个元素宽度还是不一样的？
    <div className="container">
        {/* flex grow：剩余空间的分配是根据 flex-grow 的比例来的 */}
        <div className="flex-grow">
            {/* 分到 37.5px */}
            {/* 设定：50px 实际：87.5px */}
            <div className="item-1" />
            {/* 分到 37.5px */}
            {/* 设定：50px 实际：87.5px */}
            <div className="item-2" />
            {/* 分到 75px */}
            {/* 设定：50px 实际：125px */}
            <div className="item-3" />
        </div>

        {/* flex shrink：需要缩小的空间分配是根据 flex-shrink 的比例来的 */}
        <div className="flex-shrink">
            {/* 缩小 37.5px */}
            <div className="item-1" />
            {/* 缩小 37.5px */}
            <div className="item-2" />
            {/* 缩小 75px */}
            <div className="item-3" />
        </div>

        {/* 以上都是等宽，如果宽度不定的时候，flex-grow 与 flex-shrink 的行为是什么？ */}
        {/* 子元素不等宽的 flex-grow：每个子元素分得的剩余空间的比例还是按照 flex-grow 的比例来的 */}
        <div className="flex-grow-2">
            <div className="item-1" />
            <div className="item-2" />
            <div className="item-3" />
        </div>

        {/* flex-shrink：设置的 flex-shrink 相等的情况下，各子元素的比例与元素设定的宽度的比例相等 */}
        {/* 如：三个元素设定的宽度比为 2:3:4，最终三个元素实际宽度的比例也为 2:3:4 */}
        <div className="flex-shrink-2">
            <div className="item-1" />
            <div className="item-2" />
            <div className="item-3" />
        </div>

        {/* flex-shrink：设置的 flex 相等的情况下，各子元素的比例与元素设定的宽度的比例相等 */}
        <div className="flex-shrink-3">
            <div className="item-1" />
            <div className="item-2" />
            <div className="item-3" />
        </div>

        {/* 以上都是固定宽度，百分比的时候是怎么样的？ */}

        {/* <div className="left">
            <div className="text">jjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjkkkkkkkkkkkkkkkkkkk</div>
        </div>
        <div className="right">
            <div className="text">jjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjkkkkkkkkkkkkkkkkkkk</div>
        </div> */}
    </div>

);

export default Flex;
