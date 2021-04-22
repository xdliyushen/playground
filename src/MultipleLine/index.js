import React, { useState } from 'react';
import './index.less';

// 多行文本根据内容自动缩略 max-width
const Example = () => {
    const [fixedWidth, setFixedWidth] = useState(true);

    return (
        <div className="m-example">
            <div className="radio-group-container">
                <div className="radio-container" onClick={() => setFixedWidth(true)}>
                    <input type="radio" checked={fixedWidth} />
                    <span>width: 100px</span>
                </div>
                <div className="radio-container" onClick={() => setFixedWidth(false)}>
                    <input type="radio" checked={!fixedWidth} />
                    <span>max-width: 100px</span>
                </div>
            </div>

            <div className={`text-container ${fixedWidth ? 'width-100' : 'max-width-100'}`}>
                这是一段很长很长很长很长很长很长很长的文本
            </div>

            <div className={`text-container ${fixedWidth ? 'width-100' : 'max-width-100'}`}>
                短文本
            </div>
        </div>
    );
};

export default Example;
