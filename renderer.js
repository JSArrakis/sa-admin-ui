const { ipcRenderer } = require('electron');
const fs = require('fs').promises;

document.getElementById('shows-button').addEventListener('click', async function () {
    console.log('Loading content...');
    try {
        // Use await with fs.promises.readFile to read the file content
        let fileContent = await fs.readFile('./show.html', 'utf-8');

        // Update the main-content div with the loaded content
        document.getElementById('fileContent').innerHTML = fileContent;

        // Log a message to the console
        console.log('Content loaded');
    } catch (err) {
        console.error(err);
    }

    document.getElementById('showsFileButton').addEventListener('click', function () {
        // Send an IPC message to the main process to open the file dialog
        ipcRenderer.send('open-file-dialog');
    });

});

// document.getElementById('movies-button').addEventListener('click', async function () {
//     console.log('Loading content...');
//     try {
//         // Use await with fs.promises.readFile to read the file content
//         let fileContent = await fs.readFile('./test.html', 'utf-8');

//         // Update the main-content div with the loaded content
//         document.getElementById('fileContent').innerHTML = fileContent;

//         // Log a message to the console
//         console.log('Content loaded');
//     } catch (err) {
//         console.error(err);
//     }

// });

// document.getElementById('buffer-button').addEventListener('click', async function () {
//     console.log('Loading content...');
//     try {
//         // Use await with fs.promises.readFile to read the file content
//         let fileContent = await fs.readFile('./test.html', 'utf-8');

//         // Update the main-content div with the loaded content
//         document.getElementById('fileContent').innerHTML = fileContent;

//         // Log a message to the console
//         console.log('Content loaded');
//     } catch (err) {
//         console.error(err);
//     }

// });

// document.getElementById('showsFileButton').addEventListener('click', function () {
//     // Send an IPC message to the main process to open the file dialog
//     ipcRenderer.send('open-file-dialog');
// });

ipcRenderer.on('selected-files', (event, filePaths) => {
    let targetDiv = document.getElementById('episodes-selection');
    filePaths.forEach((filePath) => {
        console.log(filePath);
        let fileDiv = document.createElement('div');
        fileDiv.innerHTML = filePath;
        targetDiv.appendChild(fileDiv);
    });
});