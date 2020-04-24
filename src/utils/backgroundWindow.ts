import { BrowserWindow, } from 'electron';

export default function createBackgroundWindow(src: string) {
  const backgroundWindow = new BrowserWindow({
    show: false,
  });

  backgroundWindow.loadURL(src);

  return backgroundWindow;
}
