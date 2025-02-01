import { ElectronAPI } from '@electron-toolkit/preload'

type Model = {
  name: string
  code: string
  productName: string
}

type SerialNumber = {
  serial: string
  company: string
  sequence: number
  createdAt: Date
  modelName: string
}

export enum ProductNames {
  InfiniPlus = 'InfiniPlus',
  InfiniPro = 'InfiniPro',
  InfiniStor = 'InfiniStor',
  DataBox = 'DataBox'
}

export interface API {
  createModel: (name: string, code: string, productName: ProductNames) => Promise<boolean>
  getModels: () => Promise<Model[]>
  getModelsByProductName: (productName: ProductNames) => Promise<Model[]>
  getModelByModelName: (name: string) => Promise<Model>
  createSerialNumber: (modelName: string, company: string, date?: number) => Promise<string | null>
  deleteSerial: (serial: string) => Promise<void>,
  deleteModelByModelName: (modelName) => Promise<void>,
  filterSerialNumbers: (filters: {
    modelName?: string
    startDate?: Date
    endDate?: Date
  }) => Promise<SerialNumber[]>
  saveFile: (
    csv: string,
    startDate: string,
    endDate: string,
    modelName: string,
    serials: string[]
  ) => Promise<string | null>
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: API
  }
}
