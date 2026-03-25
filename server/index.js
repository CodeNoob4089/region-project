const express = require("express");
const cors = require("cors");
const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");

puppeteer.use(StealthPlugin());

const app = express();
app.use(cors());

const PORT = process.env.PORT || 4000;

app.get("/", (req, res) => {
  res.send("서버 정상 작동중 🚀");
});

app.get("/api/legion", async (req, res) => {
  let browser;

  try {
    browser = await puppeteer.launch({
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

          if (data.members && data.members.length > 0) {
            result = data;
          }
        } catch (e) {
          // JSON이 아니거나 읽기 실패하면 무시
        }
      }
    });

    await page.goto("https://aion2tool.com/region/%EC%9D%B4%EC%8A%88%ED%83%80%EB%A5%B4/%EC%9E%94%ED%96%A5", {
      waitUntil: "domcontentloaded",
      timeout: 60000
    });

    await new Promise((resolve) => setTimeout(resolve, 8000));

    if (result) {
      res.json(result);
    } else {
      res.status(500).json({ error: "데이터 못가져옴" });
    }
  } catch (err) {
    console.error("서버 에러:", err);
    res.status(500).json({ error: "서버 에러" });
  } finally {
    if (browser) {
      await browser.close();
    }
  }
});

app.listen(PORT, () => {
  console.log(`서버 실행됨: ${PORT}`);
});