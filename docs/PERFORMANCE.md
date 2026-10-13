# 效能與跑分

> 量測日期 2026-10-13，Lighthouse 12，對正式建置（`next start`）量測；桌機使用 desktop preset，手機使用預設的行動裝置模擬（4× CPU 降速、慢速 4G）。

## 1. 分數

| 項目 | 優化前 | 優化後（桌機） | 優化後（手機） |
| --- | --- | --- | --- |
| Performance | 82（手機 58） | **99–100** | **90–92** |
| Accessibility | 98 | **100** | **100** |
| Best Practices | 100 | **100** | **100** |
| SEO | 92 | **100** | **100** |
| FCP | 1.7 s（手機 6.9 s） | 0.2 s | 0.6 s |
| LCP | 2.1 s（手機 10.3 s） | 0.7 s | 2.1 s |
| TBT | 0 ms（手機 750 ms） | 89 ms | 312 ms |
| CLS | 0.006 | 0.006 | 0.01 |

「優化前」是改用 Next.js 之後、這一輪優化之前的版本。手機的 TBT 主要是 React／MUI 在 4× 降速 CPU 上的執行時間。

## 2. 做了什麼

| 問題（Lighthouse） | 做法 | 效果 |
| --- | --- | --- |
| 字型樣式表阻擋渲染（桌機 1.5 s、手機 6.2 s） | Noto Sans TC 樣式表改為 `media="print"` 載入、載入後切成 `all`，並加 `preconnect`、`display=swap` | FCP 1.7→0.2 s（桌機）、6.9→0.6 s（手機） |
| LCP 圖片太晚才開始載入（要等 JS 執行後才出現） | `<link rel="preload" as="image">` 預載背景與人物；`<head>` 的背景圖直接放在 HTML；載入畫面（`PageLoader`）用 styled-jsx 伺服器端輸出，圖片在載入畫面與 App 之間**同一個元素**不重建，LCP 只發生一次 | LCP 10.3→2.1 s（手機）、2.1→0.7 s（桌機） |
| 圖片太大（手機下載與螢幕不符） | 背景／人物／Logo 各做一個小尺寸版本，用 `srcset` + `sizes` 讓手機只下載小圖（約少 140KB） | 手機傳輸 1.47MB→0.44MB |
| 標題層級跳號（a11y） | 卡片公司名稱改為 `<h2>`（頁面標題為 `<h1>`） | Accessibility 98→100 |
| hreflang 必須是絕對網址（SEO） | 有設定 `NEXT_PUBLIC_SITE_URL`（或 Vercel 網址）時才輸出，網址一律絕對 | SEO 92→100 |
| 舊版 JavaScript 轉譯 | `browserslist` 鎖定現代瀏覽器（Chrome／Edge／Firefox ≥ 100、Safari ≥ 15.4） | 減少約 12KB |
| API 重複請求 | 回應加 `Cache-Control`；前端快取、預取下一頁與詳細資料（前幾輪） | 換頁與開 Popup 幾乎即時 |

其他前幾輪已完成的優化：圖片轉 WebP、Popup 延後載入、`memo`／`useMemo`／`useCallback`、`AbortController`、rAF 節流、防抖預取、離開畫面暫停動畫。

## 3. 寫在測試裡的效能檢查

| 測試 | 檢查內容 | 執行方式 |
| --- | --- | --- |
| [src/server/performance.test.js](../src/server/performance.test.js) | 後端：2,000 次列表／篩選／分頁 < 400 ms、5,000 次單筆查詢 < 250 ms、10 萬次限流檢查 < 400 ms、100 次說明淨化 < 1.5 s（取三次中最快，避免機器忙碌造成誤判） | `yarn test`（一直執行） |
| [src/__tests__/performance.build.test.js](../src/__tests__/performance.build.test.js) | 建置結果：首頁實際載入的 JS（gzip）< 230KB（目前 197KB）、Popup 延後載入的 chunk < 50KB（目前 31.7KB）、單張圖片 < 300KB、字型不阻擋渲染、HTML 內含背景圖與預載、`<html lang>` 與 viewport | `yarn build && yarn test`（沒有建置時自動略過） |
| [src/__tests__/lighthouse.test.js](../src/__tests__/lighthouse.test.js) | 桌機／手機 Lighthouse 分數與指標門檻（Performance ≥ 90／85、其餘 ≥ 95，TBT、LCP、CLS 上限） | `yarn build` 後 `LIGHTHOUSE=1 yarn test src/__tests__/lighthouse.test.js`（PowerShell：`$env:LIGHTHOUSE=1`）；平常略過 |
| [scripts/lighthouse.js](../scripts/lighthouse.js) | 同上，啟動伺服器、量測並印出表格，未達門檻時以 1 結束 | `yarn build && yarn bench` |

`yarn bench` 需要 Chrome 或 Edge（可用 `CHROME_PATH` 指定）。

## 4. 還能再優化

| 項目 | 說明 | 預期 |
| --- | --- | --- |
| 手機 TBT／互動時間 | 首頁互動頁面是純前端渲染（MUI + emotion）。可改為伺服器端渲染（設定 emotion cache）或拆更多延後載入的區塊 | TBT 312→更低、LCP 再少數百 ms |
| 字型 | Noto Sans TC 切片多（每個字重 100+ 個 unicode-range 檔），可只保留 400／700、或自行裁切常用字 | 少數百 KB（桌機總傳輸 1.6MB 大部分是字型） |
| 圖片 | 可再用 AVIF、縮小人物圖尺寸 | 約 100KB |
| 未使用的 JS／CSS | 約 23KB JS | 小 |
