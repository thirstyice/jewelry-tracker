const { app, BrowserWindow } = require('electron')

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
	// init dropdowns from config
	win.show()
}

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
