import {createServer} from 'node:http'
import {readFile} from 'node:fs/promises'
import {extname,resolve,sep} from 'node:path'

const root=resolve('dist')
const base='/netcals/'
const port=4175
const types={
  '.css':'text/css',
  '.html':'text/html',
  '.js':'text/javascript',
  '.json':'application/json',
  '.png':'image/png',
  '.svg':'image/svg+xml',
  '.webmanifest':'application/manifest+json',
  '.woff':'font/woff',
  '.woff2':'font/woff2',
}

createServer(async(request,response)=>{
  const pathname=new URL(request.url||'/',`http://${request.headers.host}`).pathname
  if(!pathname.startsWith(base)){response.writeHead(404).end();return}
  const relative=decodeURIComponent(pathname.slice(base.length))||'index.html'
  const file=resolve(root,relative)
  if(file!==root&&!file.startsWith(root+sep)){response.writeHead(403).end();return}
  try{
    const body=await readFile(file)
    response.writeHead(200,{'Content-Type':types[extname(file)]||'application/octet-stream','Cache-Control':'no-cache'})
    response.end(body)
  }catch{response.writeHead(404).end()}
}).listen(port,'127.0.0.1',()=>console.log(`PWA preview ready at http://127.0.0.1:${port}${base}`))
