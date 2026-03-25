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
  let browser = null;

  try {
    console.log("🚀 브라우저 실행 시작");

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
            console.log("📦 데이터 발견");
          }
        } catch (e) {
          // JSON 파싱 실패 시 무시
        }
      }
    });

    await page.goto(
      "https://aion2tool.com/region/%EC%9D%B4%EC%8A%88%ED%83%80%EB%A5%B4/%EC%9E%94%ED%96%A5",
      {
        waitUntil: "domcontentloaded",
        timeout: 60000
      }
    );

    console.log("🌐 페이지 접속 완료");

    await new Promise((resolve) => setTimeout(resolve, 8000));

    console.log("📦 최종 데이터 여부:", result ? "YES" : "NO");

    if (result) {
      return res.json(result);
    } else {
      return res.status(500).json({ error: "데이터 못가져옴" });
    }
  } catch (err) {
    console.error("서버 에러:", err);
    return res.status(500).json({ error: "서버 에러" });
  } finally {
    if (browser) {
      await browser.close();
    }
  }
});

app.listen(PORT, () => {
  console.log(`서버 실행됨: ${PORT}`);
});