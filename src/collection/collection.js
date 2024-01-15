document.getElementById('collections-button').addEventListener('click', async function () {
    console.log('Loading content...');
    try {
        // Use await with fs.promises.readFile to read the file content
        let fileContent = await fs.readFile('./src/collection/collection.html', 'utf-8');

        // Update the main-content div with the loaded content
        document.getElementById('fileContent').innerHTML = fileContent;

        // Log a message to the console
        console.log('Content loaded');
    } catch (err) {
        console.error(err);
    }
});