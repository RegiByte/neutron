import memoize from 'memoizee';
import fs from 'fs';
import { get as $get, set as $set, } from 'lodash';
import { app, ipcRenderer, remote, } from 'electron';
import { USER_DATA_PATH, } from "../constants/paths";
import { USER_DATA_FOLDER, } from "../constants/folders";
import { SETTINGS_UPDATED, } from "../constants/events";
import { themes, } from "../constants/themes";

const electronApp = remote ? remote.app : app;

process.argv.forEach(arg => {
  if ([ '-p', '--portable', ].includes(arg.toLowerCase())) {
    electronApp.setPath(USER_DATA_PATH, `${process.cwd()}${USER_DATA_FOLDER}`);
  }
});

const CONFIG_FILE = `${electronApp.getPath(USER_DATA_PATH)}/config.json`;

function writeConfig(config: Settings, errorMessage: string): void {
  fs.writeFile(CONFIG_FILE, JSON.stringify(config, null, 2), err => {
    if (err) {
      console.log(errorMessage, err);
    }
  });
}

export interface Settings {
	locale: string;
	lang: string;
	country: string;
	theme: string;
	hotkey: string;
	showInTray: boolean;
	firstStart: boolean;
	developerMode: boolean;
	cleanOnHide: boolean;
	plugins: object;
	isMigratedPlugins: boolean;
	trackingEnabled: boolean;
	crashReportingEnabled: boolean;
	openAtLogin: boolean;
}

const defaultSettings = memoize((): Settings => {
  const locale = electronApp.getLocale() || 'en-US';
  const [ lang, country, ] = locale.split('-');

  return {
    locale,
    lang,
    country,
    theme: themes.light,
    hotkey: 'Control+Space',
    cleanOnHide: true,
    plugins: {},
    isMigratedPlugins: false,
    trackingEnabled: true,
    crashReportingEnabled: true,
    openAtLogin: true,
    developerMode: false,
    firstStart: true,
    showInTray: true,
  };
});

const readConfig = (): Settings => {
  try {
    return JSON.parse(fs.readFileSync(CONFIG_FILE).toString()) as Settings;
  } catch (e) {
    return defaultSettings();
  }
};

let settings: Settings;

function get<T>(key: string, defaultValue: any = null): T | null {
  if (settings) {
    return $get(settings, key, defaultValue);
  }

  if (!fs.existsSync(CONFIG_FILE)) {
    settings = defaultSettings();
    writeConfig(settings, `[src/utils/config.ts (get)]: Error getting config file, this should be reported on a remove troubleshooting environment on the future`);
  } else {
    settings = readConfig();
  }

  return $get(settings, key, defaultValue);
}


function set(key: string, value: boolean | string | object): void {
  const config = {
    ...defaultSettings(), // If the app updates and new settings were added we need to add them to the settings file
    ...readConfig(),
  };

  $set(config, key, value);

  writeConfig(config, `[src/utils/config.ts (set)]: Error setting config file, this should be reported on a remove troubleshooting environment on the future`);

  if (ipcRenderer) {
    console.log('notify main process', key, value);
    ipcRenderer.send(SETTINGS_UPDATED, key, value);
  }
}

const config = {
  get,
  set,
};

export default config;
