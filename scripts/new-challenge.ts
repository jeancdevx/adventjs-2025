import { existsSync } from 'node:fs'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { chromium } from 'playwright'

const ADVENTJS_URL = 'https://adventjs.dev/es/challenges/2025'

const DIFFICULTY_MAP: Record<string, string> = {
  FACIL: '🟢 Fácil',
  MEDIO: '🟡 Medio',
  DIFICIL: '🔴 Difícil',
  'MUY DIFICIL': '🟣 Muy Difícil'
}

const normalizeDifficulty = (text: string): string => {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
}

const FILTER_TEXTS = [
  'lemoncode',
  'máster front end',
  'sponsor',
  'midu.link',
  'sube de nivel',
  'carrera profesional',
  'edición'
]

interface ChallengeData {
  number: number
  title: string
  difficulty: string
  description: string
  imageUrl: string | null
  functionTemplate: string
}

async function scrapeChallenge(
  challengeNumber: number
): Promise<ChallengeData> {
  console.log(`🚀 Iniciando scraping del reto #${challengeNumber}...`)

  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage()

  try {
    const url = `${ADVENTJS_URL}/${challengeNumber}`
    console.log(`📡 Accediendo a ${url}`)

    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 })
    await page.waitForSelector('h1', { timeout: 30000 })
    await page.waitForTimeout(2000)

    const title = await extractTitle(page)
    const difficulty = await extractDifficulty(page)
    const description = await extractDescription(page)
    const imageUrl = await extractImageUrl(page)
    const functionTemplate = await extractFunctionTemplate(page)

    console.log(`✅ Datos extraídos correctamente`)

    return {
      number: challengeNumber,
      title,
      difficulty,
      description,
      imageUrl,
      functionTemplate
    }
  } finally {
    await browser.close()
  }
}

