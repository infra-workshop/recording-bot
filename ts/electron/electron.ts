import {app, BrowserWindow} from 'electron';

let mainWindow = null;

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
        frame: false
    });

    mainWindow.on('closed', function () {
        mainWindow = null;
    });

    await mainWindow.loadURL('file://' + __dirname + '/../../html/electron.html');
});