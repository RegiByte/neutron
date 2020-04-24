import { app, BrowserWindow, Menu, Tray, } from 'electron';
import {
  APP_NAME,
  APP_PLUGINS,
  APP_PREFERENCES,
  CHECK_UPDATEDS,
  DEV_TOOLS_BACKGROUND,
  DEV_TOOLS_MAIN,
  EXIT_APP,
  RELOAD,
  TOGGLE_APP,
} from "../constants/strings";
import { showWindowWithTerm, toggleWindow, } from "./window";
import { PLUGIN_TERM, SETTINGS_TERM, } from "../constants/terms";

interface TrayOptions {
  src: string;
  isDev: boolean;
  mainWindow: BrowserWindow;
  backgroundWindow: BrowserWindow;
}

interface TemplateItem {
  click?: () => void;
  label?: string;
  type?: string;
  submenu?: TemplateItem[];
}

export default class AppTray {
  private tray: Tray;
  private readonly options: TrayOptions;

  constructor(options: TrayOptions) {
    this.tray = null;
    this.options = options;
  }

  setVisibility(visible: boolean): void {
    if (visible) {
      this.show();
      return;
    }

    this.hide();
  }

  show(): void {
    this.tray = new Tray(this.options.src);
    this.tray.setToolTip(APP_NAME);
    this.tray.setContextMenu(this.buildMenu());
  }

  setIsDev(isDev: boolean): void {
    this.options.isDev = isDev;
    if (this.tray) {
      this.tray.setContextMenu(this.buildMenu());
    }
  }

  hide(): void {
    if (this.tray) {
      this.tray.destroy();
      this.tray = null;
    }
  }

  buildMenu() {
    const { mainWindow, backgroundWindow, isDev, } = this.options;
    const separator = {
      type: 'separator',
    } as TemplateItem;

    const template: TemplateItem[] = [
      {
        label: TOGGLE_APP,
        click: (): void => toggleWindow(mainWindow),
      },
      separator,
      {
        label: APP_PLUGINS,
        click: (): void => showWindowWithTerm(mainWindow, PLUGIN_TERM),
      },
      {
        label: APP_PREFERENCES,
        click: (): void => showWindowWithTerm(mainWindow, SETTINGS_TERM),
      },
      separator,
      {
        label: CHECK_UPDATEDS,
        click: (): void => null, // TODO: create this function
      },
    ];

    if (isDev) {
      template.push(separator);
      template.push({
        label: 'Development',
        submenu: [
          {
            label: DEV_TOOLS_MAIN,
            click: (): void => mainWindow.webContents.openDevTools({ mode: 'detach', }),
          }, {
            label: DEV_TOOLS_BACKGROUND,
            click: (): void => backgroundWindow.webContents.openDevTools({ mode: 'detach', }),
          }, {
            label: RELOAD,
            click: (): void => {
              mainWindow.reload();
              backgroundWindow.reload();
              backgroundWindow.hide();
            },
          },
        ],
      });
    }

    template.push(separator);
    template.push({
      label: EXIT_APP,
      click: (): void => {
        app.quit();
      },
    });

    return Menu.buildFromTemplate(template as any);
  }
}
