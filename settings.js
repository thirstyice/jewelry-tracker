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

function createElement(element, id, eventName, responder) {
	var node = document.createElement(element);
	var idAttribute = document.createAttribute("id");
	idAttribute.value = id;
	node.setAttributeNode(idAttribute);
	if (eventName != null) {
		var eventAttribute = document.createAttribute(eventName);
		eventAttribute.value = responder;
		node.setAttributeNode(eventAttribute);
	}
	return node;
}

function populateDropdown(dropdown, children) {
	if (document.getElementById( dropdown + "Selector") == null) {
		document.getElementById("dropdowns").appendChild(
			document.createElement('td')
		).appendChild(
				createElement("select", dropdown + "Selector", "onchange", "selected(this.id)")
		);
		document.getElementById(dropdown + "Selector").setAttribute("size", "6");
	}
	var selector = document.getElementById(dropdown + "Selector");
	while (selector.hasChildNodes()) {
		selector.removeChild(selector.firstChild);
	}
	var i;
	for (i = 0; i < children.length; i++) {
		var id = children[i];
		if (dropdown == 'type') {
			id = i;
		}
		var node = createElement("option", id, null, null);
		node.appendChild(document.createTextNode(children[i]));
		selector.appendChild(node);
	}
}

function selected(dropdownId) {
	var options = document.getElementById(dropdownId).options;
	var selectedId =  options[options.selectedIndex].id;
	if (dropdownId == "typeSelector") {
		populateDropdown('gauge', configuration.items[selectedId].gauge);
		populateDropdown('metal', configuration.items[selectedId].metal);
		populateDropdown('size', configuration.items[selectedId].size);
	}
}

function add(dropdownId) {
	if (selectedType==null && parent!="task" && parent!="type") {
		remote.dialog.showMessageBoxSync(remote.getCurrentWindow(), {type:"error", message: "Need to select a type"});
		return;
	} //prompt for name
	//var promptElement =
	// var precedingElement = document.getElementById(parent).getElementsByClassName("selected")[0];
	// precedingElement.insertA
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

	populateDropdown('task', configuration.task);
	var types = [];
	var i;
	for (i=0; i<configuration.items.length; i++) {
		types[i] = configuration.items[i].type;
	}
	populateDropdown('type', types)

	remote.getCurrentWindow().setContentSize(
		document.documentElement.offsetWidth,
		document.documentElement.offsetHeight,
		true
	);
}
