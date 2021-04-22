import React, {
    useCallback, useEffect, useRef, useState
} from 'react';
import './index.less';

const useClickOutside = (refs = [], cb, deps = []) => {
    const refList = Array.isArray(refs) ? refs : [refs];

    const handleClick = useCallback((e) => {
        // 考虑存在多个 ref 的情况
        // 点击不在任何一个 ref 指向的元素内时, 调用 cb
        const callCb = refList.reduce(
            (prev, ref) => {
                // ref.current 不存在
                if (!ref.current) {
                    return prev;
                }

                return prev && (ref.current && !ref.current.contains(e.target));
            },
            true,
        );

        if (callCb) {
            cb(e);
        }
    }, [refs, ...deps]);

    useEffect(() => {
        // 解决 ios 下 click 事件不触发的问题
        // if (Env.isIos()) {
        //     document.body.style.cursor = 'pointer';
        // }

        document.addEventListener('click', handleClick);

        return () => {
            document.removeEventListener('click', handleClick);
        };
    }, [handleClick]);
};

const ClickOutside = () => {
    const ref = useRef(null);
    const [dep, setDep] = useState(1);
    const onClick = useCallback((e) => {
        console.log(2);
        e.nativeEvent.stopImmediatePropagation();

        // setDep((prev) => {
        //     console.log('change dep', prev + 1);
        //     return prev + 1;
        // });
    }, []);

    useEffect(() => {
        document.addEventListener('click', () => {
            console.log(1);
        }, false);
    }, []);

    // const cb = useCallback(() => {
    //     console.log(dep);
    // }, [dep]);

    // useClickOutside(ref, cb, []);

    return (
        <div className="container">
            <div className="deps" onClick={onClick}>change dep</div>
            <div className="inside" ref={ref}>inside</div>
        </div>
    );
};

export default ClickOutside;
