document.getElementById('promos-button').addEventListener('click', async function () {
    console.log('Loading content...');
    try {
        // Use await with fs.promises.readFile to read the file content
        let fileContent = await fs.readFile('./src/promo/promo.html', 'utf-8');

        // Update the main-content div with the loaded content
        document.getElementById('fileContent').innerHTML = fileContent;

        document.getElementById('localize-remote-files').addEventListener('click', function () {
            localizePromoPaths = !localizePromoPaths;
            if (localizePromoPaths) {
                //For each promo, transform the path to a local path
                promoList.forEach((promo) => {
                    promo = transformPromoPath(promo, instanceProfile.drives);
                    if (promo.basePath === "") {
                        if (hidePromoPaths) {
                            document.getElementById("path-" + promo.uuid).innerText = promo.file;
                        } else {
                            document.getElementById("path-" + promo.uuid).innerText = promo.filePath;
                        }

                        document.getElementById('path-group-' + promo.uuid).classList.remove('path-group-no-icon');
                        document.getElementById('path-group-' + promo.uuid).classList.add('path-group')
                        document.getElementById('path-warning-' + promo.uuid).innerText = '\u26A0'

                    } else {
                        if (hidePromoPaths) {
                            document.getElementById("path-" + promo.uuid).innerText = promo.file;
                        } else {
                            document.getElementById("path-" + promo.uuid).innerText = promo.filePath;
                        }
                    }
                });
            } else {
                //For each episode, reverse path transformation to the original path
                promoList.forEach((promo) => {
                    if (promo.basePath === "") {
                        document.getElementById('path-group-' + promo.uuid).classList.remove('path-group');
                        document.getElementById('path-group-' + promo.uuid).classList.add('path-group-no-icon')
                        document.getElementById('path-warning-' + promo.uuid).innerText = ""
                    }
                    promo = reversePromoTransformPath(promo);
                    if (hidePromoPaths) {
                        document.getElementById("path-" + promo.uuid).innerText = promo.file;
                    } else {
                        document.getElementById("path-" + promo.uuid).innerText = promo.filePath;
                    }
                });
            }
        });

        document.getElementById('hide-file-paths').addEventListener('click', function () {
            hidePromoPaths = !hidePromoPaths;
            if (hidePromoPaths) {
                promoList.forEach((promo) => {
                    document.getElementById('path-' + promo.uuid).innerText = promo.file;
                });
            } else {
                promoList.forEach((promo) => {
                    document.getElementById('path-' + promo.uuid).innerText = promo.filePath;
                });
            }
        });

        document.getElementById('promo-clear-button').addEventListener('click', function () {
            clearPromoSelection();
            document.getElementById('localize-remote-files').disabled = true;
            document.getElementById('promo-submit-button').disabled = true;
            document.getElementById('promo-page-error').innerText = "";
            document.getElementById('promo-clear-button').disabled = true;
        });

        document.getElementById('promo-files-button').addEventListener('click', function () {
            // Send an IPC message to the main process to open the file dialog
            ipcRenderer.send('open-promos-dialog');
        });

        // Log a message to the console
        console.log('Content loaded');
    } catch (err) {
        console.error(err);
    }
});

async function clearPromoSelection() {
    promoList = [];
    document.getElementById('promo-selection').innerHTML = "";
    if (localizePromoPaths) {
        document.getElementById('localize-remote-files').click();
    }
    document.getElementById('localize-remote-files').disabled = true;
    if (hidePromoPaths) {
        document.getElementById('hide-file-paths').click();
    }
    document.getElementById('hide-file-paths').disabled = true;
    document.getElementById('promo-page-error').innerText = "";
}


function transformPromoPath(promo, basePathArray) {
    let transformedPromo = promo

    // Iterate through the base paths and check if the inputPath starts with any of them
    for (const basePath of basePathArray) {
        if (promo.filePath.startsWith(basePath)) {
            // Replace the matching part with the corresponding drive letter
            transformedPromo.filePath = promo.filePath.replace(basePath, `${basePath.slice(-1)}:`.toUpperCase());
            transformedPromo.basePath = basePath;
            break;
        }
    }

    return transformedPromo;
}

function reversePromoTransformPath(promo) {
    let unTransformedPromo = promo;
    // Remove the drive letter and replace it with the original base path
    if (promo.basePath === "") {
        return unTransformedPromo;
    }
    unTransformedPromo.filePath = promo.filePath.replace(/^[a-zA-Z]:/, promo.basePath);
    unTransformedPromo.basePath = "";

    return unTransformedPromo;
}

function displayPromos(filePaths) {
    let targetDiv = document.getElementById('promo-selection');

    document.getElementById('localize-remote-files').disabled = false;
    document.getElementById('hide-file-paths').disabled = false;
    document.getElementById('promo-clear-button').disabled = false;
    document.getElementById('promo-submit-button').disabled = false;

    filePaths.forEach((filePath) => {
        if (promoList.filter((promo) => { return promo.filePath === filePath }).length === 0) {
            let uuid = uuidv4();
            let fileDiv = document.createElement('div');
            let promoObject = { uuid: uuid, filePath: filePath, basePath: "", file: separatePath(filePath), title: "", tags: "", type: "P" };

            promoObject = localizePromoPaths ? transformPromoPath(promoObject, instanceProfile.drives) : promoObject;
            let promoPath = hidePromoPaths ? promoObject.file : promoObject.filePath;
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
            if (localizePromoPaths && promoObject.basePath === "") {
                document.getElementById('path-group-' + uuid).classList.remove('path-group-no-icon');
                document.getElementById('path-group-' + uuid).classList.add('path-group')
                document.getElementById('path-warning-' + uuid).innerText = '\u26A0'
            }

            promoList.push(promoObject);

            document.getElementById("button-" + uuid).addEventListener('click', function () {
                document.getElementById(uuid).remove();
                promoList = promoList.filter((promo) => {
                    return promo.uuid != uuid;
                });
            });
        }
    });
}