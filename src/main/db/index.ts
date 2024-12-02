import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import { InsertSerialNumber, Model, models, SerialNumber, serialNumbers } from './schema'
import { and, eq, gte, lte, max, SQL } from 'drizzle-orm'
import { migrate } from 'drizzle-orm/better-sqlite3/migrator'
import path from 'path'
import log from 'electron-log/main'
import { app } from 'electron'

function initDB() {
  log.info('Connecting to db')

  const dbPath =
    process.env.NODE_ENV === 'development'
      ? 'serialgen.db'
      : path.resolve(app.getPath('userData'), 'myDatabase.db')
  console.log(dbPath)
  const sqlite = new Database(dbPath)
  log.info('db connected')
  const db = drizzle(sqlite, {
    schema: {
      models,
      serialNumbers
    }
  })
  log.info('drizzle schemas done')
  const migrationsFolder = path.join(__dirname, '../../drizzle')
  log.info('running migrations')
  migrate(db, { migrationsFolder: migrationsFolder })
  log.info('migrations ok')
  return db
}

export enum ProductNames {
  InfiniPlus = 'InfiniPlus',
  InfiniPro = 'InfiniPro',
  InfiniStar = 'InfiniStar',
  Databox = 'Databox'
}

const ProductSerials = {
  [ProductNames.InfiniPlus]: 'a',
  [ProductNames.InfiniPro]: 'b',
  [ProductNames.InfiniStar]: 'c',
  [ProductNames.Databox]: 'd'
}
// Gen - add product field (infiniplus - a, infinipro - b, inifinistar - c, databox- d)

export default class Db {
  private db = initDB()

  constructor() { }

  async createModel(name: string, code: string, productName: ProductNames) {
    try {
      console.log('here')
      await this.db.insert(models).values({ name, code, productName })
      return true
    } catch (error) {
      console.log(error)
      return false
    }
  }

  async getModelsByProductName(productName: string): Promise<Model[]> {
    try {
      return this.db.query.models.findMany({
        where: eq(models.productName, productName)
      });
    } catch (error) {
      console.log(error);
      return [];
    }
  }

  async getModelByModelName(name: string): Promise<Model | undefined> {
    try {
      return this.db.query.models.findFirst({
        where: eq(models.name, name)
      })
    } catch (error) {
      console.log(error)
      return undefined
    }
  }

  async getModels(): Promise<Model[]> {
    return this.db.query.models.findMany()
  }

  async deleteModelByModelName(name: string) {
    await this.db.delete(serialNumbers).where(eq(serialNumbers.modelName, name))
    await this.db.delete(models).where(eq(models.name, name))
  }

  async createSerialNumber(modelName: string, company: string, date?: number) {
    try {
      const model = await this.getModelByModelName(modelName)

      if (!model) {
        throw new Error('Model does not exist')
      }

      const sequence = (await this.getLastSequenceForModel(modelName)) + 1
      const createdAt = date ? new Date(date) : new Date();
      const serialString = this.generateSerialString(
        company,
        ProductSerials[model.productName],
        model.code,
        sequence,
        createdAt
      )

      const serial: InsertSerialNumber = {
        serial: serialString,
        company,
        modelName,
        createdAt: new Date(),
        sequence
      }

      await this.db.insert(serialNumbers).values(serial)

      return serialString
    } catch (error) {
      console.log(error)
      return null
    }
  }

  async getSerialNumbersByModelName(model: string): Promise<SerialNumber[]> {
    return this.db.query.serialNumbers.findMany({
      where: eq(serialNumbers.modelName, model)
    })
  }

  async filterSerialNumbers(filters: {
    modelName?: string
    startDate?: Date
    endDate?: Date
  }): Promise<SerialNumber[]> {
    let filterQueries: SQL[] = []
    if (filters.modelName) {
      filterQueries.push(eq(serialNumbers.modelName, filters.modelName))
    }
    if (filters.startDate) {
      filterQueries.push(gte(serialNumbers.createdAt, filters.startDate))
    }
    if (filters.endDate) {
      filterQueries.push(lte(serialNumbers.createdAt, filters.endDate))
    }
    return this.db.query.serialNumbers.findMany({
      where: and(...filterQueries)
    })
  }

  private generateSerialString(
    company: string,
    productSerial: string,
    modelCode: string,
    sequence: number,
    createdAt: Date
  ): string {
    const sequenceStr = sequence.toString().padStart(4, '0')
    const mmyy = this.formatDateToMMYY(createdAt)
    return `${company}-${productSerial}${modelCode}-${mmyy}-${sequenceStr}`
  }

  private async getLastSequenceForModel(modelName: string): Promise<number> {
    const [{ lastSequence }] = await this.db
      .select({ lastSequence: max(serialNumbers.sequence) })
      .from(serialNumbers)
      .where(eq(serialNumbers.modelName, modelName))
    return lastSequence || 0
  }

  private formatDateToMMYY(date: Date): string {
    const month = (date.getMonth() + 1).toString().padStart(2, '0') // getMonth() returns month from 0 to 11
    const year = date.getFullYear().toString().slice(-2) // get last 2 digits of the year
    return `${month}${year}`
  }
}
