const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');

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
        autoHideMenuBar: true,
        icon: path.join(__dirname, 'build/saicon.png')
    });

    mainWindow.loadFile('index.html');

    mainWindow.webContents.once('did-finish-load', () => {
        // Send events to the renderer process
        mainWindow.webContents.send('load-profile');
        mainWindow.webContents.send('load-home');
    });

    mainWindow.on('closed', function () {
        mainWindow = null;
    });
}

app.whenReady().then(() => {
    createWindow();

    ipcMain.on('open-episodes-dialog', async (event) => {
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

    ipcMain.on('open-movies-dialog', async (event) => {
        const result = await dialog.showOpenDialog(mainWindow, {
            properties: ['openFile', 'multiSelections'],
            filters: [
                { name: 'Video Files', extensions: ['mp4', 'webm', 'mkv', 'mov', 'avi'] },
                { name: 'All Files', extensions: ['*'] },
            ],
        });

        if (!result.canceled) {
            // Send the selected file path to the renderer process
            event.sender.send('selected-movies', result.filePaths);
        }
    });

    ipcMain.on('open-shorts-dialog', async (event) => {
        const result = await dialog.showOpenDialog(mainWindow, {
            properties: ['openFile', 'multiSelections'],
            filters: [
                { name: 'Video Files', extensions: ['mp4', 'webm', 'mkv', 'mov', 'avi'] },
                { name: 'All Files', extensions: ['*'] },
            ],
        });

        if (!result.canceled) {
            // Send the selected file path to the renderer process
            event.sender.send('selected-shorts', result.filePaths);
        }
    });

    ipcMain.on('open-music-dialog', async (event) => {
        const result = await dialog.showOpenDialog(mainWindow, {
            properties: ['openFile', 'multiSelections'],
            filters: [
                { name: 'Video Files', extensions: ['mp4', 'webm', 'mkv', 'mov', 'avi'] },
                { name: 'All Files', extensions: ['*'] },
            ],
        });

        if (!result.canceled) {
            // Send the selected file path to the renderer process
            event.sender.send('selected-music', result.filePaths);
        }
    });

    ipcMain.on('open-commercials-dialog', async (event) => {
        const result = await dialog.showOpenDialog(mainWindow, {
            properties: ['openFile', 'multiSelections'],
            filters: [
                { name: 'Video Files', extensions: ['mp4', 'webm', 'mkv', 'mov', 'avi'] },
                { name: 'All Files', extensions: ['*'] },
            ],
        });

        if (!result.canceled) {
            // Send the selected file path to the renderer process
            event.sender.send('selected-commercials', result.filePaths);
        }
    });

    ipcMain.on('open-promos-dialog', async (event) => {
        const result = await dialog.showOpenDialog(mainWindow, {
            properties: ['openFile', 'multiSelections'],
            filters: [
                { name: 'Video Files', extensions: ['mp4', 'webm', 'mkv', 'mov', 'avi'] },
                { name: 'All Files', extensions: ['*'] },
            ],
        });

        if (!result.canceled) {
            // Send the selected file path to the renderer process
            event.sender.send('selected-promos', result.filePaths);
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

    ipcMain.on('log-message', (event, message) => {
        // Log the message to the terminal
        console.log(message);
    });

    app.on('window-all-closed', function () {
        if (process.platform !== 'darwin') app.quit();
    });

    app.on('activate', function () {
        if (mainWindow === null) createWindow();
    });
});