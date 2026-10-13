# Changelog

每次改動請在最上方新增一筆（日期 · 類型 · 內容）。類型：Added / Changed / Fixed / Docs。

## 2026-10-13（第 16 次）

### Docs
- README 的「實作說明」整段重寫並以全新複製的專案實測：環境需求（Node 18.18+、Yarn 1）、網路需求、安裝與執行步驟、指令表、API 快速驗證、部署（Vercel／Node 主機）、專案架構、功能、遇到的問題與解法（重新編號並補上近期內容）、素材使用說明。

### Fixed
- `next.config.js`：移除 `i18n.localeDetection: true`（Next.js 15 只接受 `false`，會出現設定警告）；瀏覽器語言偵測預設即啟用，已實測 `en-US,en;q=0.9` → `/en`、`ja-JP,ja;q=0.9` → `/ja`、`fr` 維持繁中。

### Chore
- 加 `engines.node >= 18.18.0`；移除未使用的 Create React App 殘留（`public/logo192.png`、`logo512.png`、`manifest.json`）；`.gitignore` 補 `/.swc/`。

## 2026-10-13（第 15 次）

### Security (code review fixes)
- CSP：正式環境 `script-src` 移除 `'unsafe-inline'`，改以唯一行內腳本的 `sha256` 雜湊放行；只有 `NODE_ENV === 'development'` 才放寬（`staging` 等維持嚴格）。已在正式建置上以瀏覽器確認無 CSP 違規。
- HSTS 只在非開發環境送出，`max-age=31536000`，移除 `includeSubDomains`。
- 字型載入腳本抽成 `src/fontLoaderScript.js`（供 CSP 雜湊與 `_document` 共用），啟用條件改為多重保險（已載入／`load`／`error`／視窗 `load`），避免卡在 `media="print"`。
- `connect-src 'self'` 為刻意設計，補上說明與測試。

### Tests
- 「前端不得 import server」涵蓋所有 import／export from／動態 import／require 寫法，並有偵測器本身的測試。
- `loadConfig` 以 `try/finally` 還原 `NODE_ENV`（含原本未設定）；新增 CSP／HSTS／staging／環境還原測試。
- 建置預算改為只計首頁實際載入的檔案（取自 `react-loadable-manifest.json`）：JS 230KB gz、Popup chunk 50KB gz；圖片目錄不存在時不再丟錯；新增「HTML 內行內腳本與 CSP 雜湊一致」。
- 新增字型載入腳本 4 個單元測試，以及「CssBaseline 確實注入 reduced-motion 規則」測試（review 第 10 點經查證不成立，以測試證明）。
- 測試增至 96 個。

## 2026-10-13（第 14 次）

### Security
- 安全性檢查與修補（詳見 `docs/SECURITY.md`）：
  - `next` 14.2.35 → 15.5.27，修正 `yarn audit` 中 Next.js 的 critical／high 弱點。
  - API：新增限流（每來源 120 次／分鐘，429＋`Retry-After`）、每頁上限 100 與公司名稱 50 字上限、例外只回通用 500、依資料性質設定 `Cache-Control`。
  - 安全標頭：CSP、`X-Content-Type-Options`、`X-Frame-Options`、`Referrer-Policy`、`Permissions-Policy`、HSTS、COOP；`.gitignore` 補 `.next`、`.env`。
  - 前端：`sanitizeHtml`（禁 `style`／表單／iframe、擋 `javascript:` 連結並加 `rel`）、圖片網址只接受 http(s)、外部圖片 `referrerPolicy="no-referrer"`。
- 自動化檢查：前端不得 import 伺服器資料；建置後掃描 client bundle 確認不含職缺資料。

### Performance
- Lighthouse：桌機 82→99、手機 58→92；Accessibility 100、Best Practices 100、SEO 100（詳見 `docs/PERFORMANCE.md`）。
  - 字型樣式表改為非阻擋載入（`media="print"` 切換、`preconnect`）。
  - 首屏背景圖放進 HTML 並預載；載入畫面改為 styled-jsx 伺服器輸出，背景圖在載入畫面與 App 之間為同一元素；背景／人物／Logo 提供小尺寸 `srcset`。
  - 卡片標題改 `<h2>`；`hreflang` 僅在有網站網址時輸出（`NEXT_PUBLIC_SITE_URL`）；`browserslist` 鎖定現代瀏覽器。
