class TVShow {
    constructor(title, tags) {
        this.title = title;
        this.loadTitle = "";
        this.alias = "";
        this.imdb = "";
        this.durationLimit = 0;
        this.overDuration = false;
        this.firstEpisodeOverDuration = false;
        this.tags = tags;
        this.secondaryTags = [];
        this.episodeCount = 0;
        this.episodes = [];
    }
}

class Episode {
    constructor(episodeNumber, path, duration) {
        this.season = 0;
        this.episode = 0;
        this.episodeNumber = episodeNumber;
        this.path = path;
        this.title = "";
        this.loadTitle = "";
        this.duration = duration;
        this.durationLimit = 0;
        this.tags = [];
    }
}

let showViewToggled = false;

document.getElementById('shows-button').addEventListener('click', async function () {
    console.log('Loading content...');
    try {
        // Use await with fs.promises.readFile to read the file content
        let fileContent = await fs.readFile('./src/show/show.html', 'utf-8');

        // Update the main-content div with the loaded content
        document.getElementById('fileContent').innerHTML = fileContent;

        document.getElementById('show-create-button').addEventListener('click', function () {
            if (showViewToggled) {
                loadShowCreateView();
                showViewToggled = !showViewToggled;
            }
            document.getElementById('show-create-button').disabled = true;
            document.getElementById('show-manage-button').disabled = false;
        });

        document.getElementById('show-manage-button').addEventListener('click', function () {
            if (!showViewToggled) {
                loadShowManageView();
                showViewToggled = !showViewToggled;

                //if showManagementCheckTime is 0 or if it is greater than 5 minutes, get the movie management list
                if (showManagementCheckTime === 0 || (Date.now() - showManagementCheckTime) > 300000 * 6) {
                    showManagementCheckTime = Date.now();
                    console.log("Refreshing show management list...")
                    showManagementList = [];
                    getShowManagementList();
                } else {
                    console.log("Show management list refreshed recently, not refreshing")
                    loadShowManagementView();
                }
            }
            document.getElementById('show-create-button').disabled = false;
            document.getElementById('show-manage-button').disabled = true;
        });

        document.getElementById('show-files-button').addEventListener('click', function () {
            // Send an IPC message to the main process to open the file dialog
            ipcRenderer.send('open-episodes-dialog');
        });

        document.getElementById('show-title').addEventListener('focus', function () {
            document.getElementById('show-title').style.backgroundColor = "";
        });

        document.getElementById('show-tags').addEventListener('blur', function () {
            showTags = document.getElementById('show-tags').value;
        });


        document.getElementById('show-clear-button').addEventListener('click', function () {
            clearShowSelection();
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
            document.getElementById('show-clear-button').disabled = true;
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
                    episode = transformShowPath(episode, instanceProfile.drives);
                    if (episode.basePath === "") {
                        if (hideShowPaths) {
                            document.getElementById("path-" + episode.uuid).innerText = episode.file;
                        } else {
                            document.getElementById("path-" + episode.uuid).innerText = episode.filePath;
                        }

                        document.getElementById('path-group-' + episode.uuid).classList.remove('path-group-no-icon');
                        document.getElementById('path-group-' + episode.uuid).classList.add('path-group')
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
                        document.getElementById('path-group-' + episode.uuid).classList.remove('path-group');
                        document.getElementById('path-group-' + episode.uuid).classList.add('path-group-no-icon')
                        document.getElementById('path-warning-' + episode.uuid).innerText = ""
                    }
                    episode = reverseShowTransformPath(episode);
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
                displayError("Title cannot be empty", "show");
                titleElement.style.backgroundColor = "#ff0000";
                return;
            }
            let getShowResult = await getShowFromAPI(title);
            if (getShowResult[0] !== null) {
                console.log("SHOW FOUND")
                showExists = true;
                document.getElementById('show-tags').disabled = false;
                document.getElementById('show-files-button').disabled = false;
                document.getElementById('localize-remote-files').disabled = false;
                document.getElementById('hide-file-paths').disabled = false;
                document.getElementById('show-submit-button').innerText = "Update";
                document.getElementById('show-submit-button').disabled = false;
                document.getElementById('show-clear-button').disabled = false;
                titleElement.value = getShowResult[0].Title;
                showName = titleElement.value;
                titleElement.style.backgroundColor = "#ffff00";
                titleElement.disabled = true;
                //concatenate tags with a comma separator
                let tags = "";
                getShowResult[0].Tags.forEach((tag) => {
                    tags += tag + ", ";
                });
                showTags = tags;
                document.getElementById('show-tags').value = tags;
                //loop through episodes and add them to the list
                let targetDiv = document.getElementById('episodes-selection');
                getShowResult[0].Episodes.forEach((episode, index) => {
                    setTimeout(() => {
                        let uuid = uuidv4();
                        let fileDiv = document.createElement('div');
                        let episodeObject = { uuid: uuid, filePath: episode.Path, basePath: "", file: separatePath(episode.Path), episode: episode.EpisodeNumber, duration: episode.Duration };
                        let transformedEpisode = localizeShowPaths ? transformShowPath(episodeObject, instanceProfile.drives) : episodeObject;
                        let episodePath = hideShowPaths ? transformedEpisode.file : transformedEpisode.filePath;
                        fileDiv.innerHTML = `
                        <div class="selection-entry micro-padding" id=${uuid}>
                            <div class="remove-button" id=${"button-" + uuid}>&#x2716;</div>
                            <div class="ep-number small-text tiny-horz-padding">Ep.</div>
                            <input id=${"num-" + uuid} class="number-input small-text" type="text" pattern="[0-9]*" name="episode" value=${episode.EpisodeNumber}>
                            <div id=${"path-group-" + uuid} class="path-group-no-icon transparent-div">
                                <div id=${"path-warning-" + uuid} class="path-transform-warning" title="Path not transformed from localization"></div>
                                <div id=${"path-" + uuid} class="scrollable-div small-text selected-path-div">${episodePath}</div>
                            </div>
                        </div>`;
                        fileDiv.id = "entry-" + uuid;
                        fileDiv.classList.add('slide-in-from-right');
                        fileDiv.addEventListener('animationend', function (event) {
                            let pathGroupElement = document.getElementById("path-group-" + uuid);
                            pathGroupElement.classList.add('fade-in');
                        });
                        targetDiv.appendChild(fileDiv);
                        episodeList.push(transformedEpisode);

                        document.getElementById("button-" + uuid).addEventListener('click', function () {
                            document.getElementById(uuid).remove();
                            episodeList = episodeList.filter((episode) => {
                                return episode.uuid != uuid;
                            });
                        });
                    }, index * 100);
                });

            } else if (getShowResult[1].response && getShowResult[1].response.status === 404) {
                console.log("SHOW NOT FOUND")
                document.getElementById('show-tags').disabled = false;
                document.getElementById('show-files-button').disabled = false;
                document.getElementById('localize-remote-files').disabled = false;
                document.getElementById('hide-file-paths').disabled = false;
                document.getElementById('show-submit-button').innerText = "Submit";
                document.getElementById('show-submit-button').disabled = false;
                document.getElementById('show-clear-button').disabled = false;
                titleElement.style.backgroundColor = "#00ff00";
                showName = titleElement.value;
                titleElement.disabled = true;
            } else {
                document.getElementById('check-title-button').disabled = false;
                document.getElementById('show-page-error').innerText = getShowResult[1];
                titleElement.style.backgroundColor = "#ff0000";
            }
        });

        document.getElementById('show-submit-button').addEventListener('click', async function () {
            if (showExists) {
                constructAndSendShowUpdate();
            } else {
                constructAndSendShow();
            }
        });

        // Log a message to the console
        console.log('Content loaded');

    } catch (err) {
        console.error(err);
    }

});

