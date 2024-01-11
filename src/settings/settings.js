document.getElementById('settings-button').addEventListener('click', async function () {
    console.log('Loading content...');
    try {
        // Use await with fs.promises.readFile to read the file content
        let fileContent = await fs.readFile('./src/settings/settings.html', 'utf-8');

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
});