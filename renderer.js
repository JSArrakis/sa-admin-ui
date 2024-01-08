const { ipcRenderer } = require('electron');
const fs = require('fs').promises;
const { v4: uuidv4 } = require('uuid');
const axios = require('axios');
const { get } = require('jquery');

let instanceProfile = {
    drives: [], host: "", port: 0
};
let episodeList = [];
let showExists = false;
let localizeShowPaths = false;
let hideShowPaths = false;

document.getElementById('home-button').addEventListener('click', async function () {
    possiblySetProfile();
    console.log('Loading content...');
    try {
        // Use await with fs.promises.readFile to read the file content
        let fileContent = await fs.readFile('./home.html', 'utf-8');

        // Update the main-content div with the loaded content
        document.getElementById('fileContent').innerHTML = fileContent;

        // Log a message to the console
        console.log('Content loaded');

    } catch (err) {
        console.error(err);
    }

});

document.getElementById('shows-button').addEventListener('click', async function () {
    possiblySetProfile();
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

        document.getElementById('show-title').addEventListener('focus', function () {
            document.getElementById('show-title').style.backgroundColor = "";
        });

        document.getElementById('clear-button').addEventListener('click', function () {
            clearfileSelection();
            document.getElementById('show-tags').value = "";
            document.getElementById('show-title').value = "";
            document.getElementById('show-title').disabled = false;
            document.getElementById('show-tags').disabled = true;
            document.getElementById('show-files-button').disabled = true;
            document.getElementById('localize-remote-files').disabled = true;
            document.getElementById('show-submit-button').disabled = true;
            document.getElementById('show-submit-button').innerText = "Submit";
            document.getElementById('show-page-error').innerText = "";
            document.getElementById('show-title').style.backgroundColor = "";
            document.getElementById('clear-button').disabled = true;
        });

        document.getElementById('hide-file-paths').addEventListener('click', function () {
            hideShowPaths = !hideShowPaths;
            if (hideShowPaths) {
                episodeList.forEach((episode) => {
                    document.getElementById('path-' + episode.uuid).innerText = episode.file;
                });
            } else {
                episodeList.forEach((episode) => {
                    document.getElementById('path-' + episode.uuid).innerText = episode.filePath;
                });
            }
        });

        document.getElementById('localize-remote-files').addEventListener('click', function () {
            localizeShowPaths = !localizeShowPaths;
            if (localizeShowPaths) {
                //For each episode, transform the path to a local path
                episodeList.forEach((episode) => {
                    episode = transformPath(episode, instanceProfile.drives);
                    if (episode.basePath === "") {
                        if (hideShowPaths) {
                            document.getElementById("path-" + episode.uuid).innerText = episode.file;
                        } else {
                            document.getElementById("path-" + episode.uuid).innerText = episode.filePath;
                        }

                        document.getElementById('path-group-' + episode.uuid).classList.remove('episode-path-group-no-icon');
                        document.getElementById('path-group-' + episode.uuid).classList.add('episode-path-group')
                        document.getElementById('path-warning-' + episode.uuid).innerText = '\u26A0'

                    } else {
                        if (hideShowPaths) {
                            document.getElementById("path-" + episode.uuid).innerText = episode.file;
                        } else {
                            document.getElementById("path-" + episode.uuid).innerText = episode.filePath;
                        }
                    }
                });
            } else {
                //For each episode, reverse path transformation to the original path
                episodeList.forEach((episode) => {
                    if (episode.basePath === "") {
                        document.getElementById('path-group-' + episode.uuid).classList.remove('episode-path-group');
                        document.getElementById('path-group-' + episode.uuid).classList.add('episode-path-group-no-icon')
                        document.getElementById('path-warning-' + episode.uuid).innerText = ""
                    }
                    episode = reverseTransformPath(episode);
                    if (hideShowPaths) {
                        document.getElementById("path-" + episode.uuid).innerText = episode.file;
                    } else {
                        document.getElementById("path-" + episode.uuid).innerText = episode.filePath;
                    }
                });
            }
        });

        document.getElementById('check-title-button').addEventListener('click', async function () {
            let titleElement = document.getElementById('show-title');
            document.getElementById('show-page-error').innerText = "";
            let title = titleElement.value;
            if (title === "") {
                let showPageError = document.getElementById('show-page-error');
                let warningIcon = document.createElement('div');
                warningIcon.classList.add('warning-icon', 'glow-animation');
                warningIcon.innerHTML = '&#9888;';

                // Set the text content for the warning
                let warningText = document.createTextNode("Title cannot be empty");

                // Insert the warning icon and text into the show-page-error div
                showPageError.appendChild(warningIcon);
                showPageError.appendChild(warningText);
                titleElement.style.backgroundColor = "#ff0000";
                return;
            }
            let getShowResult = await getShowFromAPI(title);
            console.log("GET SHOW RESULT");
            console.log(getShowResult);
            console.log("GET SHOW RESULT");
            if (getShowResult[0] !== null) {
                console.log("SHOW FOUND")
                showExists = true;
                document.getElementById('show-tags').disabled = false;
                document.getElementById('show-files-button').disabled = false;
                document.getElementById('localize-remote-files').disabled = false;
                document.getElementById('hide-file-paths').disabled = false;
                document.getElementById('show-submit-button').innerText = "Update";
                document.getElementById('show-submit-button').disabled = false;
                document.getElementById('clear-button').disabled = false;
                titleElement.value = getShowResult[0].Title;
                titleElement.style.backgroundColor = "#ffff00";
                titleElement.disabled = true;
                //concatenate tags with a comma separator
                let tags = "";
                getShowResult[0].Tags.forEach((tag) => {
                    tags += tag + ", ";
                });
                document.getElementById('show-tags').value = tags;
                //loop through episodes and add them to the list
                let targetDiv = document.getElementById('episodes-selection');
                getShowResult[0].Episodes.forEach((episode) => {
                    let uuid = uuidv4();
                    let fileDiv = document.createElement('div');
                    let episodeObject = { uuid: uuid, filePath: episode.Path, basePath: "", file: separatePath(episode.Path), episode: episode.EpisodeNumber };
                    let transformedEpisode = localizeShowPaths ? transformPath(episodeObject, instanceProfile.drives) : episodeObject;
                    let episodePath = hideShowPaths ? transformedEpisode.file : transformedEpisode.filePath;
                    fileDiv.innerHTML = `
                        <div class="selection-entry micro-padding" id=${uuid}>
                            <div class="remove-button" id=${"button-" + uuid}>&#x2716;</div>
                            <div class="ep-number small-text tiny-horz-padding">Ep.</div>
                            <input id=${"num-" + uuid} class="number-input small-text" type="text" pattern="[0-9]*" name="episode" value=${episode.EpisodeNumber}>
                            <div id=${"path-group-" + uuid} class="episode-path-group-no-icon">
                                <div id=${"path-warning-" + uuid} class="episode-warning" title="Path not transformed from localization"></div>
                                <div id=${"path-" + uuid} class="scrollable-div small-text selected-path-div">${episodePath}</div>
                            </div>
                        </div>`;
                    targetDiv.appendChild(fileDiv);
                    episodeList.push(transformedEpisode);

                    document.getElementById("button-" + uuid).addEventListener('click', function () {
                        document.getElementById(uuid).remove();
                        episodeList = episodeList.filter((episode) => {
                            return episode.uuid != uuid;
                        });
                    });
                });

            } else if (getShowResult[1].response && getShowResult[1].response.status === 404) {
                console.log("SHOW NOT FOUND")
                document.getElementById('show-tags').disabled = false;
                document.getElementById('show-files-button').disabled = false;
                document.getElementById('localize-remote-files').disabled = false;
                document.getElementById('hide-file-paths').disabled = false;
                document.getElementById('show-submit-button').innerText = "Submit";
                document.getElementById('show-submit-button').disabled = false;
                document.getElementById('clear-button').disabled = false;
                titleElement.style.backgroundColor = "#00ff00";
                titleElement.disabled = true;
            } else {
                document.getElementById('check-title-button').disabled = false;
                document.getElementById('show-page-error').innerText = getShowResult[1];
                titleElement.style.backgroundColor = "#ff0000";
            }
        });

        document.getElementById('show-submit-button').addEventListener('click', async function () {



            // if (showExists) {
            //     await axios.put('http://' + instanceProfile.host + ':' + instanceProfile.port + '/api/admin/updateShow', {
            //         //TODO: add show data
            //     })
            //         .then(response => {
            //             document.getElementById('show-tags').disabled = true;
            //             document.getElementById('show-submit-button').innerText = "Submit";
            //             document.getElementById('show-submit-button').disabled = true;
            //             console.log(response);
            //         })
            //         .catch(error => {
            //             document.getElementById('show-page-error').innerText = error.message;
            //         });
            // } else {
            //     await axios.post('http://' + instanceProfile.host + ':' + instanceProfile.port + '/api/admin/createShow', {
            //         //TODO: add show data
            //     })
            //         .then(response => {
            //             document.getElementById('show-tags').disabled = true;
            //             document.getElementById('show-submit-button').innerText = "Submit";
            //             document.getElementById('show-submit-button').disabled = true;
            //             console.log(response);
            //         })
            //         .catch(error => {
            //             document.getElementById('show-page-error').innerText = error.message;
            //         });
            // }
        });

        // Log a message to the console
        console.log('Content loaded');

    } catch (err) {
        console.error(err);
    }

});

