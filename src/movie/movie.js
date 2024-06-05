const { error } = require("console");
const { set } = require("lodash");

class Movie {
    constructor(title, tags, path, duration) {
        this.title = title;
        this.loadTitle = "";
        this.alias = "";
        this.imdb = "";
        this.tags = tags;
        this.path = path;
        this.duration = duration;
        this.durationLimit = 0;
        this.collection = "";
        this.collectionSequence = 0;
        this.deletable = false;
    }
}

let movieViewToggled = false;

document.getElementById('movies-button').addEventListener('click', async function () {
    console.log('Loading content...');
    try {
        // Use await with fs.promises.readFile to read the file content
        let fileContent = await fs.readFile('./src/movie/movie.html', 'utf-8');

        // Update the main-content div with the loaded content
        document.getElementById('fileContent').innerHTML = fileContent;

        document.getElementById('movie-create-button').addEventListener('click', function () {
            if (movieViewToggled) {
                loadMovieCreateView();
                movieViewToggled = !movieViewToggled;
            }
            document.getElementById('movie-create-button').disabled = true;
            document.getElementById('movie-manage-button').disabled = false;
        });

        document.getElementById('movie-manage-button').addEventListener('click', function () {
            if (!movieViewToggled) {
                loadMovieManageView();
                movieViewToggled = !movieViewToggled;

                //if movieManagementCheckTime is 0 or if it is greater than 5 minutes, get the movie management list
                if (movieManagementCheckTime === 0 || (Date.now() - movieManagementCheckTime) > 300000 * 6) {
                    movieManagementCheckTime = Date.now();
                    console.log("Refreshing movie management list...")
                    movieManagementList = [];
                    getMovieManagementList();
                } else {
                    console.log("Movie management list refreshed recently, not refreshing")
                    loadMovieManagementView();
                }
            }
            document.getElementById('movie-create-button').disabled = false;
            document.getElementById('movie-manage-button').disabled = true;
        });

        movieList.forEach((movie) => {
            insertMovieEntry(movie);
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

        // Log a message to the console
        console.log('Content loaded');
    } catch (err) {
        console.error(err);
    }

});

async function loadCreateControls() {
    document.getElementById('localize-remote-files').addEventListener('click', function () {
        localizeMoviePaths = !localizeMoviePaths;
        if (localizeMoviePaths) {
            //For each movie, transform the path to a local path
            movieList.forEach((movie) => {
                movie = transformMoviePath(movie, instanceProfile.drives);
                if (movie.basePath === "") {
                    if (hideMoviePaths) {
                        document.getElementById("path-" + movie.uuid).innerText = movie.file;
                    } else {
                        document.getElementById("path-" + movie.uuid).innerText = movie.filePath;
                    }

                    document.getElementById('path-group-' + movie.uuid).classList.remove('path-group-no-icon');
                    document.getElementById('path-group-' + movie.uuid).classList.add('path-group')
                    document.getElementById('path-warning-' + movie.uuid).innerText = '\u26A0'

                } else {
                    if (hideMoviePaths) {
                        document.getElementById("path-" + movie.uuid).innerText = movie.file;
                    } else {
                        document.getElementById("path-" + movie.uuid).innerText = movie.filePath;
                    }
                }
            });
        } else {
            //For each episode, reverse path transformation to the original path
            movieList.forEach((movie) => {
                if (movie.basePath === "") {
                    document.getElementById('path-group-' + movie.uuid).classList.remove('path-group');
                    document.getElementById('path-group-' + movie.uuid).classList.add('path-group-no-icon')
                    document.getElementById('path-warning-' + movie.uuid).innerText = ""
                }
                movie = reverseMovieTransformPath(movie);
                if (hideMoviePaths) {
                    document.getElementById("path-" + movie.uuid).innerText = movie.file;
                } else {
                    document.getElementById("path-" + movie.uuid).innerText = movie.filePath;
                }
            });
        }
    });

    document.getElementById('hide-file-paths').addEventListener('click', function () {
        hideMoviePaths = !hideMoviePaths;
        if (hideMoviePaths) {
            movieList.forEach((movie) => {
                document.getElementById('path-' + movie.uuid).innerText = movie.file;
            });
        } else {
            movieList.forEach((movie) => {
                document.getElementById('path-' + movie.uuid).innerText = movie.filePath;
            });
        }
    });

    document.getElementById('movie-clear-button').addEventListener('click', function () {
        clearMovieSelection();
        document.getElementById('localize-remote-files').disabled = true;
        document.getElementById('movie-submit-button').disabled = true;
        document.getElementById('movie-page-error').innerText = "";
        document.getElementById('movie-clear-button').disabled = true;
    });

    document.getElementById('movie-files-button').addEventListener('click', function () {
        // Send an IPC message to the main process to open the file dialog
        ipcRenderer.send('open-movies-dialog');
    });

    document.getElementById('movie-submit-button').addEventListener('click', function () {
        constructAndSendMovies();
    });
}

async function clearMovieSelection() {
    movieList = [];
    document.getElementById('movies-selection').innerHTML = "";
    if (localizeMoviePaths) {
        document.getElementById('localize-remote-files').click();
    }
    document.getElementById('localize-remote-files').disabled = true;
    if (hideMoviePaths) {
        document.getElementById('hide-file-paths').click();
    }
    document.getElementById('hide-file-paths').disabled = true;
    document.getElementById('movie-page-error').innerText = "";
}


function transformMoviePath(movie, basePathArray) {
    let transformedMovie = movie

    // Iterate through the base paths and check if the inputPath starts with any of them
    for (const basePath of basePathArray) {
        if (movie.filePath.startsWith(basePath)) {
            // Replace the matching part with the corresponding drive letter
            transformedMovie.filePath = movie.filePath.replace(basePath, `${basePath.slice(-1)}:`.toUpperCase());
            transformedMovie.basePath = basePath;
            break;
        }
    }

    return transformedMovie;
}

function reverseMovieTransformPath(movie) {
    let unTransformedMovie = movie;
    // Remove the drive letter and replace it with the original base path
    if (movie.basePath === "") {
        return unTransformedMovie;
    }
    unTransformedMovie.filePath = movie.filePath.replace(/^[a-zA-Z]:/, movie.basePath);
    unTransformedMovie.basePath = "";

    return unTransformedMovie;
}

function displayMovies(filePaths) {
    document.getElementById('localize-remote-files').disabled = false;
    document.getElementById('hide-file-paths').disabled = false;
    document.getElementById('movie-clear-button').disabled = false;
    document.getElementById('movie-submit-button').disabled = false;

    filePaths.forEach((filePath, index) => {
        if (movieList.filter((movie) => { return movie.filePath === filePath }).length === 0) {
            setTimeout(() => {
                let uuid = uuidv4();
                let movieObject = { uuid: uuid, filePath: filePath, basePath: "", file: separatePath(filePath), title: "", tags: "", error: "", loadTitle: "", duration: 0 };
                movieObject = localizeMoviePaths ? transformMoviePath(movieObject, instanceProfile.drives) : movieObject;
                insertMovieEntry(movieObject)
            }, index * 100);
        }
    });
}

async function insertMovieEntry(movieObject) {
    let targetDiv = document.getElementById('movies-selection');
    let moviePath = hideMoviePaths ? movieObject.file : movieObject.filePath;
    let fileDiv = document.createElement('div');
    fileDiv.innerHTML = `
        <div class="alt-selection-entry micro-padding" id=${movieObject.uuid}>
            <div class="remove-button" id="button-${movieObject.uuid}">&#x2716;</div>
            <input id="title-${movieObject.uuid}" class="media-input small-text" type="text" placeholder="Title">
            <input id="tags-${movieObject.uuid}" class="media-input small-text" type="text" placeholder="Tags">
            <div id="path-group-${movieObject.uuid}" class="path-group-no-icon transparent-div">
                <div id="path-warning-${movieObject.uuid}" class="path-transform-warning" title="Path not transformed from localization"></div>
                <div id="path-${movieObject.uuid}" class="scrollable-div smaller-text selected-path-div">${moviePath}</div>
            </div>
        </div>`;
    fileDiv.id = "entry-" + movieObject.uuid;
    fileDiv.classList.add('slide-in-from-right');
    fileDiv.addEventListener('animationend', function (event) {
        let pathGroupElement = document.getElementById("path-group-" + movieObject.uuid);
        pathGroupElement.classList.add('fade-in');
    });
    targetDiv.appendChild(fileDiv);
    if (movieObject.title !== "") {
        document.getElementById('title-' + movieObject.uuid).value = movieObject.title;
    }
    if (movieObject.tags !== "") {
        document.getElementById('tags-' + movieObject.uuid).value = movieObject.tags;
    }
    if (localizeMoviePaths && movieObject.basePath === "") {
        document.getElementById('path-group-' + movieObject.uuid).classList.remove('path-group-no-icon');
        document.getElementById('path-group-' + movieObject.uuid).classList.add('path-group')
        document.getElementById('path-warning-' + movieObject.uuid).innerText = '\u26A0'
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

async function insertMovieManagementEntry(movieObject) {
    let targetDiv = document.getElementById('movies-selection');
    let moviePath = hideMoviePaths ? movieObject.file : movieObject.filePath;
    let fileDiv = document.createElement('div');
    fileDiv.innerHTML =
        `<div class="movie-management-entry micro-padding" id=${movieObject.uuid}>
            <div class="update-button smaller-text orange update-button-color" id="update-button-${movieObject.uuid}">UPDATE</div>
            <div class="delete-switch" id="delete-switch-${movieObject.uuid}">
                <div class="delete-slider" id="delete-slider-${movieObject.uuid}"></div>
            </div>
            <div id="title-${movieObject.uuid}" class="management-title scrollable-div small-text">${movieObject.title}</div>
            <input id="tags-${movieObject.uuid}" class="media-input small-text" type="text" value="${movieObject.tags}" placeholder="Tags">
            <div id="path-group-${movieObject.uuid}" class="path-group-no-icon transparent-div">
                <div></div>
                <div id="path-${movieObject.uuid}" class="scrollable-div smaller-text selected-path-div">${movieObject.filePath}</div>
            </div>
        </div>`;
    fileDiv.id = "entry-" + movieObject.uuid;
    fileDiv.classList.add('slide-in-from-right');
    fileDiv.addEventListener('animationend', function (event) {
        let pathGroupElement = document.getElementById("path-group-" + movieObject.uuid);
        pathGroupElement.classList.add('fade-in');
    });
    targetDiv.appendChild(fileDiv);
    const updateButton = document.getElementById(`update-button-${movieObject.uuid}`);
    updateButton.addEventListener('click', function () {
        if (updateButton.innerText === "UPDATE") {
            updateMovie(movieObject);
        } else {
            deleteMovie(movieObject);
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

async function updateMovie(movieObject) {
    document.getElementById('movie-page-error').innerText = "";
    let tags = document.getElementById('tags-' + movieObject.uuid).value;
    let requestPath = 'http://' + instanceProfile.host + ':' + instanceProfile.port + '/api/admin/update-movie';
    await axios.put(requestPath, { title: movieObject.title, tags: createTagArray(tags), path: movieObject.filePath })
        .then(response => {
            // Find movie in movieManagementList by loadTitle and update the tags
            movieManagementList.forEach((movie) => {
                if (movie.loadTitle === movieObject.loadTitle) {
                    movie.tags = tags;
                }
            });

            displaySuccess("Movie updated", "movie");
        })
        .catch(error => {
            let message = "";
            if (error.response) {
                // The server responded with an error status code (4xx or 5xx)
                // If the error is a status code of 404
                if (error.response.status === 404) {
                    // Remove the movie from the movieManagementList
                    movieManagementList = movieManagementList.filter((movie) => {
                        return movie.uuid != movieObject.uuid;
                    });
                    // Remove the movie from the view
                    document.getElementById(movieObject.uuid).remove();
                    // Display the error message
                    message = "Movie not found, removed from list";
                    return;
                } else if (error.response.data.message) {
                    message = error.response.data.message;
                }
            } else if (error.request) {
                // The request was made, but no response was received
                message = 'Network Error: No response received';
            } else {
                // Something happened in setting up the request that triggered an Error
                message = 'Unknown Error: ' + error.message;
            }
            //log error.response as a string
            console.log("Error Message: " + JSON.stringify(error.response));
            displayError(message, "movie");
        });
}

async function deleteMovie(movieObject) {
    let requestPath = 'http://' + instanceProfile.host + ':' + instanceProfile.port + '/api/admin/delete-movie?loadTitle=' + movieObject.loadTitle;
    await axios.delete(requestPath)
        .then(response => {
            // Remove the movie from the movieManagementList
            movieManagementList = movieManagementList.filter((movie) => {
                return movie.uuid != movieObject.uuid;
            });
            // Remove the movie from the view
            document.getElementById(movieObject.uuid).remove();
            displaySuccess("Movie deleted", "movie");
        })
        .catch(error => {
            let message = "";
            if (error.response) {
                // The server responded with an error status code (4xx or 5xx)
                // If the error is a status code of 404
                if (error.response.status === 404) {
                    // Display the error message
                    message = "Movie not found, removed from list";
                    return;
                } else if (error.response.data.message) {
                    message = error.response.data.message;
                }
            } else if (error.request) {
                // The request was made, but no response was received
                message = 'Network Error: No response received';
            } else {
                // Something happened in setting up the request that triggered an Error
                message = 'Unknown Error: ' + error.message;
            }
            displayError(message, "movie");
        });
}

async function getMovieManagementList() {
    let requestPath = 'http://' + instanceProfile.host + ':' + instanceProfile.port + '/api/admin/get-all-movies';
    await axios.get(requestPath)
        .then(response => {
            handleMovieListResponse(response);
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
            displayError(message, "movie");
        });
}

async function handleMovieListResponse(response) {
    // handle response
    if (response.data.length > 0) {
        response.data.forEach((movie) => {
            let uuid = uuidv4();
            let movieObject = {
                uuid: uuid,
                filePath: movie.Path,
                basePath: "",
                file: separatePath(movie.Path),
                title: movie.Title,
                tags: movie.Tags,
                error: "",
                loadTitle: movie.LoadTitle,
                duration: 0,
                deletable: false
            };
            movieManagementList.push(movieObject);
        });
        loadMovieManagementView();
    }
}

async function loadMovieManagementView() {
    movieManagementList.forEach((movie, index) => {
        setTimeout(() => {
            insertMovieManagementEntry(movie);
        }, index * 100);
    });
}

async function loadMovieManagementSearches(foundMovies) {
    foundMovies.forEach((movie, index) => {
        setTimeout(() => {
            insertMovieManagementEntry(movie);
        }, index * 100);
    });
}

async function constructAndSendMovies() {
    //get the title and tags for each movie
    movieList.forEach((movie) => {
        movie.title = document.getElementById('title-' + movie.uuid).value;
        movie.tags = document.getElementById('tags-' + movie.uuid).value;
        movie.loadTitle = movie.title.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    });


    document.getElementById('movie-page-error').innerText = "";
    let movies = [];
    //if there are duplicate loadTitles in the list, assign error class to the element
    let loadTitles = movieList.map((movie) => { return movie.loadTitle });

    let duplicateLoadTitles = loadTitles.filter((loadTitle, index) => { return loadTitles.indexOf(loadTitle) != index });
    if (duplicateLoadTitles.length > 0) {
        duplicateLoadTitles.forEach((loadTitle) => {
            movieList.forEach((movie) => {
                if (movie.loadTitle === loadTitle) {
                    document.getElementById(movie.uuid).classList.add('error');
                }
            });
        });
        displayError("Duplicate titles found", "movie")
        return;
    }
    movieList.forEach((movie) => {
        // remove special characters and spaces from title

        let hasError = false;
        // Check if the title is empty
        if (movie.title === "") {
            //find element by uuid and add error class
            document.getElementById("title-" + movie.uuid).style.backgroundColor = "red";
            hasError = true;
        }
        // Check if tags are empty
        if (movie.tags === "") {
            //find element by uuid and add error class
            document.getElementById("tags-" + movie.uuid).style.backgroundColor = "red";
            hasError = true;
        }
        if (hasError) {
            return;
        }
        movies.push(new Movie(movie.title, createTagArray(movie.tags), movie.filePath, movie.duration));
    });
    if (movies.length !== movieList.length) {
        document.getElementById('movie-page-error').innerText = "Some movies are missing title or tags";
        return;
    }
    let requestPath = 'http://' + instanceProfile.host + ':' + instanceProfile.port + '/api/admin/bulk-create-movies';

    movieManagementCheckTime = 0;

    await axios.post(requestPath, movies)
        .then(response => {
            handleBulkResponse(response);
        })
        .catch(error => {
            let message = "";
            if (error.response) {
                // The server responded with an error status code (4xx or 5xx)
                if (error.response.data.message) {
                    message = error.response.data.message;
                }

                if (error.response.data.errors && error.response.data.errors.length > 0) {
                    let errorList = error.response.data.errors;

                    ipcRenderer.send('log-message', errorList);

                    for (const error of errorList) {
                        for (const movie of movieList) {
                            if (movie.loadTitle === error.LoadTitle) {
                                appendEntryError(movie.uuid, error.Error)
                                movie.error = error.Error;
                                break;
                            }
                        }
                    }
                }
            } else if (error.request) {
                // The request was made, but no response was received
                message = 'Network Error: No response received';
            } else {
                // Something happened in setting up the request that triggered an Error
                message = 'Unknown Error: ' + error.message;
            }
            displayError(message, "movie");
        });
}

async function handleBulkResponse(response) {
    // handle response
    if (response.data.createdMovies.length > 0) {
        //match each createdMovie string with the the corresponding movie in movieList and click the remove button for the corresponding element, and remove the movie from movieList
        for (const createdMovie of response.data.createdMovies) {
            for (const movie of movieList) {
                if (movie.loadTitle === createdMovie) {
                    document.getElementById('button-' + movie.uuid).click();
                    //remove the movie from movieList
                    break;
                }
            }
        }

        //remove the movies from movieList
        movieList = movieList.filter((movie) => {
            return !response.data.createdMovies.includes(movie.loadTitle);
        });
        if (movieList.length === 0) {
            clearMovieSelection();
            document.getElementById('localize-remote-files').disabled = true;
            document.getElementById('movie-submit-button').disabled = true;
            document.getElementById('movie-page-error').innerText = "";
            document.getElementById('movie-clear-button').disabled = true;
        }
    }

    // handle errors
    if (response.data.errors.length > 0) {
        //match each error string with the the corresponding movie in movieList and add the error class for the corresponding element
        handleMovieCreateErrors(response.data.errors)
    }
}

async function handleMovieCreateErrors(errors) {
    for (const error of errors) {
        for (const movie of movieList) {
            if (movie.loadTitle === error.LoadTitle) {
                appendEntryError(movie.uuid, error.Error)
                movie.error = error.Error;
                break;
            }
        }
    }
}

async function appendEntryError(uuid, errorMessage) {
    ipcRenderer.send('log-message', "appendEntryError " + uuid + " complete");
    let pathGroupElement = document.getElementById("path-group-" + uuid);
    pathGroupElement.addEventListener('animationend', function (event) {

        if (document.getElementById("path-group-" + uuid).classList.contains('fade-out')) {
            ipcRenderer.send('log-message', "path group element listener triggered for animation end, displayEntryError invoked " + uuid + " complete");
            displayEntryError(pathGroupElement, uuid, errorMessage)

        }
    });
    pathGroupElement.classList.add('fade-out')
}


async function displayEntryError(pathGroup, uuid, message) {
    let movieObject = movieList.filter((movie) => { return movie.uuid === uuid })[0];
    pathGroup.style.display = "none"
    let fileDiv = document.createElement('div');
    fileDiv.id = "entry-error-" + uuid;
    //get movieObject from movieList                                                    
    fileDiv.classList.add('entry-error');
    fileDiv.classList.add('small-text');
    fileDiv.innerHTML = `
        <div class="error-view-marker not-flashing" id="error-view-marker-${uuid}">!</div>
        <div class="error-message entry-error-expand" id="error-message-${uuid}">
            <span class="error-message-span scrollable_section">${message}</span>
            <span class="error-path-span scrollable_section">${movieObject.filePath}</span>
        </div>`;
    pathGroup.parentNode.insertBefore(fileDiv, pathGroup);
    errorViewMarker = document.getElementById('error-view-marker-' + uuid);
    errorViewMarker.addEventListener('click', function () {
        errorToggle(uuid);
        toggleError(uuid)
    });
}

function errorToggle(uuid) {
    const element = document.getElementById("error-view-marker-" + uuid);
    if (element.classList.contains('not-flashing')) {
        element.classList.remove('not-flashing');
        element.classList.add('flashing');
        element.style.animation = "flash .75s infinite alternate";
    } else {
        element.classList.remove('flashing');
        element.classList.add('not-flashing');
        element.style.animation = "none";
    }
}

function loadMovieCreateView() {
    let movieWorkArea = document.getElementById('movie-work-area');
    movieWorkArea.innerHTML = `
        <div id="movie-path-group" class="center-vertical small-horz-padding space-between">
            <div>
                <input id="localize-remote-files" type="checkbox" name="Localize" disabled>
                <span class="small-text small-horz-padding">Localize Remote File Paths</span>
                <input id="hide-file-paths" type="checkbox" name="Hide Paths" disabled>
                <span class="small-text small-horz-padding">Hide File Paths</span>
            </div>
            <button id="movie-files-button" class="small-text long-button">Select Movies</button>
        </div>
        <div id="movies-selection" class="content-window movie-content">
        </div>
        <div class="space-between small-horz-padding">
            <button id="movie-clear-button" class="small-text general-button" disabled>Clear</button>
            <button id="movie-submit-button" class="small-text general-button" disabled>Submit</button>
        </div>
        <div id="movie-page-error" class="center-vertical warning-block medium-text small-horz-padding"></div>`;

    movieList.forEach((movie) => {
        insertMovieEntry(movie);
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

function loadMovieManageView() {
    movieObject = { uuid: "1234", filePath: "some\\file\\path\\movieTitle.mkv", basePath: "", file: separatePath("some\\file\\path\\movieTitle.mkv"), title: "Movie Title", tags: "tag 1, tag 2, tag 3", error: "", loadTitle: "movietitle", duration: 0 };
    let movieWorkArea = document.getElementById('movie-work-area');
    movieWorkArea.innerHTML = `
        <div id="movie-path-group" class="center-vertical small-horz-padding space-between">
            <div id="movie-management-search-group" class="search-group"><input id="movie-management-search-field" class="media-input small-text" type="text" placeholder="Title"><button id="movie-management-search-button" class="small-text">Search</button></div>
            <button id="movie-refresh-button" class="small-text long-button">Refresh Movies</button>
        </div>
        <div id="movies-selection" class="content-window movie-content">
        </div>
        <div id="movie-page-error" class="center-vertical warning-block medium-text small-horz-padding"></div>`;

    document.getElementById('movie-management-search-button').addEventListener('click', function () {
        document.getElementById('movie-page-error').innerText = "";
        let searchField = document.getElementById('movie-management-search-field');
        let searchValue = searchField.value;
        if (searchValue === "") {
            if (movieManagementSearched === false) {
                displayError("Search field is empty", "movie");
                return;
            } else {
                movieManagementSearched = false;
                document.getElementById('movies-selection').innerHTML = "";
                loadMovieManagementView();
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
                loadMovieManagementSearches(foundMovies);
                movieManagementSearched = true;
            } else {
                displayError("No movies found for search", "movie");
            }
        }
    });
}

async function findClosestMatch(searchValue) {
    let closestMatches = [];
    movieManagementList.forEach((movie) => {
        // if the distance between the searchValue and the closestMatch is less than 3, add the movie to the closestMatches array
        if (levenshteinDistance(searchValue, movie.title) < 100) {
            closestMatches.push(movie);
        }
    });
    return closestMatches;
}

async function levenshteinDistance(a, b) {
    // Create empty edit distance matrix for all possible modifications of
    // substrings of a to substrings of b.
    let distanceMatrix = Array(b.length + 1).fill(null).map(() => Array(a.length + 1).fill(null));

    // Fill the matrix with the edit distances between substrings of a and b.
    // Edit distance between an empty a and substring of b is inserting all
    for (let i = 0; i <= a.length; i += 1) {
        // The distance of any first string to an empty second string.
        distanceMatrix[0][i] = i;
    }
    // The distance of any second string to an empty first string.
    for (let j = 0; j <= b.length; j += 1) {
        // The distance of any first string to an empty second string.
        distanceMatrix[j][0] = j;
    }
    // Fill in the rest of the matrix.
    for (let j = 1; j <= b.length; j += 1) {
        // Loop over the characters of a
        for (let i = 1; i <= a.length; i += 1) {
            // Find the smallest distance from the current cell to a previous one
            // plus one (indicating a single operation is required to make the
            // strings equal).
            if (b[j - 1] === a[i - 1]) {
                // If the characters are the same in a and b, the cost is 0.
                distanceMatrix[j][i] = distanceMatrix[j - 1][i - 1];
            } else {
                // If the characters are different, the cost is 1.
                distanceMatrix[j][i] = Math.min(
                    distanceMatrix[j - 1][i - 1], // substitution
                    distanceMatrix[j][i - 1], // insertion
                    distanceMatrix[j - 1][i] // deletion
                ) + 1;
            }
        }
    }

    // The bottom-right corner of the matrix contains the answer.
    return distanceMatrix[b.length][a.length];
}