declare module '*.png' {
  const content: string;
  export default content;
}

declare module 'rmdir' {
  const exec: (dir: string, callback: (e: object) => any) => void;

  export default exec;
}

