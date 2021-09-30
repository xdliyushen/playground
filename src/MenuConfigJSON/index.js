import React, { useEffect } from 'react';

const menus = [
    {
        path: '/',
        show: false
    },
    {
        path: 'overview',
        name: '活动概览',
        icon: 'info'
    },
    {
        path: 'tools',
        name: '活动小助手',
        icon: 'tool'
    },
    {
        path: 'fallout',
        name: '淘汰任务',
        icon: 'task',
        children: [
            {
                name: '任务配置',
                path: 'config',
                icon: 'setting'
            },
            {
                name: '淘汰快照',
                path: 'snapshot',
                icon: 'snapshot',
                children: [
                    {
                        name: '普通快照',
                        path: 'normal',
                        icon: 'snapshot'
                    },
                    {
                        name: 'vs 对决快照',
                        path: 'vs',
                        icon: 'snapshot'
                    }
                ]
            }
        ]
    },
    {
        path: 'gift',
        name: '活动礼物信息',
        icon: 'gift'
    },
    {
        path: 'rank',
        name: '榜单管理',
        icon: 'rank',
        children: [
            {
                name: '榜单信息',
                path: 'info',
                icon: 'rank'
            },
            {
                name: '榜单奖励',
                path: 'award',
                icon: 'gift'
            }
        ]
    },
    {
        path: 'group',
        name: '分组信息',
        icon: 'group'
    },
    {
        path: 'log',
        name: '操作日志',
        icon: 'profile'
    },
    {
        path: 'copy',
        name: '导出/导入配置',
        icon: 'export-inport'
    },
    {
        path: 'playground',
        name: '活动娱乐广场',
        icon: 'game',
        children: [
            {
                name: '活动账户',
                path: 'account',
                icon: 'account'
            },
            {
                name: '账户流水',
                path: 'bills',
                icon: 'profile'
            },
            {
                name: '活动时间券',
                path: 'ticket',
                icon: 'ticket',
                children: [
                    {
                        name: '时间券管理',
                        path: 'manage',
                        icon: 'manage'
                    },
                    {
                        name: '时间券流水',
                        path: 'bills',
                        icon: 'profile'
                    }
                ]
            }
        ]
    },
    {
        path: 'pigeon',
        name: '活动信鸽',
        icon: 'pigeon',
        children: [
            {
                name: '信鸽管理',
                path: 'manage',
                icon: 'manage'
            },
            {
                name: '飞行地管理',
                path: 'airport',
                icon: 'manage'
            },
            {
                name: '信件附录管理',
                path: 'mail',
                icon: 'manage',
                children: [
                    {
                        name: '飘屏信件',
                        path: 'fullscreen',
                        icon: 'mail'
                    }
                ]
            },
            {
                path: 'log',
                name: '飞行记录',
                icon: 'profile'
            }
        ]
    },
    '['
];

const App = () => {
    useEffect(() => {
        function createMenus(arr, routes) {
            const arrCopy = [...arr];
            const targetRoute = routes[0];

            let targetIndex = arrCopy.length;

            for (let i = 0; i < arrCopy.length; i++) {
                if (arrCopy[i].path === targetRoute.path) {
                    targetIndex = i;
                }
            }

            if (targetIndex === arrCopy.length) {
                arrCopy.push(targetRoute);
            }

            const children = arrCopy[targetIndex].children || [];

            if (routes.length > 1) {
                arrCopy[targetIndex].children = createMenus(children, routes.slice(1));
            }

            return arrCopy;
        }

        console.log(createMenus(menus, [{ path: 'tools' }, { path: 'a' }]));
    }, []);

    return (
        <div />
    );
};

export default App;
