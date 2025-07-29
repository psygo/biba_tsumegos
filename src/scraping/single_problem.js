const puppeteer = require("puppeteer")

/**
 * From [this answer](https://stackoverflow.com/a/79717008/4756173)
 */
function parseGamePos(config) {
  if (Array.isArray(config.content)) return config.content

  const i = config.ru + 1
  const key = `101${i}${i}${i}`
  const bytes = atob(String(config.content).replace(/[\t\n\f\r ]+/g, ""))
  const output = []

  let keyIndex = 0
  for (let n = 0; n < i.length; ++n) {
    output.push(
      String.fromCharCode(bytes.charCodeAt(n) ^ key.charCodeAt(keyIndex))
    )

    keyIndex = (keyIndex + 1) % key.length
  }

  return JSON.parse(output.join(""))
}

const sampleProblemUrl = "https://www.101weiqi.com/q/17773/"
const weiqi101signup = "https://www.101weiqi.com/login/"

const dummyAccount = "comoti7227@atebin.com"

async function fetchProblem() {
  const browser = await puppeteer.launch()
  const page = await browser.newPage()

  await page.goto(weiqi101signup)
  
  await page.type(`input[x-model="loginName"]`, dummyAccount)
  await page.type(`input[x-model="loginPassword"]`, dummyAccount)

  await page.click(`.login-button.active`)
  
  await page.waitForNavigation()

  await page.goto(sampleProblemUrl)
  const bodyHtml = await page.evaluate(() => document.body.innerHTML);
  console.log(bodyHtml);

  
  // const req = await fetch(url)
  // const body = await req.text()

  await browser.close();

  // console.log(body)
  // const matches = body.match(/script/)
  // console.log(matches)
  // const idx = body.indexOf('qqdata')
  // if (idx !== -1) {
  //   console.log(body.slice(idx - 100, idx + 500))
  // } else {
  //   console.log("qqdata not found in HTML at all")
  // }

  // // Try a more flexible regex (supports var/let/const, optional semicolon)
  // const match = body.match(/(?:var|let|const)\s+qqdata\s*=\s*({[\s\S]*?})\s*;/)
  // if (match) {
  //   try {
  //     const qqdata = JSON.parse(match[1])
  //     console.log(qqdata)
  //   } catch (e) {
  //     console.error("Failed to parse qqdata:", e)
  //     console.log("Extracted string:", match[1])
  //   }
  // } else {
  //   console.log("qqdata not found with regex")
  // }

  // const dom = new JSDOM(body, {
  //   runScripts: "dangerously",
  //   timeout: 10_000
  // })
  // const window = dom.window
  // console.log(window)
  // console.log(window.qqdata)
}

// console.log("Fetching game data...")

fetchProblem()
