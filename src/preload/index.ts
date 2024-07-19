import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer

const api = {
  createModel: (name: string, code: string, productName: string) => {
    return ipcRenderer.invoke('create-model', name, code, productName);
  },
  getModels: () => {
    return ipcRenderer.invoke('get-models');
  },
  getModelByModelName: (name: string) => {
    return ipcRenderer.invoke('get-model-by-model-name', name);
  },
  createSerialNumber: (modelName: string, company: string) => {
    return ipcRenderer.invoke('create-serial-number', modelName, company);
  },
  filterSerialNumbers: (filters: { modelName?: string, startDate?: Date, endDate?: Date }) => {
    return ipcRenderer.invoke('filter-serial-numbers', filters);
  }
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
