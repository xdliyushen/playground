import React, { useEffect } from 'react';
import TWEEN from '@tweenjs/tween.js';
import * as PIXI from 'pixi.js';

// there is no magic at all
const PlayGround = () => {
    useEffect(() => {
        // 放大后不进行模糊处理
        // PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;

        // 创建画布
        const app = new PIXI.Application({
            backgroundColor: 0xffffff,
        });
        // 将 canvas 添加到 DOM 元素中
        document.getElementById('pixi-container').appendChild(app.view);

        const start = {
            x1: 0, y1: 0, x2: 100, y2: 0
        };
        const end = {
            x1: 100, y1: 0, x2: 100, y2: 100
        };

        const ticker = () => {
            // const percent = start.x1 / 100;
            // const x = ((start.x1 + start.x2) * percent);
            // const y = ((start.y2 + start.y1) * percent);

            // const dot = new PIXI.Graphics();
            // dot.beginFill(0x000000, 1);
            // dot.drawCircle(start.x1, start.y1, 1);
            // dot.drawCircle(start.x2, start.y2, 1);
            // dot.drawCircle(x, y, 1);
            // dot.endFill();

            // app.stage.addChild(dot);

            const line = new PIXI.Graphics();
            line.lineStyle(1, 0x000000)
                .moveTo(start.x1, start.y1)
                .lineTo(start.x2, start.y2);

            app.stage.addChild(line);
        };

        const x = new TWEEN.Tween(start)
            .to(end, 5000)
            .easing(TWEEN.Easing.Linear.None)
            .onComplete(() => {
                app.ticker.remove(ticker);
            });

        x.start();

        app.ticker.add(ticker);
    }, []);

    useEffect(() => {
        function animate(time) {
            requestAnimationFrame(animate);
            TWEEN.update(time);
        }

        requestAnimationFrame(animate);
    });

    return (
        <div id="pixi-container" className="m-bezier" />
    );
};

export default PlayGround;
