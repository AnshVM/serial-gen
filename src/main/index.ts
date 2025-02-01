/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import { app, shell, BrowserWindow, ipcMain, dialog } from 'electron'
import path, { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import Db, { ProductNames } from './db'
import { writeFile } from 'fs/promises'
import log from 'electron-log/main'
import BwipJs from '@bwip-js/node'

function createWindow(): void {
  log.info('Creating window')
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? {} : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    log.info('showing window')
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    log.info('loading index.html')
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.

app.whenReady().then(() => {
  log.info('app is ready')
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  log.info('initing db')
  const db = new Db()
  log.info('db initted')
  // IPC test
  ipcMain.on('ping', () => console.log('pong'))

  ipcMain.handle('create-model', async (_: any, ...args: any) => {
    console.log(args)
    //@ts-ignore
    const val = await db.createModel(...args)
    return val
  })

  ipcMain.handle('get-models', async () => await db.getModels())

  ipcMain.handle('get-model-by-model-name', async (_: any, name: string) => {
    return await db.getModelByModelName(name)
  })

  ipcMain.handle('create-serial-number', async (_: any, ...args: any) => {
    //@ts-ignore
    return await db.createSerialNumber(...args)
  })

  ipcMain.handle('filter-serial-numbers', async (_: any, filters: any) => {
    //@ts-ignore
    return await db.filterSerialNumbers(filters)
  })

  ipcMain.handle('get-models-by-product-name', async (_: any, productName: ProductNames) => {
    return await db.getModelsByProductName(productName);
  })

  ipcMain.handle('delete-serial', async (_: any, serial: string) => {
    return await db.deleteSerial(serial);
  })

  ipcMain.handle('delete-model-by-model-name', async(_:any, modelName: string) => {
    return await db.deleteModelByModelName(modelName);
  })

  ipcMain.handle(
    'save-file',
    async (_: any, csv: string, startDate: string, endDate: string, modelName: string, serials: string[]) => {
      try {

        const result = await dialog.showOpenDialog({
          properties: ['openDirectory']
        })
        if (result.canceled) {
          return null
        }
        const filePath = path.join(
          result.filePaths[0],
          `serialgen-${startDate}-${endDate}-${modelName}.csv`
        )
        await writeFile(filePath, csv)

        for (const serial of serials) {
          const svg = BwipJs.toSVG({
            bcid: 'code128',
            text: serial,
            height: 12,
            includetext: true,
            textxalign: 'center',
            textcolor: '000000'
          });

          const filePath = path.join(
            result.filePaths[0],
            `${serial}-barcode.svg`
          )
          
          await writeFile(filePath, svg);
        }
        return filePath
      } catch(err) {
        console.log(err);
        return null
      }
    }
  )

  log.info('calling createWindow()')

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
