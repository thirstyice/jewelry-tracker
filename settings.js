const fs = require('fs');
const {ipcRenderer} = require('electron');

var configuration;

function exitDiscard() {
	ipcRenderer.send('closeSettings');
}

function exitSave() {

}

function populate(parentId, children) {
	var element = document.getElementById(parentId);
	while (element.hasChildNodes()) {
		element.removeChild(element.firstChild);
	}
	var i;
	for (i = 0; i < children.length; i++) {
		var node = document.createElement('LI');
		var id = document.createAttribute("id");
		var onClick = document.createAttribute("onclick");
		id.value = children[i];
		onClick.value = "select(this.id)"
		node.setAttributeNode(id);
		node.setAttributeNode(onClick);
		node.appendChild(document.createTextNode(children[i]));
		document.getElementById(parentId).appendChild(node);
	}
}

function populateTypes() {
	var element = document.getElementById('type');
	while (element.hasChildNodes()) {
		element.removeChild(element.firstChild);
	}
	var i;
	for (i=0; i < configuration.items.length; i++) {
		var node = document.createElement('LI');
		var id = document.createAttribute("id");
		var onClick = document.createAttribute("onclick");
		id.value = i;
		onClick.value = "select(this.id)"
		node.setAttributeNode(id);
		node.setAttributeNode(onClick);
		node.appendChild(document.createTextNode(configuration.items[i].type));
		document.getElementById('type').appendChild(node);
	}
}

function select(id) {
	var element = document.getElementById(id);
	var parentElement = element.parentElement;
	var siblings = parentElement.children;
	var i;
	for (i=0; i<siblings.length; i++) {
		siblings[i].classList.remove("selected");
	}
	element.classList.add("selected");
	if (parentElement.id = "type") {
		populate("gauge", configuration.items[element.id].gauge);
		populate("metal", configuration.items[element.id].metal);
		populate("size", configuration.items[element.id].size);
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
	
	require('electron').remote.getCurrentWindow().setContentSize(
		document.documentElement.offsetWidth,
		document.documentElement.offsetHeight,
		true
	);
}
