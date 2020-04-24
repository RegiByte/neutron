import { BrowserWindow, Display, Rectangle, screen, } from 'electron';
import { INPUT_HEIGHT, MIN_VISIBLE_RESULTS, RESULT_HEIGHT, WINDOW_WIDTH, } from "../constants/ui";
import config from "./config";

interface WindowPositionParams {
  width?: number;
  heightWithResults?: number;
}

function isVisible(windowBounds: Rectangle, displayBounds: Rectangle): boolean {
  return !(windowBounds.x > displayBounds.x + displayBounds.width ||
    windowBounds.x + windowBounds.width < displayBounds.x ||
    windowBounds.y > displayBounds.y + displayBounds.height ||
    windowBounds.y + windowBounds.height < displayBounds.y);
}

export function getWindowPosition({ width, heightWithResults, }: WindowPositionParams = {}): [number, number] {
  const winWidth = width || WINDOW_WIDTH;
  const winHeight = heightWithResults || MIN_VISIBLE_RESULTS * RESULT_HEIGHT + INPUT_HEIGHT;

  const display = screen.getPrimaryDisplay();
  const positions: number[] = config.get<number[]>(`positions.${display.id}`);

  if (positions && positions.length) {
    const [ x, y, ] = positions;
    const windowBounds = { x, y, width: winWidth, height: winHeight, } as Rectangle;
    const isWindowVisible = (displayParam: Display): boolean => isVisible(windowBounds, displayParam.bounds);

    if (isWindowVisible(display)) {
      return [ x, y, ];
    }

    const displays = screen.getAllDisplays();
    const isVisibleSomewhere = displays.some(isWindowVisible);

    if (isVisibleSomewhere) {
      return [ x, y, ];
    }
  }

  const x = parseInt(String(display.bounds.x + (display.workAreaSize.width - winWidth) / 2), 10);
  const y = parseInt(String(display.bounds.y + (display.workAreaSize.height - winHeight) / 2), 10);

  return [ x, y, ];
}

export function toggleWindow(appWindow: BrowserWindow): void {
  if (appWindow.isVisible()) {
    appWindow.blur();
    appWindow.blur();
    appWindow.hide();
    return;
  }

  appWindow.show();
  appWindow.focus();
}

export function showWindowWithTerm(appWindow: BrowserWindow, term: string): void {
  appWindow.show();
  appWindow.focus();
  appWindow.webContents.send('message', {
    message: 'showTerm',
    payload: term,
  });
}
