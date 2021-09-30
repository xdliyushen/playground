import React, { useEffect } from 'react';
import * as PIXI from 'pixi.js';
import spritesheet from './texture.json';

const PlayGround = () => {
    useEffect(() => {
        // 创建画布
        const app = new PIXI.Application({
            backgroundColor: 0x1099bb,
        });
        // 将 canvas 添加到 DOM 元素中
        document.getElementById('pixi-container').appendChild(app.view);

        // app.stop();

        // 加载资源
        app.loader.add('pet', 'http://localhost:8001/src/pixi-animate-sprite/texture.png')
            .load(() => {
                const texture = PIXI.Texture.from('pet');
                const sheet = new PIXI.Spritesheet(texture, spritesheet);

                // 此方法在 10000 帧以下是同步的, 10000 帧以上是异步的
                sheet.parse(() => {});

                // 构建序列帧纹理数组
                const frames = [];
                for (let i = 0; i < 44; i++) {
                    const v = i < 10 ? `0${i}` : i;

                    frames.push(PIXI.Texture.from(`0${v}.png`));
                }

                // 创建序列帧精灵
                const anim = new PIXI.AnimatedSprite(frames);

                anim.scale.set(0.5);
                // 循环播放
                anim.loop = true;
                // 播放速度
                anim.animationSpeed = 0.8;
                anim.gotoAndPlay(0);

                app.stage.addChild(anim);
            });
    }, []);

    return (
        <div id="pixi-container" className="m-playground3" />
    );
};

export default PlayGround;
