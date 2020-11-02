const fs = require('fs');
const {ipcRenderer} = require('electron');
var startDate
var csv = 'Type,Gauge,Metal,Size,Time per'

function openSettings() {
	var confFilePath = ipcRenderer.sendSync('getConfFilePath');
	var flags = 'w+'
	if (fs.existsSync(confFilePath)) {
		flags = 'r+'
	}
	var confFile = fs.readFileSync( confFilePath, {encoding:'utf-8', flag:flags} );
	console.log(confFile);
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

// init dropdowns from config files
// init buttons
window.onload = function() {
	switchButtonToStartDay()
}
