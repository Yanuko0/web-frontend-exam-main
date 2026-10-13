# 測試範圍

## 1. 指令

| 指令 | 用途 |
| --- | --- |
| `yarn bench` | Lighthouse 跑分（需先 `yarn build`） |
| `yarn test` | 以 Jest + React Testing Library 執行測試（watch 模式） |
| `CI=true yarn test --watchAll=false` | 單次執行 |
| `yarn lint` | ESLint（Airbnb） |
| `yarn build` | Production build，同時確認可編譯 |

## 2. 環境

| 項目 | 說明 |
| --- | --- |
| 框架 | Jest 29（`next/jest`，jsdom）、`@testing-library/react`、`@testing-library/user-event` |
| API | 前端測試以 `global.fetch` mock；後端邏輯（`src/server`）直接以單元測試驗證 |
| [src/setupTests.js](../src/setupTests.js) | 載入 `jest-dom`；補 jsdom 缺少的 `scrollIntoView`、`matchMedia` |
| 響應式 | jsdom 沒有 `matchMedia`，`useMediaQuery` 為 false，因此 App 測試走**手機版**（每頁 4 筆、無 Filter） |

## 3. 已涵蓋

| 測試檔 | 案例 | 驗證內容 |
| --- | --- | --- |
| [src/api/index.test.js](../src/api/index.test.js) | 參數對應 | `fetchJobs` 將參數轉成 `pre_page`、`company_name` 等，且略過空值 |
| | 錯誤回應 | HTTP 非 2xx 時 throw |
| [src/components/JobCard.test.js](../src/components/JobCard.test.js) | 卡片資訊與開啟 | 顯示公司、教育、薪水；點「查看細節」以職缺 id 呼叫 `onOpen` |
| [src/App.test.js](../src/App.test.js) | 列表與 Popup | 只顯示當頁 4 筆；開 Popup 顯示內容；「關閉」後消失 |
| | 換頁 | 點下一頁顯示第 2 頁資料 |
| | 快取 | 回到看過的頁面不再發出列表請求 |
| | 預取 | 滑過「查看細節」先取得職缺，開 Popup 時不重複請求 |

