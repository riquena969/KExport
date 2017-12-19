const { app , BrowserWindow , ipcMain } = require('electron');
const mysql    = require('mysql');
const jsonfile = require('jsonfile');
const fileExists = require('file-exists');

let mainWindow = null;

app.on('window-all-closed', () => {
    app.quit()
});

app.on('ready', () => {
    mainWindow = new BrowserWindow({width: 800, height: 600});

    mainWindow.on('closed', () => {
        app.quit();
    });

    mainWindow.loadURL(`file://${__dirname}/app/index.html`);
});

ipcMain.on('testConnection', (event, host, port, user, password) => {
    var connection = mysql.createConnection({
        host     : host,
        port     : port,
        user     : user,
        password : password
    });

    connection.connect(function(err) {
        if (err) {
            mainWindow.send('testConnection', false);
            return;
        }

        mainWindow.send('testConnection', true);
    });
});

ipcMain.on('saveConnection', (event, name, host, port, user, password, ignoreIfExists) => {
    let fileLocation = `${__dirname}/connections/${name.toLowerCase()}.json`;
    if (!ignoreIfExists) {
        let boolFileExists = fileExists.sync(fileLocation);
        if (boolFileExists) {
            mainWindow.send('saveConnectionRewrite');
            return;
        }
    }

    let data = {
        name     : name,
        host     : host,
        port     : port,
        user     : user,
        password : password};

    jsonfile.writeFile(fileLocation, data, {}, (err) => {
        if (err) {
                mainWindow.send('saveConnection', false);
            return;
        }
        mainWindow.send('saveConnection', true);
    });
});