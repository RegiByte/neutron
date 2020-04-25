import React from 'react';
import ReactDOM from 'react-dom';
import rpc from "../../utils/rpc";
// import plugins from '../../plugins'; TODO: create my own plugin system
import fixPath from 'fix-path';
// import { modulesDirectory, settings as pluginSettings, } from "../../utils/plugins"; // TODO: create my own plugin system

fixPath();

(global as any).React = React;
(global as any).ReactDOM = ReactDOM;
(global as any).isBackground = true;

interface InitializePluginAsyncParams {
  name: string;
}

// TODO: create my own initializer
// rpc.on('initializePluginAsync', ({ name, }: InitializePluginAsyncParams) => {
//   console.group(`Initialize async plugin ${name}`);
//
//   try {
//     const { initializeAsync, }: any = plugins.get(name) || window.require(`${modulesDirectory}/${name}`);
//
//     if (!initializeAsync) {
//       console.log(`No 'initializeAsync' function for ${name}, skipped`);
//       return;
//     }
//     console.log(`Running initializeAsync for ${name}`);
//     initializeAsync((data: any) => {
//       console.log(`Done! Sending data back to main window`);
//       rpc.send('plugin.message', {
//         name,
//         data,
//       });
//     }, pluginSettings.getUserSettings(name));
//   } catch (e) {
//     console.log(`Failed to run initializeAsync for ${name}`, e);
//   }
//   console.groupEnd();
// });

rpc.on('reload', () => {
  location.reload();
});
