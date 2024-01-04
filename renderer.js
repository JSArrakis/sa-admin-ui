const { ipcRenderer } = require('electron');
const fs = require('fs').promises;
const rfs = require('fs');

let driveList = [];

document.getElementById('shows-button').addEventListener('click', async function () {
    console.log('Loading content...');
    try {
        // Use await with fs.promises.readFile to read the file content
        let fileContent = await fs.readFile('./show.html', 'utf-8');

        // Update the main-content div with the loaded content
        document.getElementById('fileContent').innerHTML = fileContent;

        document.getElementById('show-files-button').addEventListener('click', function () {
            // Send an IPC message to the main process to open the file dialog
            ipcRenderer.send('open-file-dialog');
        });

        // Log a message to the console
        console.log('Content loaded');

    } catch (err) {
        console.error(err);
    }

});

document.getElementById('movies-button').addEventListener('click', async function () {
    console.log('Loading content...');
    try {
        // Use await with fs.promises.readFile to read the file content
        let fileContent = await fs.readFile('./test.html', 'utf-8');

        // Update the main-content div with the loaded content
        document.getElementById('fileContent').innerHTML = fileContent;

        // Log a message to the console
        console.log('Content loaded');
    } catch (err) {
        console.error(err);
    }

});

document.getElementById('buffer-button').addEventListener('click', async function () {
    console.log('Loading content...');
    try {
        // Use await with fs.promises.readFile to read the file content
        let fileContent = await fs.readFile('./test.html', 'utf-8');

        // Update the main-content div with the loaded content
        document.getElementById('fileContent').innerHTML = fileContent;

        // Log a message to the console
        console.log('Content loaded');
    } catch (err) {
        console.error(err);
    }
});

document.getElementById('settings-button').addEventListener('click', async function () {
    console.log('Loading content...');
    try {
        // Use await with fs.promises.readFile to read the file content
        let fileContent = await fs.readFile('./settings.html', 'utf-8');

        // Update the main-content div with the loaded content
        document.getElementById('fileContent').innerHTML = fileContent;

        document.getElementById('remote-drive-button').addEventListener('click', function () {
            // Send an IPC message to the main process to open the file dialog
            ipcRenderer.send('open-drive-dialog');
        });

        // Log a message to the console
        console.log('Content loaded');
    } catch (err) {
        console.error(err);
    }
}); 1

ipcRenderer.on('selected-files', (event, filePaths) => {
    let targetDiv = document.getElementById('episodes-selection');
    filePaths.forEach((filePath) => {
        console.log(filePath);
        let fileDiv = document.createElement('div');
        fileDiv.innerHTML = `
                <div><div>Episode</div><input class="number-input" type="number" name="episode">
                <div>${filePath}</div></div>
            `;
        targetDiv.appendChild(fileDiv);
    });
});

ipcRenderer.on('load-drives', async (event) => {
    console.log('Loading drives...');
    let fileContent = await fs.readFile('./driveFile.json', 'utf-8');

    // Parse the JSON content
    let parsedContent = JSON.parse(fileContent);
    driveList = parsedContent.drives;
    // fs.writeFileSync('data.json', JSON.stringify({ key: 'value' }));
});

ipcRenderer.on('selected-drive', (event, filePath) => {
    let targetDiv = document.getElementById('remote-drive-selection');
    console.log(filePath);
    let fileDiv = document.createElement('div');
    fileDiv.innerHTML = `
                <div>${filePath}</div>
            `;
    targetDiv.appendChild(fileDiv);
});