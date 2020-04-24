import {BrowserWindow, autoUpdater} from 'electron'
import { isDev, isLinux, } from "./environment";

export default function initAutoUpdater(appWindow: BrowserWindow) {
  if (isDev() || isLinux()) {
    return;
  }

  const event = "update-downloaded";
  autoUpdater.on(event, payload => {
    appWindow.webContents.send('message', {
      message: event,
      payload,
    });
  });

  setTimeout(() => {
    autoUpdater.checkForUpdates();
  }, 10 * 1000);

  setInterval(() => {
    autoUpdater.checkForUpdates();
  }, 60 * 60 * 1000);
}
