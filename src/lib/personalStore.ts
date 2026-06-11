import { openDB, type DBSchema } from 'idb'
import type { TemplateEntry } from '@/types/template'

const DB_NAME = 'xcpc-super-template'
const STORE_NAME = 'personal-templates'

interface SuperTemplateDb extends DBSchema {
  [STORE_NAME]: {
    key: string
    value: TemplateEntry
  }
}

async function getDb() {
  return openDB<SuperTemplateDb>(DB_NAME, 1, {
    upgrade(db) {
      db.createObjectStore(STORE_NAME, { keyPath: 'id' })
    }
  })
}

export async function loadPersonalTemplates(): Promise<TemplateEntry[]> {
  const db = await getDb()
  return db.getAll(STORE_NAME)
}

export async function savePersonalTemplate(template: TemplateEntry): Promise<void> {
  const db = await getDb()
  await db.put(STORE_NAME, {
    ...template,
    source: 'personal',
    updatedAt: new Date().toISOString()
  })
}

export async function deletePersonalTemplate(id: string): Promise<void> {
  const db = await getDb()
  await db.delete(STORE_NAME, id)
}

export async function saveManyPersonalTemplates(templates: TemplateEntry[]): Promise<void> {
  const db = await getDb()
  const tx = db.transaction(STORE_NAME, 'readwrite')
  await Promise.all(
    templates.map((template) =>
      tx.store.put({
        ...template,
        source: 'personal',
        updatedAt: template.updatedAt ?? new Date().toISOString()
      })
    )
  )
  await tx.done
}
