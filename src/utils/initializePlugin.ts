import {getUserSettings,} from "./pluginSettings";
import rpc from "./rpc";
import core from "../plugins/core";
import installedPlugins from "../plugins/installedPlugins";

export function initializePlugin(name: string): void {
  const { initialize, initializeAsync, } = new Map([...core, ...installedPlugins,]).get(name) || {};

  if (initialize) {
    try {
      initialize(getUserSettings(name));
    } catch (e) {
      console.log(`Failed to initialize plugin: ${name}`, e);
    }
  }

  if (initializeAsync) {
    rpc.send('initializePluginAsync', { name, });
  }
}

export default function listenPluginMessages() {
  rpc.on('plugin.message', ({ name, data, }: { name: string; data: any }) => {
    const plugin = new Map([...core, ...installedPlugins,]).get(name) || {};
    if (plugin.onMessage) plugin.onMessage(data);
  });

  new Map([...core, ...installedPlugins,]).forEach(([ _value, key, ]) => initializePlugin(key));
}