async function extractTitle(page: any): Promise<string> {
  const fullTitle = (await page.locator('h1').first().textContent()) || ''
  const titleMatch = fullTitle.match(/RETO #\d+:\s*(.+)/i)
  return (titleMatch ? titleMatch[1] : fullTitle)
    .replace(/chevron-down/gi, '')
    .trim()
}

async function extractDifficulty(page: any): Promise<string> {
  try {
    const selector =
      'button:has-text("FÁCIL"), button:has-text("MEDIO"), button:has-text("DIFÍCIL"), span:has-text("FÁCIL"), span:has-text("MEDIO"), span:has-text("DIFÍCIL")'
    const difficultyEl = await page.locator(selector).first()
    if (await difficultyEl.isVisible({ timeout: 3000 })) {
      return ((await difficultyEl.textContent()) || 'FÁCIL')
        .trim()
        .toUpperCase()
    }
  } catch {
    console.log('⚠️ No se pudo extraer la dificultad, usando FÁCIL por defecto')
  }
  return 'FÁCIL'
}

async function extractDescription(page: any): Promise<string> {
  return await page.evaluate((filterTexts: string[]) => {
    const container =
      document.querySelector('[role="tabpanel"]') ||
      document.querySelector('main') ||
      document.body
    const elements = container?.querySelectorAll('p, pre, ul, ol')
    let content = ''

    elements?.forEach((el) => {
      const text = el.textContent?.toLowerCase() || ''
      if (filterTexts.some((filter) => text.includes(filter))) return

      if (el.tagName === 'PRE') {
        content += '\n```javascript\n' + el.textContent?.trim() + '\n```\n\n'
      } else if (el.tagName === 'UL' || el.tagName === 'OL') {
        el.querySelectorAll('li').forEach((li) => {
          const liText = li.textContent?.trim() || ''
          if (
            !filterTexts.some((filter) => liText.toLowerCase().includes(filter))
          ) {
            content += `- ${liText}\n`
          }
        })
        content += '\n'
      } else {
        const pText = el.textContent?.trim() || ''
        if (pText) content += pText + '\n\n'
      }
    })

    return content.trim()
  }, FILTER_TEXTS)
}

async function extractImageUrl(page: any): Promise<string | null> {
  try {
    const html = await page.content()
    const match = html.match(/\/stickers\/(\d+-[\w-]+\.webp)/)
    if (match) {
      const url = `https://adventjs.dev/stickers/${match[1]}`
      console.log(`🔍 Imagen encontrada: ${url}`)
      return url
    }
    console.log('⚠️ No se encontró imagen del sticker')
  } catch (error) {
    console.log(`⚠️ Error buscando imagen: ${error}`)
  }
  return null
}

async function extractFunctionTemplate(page: any): Promise<string> {
  try {
    const tsTab = page
      .locator('button:has-text("main.ts"), [role="tab"]:has-text("main.ts")')
      .first()
    if (await tsTab.isVisible({ timeout: 3000 })) {
      await tsTab.click()
      console.log('📝 Cambiando a tab de TypeScript...')
      await page.waitForTimeout(1500)
    }

    const template = await page.evaluate(() => {
      const lines = document.querySelectorAll('.view-lines .view-line')
      if (lines.length > 0) {
        return Array.from(lines)
          .map((line) => line.textContent || '')
          .join('\n')
      }
      const textarea = document.querySelector('textarea.inputarea')
      return textarea ? (textarea as HTMLTextAreaElement).value : ''
    })

    if (template) {
      console.log('✅ Función template extraída del editor')
      return template
        .replace(/\u00a0/g, ' ')
        .replace(/[\u200B-\u200D\uFEFF]/g, '')
        .trim()
    }
    console.log('⚠️ No se pudo extraer la función del editor')
  } catch (error) {
    console.log(`⚠️ Error extrayendo función: ${error}`)
  }
  return ''
}

async function downloadImage(url: string, destPath: string): Promise<boolean> {
  try {
    console.log(`📥 Descargando imagen desde ${url}`)
    const response = await fetch(url)
    if (!response.ok) {
      console.log(`⚠️ Error al descargar imagen: ${response.status}`)
      return false
    }
    await writeFile(destPath, Buffer.from(await response.arrayBuffer()))
    console.log(`🖼️ Imagen guardada en ${destPath}`)
    return true
  } catch (error) {
    console.log(`⚠️ Error descargando imagen: ${error}`)
    return false
  }
}

async function createChallengeFiles(data: ChallengeData): Promise<void> {
  const num = String(data.number).padStart(2, '0')
  const folderName = `${num}-challenge`
  const folderPath = path.join(process.cwd(), folderName)
  const publicPath = path.join(process.cwd(), 'public')

  if (!existsSync(folderPath)) {
    await mkdir(folderPath, { recursive: true })
    console.log(`📁 Carpeta ${folderName}/ creada`)
  }

  if (!existsSync(publicPath)) {
    await mkdir(publicPath, { recursive: true })
  }

  if (data.imageUrl) {
    await downloadImage(
      data.imageUrl,
      path.join(publicPath, `${num}-challenge.webp`)
    )
  }

  const challengeMd = `# Reto ${num}: ${data.title}\n\nNivel: ${data.difficulty}\n\n${data.description}\n`
  await writeFile(path.join(folderPath, 'challenge.md'), challengeMd, 'utf-8')
  console.log(`📝 Archivo ${folderName}/challenge.md creado`)

  const indexTs = data.functionTemplate || '// TODO: Implementar solución'
  await writeFile(path.join(folderPath, 'index.ts'), indexTs + '\n', 'utf-8')
  console.log(`📝 Archivo ${folderName}/index.ts creado`)
}

async function updateReadme(data: ChallengeData): Promise<void> {
  const readmePath = path.join(process.cwd(), 'README.md')
  if (!existsSync(readmePath)) {
    console.log(`⚠️ README.md no encontrado, saltando actualización`)
    return
  }

  let readme = await readFile(readmePath, 'utf-8')
  const num = String(data.number).padStart(2, '0')
  const difficulty =
    DIFFICULTY_MAP[normalizeDifficulty(data.difficulty)] || '⬜ -'

  const rowPattern = new RegExp(
    `\\| ${num}\\s*\\|[^|]*🔒[^|]*\\| Próximamente\\s*\\|[^|]*\\|[^|]*\\|[^|]*\\|[^|]*\\|`,
    'g'
  )

  const newRow = `| ${num}  | <img src="./public/${num}-challenge.webp" width="80"/> | ${data.title} | ${difficulty} | [Ver](./${num}-challenge/index.ts) | [Ver reto](https://adventjs.dev/es/challenges/2025/${data.number}) | ✅ |`

  if (rowPattern.test(readme)) {
    readme = readme.replace(rowPattern, newRow)
    await writeFile(readmePath, readme, 'utf-8')
    console.log(`📋 README.md actualizado con el reto #${data.number}`)
  } else {
    console.log(
      `⚠️ No se encontró la fila del reto #${data.number} en el README`
    )
  }
}

async function main(): Promise<void> {
  const args = process.argv.slice(2)

  if (args.length === 0) {
    console.log(`
🎄 AdventJS Challenge Generator

Uso: npm run new-challenge <número>

Ejemplo:
  npm run new-challenge 3
  npm run new-challenge 15
`)
    process.exit(0)
  }

  const challengeNumber = parseInt(args[0], 10)

  if (isNaN(challengeNumber) || challengeNumber < 1 || challengeNumber > 25) {
    console.error('❌ Por favor, proporciona un número de reto válido (1-25)')
    process.exit(1)
  }

  try {
    const data = await scrapeChallenge(challengeNumber)
    await createChallengeFiles(data)
    await updateReadme(data)

    console.log(`
🎉 ¡Reto #${challengeNumber} configurado correctamente!

Archivos creados:
  📁 ${String(challengeNumber).padStart(2, '0')}-challenge/
     ├── challenge.md
     └── index.ts

¡Buena suerte con el reto! 🎄
`)
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

main()