document.getElementById('movies-button').addEventListener('click', async function () {
    possiblySetProfile();
    console.log('Loading content...');
    try {
        // Use await with fs.promises.readFile to read the file content
        let fileContent = await fs.readFile('./movie.html', 'utf-8');

        // Update the main-content div with the loaded content
        document.getElementById('fileContent').innerHTML = fileContent;

        // Log a message to the console
        console.log('Content loaded');
    } catch (err) {
        console.error(err);
    }

});

document.getElementById('shorts-button').addEventListener('click', async function () {
    possiblySetProfile();
    console.log('Loading content...');
    try {
        // Use await with fs.promises.readFile to read the file content
        let fileContent = await fs.readFile('./short.html', 'utf-8');

        // Update the main-content div with the loaded content
        document.getElementById('fileContent').innerHTML = fileContent;

        // Log a message to the console
        console.log('Content loaded');
    } catch (err) {
        console.error(err);
    }
});

document.getElementById('music-button').addEventListener('click', async function () {
    possiblySetProfile();
    console.log('Loading content...');
    try {
        // Use await with fs.promises.readFile to read the file content
        let fileContent = await fs.readFile('./music.html', 'utf-8');

        // Update the main-content div with the loaded content
        document.getElementById('fileContent').innerHTML = fileContent;

        // Log a message to the console
        console.log('Content loaded');
    } catch (err) {
        console.error(err);
    }
});

