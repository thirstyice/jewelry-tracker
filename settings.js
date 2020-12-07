const fs = require('fs');
const {ipcRenderer, remote} = require('electron');

var configuration;

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

function populateType() {
	var types = [];
	var i;
	for (i=0; i<configuration.items.length; i++) {
		types[i] = configuration.items[i].type;
	}
	populateDropdown('type', types)
}

function selected(dropdownId) {
	var options = document.getElementById(dropdownId).options;
	var selectedId =  options[options.selectedIndex].id;
	if (dropdownId == "typeSelector") {
		populateDropdown('gauge', configuration.items[selectedId].gauge);
		populateDropdown('material', configuration.items[selectedId].material);
		populateDropdown('size', configuration.items[selectedId].size);
	}
}

function add(kind) {
	dropdownId = kind + "Selector";
	var types = null;
	if (kind!="task" && kind!="type") {
		types = document.getElementById("typeSelector").options;
		if (types.selectedIndex < 0) {
			remote.dialog.showMessageBoxSync(remote.getCurrentWindow(), {type:"error", message: "Need to select a type"});
			return;
		}
		var selectedItem =  types.selectedIndex;
	}

	var options = document.getElementById(dropdownId).options;
	if (options.selectedIndex < 0) {
		options.selectedIndex = options.length - 1;
	}

	var prompt = document.getElementById("prompt");
	document.getElementById("promptText").innerHTML = "New " + kind + " name:";
	document.getElementById("promptButton").addEventListener('click', function finishAdding() {
		var name = document.getElementById("promptInput").value;
		if (name=="") {
			return;
		}
		var i;
		switch (kind) {
			case "task":
				for (i=options.length; i>(options.selectedIndex + 1); i--) {
					configuration.task[i] = configuration.task[i-1];
				}
				configuration.task[i] = name;
				populateDropdown("task", configuration.task);
			break;
			case "type":
				for (i=options.length; i>(options.selectedIndex + 1); i--) {
					configuration.items[i] = configuration.items[i-1];
				}
				configuration.items[i] = {
					type: name,
					gauge: [],
					material: [],
					size: []
				};
				populateType();
				document.getElementById(dropdownId).selectedIndex = i;
				selected(dropdownId);
			break;
			case "gauge":
				for (i=options.length; i>(options.selectedIndex + 1); i--) {
					configuration.items[selectedItem].gauge[i] = configuration.items[selectedItem].gauge[i-1];
				}
				configuration.items[selectedItem].gauge[i] = name;
				populateDropdown("gauge", configuration.items[selectedItem].gauge);
			break;
			case "material":
				for (i=options.length; i>(options.selectedIndex + 1); i--) {
					configuration.items[selectedItem].material[i] = configuration.items[selectedItem].material[i-1];
				}
				configuration.items[selectedItem].material[i] = name;
				populateDropdown("material", configuration.items[selectedItem].material);
			break;
			case "size":
				for (i=options.length; i>(options.selectedIndex + 1); i--) {
					configuration.items[selectedItem].size[i] = configuration.items[selectedItem].size[i-1];
				}
				configuration.items[selectedItem].size[i] = name;
				populateDropdown("size", configuration.items[selectedItem].size);
			break;
		}
		prompt.style.display = "none";
		document.getElementById("promptInput").value = "";
		document.getElementById("promptButton").removeEventListener("click", finishAdding);
	});
	prompt.style.display = "block";
	document.getElementById("promptInput").focus();
}

function remove(kind) {
	dropdown = document.getElementById(kind + "Selector");
	if (dropdown.selectedIndex == -1) {
		return;
	}
	var item = null;
	if (kind!="task" && kind!="type") {
		item = document.getElementById("typeSelector").selectedIndex;
	}
	var i;
	switch (kind) {
		case "task" :
			for (i = dropdown.selectedIndex; i < (dropdown.length - 1); i++) {
				configuration.task[i] = configuration.task[i + 1];
			}
			configuration.task.pop();
			populateDropdown("task", configuration.task);
		break;
		case "type" :
			for (i = dropdown.selectedIndex; i < (dropdown.length - 1); i++) {
				configuration.items[i] = configuration.items[i + 1];
			}
			configuration.items.pop();
			populateType();
			dropdown.selectedIndex = 0;
			selected(kind + "Selector");
		break;
		case "gauge" :
			for (i = dropdown.selectedIndex; i < (dropdown.length - 1); i++) {
				configuration.items[item].gauge[i] = configuration.items[item].gauge[i + 1];
			}
			configuration.items[item].gauge.pop();
			populateDropdown("gauge", configuration.items[item].gauge);
		break;
		case "material" :
			for (i = dropdown.selectedIndex; i < (dropdown.length - 1); i++) {
				configuration.items[item].material[i] = configuration.items[item].material[i + 1];
			}
			configuration.items[item].material.pop();
			populateDropdown("material", configuration.items[item].material);
		break;
		case "size" :
			for (i = dropdown.selectedIndex; i < (dropdown.length - 1); i++) {
				configuration.items[item].size[i] = configuration.items[item].size[i + 1];
			}
			configuration.items[item].size.pop();
			populateDropdown("size", configuration.items[item].size);
		break;
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

	populateDropdown('task', configuration.task);
	populateType();

	remote.getCurrentWindow().setContentSize(
		document.documentElement.offsetWidth,
		document.documentElement.offsetHeight,
		true
	);

	// Setup prompt keybinding
	document.getElementById("promptInput").addEventListener("keyup", function(event) {
		// Number 13 is the "Enter" key on the keyboard
		if (event.keyCode === 13) {
			event.preventDefault();
			document.getElementById("promptButton").click();
		} else if (event.keyCode === 123) { // F12
			remote.getCurrentWindow().toggleDevTools();
		}
	});
}
