document.getElementById('commercials-button').addEventListener('click', async function () {
    console.log('Loading content...');
    try {
        // Use await with fs.promises.readFile to read the file content
        let fileContent = await fs.readFile('./src/commercial/commercial.html', 'utf-8');

        // Update the main-content div with the loaded content
        document.getElementById('fileContent').innerHTML = fileContent;

        document.getElementById('localize-remote-files').addEventListener('click', function () {
            localizeCommercialPaths = !localizeCommercialPaths;
            if (localizeCommercialPaths) {
                //For each commercial, transform the path to a local path
                commercialList.forEach((commercial) => {
                    commercial = transformCommercialPath(commercial, instanceProfile.drives);
                    if (commercial.basePath === "") {
                        if (hideCommercialPaths) {
                            document.getElementById("path-" + commercial.uuid).innerText = commercial.file;
                        } else {
                            document.getElementById("path-" + commercial.uuid).innerText = commercial.filePath;
                        }

                        document.getElementById('path-group-' + commercial.uuid).classList.remove('path-group-no-icon');
                        document.getElementById('path-group-' + commercial.uuid).classList.add('path-group')
                        document.getElementById('path-warning-' + commercial.uuid).innerText = '\u26A0'

                    } else {
                        if (hideCommercialPaths) {
                            document.getElementById("path-" + commercial.uuid).innerText = commercial.file;
                        } else {
                            document.getElementById("path-" + commercial.uuid).innerText = commercial.filePath;
                        }
                    }
                });
            } else {
                //For each episode, reverse path transformation to the original path
                commercialList.forEach((commercial) => {
                    if (commercial.basePath === "") {
                        document.getElementById('path-group-' + commercial.uuid).classList.remove('path-group');
                        document.getElementById('path-group-' + commercial.uuid).classList.add('path-group-no-icon')
                        document.getElementById('path-warning-' + commercial.uuid).innerText = ""
                    }
                    commercial = reverseCommercialTransformPath(commercial);
                    if (hideCommercialPaths) {
                        document.getElementById("path-" + commercial.uuid).innerText = commercial.file;
                    } else {
                        document.getElementById("path-" + commercial.uuid).innerText = commercial.filePath;
                    }
                });
            }
        });

        document.getElementById('hide-file-paths').addEventListener('click', function () {
            hideCommercialPaths = !hideCommercialPaths;
            if (hideCommercialPaths) {
                commercialList.forEach((commercial) => {
                    document.getElementById('path-' + commercial.uuid).innerText = commercial.file;
                });
            } else {
                commercialList.forEach((commercial) => {
                    document.getElementById('path-' + commercial.uuid).innerText = commercial.filePath;
                });
            }
        });

        document.getElementById('commercial-clear-button').addEventListener('click', function () {
            clearCommercialSelection();
            document.getElementById('localize-remote-files').disabled = true;
            document.getElementById('commercial-submit-button').disabled = true;
            document.getElementById('commercial-page-error').innerText = "";
            document.getElementById('commercial-clear-button').disabled = true;
        });

        document.getElementById('commercial-files-button').addEventListener('click', function () {
            // Send an IPC message to the main process to open the file dialog
            ipcRenderer.send('open-commercials-dialog');
        });

        // Log a message to the console
        console.log('Content loaded');
    } catch (err) {
        console.error(err);
    }
});

async function clearCommercialSelection() {
    commercialList = [];
    document.getElementById('commercial-selection').innerHTML = "";
    if (localizeCommercialPaths) {
        document.getElementById('localize-remote-files').click();
    }
    document.getElementById('localize-remote-files').disabled = true;
    if (hideCommercialPaths) {
        document.getElementById('hide-file-paths').click();
    }
    document.getElementById('hide-file-paths').disabled = true;
    document.getElementById('commercial-page-error').innerText = "";
}


function transformCommercialPath(commercial, basePathArray) {
    let transformedCommercial = commercial

    // Iterate through the base paths and check if the inputPath starts with any of them
    for (const basePath of basePathArray) {
        if (commercial.filePath.startsWith(basePath)) {
            // Replace the matching part with the corresponding drive letter
            transformedCommercial.filePath = commercial.filePath.replace(basePath, `${basePath.slice(-1)}:`.toUpperCase());
            transformedCommercial.basePath = basePath;
            break;
        }
    }

    return transformedCommercial;
}

function reverseCommercialTransformPath(commercial) {
    let unTransformedCommercial = commercial;
    // Remove the drive letter and replace it with the original base path
    if (commercial.basePath === "") {
        return unTransformedCommercial;
    }
    unTransformedCommercial.filePath = commercial.filePath.replace(/^[a-zA-Z]:/, commercial.basePath);
    unTransformedCommercial.basePath = "";

    return unTransformedCommercial;
}

function displayCommercials(filePaths) {
    let targetDiv = document.getElementById('commercial-selection');

    document.getElementById('localize-remote-files').disabled = false;
    document.getElementById('hide-file-paths').disabled = false;
    document.getElementById('commercial-clear-button').disabled = false;
    document.getElementById('commercial-submit-button').disabled = false;

    filePaths.forEach((filePath) => {
        if (commercialList.filter((commercial) => { return commercial.filePath === filePath }).length === 0) {
            let uuid = uuidv4();
            let fileDiv = document.createElement('div');
            let commercialObject = { uuid: uuid, filePath: filePath, basePath: "", file: separatePath(filePath), title: "", tags: "" };

            commercialObject = localizeCommercialPaths ? transformPath(commercialObject, instanceProfile.drives) : commercialObject;
            let commercialPath = hideCommercialPaths ? commercialObject.file : commercialObject.filePath;
            fileDiv.innerHTML = `
                        <div>
                            <div class="buffer-selection-entry micro-padding" id=${uuid}>
                                <div class="remove-button" id="button-${uuid}">&#x2716;</div>
                                <input id="title-${uuid}" class="media-input small-text" type="text" placeholder="Tags">
                                <div id="path-group-${uuid}" class="path-group-no-icon">
                                    <div id="path-warning-${uuid}" class="episode-warning" title="Path not transformed from localization">
                                    </div>
                                    <div id="path-${uuid}" class="scrollable-div small-text selected-path-div">${shortPath}</div>
                                </div>
                            </div>
                        </div>`;
            targetDiv.appendChild(fileDiv);
            if (localizeCommercialPaths && commercialObject.basePath === "") {
                document.getElementById('path-group-' + uuid).classList.remove('path-group-no-icon');
                document.getElementById('path-group-' + uuid).classList.add('path-group')
                document.getElementById('path-warning-' + uuid).innerText = '\u26A0'
            }

            commercialList.push(commercialObject);

            document.getElementById("button-" + uuid).addEventListener('click', function () {
                document.getElementById(uuid).remove();
                commercialList = commercialList.filter((commercial) => {
                    return commercial.uuid != uuid;
                });
            });
        }
    });
}