import { app, BrowserWindow, ipcMain, } from 'electron';
import { createMainWindow, } from "./utils/mainWindow";
import { isDev, } from "./utils/environment";
import EventEmitter from 'events';
import AppTray from "./utils/appTray";
import createBackgroundWindow from "./utils/backgroundWindow";
import config from "./utils/config";
import autoStart from "./utils/autoStart";
import initAutoUpdater from "./utils/autoUpdater";
import path from 'path';

declare const MAIN_WINDOW_WEBPACK_ENTRY: any;
declare const BACKGROUND_WINDOW_WEBPACK_ENTRY: any;

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) { // eslint-disable-line global-require
  app.quit();
}

let mainEventEmitter: EventEmitter.EventEmitter;
let mainWindow: BrowserWindow;
let backgroundWindow: BrowserWindow;
let tray: AppTray;

const createWindow = (): void => {
  const { eventEmitter, window, } = createMainWindow({
    isDev: isDev(),
    src: MAIN_WINDOW_WEBPACK_ENTRY,
  });

  mainEventEmitter = eventEmitter;
  mainWindow = window;

  backgroundWindow = createBackgroundWindow(BACKGROUND_WINDOW_WEBPACK_ENTRY);

  tray = new AppTray({
    isDev: isDev(),
    src: path.join(__dirname, 'assets/images/tray_icon.png'),
    mainWindow,
    backgroundWindow: backgroundWindow,
  });

  if (config.get<boolean>('showInTray')) {
    tray.show();
  }

  autoStart.isEnabled().then(enabled => {
    if (config.get<boolean>('openAtLogin') !== enabled) {
      autoStart.set(config.get('openAtLogin'));
    }
  });

  initAutoUpdater(mainWindow);

  app.dock && app.dock.hide(); // Hide app dock on mac

  mainWindow.webContents.openDevTools({
    mode: 'detach',
  });
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

ipcMain.on('message', ((event, payload) => {
  const window = event.sender === mainWindow.webContents ? backgroundWindow : mainWindow;
  window.webContents.send('message', payload);
}));

ipcMain.on('updateSettings', (event, key, value) => {
  mainEventEmitter.emit(key, value);

  if (key === 'showInTray') {
    tray.setVisibility(value);
  }

  if (key === 'developerMode') {
    tray.setIsDev(isDev());
  }

  if (key === 'openAtLogin') {
    autoStart.setEnabled(value);
  }
});

// Quit when all windows are closed.
// app.on('window-all-closed', () => {
//   // On OS X it is common for applications and their menu bar
//   // to stay active until the user quits explicitly with Cmd + Q
//   if (process.platform !== 'darwin') {
//     app.quit();
//   }
// });
//
// app.on('activate', () => {
//   // On OS X it's common to re-create a window in the app when the
//   // dock icon is clicked and there are no other windows open.
//   if (BrowserWindow.getAllWindows().length === 0) {
//     createWindow();
//   }
// });

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
