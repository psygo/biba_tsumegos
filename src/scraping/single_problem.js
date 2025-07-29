const puppeteer = require("puppeteer")

const sampleProblemUrl = "https://www.101weiqi.com/q/17773/"
const weiqi101signup = "https://www.101weiqi.com/login/"

const dummyAccount = "comoti7227@atebin.com"

let browser
let page

async function login() {
  browser = await puppeteer.launch()
  page = await browser.newPage()

  // Login

  await page.goto(weiqi101signup)

  await page.type(`input[x-model="loginName"]`, dummyAccount)
  await page.type(`input[x-model="loginPassword"]`, dummyAccount)

  await page.click(`.login-button.active`)

  await page.waitForNavigation()
}

function toSGFCoords(data) {
  const blackCoords = data.content[0]
  const whiteCoords = data.content[1]
  const sgfPrefix = ";GM[1]FF[4]CA[UTF-8]SZ[19]"

  const blackStones = blackCoords.map((coord) => `[${coord}]`).join("")
  const whiteStones = whiteCoords.map((coord) => `[${coord}]`).join("")

  const sgf = `(${sgfPrefix}AB${blackStones}AW${whiteStones})`
  
  return sgf
}

async function fetchProblem() {
  await login()

  // Go to the Problem Page

  await page.goto(sampleProblemUrl)

  // Getting the Data into an SGF

  const qqdata = await page.evaluate(() => window.qqdata)
  console.log(toSGFCoords(qqdata))

  await browser.close()
}

fetchProblem()
