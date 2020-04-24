import plugins from "../plugins/externalPlugins";
import { getUserSettings, } from "./pluginSettings";
import rpc from "./rpc";

export function initializePlugin(name: string): void {
  const { initialize, initializeAsync, } = plugins.get(name) || {};

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
    const plugin = plugins.get(name) || {};
    if (plugin.onMessage) plugin.onMessage(data);
  });

  plugins.forEach(([ _value, key, ]) => initializePlugin(key));
}