| [src/components/FilterBar.test.js](../src/components/FilterBar.test.js) | 送出 | 只在按「條件搜尋」時送出，公司名稱去除前後空白 |
| | 清除 | 依初始值帶入；「清除」重設欄位並送出空條件；沒有內容時不顯示「清除」 |
| [src/App.test.js](../src/App.test.js) | 網址不變 | 換頁後 `window.location.href` 保持不變 |
| [src/components/ImageCarousel.test.js](../src/components/ImageCarousel.test.js) | 輪播 | `slideOffset` 環形偏移、桌機視窗只在必要時滑動（`windowStartFor`）、每次一張且最後一張後回第一張、方向鍵、點鄰圖選取、點選中圖開預覽 |
| [src/components/ImagePreview.test.js](../src/components/ImagePreview.test.js) | 圖片預覽 | 縮放限制、按鈕放大／縮小／還原與比例、縮到最小時停用、鍵盤縮放與切換（環繞）、按鈕與 Esc 關閉、雙擊切換縮放 |
| [src/__tests__/security.test.js](../src/__tests__/security.test.js) | 安全 | 前端不得 import 伺服器資料（涵蓋 import／export from／動態 import／require）、API 皆經 GET-only／限流 handler、建置後 client bundle 不含職缺資料、安全標頭與 CSP（正式環境 `script-src` 無 `unsafe-inline`／`unsafe-eval`、`connect-src` 僅同源、`staging` 維持嚴格、HSTS 只在非開發環境）、字型載入腳本的 4 種情境、HTML 只經淨化器渲染、無 `eval`／寫死機密、`.gitignore` 排除 `.env`／`.next`、外部圖片不送 Referer |
| [src/__tests__/performance.build.test.js](../src/__tests__/performance.build.test.js) | 建置預算 | 首頁實際載入的 JS gzip < 230KB、Popup chunk < 50KB、圖片 < 300KB、字型不阻擋渲染、HTML 含背景圖與預載、`lang`／viewport、HTML 內行內腳本與 CSP 雜湊一致（需先 `yarn build`，否則略過） |
| [src/__tests__/lighthouse.test.js](../src/__tests__/lighthouse.test.js) | Lighthouse | 桌機／手機分數與 TBT／LCP／CLS 門檻（`LIGHTHOUSE=1`，需 Chrome；或 `yarn bench`） |
| [src/server/performance.test.js](../src/server/performance.test.js) | 後端效能預算 | 列表／查詢／限流／淨化的耗時上限 |
| [src/server/rateLimit.test.js](../src/server/rateLimit.test.js) | 限流 | 上限與 Retry-After、各來源分開計數、視窗到期重算、來源位址判斷 |
| [src/utils/sanitize.test.js](../src/utils/sanitize.test.js) | 淨化 | 移除 script／事件／style／表單／iframe、擋 `javascript:` 連結並加 `rel`、保留排版、圖片網址只接受 http(s) |
| [src/server/jobs.test.js](../src/server/jobs.test.js) | 後端邏輯 | 全部／分頁／總數、列表不含 `description`／`companyPhoto`、三種篩選、無效分頁參數、單筆職缺欄位、找不到回 null、選項 id 為字串 |
| [src/server/handler.test.js](../src/server/handler.test.js) | API handler | 非 GET 回 405、重複 query 取第一個且 `no-store`、找不到回 404 |
| [src/i18n/i18n.test.js](../src/i18n/i18n.test.js) | 多國語言 | 插值與回退、三種語言鍵與佔位符一致、與 Next.js 語系設定一致、`resolveLocale`、選項翻譯、Provider |
| | 筆數 | 顯示「共 10 筆職缺」 |

合計 96 個測試（其中 1 個 Lighthouse 測試預設略過，需 `LIGHTHOUSE=1`）。

## 4. 尚未涵蓋（缺口）

| 範圍 | 原因／風險 | 建議 |
| --- | --- | --- |
| `FilterBar` 與 App 整合 | App 測試走手機版，不渲染 Filter；元件本身已有單元測試 | stub `matchMedia` 為桌機後測整合 |
| 桌機 6 筆／頁 | 同上 | 同上 |
| `useJobs` 錯誤與重試 | 尚無失敗情境 | mock `fetch` reject，驗證「重新載入」 |
| 請求取消（AbortController） | 難以在 jsdom 驗證時序 | 快速連續換頁，確認只顯示最後一頁 |
| `ImageCarousel` 拖拉與自動輪播 | 依賴 scroll 與 timer | fake timers 驗證自動輪播；拖拉以手動驗證 |
| `Hero` 動畫（縮放、眼珠） | 視覺行為 | 以瀏覽器手動驗證；可補測 CSS 變數隨 `pointermove` 更新 |
| `JobDialog` 失敗狀態 | 尚無案例 | `/jobs/:id` 回 500，驗證顯示「無法取得職缺資訊」 |
| DOMPurify 淨化 | 依賴套件行為 | 給含 `<script>` 的 description，驗證不被渲染 |
| 視覺／RWD 對照 Figma | 無自動化 | 手動以瀏覽器檢查桌機與手機 |

## 5. 手動驗證清單

- [ ] 桌機：3 欄、每頁 6 筆、Filter 可用、分頁正常
- [ ] 手機（寬 < 900px）：1 欄、每頁 4 筆、無 Filter
- [ ] 篩選三種條件組合，無結果顯示「無資料」
- [ ] 查看細節：輪播可拖拉並自動輪播、關閉正常
- [ ] 換頁：舊內容淡化、不閃空白、捲回頂端
- [ ] Hero：文字 1.5 秒縮放 Loop、眼珠跟隨滑鼠
- [ ] 系統開啟「減少動態」：動畫停用
