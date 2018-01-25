const { ipcRenderer } = require('electron');
const swal = require('sweetalert');

let name        = document.getElementById('name');
let host        = document.getElementById('host');
let port        = document.getElementById('port');
let user        = document.getElementById('user');
let password    = document.getElementById('password');
let connections = [];
let connectionIdSelected;

refreshConnections();

function testConnection() {
    ipcRenderer.send('testConnection', host.value, port.value, user.value, password.value);
}

ipcRenderer.on('testConnection', (event, success) => {
    if (success) {
        swal("Success", "Connection made successfully", "success");
    } else {
        swal("Error", "There was some error making the connection.", "error");
    }
});

function saveConnection() {
    ipcRenderer.send('saveConnection', name.value, host.value, port.value, user.value, password.value, false);
}

function refreshConnections() {
    ipcRenderer.send('refreshConnections');
}

ipcRenderer.on('refreshConnections', (event, listConnections) => {
    let listConnectionsEl = $('#connections');
    $(listConnectionsEl).html('');

    for (var i = 0; i < listConnections.length; i++) {
        $(listConnectionsEl).append(`
            <div class="col-xs-6 col-sm-4 col-md-3">
                <div class="col-xs-12 connection">
                    <div class="name">${listConnections[i].name}</div>
                    <div class="host">host: ${listConnections[i].host}</div>
                    <div class="actions">
                        <span class="glyphicon glyphicon-pencil" title="Edit"></span>
                        <span class="glyphicon glyphicon-trash" title="Delete"></span>
                        <span class="glyphicon glyphicon-flash" title="Test"></span>
                        <span class="glyphicon glyphicon-export" title="Dump Database" onclick="listDatabases(${i})"></span>
                    </div>
                </div>
            </div>`);
    }

    if (listConnections.length == 0) {
        $(listConnectionsEl).append(`
            <div class="col-xs-6 col-sm-4 col-md-3">
                <p>No available connections</p>
            </div>`);
    }

    connections = listConnections;
});

ipcRenderer.on('saveConnection', (event, success) => {
    if (success) {
        swal("Success", "Connection save successfully", "success");
    } else {
        swal("Error", "Connection not saved", "error");
    }
});

ipcRenderer.on('saveConnectionRewrite', (event) => {
    swal("Error", "The name is already in use", "error");
});

function listDatabases(connectionId) {
    let data             = connections[connectionId];
    let databases        = ipcRenderer.sendSync('listDatabases', data);
    connectionIdSelected = connectionId;

    if (databases.length == 0) {
        alert('Connection failed');
        return;
    }

    $('#databases').html('');
    for (var i = 0; i < databases.length; i++) {
        $('#databases').append(`<option value="${databases[i]}">${databases[i]}</option>`);
    }

    $('#dumpDatabase').modal('show');
}

function dumpDatabase() {
    if (!$('#filename').val().length > 0 || !document.getElementById("fileLocation").files[0]) {
        alert('Complete the form please');
        return;
    }
    let location = document.getElementById("fileLocation").files[0].path + '/' + $('#filename').val();
    
    if (ipcRenderer.sendSync('dumpDatabase', connections[connectionIdSelected], $('#databases').val(), location)) {
        alert('Dump complete!');
    } else {
        alert('Error');
    }
}