import {app, ipcMain, BrowserWindow} from 'electron';
import * as fs from 'fs';

let mainWindow: BrowserWindow | null = null;

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('ready', async function () {

    // ブラウザ(Chromium)の起動, 初期画面のロード
    mainWindow = new BrowserWindow({
        width: 1920,
        height: 1600,
        webPreferences: {
            nodeIntegration: true
        },
        resizable: false,
        //only for release
        //show: false,
        frame: false
    });

    mainWindow.on('closed', function () {
        mainWindow = null;
    });

    mainWindow.webContents.openDevTools();
    await mainWindow.loadURL('file://' + __dirname + '/../../html/electron.html');

    ipcMain.on("download", (event, uint8Ary: Uint8Array) => {
        fs.existsSync(__dirname + '/../../video') || fs.mkdirSync( __dirname + '/../../video');
        fs.writeFileSync(__dirname + '/../../video/' + new Date().toISOString() + ".webm", uint8Ary);
        console.log("downloaded");
    });

});