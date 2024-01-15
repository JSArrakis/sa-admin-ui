const { ipcRenderer, ipcMain } = require('electron');
const fs = require('fs').promises;
const { v4: uuidv4 } = require('uuid');
const axios = require('axios');

let instanceProfile = {
    drives: [], host: "", port: 0
};

let showName = "";
let showTags = "";
let episodeList = [];
let movieList = [];
let shortList = [];
let musicList = [];
let commercialList = [];
let promoList = [];

let localizeShowPaths = false;
let localizeMoviePaths = false;
let localizeShortPaths = false;
let localizeMusicPaths = false;
let localizeCommercialPaths = false;
let localizePromoPaths = false;

let hideShowPaths = false;
let hideMoviePaths = false;
let hideShortPaths = false;
let hideMusicPaths = false;
let hideCommercialPaths = false;
let hidePromoPaths = false;

ipcRenderer.on('selected-episodes', (event, filePaths) => {
    displayEpisodes(filePaths);
});

ipcRenderer.on('selected-movies', (event, filePaths) => {
    displayMovies(filePaths);
});

ipcRenderer.on('selected-shorts', (event, filePaths) => {
    displayShorts(filePaths);
});

ipcRenderer.on('selected-music', (event, filePaths) => {
    displayMusic(filePaths)
});

ipcRenderer.on('selected-commercials', (event, filePaths) => {
    displayCommercials(filePaths)
});

ipcRenderer.on('selected-promos', (event, filePaths) => {
    displayPromos(filePaths)
});

ipcRenderer.on('load-profile', async (event) => {
    let fileContent = await fs.readFile('./data/profile.json', 'utf-8');

    // Parse the JSON content
    instanceProfile = JSON.parse(fileContent);
});

ipcRenderer.on('load-home', async (event) => {
    let fileContent = await fs.readFile('./src/home/home.html', 'utf-8');

    // Update the main-content div with the loaded content
    document.getElementById('fileContent').innerHTML = fileContent;
});

ipcRenderer.on('selected-drive', async (event, drive) => {
    instanceProfile.drives.push(drive);
    let driveSelection = document.getElementById('remote-drive-selection');
    let fileDiv = document.createElement('div');
    let uuid = uuidv4();
    fileDiv.innerHTML = `
                <div id=${uuid}><button id=${"button-" + uuid}>X</button><div>${drive}</div></div>
            `;
    driveSelection.appendChild(fileDiv);
    document.getElementById("button-" + uuid).addEventListener('click', async function () {
        document.getElementById(uuid).remove();
        instanceProfile.drives = instanceProfile.drives.filter((drive) => {
            return drive != drive;
        });
        await fs.writeFile('./profile.json', JSON.stringify(instanceProfile), function (err) {
            if (err) throw err;
            console.log('Saved!');
        });
    });
    await fs.writeFile('./profile.json', JSON.stringify(instanceProfile), function (err) {
        if (err) throw err;
        console.log('Saved!');
    });
});

function separatePath(path) {
    let pathArray = path.split("\\");
    let fileName = pathArray.pop();
    return fileName;
}

function createAndSendBuffers() {

}