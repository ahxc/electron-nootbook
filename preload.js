// 预加载进程，处理主进程和渲染进程之间的通信等。在渲染进程中执行，所有有document等对象

window.addEventListener('DOMContentLoaded', () => {
    const replaceText = (selector, text) => {
        const element = document.getElementById(selector);
        if (element) element.innerText = text;
    };

    for (const dependency of ['chrome', 'node', 'electron']) {
        replaceText(`${dependency}-version`, process.versions[dependency]);
    }
});

// 20后版本默认使用沙盒模式，失去完整的node.js环境，不能使用fs，配置文件关闭沙箱
const fs = require('fs');
fs.writeFile('C:/Users/ahxc1/test.txt', 'ahxc', (err) => {
});

// 通信桥
const { contextBridge, ipcRenderer } = require('electron');
// 暴露node.js中的process给渲染进程，名字为window.myApi
contextBridge.exposeInMainWorld('myApi', {
    platform: process.platform // 最好用函数懒加载方式，优化性能。
});

contextBridge.exposeInMainWorld('versions', {
    node: () => process.versions.node,
    chrome: () => process.versions.chrome,
    electron: () => process.versions.electron,
    // 不能直接暴露整个 ipcRenderer 模块，否则渲染器能够直接向主进程发送任意的 IPC 信息
    ping: () => {
        // 暴露给渲染进程一个invoke注入，这样，渲染进程可以通过监听的方式给主进程。
        return ipcRenderer.invoke('ping');
    },
    // 除函数之外，我们也可以暴露变量
});

// 拿去主进程的资源
ipcRenderer.on('SET_SOURCE', async (event, sourceId) => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            audio: false,
            video: {
                mandatory: {
                    chromeMediaSource: 'desktop',
                    chromeMediaSourceId: sourceId,
                    minWidth: 1280,
                    maxWidth: 1280,
                    minHeight: 720,
                    maxHeight: 720
                }
            }
        });
        handleStream(stream);
    } catch (e) {
        handleError(e);
    }
});

function handleStream(stream) {
    const video = document.querySelector('video');
    video.srcObject = stream;
    video.onloadedmetadata = (e) => video.play();
}

function handleError(e) {
    console.log(e);
}