const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
import assert from 'node:assert/strict';
const browser=await chromium.launch({channel:'msedge',headless:true});
const page=await browser.newPage({hasTouch:true,viewport:{width:1440,height:1000}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.goto('http://localhost:3000');await page.getByRole('button',{name:/Arjun Rao/}).waitFor();
assert.equal(await page.getByRole('button',{name:/Reveal scripted/}).count(),0);await page.screenshot({path:'desktop.png',fullPage:true});
await page.getByRole('button',{name:/Fielder 1: Point/}).click();await page.getByRole('button',{name:'Place at Mid-off, inside circle',exact:true}).click();
assert.equal(await page.getByRole('button',{name:/Fielder 1: Mid-off/}).count(),1);
await page.getByRole('button',{name:/Undo/}).click();assert.equal(await page.getByRole('button',{name:/Fielder 1: Point/}).count(),1);
await page.getByLabel('Select fielder').selectOption('0');assert.equal(await page.getByLabel('Place fielder at position').locator('option[value="cover"]').getAttribute('disabled'),'');
const source=await page.getByRole('button',{name:/Fielder 1: Point/}).boundingBox();const dest=await page.getByRole('button',{name:'Place at Mid-off, inside circle',exact:true}).boundingBox();
await page.mouse.move(source.x+source.width/2,source.y+source.height/2);await page.mouse.down();await page.mouse.move(dest.x+dest.width/2,dest.y+dest.height/2,{steps:8});await page.mouse.up();
assert.equal(await page.getByRole('button',{name:/Fielder 1: Mid-off/}).count(),1);
await page.getByRole('button',{name:'Reset field',exact:true}).click();
await page.locator('#reason').fill('23 runs from 12 balls: protect the boundary, accept singles and reserve Dev for the final over.');
await page.getByRole('button',{name:/Lock my captaincy/}).click();await page.getByText('Demo analysis',{exact:true}).waitFor();
assert.equal(await page.getByLabel('Select fielder').isDisabled(),true);await page.screenshot({path:'desktop-analysis.png',fullPage:true});
await page.getByRole('button',{name:/Reveal scripted/}).click();await page.getByText('SCRIPTED SCENARIO OUTCOME',{exact:true}).waitFor();
await page.getByRole('button',{name:'My captaincy',exact:true}).click();assert.ok((await page.locator('body').innerText()).includes('The final twelve'));
await page.getByRole('button',{name:'Decision Lab',exact:true}).click();await page.getByLabel('Choose scenario').selectOption('middle');
assert.equal(await page.getByLabel('Batter handedness').inputValue(),'L');
const off=await page.getByRole('button',{name:'Place at Deep cover, outside circle',exact:true}).locator('circle').first().getAttribute('cx');assert.equal(off,'83');
await page.getByLabel('Toggle color theme').click();await page.screenshot({path:'desktop-light.png',fullPage:true});
await page.setViewportSize({width:390,height:844});
await page.getByRole('button',{name:/Fielder 1: Point/}).tap();await page.getByRole('button',{name:'Place at Mid-off, inside circle',exact:true}).tap();assert.equal(await page.getByRole('button',{name:/Fielder 1: Mid-off/}).count(),1);
assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth));await page.screenshot({path:'mobile-light.png',fullPage:true});
assert.deepEqual(errors,[]);console.log('PASS desktop/mobile tap, drag, undo, reset, duplicate prevention, mirror, theme, lock, demo analysis, reveal, history; no JS errors or mobile horizontal overflow');await browser.close();





