import { app } from "electron";
import * as fs from "fs";
import path from "path";

type ACTION = 'CREATE_MODEL' | 'DELETE_MODEL' | 'GENERATE_SERIAL' | 'DELETE_SERIAL';
type Coloumns = {
  modelName: string,
  modelCode: string,
  productName: string,
  serial: string
}

const logPath = path.resolve(app.getPath('documents'), 'serial-gen-logs.csv')

export async function csvLogger(action: ACTION, columns: Coloumns) {
  const date = dateToString(new Date());

  const rowString = `${action},${date},${columns.modelName},${columns.modelCode},${columns.productName},${columns.serial}\n`;

  fs.appendFileSync(logPath, rowString, "utf8");
}

export function initLogFile() {
    if (fs.existsSync(logPath)) {
    } else {
        const firstline = `Action,Date,Model Name,Model Code,Product Name,Serial Number`;
        fs.writeFileSync(logPath, firstline+ "\n", "utf8");
    }
}

const dateToString = (date: Date) => {
  const offset = date.getTimezoneOffset()
  date = new Date(date.getTime() - offset * 60 * 1000)
  return date.toISOString().split('T')[0]
}