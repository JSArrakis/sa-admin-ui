document.getElementById('music-button').addEventListener('click', async function () {
    console.log('Loading content...');
    try {
        // Use await with fs.promises.readFile to read the file content
        let fileContent = await fs.readFile('./src/music/music.html', 'utf-8');

        // Update the main-content div with the loaded content
        document.getElementById('fileContent').innerHTML = fileContent;

        document.getElementById('localize-remote-files').addEventListener('click', function () {
            localizeMusicPaths = !localizeMusicPaths;
            if (localizeMusicPaths) {
                //For each music, transform the path to a local path
                musicList.forEach((music) => {
                    music = transformMusicPath(music, instanceProfile.drives);
                    if (music.basePath === "") {
                        if (hideMusicPaths) {
                            document.getElementById("path-" + music.uuid).innerText = music.file;
                        } else {
                            document.getElementById("path-" + music.uuid).innerText = music.filePath;
                        }

                        document.getElementById('path-group-' + music.uuid).classList.remove('path-group-no-icon');
                        document.getElementById('path-group-' + music.uuid).classList.add('path-group')
                        document.getElementById('path-warning-' + music.uuid).innerText = '\u26A0'

                    } else {
                        if (hideMusicPaths) {
                            document.getElementById("path-" + music.uuid).innerText = music.file;
                        } else {
                            document.getElementById("path-" + music.uuid).innerText = music.filePath;
                        }
                    }
                });
            } else {
                //For each episode, reverse path transformation to the original path
                musicList.forEach((music) => {
                    if (music.basePath === "") {
                        document.getElementById('path-group-' + music.uuid).classList.remove('path-group');
                        document.getElementById('path-group-' + music.uuid).classList.add('path-group-no-icon')
                        document.getElementById('path-warning-' + music.uuid).innerText = ""
                    }
                    music = reverseMusicTransformPath(music);
                    if (hideMusicPaths) {
                        document.getElementById("path-" + music.uuid).innerText = music.file;
                    } else {
                        document.getElementById("path-" + music.uuid).innerText = music.filePath;
                    }
                });
            }
        });

        document.getElementById('hide-file-paths').addEventListener('click', function () {
            hideMusicPaths = !hideMusicPaths;
            if (hideMusicPaths) {
                musicList.forEach((music) => {
                    document.getElementById('path-' + music.uuid).innerText = music.file;
                });
            } else {
                musicList.forEach((music) => {
                    document.getElementById('path-' + music.uuid).innerText = music.filePath;
                });
            }
        });

        document.getElementById('music-clear-button').addEventListener('click', function () {
            clearMusicSelection();
            document.getElementById('localize-remote-files').disabled = true;
            document.getElementById('music-submit-button').disabled = true;
            document.getElementById('music-page-error').innerText = "";
            document.getElementById('music-clear-button').disabled = true;
        });

        document.getElementById('music-files-button').addEventListener('click', function () {
            // Send an IPC message to the main process to open the file dialog
            ipcRenderer.send('open-music-dialog');
        });

        // Log a message to the console
        console.log('Content loaded');
    } catch (err) {
        console.error(err);
    }
});

async function clearMusicSelection() {
    musicList = [];
    document.getElementById('music-selection').innerHTML = "";
    if (localizeMusicPaths) {
        document.getElementById('localize-remote-files').click();
    }
    document.getElementById('localize-remote-files').disabled = true;
    if (hideMusicPaths) {
        document.getElementById('hide-file-paths').click();
    }
    document.getElementById('hide-file-paths').disabled = true;
    document.getElementById('music-page-error').innerText = "";
}


function transformMusicPath(music, basePathArray) {
    let transformedMusic = music

    // Iterate through the base paths and check if the inputPath starts with any of them
    for (const basePath of basePathArray) {
        if (music.filePath.startsWith(basePath)) {
            // Replace the matching part with the corresponding drive letter
            transformedMusic.filePath = music.filePath.replace(basePath, `${basePath.slice(-1)}:`.toUpperCase());
            transformedMusic.basePath = basePath;
            break;
        }
    }

    return transformedMusic;
}

function reverseMusicTransformPath(music) {
    let unTransformedMusic = music;
    // Remove the drive letter and replace it with the original base path
    if (music.basePath === "") {
        return unTransformedMusic;
    }
    unTransformedMusic.filePath = music.filePath.replace(/^[a-zA-Z]:/, music.basePath);
    unTransformedMusic.basePath = "";

    return unTransformedMusic;
}

function displayMusic(filePaths) {
    let targetDiv = document.getElementById('music-selection');

    document.getElementById('localize-remote-files').disabled = false;
    document.getElementById('hide-file-paths').disabled = false;
    document.getElementById('music-clear-button').disabled = false;
    document.getElementById('music-submit-button').disabled = false;

    filePaths.forEach((filePath) => {
        if (musicList.filter((music) => { return music.filePath === filePath }).length === 0) {
            let uuid = uuidv4();
            let fileDiv = document.createElement('div');
            let musicObject = { uuid: uuid, filePath: filePath, basePath: "", file: separatePath(filePath), title: "", tags: "" };

            musicObject = localizeMusicPaths ? transformMusicPath(musicObject, instanceProfile.drives) : musicObject;
            let musicPath = hideMusicPaths ? musicObject.file : musicObject.filePath;
            fileDiv.innerHTML = `
                        <div>
                            <div class="buffer-selection-entry micro-padding" id=${uuid}>
                                <div class="remove-button" id="button-${uuid}">&#x2716;</div>
                                <input id="title-${uuid}" class="media-input small-text" type="text" placeholder="Tags">
                                <div id="path-group-${uuid}" class="path-group-no-icon">
                                    <div id="path-warning-${uuid}" class="path-transform-warning" title="Path not transformed from localization"></div>
                                    <div id="path-${uuid}" class="scrollable-div small-text selected-path-div">${shortPath}</div>
                                </div>
                            </div>
                        </div>`;
            targetDiv.appendChild(fileDiv);
            if (localizeMusicPaths && musicObject.basePath === "") {
                document.getElementById('path-group-' + uuid).classList.remove('path-group-no-icon');
                document.getElementById('path-group-' + uuid).classList.add('path-group')
                document.getElementById('path-warning-' + uuid).innerText = '\u26A0'
            }

            musicList.push(musicObject);

            document.getElementById("button-" + uuid).addEventListener('click', function () {
                document.getElementById(uuid).remove();
                musicList = musicList.filter((music) => {
                    return music.uuid != uuid;
                });
            });
        }
    });
}