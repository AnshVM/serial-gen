import { describe, expect, test } from 'vitest'
import Db, { ProductNames } from '../db'
import { InsertModel } from '../db/schema'

describe('models and serial numbers', () => {
  const db = new Db()

  const populateModels = async () => {
    await db.createModel('a', 'a1', ProductNames.Databox)
    await db.createModel('b', 'a2', ProductNames.InfiniPlus)
    await db.createModel('c', 'a3', ProductNames.InfiniPro)
  }

  const unpopulateModels = async () => {
    await db.deleteModelByModelName('a')
    await db.deleteModelByModelName('b')
    await db.deleteModelByModelName('c')
  }

  test('get all models', async () => {
    await populateModels()
    const models = await db.getModels()
    expect(models.length).toBe(3)
    await unpopulateModels()
  })

  test('create models', async () => {
    await db.createModel('x', 'x1', ProductNames.Databox)
    const model = await db.getModelByModelName('x')
    expect(model).toBeDefined()
    expect(model?.name).toBe('x')
    expect(model?.code).toBe('x1')
    expect(model?.productName).toBe('Databox')
    await db.deleteModelByModelName('x')
  })

  test('serial numbers', async () => {
    const model: InsertModel = { name: 'a', code: 'a1', productName: ProductNames.InfiniStor}
    await db.createModel(model.name, model.code, model.productName as ProductNames)

    await db.createSerialNumber(model.name, 'EBM')
    await db.createSerialNumber(model.name, 'EBM')

    const serialNumbers = await db.getSerialNumbersByModelName(model.name)
    const serialNumber = serialNumbers[0]

    expect(serialNumbers.length).toBe(2)
    expect(serialNumber.company).toBe('EBM')
    expect(serialNumber.modelName).toBe(model.name)
    expect(serialNumber.sequence).toBe(1)
    expect(serialNumber.serial).toBe('EBM-aa1-0724-0001')
    expect(serialNumbers[1].serial).toBe('EBM-aa1-0724-0002')
    // this will delete serial numbers also
    await db.deleteModelByModelName(model.name)
  })

  test('seral numbers filter', async () => {
    const model: InsertModel = { name: 'a', code: 'a1', productName: ProductNames.InfiniPlus }
    await db.createModel(model.name, model.code, model.productName as ProductNames)

    const model2: InsertModel = { name: 'b', code: 'b1', productName: ProductNames.InfiniStor}
    await db.createModel(model2.name, model2.code, model2.productName as ProductNames)

    await db.createSerialNumber(model.name, 'EBM')
    await db.createSerialNumber(model.name, 'EBM')

    await db.createSerialNumber(model2.name, 'EBM')
    await db.createSerialNumber(model2.name, 'EBM')

    const minuteAgo = new Date(Date.now() - 60_000)

    let serials = await db.filterSerialNumbers({
      modelName: model.name,
      endDate: minuteAgo
    })

    expect(serials.length).toBe(0)

    serials = await db.filterSerialNumbers({
      modelName: model.name,
      startDate: minuteAgo
    })

    expect(serials.length).toBe(2)
    expect(serials[0].modelName).toBe(model.name)

    await db.deleteModelByModelName(model.name)
    await db.deleteModelByModelName(model2.name)
  })
})