- 新增 `yarn bench`（`scripts/lighthouse.js`）與 Lighthouse 測試（`LIGHTHOUSE=1`）。

### Added (tests)
- 測試增至 84 個：安全（靜態檢查、安全標頭、bundle 不含資料）、限流、淨化、後端效能預算、建置預算。
- Jest：`testTimeout` 20s、`maxWorkers` 50%、RTL `asyncUtilTimeout` 5s，避免在忙碌的機器上誤判。

## 2026-10-13（第 13 次）

### Changed
- Popup 標題列（公司名稱＋職稱）依 Figma：高 30px、間距 8px，桌機同一列、手機職稱換到下一行；卡片資訊列的圖示與文字間距同為 8px。
- Popup「關閉」按鈕改為 Figma 的 `background: #4D4D4D`（新增 theme `grey.800`），白字、hover 轉 `grey.900`。

## 2026-10-13（第 12 次）

### Added
- **圖片預覽**（`ImagePreview`，參考 Ant Design）：點輪播中選中的圖開啟全螢幕預覽，支援放大／縮小（按鈕、滾輪、雙指、雙擊）、旋轉、拖拉平移、還原、比例顯示、上一張／下一張（按鈕、滑動、方向鍵）、張數、以按鈕／Esc／點空白處關閉；桌機與手機皆可用。
- Hero 載入完成前的過場：以 `useImagesReady` 等所有圖層（背景、人物、Logo、左右眼）載入後一起淡入，期間顯示三點動畫。

### Changed
- **輪播改版**：每次只移動一張、最後一張之後回到第一張（修正桌機「剩 3 張就直接跳到最後」）。手機：選中圖置中、鄰圖露出；桌機依 Figma：一排 3 張靠左，選中圖橘色外框、其餘較淡，視窗只在需要時滑動。
- **寬螢幕不再無限放大**：Hero 高度上限 823px、清晰畫面維持 1440 比例置中，左右以遮罩漸隱並融入霧化背景。
- 移除畫面上的語言選單（語言完全由網址前綴與瀏覽器偵測決定）；`I18nProvider` 不再需要 `onLocaleChange`。

### Fixed
- 桌機 Hero 高度失效（寬螢幕下人物與 Logo 被放大並被內容面板蓋住）：Hero 的底部遮罩媒體查詢與響應式 `height` 的 `md` 鍵相撞，改用響應式值表示。
- 載入時先出現兩顆眼睛：眼球 SVG 比大圖先載入，現在所有圖層一起顯示。
- 測試增至 46 個。

## 2026-10-13（第 11 次）

### Changed
- **改用 Next.js 14（Pages Router）**，取代 Create React App；移除 `react-scripts`、`miragejs`。指令改為 `yarn dev／build／start／test／lint`；測試改用 Jest 29 + `next/jest`；ESLint 改為獨立的 ESLint 8（Airbnb），不再排除任何檔案。
- **小後端**：以 Next.js API Routes 實作 4 支 API（`/api/v1/jobs`、`/jobs/[id]`、`/educationLevelList`、`/salaryLevelList`）。資料與篩選／分頁邏輯移到 `src/server`（不再打包進前端）；只允許 GET、回應 `no-store`；找不到職缺回 404。
- **換頁不改網址**：移除頁碼／篩選的網址同步（網址只在切換語言時變更）。
- **手機版面對齊設計稿**：內容面板緊貼 Hero 下緣、直角；Hero 底部漸層遮罩僅限桌機；面板載入時柔順上滑淡入；標題列在手機上分兩行避免擠壓。

### Added
- **多國語言（zh-TW／en／ja）**：網址語系前綴（`/en`、`/ja`，繁中為預設無前綴）、依 `Accept-Language` 自動偵測並以 `NEXT_LOCALE` cookie 記住、語言選單、`<html lang>`、`hreflang`；介面文字、教育／薪資選項、aria 標籤與分頁標籤皆已翻譯。
- 區域 Loading：`BrandDots`（品牌色三點動畫）、`RegionLoader`（列表區覆蓋，150ms 後才顯示）、`PageLoader`（首屏）。
- 測試增至 33 個：後端邏輯、API handler、i18n（鍵與佔位符一致、與 Next.js 設定一致）。

