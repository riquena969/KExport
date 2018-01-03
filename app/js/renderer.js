const { ipcRenderer } = require('electron');
const swal = require('sweetalert');

let name     = document.getElementById('name');
let host     = document.getElementById('host');
let port     = document.getElementById('port');
let user     = document.getElementById('user');
let password = document.getElementById('password');

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

ipcRenderer.on('refreshConnections', (event, connections) => {
    let listConnectionsEl = $('#connections');
    $(listConnectionsEl).html('');

    for (var i = 0; i < connections.length; i++) {
        $(listConnectionsEl).append(`
            <div class="col-xs-4">
                <div class="col-xs-12 connection">
                    <div class="name">${connections[i].name}</div>
                    <div class="host">host: ${connections[i].host}</div>
                    <div class="actions">
                        <span class="glyphicon glyphicon-pencil" title="Edit"></span>
                        <span class="glyphicon glyphicon-trash" title="Delete"></span>
                        <span class="glyphicon glyphicon-flash" title="Test"></span>
                        <span class="glyphicon glyphicon-export" title="Dump Database"></span>
                    </div>
                </div>
            </div>`);
    }
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