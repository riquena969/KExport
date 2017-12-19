const { ipcRenderer } = require('electron');
const swal = require('sweetalert');

let name     = document.getElementById('name');
let host     = document.getElementById('host');
let port     = document.getElementById('port');
let user     = document.getElementById('user');
let password = document.getElementById('password');

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