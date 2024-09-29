const KEY = 'biblequote_communicator__data__';
const STARTED_VALUE = '__started__';
const FINISHED_VALUE = '__finished__';
const STEP_SIZE = 1024 * 1024; // 1mb

/**
 * The data emitted by the plugin to the markdown plugin.
 */
export enum EmittedEvents {
  BibleFiles,
  PluginConfig,
  Error,
}

/**
 * Sends a serializable data to all the listening communicators.
 * @param data The data to send
 */
export const send = (key: string | number, data: unknown) => {
  const dataKey = `${KEY}${key}`;
  const stringifiedData = JSON.stringify(data);
  const totalSize = stringifiedData.length;
  let offset = 0;

  localStorage.setItem(dataKey, STARTED_VALUE);

  while (offset < totalSize) {
    const chunk = stringifiedData.slice(offset, offset + STEP_SIZE);
    localStorage.setItem(dataKey, chunk);
    offset += chunk.length;
  }

  localStorage.setItem(dataKey, FINISHED_VALUE);
  localStorage.removeItem(dataKey);
};

/**
 * Listens for incoming data from a given key.
 * @param key The key to listen for
 * @param callback The callback to call when data is received
 */
export const listen = <T>(key: string | number, callback: (data: T) => void) => {
  const dataKey = `${KEY}${key}`;
  let data: string[] = [];

  window.addEventListener('storage', (event) => {
    if (event.key !== dataKey) return;

    if (event.newValue === STARTED_VALUE) {
      data = [];
      return;
    }

    if (event.newValue === FINISHED_VALUE) {
      callback(JSON.parse(data.join('')));
      return;
    }

    if (!event.newValue) return;

    data.push(event.newValue);
  });
};
