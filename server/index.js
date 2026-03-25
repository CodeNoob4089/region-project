const express = require("express");
const cors = require("cors");
const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");

puppeteer.use(StealthPlugin());

const app = express();
app.use(cors());

const PORT = 4000;

app.get("/api/legion", async (req, res) => {
  try {
const browser = await puppeteer.launch({
  headless: true,
  args: [
    "--no-sandbox",
    "--disable-setuid-sandbox",
    "--disable-dev-shm-usage",
    "--disable-gpu"
  ]
});

    const page = await browser.newPage();

    let result = null;

page.on("response", async (response) => {
  const url = response.url();

  if (url.includes("/api/region/")) {
    try {
      const data = await response.json();

      // 🔥 members 있는 것만 가져오기
      if (data.members) {
        result = data;
      }

    } catch (e) {}
  }
});
    await page.goto("https://aion2tool.com/region/이슈타르/잔향", {
      waitUntil: "domcontentloaded"
    });

    // 충분히 기다림
    await new Promise(resolve => setTimeout(resolve, 8000));

    await browser.close();

    if (result) {
      res.json(result);
    } else {
      res.status(500).json({ error: "데이터 못가져옴" });
    }

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "서버 에러" });
  }
});

app.listen(PORT, () => {
  console.log(`서버 실행됨: http://localhost:${PORT}`);
});