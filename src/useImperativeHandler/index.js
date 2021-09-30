import React, { useCallback, useRef } from 'react';
import Son from './son';
import './index.less';

const UseImperativeHandler = ({ className = '' }) => {
    const ref = useRef(null);

    const onClick = useCallback(() => {
        // 改成 ref.current 就获取不到值了
        console.log(ref);
    }, [ref, ref.current]);

    return (
        <div className={`m-use-imperative-handler ${className}`} onClick={onClick}>
            <Son ref={ref} />

            <p style={{
                fontSize: '40px',
                color: 'black',
            }}>
#012233ff
            </p>
        </div>
    );
};

export default UseImperativeHandler;
