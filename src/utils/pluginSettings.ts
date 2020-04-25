import {get, set,} from 'lodash';
import {every,} from 'lodash/fp';
import config from "./config";
import core from "../plugins/core";
import installedPlugins from "../plugins/installedPlugins";

const getSettings = (pluginName: string): object => config.get<object>(`plugins.${pluginName}`);

const VALID_TYPES = new Set([
  'string',
  'number',
  'bool',
  'option',
]);

interface SettingValidationParams {
  type: string;
  options: object;
}

function validSetting({ type, options, }: SettingValidationParams) {
  if (!type || !VALID_TYPES.has(type)) {
    return false;
  }

  if (type === 'option') return Array.isArray(options) && options.length > 0;

  return true;
}

interface ValidateSettingParams {
  settings: any;
}

export function validateSetting({ settings }: ValidateSettingParams): boolean {
  if (!settings) return true;
  return every(validSetting)(settings);
}

export function getUserSettings(pluginName: string): object {
  const settings = getSettings(pluginName);

  if (get(new Map([...core, ...installedPlugins,]), `${pluginName}.settings`, null)) {
    Object.keys(get(new Map([...core, ...installedPlugins,]), `${pluginName}.settings`, {}))
      .forEach(key => {
        set(settings, key, get(settings, key, get(new Map([...core, ...installedPlugins,]), `${pluginName}.settings.${key}.defaultValue`)));
      });
  }

  return settings;
}


const settings = {
  getUserSettings,
  validateSetting,
};


export default settings;
