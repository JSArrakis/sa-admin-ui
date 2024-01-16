document.getElementById('shorts-button').addEventListener('click', async function () {
    console.log('Loading content...');
    try {
        // Use await with fs.promises.readFile to read the file content
        let fileContent = await fs.readFile('./src/short/short.html', 'utf-8');

        // Update the main-content div with the loaded content
        document.getElementById('fileContent').innerHTML = fileContent;

        document.getElementById('localize-remote-files').addEventListener('click', function () {
            localizeShortPaths = !localizeShortPaths;
            if (localizeShortPaths) {
                //For each short, transform the path to a local path
                shortList.forEach((short) => {
                    short = transformShortPath(short, instanceProfile.drives);
                    if (short.basePath === "") {
                        if (hideShortPaths) {
                            document.getElementById("path-" + short.uuid).innerText = short.file;
                        } else {
                            document.getElementById("path-" + short.uuid).innerText = short.filePath;
                        }

                        document.getElementById('path-group-' + short.uuid).classList.remove('path-group-no-icon');
                        document.getElementById('path-group-' + short.uuid).classList.add('path-group')
                        document.getElementById('path-warning-' + short.uuid).innerText = '\u26A0'

                    } else {
                        if (hideShortPaths) {
                            document.getElementById("path-" + short.uuid).innerText = short.file;
                        } else {
                            document.getElementById("path-" + short.uuid).innerText = short.filePath;
                        }
                    }
                });
            } else {
                //For each episode, reverse path transformation to the original path
                shortList.forEach((short) => {
                    if (short.basePath === "") {
                        document.getElementById('path-group-' + short.uuid).classList.remove('path-group');
                        document.getElementById('path-group-' + short.uuid).classList.add('path-group-no-icon')
                        document.getElementById('path-warning-' + short.uuid).innerText = ""
                    }
                    short = reverseShortTransformPath(short);
                    if (hideShortPaths) {
                        document.getElementById("path-" + short.uuid).innerText = short.file;
                    } else {
                        document.getElementById("path-" + short.uuid).innerText = short.filePath;
                    }
                });
            }
        });

        document.getElementById('hide-file-paths').addEventListener('click', function () {
            hideShortPaths = !hideShortPaths;
            if (hideShortPaths) {
                shortList.forEach((short) => {
                    document.getElementById('path-' + short.uuid).innerText = short.file;
                });
            } else {
                shortList.forEach((short) => {
                    document.getElementById('path-' + short.uuid).innerText = short.filePath;
                });
            }
        });

        document.getElementById('shorts-clear-button').addEventListener('click', function () {
            clearShortSelection();
            document.getElementById('localize-remote-files').disabled = true;
            document.getElementById('short-submit-button').disabled = true;
            document.getElementById('short-page-error').innerText = "";
            document.getElementById('shorts-clear-button').disabled = true;
        });

        document.getElementById('short-files-button').addEventListener('click', function () {
            // Send an IPC message to the main process to open the file dialog
            ipcRenderer.send('open-shorts-dialog');
        });

        // Log a message to the console
        console.log('Content loaded');
    } catch (err) {
        console.error(err);
    }
});

async function clearShortSelection() {
    shortList = [];
    document.getElementById('short-selection').innerHTML = "";
    if (localizeShortPaths) {
        document.getElementById('localize-remote-files').click();
    }
    document.getElementById('localize-remote-files').disabled = true;
    if (hideShortPaths) {
        document.getElementById('hide-file-paths').click();
    }
    document.getElementById('hide-file-paths').disabled = true;
    document.getElementById('short-page-error').innerText = "";
}


function transformShortPath(short, basePathArray) {
    let transformedShort = short

    // Iterate through the base paths and check if the inputPath starts with any of them
    for (const basePath of basePathArray) {
        if (short.filePath.startsWith(basePath)) {
            // Replace the matching part with the corresponding drive letter
            transformedShort.filePath = short.filePath.replace(basePath, `${basePath.slice(-1)}:`.toUpperCase());
            transformedShort.basePath = basePath;
            break;
        }
    }

    return transformedShort;
}

function reverseShortTransformPath(short) {
    let unTransformedShort = short;
    // Remove the drive letter and replace it with the original base path
    if (short.basePath === "") {
        return unTransformedShort;
    }
    unTransformedShort.filePath = short.filePath.replace(/^[a-zA-Z]:/, short.basePath);
    unTransformedShort.basePath = "";

    return unTransformedShort;
}

function displayShorts(filePaths) {
    let targetDiv = document.getElementById('short-selection');

    document.getElementById('localize-remote-files').disabled = false;
    document.getElementById('hide-file-paths').disabled = false;
    document.getElementById('shorts-clear-button').disabled = false;
    document.getElementById('short-submit-button').disabled = false;

    filePaths.forEach((filePath) => {
        if (shortList.filter((short) => { return short.filePath === filePath }).length === 0) {
            let uuid = uuidv4();
            let fileDiv = document.createElement('div');
            let shortObject = { uuid: uuid, filePath: filePath, basePath: "", file: separatePath(filePath), title: "", tags: "" };

            shortObject = localizeShortPaths ? transformPath(shortObject, instanceProfile.drives) : shortObject;
            let shortPath = hideShortPaths ? shortObject.file : shortObject.filePath;
            fileDiv.innerHTML = `
                        <div>
                            <div class="buffer-selection-entry micro-padding" id=${uuid}>
                                <div class="remove-button" id="button-${uuid}">&#x2716;</div>
                                <input id="title-${uuid}" class="media-input small-text" type="text" placeholder="Tags">
                                <div id="path-group-${uuid}" class="path-group-no-icon">
                                    <div id="path-warning-${uuid}" class="path-transform-warning" title="Path not transformed from localization">
                                    </div>
                                    <div id="path-${uuid}" class="scrollable-div small-text selected-path-div">${shortPath}</div>
                                </div>
                            </div>
                        </div>`;
            targetDiv.appendChild(fileDiv);
            if (localizeShortPaths && shortObject.basePath === "") {
                document.getElementById('path-group-' + uuid).classList.remove('path-group-no-icon');
                document.getElementById('path-group-' + uuid).classList.add('path-group')
                document.getElementById('path-warning-' + uuid).innerText = '\u26A0'
            }

            shortList.push(shortObject);

            document.getElementById("button-" + uuid).addEventListener('click', function () {
                document.getElementById(uuid).remove();
                shortList = shortList.filter((short) => {
                    return short.uuid != uuid;
                });
            });
        }
    });
}