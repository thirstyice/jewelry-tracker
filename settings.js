const fs = require('fs');
const {ipcRenderer} = require('electron');

var configuration;

function appendElement(parentId, element) {
	var node = document.createElement('LI');
	node.appendChild(document.createTextNode(element));
	document.getElementById(parentId).appendChild(node);
}

function populate(id, elements) {
	var i;
	for (i = 0; i < elements.length; i++) {
		appendElement(id, elements[i]);
	}
}

function populateTypes() {
	var i;
	for (i=0; i < configuration.items.length; i++) {
		console.log(configuration.items[i]);
		appendElement('type', configuration.items[i].type)
	}
}


window.onload = function() {
	var confFilePath = ipcRenderer.sendSync('getConfFilePath');
	var flags = 'w+'
	if (fs.existsSync(confFilePath)) {
		flags = 'r+'
	}
	var confFile = fs.readFileSync( confFilePath, {encoding:'utf-8', flag:flags} );
	configuration = JSON.parse(confFile);

	populate('tasks', configuration.tasks);
	populateTypes();

}
