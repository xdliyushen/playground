import React, { useEffect } from 'react';
import * as PIXI from 'pixi.js';
import './index.less';

// there is no magic at all
const PlayGround = () => {
    useEffect(() => {
        const app = new PIXI.Application();

        document.getElementById('pixi-container').appendChild(app.view);

        let count = 0;

        // build a rope!
        const ropeLength = 918 / 20;

        const points = [];
        const dots = [];

        for (let i = 0; i < 20; i++) {
            points.push(new PIXI.Point(i * ropeLength, 0));

            const dot = new PIXI.Graphics();

            dot.lineStyle(0);
            dot.beginFill(0xDE3249, 1);
            dot.drawCircle(0, 0, 10);
            dot.endFill();

            dots.push(dot);
        }

        const strip = new PIXI.SimpleRope(
            PIXI.Texture.from('https://p6.music.126.net/obj/wo3DlcOGw6DClTvDisK1/11012000982/ced1/0dd0/657d/7d9852411c6506e1d9bc55d88acf5d69.png'),
            points,
        );

        const snakeContainer = new PIXI.Container();
        snakeContainer.x = 100;
        snakeContainer.y = 300;

        snakeContainer.scale.set(800 / 1100);
        app.stage.addChild(snakeContainer);

        snakeContainer.addChild(strip);

        for (const dot of dots) {
            snakeContainer.addChild(dot);
        }

        app.ticker.add(() => {
            count += 0.1;

            for (let i = 0; i < points.length; i++) {
                points[i].y = Math.sin((i * 0.5) + count) * 30;
                points[i].x = i * ropeLength + Math.cos((i * 0.3) + count) * 20;

                dots[i].y = Math.sin((i * 0.5) + count) * 30;
                dots[i].x = i * ropeLength + Math.cos((i * 0.3) + count) * 20;
            }
        });
    }, []);

    return (
        <div id="pixi-container" className="m-playground7" />
    );
};

export default PlayGround;