### Fixed
- Next.js 開發模式載入 `@mui/icons-material` 失敗：升級根層 `@babel/runtime` 使套件去重。

## 2026-10-13（第 10 次）

### Added
- 網址同步：頁碼與篩選條件寫入 query string，重新整理／分享連結可還原。
- 結果筆數（「共 N 筆職缺」，`aria-live` 播報）、「清除」按鈕、無資料時的「清除條件」。
- 整張卡片可點擊；輪播新增上一張／下一張按鈕、方向鍵、可點圓點，滑鼠移入暫停自動輪播。
- Skip link「跳到職缺列表」；全站 `prefers-reduced-motion` 處理（theme CssBaseline）。
- 列表載入後 400ms 靜默預取下一頁。

### Changed
- 效能：`ImageCarousel`／`CarouselImage` `memo`；總頁數、id→文字對照表 `useMemo`；輪播捲動同步以 rAF 節流；滑過卡片 150ms 防抖後才預取；Logo 動畫離開畫面時以 IntersectionObserver 暫停。
- 換頁僅在列表頂端不在視窗內時才捲動。
- 測試增至 12 個（新增 FilterBar 單元測試、網址還原、筆數）；既有快取測試改為只計第 1 頁請求。

## 2026-10-13（第 9 次）

### Changed
- 「查看細節」圖片載入優化：
  - 預取：滑鼠移入／聚焦／觸碰按鈕時先取得職缺內容並預載圖片（`prefetchJob`），已取得的職缺快取，點開即時顯示；預取進行中就點開時共用同一個請求，不重複請求。
  - 新增 `CarouselImage`：圖片載入前顯示閃動骨架（版面不位移），載入後淡入；失敗顯示佔位圖示；前 3 張 `eager`、其餘 lazy。
  - Popup 資料載入中改顯示與內容相同版型的骨架，取代轉圈。
- 新增 1 個預取測試（共 7 個）。

## 2026-10-13（第 8 次）

### Changed
- Hero 背景改為 `object-fit: cover` 填滿整個 Hero；人物、Logo、眼球放進隨 Hero 高度等比縮放的畫面框。
- 手機版改用 Figma 手機佈局：畫布 375×238，人物 317×238，Logo 137×82 位於 (227, 133)（桌機維持 1440×823 畫布）。眼球位移依人物縮放比例換算。
- 寬螢幕不留白：新增 `PageBackdrop`，整頁背後鋪一層霧化的背景圖延伸，Hero 底部以遮罩淡出銜接。

## 2026-10-13（第 7 次）

### Changed
- Hero 對照新截圖校正：人物與背景位置吻合；Logo 下移 45px（y=365）；內容面板改自畫布 y≈700（Hero 的 85%）處上疊，最大寬 1380px、左右各 30px，與設計稿一致。
- 眼球：上緣貼齊上眼皮——為眼球加一塊藏在眼皮下的深色蓋片，上下移動時不會在眼皮與眼球間露出眼白；移動改為 rAF 緩動（取代 CSS transition），更滑順；垂直位移縮小為 3px。
- Airbnb 風格：移除 ESLint 排除設定，整個 `src`（含題目提供的 `index.js`、`constants`）皆通過；`index.js` 的 `new Server` 改為具名變數匯出、`isNaN` 改 `Number.isNaN`；`miragejs` 因正式環境也使用，由 devDependencies 移到 dependencies。

## 2026-10-13（第 6 次）

### Changed
- Hero 改用設計稿提供的分層素材（Background／Character／Logo／LeftEye／RightEye），取代先前由合成截圖切出的版本：
  - 各圖層依設計稿 1440×823 畫布座標以百分比定位，桌機高 `min(57.1vw, 823px)`、手機 `63.5vw`，內容面板約自 79.5% 處上疊。
  - 眼球放在人物圖層下方，以人物圖的鏤空眼窩當遮罩，底下補淺色眼白；眼球跟隨滑鼠移動（水平最多 10px、垂直 4px，依畫布縮放）。
  - Logo 為獨立透明圖層，做 1.5 秒縮放 Loop，不再有切圖邊緣的灰暈。
