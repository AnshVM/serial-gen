import { ElectronAPI } from '@electron-toolkit/preload'

type Model = {
  name: string;
  code: string;
  productName: string;
}

type SerialNumber = {
  serial: string;
  company: string;
  sequence: number;
  createdAt: Date;
  modelName: string;
}

export interface API {
  createModel: (name: string, code: string, productName: string) => Promise<boolean>,
  getModels: () => Promise<Model[]>,
  getModelByModelName: (name: string) => Promise<Model>,
  createSerialNumber: (modelName: string, company: string) => Promise<string | null>,
  filterSerialNumbers: (filters: {modelName?: string, startDate?: Date, endDate?: Date}) => Promise<SerialNumber[]>,
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: API 
  }
}
