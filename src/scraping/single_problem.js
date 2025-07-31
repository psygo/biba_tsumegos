const puppeteer = require("puppeteer")
const fs = require("fs")

const weiqi101login = "https://www.101weiqi.com/login/"
// From [this project](https://github.com/101books/101books.github.io/blob/main/download.sh)
const dummyAccounts = [
  "comoti7227@atebin.com",
  "fimowal358@apn7.com",
  "mahet70277@bacaki.com",
  "wojaga4524@calunia.com",
  "sababib768@cartep.com",
  "fetayi5707@furnato.com",
  "rarejik433@apn7.com",
  "riyodov302@alientex.com",
  "perakax293@mvpalace.com",
  "kowon74620@alientex.com",
]

let browser
let page

async function login() {
  browser = await puppeteer.launch()
  page = await browser.newPage()

  await page.goto(weiqi101login)

  await page.type(`input[x-model="loginName"]`, dummyAccounts[1])
  await page.type(`input[x-model="loginPassword"]`, dummyAccounts[1])

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

async function fetchProblem(problemId, path = "./problems/", filename = "") {
  // Go to the Problem Page
  await page.goto(`https://www.101weiqi.com/q/${problemId}/`)

  // Getting the Data into an SGF
  const qqdata = await page.evaluate(() => window.qqdata)
  const sgfString = toSGFCoords(qqdata)

  // Save the SGF to a File
  const name = filename === "" ? qqdata.id : filename
  const filePath = `${path}${name}.sgf`
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

    let count = 1
    for (const id of questionIds) {
      setTimeout(async () => {
        await fetchProblem(
          id,
          `../sgf/101weiqi_books/${bookId}/`,
          count.toString()
        )
      }, 1_000) // Wait a bit to avoid overwhelming the server
      count++
    }
  }
}

async function fetchData() {
  await login()

  await fetchBookProblems(3, true)
  // await fetchProblem(17933)

  await browser.close()
}

fetchData()
