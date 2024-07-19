import { sqliteTable, text, integer} from "drizzle-orm/sqlite-core";

export const models = sqliteTable('models', {
    name: text('name').primaryKey(),
    code: text('code').notNull(),
    productName: text('productName').notNull(),
})

export const serialNumbers = sqliteTable('serial_numbers', {
    serial: text('serial').primaryKey(),
    company: text('company').notNull(),
    sequence: integer('sequence').notNull(),
    createdAt: integer('created_at',{mode: 'timestamp_ms'}).notNull(),
    modelName: text('model_name').references(() => models.name).notNull()
})


export type Model = typeof models.$inferSelect;
export type InsertModel = typeof models.$inferInsert;

export type SerialNumber = typeof serialNumbers.$inferSelect;
export type InsertSerialNumber = typeof serialNumbers.$inferInsert;