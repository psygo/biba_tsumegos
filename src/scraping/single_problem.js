const puppeteer = require("puppeteer")
const fs = require("fs")

const weiqi101login = "https://www.101weiqi.com/login/"
const dummyAccount = "comoti7227@atebin.com" // From [this project](https://github.com/101books/101books.github.io/blob/main/download.sh)

let browser
let page

async function login() {
  browser = await puppeteer.launch()
  page = await browser.newPage()

  await page.goto(weiqi101login)

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

async function fetchProblem(problemId, path = "./problems/") {
  // Go to the Problem Page
  await page.goto(`https://www.101weiqi.com/q/${problemId}/`)

  // Getting the Data into an SGF
  const qqdata = await page.evaluate(() => window.qqdata)
  const sgfString = toSGFCoords(qqdata)

  // Save the SGF to a File
  const filePath = `${path}${qqdata.id}.sgf`
  fs.writeFileSync(filePath, sgfString)
}

async function fetchBookProblems(bookId, levelOrder = false) {
  if (levelOrder) await fetchBookProblemsByLevelOrder(bookId)
}

async function fetchBookProblemsByLevelOrder(bookId) {
  const bookUrl = `https://www.101weiqi.com/book/levelorder/${bookId}`
  await page.goto(bookUrl)

  const initialPagedata = await page.evaluate(() => window.pagedata)

  const pageTotal = Math.ceil(initialPagedata.qtotal / initialPagedata.qstep)

  for (let i = 1; i < pageTotal; i++) {
    const bookUrlWithPage = `${bookUrl}?page=${i}`
    console.log(bookUrlWithPage)

    await page.goto(bookUrlWithPage)

    const pagedata = await page.evaluate(() => window.pagedata)
    const questionIds = pagedata.qs.map((q) => q.qid)

    for (const id of questionIds) {
      await fetchProblem(id, `./books/${bookId}/`)
    }
  }
}

async function fetchData() {
  await login()

  // await fetchBookProblems(3, true)
  await fetchProblem(17933)

  await browser.close()
}

fetchData()
