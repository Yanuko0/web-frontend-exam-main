# 安全性檢查

> 檢查日期 2026-10-13。自動化檢查寫在測試裡：[src/__tests__/security.test.js](../src/__tests__/security.test.js)、[src/server/*.test.js](../src/server)、[src/utils/sanitize.test.js](../src/utils/sanitize.test.js)。

## 1. 結論

| 項目 | 結果 |
| --- | --- |
| 資料是否會從前端程式外洩 | **不會**。資料只在 `src/server`（伺服器端），前端程式碼不得 import；測試檢查原始碼，並在已建置時掃描 `.next/static` 的 client bundle，確認不含職缺資料 |
| API 是否可被濫用 | 已加上：只允許 GET、每個來源 120 次／分鐘限流（429＋`Retry-After`）、輸入上限（每頁最多 100 筆、公司名稱最多 50 字）、錯誤只回通用訊息 |
| XSS | 職缺說明經 DOMPurify 淨化，並禁用 `style`、表單、iframe 等標籤；連結只允許 `http(s)／mailto／tel` 並加 `rel="noopener noreferrer"`；圖片網址只接受 `http(s)` |
| 相依套件弱點 | `next` 由 14.2.35 升到 15.5.27，已修正 `yarn audit` 中 Next.js 的 2 個 critical、多個 high；剩餘為建置／測試工具的間接相依（見 §4） |
| 機密 | 沒有 `.env`、金鑰或 token；測試檢查原始碼沒有寫死的機密樣式，且 `.gitignore` 排除 `.env`、`.next` |

## 2. 發現與處理

| # | 發現 | 風險 | 處理 |
| --- | --- | --- | --- |
| 1 | 原本以 miragejs 在瀏覽器內模擬 API，**所有資料被打包進前端** | 資料可直接從程式碼取得 | 改為 Next.js API Routes，資料與篩選邏輯只在伺服器（已於前幾輪完成，本次加上自動化檢查） |
| 2 | Next.js 14.2.35 有多個已公開弱點（RCE、DoS、SSRF 等，修正版 ≥ 15.5.x） | 多數與本專案未使用的功能有關（Server Actions、Image Optimizer、rewrites），但仍應修補 | 升級到 15.5.27；`yarn audit` 中 `next` 相關項目歸零 |
| 3 | API 沒有請求頻率限制 | 可被爬取／灌請求 | `src/server/rateLimit.js`：固定視窗、依 `x-forwarded-for` 或 socket 位址計數 |
| 4 | `pre_page`、`company_name` 沒有上限 | 一次請求取走過多資料、超長字串 | 每頁上限 100、公司名稱截為 50 字；一律當純文字比對（不是正規表示式，測試包含 `.*`、`(`） |
| 5 | API 發生例外時可能把堆疊／內部訊息回給前端 | 洩漏實作細節 | `handler.js` 捕捉例外，只回 `{ error: 'Internal server error' }`，細節僅記錄在伺服器 |
| 6 | 沒有安全標頭 | 點擊劫持、MIME 嗅探、資訊洩漏 | `next.config.js` 對所有路由加：CSP、`X-Content-Type-Options`、`X-Frame-Options: DENY`、`Referrer-Policy`、`Permissions-Policy`、COOP；非開發環境另送 HSTS（`max-age=31536000`，**不含** `includeSubDomains`／`preload`，避免子網域尚未支援 HTTPS 時被鎖死）；關閉 `X-Powered-By` |
| 7 | 說明 HTML 的連結可能是 `javascript:`，或帶 `target` 而可存取 opener | XSS／反向 tabnabbing | `sanitizeHtml`：只保留安全協定、加 `rel`；禁用 `style` 與表單類標籤 |
| 8 | 外部圖片會送出 Referer | 隱私外洩 | 輪播與預覽圖片加 `referrerPolicy="no-referrer"` |
| 9 | 圖片網址由 API 提供，可能是 `javascript:`／`data:` | 非預期內容 | 只接受絕對的 `http(s)` 網址（`isSafeImageUrl`） |
| 10 | 公開 API 預設沒有快取策略 | 效能／不一致 | 依資料性質設定 `Cache-Control`（選項 1 小時、列表 30 秒、詳細 60 秒，皆含 stale-while-revalidate）；錯誤回應不快取 |

## 3. 內容安全政策（CSP）

| 指令 | 值 | 說明 |
| --- | --- | --- |
| `default-src` | `'self'` | 預設只允許同源 |
| `script-src` | 正式環境：`'self'` + 唯一一支行內腳本（字型載入器）的 `sha256-…` 雜湊，**沒有 `unsafe-inline`、沒有 `unsafe-eval`**；僅 `NODE_ENV=development` 才加 `'unsafe-inline' 'unsafe-eval'`（熱更新） | Next.js 的 `__NEXT_DATA__` 是 JSON 資料區塊、不受 `script-src` 約束；雜湊由 `next.config.js` 依 [src/fontLoaderScript.js](../src/fontLoaderScript.js) 計算，測試確認 HTML 內的腳本與雜湊來源一致 |
| `style-src` | `'self' 'unsafe-inline' https://fonts.googleapis.com` | emotion／MUI 會注入行內樣式；字型樣式表 |
| `font-src` | `'self' https://fonts.gstatic.com data:` | Noto Sans TC |
| `img-src` | `'self' data: blob: https:` | 職缺圖片由 API 提供，來源不固定，因此允許任何 https 圖片 |
| `connect-src` | `'self'`（僅 development 另加 `ws:`、`wss:`） | **刻意只允許同源**：前端只呼叫自己的 API（資料由 `src/pages/api` 代理）。與 `img-src` 允許任意 https 不矛盾——圖片只是顯示，不能被指令碼讀取；若日後前端要直接呼叫外部 API，需明確加入該網域 |
| `object-src`／`base-uri`／`form-action` | `'none'`／`'self'`／`'self'` | |
| `frame-ancestors` | `'none'` | 禁止被嵌入 |

## 4. 殘餘風險（誠實列出）

| 項目 | 說明 | 建議 |
| --- | --- | --- |
| `style-src 'unsafe-inline'` | emotion／MUI 與 styled-jsx 會注入行內 `<style>`；樣式注入的風險遠低於腳本，但仍非零 | 需要時改為 nonce（需動態渲染） |
| 限流是單一程序記憶體 | 多個伺服器實例（或 serverless）各自計數 | 正式環境放在 CDN／API Gateway 或使用 Redis |
| `x-forwarded-for` 可被偽造 | 直接暴露在網際網路時，來源位址可被客戶端指定 | 只在可信任的反向代理後使用，或改用代理提供的真實 IP 標頭 |
| 間接相依的弱點 | `yarn audit --groups dependencies` 仍列出約 33 項（`postcss`、`lodash`、`braces`、`picomatch`、`micromatch`、`yaml`、`@babel/runtime`），來自建置與測試工具鏈（Next 內建 postcss、Jest／ESLint 的相依），不在伺服器執行路徑上 | 隨相依套件更新追蹤；`yarn audit` 排程檢查 |
| 資料為公開資料、無登入 | 本專案沒有使用者帳號與個資；若日後加入，需補驗證、CSRF、輸出編碼審查 | — |
| 圖片來源 | 圖片由 API 的第三方網址載入（示範資料為 picsum.photos） | 正式資料建議由自家 CDN 提供，並收緊 `img-src` |

## 5. 如何重跑

```bash
yarn test                 # 含安全相關的自動化檢查（建置後會多掃描 client bundle）
yarn audit --groups dependencies
```

## 6. Code review 後的修正（2026-10-13）

| # | 審查意見 | 處理 |
| --- | --- | --- |
| 1 | `script-src` 含 `unsafe-inline`，CSP 擋不住行內腳本，卻被稱為 strict | 移除。頁面只有一支行內腳本（字型載入器），改以 `sha256` 雜湊放行；已在正式建置上用瀏覽器確認沒有任何 CSP 違規，Popup 與圖片預覽也正常 |
| 2 | 以 `NODE_ENV !== 'production'` 判斷開發模式，`staging`、`test` 也會被放寬 | 改為只有 `=== 'development'` 才放寬；測試確認 `staging` 維持嚴格 |
| 3 | `connect-src` 只有 `'self'`、`img-src` 卻允許任意 https，可能不一致 | 這是**刻意設計**（資料一律走同源 API），已在設定檔註解與上表說明；測試固定 `connect-src 'self'` |
| 4 | 字型 `media="print"` 切換腳本若錯過 `load` 事件會卡在 print | 腳本改為多重保險：已有 `sheet` 就直接啟用，否則聽 `load`、`error`，並以視窗 `load` 作最後保險；抽成 `src/fontLoaderScript.js` 並加 4 個單元測試 |
| 5 | `loadConfig` 還原 `NODE_ENV` 的方式在原值為 `undefined` 或丟錯時會污染其他測試 | 改用 `try/finally`，原本未設定時用 `delete` 還原；新增測試確認不殘留 |
| 6 | 圖片大小檢查在 `static/media` 不存在時 `readdirSync` 會丟 ENOENT | `walk` 先檢查目錄是否存在 |
| 7 | JS 預算把所有 chunk 都算進去、並非首頁實際載入的檔案 | 改為只計「首頁實際載入」：polyfills + `_app` + 頁面 + 動態載入的 App chunk（取自 `react-loadable-manifest.json`），目前 197KB gz，預算 230KB；Popup 的延後載入 chunk 另計（31.7KB gz，預算 50KB） |
| 8 | 「前端不得 import server」只比對 `from '…'` | 改為涵蓋 `import … from`、`export … from`、`import('…')`、`require('…')`、`import '…'`，並有測試證明各種寫法都能被偵測 |
| 9 | HSTS 兩年＋`includeSubDomains` 套用到所有環境 | 只在非開發環境送出，`max-age=31536000`，不含 `includeSubDomains`／`preload` |
| 10 | 沒看到 `_app` 掛 `<CssBaseline />`，reduced-motion 規則可能不生效 | 查證後**此項不成立**：`CssBaseline` 在 `App.js` 中渲染（`App` 被 `_app` 的頁面載入）。新增測試渲染 `App` 後確認 `prefers-reduced-motion` 規則確實被注入 |
