const fs = require('fs');
const {ipcRenderer, remote} = require('electron');

var configuration;
var selectedType;

function exitDiscard() {
	ipcRenderer.send('closeSettings');
}

function exitSave() {
	var confFilePath = ipcRenderer.sendSync('getConfFilePath');
	var flags = 'w'
	fs.writeFileSync( confFilePath, JSON.stringify(configuration) );
	ipcRenderer.send('closeSettings');
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
		selectedType = element.id;
	}
}

function add(parent) {
	if (selectedType==null && parent!="task" && parent!="type") {
		remote.dialog.showMessageBoxSync(remote.getCurrentWindow(), {type:"error", message: "Need to select a type"});
		return;
	} //prompt for name
	//var promptElement =
	var precedingElement = document.getElementById(parent).getElementsByClassName("selected")[0];
	precedingElement.insertA
	var name = prompt("New " + parent + " name:", "name");
	if (parent=="type") {
		configuration.items.push({
			type: name,
			gauge: [],
			metal: [],
			size: []
		});
	} else {
		switch (parent) {
			case "task" :
				configuration.task.push(name);
				populate("task", configuration.task);
			break;
			case "type" :
				configuration.items.push({
					type: name,
					gauge: [],
					metal: [],
					size: []
				});
				populateTypes();
			break;
			case "gauge" :
				configuration.items[selectedType].gauge.push(name);
				populate("gauge", configuration.items[selectedType].gauge);
			break;
			case "metal" :
				configuration.items[selectedType].metal.push(name);
				populate("metal", configuration.items[selectedType].metal);
			break;
			case "size" :
				configuration.items[selectedType].size.push(name);
				populate("size", configuration.items[selectedType].size);
			break;
		}
	}
}

function remove(parent) {

}

window.onload = function() {
	var confFilePath = ipcRenderer.sendSync('getConfFilePath');
	var flags = 'w+'
	if (fs.existsSync(confFilePath)) {
		flags = 'r+'
	}
	var confFile = fs.readFileSync( confFilePath, {encoding:'utf-8', flag:flags} );
	configuration = JSON.parse(confFile);

	populate('task', configuration.task);
	populateTypes();

	remote.getCurrentWindow().setContentSize(
		document.documentElement.offsetWidth,
		document.documentElement.offsetHeight,
		true
	);
}
