//
// Copyright (C) 2020 Tauran Wood
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>
//

const { app, BrowserWindow, ipcMain } = require('electron')

try {
	// If we're in the process of installing on windows
	if (require('electron-squirrel-startup')) return app.quit();
} finally {
	// Not installing, carry on as normal
}

var mainWindow;
var settingsWindow;

function createWindow() {
	mainWindow = new BrowserWindow({
		width: 650,
		height: 145,
		minWidth: 400,
		minHeight: 145,
		useContentSize: true,
		backgroundColor: "#444444",
		webPreferences: {
			nodeIntegration: true,
			enableRemoteModule: true
		},
		show:false
	})
	mainWindow.loadFile('index.html')
	mainWindow.removeMenu();
	mainWindow.once('ready-to-show', () => {
		mainWindow.show()
	})
}

ipcMain.on('getConfFilePath', (event) => {
	var path = app.getPath('userData') + '/config.json';
	event.returnValue = path;
})

ipcMain.on('openSettings', (event) => {
	settingsWindow = new BrowserWindow({
		width: 500,
		height: 200,
		backgroundColor: "#444444",
		webPreferences: {
			nodeIntegration: true,
			enableRemoteModule: true
		},
		parent: mainWindow,
		modal: true,
		show: false
	});
	settingsWindow.loadFile('settings.html');
	mainWindow.removeMenu();
	settingsWindow.once('ready-to-show', () => {
		settingsWindow.show()
	})
	settingsWindow.on('closed', function() {
		mainWindow.webContents.send("settingsWasClosed");
		settingsWindow = null;
	})
})

ipcMain.on('closeSettings', (event) => {
	settingsWindow.close();
})

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
	app.quit()
})

app.on('before-quit', () => {
	// Ask to save day's work
})
