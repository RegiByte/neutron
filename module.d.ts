declare module '*.png' {
  const content: string;
  export default content;
}

declare module 'rmdir' {
  const exec: (dir: string, callback: (e: object) => any) => void;

  export default exec;
}

declare namespace neutron {
  declare interface Plugin {
    keyword?: string;
  }

  declare interface Result {
    title?: string;
    subtitle?: string;
    icon?: string;
    term?: string;
    onSelect: (event: Event) => any;
    onFocus: (event: Event) => any;
  }

  declare interface PluginParams {
    term?: string;
    display?: (result: neutron.Result | neutron.Result[]) => void;
    actions: {
      [key: string]: (...params) => any;
    };
  }
}
