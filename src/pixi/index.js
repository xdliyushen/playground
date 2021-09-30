import React, { useEffect } from 'react';
import * as PIXI from 'pixi.js';
import './index.less';

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
            // 资源加载完毕后的回调函数
                const sprite = PIXI.Sprite.from('bunny');

                // 设置中心点-类比于 transform-origin
                sprite.anchor.set(0.5);
                // 设置坐标
                sprite.x = app.screen.width / 2;
                sprite.y = app.screen.height / 2;

                // 开启事件处理
                sprite.interactive = true;

                // 事件处理函数
                const onPointerDown = () => {
                    // 每次点击都放大一点点
                    const {
                        _x: x,
                        _y: y,
                    } = sprite.scale;

                    sprite.scale.set(x + 0.1, y + 0.1);
                };

                // 绑定事件
                sprite.on('pointerdown', onPointerDown);
                // sprite.pointerdown = onPointerDown;

                // 随时间变化而变化不断执行
                app.ticker.add(() => {
                    sprite.rotation += 0.1;
                });

                // 将 sprite 添加到视图中
                app.stage.addChild(sprite);
            });
    }, []);

    return (
        <div id="pixi-container" className="m-playground" />
    );
};

export default PlayGround;
