# PostgreSQL Repository Layer
# PostgreSQL 資料存取層

此目錄包含虹靈御所專案的 PostgreSQL 資料庫存取層實作。

This directory contains the PostgreSQL database access layer implementation for the Hongling UI project.

## 檔案結構 / File Structure

```
API/
├── repository/
│   └── PostgresRepo.js     # 主要的 PostgreSQL 存取類別
├── config.js               # 資料庫配置檔案
├── example.js              # 使用範例與測試
├── package.json            # 依賴套件設定
└── README.md              # 說明文件
```

## 功能特色 / Features

### 🗄️ 資料表管理
- **bazi_charts** - 八字命盤資料存儲
- **narrative_reports** - 敘事報告內容
- **user_sessions** - 使用者會話管理
- 自動建立索引以提升查詢效能

### 🔧 核心功能
- **連線池管理** - 高效的資料庫連線處理
- **自動初始化** - 自動建立所需的資料表與索引
- **錯誤處理** - 完整的錯誤捕捉與日誌記錄
- **會話管理** - 使用者會話的建立、查詢與清理
- **統計查詢** - 資料庫使用統計與監控

### 📊 支援的資料操作
- 儲存與查詢八字命盤資料
- 管理多種風格的敘事報告
- 使用者會話持久化
- 批量資料處理
- 資料庫統計與監控

## 快速開始 / Quick Start

### 1. 安裝依賴 / Install Dependencies

```bash
cd API
npm install
```

### 2. 環境設定 / Environment Setup

建立 `.env` 檔案設定資料庫連線：

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=hongling_db
DB_USER=postgres
DB_PASSWORD=your_password
NODE_ENV=development
```

### 3. 初始化資料庫 / Initialize Database

```bash
npm run init-db
```

### 4. 執行範例 / Run Example

```bash
npm run example
```

## 使用方式 / Usage

### 基本設定 / Basic Setup

```javascript
const PostgresRepo = require('./repository/PostgresRepo');
const config = require('./config');

const repo = new PostgresRepo(config);
await repo.connect();
```

### 儲存八字命盤 / Save Bazi Chart

```javascript
const chartData = {
  userId: 'user123',
  birthDate: { yyyy: 1990, mm: 5, dd: 15, hh: 14 },
  pillars: {
    "年": { "pillar": "庚午", "gan": "庚", "zhi": "午" },
    "月": { "pillar": "辛巳", "gan": "辛", "zhi": "巳" },
    "日": { "pillar": "甲子", "gan": "甲", "zhi": "子" },
    "時": { "pillar": "辛未", "gan": "辛", "zhi": "未" }
  },
  fiveElements: { "金": 3, "木": 1, "水": 1, "火": 2, "土": 1 },
  yinYang: { "陰": 3, "陽": 5 },
  tenGods: ["正財", "偏官", "正印", "食神"]
};

const result = await repo.saveChart(chartData);
console.log('Chart ID:', result.chartId);
```

### 儲存敘事報告 / Save Narrative Report

```javascript
const narrativeData = {
  chartId: 1,
  tone: 'military',
  narrative: {
    "年": {
      "commander": "金馬將軍",
      "strategist": "堅毅軍師",
      "naYin": "路旁土",
      "story": "你的童年如金馬奔騰..."
    }
    // ... 其他柱的敘事
  }
};

const result = await repo.saveNarrative(narrativeData);
console.log('Narrative ID:', result.narrativeId);
```

### 查詢資料 / Query Data

```javascript
// 根據 ID 查詢命盤
const chart = await repo.getChartById(1);

// 查詢使用者的所有命盤
const userCharts = await repo.getChartsByUserId('user123');

// 查詢特定語調的敘事報告
const narrative = await repo.getNarrativeByChartAndTone(1, 'military');
```

## API 參考 / API Reference

### PostgresRepo 類別方法

#### 連線管理 / Connection Management
- `connect()` - 建立資料庫連線
- `disconnect()` - 關閉資料庫連線
- `initializeTables()` - 初始化資料表

#### 命盤操作 / Chart Operations
- `saveChart(chartData)` - 儲存八字命盤
- `getChartById(chartId)` - 根據 ID 取得命盤
- `getChartsByUserId(userId)` - 取得使用者的所有命盤

#### 敘事操作 / Narrative Operations
- `saveNarrative(narrativeData)` - 儲存敘事報告
- `getNarrativeByChartAndTone(chartId, tone)` - 取得特定語調的敘事
- `getAllNarrativesByChart(chartId)` - 取得命盤的所有敘事

#### 會話管理 / Session Management
- `saveUserSession(sessionId, userData, expiresIn)` - 儲存使用者會話
- `getUserSession(sessionId)` - 取得使用者會話
- `cleanupExpiredSessions()` - 清理過期會話

#### 統計與監控 / Statistics & Monitoring
- `getStatistics()` - 取得資料庫統計資訊
- `query(sql, params)` - 執行原始 SQL 查詢

## 資料表結構 / Database Schema

### bazi_charts 表
```sql
CREATE TABLE bazi_charts (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255),
  birth_date JSONB NOT NULL,
  pillars JSONB NOT NULL,
  five_elements JSONB NOT NULL,
  yin_yang JSONB NOT NULL,
  ten_gods TEXT[],
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### narrative_reports 表
```sql
CREATE TABLE narrative_reports (
  id SERIAL PRIMARY KEY,
  chart_id INTEGER REFERENCES bazi_charts(id) ON DELETE CASCADE,
  tone VARCHAR(50) NOT NULL,
  narrative_data JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### user_sessions 表
```sql
CREATE TABLE user_sessions (
  id SERIAL PRIMARY KEY,
  session_id VARCHAR(255) UNIQUE NOT NULL,
  user_data JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP
);
```

## 效能最佳化 / Performance Optimization

- 使用連線池管理資料庫連線
- 為常用查詢欄位建立索引
- JSONB 格式儲存複雜資料結構
- 自動清理過期會話
- 支援批量操作

## 錯誤處理 / Error Handling

所有方法都包含完整的錯誤處理機制：
- 資料庫連線錯誤
- SQL 語法錯誤
- 資料驗證錯誤
- 網路連線問題

## 安全考量 / Security Considerations

- 使用參數化查詢防止 SQL 注入
- 支援 SSL 連線
- 會話過期機制
- 敏感資料加密儲存（需額外實作）

## 相容性 / Compatibility

- Node.js >= 14.0.0
- PostgreSQL >= 12.0
- 支援所有主流作業系統

## 貢獻 / Contributing

歡迎提交 Issue 和 Pull Request 來改善這個專案！

Welcome to submit Issues and Pull Requests to improve this project!