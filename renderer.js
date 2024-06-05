const { ipcRenderer, ipcMain } = require('electron');
const fs = require('fs').promises;
const { v4: uuidv4 } = require('uuid');
const axios = require('axios');

let instanceProfile = {
    drives: [], host: "", port: 0
};

let showExists = false;

let showName = "";
let showTags = "";
let episodeList = [];
let showManagementList = [];
let showManagementCheckTime = 0;
let showManagementSearched = false;
let movieList = [];
let movieManagementList = [];
let movieManagementCheckTime = 0;
let movieManagementSearched = false;
let shortList = [];
let shortManagementList = [];
let shortManagementCheckTime = 0;
let shortManagementSearched = false;
let musicList = [];
let musicManagementList = [];
let musicManagementCheckTime = 0;
let musicManagementSearched = false;
let commercialList = [];
let commercialManagementList = [];
let commercialManagementCheckTime = 0;
let commercialManagementSearched = false;
let promoList = [];
let promoManagementList = [];
let promoManagementCheckTime = 0;
let promoManagementSearched = false;

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

function createTagArray(tagString) {
    let tagArray = [];
    let tags = tagString.split(',');
    tags.forEach((tag) => {
        tagArray.push(tag.trim());
    });
    return tagArray;
}

function createAndSendBuffers() {

}

async function displayError(message, type) {
    let pageError = document.getElementById(type + '-page-error');
    pageError.style.color = 'red';
    let warningIcon = document.createElement('div');
    warningIcon.classList.add('warning-icon', 'glow-animation');
    warningIcon.innerHTML = '&#9888;';

    // Set the text content for the warning
    let warningText = document.createTextNode(message);

    // Insert the warning icon and text into the show-page-error div
    pageError.appendChild(warningIcon);
    pageError.appendChild(warningText);
}

async function displaySuccess(message, type) {
    let pageError = document.getElementById(type + '-page-error');
    pageError.innerHTML = '';
    pageError.style.color = 'green';
    let successIcon = document.createElement('div');
    successIcon.classList.add('success-icon', 'glow-animation');
    successIcon.innerHTML = '&#10004;';

    // Set the text content for the warning
    let successText = document.createTextNode(message);

    // Insert the warning icon and text into the show-page-error div
    pageError.appendChild(successIcon);
    pageError.appendChild(successText);
}

function toggleError(uuid) {
    var example = document.getElementById("error-message-" + uuid);
    example.classList.toggle('toggle-error-message');
}

function getCurrentUnixTime() {
    return Math.floor(Date.now() / 1000);
}