import { ensureFiles, modulesDirectory, } from "../utils/plugins";
import chokidar from 'chokidar';
import * as path from "path";
import settings from "../utils/pluginSettings";
import { debounce, get, } from 'lodash';
import { initializePlugin, } from "../utils/initializePlugin";

function requirePlugin(pluginPath: string): object {
  try {
    let plugin = window.require(pluginPath);
    const keys = Object.keys(plugin);

    if (keys.length === 1 && keys[0] === 'default') {
      plugin = plugin.default;
    }

    return plugin;
  } catch (e) {
    console.log(`Error requiring`, pluginPath);
    console.log(e);
  }
}

function isPluginValid(plugin: any): boolean {
  return plugin &&
    typeof plugin === 'function' &&
    plugin.fn.length <= 1;
}

ensureFiles();

const plugins = new Map<string, any>();

const pluginsWatcher = chokidar.watch(modulesDirectory, { depth: 0, });

pluginsWatcher.on('unlinkDir', (pluginPath) => {
  const { base, dir, } = path.parse(pluginPath);

  if (dir !== modulesDirectory) {
    return;
  }

  const requirePath = window.require.resolve(pluginPath);
  plugins.delete(base);
  delete window.require.cache[requirePath];

  console.log(`[${base}] Plugin removed`);
});

pluginsWatcher.on('addDir', (pluginPath) => {
  const { base, dir, } = path.parse(pluginPath);

  if (dir !== modulesDirectory) {
    return;
  }

  setTimeout(() => {
    console.group(`Load plugin: ${base}`);
    console.log(`Path: ${pluginPath}...`);
    const plugin = requirePlugin(pluginPath);
    if (!isPluginValid(plugin)) {
      console.log(`Plugin is not valid, skipped`);
      console.groupEnd();
      return;
    }

    if (!settings.validateSetting(plugin as any)) {
      console.log(`Invalid plugin settings`);
      console.groupEnd();
      return;
    }

    console.log('Loaded');

    const requirePath = window.require.resolve(pluginPath);
    const watcher = chokidar.watch(pluginPath, { depth: 0, });

    watcher.on('change', debounce(() => {
      console.log(`[${base}] Update Plugin`);
      delete window.require.cache[requirePath];
      plugins.set(base, window.require(pluginPath));
      console.log(`[${base}] Plugin Updated`);
    }, 1000));

    plugins.set(base, plugin);

    if (!get(global, 'isBackground') as boolean) {
      console.log(`Initialize async plugin`, base);
      initializePlugin(base);
    }

    console.groupEnd();
  }, 1500);
});

export default plugins;
