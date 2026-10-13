# Yile 前端考題 規格文件

> 設計來源：Figma 截圖（[src/figma](../src/figma)）。每次規格異動請同步更新本文件與 [CHANGELOG.md](../CHANGELOG.md)。
>
> 文件索引：[DESIGN.md](DESIGN.md)（顏色、字體、Component）· [ARCHITECTURE.md](ARCHITECTURE.md)（進入點、Data Flow）· [TESTING.md](TESTING.md)（測試範圍）

## 1. 概述

依 Figma 設計稿實作「職缺列表 + 詳細資訊 Popup」單頁應用，資料由 Next.js API Routes（小後端）提供。

| 項目 | 內容 |
| --- | --- |
| 語言／框架 | JavaScript、React 18、Next.js 15（Pages Router） |
| UI／CSS | MUI 5（`@mui/material`、`@mui/icons-material`） |
| 程式風格 | Airbnb Style（ESLint，`yarn lint`） |
| 資料 | Next.js API Routes `/api/v1/*`，資料只在伺服器端，共 50 筆職缺 |
| 多國語言 | 繁體中文（預設）、English、日本語；網址語系前綴 `/en`、`/ja`，依 `Accept-Language` 自動偵測；畫面不提供語言選單 |
| 範圍內 | 列表、篩選、分頁、詳細資訊 Popup、響應式、載入過渡與動畫、README |
| 範圍外 | 登入、真實後端、部署（待指示） |

## 2. 功能規格

| 功能 | 行為 |
| --- | --- |
| 職缺列表 | 桌機 3 欄、每頁 6 筆；手機 1 欄、每頁 4 筆。卡片顯示公司名稱、職稱、教育程度、薪水範圍、職缺預覽（最多 2 行） |
| 條件篩選 | 公司名稱（文字）、教育程度、薪水範圍（下拉，預設「不限」）。按「條件搜尋」才套用，並回到第 1 頁。手機版不提供 Filter |
| 分頁 | MUI Pagination；切換斷點（每頁筆數改變）時重設為第 1 頁 |
| 換頁過渡 | 換頁／搜尋時保留上一頁內容並淡化（不閃空白）；已載入過的頁面快取、即時顯示；換頁後平滑捲動回列表頂端；新卡片依序淡入 |
| 空資料 | 無符合資料時顯示「無資料」 |
| 詳細資訊載入 | 滑鼠移入／聚焦／觸碰「查看細節」時預先取得職缺內容並預載圖片，點開即時顯示；已取得的職缺快取；圖片載入前顯示閃動骨架、載入後淡入，失敗顯示佔位圖示；Popup 資料載入中顯示骨架（取代轉圈） |
| 詳細資訊 | 點「查看細節」開啟 Popup：公司與職稱、可拖拉且自動輪播的圖片、工作內容（HTML）；「關閉」或點背景關閉 |
| 載入狀態 | 首次載入列表顯示 Skeleton；Popup 載入顯示轉圈 |
| 安全 | 職缺 `description` HTML 經 DOMPurify 淨化後才渲染 |

## 3. API 規格

| Method | Path | 參數 | 用途 |
| --- | --- | --- | --- |
| GET | `/api/v1/jobs` | `pre_page`、`page`、`company_name`、`education_level`、`salary_level` | 職缺列表，回傳 `{ data, total }` |
| GET | `/api/v1/jobs/:id` | — | 單一職缺（`description`、`companyPhoto`、`jobTitle`、`companyName`） |
| GET | `/api/v1/educationLevelList` | — | 教育程度選項（`id`、`label`） |
| GET | `/api/v1/salaryLevelList` | — | 薪水範圍選項（`id`、`label`） |

列表的 `educationId`、`salaryId` 由前端對照選項清單轉成文字；空值參數不會送出。

## 4. 設計規格

