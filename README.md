# Frontend Engineer Exam

這是一份 Yile 前端工程師的徵才專案，會需根據規則及設計檔完成頁面需求。

## ⭐️ 需求

### 框架

1. 語言：Javascript
2. Framework：
   1. 建議使用 React.js / Next.js，使用 Vue.js 亦可接受

### CSS

可以選擇以下其一或者搭配做為使用

1. [Material UI](https://mui.com/material-ui/)
2. [Sass](https://sass-lang.com/)
3. [Tailwindcss](https://tailwindcss.com/)

### Coding Style

採用 [Google Coding Style](https://google.github.io/styleguide/) 或 [Airbnb Style](https://github.com/airbnb/javascript)，我們將會審查你的程式碼是否符合風格規範

## 📝 實作描述

- 請 Fork 此專案做開發
- 根據 [Figma](https://www.figma.com/file/VcTqAK0x3JBi9nMvqN9YXJ/Web-Frontend-Developer-Exam?type=design&node-id=0%3A1&mode=design&t=EAnp3AAU1aqJ66e2-1) 實作頁面，請 `登入` 帳號才可看到實作細節
- 若有任何優化、更好方式請自由發揮，但確保基本功能皆有達成需求

## ✅ 提交說明

1. 請將專案上傳至 Github，提交 Repositories 連結給 HR，我們將會閱讀你的程式碼
2. 請提供一份 README 文件說明
   1. 如何執行此專案
   2. 專案架構、邏輯說明
   3. 專案遇到的困難、問題及解決方法
3. 請回傳給 HR，內容需包含 Github Repositories Link

## 🥇 加分項目

- 加載資料時的過渡表現
- 細節動畫表現
- 部署至任一平台以供成果檢視，例如：Heroku、AWS S3、GCS、Github Page …… 等

## ⚠️ 注意事項

- 素材為本公司內部所有，除此次線上考使用，請勿另用他途。

## ⚙️ API

### Job List [GET] `/api/v1/jobs`

工作列表

**Parameter**

| Name | Description |
| ---------------- | -------------- |
| pre_page         | 每頁顯示筆數     |
| page             | 指定頁面頁數     |
| company_name     | 公司名稱        |
| education_level  | 教育程度 id     |
| salary_level     | 薪資範圍 id     |

**Response**

```json
{
  "data": [
    {
      "id": "1",
      "companyName": "立刻科技",
      "jobTitle": "資深前端工程師",
      "educationId": 4,
      "salaryId": 3,
      "preview": "招募經驗豐富的前端工程師，共創卓越網頁體驗！",
    }
  ],
  "total": 1
}
```

---

### Education Level List [GET] `/api/v1/educationLevelList`

教育程度列表

**Response**

```json
[
  {
     "id": "1", "label": "國小"
  },
  {
     "id": "2", "label": "國中"
  },
  {
     "id": "3", "label": "高中"
  },
  {
     "id": "4", "label": "大學"
  },
  {
     "id": "5", "label": "碩士"
  },
  {
     "id": "6", "label": "博士"
  }
]
```

---

### Salary Level List [GET] `/api/v1/salaryLevelList`

薪資範圍列表

**Response**

```json
[
  {
    "id": "1", "label": "待遇面議"
  },
  {
    "id": "2", "label": "月薪 40,000 ~ 60,000 元"
  },
  {
    "id": "3", "label": "月薪 70,000 ~ 100,000 元"
  },
  {
    "id": "4", "label": "年薪 800,000 ~ 1,000,000 元"
  },
  {
    "id": "5", "label": "年薪 800,000 ~ 1,500,000 元"
  },
  {
    "id": "6", "label": "年薪 1,500,000 ~ 2,000,000 元"
  },
  {
    "id": "7", "label": "年薪 2,000,000 ~ 2,500,000 元"
  }
]
```

---

### Job [GET] `/api/v1/jobs/:id`

單一工作資訊

**Response**

```json
{
  "id": "6",
  "description": "<h1>貨運操作員</h1><h2>工作地點：公司總部 - 台北市</h2><h2>職責與要求</h2><ul><li>負責倉儲內的物品搬運、分裝、包裝及出貨作業，確保貨物的準確性和完整性。<br />遵循公司的作業流程和安全規範，保障倉庫內的工作環境。<br />與團隊成員合作，確保倉儲操作的順暢進行。<br />需具備基本的電腦操作能力，能使用相關SaaS系統進行庫存管理。<br />需要有良好的溝通協調能力，能有效地與其他部門合作，確保整體物流運作的協調性。<br />對倉儲物流行業有興趣，願意學習並接受公司提供的培訓。</li></ul><h2>資格</h2><ul><li>至少高中畢業，具備相關物流或倉儲操作經驗者優先考慮。<br />具有貨運相關證照者尤佳。<br />對工作積極負責，有良好的工作態度和團隊協作精神。<br />願意接受輪班工作，能夠適應倉儲作業的體力需求。</li></ul><h2>我們提供</h2><ul><li>充滿挑戰性的工作環境，與國際化的專業團隊一同合作。<br />完善的培訓體系，協助您提升相關技能和知識。<br />良好的晉升機會，公司快速發展將為您提供更多職涯發展空間。<br />公司福利包括勞健保、團體保險、員工餐飲補助等。</li></ul><p>如果您渴望挑戰自我，想要加入一個充滿活力和機會的團隊，請將您的履歷寄至 <a href=\"mailto:hr@jenjanlogistics.com\">hr@jenjanlogistics.com</a>，我們期待與您攜手共創物流行業的未來。<br /><br />【JenJan真站電商衛星倉儲物流】期待您的加入！</p>",
  "companyPhoto": [
    "https://picsum.photos/250/150",
    "https://picsum.photos/250/150",
    "https://picsum.photos/250/150",
    "https://picsum.photos/250/150",
    "https://picsum.photos/250/150"
  ],
  "jobTitle": "廚師助手",
  "companyName": "餐飲樂活"
}
```

---

## 🚀 實作說明

職缺列表 + 詳細資訊 Popup，使用 **Next.js 15（Pages Router）+ React 18 + MUI 5**，程式風格為 Airbnb（ESLint）。API 由內建的小後端（Next.js API Routes）提供，**不需要另外啟動後端或設定資料庫**。

### 環境需求

- Node.js **18.18 以上**（建議 20 LTS）
- Yarn 1.x（`npm install -g yarn`）
- 需要網路：安裝套件時；執行時會載入 Google Fonts（Noto Sans TC）與示範職缺圖片（picsum.photos）。離線也能執行，只是字型會用系統字型、圖片顯示佔位圖示。

### 如何執行

```bash
git clone <此專案的 GitHub 網址>
cd <專案資料夾>
yarn install
yarn dev
```

接著用瀏覽器開啟 <http://localhost:3000>（繁體中文）、<http://localhost:3000/en>（English）、<http://localhost:3000/ja>（日本語）。

| 指令 | 說明 |
| --- | --- |
| `yarn dev` | 開發模式（http://localhost:3000，修改程式會自動更新） |
| `yarn build` | 正式建置 |
| `yarn start` | 以正式建置啟動（先執行 `yarn build`；換埠號：`yarn start -p 4000`） |
| `yarn test` | 執行測試（單元、元件、API、安全、效能預算；已建置時會多檢查建置結果） |
| `yarn lint` | ESLint（Airbnb Style） |
| `yarn bench` | Lighthouse 跑分（先 `yarn build`；需要 Chrome 或 Edge，找不到時設定 `CHROME_PATH`） |

快速確認 API 運作（開發或正式模式皆可）：

```bash
curl "http://localhost:3000/api/v1/jobs?page=1&pre_page=6"
curl "http://localhost:3000/api/v1/jobs/1"
curl "http://localhost:3000/api/v1/educationLevelList"
curl "http://localhost:3000/api/v1/salaryLevelList"
```

常見問題：埠號 3000 被占用時，Next.js 會提示，改用 `yarn dev -p 3001`。

### 部署

可直接部署到 Vercel（匯入 GitHub 專案即可，框架會自動偵測為 Next.js，API Routes 一併上線），或任何能執行 Node 的主機（`yarn build && yarn start`）。選用環境變數：`NEXT_PUBLIC_SITE_URL`（網站的絕對網址，用於各語言的 `hreflang`；部署在 Vercel 時可省略）。

### 多國語言

支援繁體中文（zh-TW，預設）、English（en）、日本語（ja）。網址帶語系前綴：`/`（繁中）、`/en`、`/ja`。第一次進入 `/` 時依瀏覽器 `Accept-Language` 自動導向最適合的語系，並以 `NEXT_LOCALE` cookie 記住；不支援的語言回到繁中。畫面上不放語言選單，完全由網址與瀏覽器語言決定。職缺本身的內容（公司、職稱、說明）來自 API，維持原文。

### 專案架構

```
src/
├── pages/        # Next.js 頁面（index、_app、_document）與 API Routes（pages/api/v1/*）
├── server/       # 伺服器端：職缺資料（data/）、篩選與分頁邏輯、API handler、限流
├── api/          # 前端 fetch 封裝（列表、單筆、教育程度、薪水範圍）
├── hooks/        # useJobs（快取、預取下一頁）、useJob（快取、預取）、useOptions 等
├── components/   # Hero、FilterBar、JobCard、JobGrid、JobDialog、ImageCarousel、ImagePreview…
├── i18n/         # 多國語言：語系設定、訊息檔（zh-TW／en／ja）、Provider 與 useI18n
├── theme/        # MUI theme（色票、字型）
├── utils/        # 淨化 HTML、圖片網址檢查等小工具
├── assets/       # Hero 分層素材（WebP／SVG）
├── figma/        # 設計稿截圖與原始素材（僅供對照，不參與建置）
└── __tests__/    # 安全、效能預算與 Lighthouse 測試
docs/             # 規格、設計、架構、測試、安全、效能文件
scripts/          # lighthouse.js（yarn bench）
```

資料流：瀏覽器 → `src/api`（fetch `/api/v1/*`）→ Next.js API Routes → `src/server`（資料與邏輯）；前端只拿到 API 回傳的欄位，資料本身不會打包進前端程式。

- **列表**：桌機每頁 6 筆（3 欄）、手機每頁 4 筆（1 欄），手機版移除 Filter（依設計稿）。換頁不改變網址。
- **篩選**：按下「條件搜尋」才套用公司名稱／教育程度／薪水範圍，並回到第 1 頁。
- **詳細資訊**：點「查看細節」開啟 Popup（呼叫 `GET /api/v1/jobs/:id` 取得文案與圖片）；輪播每次移動一張，圖片可點開全螢幕預覽（放大縮小、旋轉、拖拉、切換）；職缺說明的 HTML 經 DOMPurify 淨化後才渲染。
- **加分項目**
  - 載入過渡：列表區 Loading 動畫與骨架、換頁保留舊內容並淡化、圖片載入骨架、Popup 骨架、首屏圖片全部載入後才淡入。
  - 細節動畫：Logo 1.5 秒縮放 Loop、人物眼球跟隨滑鼠、卡片淡入與 hover、輪播與預覽過場；尊重系統「減少動態」設定。
  - 部署：可直接部署到 Vercel（見上）。

### 遇到的問題與解法

1. **Figma 需登入**：改由設計稿截圖與使用者提供的 SVG 素材取得版面、色票、字級與互動註記。
2. **Airbnb ESLint 與 CRA 衝突**：CRA 內建 plugin 與 Airbnb 重複載入 `react` plugin；改用 Next.js 後以獨立的 `yarn lint`（ESLint 8 + Airbnb）檢查，整個 `src` 零錯誤。
3. **API 不外露資料／需要小後端**：題目附的 miragejs 在瀏覽器內模擬 API，資料會被打包進前端。改用 Next.js API Routes 實作同樣的 4 支 API，資料與篩選／分頁邏輯只在伺服器；列表不回傳 `description`、`companyPhoto`，詳細資料不回傳 `preview` 等欄位；只允許 GET、限流、輸入上限、錯誤只回通用訊息，並用測試確認前端不會 import 伺服器資料、client bundle 不含職缺資料。
4. **`description` 為 HTML 字串**：渲染前以 DOMPurify 淨化（禁用 style／表單／iframe、擋 `javascript:` 連結），並設定 CSP 與其他安全標頭。
5. **眼球跟隨滑鼠**：設計稿的人物眼窩是鏤空的，因此把眼球放在人物圖層下方、以眼窩當遮罩；眼球上緣加一塊藏在眼皮下的蓋片，移動時不會露出縫隙。位移寫入 CSS 變數並以 requestAnimationFrame 緩動，不觸發 React 重繪。
6. **輪播「剩 3 張就跳到最後」**：桌機一次顯示 3 張時，原本的捲動式輪播會讓選中項直接跳到最後。改為每次移動一張、最後一張之後回到第一張；手機選中圖置中，桌機依 Figma 一排 3 張，視窗只在需要時滑動。
7. **素材過大、首屏慢**：設計稿 SVG 內嵌約 5MB 點陣圖，抽出後轉 WebP 並提供小尺寸 `srcset`；預載首屏背景圖、字型改非阻擋載入，Lighthouse 桌機 99–100、手機 90–92（Accessibility、Best Practices、SEO 皆 100）。
8. **寬螢幕與 Hero 比例**：Hero 高度曾因 CSS 媒體查詢鍵相撞而失效、在寬螢幕被放大。改為高度上限 823px、清晰畫面維持 1440 比例置中，兩側漸隱並融入霧化背景。
9. **多國語言與自動偵測**：使用 Next.js 內建的 i18n 路由（`/en`、`/ja`）處理網址語系與 `Accept-Language` 偵測，介面文字放在 `src/i18n/messages`，教育／薪資選項以 id 對照翻譯，測試確認三種語言的鍵與佔位符一致。
10. **開發模式載入 MUI 圖示失敗**：`@mui/icons-material` 巢狀的舊版 `@babel/runtime` 無法被 dev 的 refresh loader 解析；將 `@babel/runtime` 升到根層讓套件去重後解決。
11. **相依套件弱點**：`yarn audit` 發現 Next.js 14 有多項已公開弱點，升級到 15.5 修補。

### 素材使用說明

`src/figma` 與 `src/assets` 內的設計素材屬於出題公司，僅供這次線上考使用，請勿另用他途。

### 文件

- 規格文件：[docs/SPEC.md](docs/SPEC.md)
- 設計規範（顏色、字體、Component）：[docs/DESIGN.md](docs/DESIGN.md)
- 架構（進入點、Data Flow）：[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
- 測試範圍：[docs/TESTING.md](docs/TESTING.md)
- 安全性檢查：[docs/SECURITY.md](docs/SECURITY.md)
- 效能與跑分：[docs/PERFORMANCE.md](docs/PERFORMANCE.md)
- 改動紀錄：[CHANGELOG.md](CHANGELOG.md)
