import React, {
    useCallback, useEffect, useLayoutEffect, useState
} from 'react';
import ReactDOM from 'react-dom';
import Modal from '@music/ct-modal';
// import TWEEN from '@tweenjs/tween.js';
// import GameOfLife from './GameOfLife';
// import Flex from './Flex';
// import ClipPath from './ClipPath';
// import ReactDOMRender from './ReactDOMRender';
// import ThreeJS from './ThreeJS';
// import ClickOutside from './ClickOutside';
// import MultipleLine from './MultipleLine';
import ThinLine from './ios-thin-line';
import PlayGround from './pixi';
import PlayGround2 from './pixi/test.js';
import PlayGround3 from './pixi-bubble';
import PlayGround4 from './pixi-animate-sprite';
import PlayGround5 from './pixi-video';
import PlayGround6 from './firework-js';
import Bezier from './bezier';
import Transition from './ReactTransitionGroup';
import Tab from './animation-tab';
// todo 搞一个！
// import './base.less';
import './index.less';

const showHouseModal = () => Modal.create({
    maskClosable: true,
    content: () => (
        <div className="modal-content" />
    )
})();

const App = () => {
    const [count, setCount] = useState(0);

    // 会闪烁
    // useEffect(() => {
    //     let i = 0;
    //     while (i <= 3000) {
    //         console.log(i);
    //         i++;
    //     }
    //     setCount(123);
    // }, []);

    // // 不会闪烁
    // useLayoutEffect(() => {
    //     let i = 0;
    //     while (i <= 3000) {
    //         console.log(i);
    //         i++;
    //     }
    //     setCount(123);
    // }, []);

    return (
        <div>
-----测试----

            <div>{count}</div>
        </div>
    );


    // const onScroll = useCallback(() => {
    //     console.log('react scroll');
    // }, []);

    // useEffect(() => {
    //     document.getElementById('test').addEventListener('scroll', () => {
    //         console.log('scroll');
    //     });

    //     document.body.addEventListener('scroll', () => {
    //         console.log('window scroll');
    //     }, false);
    // }, []);

    // const onScroll2 = useCallback(() => {
    //     console.log('react scroll 2');
    // }, []);

    return (
    // 点击穿透
    // <div className="container">
    //     <div className="btn" onTouchStart={() => {}} onTouchEnd={() => {}} onClick={showHouseModal} />
    // </div>

    <>
        {/* <Transition /> */}
        <Tab />
        {/* <div className="span-conatiner">
        Far out in the uncharted backwaters of the unfashionable end of the western spiral arm of the Galaxy lies a small unregarded yellow sun.
        </div>
        <div className="span-conatiner">
        some text
        </div> */}
        {/* <div className="span-conatiner">
            texttext
            <span className="span1" />
            <span className="span2">0</span>
            <span className="span3">0</span>
        </div> */}
        {/* <Bezier /> */}

        {/* <PlayGround /> */}
        {/* <PlayGround2 /> */}
        {/* <PlayGround3 /> */}
        {/* <PlayGround4 /> */}
        {/* <PlayGround5 /> */}
        {/* <PlayGround6 /> */}
        {/* <div className="img-container">
            <img
                className="img"
                src="https://p5.music.126.net/obj/wo3DlcOGw6DClTvDisK1/9247427274/4342/3f49/88e8/dd5d6262dbab09bfadc553d93cd9219e.png" />
            <span className="text">xxx中文中文</span>
        </div> */}
        </>

    // scroll 事件
    // <div onScroll={onScroll2}>
    //     <div
    //         id="test"
    //         onScroll={onScroll}
    //         style={{
    //             width: '300px',
    //             height: '300px',
    //             overflow: 'scroll',
    //         }}>
    //         <p>11111111111111111111</p>
    //         <p>11111111111111111111</p>
    //         <p>11111111111111111111</p>
    //         <p>11111111111111111111</p>
    //         <p>11111111111111111111</p>
    //         <p>11111111111111111111</p>
    //         <p>11111111111111111111</p>
    //         <p>11111111111111111111</p>
    //         <p>11111111111111111111</p>
    //         <p>11111111111111111111</p>
    //         <p>11111111111111111111</p>
    //         <p>11111111111111111111</p>
    //         <p>11111111111111111111</p>
    //         <p>11111111111111111111</p>
    //         <p>11111111111111111111</p>
    //         <p>11111111111111111111</p>
    //         <p>11111111111111111111</p>
    //         <p>11111111111111111111</p>
    //         <p>11111111111111111111</p>
    //         <p>11111111111111111111</p>
    //         <p>11111111111111111111</p>
    //         <p>11111111111111111111</p>
    //         <p>11111111111111111111</p>
    //         <p>11111111111111111111</p>
    //         <p>11111111111111111111</p>
    //         <p>11111111111111111111</p>
    //         <p>11111111111111111111</p>
    //         <p>11111111111111111111</p>
    //         <p>11111111111111111111</p>
    //         <p>11111111111111111111</p>
    //         <p>11111111111111111111</p>
    //         <p>11111111111111111111</p>
    //         <p>11111111111111111111</p>
    //         <p>11111111111111111111</p>
    //         <p>11111111111111111111</p>
    //         <p>11111111111111111111</p>
    //         <p>11111111111111111111</p>
    //         <p>11111111111111111111</p>
    //         <p>11111111111111111111</p>
    //         <p>11111111111111111111</p>
    //         <p>11111111111111111111</p>
    //         <p>11111111111111111111</p>

    //     </div>
    // </div>

    // todo 修改
    // <GameOfLife />
    // <Flex />
    // <ClipPath />
    // <ReactDOMRender />
    // <ThreeJS />
    // <ClickOutside />
    // <MultipleLine />
    // <ThinLine />
    );
};
ReactDOM.render(
    <App />,
    document.getElementById('container')
);
