import EventEmitter from 'events';
import {ipcRenderer} from 'electron'

const emitter = new EventEmitter.EventEmitter();

const CHANNEL = 'message';

ipcRenderer.on(CHANNEL, (_, { message, payload, }) => {
  console.log(`[rpc] emit ${message}`);
  emitter.emit(message, payload);
});

function send(message: string, payload: any): void {
  console.log(`[rpc] send ${message}`);
  ipcRenderer.send(CHANNEL, {
    message,
    payload,
  });
}

const rpc = {
  send,
  on: emitter.on.bind(emitter),
  off: emitter.off.bind(emitter),
  once: emitter.once.bind(emitter),
};

export default rpc;
