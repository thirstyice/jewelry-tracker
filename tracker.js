const fs = require('fs');
const {ipcRenderer} = require('electron');
var startDate
var csv = 'Type,Gauge,Metal,Size,Time per'
var configuration;

function openSettings() {
	ipcRenderer.send('openSettings');
}
ipcRenderer.on("settingsWasClosed", (event) => {
	initDropdowns();
	console.log("Settings closed");
});

function getConfiguration() {
	var confFilePath = ipcRenderer.sendSync('getConfFilePath');
	var flags = 'w+'
	if (fs.existsSync(confFilePath)) {
		flags = 'r+'
	}
	var confFile = fs.readFileSync( confFilePath, {encoding:'utf-8', flag:flags} );
	configuration = JSON.parse(confFile);
}

function makeTimeString(firstVal, secondVal) {
    var s = "0" + firstVal;
    firstOut = s.substr(s.length-2);
		var s = "0" + secondVal;
    secondOut = s.substr(s.length-2);
		return firstOut + ':' + secondOut;
}

function switchButtonToStartDay() {
	console.log('set button to start day')
	var button = document.getElementById('startEndDay')
	button.removeEventListener('click', endDay)
	button.addEventListener('click', startDay)
	button.innerHTML = "Start Day"
}
function switchButtonToEndDay() {
	var button = document.getElementById('startEndDay')
	button.removeEventListener('click', startDay)
	button.addEventListener('click', endDay)
	button.innerHTML = "End Day"
}

function startDay() {
	console.log('start day');
	startDate = new Date()
	document.getElementById('dayStart').innerHTML = makeTimeString(startDate.getHours(), startDate.getMinutes())
	switchButtonToEndDay()
}

function endDay() {
	var endDate = new Date()
	var dayLength = endDate - startDate // in ms
	var dayHours = Math.floor(dayLength / 3600000)
	dayLength -= dayHours * 3600000
	var dayMinutes = Math.round(dayLength / 60000)
	console.log('day length ' + makeTimeString(dayHours, dayMinutes))
	// create and download data
	switchButtonToStartDay()
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
			createElement("select", dropdown + "Selector", "onchange", "selected(this.id)")
		);
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
	selected(dropdown + "Selector");
}

function initDropdowns() {
	getConfiguration()

	populateDropdown('tasks', configuration.tasks);


	var types = [];
	var i;
	for (i=0; i<configuration.items.length; i++) {
		types[i] = configuration.items[i].type;
	}
	populateDropdown('type', types)
}

function selected(dropdownId) {
	var options = document.getElementById(dropdownId).options;
	var selectedId = options[options.selectedIndex].id;
	if (dropdownId == "typeSelector") {
		getConfiguration();

		populateDropdown('gauge', configuration.items[selectedId].gauge);
		populateDropdown('metal', configuration.items[selectedId].metal);
		populateDropdown('size', configuration.items[selectedId].size);
	}
}



// init dropdowns from config files
// init buttons
window.onload = function() {
	initDropdowns();
	switchButtonToStartDay()
}
