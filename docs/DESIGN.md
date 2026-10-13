# 設計規範：顏色、字體、Component

> 來源：Figma 截圖（[src/figma](../src/figma)）與程式碼 [src/theme/index.js](../src/theme/index.js)。修改任一值請同步更新本文件與 [CHANGELOG.md](../CHANGELOG.md)。

## 1. 顏色

Figma 的 Color 頁面定義三組色階：Red、Orange、Gray（各約 14 階）。程式只取用其中的下列值，統一定義在 MUI theme，元件以 token（如 `primary.main`、`grey.300`）引用，不直接寫色碼。

### 1.1 Theme token

| Token | 色碼 | 用途 |
| --- | --- | --- |
| `primary.main` | `#EE8D2B`（Orange） | 「條件搜尋」按鈕、「查看細節」連結、分頁選中、標題左側色條、輪播目前圓點、載入轉圈 |
| `primary.dark` | `#C9731A` | 主色按鈕 hover／active |
| `primary.contrastText` | `#FFFFFF` | 主色底上的文字 |
| `error.main` | `#D95B48`（Red） | 錯誤色（保留，尚無畫面使用） |
| `grey.100` | `#F0F0F0` | Popup 標題與頁尾分隔線、Hero 載入前底色 |
| `grey.300` | `#CCCCCC` | 卡片邊框、輪播未選中圓點（Figma：`gray/500` = `#CCCCCC`） |
| `grey.500` | `#999999` | 停用／次要元素 |
| `grey.700` | `#666666` | 次要文字 |
| `grey.800` | `#4D4D4D` | Popup「關閉」按鈕背景（Figma：`background: #4D4D4D`），hover 轉 `grey.900` |
| `grey.900` | `#222222` | 主要文字 |
| `text.primary` | `#222222` | 內文、標題 |
| `text.secondary` | `#666666` | 卡片的職稱／教育／薪水資訊 |

### 1.2 其他使用中的色值

| 色值 | 用途 |
| --- | --- |
| `rgba(238, 141, 43, 0.12)` | 「查看細節」hover 底色（主色 12% 透明） |
| `rgba(0, 0, 0, 0.12)` | 內容面板陰影 |
| `rgba(0, 0, 0, 0.18)` | 卡片 hover 陰影 |
| `#4D4D4D`、`#FFFFFF` | Figma 屬性面板中的邊框／底色（`gray/1000`、`gray/100`），僅作設計對照 |

## 2. 字體

| 項目 | 規格 |
| --- | --- |
| 字型 | Noto Sans TC（Google Fonts，`display=swap`），後備 Noto Sans、Helvetica Neue、Arial、sans-serif |
| 字重 | 400（內文）、500（標題／公司名稱）、700（強調、按鈕連結、Popup 標題） |
| 基準字級 | 14px（MUI `body2`） |
| 按鈕 | 不轉大寫（`textTransform: none`） |

### 2.1 Figma 字級表

Figma Font 頁面以 rem 定義 9 階（基準 16px），每階各有一般與粗體：

| px | rem |
| --- | --- |
| 12 | 0.694 |
| 14 | 0.833 |
| 16 | 1 |
| 20 | 1.2 |
| 24 | 1.44 |
| 28 | 1.728 |
| 34 | 2.074 |
| 40 | 2.488 |
| 48 | 2.986 |

### 2.2 目前使用位置

| 位置 | 字級／字重 |
| --- | --- |
| 區塊標題「適合前端工程師的好工作」 | 16px／500 |
| 卡片公司名稱 | 20px／500 |
| 卡片職稱、教育、薪水、預覽 | 14px／400 |
| 「查看細節」 | 12px／700 |
| 「無資料」 | 12px（caption） |
| Popup 標題「詳細資訊」 | 16px／700 |
| Popup 公司名稱 | 16px／500；職稱 14px／400（次要色） |
| Popup「工作內容」 | 16px／700 |
| Popup 內文（`description` HTML） | 13px，行高 1.8；內文中的 h1、h2 一律縮為 13px／400 |