document.getElementById('commercials-button').addEventListener('click', async function () {
    possiblySetProfile();
    console.log('Loading content...');
    try {
        // Use await with fs.promises.readFile to read the file content
        let fileContent = await fs.readFile('./commercial.html', 'utf-8');

        // Update the main-content div with the loaded content
        document.getElementById('fileContent').innerHTML = fileContent;

        // Log a message to the console
        console.log('Content loaded');
    } catch (err) {
        console.error(err);
    }
});

document.getElementById('promos-button').addEventListener('click', async function () {
    possiblySetProfile();
    console.log('Loading content...');
    try {
        // Use await with fs.promises.readFile to read the file content
        let fileContent = await fs.readFile('./promo.html', 'utf-8');

        // Update the main-content div with the loaded content
        document.getElementById('fileContent').innerHTML = fileContent;

        // Log a message to the console
        console.log('Content loaded');
    } catch (err) {
        console.error(err);
    }
});

document.getElementById('collections-button').addEventListener('click', async function () {
    possiblySetProfile();
    console.log('Loading content...');
    try {
        // Use await with fs.promises.readFile to read the file content
        let fileContent = await fs.readFile('./collection.html', 'utf-8');

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

        document.getElementById('sa-host').value = instanceProfile.host;
        document.getElementById('sa-port').value = instanceProfile.port;
        document.getElementById('set-connection-info').addEventListener('click', async function () {
            instanceProfile.host = document.getElementById('sa-host').value;
            instanceProfile.port = document.getElementById('sa-port').value;
            await fs.writeFile('./profile.json', JSON.stringify(instanceProfile), function (err) {
                if (err) throw err;
                console.log('Saved!');
            });
        });

        document.getElementById('remote-drive-button').addEventListener('click', function () {
            // Send an IPC message to the main process to open the file dialog
            ipcRenderer.send('open-drive-dialog');
        });

        let driveSelection = document.getElementById("remote-drive-selection");
        instanceProfile.drives.forEach((drive) => {
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
        });

        // Log a message to the console
        console.log('Content loaded');
    } catch (err) {
        console.error(err);
    }
}); 1

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
    let fileContent = await fs.readFile('./profile.json', 'utf-8');

    // Parse the JSON content
    instanceProfile = JSON.parse(fileContent);
});

ipcRenderer.on('load-home', async (event) => {
    let fileContent = await fs.readFile('./home.html', 'utf-8');

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

async function getShowFromAPI(title) {
    let show = null;
    let error = null;

    if (instanceProfile.host === "" || instanceProfile.port === 0) {
        return [null, "No connection info set in settings"];
    }
    document.getElementById('home-button').disabled = true;
    document.getElementById('shows-button').disabled = true;
    document.getElementById('movies-button').disabled = true;
    document.getElementById('shorts-button').disabled = true;
    document.getElementById('music-button').disabled = true;
    document.getElementById('commercials-button').disabled = true;
    document.getElementById('promos-button').disabled = true;
    document.getElementById('collections-button').disabled = true;
    document.getElementById('settings-button').disabled = true;
    document.getElementById('check-title-button').disabled = true;
    //make title lowercase, remove spaces, and remove special characters
    let loadTitle = title.toLowerCase().replace(/\s/g, '').replace(/[^\w\s]/gi, '');
    let requestPath = 'http://' + instanceProfile.host + ':' + instanceProfile.port + '/api/admin/getShow?loadTitle=' + loadTitle;
    await axios.get(requestPath)
        .then(response => {
            show = response.data;
        })
        .catch(err => {
            error = err;
        });
    document.getElementById('home-button').disabled = false;
    document.getElementById('shows-button').disabled = false;
    document.getElementById('movies-button').disabled = false;
    document.getElementById('shorts-button').disabled = false;
    document.getElementById('music-button').disabled = true;
    document.getElementById('commercials-button').disabled = false;
    document.getElementById('promos-button').disabled = false;
    document.getElementById('collections-button').disabled = false;
    document.getElementById('settings-button').disabled = false;
    return [show, error];
}

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