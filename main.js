const {
    app, BrowserWindow, ipcMain, Menu,
    dialog, globalShortcut, Tray, nativeImage, desktopCapturer } = require('electron');

const path = require('node:path');
const WinState = require('electron-win-state').default;

// macOS
const isMac = process.platform === 'darwin';

const snowman_png = nativeImage.createFromPath('public/snowman.png');
// const snowman_svg = nativeImage.createFromBitmap('public/vite.svg');

// require("@electron/remote/main").initialize();

const winState = new WinState({
    defaultWidth: 800,
    defaultHeight: 600,
});

// 主进程 main.js
// 主进程包含Electron ，Node.js ,npm 安装的包
// 而渲染进程在浏览器核心上，即网页页面。
// 预加载是渲染进程的一部分，为了将 Electron 的不同类型的进程桥接在一起。新版沙河模式预加载失去了node.js环境。

let win;
const createWindow = () => {
    win = new BrowserWindow({
        x: 100,
        y: 100,// 位置，屏幕左上角
        title: '测试',// html样式优先级更高
        width: 1000,
        height: 800,
        maxHeight: 1920,
        resizable: true,
        ...winState.winOptions,
        // backgroundColor: '#6435c9', // 样式文件权限更高
        frame: true, // 是否显示上边框，取消上边框，transparent才会生效
        transparent: false,
        // autoHideMenuBar: true, // 隐藏操作栏
        icon: snowman_png,
        // titleBarOverlay: true, // 与frame配合，虽然无frame但还是透明覆盖dom区域，
        webPreferences: {
            // 渲染进程renderer里集成nodejs环境可编写nodejs代码
            // nodeIntegration: true, // 不推荐使用，渲染进程已有运行环境，同时有安全问题。
            // 取消nodejs和渲染环境的隔离
            // contextIsolation: false,
            preload: path.join(__dirname, 'preload.js'), // 通过预加载脚本使用node.js脚本
            sandbox: false,
            // enableRemoteModule: true, // 使用remote模块
        }
    });
    winState.manage(win);

    // 旧版remote，渲染进程调用node.js的方法
    // require("@electron/remote/main").enable(win.webContents);

    // win.loadURL('http://loca');
    win.loadFile('index.html');

    // 如果是网页版的，进来后会有一段白屏，等页面加载完毕后在显示窗口
    win.on('ready-to-show', () => {
        console.log('ready-to-show');
        win.show();
    });

    // dom加载完毕，在ready-to-show之前
    win.webContents.on('dom-ready', () => {
        console.log('dom-ready');
    });
    win.webContents.on('context-menu', (e, paramas) => {
        console.log('context-menu');
    });

    // 默认打开调试面板 ctrl shift i
    win.webContents.openDevTools();

    // 暂时关闭安全警告
    // process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true';

    // 父子窗口
    // const win2 = new BrowserWindow({
    //     width: 600,
    //     height: 400,
    //     parent: win
    // }); 
};

function captureVideo(params) {
    // 桌面捕获，获取所有资源信息，并遍历发送id给预加载
    desktopCapturer.getSources({ types: ['window', 'screen'] }).then((sources) => {
        for (const source of sources) {
            if (source.name === '测试') {
                win.webContents.send('SET_SOURCE', source.id);
                return;
            }
        }
    });
}

// Electron 结束初始化和创建浏览器窗口的时候调用
app.whenReady().then(() => {
    console.log('whenReady');
    createWindow();

    // 注册一个'CommandOrControl+X' 快捷键监听器 ctrl+x
    const ret = globalShortcut.register('CommandOrControl+X', () => {
        console.log('CommandOrControl+X');
    });

    // 检查快捷键是否注册成功
    // console.log(globalShortcut.isRegistered('CommandOrControl+X'));

    // 接收渲染器的注入，再进行二次处理
    ipcMain.handle('ping', (e, data) => {
        return 'pong';
    });

    app.on('activate', () => {
        console.log('activate');
        // 所有窗口为0，创建新窗口
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        };
    });

    // 托盘，状态栏图标
    const icon = snowman_png;
    tray = new Tray(icon);
    // 托盘菜单
    const contextMenu = Menu.buildFromTemplate([
        { label: 'Item1', type: 'radio' },
        { label: 'Item2', type: 'radio' },
        { label: 'Item3', type: 'radio', checked: true },
        { label: 'Item4', type: 'radio' }
    ]);
    tray.setContextMenu(contextMenu); // 右击菜单
    tray.setToolTip('帮助'); // 悬浮提示信息
    tray.setTitle('工具栏');
    tray.on('click', (e) => {// 点击显示
        win.show();
    });
});



// 窗口启动准备完毕，在focus之前，仅一次
app.on('ready', () => {
    console.log('ready');

    // 文件选择
    // dialog.showOpenDialog({
    //     title: '',
    //     filters: [
    //         { name: 'Images', extensions: ['jpg', 'png', 'gif'] },
    //         { name: 'Movies', extensions: ['mkv', 'avi', 'mp4'] },
    //         { name: 'Custom File Type', extensions: ['as'] },
    //         { name: 'All Files', extensions: ['*'] }
    //     ]
    // });

    // 保存文件路径选择
    // dialog.showSaveDialog();

    // 模态按钮选择
    // dialog.showMessageBox({
    //     title: '测试',
    //     message: '测试消息',
    //     detail: '消息详情',
    //     buttons: ['提交']
    // });

    // console.log(app.getPath('desktop')); // 桌面 C:\Users\ahxc1\Desktop
    // console.log(app.getPath('music')); // 音乐文件夹 C:\Users\ahxc1\Music
    // console.log(app.getPath('temp')); // C:\Users\ahxc1\AppData\Local\Temp
    // console.log(app.getPath('userData'));// 用户数据 C:\Users\ahxc1\AppData\Roaming\Electron

    Menu.setApplicationMenu(menu);
});

// 窗口激活事件，第一次进入图标，或最小化再激活
app.on('activate', () => {
    console.log('activate');
    // 所有窗口为0，创建新窗口
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    };
});

// 所有窗口关闭事件，在before-quit之前
app.on('window-all-closed', () => {
    console.log('window-all-closed');
    // darwin 是macos，windows平台要调用quit退出
    if (!isMac) {
        app.quit();
    };
});

// 窗口关闭之前
app.on('before-quit', () => {
    console.log('before-quit');
});

app.on('will-quit', () => {
    console.log('will-quit');
    // 注销快捷键
    globalShortcut.unregister('CommandOrControl+X');

    // 注销所有快捷键
    globalShortcut.unregisterAll();
});

// 失去焦点，切出去
app.on('browser-window-blur', () => {
    console.log('browser-window-blur');
});

// 获得焦点
app.on('browser-window-focus', () => {
    console.log('browser-window-focus');
});

// 一个对象，一个主按钮，主按钮可定义submenu
const template = [
    // mac
    ...(isMac
        ? [{
            label: app.name || '测试',
            submenu: [
                { role: '关于' },
                { role: 'services' },
                { role: 'hide' },
                { role: 'hideOthers' },
                { type: 'separator' }, // 分割线
                { role: 'unhide' },
                { role: 'quit' }
            ]
        }]
        : []
    ),
    {
        role: 'help',
        submenu: [
            {
                label: 'Learn More',
                click: async () => {
                    const { shell } = require('electron');
                    await shell.openExternal('https://electronjs.org');
                },
                accelerator: 'Shift+Alt+G' // 快捷键
            }
        ]
    }
];

const menu = Menu.buildFromTemplate(template);
Menu.setApplicationMenu(menu);