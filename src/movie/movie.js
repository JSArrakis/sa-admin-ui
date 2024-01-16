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
    }
}

document.getElementById('movies-button').addEventListener('click', async function () {
    console.log('Loading content...');
    try {
        // Use await with fs.promises.readFile to read the file content
        let fileContent = await fs.readFile('./src/movie/movie.html', 'utf-8');

        // Update the main-content div with the loaded content
        document.getElementById('fileContent').innerHTML = fileContent;

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

        // Log a message to the console
        console.log('Content loaded');
    } catch (err) {
        console.error(err);
    }

});

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
    let targetDiv = document.getElementById('movies-selection');

    document.getElementById('localize-remote-files').disabled = false;
    document.getElementById('hide-file-paths').disabled = false;
    document.getElementById('movie-clear-button').disabled = false;
    document.getElementById('movie-submit-button').disabled = false;

    filePaths.forEach((filePath) => {
        if (movieList.filter((movie) => { return movie.filePath === filePath }).length === 0) {
            let uuid = uuidv4();
            let fileDiv = document.createElement('div');
            let movieObject = { uuid: uuid, filePath: filePath, basePath: "", file: separatePath(filePath), title: "", tags: "", error: "", loadTitle: "", duration: 0 };

            movieObject = localizeMoviePaths ? transformPath(movieObject, instanceProfile.drives) : movieObject;
            let moviePath = hideMoviePaths ? movieObject.file : movieObject.filePath;
            fileDiv.innerHTML = `
                        <div>
                            <div class="alt-selection-entry micro-padding" id=${uuid}>
                                <div class="remove-button" id="button-${uuid}">&#x2716;</div>
                                <input id="title-${uuid}" class="media-input small-text" type="text" placeholder="Title">
                                <input id="tags-${uuid}" class="media-input small-text" type="text" placeholder="Tags">
                                <div id="path-group-${uuid}" class="path-group-no-icon">
                                    <div id="path-warning-${uuid}" class="path-transform-warning" title="Path not transformed from localization"></div>
                                    <div id="path-${uuid}" class="scrollable-div small-text selected-path-div">${moviePath}</div>
                                </div>
                            </div>
                        </div>`;
            targetDiv.appendChild(fileDiv);
            if (localizeMoviePaths && movieObject.basePath === "") {
                document.getElementById('path-group-' + uuid).classList.remove('path-group-no-icon');
                document.getElementById('path-group-' + uuid).classList.add('path-group')
                document.getElementById('path-warning-' + uuid).innerText = '\u26A0'
            }

            movieList.push(movieObject);

            document.getElementById("button-" + uuid).addEventListener('click', function () {
                document.getElementById(uuid).remove();
                movieList = movieList.filter((movie) => {
                    return movie.uuid != uuid;
                });
            });
        }
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
    ipcRenderer.send('log-message', loadTitles);
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
                                document.getElementById("path-" + movie.uuid).innerText = error.Error;
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
    }

    // handle errors
    if (response.data.errors.length > 0) {
        //match each error string with the the corresponding movie in movieList and add the error class for the corresponding element
        for (const error of response.data.errors) {
            for (const movie of movieList) {
                if (movie.loadTitle === error.LoadTitle) {
                    document.getElementById("path-" + movie.uuid).innerText = error.Error;
                    movie.error = error.Error;
                    break;
                }
            }
        }
    }
}

