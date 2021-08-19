import React, { useState } from 'react';
import './index.less';

// 出现一条细边
// https://stackoverflow.com/questions/34796539/thin-line-when-rendering-overflowhidden-with-border-radius
// https://stackoverflow.com/questions/23152325/border-radius-overflowhidden-thin-black-line
const Example = () => {
    const [left, setLeft] = useState(10);
    const [top, setTop] = useState(10);

    function setMarginLeft(e) {
        setLeft(e.currentTarget.value);
    }
    function setMarginTop(e) {
        setTop(e.currentTarget.value);
    }

    return (
        <div className="wrap">
            <div className="inner" />
        </div>
    //     <>
    //         <div className="backdrop">
    //             <div className="circle">
    //                 <div
    //                     className="overflowing"
    //                     style={{
    //                         marginTop: `${top}px`,
    //                         marginLeft: `${left}px`,
    //                     }} />
    //             </div>
    //         </div>
    //         <span>top and right of the circle you should see some red, bottom left not</span><br />
    //         <em>Feel free to play around with these values:</em><br />
    // Top margin: <input type="number" id="cngMargin" onInput={setMarginTop} value={top} /><br />
    // Left margin: <input type="number" id="cngMargin" onInput={setMarginLeft} value={left} /></>
    );
};


export default Example;
