import { promises as fs } from 'node:fs'
import path from 'node:path'
import { validateTemplatePackages, type TemplatePackage } from '../src/lib/templateValidation'
import { templateTopCategories } from '../src/lib/templateTaxonomy'

const workspaceRoot = process.cwd()
const templateRoot = path.join(workspaceRoot, '板子')

async function main(): Promise<void> {
  const packages = await readTemplatePackages(templateRoot)
  const result = validateTemplatePackages(packages, {
    requiredTopCategories: templateTopCategories
  })

  if (!result.ok) {
    console.error(`Template validation failed with ${result.errors.length} issue(s):`)
    for (const error of result.errors) {
      console.error(`- ${error}`)
    }
    process.exitCode = 1
    return
  }

  console.log(`Template validation passed: ${packages.length} template(s).`)
}

async function readTemplatePackages(root: string): Promise<TemplatePackage[]> {
  const metaPaths = await findFiles(root, 'meta.json')

  return Promise.all(
    metaPaths.map(async (metaPath) => {
      const directory = path.dirname(metaPath)
      const codePath = path.join(directory, 'code.md')
      const [rawMeta, code] = await Promise.all([
        fs.readFile(metaPath, 'utf8'),
        fs.readFile(codePath, 'utf8').catch(() => '')
      ])

      return {
        directory: path.relative(workspaceRoot, directory).replace(/\\/g, '/'),
        meta: JSON.parse(rawMeta),
        code
      }
    })
  )
}

async function findFiles(directory: string, fileName: string): Promise<string[]> {
  const entries = await fs.readdir(directory, { withFileTypes: true })
  const nested = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = path.join(directory, entry.name)
      if (entry.isDirectory()) return findFiles(fullPath, fileName)
      return entry.isFile() && entry.name === fileName ? [fullPath] : []
    })
  )

  return nested.flat().sort((a, b) => a.localeCompare(b, 'zh-CN'))
}

void main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
})
