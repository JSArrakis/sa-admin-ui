const { app, BrowserWindow, ipcMain, dialog } = require('electron');

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        resizable: false,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        },
        autoHideMenuBar: true
    });

    mainWindow.loadFile('index.html');

    mainWindow.on('closed', function () {
        mainWindow = null;
    });
}

app.whenReady().then(() => {
    createWindow();

    mainWindow.webContents.send('load-profile');

    mainWindow.webContents.send('load-home');

    ipcMain.on('open-file-dialog', async (event) => {
        const result = await dialog.showOpenDialog(mainWindow, {
            properties: ['openFile', 'multiSelections'],
            filters: [
                { name: 'Video Files', extensions: ['mp4', 'webm', 'mkv', 'mov', 'avi'] },
                { name: 'All Files', extensions: ['*'] },
            ],
        });

        if (!result.canceled) {
            // Send the selected file path to the renderer process
            event.sender.send('selected-episodes', result.filePaths);
        }
    });

    ipcMain.on('open-drive-dialog', async (event) => {
        const result = await dialog.showOpenDialog(mainWindow, {
            properties: ['openDirectory'],
            filters: [
                { name: 'All Files', extensions: ['*'] },
            ],
        });

        if (!result.canceled) {
            // Send the selected file path to the renderer process
            event.sender.send('selected-drive', result.filePaths[0]);
        }
    });

    app.on('window-all-closed', function () {
        if (process.platform !== 'darwin') app.quit();
    });

    app.on('activate', function () {
        if (mainWindow === null) createWindow();
    });
});