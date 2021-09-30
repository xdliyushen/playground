import React, { useEffect } from 'react';
import * as PIXI from 'pixi.js';
import { Spine } from 'pixi-spine';
import './index.less';

const Pixispine = () => {
    useEffect(() => {
        const app = new PIXI.Application({
            width: 600,
            height: 600,
        });
        document.getElementById('pixi-spine').appendChild(app.view);

        app.loader
            .add('dragon', 'http://localhost:8001/src/pixi-spine/dragon.json')
            .load((loader, res) => {
                const dragon = new Spine(res.dragon.spineData);

                // dragon.skeleton.setToSetupPose();
                // dragon.update(0);

                dragon.autoUpdate = true;
                dragon.state.timeScale = 0.5;

                // dragon.state.setAnimation(0, 'flying', true);
                dragon.state.addAnimation(0, 'walk', false);
                dragon.state.addAnimation(0, 'jump', false, 0.5);
                // dragon.state.addAnimation(0, 'fall', true, 2);

                // dragon.state.addAnimation(1, 'stand', true);

                dragon.state.addListener({
                    complete: (entry) => {
                        console.log('complete', entry.animation);

                        // dragon.state.clearTrack(0);
                        // dragon.state.addAnimation(0, 'walk', false);
                    },
                    interrupt: () => {
                        console.log('interrupt');
                    }
                });

                // dragon.state.apply(dragon.skeleton);

                // 调整动画位置和大小
                dragon.scale.set(0.5, 0.5);
                dragon.x = 300;
                dragon.y = 300;

                app.stage.addChild(dragon);

                // todo 删除
                console.log(dragon);

                // app.ticker.add(() => {
                //     dragon.update(0.01666666666667);
                // });

                // const dragonCage = new PIXI.Container();
                // dragonCage.addChild(dragon);

                // const localRect = dragon.getLocalBounds();
                // dragon.position.set(-localRect.x, -localRect.y);

                // const scale = Math.min(
                //     (app.screen.width * 0.7) / dragonCage.width,
                //     (app.screen.height * 0.7) / dragonCage.height,
                // );

                // dragonCage.scale.set(scale, scale);
                // dragonCage.position.set(
                //     (app.screen.width - dragonCage.width) * 0.5,
                //     (app.screen.height - dragonCage.height) * 0.5,
                // );

                // app.stage.addChild(dragonCage);
                // // app.stage.addChild(dragon);

                // dragon.interactive = true;
                // dragon.on('click', () => {
                //     dragon.update(0.01);
                // });
            });
    }, []);

    return (
        <div id="pixi-spine" className="m-pixispine" />
    );
};

export default Pixispine;
