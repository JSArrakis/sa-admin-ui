const { ipcRenderer } = require('electron');
const fs = require('fs').promises;
const { v4: uuidv4 } = require('uuid');
const axios = require('axios');
const { get } = require('jquery');

let instanceProfile = {
    drives: [], host: "", port: 0
};
let episodeList = [];
let localizeShowPaths = false;
let hideShowPaths = false;

ipcRenderer.on('selected-episodes', (event, filePaths) => {
    let targetDiv = document.getElementById('episodes-selection');
    filePaths.forEach((filePath) => {
        if (episodeList.filter((episode) => { return episode.filePath === filePath }).length === 0) {
            let uuid = uuidv4();
            let fileDiv = document.createElement('div');
            let episodeObject = { uuid: uuid, filePath: filePath, basePath: "", file: separatePath(filePath), episode: 0 };
            episodeObject = localizeShowPaths ? transformPath(episodeObject, instanceProfile.drives) : episodeObject;
            let episodePath = hideShowPaths ? episodeObject.file : episodeObject.filePath;
            fileDiv.innerHTML = `
                        <div class="selection-entry micro-padding" id=${uuid}>
                            <div class="remove-button" id=${"button-" + uuid}>&#x2716;</div>
                            <div class="ep-number small-text tiny-horz-padding">Ep.</div>
                            <input id=${"num-" + uuid} class="number-input small-text" type="text" pattern="[0-9]*" name="episode" value=0>
                            <div id=${"path-group-" + uuid} class="episode-path-group-no-icon">
                                <div id=${"path-warning-" + uuid} class="episode-warning" title="Path not transformed from localization"></div>
                                <div id=${"path-" + uuid} class="scrollable-div small-text selected-path-div">${episodePath}</div>
                            </div>
                        </div>`;
            targetDiv.appendChild(fileDiv);
            if (localizeShowPaths && episodeObject.basePath === "") {
                document.getElementById('path-group-' + uuid).classList.remove('episode-path-group-no-icon');
                document.getElementById('path-group-' + uuid).classList.add('episode-path-group')
                document.getElementById('path-warning-' + uuid).innerText = '\u26A0'
            }

            episodeList.push(episodeObject);

            document.getElementById("button-" + uuid).addEventListener('click', function () {
                document.getElementById(uuid).remove();
                episodeList = episodeList.filter((episode) => {
                    return episode.uuid != uuid;
                });
            });
        }
    });
});

ipcRenderer.on('load-profile', async (event) => {
    console.log('Loading profile...');
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

async function possiblySetProfile() {
    let host = document.getElementById('sa-host');
    if (host !== null && host.value !== "") {
        instanceProfile.host = host.value;
        instanceProfile.port = document.getElementById('sa-port').value;
        await fs.writeFile('./profile.json', JSON.stringify(instanceProfile), function (err) {
            if (err) throw err;
            console.log('Saved!');
        });
    }
}

async function clearfileSelection() {
    episodeList = [];
    document.getElementById('episodes-selection').innerHTML = "";
    if (localizeShowPaths) {
        document.getElementById('localize-remote-files').click();
    }
    document.getElementById('localize-remote-files').disabled = true;
    if (hideShowPaths) {
        document.getElementById('hide-file-paths').click();
    }
    document.getElementById('hide-file-paths').disabled = true;
    document.getElementById('check-title-button').disabled = false;
    document.getElementById('show-page-error').innerText = "";
}

function transformPath(episode, basePathArray) {
    let transformedEpisode = episode

    // Iterate through the base paths and check if the inputPath starts with any of them
    for (const basePath of basePathArray) {
        if (episode.filePath.startsWith(basePath)) {
            // Replace the matching part with the corresponding drive letter
            transformedEpisode.filePath = episode.filePath.replace(basePath, `${basePath.slice(-1)}:`.toUpperCase());
            transformedEpisode.basePath = basePath;
            break;
        }
    }

    return transformedEpisode;
}

function reverseTransformPath(episode) {
    unTransformedEpisode = episode;
    // Remove the drive letter and replace it with the original base path
    if (episode.basePath === "") {
        return unTransformedEpisode;
    }
    unTransformedEpisode.filePath = episode.filePath.replace(/^[a-zA-Z]:/, episode.basePath);
    unTransformedEpisode.basePath = "";

    return unTransformedEpisode;
}

function separatePath(path) {
    let pathArray = path.split("\\");
    let fileName = pathArray.pop();
    return fileName;
}