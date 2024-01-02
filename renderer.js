const { ipcRenderer } = require('electron');
const fs = require('fs').promises;

document.getElementById('myButton').addEventListener('click', async function () {
    let filePath = './test.html';
    console.log('Loading content...');
    try {
        // Use await with fs.promises.readFile to read the file content
        let fileContent = await fs.readFile(filePath, 'utf-8');

        // Update the main-content div with the loaded content
        document.getElementById('fileContent').innerHTML = fileContent;

        // Log a message to the console
        console.log('Content loaded');
    } catch (err) {
        console.error(err);
    }

});

document.getElementById('openFileButton').addEventListener('click', function () {
    // Send an IPC message to the main process to open the file dialog
    ipcRenderer.send('open-file-dialog');
});

ipcRenderer.on('selected-file', (event, filePath) => {
    // Handle the selected file path here
    console.log('Selected file:', filePath);
});