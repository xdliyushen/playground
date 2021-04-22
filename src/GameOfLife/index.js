import React, { useCallback, useEffect, useState } from 'react';
import { unstable_batchedUpdates } from 'react-dom';
import { assocPath, clone, update } from 'ramda';
import { lifeCore, createEmptyArr } from './utils';
import './index.less';

const GameOfLife = ({}) => {
    const [row, setRow] = useState(20);
    const [column, setColumn] = useState(20);
    const [rate, setRate] = useState(1);
    const [start, setStart] = useState(false);
    const [data, setData] = useState(createEmptyArr(row, column));

    const toggleCellState = useCallback(e => {
        // todo
        // // 拦截点击 tr 的事件
        // if(e.target.type !== 'td') {
        //     return;
        // }

        const [rowIndex, columnIndex] = e.target.getAttribute('data-value').split(',');

        setData(prev => {
            const newData = clone(prev);
            newData[rowIndex][columnIndex] = !prev[rowIndex][columnIndex];
            return newData;
        });
    }, []);

    const reset = useCallback(() => {
        unstable_batchedUpdates(() => {
            setStart(false);
            setData(createEmptyArr(row, column));
        });
    }, [row, column]);

    useEffect(() => {
        setData(createEmptyArr(row, column));
    }, [row, column])

    useEffect(() => {
        if (start) {
            const interval = setInterval(() => {
                unstable_batchedUpdates(() => {
                    // 进化算法
                    setData(prev => lifeCore(prev));
                    // todo 如果没有活着的细胞 就结束游戏
                });
            }, 1000 / rate);

            return () => clearInterval(interval);
        }
    }, [start, rate]);

    return (
        <div className='m-game-of-life'>
            <table className='panel' onClick={toggleCellState}>
                {
                    data.map((item, rowIndex) => {
                        return (
                            <tr className='row' key={rowIndex}>
                                {
                                    item.map((item, columnIndex) => {
                                        return (
                                            <td className={`cell ${item && 'alive'}`} key={columnIndex} data-value={[rowIndex, columnIndex]}></td>
                                        );
                                    })
                                }
                            </tr>
                        );
                    })
                }
            </table>
            <input className='row-input' placeholder='行数' type="text" onChange={e => setRow(Number(e.target.value))} />
            <input className='column-input' placeholder='列数' type="text" onChange={e => setColumn(Number(e.target.value))} />
            {/* todo 无级变速 0.1-3 之间 */}
            <input className='rate' placeholder='进化速率' />
            <button className='start-btn' onClick={() => setStart(true)}>开始</button>
            <button className='end-btn' onClick={() => setStart(false)}>暂停</button>
            <button className='end-btn' onClick={reset}>重置</button>
        </div>
    );
}

export default GameOfLife;