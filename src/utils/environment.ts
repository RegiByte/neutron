import config from "./config";
import * as os from "os";

export const isDev = (): boolean => process.env.NODE_ENV === 'development' || config.get<boolean>('developerMode');
export const isLinux = (): boolean => os.platform() === 'linux';
export const isMac = (): boolean => process.platform === 'darwin';
