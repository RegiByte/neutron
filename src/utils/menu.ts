import { app, BrowserWindow, Menu, MenuItem, shell, } from "electron";

export function buildMenu(appWindow: BrowserWindow): void {
  const template = [ {
    label: 'Electron',
    submenu: [ {
      label: 'About ElectronReact',
      selector: 'orderFrontStandardAboutPanel:',
    }, {
      type: 'separator',
    }, {
      label: 'Services',
      submenu: [] as MenuItem[],
    }, {
      type: 'separator',
    }, {
      label: 'Hide ElectronReact',
      accelerator: 'Command+H',
      selector: 'hide:',
    }, {
      label: 'Hide Others',
      accelerator: 'Command+Shift+H',
      selector: 'hideOtherApplications:',
    }, {
      label: 'Show All',
      selector: 'unhideAllApplications:',
    }, {
      type: 'separator',
    }, {
      label: 'Quit',
      accelerator: 'Command+Q',
      click(): void {
        app.quit();
      },
    }, ],
  }, {
    label: 'Edit',
    submenu: [ {
      label: 'Undo',
      accelerator: 'Command+Z',
      selector: 'undo:',
    }, {
      label: 'Redo',
      accelerator: 'Shift+Command+Z',
      selector: 'redo:',
    }, {
      type: 'separator',
    }, {
      label: 'Cut',
      accelerator: 'Command+X',
      selector: 'cut:',
    }, {
      label: 'Copy',
      accelerator: 'Command+C',
      selector: 'copy:',
    }, {
      label: 'Paste',
      accelerator: 'Command+V',
      selector: 'paste:',
    }, {
      label: 'Select All',
      accelerator: 'Command+A',
      selector: 'selectAll:',
    }, ],
  }, {
    label: 'View',
    submenu: [ {
      label: 'Toggle Full Screen',
      accelerator: 'Ctrl+Command+F',
      click(): void {
        appWindow.setFullScreen(!appWindow.isFullScreen());
      },
    }, ],
  }, {
    label: 'Window',
    submenu: [ {
      label: 'Minimize',
      accelerator: 'Command+M',
      selector: 'performMiniaturize:',
    }, {
      label: 'Close',
      accelerator: 'Command+W',
      selector: 'performClose:',
    }, {
      type: 'separator',
    }, {
      label: 'Bring All to Front',
      selector: 'arrangeInFront:',
    }, ],
  }, {
    label: 'Help',
    submenu: [ {
      label: 'Learn More',
      click(): void {
        shell.openExternal('http://electron.atom.io');
      },
    }, {
      label: 'Documentation',
      click(): void {
        shell.openExternal('https://github.com/atom/electron/tree/master/docs#readme');
      },
    }, {
      label: 'Community Discussions',
      click(): void {
        shell.openExternal('https://discuss.atom.io/c/electron');
      },
    }, {
      label: 'Search Issues',
      click(): void {
        shell.openExternal('https://github.com/atom/electron/issues');
      },
    }, ],
  }, ];

  const menu = Menu.buildFromTemplate(template as any);
  Menu.setApplicationMenu(menu);
}
