const { ipcRenderer } = require('electron');

document.getElementById('myButton').addEventListener('click', function () {
    // Send an IPC message to the main process
    console.log('Sending message to main process');
});

document.getElementById('openFileButton').addEventListener('click', function () {
    // Send an IPC message to the main process to open the file dialog
    ipcRenderer.send('open-file-dialog');
});

ipcRenderer.on('selected-file', (event, filePath) => {
    // Handle the selected file path here
    console.log('Selected file:', filePath);
});