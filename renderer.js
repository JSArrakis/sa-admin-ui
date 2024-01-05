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

        document.getElementById('check-title-button').addEventListener('click', async function () {
            let getShowResult = await getShowFromAPI(document.getElementById('show-title').value);
            if (getShowResult[0] !== null) {
                showExists = true;
                document.getElementById('show-tags').disabled = false;
                document.getElementById('show-files-button').disabled = false;
                document.getElementById('localize-remote-files').disabled = false;
                document.getElementById('show-submit-button').innerText = "Update";
                document.getElementById('show-submit-button').disabled = false;
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
                    let episodeObject = { uuid: uuid, filePath: episode.Path, episode: episode.EpisodeNumber };
                    fileDiv.innerHTML = `
                        <div id=${uuid}>
                            <button id=${"button-" + uuid}>X</button>
                            <div>Episode</div>
                            <input class="number-input" type="number" name="episode" value=${episode.EpisodeNumber}>
                            <div>${episode.filePath}</div>
                        </div>`;
                    targetDiv.appendChild(fileDiv);
                    episodeList.push(episodeObject);

                    document.getElementById("button-" + uuid).addEventListener('click', function () {
                        document.getElementById(uuid).remove();
                        episodeList = episodeList.filter((episode) => {
                            return episode.uuid != uuid;
                        });
                    });
                });

            } else if (getShowResult[1] === "Show does not exist") {
                document.getElementById('show-tags').disabled = false;
                document.getElementById('show-files-button').disabled = false;
                document.getElementById('localize-remote-files').disabled = false;
                document.getElementById('show-submit-button').innerText = "Submit";
                document.getElementById('show-submit-button').disabled = false;
            } else {
                document.getElementById('show-page-error').innerText = getShowResult[1];
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

document.getElementById('buffer-button').addEventListener('click', async function () {
    possiblySetProfile();
    console.log('Loading content...');
    try {
        // Use await with fs.promises.readFile to read the file content
        let fileContent = await fs.readFile('./buffer.html', 'utf-8');

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
            let episodeObject = { uuid: uuid, filePath: filePath, episode: 0 };
            fileDiv.innerHTML = `
                <div id=${uuid}>
                    <button id=${"button-" + uuid}>X</button>
                    <div>Episode</div>
                    <input class="number-input" type="number" name="episode">
                    <div>${filePath}</div>
                </div>`;
            targetDiv.appendChild(fileDiv);
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
    console.log('Loading drives...');
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
    if (instanceProfile.host === "" || instanceProfile.port === 0) {
        return [null, "No connection info set in settings"];
    }
    document.getElementById('home-button').disabled = true;
    document.getElementById('shows-button').disabled = true;
    document.getElementById('movies-button').disabled = true;
    document.getElementById('buffer-button').disabled = true;
    document.getElementById('settings-button').disabled = true;
    //make title lowercase, remove spaces, and remove special characters
    let loadTitle = title.toLowerCase().replace(/\s/g, '').replace(/[^\w\s]/gi, '');
    await axios.get('http://' + instanceProfile.host + ':' + instanceProfile.port + '/api/admin/getShow?loadTitle=' + loadTitle)
        .then(response => {
            console.log("RESPONSE")
            if (response.data.message) {
                return [null, response.data.message];
            } else {
                return [response.data, null];
            }
        })
        .catch(error => {
            document.getElementById('show-page-error').innerText = error.message;
        });
    document.getElementById('home-button').disabled = false;
    document.getElementById('shows-button').disabled = false;
    document.getElementById('movies-button').disabled = false;
    document.getElementById('buffer-button').disabled = false;
    document.getElementById('settings-button').disabled = false;

    return [null, null];
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