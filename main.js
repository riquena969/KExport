const { app , BrowserWindow , ipcMain } = require('electron');
const mysql      = require('mysql');
const mysqlDump  = require('mysqldump');
const jsonfile   = require('jsonfile');
const fileExists = require('file-exists');
const fs         = require('fs');

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

    //Disable the default menubar
    mainWindow.setMenu(null);
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
    let fileDir      = `${app.getPath('userData')}/connections`;
    let fileLocation = `${fileDir}/${name.toLowerCase()}.json`;

    if (!fs.existsSync(fileDir)) {
        fs.mkdirSync(fileDir);
    }

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
            console.log(err);
            mainWindow.send('saveConnection', false);
            return;
        }
        mainWindow.send('saveConnection', true);
    });
});

ipcMain.on('refreshConnections', function() {
    let fileDir = `${app.getPath('userData')}/connections/`;
    if (!fs.existsSync(fileDir)) {
        fs.mkdirSync(fileDir);
    }
    let files   = fs.readdirSync(fileDir);
    let connections = [];

    for (var i = 0; i < files.length; i++) {
        connections.push(jsonfile.readFileSync(fileDir + files[i]));
    }

    mainWindow.send('refreshConnections', connections);
});

ipcMain.on('listDatabases', (event, connectionData) => {
    try {
        let databases = [];
        let connection = mysql.createConnection({
            host     : connectionData.host,
            port     : connectionData.port,
            user     : connectionData.user,
            password : connectionData.password
        });

        connection.connect();

        connection.query('SHOW DATABASES;', (error, results, fields) => {
            if (error) {
                event.returnValue = [];
            } else {
                for (var i = 0; i < results.length; i++) {
                    databases[i] = results[i].Database;
                }

                event.returnValue = databases;
            }
        });

        connection.end();
    } catch(e) {
        console.log(e);
        event.returnValue = [];
    }
});

ipcMain.on('dumpDatabase', (event, connectionData, database, location) => {
    mysqlDump({
        host: connectionData.host,
        port: connectionData.port,
        user: connectionData.user,
        password: connectionData.password,
        database: database,
        ifNotExist: true,
        dest: location
    },function(err){
        event.returnValue = err === null;
    })
});