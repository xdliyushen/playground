import React, { useState } from 'react';
import './index.less';

const tabs = ['乐器', '套装', '背景'];

const Animationtab = () => {
    const [value, setValue] = useState(0);

    return (
        <div className="f-pr m-animationtab">
            {/* 未激活态的 tab 按钮 */}
            <div className="f-fbvc normal-tabs">
                {
                    tabs.map((text, index) => (
                        <p
                            key={index}
                            className="f-tc tab-btn"
                            onClick={() => setValue(index)}>
                            {text}
                        </p>
                    ))
                }
            </div>

            {/* 按钮窗口 */}
            <div
                className="f-pa tab-btn-window"
                style={{
                    left: `${(100 / tabs.length) * value}%`,
                }}>
                {/* 激活态的 tab 按钮 */}
                <div
                    className="f-pa f-fbvc active-tabs"
                    style={{
                        left: `-${100 * value}%`,
                    }}>
                    {
                        tabs.map((text, index) => (
                            <p
                                key={index}
                                className="f-tc tab-btn"
                                onClick={() => setValue(index)}>
                                {text}
                            </p>
                        ))
                    }
                </div>
            </div>
        </div>
    );
};

export default Animationtab;
