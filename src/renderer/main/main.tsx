import ReactDOM from 'react-dom';
import React from 'react';
import rpc from "../../utils/rpc";
import { APP_NAME, } from "../../constants/strings";
// eslint-disable-next-line no-unused-vars,@typescript-eslint/no-unused-vars
import App from "./App";

(global as any).React = React;
(global as any).ReactDOM = ReactDOM;
(global as any).isBackground = false;

ReactDOM.render(
  <App/>,
  document.querySelector('#app')
);

rpc.on('update-downloaded', () => {
  new Notification(`${APP_NAME}: update is ready to install`, {
    body: 'New version is downloaded and will be automatically installed on quit',
  });
});

rpc.on('reload', () => location.reload());

console.log('app created');
