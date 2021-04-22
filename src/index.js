import React, { useCallback, useEffect } from 'react';
import ReactDOM from 'react-dom';
import TWEEN from '@tweenjs/tween.js';
import GameOfLife from './GameOfLife';
import Flex from './Flex';
import ClipPath from './ClipPath';
import ReactDOMRender from './ReactDOMRender';
import ThreeJS from './ThreeJS';
import ClickOutside from './ClickOutside';
import MultipleLine from './MultipleLine';
import ThinLine from './ios-thin-line';
// todo 搞一个！
// import './base.less';
import './index.less';

const App = () => (
    // todo 修改
    // <GameOfLife />
    // <Flex />
    // <ClipPath />
    // <ReactDOMRender />
    // <ThreeJS />
    // <ClickOutside />
    // <MultipleLine />
    <ThinLine />
);

ReactDOM.render(
    <App />,
    document.getElementById('container')
);