| 項目 | 規格 |
| --- | --- |
| 主色 | Orange `#EE8D2B`（按鈕、連結、分頁、標題色條）；錯誤色 Red `#D95B48` |
| 灰階 | 文字 `#222222`、次要文字 `#666666`、框線 `#CCCCCC` |
| 字型 | Noto Sans TC；字級 12／14／16／20／24px（設計稿為 12–48px 一組） |
| Hero | 背景以 `object-fit: cover` 填滿整個 Hero；人物、Logo、左右眼放在隨 Hero 高度等比縮放的畫面框內。桌機採 1440×823 畫布（人物 1097×823；Logo 540×323）、高度 `min(57.1vw, 823px)`，內容面板自約 85%（y≈700）處上疊、寬度最大 1380px；手機採 375×238 畫布（人物 317×238；Logo 137×82 位於 227,133）、高度 `63.5vw` |
| 寬螢幕 | 超過設計稿寬度（1440）時不再放大：Hero 高度上限 823px、清晰的畫面維持原比例置中，左右兩側以遮罩漸隱，並融入整頁的霧化（blur）背景（`PageBackdrop`），不留白 |
| Hero 動畫 | Logo 放大縮小 Loop、1.5 秒一個 Cycle；左右眼球跟隨滑鼠座標微幅移動（眼球置於人物圖層下方，以眼窩鏤空處當遮罩，位移限制在眼窩內、平滑過渡）；`prefers-reduced-motion` 時停用 |
| Hero 載入 | 背景、人物、Logo、左右眼全部載入完成後才一起淡入（輕微縮放過場），載入期間顯示品牌色三點動畫，不會先出現單獨的眼睛 |
| 卡片 hover | 陰影加深並微幅上移 |
| 輪播 | 每次只移動一張，到最後一張再下一張會回到第一張（不會跳到最後）。**手機**：選中的圖置中，左右鄰圖露出；**桌機（依 Figma）**：一排 3 張、靠左不置中，選中的圖有橘色外框、其餘較淡，視窗只在選中項離開視窗時才滑動，所以最後幾張會依序高亮。上一張／下一張按鈕、圓點、拖拉／滑動、方向鍵皆可用；滑鼠移入暫停自動輪播 |
| 圖片預覽 | 點選中的圖開啟全螢幕預覽（參考 Ant Design Image preview）：放大／縮小（按鈕、滾輪、雙指、雙擊）、旋轉、拖拉平移、還原、顯示比例；上一張／下一張（按鈕、左右滑動、方向鍵）與張數；以按鈕、Esc 或點擊空白處關閉；桌機與手機皆可操作。示範資料的圖片只有 250×150，放大受來源解析度限制 |

## 5. 效能與體驗優化

| 面向 | 做法 |
| --- | --- |
| 圖片 | 設計稿 SVG 內嵌的點陣圖抽出後轉 WebP（背景 123KB、人物 272KB、Logo 77KB，原本合計約 5MB），眼球維持 SVG；背景 `fetchpriority=high`，輪播圖 `loading=lazy` 並指定寬高避免版面位移 |
| 程式拆分 | 詳細資訊 Popup 以 `React.lazy` 延後載入（連同 DOMPurify），首屏 bundle 約 161kB（未 gzip） |
| 渲染 | `JobCard`、`JobGrid`、`FilterBar`、`ImageCarousel`、`CarouselImage` 使用 `memo`；handler 以 `useCallback` 穩定；總頁數、id→文字對照表以 `useMemo` 快取；眼珠追蹤用 CSS 變數 + `requestAnimationFrame`，不觸發 React re-render |
| 節流／防抖 | 眼珠追蹤與輪播捲動同步以 rAF 節流（每幀最多一次更新）；滑過卡片 150ms 後才預取（防抖，快速掃過不會觸發請求）；Logo 動畫在 Hero 離開畫面時以 IntersectionObserver 暫停 |
| 預取 | 列表載入完成後 400ms 靜默預取下一頁；滑過／聚焦／觸碰卡片預取職缺詳細與圖片 |
| 請求 | 以 `AbortController` 取消過期請求；列表以查詢條件快取，回到看過的頁面不重新請求 |
| 過渡 | 換頁保留上一頁並淡化、新卡片依序淡入、Popup Grow 進場、按鈕 hover／active 回饋、focus-visible 外框 |
| 錯誤處理 | 列表載入失敗顯示訊息與「重新載入」 |
| 無障礙 | 「跳到職缺列表」Skip link；筆數以 `role=status` + `aria-live` 播報；Dialog `aria-labelledby`；輪播具 region／按鈕／方向鍵／可點圓點；列表 `aria-busy`；圖片 alt；全站尊重 `prefers-reduced-motion` |
| 部署 | 含後端（API Routes），可部署到 Vercel 或任何 Node 主機（`yarn build && yarn start`） |