## 3. Component

Figma Component 頁面定義：職缺卡片（含 hover 狀態、大小兩種標題尺寸）、下拉選單、文字輸入、分頁、Popup 文字區塊。對應實作如下（皆位於 [src/components](../src/components)）。

| Component | 對應 Figma | Props | 說明 |
| --- | --- | --- | --- |
| `Hero` | Background Animation | 無 | 主視覺，由設計稿分層素材（背景、人物、Logo、左右眼）疊成；Logo 縮放 Loop、眼球跟隨滑鼠；桌機高度 `min(57.1vw, 823px)`、手機 `63.5vw` |
| `FilterBar` | 下拉選單、文字輸入、按鈕 | `educationLevels`、`salaryLevels`、`onSearch` | 公司名稱、教育程度、薪水範圍、「條件搜尋」；按下才送出，送出 `{ companyName, educationLevel, salaryLevel }`；手機不渲染 |
| `JobCard` | 職缺卡片 | `job`、`educationLabel`、`salaryLabel`、`onOpen` | 公司名稱、職稱、教育、薪水、預覽（2 行截斷）、「查看細節」；hover 陰影加深並上移 2px；`memo` |
| `JobGrid` | 卡片排列 | `jobs`、`loading`、`loaded`、`error`、`pageSize`、`educationLevels`、`salaryLevels`、`onOpen`、`onRetry` | 桌機 3 欄、手機 1 欄，間距 16px；處理 Skeleton／錯誤／無資料／載入中淡化；`memo` |
| `JobDialog` | Popup Window | `jobId`、`onClose` | 「詳細資訊」Popup；內含 `ImageCarousel`、淨化後的工作內容；`jobId` 為空時不顯示；以 `React.lazy` 載入 |
| `PageBackdrop` | 寬螢幕延伸 | 無 | 整頁背後的霧化背景（Hero 背景圖 blur 28px 並疊白色漸層），讓寬螢幕兩側與 Hero 下方不留白 |
| `ImagePreview` | Image preview（Ant Design 風格） | `images`、`index`、`open`、`onClose`、`onIndexChange` | 全螢幕深色預覽：縮放、旋轉、平移、切換、關閉；底部工具列、右上關閉、上方張數 |
| `BrandDots` / `RegionLoader` / `PageLoader` | 區域 Loading | `label`、`active` | 品牌色（橘、紅）三點彈跳；`RegionLoader` 覆蓋在列表區上方、150ms 後才出現；`PageLoader` 用於首屏 |
| `ImageCarousel` | Popup 內圖片 | `images` | 可拖拉、每 3 秒自動輪播、圓點指示（目前 24px 寬主色，其餘 12px 灰）；拖拉時暫停輪播 |
| MUI `Pagination` | 分頁 | `count`、`page`、`onChange` | 小尺寸、主色；桌機顯示前後各 2 頁，手機 0 頁 |

### 3.1 共用視覺規則

| 項目 | 規格 |
| --- | --- |
| 圓角 | 8px（theme `shape.borderRadius`）；手機版內容面板為直角（0），緊貼 Hero 下緣 |
| 卡片邊框 | 1px `grey.300` |
| 內容面板 | 白底、最大寬 1380px（設計稿 1440 畫布左右各留 30px）、內距桌機 24px／手機 16px；桌機自 Hero 約 85% 高度（畫布 y≈700）處上疊 |
| 響應式斷點 | `md`（900px）：以上為桌機版，以下為手機版 |
| 動畫時間 | 卡片 hover 0.2s；列表淡化 0.2s；卡片淡入 300ms 起、每張延遲 80ms；Popup 進場 280ms／離場 160ms；Logo 1.5s Loop |
| 無障礙 | 動畫尊重 `prefers-reduced-motion`；按鈕有 focus-visible 外框 |
