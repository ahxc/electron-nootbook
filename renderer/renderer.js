// 渲染进程，即挂载到html上的js脚本，不支持node.js环境
// const fs = require('fs');

// const { BrowserWindow } = require("electron");
// const BrowserWindow = require("@electron/remote").BrowserWindow; // 旧版remote，渲染进程调用node.js的方法

const func = async () => {
    const response = await window.versions.ping();
    console.log(response); // 打印 'pong'
};

func();

// dom内容加载完毕后
window.addEventListener('DOMContentLoaded', function (params) {
    // 预加载通信桥传来的信息，新版window前缀可用可不用
    console.log(window.versions.ping, versions.ping);
    const information = document.getElementById('info');
    information.innerText = `本应用正在使用 Chrome v${versions.chrome()}
    , Node.js v${versions.node()} 和 Electron v${versions.electron()}`;

    // const oBtn = this.document.getElementById('obtn');
    // oBtn.addEventListener('click', function (params) {
    //     const newWin = new BrowserWindow({
    //         width: 200, height: 200,
    //     });
    //     newWin.loadFile('../index.html');

    //     newWin.on('close', () => {
    //         newWin = null;
    //     });
    // });
});