## 5.1 使用者體驗細節

| 項目 | 行為 |
| --- | --- |
| 網址 | 換頁與篩選**不改變網址**；網址只在切換語言時變更（`/`、`/en`、`/ja`） |
| 區域 Loading | 列表載入時在列表區上方顯示品牌色三點動畫（150ms 後才出現，避免快速回應時閃爍）並淡化舊內容；Popup 以骨架呈現；首屏以頁面載入動畫過渡 |
| 手機版面 | 內容面板緊貼 Hero 下緣、直角（無圓弧、不重疊），與設計稿一致 |
| 結果筆數 | 標題右側顯示「共 N 筆職缺」 |
| 清除條件 | 篩選欄有內容時出現「清除」；無資料且有篩選時顯示「清除條件」 |
| 整張卡片可點 | 點卡片任何位置都開啟詳細資訊（按鈕仍可用鍵盤操作） |
| 換頁捲動 | 只在列表頂端不在視窗內時才平滑捲動，避免多餘跳動 |
| 輪播 | 滑鼠移入暫停自動輪播；上一張／下一張按鈕（hover 顯示）、方向鍵、圓點可點 |

## 5.2 安全性與效能

| 項目 | 說明 |
| --- | --- |
| 安全 | 資料只在伺服器；API 只允許 GET、限流、輸入上限、通用錯誤；說明 HTML 淨化；CSP 與安全標頭；依賴弱點已處理（Next.js 15.5）。詳見 [SECURITY.md](SECURITY.md) |
| 效能 | Lighthouse 桌機 99／手機 92（Accessibility、Best Practices、SEO 皆 100）；效能預算寫在測試中。詳見 [PERFORMANCE.md](PERFORMANCE.md) |

## 6. 規範符合度檢查

| 項目 | 狀態 | 依據 |
| --- | --- | --- |
| 語言 JavaScript | 符合 | 全為 `.js` |
| Framework React | 符合 | React 18 |
| CSS 使用 MUI | 符合 | `@mui/material`、`@mui/icons-material` |
| Airbnb Style | 符合 | `.eslintrc.json` 繼承 `airbnb`、`airbnb/hooks`，`yarn lint` 對整個 `src`（含題目提供的 `index.js`、`constants`，已格式化為 Airbnb 風格）零錯誤，無任何排除 |
| 依 Figma 實作 | 符合 | 列表、篩選、分頁、Popup、手機版、動畫皆已對照截圖 |
| README：如何執行／架構／困難與解法 | 符合 | README「實作說明」 |
| 加分：載入過渡 | 符合 | Skeleton、換頁淡化、Popup 轉圈 |
| 加分：細節動畫 | 符合 | Logo 縮放 Loop、眼球跟隨、卡片淡入與 hover、輪播 |
| 加分：部署 | 待辦 | 已可靜態部署，需指定平台與授權 |
| 上傳 GitHub | 待辦 | 需你提供 repo／授權 |

## 7. 專案架構

| 目錄 | 職責 |
| --- | --- |
| `src/api` | fetch 封裝 |
| `src/hooks` | `useJobs`（含快取、保留上一頁）、`useJob`、`useOptions` |
| `src/components` | Hero、FilterBar、JobCard、JobGrid、JobDialog、ImageCarousel |
| `src/theme` | MUI theme（色票、字型） |
| `src/assets` | Hero 分層素材（背景、人物、Logo 為 WebP；左右眼為 SVG） |
| `src/figma` | Figma 設計稿截圖 |
| `src/pages` | Next.js 頁面（`index.js`、`_app.js`、`_document.js`）與 API Routes（`api/v1/*`） |
| `src/server` | 伺服器端資料（`data/`）、`jobs.js` 篩選分頁、`handler.js`（只允許 GET、不快取） |
| `src/i18n` | 多國語言設定、訊息檔、Provider |
| `docs` | 規格文件 |

## 8. 驗收狀態

| 項目 | 狀態 |
| --- | --- |
| 單元／整合測試 | `yarn test`，96 個測試；範圍與缺口見 [TESTING.md](TESTING.md) |
| ESLint（Airbnb） | `yarn lint` |
| Production build | `yarn build` |
| 待辦 | 部署、GitHub 上傳 |
