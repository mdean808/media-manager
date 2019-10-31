const electron = require('electron');
// Module to control application life.
const app = electron.app;
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow;

const dialog = electron.dialog;
const path = require('path');
const url = require('url');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

//if (require('electron-squirrel-startup')) return app.quit();


async function createWindow() {
	// Create the browser window.
	mainWindow = new BrowserWindow({
		webPreferences: {
			nodeIntegration: true
		},
		title: 'Media Manager',
		autoHideMenuBar: true,
		icon: path.join(__dirname, '../icons/icon.ico')
	});


	mainWindow.maximize();
	// Remove menu
	//mainWindow.setMenu(null);
	// and load the index.html of the app.
	await mainWindow.loadURL(url.format({
		pathname: path.join(__dirname, '/app/index.html'),
		protocol: 'file:',
		slashes: true
	}));

	// Open the DevTools.
	// mainWindow.webContents.openDevTools()

	// Emitted when the window is closed.
	mainWindow.on('closed', function () {
		// Dereference the window object, usually you would store windows
		// in an array if your app supports multi windows, this is the time
		// when you should delete the corresponding element.
		mainWindow = null
	});

}



exports.selectDirectory = function () {
	return dialog.showOpenDialog(mainWindow, {
		properties: ['openDirectory']
	})
};


// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
	await createWindow()
});

// Quit when all windows are closed.
app.on('window-all-closed', function () {
	// On OS X it is common for applications and their menu bar
	// to stay active until the user quits explicitly with Cmd + Q
	if (process.platform !== 'darwin') {
		app.quit()
	}
});

app.on('activate', async function () {
	// On OS X it's common to re-create a window in the app when the
	// dock icon is clicked and there are no other windows open.
	if (mainWindow === null) {
		await createWindow()
	}
});

