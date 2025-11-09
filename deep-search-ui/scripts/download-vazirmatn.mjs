import { createHash } from 'node:crypto'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

const FONT_DIR = path.resolve(process.cwd(), 'public', 'fonts')
const PACKAGE_ROOT = path.resolve(process.cwd(), 'node_modules', 'vazirmatn')

const FONT_SOURCES = [
  {
    sourcePath: path.join(PACKAGE_ROOT, 'fonts', 'webfonts', 'Vazirmatn[wght].woff2'),
    fileName: 'Vazirmatn[wght].woff2',
    description: 'Vazirmatn variable weight (woff2)',
  },
  {
    sourcePath: path.join(PACKAGE_ROOT, 'fonts', 'variable', 'Vazirmatn[wght].ttf'),
    fileName: 'Vazirmatn-VariableFont_wght.ttf',
    description: 'Vazirmatn variable weight (ttf fallback)',
  },
]

const hashBuffer = (buffer) =>
  createHash('sha256').update(buffer).digest('hex')

async function writeIfChanged(filePath, buffer) {
  try {
    const existing = await readFile(filePath)

    if (existing.length === buffer.length) {
      const [existingHash, newHash] = [existing, buffer].map(hashBuffer)

      if (existingHash === newHash) {
        console.log(`✔ Font already up to date: ${path.basename(filePath)}`)
        return
      }
    }
  } catch (error) {
    if (error && error.code !== 'ENOENT') {
      throw error
    }
  }

  await writeFile(filePath, buffer)
  console.log(`⬇ Prepared ${path.basename(filePath)} (${buffer.length} bytes)`) // eslint-disable-line no-console
}

async function downloadFont(source) {
  const buffer = await readFile(source.sourcePath).catch((error) => {
    if (error && error.code === 'ENOENT') {
      throw new Error(
        `Font source not found at ${source.sourcePath}. Ensure the 'vazirmatn' package is installed before running the build.`,
      )
    }

    throw error
  })

  const filePath = path.join(FONT_DIR, source.fileName)
  await writeIfChanged(filePath, buffer)
}

async function main() {
  await mkdir(FONT_DIR, { recursive: true })

  for (const source of FONT_SOURCES) {
    console.log(`⏳ Preparing ${source.description}...`)
    await downloadFont(source)
  }

  console.log('✅ Vazirmatn fonts are ready.')
}

main().catch((error) => {
  console.error('❌ Failed to prepare Vazirmatn fonts:', error)
  process.exitCode = 1
})
