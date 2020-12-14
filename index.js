const fs = require('fs');
const {ipcRenderer, remote} = require('electron');
var shiftStart;
var jobStart;
var configuration;
var completed = [];
var taskIndex;
var oldAverageCompletionTime;
var initComplete=false;

function openSettings() {
	ipcRenderer.send('openSettings');
}
ipcRenderer.on("settingsWasClosed", (event) => {
	initDropdowns();
});

function getConfiguration() {
	var confFilePath = ipcRenderer.sendSync('getConfFilePath');
	var flags = 'r+'
	if (fs.existsSync(confFilePath) != true) {
		fs.copyFileSync(remote.app.getAppPath() + "/config.json", confFilePath);
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
function switchButtonToPauseWork() {
	var button = document.getElementById('pauseResumeWork')
	button.removeEventListener('click', resumeWork)
	button.addEventListener('click', pauseWork)
	button.innerHTML = "Pause Work"
}
function switchButtonToResumeWork() {
	var button = document.getElementById('pauseResumeWork')
	button.removeEventListener('click', pauseWork)
	button.addEventListener('click', resumeWork)
	button.innerHTML = "Resume Work"
}

function startJob() {
	jobStart = new Date();
	document.getElementById("jobStart").innerHTML = makeTimeString(
		jobStart.getHours(), jobStart.getMinutes()
	);
}

function resumeWork() {
	startJob();
	switchButtonToPauseWork();
}

function pauseWork() {
	jobStart=null;
	document.getElementById("jobStart").innerHTML = "N/A";
	switchButtonToResumeWork();
}


function startDay() {
	shiftStart = new Date();
	document.getElementById('dayStart').innerHTML = makeTimeString(
		shiftStart.getHours(), shiftStart.getMinutes()
	);
	resumeWork();
	switchButtonToEndDay();
}

function endDay() {
	var endDate = new Date()
	var dayLength = endDate - shiftStart // in ms
	var dayHours = Math.floor(dayLength / 3600000)
	dayLength -= dayHours * 3600000
	var dayMinutes = Math.round(dayLength / 60000)
	console.log('day length ' + makeTimeString(dayHours, dayMinutes))
	var csv = "Task,Brand,Type,Gauge,Material,Size,Completed,AvgTime\n"
	var i;
	for (i=0; i<completed.length; i++) {
		if (completed[i].number != 0) {
			var minutes = Math.floor(completed[i].averageTime/60000);
			var seconds = Math.round((completed[i].averageTime - (minutes * 60000))/1000);
			csv += completed[i].job + "," + completed[i].number + "," + makeTimeString(minutes, seconds) + "\n";
		}
	}
	var saveLocation = remote.dialog.showSaveDialogSync( remote.getCurrentWindow(), {
		filters: [
			{name: "Comma Separated Values", extensions: "csv" },
			{name: "All files", extensions: "*"}
		],
		properties:["createDirectory"],
		showsTagField: false,
		defaultPath: shiftStart.toDateString() + ".csv"
	});
	if (saveLocation) {
		fs.writeFileSync( saveLocation, csv );
	}
	location.reload(); // I know this is a hacky workaround, but I can't be bothered
}

function completeItem() {
	if (shiftStart == null) {
		startDay();
	} else if (jobStart == null) {
		resumeWork();
	} else {
		var itemTime = (new Date) - jobStart

		if (completed[taskIndex].averageTime == null) {
			completed[taskIndex].averageTime = itemTime;
		} else {
			oldAverageCompletionTime = completed[taskIndex].averageTime;
			completed[taskIndex].averageTime = ((
				completed[taskIndex].averageTime * completed[taskIndex].number) + itemTime) / (
				completed[taskIndex].number + 1
			);
		}
		var minutes = Math.floor(completed[taskIndex].averageTime/60000);
		var seconds = Math.round((completed[taskIndex].averageTime - (minutes * 60000))/1000);
		document.getElementById("averageTime").innerHTML = makeTimeString(minutes, seconds);
	}
	completed[taskIndex].number ++;
	document.getElementById("numberCompleted").innerHTML = completed[taskIndex].number;
	jobStart = new Date();
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

	populateDropdown('task', configuration.task);


	var types = [];
	var i;
	for (i=0; i<configuration.items.length; i++) {
		types[i] = configuration.items[i].type;
	}
	populateDropdown('type', types)
}

function getSelectedOptionForDropdown(dropdownId) {
	var options = document.getElementById(dropdownId).options;
	return options[options.selectedIndex];
}

function selected(dropdownId) {
	var selectedId = getSelectedOptionForDropdown(dropdownId).id;
	if (dropdownId == "typeSelector") {
		getConfiguration();
		populateDropdown('brand', configuration.items[selectedId].brand);
		populateDropdown('gauge', configuration.items[selectedId].gauge);
		populateDropdown('material', configuration.items[selectedId].material);
		populateDropdown('size', configuration.items[selectedId].size);
		initComplete = true;
	}
	if (initComplete) {
		var selectedTask = getSelectedOptionForDropdown("taskSelector").value;
		var selectedBrand = getSelectedOptionForDropdown("brandSelector").value
		var selectedType = getSelectedOptionForDropdown("typeSelector").value;
		var selectedGauge = getSelectedOptionForDropdown("gaugeSelector").value;
		var selectedMaterial = getSelectedOptionForDropdown("materialSelector").value;
		var selectedSize = getSelectedOptionForDropdown("sizeSelector").value;

		var selectedJob = selectedTask + "," + selectedBrand + "," + selectedType + "," + selectedGauge + "," + selectedMaterial + "," + selectedSize;

		var i;
		taskIndex=null;
		for (i=0; i<completed.length; i++) {
			if (completed[i].job == selectedJob) {
				taskIndex=i;
			}
		}
		if (taskIndex==null) {
			taskIndex = completed.length;
			completed[taskIndex] = {
				job: selectedJob,
				number: 0,
				averageTime: null
			};
		}
		if (jobStart!= null) {
			startJob();
		}
	}
}

window.onload = function() {
	initDropdowns();
	switchButtonToStartDay()

	remote.getCurrentWindow().setContentSize(
		document.documentElement.offsetWidth,
		document.documentElement.offsetHeight,
		true
	);
	// Setup space keybinding
	document.addEventListener("keyup", function(event) {
		// Number 32 is the "space" key on the keyboard
		if (event.keyCode === 32) {
			event.preventDefault();
			completeItem();
		} else if (event.keyCode === 123) { // F12
			remote.getCurrentWindow().toggleDevTools();
		}
	});
}
