/**
 * Usage Example for PostgresRepo
 * PostgresRepo 使用範例
 * 
 * 此檔案展示如何在實際專案中使用 PostgresRepo
 * This file demonstrates how to use PostgresRepo in a real project
 */

const PostgresRepo = require('./repository/PostgresRepo');
const dbConfig = require('./config');

// 創建 repository 實例
const repo = new PostgresRepo(dbConfig);

/**
 * 範例：完整的八字命盤生成與儲存流程
 * Example: Complete bazi chart generation and storage workflow
 */
async function exampleWorkflow() {
  try {
    // 1. 初始化資料庫連線
    await repo.connect();
    console.log('資料庫連線已建立');

    // 2. 模擬前端傳來的使用者資料
    const userData = {
      sessionId: 'user_session_123',
      birthInfo: {
        yyyy: 1990,
        mm: 5,
        dd: 15,
        hh: 14,
        minute: 0,
        zMode: 'late'
      },
      tone: 'military'
    };

    // 3. 儲存使用者會話
    await repo.saveUserSession(userData.sessionId, {
      birthInfo: userData.birthInfo,
      tone: userData.tone
    });

    // 4. 模擬計算出的八字命盤資料（通常從計算邏輯得來）
    const chartData = {
      userId: userData.sessionId,
      birthDate: userData.birthInfo,
      pillars: {
        "年": { "pillar": "庚午", "gan": "庚", "zhi": "午" },
        "月": { "pillar": "辛巳", "gan": "辛", "zhi": "巳" },
        "日": { "pillar": "甲子", "gan": "甲", "zhi": "子" },
        "時": { "pillar": "辛未", "gan": "辛", "zhi": "未" }
      },
      fiveElements: {
        "金": 3,
        "木": 1,
        "水": 1,
        "火": 2,
        "土": 1
      },
      yinYang: {
        "陰": 3,
        "陽": 5
      },
      tenGods: ["正財", "偏官", "正印", "食神"]
    };

    // 5. 儲存八字命盤
    const saveResult = await repo.saveChart(chartData);
    const chartId = saveResult.chartId;
    console.log(`八字命盤已儲存，ID: ${chartId}`);

    // 6. 模擬生成的敘事報告
    const narrativeData = {
      chartId: chartId,
      tone: userData.tone,
      narrative: {
        "年": {
          "commander": "金馬將軍",
          "strategist": "堅毅軍師",
          "naYin": "路旁土",
          "story": "你的童年如金馬奔騰，充滿堅強的意志力與不屈的精神。年柱的金馬將軍賦予你領導的天賦，在困境中展現鋼鐵般的決心。"
        },
        "月": {
          "commander": "金蛇統領",
          "strategist": "智慧謀士",
          "naYin": "白臘金",
          "story": "青春歲月的你如機智之蛇，善於觀察與謀劃。月柱的金蛇統領教會你在變化中尋找機會，用智慧創造財富。"
        },
        "日": {
          "commander": "木鼠元帥",
          "strategist": "靈活戰士",
          "naYin": "海中金",
          "story": "你的核心本質如靈活之鼠，機敏而富有創造力。日柱的木鼠元帥代表你能在最小的空間中發揮最大的潛能。"
        },
        "時": {
          "commander": "金羊先鋒",
          "strategist": "溫和領袖",
          "naYin": "路旁土",
          "story": "晚年的你如溫和的金羊，既有原則又富同情心。時柱的金羊先鋒象徵你的人生後期將以仁慈與智慧指導他人。"
        }
      }
    };

    // 7. 儲存敘事報告
    const narrativeResult = await repo.saveNarrative(narrativeData);
    console.log(`敘事報告已儲存，ID: ${narrativeResult.narrativeId}`);

    // 8. 查詢並驗證資料
    const retrievedChart = await repo.getChartById(chartId);
    console.log('查詢到的命盤資料:', retrievedChart.data.pillars);

    const retrievedNarrative = await repo.getNarrativeByChartAndTone(chartId, userData.tone);
    console.log('查詢到的敘事報告:', Object.keys(retrievedNarrative.data.narrativeData));

    // 9. 取得統計資訊
    const stats = await repo.getStatistics();
    console.log('資料庫統計:', stats.data);

    return {
      chartId: chartId,
      narrativeId: narrativeResult.narrativeId,
      success: true
    };

  } catch (error) {
    console.error('範例執行失敗:', error.message);
    throw error;
  }
}

/**
 * 範例：查詢使用者的所有命盤
 * Example: Query all charts for a user
 */
async function getUserChartsExample(userId) {
  try {
    const charts = await repo.getChartsByUserId(userId);
    console.log(`使用者 ${userId} 的所有命盤:`, charts.data.length);
    return charts.data;
  } catch (error) {
    console.error('查詢使用者命盤失敗:', error.message);
    throw error;
  }
}

/**
 * 範例：清理過期會話
 * Example: Clean up expired sessions
 */
async function cleanupExample() {
  try {
    const result = await repo.cleanupExpiredSessions();
    console.log(`清理了 ${result.deletedCount} 個過期會話`);
    return result;
  } catch (error) {
    console.error('清理會話失敗:', error.message);
    throw error;
  }
}

/**
 * 範例：關閉連線
 * Example: Close connection
 */
async function closeConnection() {
  await repo.disconnect();
}

// 如果直接執行此檔案，則運行範例
if (require.main === module) {
  (async () => {
    try {
      console.log('🚀 開始執行 PostgresRepo 範例...');
      
      const result = await exampleWorkflow();
      console.log('✅ 範例執行成功:', result);
      
      // 查詢範例
      await getUserChartsExample(result.chartId);
      
      // 清理範例
      await cleanupExample();
      
    } catch (error) {
      console.error('❌ 範例執行失敗:', error);
    } finally {
      await closeConnection();
      console.log('🏁 範例執行完成');
    }
  })();
}

module.exports = {
  exampleWorkflow,
  getUserChartsExample,
  cleanupExample,
  closeConnection
};