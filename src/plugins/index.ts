// import core from './core';
// import externalPlugins from './externalPlugins';
//
// export default Object.assign(externalPlugins, core);
import externalPlugins from './externalPlugins';
import core from "./core";

// @ts-ignore
export default new Map<string, any>([ ...core, ...externalPlugins, ]);
