import React, { useEffect } from 'react';
import { Fireworks } from 'fireworks-js';
import './index.less';

const PlayGround = () => {
    useEffect(() => {
        const container = document.getElementById('pixi-container');
        const fireworks = new Fireworks(container, {
            hue: {
                min: 0,
                max: 345
            },
            delay: {
                min: 15,
                max: 15
            },
            speed: 10,
            acceleration: 1.2,
            friction: 0.96,
            gravity: 3,
            particles: 90,
            trace: 1,
            explosion: 10,
            autoresize: true,
            brightness: {
                min: 50,
                max: 80,
                decay: {
                    min: 0.015,
                    max: 0.03
                }
            },
            boundaries: {
                top: 50,
                bottom: 750,
                left: 50,
                right: 750,
            },
            sound: {
                enable: false,
            },
            mouse: {
                click: true,
                move: false,
                max: 3
            }
        });

        fireworks.start();

        // fireworks.pause();
        // fireworks.clear();
        // fireworks.stop();
    }, []);

    return (
        <div id="pixi-container" className="m-playground6" />
    );
};

export default PlayGround;
