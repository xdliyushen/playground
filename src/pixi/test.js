import React, { useEffect } from 'react';
import * as PIXI from 'pixi.js';
import './index.less';
import mockjs from 'mockjs';

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
            .add('1', 'https://p5.music.126.net/obj/wo3DlcOGw6DClTvDisK1/9341420777/e877/eed5/f3d6/ed9178d0b4e57cfdf038de36001894bf.png')
            .add('2', 'https://p5.music.126.net/obj/wo3DlcOGw6DClTvDisK1/9340982032/151c/4658/c68f/1a88a6ad9844531cd865c42afb54e6de.png')
            .add('3', 'https://p6.music.126.net/obj/wo3DlcOGw6DClTvDisK1/9325701751/e9e6/d3a4/7ce8/a3be8a4b001d3fd4f0385b4d9cde4552.png')
            .add('4', 'https://p6.music.126.net/obj/wo3DlcOGw6DClTvDisK1/9323079265/2aeb/2d35/4488/b33a57a36c284750b3052466a0271b69.png')
            .add('5', 'https://p5.music.126.net/obj/wo3DlcOGw6DClTvDisK1/9322908458/c709/6e6d/8ed3/d87fc5ba63ea208f041c661b601a356c.png')
            .add('6', 'https://p5.music.126.net/obj/wo3DlcOGw6DClTvDisK1/9322509405/2913/8e25/4c9e/00d1e9c4f84ff72fea4d0b1104ebdbf8.png')
            .add('7', 'https://p5.music.126.net/obj/wo3DlcOGw6DClTvDisK1/9322220424/e37c/cbfe/65d4/d70238aeb9187697d6d54ed358609931.png')
            .add('8', 'https://p6.music.126.net/obj/wo3DlcOGw6DClTvDisK1/9322218904/2cf7/c458/a670/ab57e512178d9fcfcdb8a57c087a121a.png')
            .add('9', 'https://p5.music.126.net/obj/wo3DlcOGw6DClTvDisK1/9322519430/e85a/da94/0253/f6b9c46ecd2e3ddb8bce4e6a1938c7c5.png')
            .add('10', 'https://p5.music.126.net/obj/wo3DlcOGw6DClTvDisK1/9322218891/32a1/fc37/2d66/6ed1b497a31fae93b510b12f4a856085.png')
            .add('11', 'https://p5.music.126.net/obj/wo3DlcOGw6DClTvDisK1/9313490248/631f/1fdb/9ad6/047df6486fa260c55f8ccc62953fc4aa.png')
            .add('12', 'https://p5.music.126.net/obj/wo3DlcOGw6DClTvDisK1/9313484476/7782/5c92/614c/f8f8eb91c5299f5277b3c2dc8775a9dc.png')
            .add('13', 'https://p5.music.126.net/obj/wo3DlcOGw6DClTvDisK1/9313482528/eda1/56da/dc77/d38ea5102e56b01a3cdaec8eddec2af4.png')
            .add('14', 'https://p5.music.126.net/obj/wo3DlcOGw6DClTvDisK1/9313436367/b832/d5f4/ace5/eaf470d2e83680ed203d582ab8f6b227.png')
            .add('15', 'https://p6.music.126.net/obj/wo3DlcOGw6DClTvDisK1/9313175128/d7df/57bb/f760/8c10644e216375170b204d8e21552e14.png')
            .add('16', 'https://p5.music.126.net/obj/wo3DlcOGw6DClTvDisK1/9313224216/d0ac/c887/093d/4aba55f91dc623ad8d666bd8bc3ade72.png')
        // todo 百分比？？
            .load(() => {
            // 资源加载完毕后的回调函数
                const sprite = PIXI.Sprite.from('bunny');

                const arr = new Array(100).fill(1).map((v, i) => {
                    const sprite = PIXI.Sprite.from(`${i < 16 ? i + 1 : 'bunny'}`);

                    sprite.x = i + 10;
                    sprite.y = i + 10;

                    return sprite;
                });

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

                // // 随时间变化而变化不断执行
                // app.ticker.add(() => {
                //     sprite.rotation += 15;
                // });

                // 将 sprite 添加到视图中
                app.stage.addChild(...arr);
            });
    }, []);

    return (
        <div id="pixi-container" className="m-playground" />
    );
};

export default PlayGround;
