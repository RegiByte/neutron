import { APP_NAME, } from "../constants/strings";
import AutoLaunch from 'auto-launch';
import { app, } from 'electron';
import { isLinux, } from "./environment";

let appLauncher: AutoLaunch;

if (isLinux()) {
  appLauncher = new AutoLaunch({
    name: APP_NAME,
  });
}

const isEnabled = (): Promise<boolean> => (
  isLinux() ? appLauncher.isEnabled() : Promise.resolve(app.getLoginItemSettings().openAtLogin)
);

const set = (openAtLogin: boolean): Promise<void> => {
  if (isLinux()) {
    return openAtLogin ? appLauncher.enable() : appLauncher.disable();
  }

  return Promise.resolve(app.setLoginItemSettings({
    openAtLogin,
  }));
};

const setEnabled = (enabled: boolean): void => {
  isEnabled().then(currentEnabled => {
    if (currentEnabled !== enabled) {
      set(enabled);
    }
  });
};

const autoStart = {
  isEnabled,
  setEnabled,
  set,
};

export default autoStart;
