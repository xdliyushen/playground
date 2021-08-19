import React, { useCallback, useEffect } from 'react';
import VConsole from 'vconsole';
import * as PIXI from 'pixi.js';
import './index.less';

const vConsole = new VConsole();

// there is no magic at all
const PlayGround = () => {
    useEffect(() => {
        // 放大后不进行模糊处理
        // PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;

        // 创建画布
        const app = new PIXI.Application({
            width: 350,
            height: 250,
            backgroundColor: 0x1099bb,
        });
        // 将 canvas 添加到 DOM 元素中
        document.getElementById('pixi-container').appendChild(app.view);

        // 加载资源
        const texture = PIXI.Texture.from('http://scottmcdonnell.github.io/pixi-examples/_assets/testVideo.mp4');

        const videoSprite = new PIXI.Sprite(texture);
        videoSprite.width = 910 / 3;
        videoSprite.height = 720 / 3;

        const videoControler = videoSprite.texture.baseTexture.resource.source;

        // 静音
        videoControler.muted = true;
        // ios 端需设置
        videoControler.playsinline = true;
        // 自动播放
        videoControler.autoplay = true;

        app.stage.addChild(videoSprite);

        document.getElementById('pixi-container').appendChild(videoControler);
    }, []);

    const onClick = useCallback(() => {
        const video = document.getElementById('video');

        if (video) {
            video.play();
        }
    }, []);

    const onClick2 = useCallback(() => {
        const video = document.getElementById('video');

        if (video) {
            video.pause();
        }
    }, []);

    return (
        <div id="pixi-container" className="m-playground3">
            <div className="btn" onClick={onClick} />
            <div className="btn2" onClick={onClick2} />
        </div>
    );
};

export default PlayGround;
