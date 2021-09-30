import React, {
    forwardRef, useEffect, useImperativeHandle, useRef
} from 'react';
import './index.less';

const Son = forwardRef(({ className = '' }, ref) => {
    const domRef = useRef(null);

    // todo why??
    useImperativeHandle(ref, () => domRef);

    useEffect(() => {
        domRef.current = 10;

        setTimeout(() => {
            console.log('timer 执行');

            domRef.current = 20;
        }, 2000);
    }, []);

    return (
        <div className={`m-son ${className}`} />
    );
});

export default Son;