async function getShowManagementList() {
    let requestPath = 'http://' + instanceProfile.host + ':' + instanceProfile.port + '/api/admin/get-all-show-data';
    await axios.get(requestPath)
        .then(response => {
            handleShowListResponse(response);
        })
        .catch(error => {
            let message = "";
            if (error.response) {
                // The server responded with an error status code (4xx or 5xx)
                if (error.response.data.message) {
                    message = error.response.data.message;
                }
            } else if (error.request) {
                // The request was made, but no response was received
                message = 'Network Error: No response received';
            } else {
                // Something happened in setting up the request that triggered an Error
                message = 'Unknown Error: ' + error.message;
            }
            displayError(message, "show");
        });
}

async function handleShowListResponse(response) {
    // handle response
    if (response.data.length > 0) {
        response.data.forEach((show) => {
            let uuid = uuidv4();
            let showDataObject = {
                uuid: uuid,
                title: show.title,
                tags: show.tags,
                error: "",
                loadTitle: show.loadTitle,
                episodeCount: show.episodeCount,
                deletable: false
            };
            showManagementList.push(showDataObject);
        });
        loadShowManagementView();
    }
}

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
    let requestPath = 'http://' + instanceProfile.host + ':' + instanceProfile.port + '/api/admin/get-show?loadTitle=' + loadTitle;
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

