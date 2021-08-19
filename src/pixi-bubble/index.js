import React, { useEffect } from 'react';
import * as PIXI from 'pixi.js';
import './index.less';

// there is no magic at all
const PlayGround = () => {
    useEffect(() => {
        // 放大后不进行模糊处理
        // PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;

        // 创建画布
        const app = new PIXI.Application({
            backgroundColor: 0x1099bb,
        });
        // 将 canvas 添加到 DOM 元素中
        document.getElementById('pixi-container').appendChild(app.view);

        // 加载资源
        app.loader.add('bunny', 'https://pixijs.io/examples-v4/examples/assets/bunny.png')
            .load(() => {
                const container = new PIXI.Container();
                container.on('pointerdown', () => {
                    console.log('container pointerdown');
                });
                container.interactive = true;

                // Create a 5x5 grid of bunnies
                for (let i = 0; i < 25; i++) {
                    const bunny = PIXI.Sprite.from('bunny');
                    bunny.anchor.set(0.5);
                    bunny.x = (i % 5) * 40;
                    bunny.y = Math.floor(i / 5) * 40;
                    bunny.on('pointerdown', () => {
                        console.log('bunny', i, 'pointerdown');
                    });
                    bunny.interactive = true;
                    container.addChild(bunny);
                }

                // Move container to the center
                container.x = app.screen.width / 2;
                container.y = app.screen.height / 2;

                // Center bunny sprite in local container coordinates
                container.pivot.x = container.width / 2;
                container.pivot.y = container.height / 2;

                app.stage.addChild(container);
            });
    }, []);

    // 绑定原生事件
    useEffect(() => {
        const domContainer = document.getElementById('dom-container');

        domContainer.addEventListener('pointerdown', () => {
            console.log('pointerdown dom container');
        }, false);

        Array.from(domContainer.children).map((child, index) => {
            child.addEventListener('pointerdown', () => {
                console.log('pointerdown', index + 1);
            }, false);
        });
    }, []);

    return (
        <>
            <div id="pixi-container" className="m-playground3" />
            <div
                id="dom-container"
                className="dom-container">
                {
                    new Array(5).fill(1).map((item, index) => (
                        <div
                            key={index}
                            id={`block-${index + 1}`}
                            className={`block block-${index + 1}`} />
                    ))
                }
            </div>
        </>
    );
};

export default PlayGround;