- 素材：SVG 內嵌點陣圖抽出轉 WebP（背景 123KB、人物 272KB、Logo 77KB），眼球保留 SVG；移除舊的 `hero.webp`、`hero-text.webp`。

### Docs
- `SPEC.md`、`DESIGN.md`、`ARCHITECTURE.md` 同步 Hero 的分層做法與尺寸。

## 2026-10-13（第 5 次）

### Docs
- 新增 `docs/DESIGN.md`：顏色（theme token、其他色值）、字體（字型、Figma 字級表、使用位置）、Component（props 與說明、共用視覺規則）。
- 新增 `docs/ARCHITECTURE.md`：文件索引、程式進入點、目錄、Data Flow 圖與狀態歸屬、流程、API 欄位對應。
- 新增 `docs/TESTING.md`：指令、測試環境、已涵蓋案例、缺口、手動驗證清單。
- `docs/SPEC.md` 與 README 補上文件索引連結。

## 2026-10-13（第 4 次）

### Fixed
- Hero 動畫對齊設計稿：原本是整張圖縮放加視差，改為「Heello」文字貼圖 1.5 秒縮放 Loop，並讓眼珠跟隨滑鼠座標移動。

### Added
- `src/assets/hero-text.webp`：由設計稿切出的文字貼圖；眼珠以羽化遮罩複製眼部區塊位移實作。
- 列表載入失敗狀態與「重新載入」。
- `docs/SPEC.md` 新增「效能與體驗優化」「規範符合度檢查」。

### Changed
- 效能：Hero 圖 PNG 轉 WebP（1.1MB → 124KB，文字貼圖 189KB → 29KB）；Popup `React.lazy` 延後載入；`JobCard`／`JobGrid`／`FilterBar` `memo`；請求以 `AbortController` 取消過期請求；輪播圖 lazy loading 並指定尺寸。
- 體驗：Popup Grow 進場與 `aria-labelledby`、「查看細節」按鈕 hover／active／focus 回饋、尊重 `prefers-reduced-motion`。
- `package.json` 加 `homepage: "."`，build 產物可直接放到靜態空間。
- 測試補 `matchMedia` stub；API 測試配合 `signal` 參數調整。

## 2026-10-13（第 3 次）

### Added
- `docs/SPEC.md`：規格文件（概述、功能、API、設計、架構、驗收）。
- `CHANGELOG.md`：改動紀錄。
- `src/assets/hero.png`：自設計稿素材取得的 Hero 原圖。

### Changed
- Hero 改用設計稿原圖，取代 picsum 暫代圖；高度依圖片比例（約 2.06:1）隨視窗寬度調整，上限 720px，卡片自底部上疊。
- 換頁／搜尋過渡優化：
  - `useJobs` 載入期間保留上一頁內容並淡化，不再閃出 Skeleton；Skeleton 只用於首次載入。
  - `useJobs` 以查詢條件快取已載入頁面，回到看過的頁面即時顯示。
  - 換頁後平滑捲動回列表頂端。

### Docs
- README 補充文件位置。

### Tests
- 新增「回到已看過頁面不重新請求」測試；`setupTests.js` 補 jsdom 缺少的 `scrollIntoView`（共 6 個測試）。

## 2026-10-13（第 2 次）

### Fixed
- 教育程度／薪水範圍下拉在未選擇時顯示「不限」（原為空白）。

### Changed
- build 時關閉 CRA 內建 ESLint plugin（與 Airbnb 設定衝突），改由 `yarn lint` 檢查。

## 2026-10-13（第 1 次）

### Added
- 職缺列表頁：Hero、條件篩選、卡片、分頁、無資料狀態。
- 詳細資訊 Popup：圖片輪播（可拖拉、自動輪播）、工作內容（DOMPurify 淨化）。
- 響應式：桌機 6 筆／頁（3 欄）、手機 4 筆／頁（1 欄、無 Filter）。
- 載入 Skeleton／轉圈、卡片淡入與 hover、Hero 1.5 秒 Loop 縮放與滑鼠跟隨。
- API 層、hooks、MUI theme。
- Airbnb ESLint 設定與 3 個測試檔（5 個測試）。
- README：執行方式、架構、遇到的問題。
