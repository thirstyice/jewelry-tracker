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

function createWindow () {
	const win = new BrowserWindow({
		width: 400,
		height: 200,
		minWidth: 260,
		minHeight: 150,
		backgroundColor: "#444444",
		webPreferences: {
			nodeIntegration: true
		},
		show:false
	})

	win.loadFile('index.html')
	win.show()
}

ipcMain.on('getConfFilePath', (event) => {
	var path = app.getPath('userData') + '/config.json';
	event.returnValue = path;
})

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
	app.quit()
})

app.on('activate', () => {
	if (BrowserWindow.getAllWindows().length === 0) {
		createWindow()
	}
})

app.on('before-quit', () => {
	// Ask to save day's work
})
