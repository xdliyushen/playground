import React, { useEffect } from 'react';
import * as R from 'ramda';
import path from '../../../jimp/path.json';
import './index.less';

// todo 删除
console.log(path.result);

// todo 为啥有好多黑点？？
const App = () => {
    // useEffect(() => {
//     const parent = document.getElementById('bitmap');

    //     path.result.map(({ x, y, color }) => {
    //         const ele = document.createElement('div');
    //         ele.style.position = 'absolute';
    //         ele.style.left = `${x}px`;
    //         ele.style.top = `${y}px`;
    //         ele.style.width = '10px';
    //         ele.style.height = '10px';
    //         ele.style.backgroundColor = `#${color}`;

    //         parent.appendChild(ele);
    //     });
    // }, []);

    useEffect(() => {
        for (let i = 1; i < 5; i++) {
            const row = document.getElementsByClassName(`row${i + 1}`)[0];

            for (let j = 0; j < 10; j++) {
                if (j >= 1 && j < 5) {
                    row.children[j].innerHTML = 1;
                }
            }
        }

        // for (let i = 1; i < 5; i++) {
        //     const row = document.getElementsByClassName(`row${i + 1}`)[0];

        //     for (let j = 0; j < 10; j++) {
        //         if (j >= 1 && j < 5) {
        //             row.children[j].innerHTML = 1;
        //         }
        //     }
        // }

        // for (let i = 1; i < 5; i++) {
        //     const row = document.getElementsByClassName(`row${i + 1}`)[0];

        //     for (let j = 0; j < 10; j++) {
        //         if (j >= 1 && j < 5) {
        //             row.children[j].innerHTML = 1;
        //         }
        //     }
        // }

        // for (let i = 1; i < 5; i++) {
        //     const row = document.getElementsByClassName(`row${i + 1}`)[0];

        //     for (let j = 0; j < 10; j++) {
        //         if (j >= 1 && j < 5) {
        //             row.children[j].innerHTML = 1;
        //         }
        //     }
        // }
    }, []);

    return (
        <div id="bitmap" className="m-bitmap">
            {
                new Array(10).fill(1).map((item, index) => (
                    <div className={`row row${index + 1}`}>
                        {
                                new Array(10).fill(1).map((item, index) => (
                                    <div className={`clo clo${index + 1}`} />
                                ))
                            }
                    </div>
                ))
            }
        </div>
    );
};


export default App;
