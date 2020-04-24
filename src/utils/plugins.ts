import { app, remote, } from 'electron';
import fs from 'fs';
import { APP_NAME, } from "../constants/strings";
import { USER_DATA_PATH, } from "../constants/paths";
import npm from "./npm";
import * as path from 'path';

const electronApp = remote ? remote.app : app;

const ensureFile = (src: string, content = ''): void => {
  if (!fs.existsSync(src)) {
    fs.writeFileSync(src, content);
  }
};

const ensureDir = (src: string): void => {
  if (!fs.existsSync(src)) {
    fs.mkdirSync(src);
  }
};

const EMPTY_PACKAGE_JSON = JSON.stringify({
  name: `${APP_NAME.toLowerCase()}-plugins`,
  dependencies: {},
}, null, 2);

export const pluginPath = path.join(electronApp.getPath(USER_DATA_PATH), 'plugins');
export const modulesDirectory = path.join(pluginPath, 'node_modules');
export const packageJsonPath = path.join(pluginPath, 'package.json');

export const ensureFiles = (): void => {
  ensureDir(pluginPath);
  ensureDir(modulesDirectory);
  ensureFile(packageJsonPath, EMPTY_PACKAGE_JSON);
};

export const client = npm(pluginPath);

export { default as settings, } from './pluginSettings';
