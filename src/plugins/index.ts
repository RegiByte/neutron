import installedPlugins from './installedPlugins';
import core from "./core";

export default new Map([ ...core, ...installedPlugins, ]);
