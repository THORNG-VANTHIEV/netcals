import {test,expect} from '@playwright/test'

test('installed app caches calculators for offline use',async({page,context})=>{
  await page.setViewportSize({width:390,height:844})
  await page.goto('#/tools/subnet-calculator')
  const manifest=await page.evaluate(async()=>{
    const link=document.querySelector<HTMLLinkElement>('link[rel="manifest"]')
    return link?fetch(link.href).then(response=>response.json()):null
  })
  expect(manifest).toMatchObject({start_url:'/netcals/#/',scope:'/netcals/',display:'standalone'})
  expect(manifest.icons).toEqual(expect.arrayContaining([
    expect.objectContaining({sizes:'192x192'}),
    expect.objectContaining({sizes:'512x512',purpose:'maskable'}),
  ]))

  await page.evaluate(()=>navigator.serviceWorker.ready)
  await page.reload()
  await expect.poll(()=>page.evaluate(()=>Boolean(navigator.serviceWorker.controller)),{timeout:15000}).toBe(true)
  await context.setOffline(true)
  await page.reload()
  await expect(page.locator('main h1')).toHaveText('Subnet Calculator')
  await page.getByLabel('IPv4 address').fill('192.168.2.10')
  await page.getByRole('button',{name:'Calculate subnet'}).click()
  await expect(page.getByText('192.168.2.0/26',{exact:true})).toBeVisible()
  await page.getByRole('navigation',{name:'Mobile navigation'}).getByRole('link',{name:'FLSM'}).click()
  await expect(page.locator('main h1')).toHaveText('FLSM Calculator')
  const launch=await context.newPage()
  await launch.goto('/netcals/#/')
  await expect(launch.locator('main h1')).toHaveText('Network math, made clear.')
})

test('install control offers a browser prompt or manual steps',async({page})=>{
  await page.setViewportSize({width:390,height:844})
  await page.goto('#/')
  await page.getByRole('button',{name:'More tools'}).click()
  const panel=page.locator('.sidebar-install')
  await panel.getByRole('button',{name:'Install app'}).click()
  await expect(panel.getByRole('status')).toContainText('browser menu')

  await page.evaluate(()=>{
    const event=new Event('beforeinstallprompt',{cancelable:true}) as Event & {
      prompt:()=>Promise<void>
      userChoice:Promise<{outcome:'accepted'}>
    }
    event.prompt=async()=>{sessionStorage.setItem('install-prompt-called','yes')}
    event.userChoice=Promise.resolve({outcome:'accepted'})
    window.dispatchEvent(event)
  })
  await panel.getByRole('button',{name:'Install app'}).click()
  await expect.poll(()=>page.evaluate(()=>sessionStorage.getItem('install-prompt-called'))).toBe('yes')
})