async function clearShowSelection() {
    episodeList = [];
    showName = "";
    showExists = false;
    showTags = "";
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

function transformShowPath(episode, basePathArray) {
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

function reverseShowTransformPath(episode) {
    let unTransformedEpisode = episode;
    // Remove the drive letter and replace it with the original base path
    if (episode.basePath === "") {
        return unTransformedEpisode;
    }
    unTransformedEpisode.filePath = episode.filePath.replace(/^[a-zA-Z]:/, episode.basePath);
    unTransformedEpisode.basePath = "";

    return unTransformedEpisode;
}

function displayEpisodes(filePaths) {
    let targetDiv = document.getElementById('episodes-selection');
    filePaths.forEach((filePath, index) => {
        if (episodeList.filter((episode) => { return episode.filePath === filePath }).length === 0) {
            setTimeout(() => {
                let uuid = uuidv4();
                let fileDiv = document.createElement('div');
                let episodeObject = { uuid: uuid, filePath: filePath, basePath: "", file: separatePath(filePath), episode: 0, duration: 0 };
                episodeObject = localizeShowPaths ? transformShowPath(episodeObject, instanceProfile.drives) : episodeObject;
                let episodePath = hideShowPaths ? episodeObject.file : episodeObject.filePath;
                fileDiv.innerHTML = `
                        <div class="selection-entry micro-padding" id=${uuid}>
                            <div class="remove-button" id=${"button-" + uuid}>&#x2716;</div>
                            <div class="ep-number small-text tiny-horz-padding">Ep.</div>
                            <input id=${"num-" + uuid} class="number-input small-text" type="text" pattern="[0-9]*" name="episode" value=0>
                            <div id=${"path-group-" + uuid} class="path-group-no-icon transparent-div">
                                <div id=${"path-warning-" + uuid} class="path-transform-warning" title="Path not transformed from localization"></div>
                                <div id=${"path-" + uuid} class="scrollable-div smaller-text selected-path-div">${episodePath}</div>
                            </div>
                        </div>`;
                fileDiv.id = "entry-" + uuid;
                fileDiv.classList.add('slide-in-from-right');
                fileDiv.addEventListener('animationend', function (event) {
                    let pathGroupElement = document.getElementById("path-group-" + uuid);
                    pathGroupElement.classList.add('fade-in');
                });
                targetDiv.appendChild(fileDiv);
                if (localizeShowPaths && episodeObject.basePath === "") {
                    document.getElementById('path-group-' + uuid).classList.remove('path-group-no-icon');
                    document.getElementById('path-group-' + uuid).classList.add('path-group')
                    document.getElementById('path-warning-' + uuid).innerText = '\u26A0'
                }

                episodeList.push(episodeObject);

                document.getElementById("button-" + uuid).addEventListener('click', function () {
                    document.getElementById(uuid).remove();
                    episodeList = episodeList.filter((episode) => {
                        return episode.uuid != uuid;
                    });
                });
            }, index * 100);
        }
    });
}

async function constructAndSendShow() {
    let episodeArray = [];

    episodeList.forEach((episode) => {
        episodeArray.push(new Episode(episode.episode, episode.filePath, episode.duration));
    });

    let show = new TVShow(showName, createTagArray(showTags));
    show.episodes = episodeArray;
    let requestPath = 'http://' + instanceProfile.host + ':' + instanceProfile.port + '/api/admin/create-show';
    await axios.post(requestPath, show)
        .then(response => {
            document.getElementById('show-clear-button').click();
            displaySuccess("Show created successfully", "show");
        })
        .catch(error => {
            displayError(error, "show")
        });
}

async function constructAndSendShowUpdate() {
    let episodeArray = [];

    episodeList.forEach((episode) => {
        episodeArray.push(new Episode(episode.episode, episode.filePath, episode.duration));
    });

    let show = new TVShow(showName, createTagArray(showTags));
    show.episodes = episodeArray;
    let requestPath = 'http://' + instanceProfile.host + ':' + instanceProfile.port + '/api/admin/update-show';
    await axios.put(requestPath, show)
        .then(response => {
            document.getElementById('show-clear-button').click();
            displaySuccess("Show updated successfully", "show");
        })
        .catch(error => {
            displayError(error, "show")
        });
}

function loadShowCreateView() {
    let showWorkArea = document.getElementById('show-work-area');
    showWorkArea.innerHTML = `
        <div class="center-vertical space-between show-data small-horz-padding">
            <div class="small-text">Title</div>
            <div></div>
            <div></div>
            <div class="small-text">Genre Tags</div>
            <div></div>
            <div></div>

            <input id="show-title" class="medium-text text-input" type="text" placeholder="Samurai Jack">
            <button id="check-title-button" class="small-text">Check</button>
            <div></div>
            <input id="show-tags" class="medium-text text-input" type="text"
                placeholder="cartoon network, animated, 2000s" disabled>
            <div></div>
            <button id="show-files-button" class="small-text" disabled>Select Episodes</button>
        </div>
        <div id="show-path-group" class="center-vertical small-horz-padding">
            <input id="localize-remote-files" type="checkbox" name="Localize" disabled>
            <span class="small-text small-horz-padding">Localize Remote File Paths</span>
            <input id="hide-file-paths" type="checkbox" name="Hide Paths" disabled>
            <span class="small-text small-horz-padding">Hide File Paths</span>
        </div>
        <div id="episodes-selection" class="content-window show-content"></div>
        <div class="space-between small-horz-padding">
            <button id="show-clear-button" class="small-text general-button" disabled>Clear</button>
            <button id="show-submit-button" class="small-text general-button" disabled>Submit</button>
        </div>
        <div id="show-page-error" class="center-vertical warning-block medium-text small-horz-padding"></div>`;

    episodeList.forEach((episode) => {
        insertShowEntry(episode);
    });

    moviesWithErrors = movieList.filter((movie) => { return movie.error !== "" });
    if (moviesWithErrors.length > 0) {
        moviesWithErrors.forEach((movie) => {
            appendEntryError(movie.uuid, movie.error);
        });
    }

    loadCreateControls();

    if (movieList.length > 0) {
        document.getElementById('localize-remote-files').disabled = false;
        document.getElementById('hide-file-paths').disabled = false;
        document.getElementById('movie-clear-button').disabled = false;
        document.getElementById('movie-submit-button').disabled = false;
    }
}

function loadShowManageView() {
    let showWorkArea = document.getElementById('show-work-area');
    showWorkArea.innerHTML = `
        <div id="show-path-group" class="center-vertical small-horz-padding space-between">
            <div id="show-management-search-group" class="search-group">
                <input id="show-management-search-field" class="media-input small-text" type="text" placeholder="Title">
                <button id="show-management-search-button" class="small-text">Search</button>
            </div>
            <button id="show-refresh-button" class="small-text long-button">Refresh Shows</button>
        </div>
        <div id="shows-selection" class="content-window movie-content"></div>
        <div id="show-page-error" class="center-vertical warning-block medium-text small-horz-padding"></div>`;

    document.getElementById('show-management-search-button').addEventListener('click', function () {
        document.getElementById('show-page-error').innerText = "";
        let searchField = document.getElementById('show-management-search-field');
        let searchValue = searchField.value;
        if (searchValue === "") {
            if (movieManagementSearched === false) {
                displayError("Search field is empty", "show");
                return;
            } else {
                movieManagementSearched = false;
                document.getElementById('shows-selection').innerHTML = "";
                loadShowManagementView();
            }
        } else {
            let foundMovies = movieManagementList
                .filter((movie) => {
                    //make searchValue lowercase and remove spaces and special characters
                    return movie.loadTitle.toLowerCase().includes(searchValue.toLowerCase().replace(/\s/g, '').replace(/[^a-zA-Z0-9]/g, ''));
                });
            console.log("Movies found: " + foundMovies.length);
            if (foundMovies.length === 0) {
                // employ levenshtein distance to find the closest matches
                foundMovies = findClosestMatch(searchValue);
                console.log("Closest matches found: " + foundMovies.length)
            }
            if (foundMovies.length > 0) {
                document.getElementById('movies-selection').innerHTML = "";
                //insert the found movies
                loadShowManagementSearches(foundMovies);
                movieManagementSearched = true;
            } else {
                displayError("No movies found for search", "movie");
            }
        }
    });
}

async function insertShowEntry(showObject) {
    let targetDiv = document.getElementById('shows-selection');
    targetDiv.innerHTML = `
        <div class="alt-selection-entry micro-padding" id=${showObject.uuid}>
            <div class="remove-button" id="button-${showObject.uuid}">&#x2716;</div>
            <input id="title-${showObject.uuid}" class="media-input small-text" type="text" placeholder="Title">
            <input id="tags-${showObject.uuid}" class="media-input small-text" type="text" placeholder="Tags">
            <div id="path-group-${showObject.uuid}" class="path-group-no-icon transparent-div">
                <div id="path-warning-${showObject.uuid}" class="path-transform-warning" title="Path not transformed from localization"></div>
                <div id="path-${showObject.uuid}" class="scrollable-div smaller-text selected-path-div">${moviePath}</div>
            </div>
        </div>`;
    targetDiv.id = "entry-" + showObject.uuid;
    targetDiv.classList.add('slide-in-from-right');
    targetDiv.addEventListener('animationend', function (event) {
        let pathGroupElement = document.getElementById("path-group-" + showObject.uuid);
        pathGroupElement.classList.add('fade-in');
    });
    targetDiv.appendChild(targetDiv);
    if (showObject.title !== "") {
        document.getElementById('title-' + showObject.uuid).value = showObject.title;
    }
    if (showObject.tags !== "") {
        document.getElementById('tags-' + showObject.uuid).value = showObject.tags;
    }
    if (localizeMoviePaths && showObject.basePath === "") {
        document.getElementById('path-group-' + showObject.uuid).classList.remove('path-group-no-icon');
        document.getElementById('path-group-' + showObject.uuid).classList.add('path-group')
        document.getElementById('path-warning-' + showObject.uuid).innerText = '\u26A0'
    }

    //if movieList doesnt already contain the movieObject, add it
    if (movieList.filter((movie) => { return movie.filePath === movieObject.filePath }).length === 0) {
        movieList.push(movieObject);
    }

    document.getElementById("button-" + movieObject.uuid).addEventListener('click', function () {
        document.getElementById(movieObject.uuid).remove();
        movieList = movieList.filter((movie) => {
            return movie.uuid != movieObject.uuid;
        });
    });
}

async function loadShowManagementView() {
    showManagementList.forEach((show, index) => {
        setTimeout(() => {
            insertShowManagementEntry(show);
        }, index * 100);
    });
}

async function insertShowManagementEntry(ShowDataObject) {
    let targetDiv = document.getElementById('shows-selection');
    let fileDiv = document.createElement('div');
    fileDiv.innerHTML =
        `<div class="show-management-entry micro-padding" id=${ShowDataObject.uuid}>
            <div class="update-button smaller-text orange update-button-color" id="update-button-${ShowDataObject.uuid}">UPDATE</div>
            <div class="delete-switch" id="delete-switch-${ShowDataObject.uuid}">
                <div class="delete-slider" id="delete-slider-${ShowDataObject.uuid}"></div>
            </div>
            <div id="title-${ShowDataObject.uuid}" class="management-title scrollable-div small-text">${ShowDataObject.title}</div>
            <div id="episode-count-${ShowDataObject.uuid}" class="small-text">Eps. ${ShowDataObject.episodeCount}</div>
            <input id="tags-${ShowDataObject.uuid}" class="movie-management-tags small-text" type="text" value="${ShowDataObject.tags}" placeholder="Tags">
        </div>`;
    fileDiv.id = "entry-" + ShowDataObject.uuid;
    fileDiv.classList.add('slide-in-from-right');
    fileDiv.addEventListener('animationend', function (event) {
        let pathGroupElement = document.getElementById("path-group-" + ShowDataObject.uuid);
        pathGroupElement.classList.add('fade-in');
    });
    targetDiv.appendChild(fileDiv);
    const updateButton = document.getElementById(`update-button-${ShowDataObject.uuid}`);
    updateButton.addEventListener('click', function () {
        if (updateButton.innerText === "UPDATE") {
            updateShow(ShowDataObject);
        } else {
            deleteShow(ShowDataObject);
        }
    });

    const switchElement = document.getElementById(`delete-switch-${movieObject.uuid}`);
    switchElement.addEventListener('click', function () {
        switchElement.classList.toggle('on');
        if (switchElement.classList.contains('on')) {
            document.getElementById(`update-button-${movieObject.uuid}`).classList.remove('update-button-color');
            document.getElementById(`update-button-${movieObject.uuid}`).classList.add('delete-button-color');
            document.getElementById(`update-button-${movieObject.uuid}`).innerText = "DELETE";
        } else {
            document.getElementById(`update-button-${movieObject.uuid}`).classList.remove('delete-button-color');
            document.getElementById(`update-button-${movieObject.uuid}`).classList.add('update-button-color');
            document.getElementById(`update-button-${movieObject.uuid}`).innerText = "UPDATE";
        }
    });
}