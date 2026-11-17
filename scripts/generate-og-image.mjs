import {readFile,mkdir} from 'node:fs/promises'
import {fileURLToPath} from 'node:url'
import {dirname,join} from 'node:path'
import {chromium} from '@playwright/test'

const projectRoot=join(dirname(fileURLToPath(import.meta.url)),'..')
const html=await readFile(join(projectRoot,'scripts/og-image.html'),'utf8')
const output=join(projectRoot,'public/og-image.png')
await mkdir(dirname(output),{recursive:true})
const browser=await chromium.launch()
try{
  const page=await browser.newPage({viewport:{width:1200,height:630},deviceScaleFactor:1})
  await page.setContent(html)
  await page.screenshot({path:output,animations:'disabled'})
  console.log(`Generated ${output}`)
}finally{await browser.close()}
