import { app, remote, } from 'electron';
import fs from 'fs';
import { APP_NAME, } from "../constants/strings";
import { USER_DATA_PATH, } from "../constants/paths";
import npm from "./npm";
import * as path from 'path';
import memoizee from 'memoizee';

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

const notSearchableCharsRegexp = /[^а-яa-z0-9\s]/i;
const camelCaseRegexp = /([а-яa-z])([A-ZА-Я])/g;
const wordsWithNumbersRegexp = /([^0-9])([0-9])/g;
const escapeRegexp = /[|\\{}()[\]^$+*?.]/g;

const lowerCase = (str: string) => (
  str
    .replace(notSearchableCharsRegexp, '')
    .replace(camelCaseRegexp, (x, y, z) => [ y, z, ].join(' ').toLowerCase())
    .replace(wordsWithNumbersRegexp, (x, y, z) => [ y, z, ].join(' ').toLowerCase())
    .toLowerCase()
);
const escapeStringRegexp = (str: string) => str.replace(escapeRegexp, '\\$&');

const toSearchString = memoizee((string: string) => [
  string.toLowerCase(),
  lowerCase(string),
].join(' '));

const toSearchRegexp = memoizee((term: string) => new RegExp(`(^|[^a-zA-Zа-яА-Я0-9])${escapeStringRegexp(term.toLowerCase())}`));

export const search = (items: any[], term: string, toString = (item: any) => item): any[] => {
  const searchRegexp = toSearchRegexp(term || '');
  return items.filter(item =>
    toSearchString(toString(item)).match(searchRegexp)
  );
};

export const client = npm(pluginPath);

export { default as settings, } from './pluginSettings';
