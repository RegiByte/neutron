import {
  app,
  BrowserWindow,
  BrowserWindowConstructorOptions,
  globalShortcut,
  screen,
  shell,
} from 'electron';
import { getWindowPosition, toggleWindow, } from "./window";
import { INPUT_HEIGHT, WINDOW_WIDTH, } from "../constants/ui";
import config from "./config";
import EventEmitter from 'events';
import { debounce, set as $set, } from 'lodash';
import { CLEAR_ON_HIDE, HOTKEY_EVENT, SHOW_TERM, UPDATE_THEME, } from "../constants/events";
import { isMac, } from "./environment";
import { buildMenu, } from "./menu";

interface CreateWindowParams {
  isDev: boolean;
  src: string;
}

class MainBrowserWindow extends BrowserWindow {
  settingsChanger: EventEmitter.EventEmitter
}

interface MainWindow {
  window: BrowserWindow;
  eventEmitter: EventEmitter.EventEmitter;
}

export function createMainWindow({ isDev, src, }: CreateWindowParams): MainWindow {
  const [ x, y, ] = getWindowPosition();

  const browserWindowOptions = {
    width: WINDOW_WIDTH,
    height: INPUT_HEIGHT,
    minWidth: WINDOW_WIDTH,
    x,
    y,
    frame: false,
    resizable: false,
    show: config.get<boolean>('firstStart'),
    webPreferences: {
      nodeIntegration: true,
    },
  } as BrowserWindowConstructorOptions;

  if (process.platform === 'linux') {
    browserWindowOptions.type = 'splash';
  }

  const mainWindow = new BrowserWindow(browserWindowOptions);
  const eventEmitter = new EventEmitter.EventEmitter();


  mainWindow.setAlwaysOnTop(true, 'modal-panel');

  mainWindow.loadURL(src);

  let shortcut = config.get<string>('hotkey');
  console.log(shortcut);
  const toggleMainWindow = (): void => {
    toggleWindow(mainWindow);
  };
  const showMainWindow = (): void => {
    mainWindow.show();
    mainWindow.focus();
  };

  globalShortcut.register(shortcut, toggleMainWindow);

  mainWindow.on('blur', () => {
    if (!isDev) {
      mainWindow.hide();
    }
  });

  mainWindow.on('move', debounce(() => {
    if (!mainWindow.isVisible())
      return;

    const display = screen.getPrimaryDisplay();
    const positions = config.get<Map<string, number[]>>('positions');

    $set(positions, display.id, mainWindow.getPosition());

    config.set('positions', positions);
  }, 300));

  mainWindow.on('close', app.quit);

  mainWindow.webContents.on('new-window', (event, url) => {
    shell.openExternal(url);
    event.preventDefault();
  });

  mainWindow.webContents.on('will-navigate', (event, url) => {
    if (url !== mainWindow.webContents.getURL()) {
      shell.openExternal(url);
      event.preventDefault();
    }
  });

  eventEmitter.on(HOTKEY_EVENT, value => {
    globalShortcut.unregister('shortcut');
    shortcut = value;
    globalShortcut.register(shortcut, toggleMainWindow);
  });

  eventEmitter.on('theme', value => {
    mainWindow.webContents.send('message', {
      message: UPDATE_THEME,
      payload: value,
    });
  });

  // Handle window.hide: if cleanOnHide value in preferences is true
  // we clear all results and show empty window every time
  const resetResults = (): void => {
    mainWindow.webContents.send('message', {
      message: SHOW_TERM,
      payload: '',
    });
  };

  const handleCleanOnHideChange = (value: boolean): void => {
    if (value) {
      mainWindow.on('hide', resetResults);
    } else {
      mainWindow.removeListener('hide', resetResults);
    }
  };

  // Set or remove handler when settings changed
  eventEmitter.on(CLEAR_ON_HIDE, handleCleanOnHideChange);

  // Set initial handler if it is needed
  handleCleanOnHideChange(config.get('cleanOnHide'));

  // Restore focus in previous application
  // MacOS only: https://github.com/electron/electron/blob/master/docs/api/app.md#apphide-macos
  if (isMac()) {
    mainWindow.on('hide', () => {
      app.hide();
    });
  }

  app.on('activate', showMainWindow);

  const locked = app.requestSingleInstanceLock();

  if (!locked) {
    app.quit();
  } else {
    app.on('second-instance', (event) => {

      if (mainWindow) {
        if (mainWindow.isMinimized()) {
          mainWindow.restore();
        }
        mainWindow.focus();
      }
    });
  }


  config.set('firstStart', false);

  buildMenu(mainWindow);

  return {
    window: mainWindow,
    eventEmitter: eventEmitter,
  };
}
