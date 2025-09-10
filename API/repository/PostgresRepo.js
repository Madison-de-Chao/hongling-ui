/**
 * PostgreSQL Repository for Hongling UI
 * 虹靈御所 PostgreSQL 資料存取層
 * 
 * 負責處理八字命盤、敘事報告的資料庫操作
 * Handles database operations for bazi charts and narrative reports
 */

class PostgresRepo {
  constructor(connectionConfig) {
    this.config = connectionConfig || {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      database: process.env.DB_NAME || 'hongling_db',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || '',
      ssl: process.env.NODE_ENV === 'production'
    };
    this.pool = null;
  }

  /**
   * 初始化資料庫連線池
   * Initialize database connection pool
   */
  async connect() {
    try {
      const { Pool } = require('pg');
      this.pool = new Pool(this.config);
      
      // 測試連線
      const client = await this.pool.connect();
      console.log('✅ PostgreSQL 連線成功 - Connected to PostgreSQL');
      client.release();
      
      // 初始化資料表
      await this.initializeTables();
      
    } catch (error) {
      console.error('❌ PostgreSQL 連線失敗 - Connection failed:', error.message);
      throw error;
    }
  }

  /**
   * 建立必要的資料表
   * Create necessary database tables
   */
  async initializeTables() {
    const createTablesSQL = `
      -- 使用者八字命盤表
      CREATE TABLE IF NOT EXISTS bazi_charts (
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

      -- 敘事報告表
      CREATE TABLE IF NOT EXISTS narrative_reports (
        id SERIAL PRIMARY KEY,
        chart_id INTEGER REFERENCES bazi_charts(id) ON DELETE CASCADE,
        tone VARCHAR(50) NOT NULL,
        narrative_data JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- 使用者會話表
      CREATE TABLE IF NOT EXISTS user_sessions (
        id SERIAL PRIMARY KEY,
        session_id VARCHAR(255) UNIQUE NOT NULL,
        user_data JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP
      );

      -- 建立索引以提升查詢效能
      CREATE INDEX IF NOT EXISTS idx_bazi_charts_user_id ON bazi_charts(user_id);
      CREATE INDEX IF NOT EXISTS idx_narrative_reports_chart_id ON narrative_reports(chart_id);
      CREATE INDEX IF NOT EXISTS idx_narrative_reports_tone ON narrative_reports(tone);
      CREATE INDEX IF NOT EXISTS idx_user_sessions_session_id ON user_sessions(session_id);
      CREATE INDEX IF NOT EXISTS idx_user_sessions_expires_at ON user_sessions(expires_at);
    `;

    try {
      await this.pool.query(createTablesSQL);
      console.log('✅ 資料表初始化完成 - Database tables initialized');
    } catch (error) {
      console.error('❌ 資料表初始化失敗 - Table initialization failed:', error.message);
      throw error;
    }
  }

  /**
   * 儲存八字命盤資料
   * Save bazi chart data
   */
  async saveChart(chartData) {
    const {
      userId,
      birthDate,
      pillars,
      fiveElements,
      yinYang,
      tenGods
    } = chartData;

    const insertQuery = `
      INSERT INTO bazi_charts (
        user_id, birth_date, pillars, five_elements, yin_yang, ten_gods
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, created_at
    `;

    try {
      const result = await this.pool.query(insertQuery, [
        userId,
        JSON.stringify(birthDate),
        JSON.stringify(pillars),
        JSON.stringify(fiveElements),
        JSON.stringify(yinYang),
        tenGods
      ]);

      const chartId = result.rows[0].id;
      console.log(`✅ 八字命盤已儲存 - Chart saved with ID: ${chartId}`);
      
      return {
        success: true,
        chartId: chartId,
        createdAt: result.rows[0].created_at
      };
    } catch (error) {
      console.error('❌ 儲存八字命盤失敗 - Failed to save chart:', error.message);
      throw error;
    }
  }

  /**
   * 根據 ID 取得八字命盤
   * Get bazi chart by ID
   */
  async getChartById(chartId) {
    const selectQuery = `
      SELECT id, user_id, birth_date, pillars, five_elements, yin_yang, ten_gods, created_at
      FROM bazi_charts 
      WHERE id = $1
    `;

    try {
      const result = await this.pool.query(selectQuery, [chartId]);
      
      if (result.rows.length === 0) {
        return { success: false, message: '找不到指定的命盤資料' };
      }

      const chart = result.rows[0];
      return {
        success: true,
        data: {
          id: chart.id,
          userId: chart.user_id,
          birthDate: chart.birth_date,
          pillars: chart.pillars,
          fiveElements: chart.five_elements,
          yinYang: chart.yin_yang,
          tenGods: chart.ten_gods,
          createdAt: chart.created_at
        }
      };
    } catch (error) {
      console.error('❌ 取得命盤資料失敗 - Failed to get chart:', error.message);
      throw error;
    }
  }

  /**
   * 根據使用者 ID 取得所有命盤
   * Get all charts for a user
   */
  async getChartsByUserId(userId) {
    const selectQuery = `
      SELECT id, birth_date, pillars, five_elements, yin_yang, ten_gods, created_at
      FROM bazi_charts 
      WHERE user_id = $1
      ORDER BY created_at DESC
    `;

    try {
      const result = await this.pool.query(selectQuery, [userId]);
      
      return {
        success: true,
        data: result.rows.map(chart => ({
          id: chart.id,
          birthDate: chart.birth_date,
          pillars: chart.pillars,
          fiveElements: chart.five_elements,
          yinYang: chart.yin_yang,
          tenGods: chart.ten_gods,
          createdAt: chart.created_at
        }))
      };
    } catch (error) {
      console.error('❌ 取得使用者命盤失敗 - Failed to get user charts:', error.message);
      throw error;
    }
  }

  /**
   * 儲存敘事報告
   * Save narrative report
   */
  async saveNarrative(narrativeData) {
    const { chartId, tone, narrative } = narrativeData;

    const insertQuery = `
      INSERT INTO narrative_reports (chart_id, tone, narrative_data)
      VALUES ($1, $2, $3)
      RETURNING id, created_at
    `;

    try {
      const result = await this.pool.query(insertQuery, [
        chartId,
        tone,
        JSON.stringify(narrative)
      ]);

      const narrativeId = result.rows[0].id;
      console.log(`✅ 敘事報告已儲存 - Narrative saved with ID: ${narrativeId}`);
      
      return {
        success: true,
        narrativeId: narrativeId,
        createdAt: result.rows[0].created_at
      };
    } catch (error) {
      console.error('❌ 儲存敘事報告失敗 - Failed to save narrative:', error.message);
      throw error;
    }
  }

  /**
   * 根據命盤 ID 和語調取得敘事報告
   * Get narrative report by chart ID and tone
   */
  async getNarrativeByChartAndTone(chartId, tone) {
    const selectQuery = `
      SELECT id, narrative_data, created_at
      FROM narrative_reports
      WHERE chart_id = $1 AND tone = $2
      ORDER BY created_at DESC
      LIMIT 1
    `;

    try {
      const result = await this.pool.query(selectQuery, [chartId, tone]);
      
      if (result.rows.length === 0) {
        return { success: false, message: '找不到指定的敘事報告' };
      }

      const narrative = result.rows[0];
      return {
        success: true,
        data: {
          id: narrative.id,
          narrativeData: narrative.narrative_data,
          createdAt: narrative.created_at
        }
      };
    } catch (error) {
      console.error('❌ 取得敘事報告失敗 - Failed to get narrative:', error.message);
      throw error;
    }
  }

  /**
   * 取得命盤的所有敘事報告
   * Get all narrative reports for a chart
   */
  async getAllNarrativesByChart(chartId) {
    const selectQuery = `
      SELECT id, tone, narrative_data, created_at
      FROM narrative_reports
      WHERE chart_id = $1
      ORDER BY created_at DESC
    `;

    try {
      const result = await this.pool.query(selectQuery, [chartId]);
      
      return {
        success: true,
        data: result.rows.map(narrative => ({
          id: narrative.id,
          tone: narrative.tone,
          narrativeData: narrative.narrative_data,
          createdAt: narrative.created_at
        }))
      };
    } catch (error) {
      console.error('❌ 取得敘事報告失敗 - Failed to get narratives:', error.message);
      throw error;
    }
  }

  /**
   * 儲存使用者會話
   * Save user session
   */
  async saveUserSession(sessionId, userData, expiresIn = 24 * 60 * 60 * 1000) {
    const expiresAt = new Date(Date.now() + expiresIn);
    
    const insertQuery = `
      INSERT INTO user_sessions (session_id, user_data, expires_at)
      VALUES ($1, $2, $3)
      ON CONFLICT (session_id) 
      DO UPDATE SET user_data = $2, expires_at = $3
      RETURNING id
    `;

    try {
      const result = await this.pool.query(insertQuery, [
        sessionId,
        JSON.stringify(userData),
        expiresAt
      ]);

      return {
        success: true,
        sessionId: sessionId,
        expiresAt: expiresAt
      };
    } catch (error) {
      console.error('❌ 儲存使用者會話失敗 - Failed to save user session:', error.message);
      throw error;
    }
  }

  /**
   * 取得使用者會話
   * Get user session
   */
  async getUserSession(sessionId) {
    const selectQuery = `
      SELECT user_data, expires_at
      FROM user_sessions
      WHERE session_id = $1 AND expires_at > CURRENT_TIMESTAMP
    `;

    try {
      const result = await this.pool.query(selectQuery, [sessionId]);
      
      if (result.rows.length === 0) {
        return { success: false, message: '會話不存在或已過期' };
      }

      const session = result.rows[0];
      return {
        success: true,
        data: {
          userData: session.user_data,
          expiresAt: session.expires_at
        }
      };
    } catch (error) {
      console.error('❌ 取得使用者會話失敗 - Failed to get user session:', error.message);
      throw error;
    }
  }

  /**
   * 清理過期會話
   * Clean up expired sessions
   */
  async cleanupExpiredSessions() {
    const deleteQuery = `
      DELETE FROM user_sessions 
      WHERE expires_at <= CURRENT_TIMESTAMP
    `;

    try {
      const result = await this.pool.query(deleteQuery);
      console.log(`✅ 已清理 ${result.rowCount} 個過期會話 - Cleaned up ${result.rowCount} expired sessions`);
      
      return {
        success: true,
        deletedCount: result.rowCount
      };
    } catch (error) {
      console.error('❌ 清理過期會話失敗 - Failed to cleanup expired sessions:', error.message);
      throw error;
    }
  }

  /**
   * 取得資料庫統計資訊
   * Get database statistics
   */
  async getStatistics() {
    const statsQuery = `
      SELECT 
        (SELECT COUNT(*) FROM bazi_charts) as total_charts,
        (SELECT COUNT(*) FROM narrative_reports) as total_narratives,
        (SELECT COUNT(*) FROM user_sessions WHERE expires_at > CURRENT_TIMESTAMP) as active_sessions,
        (SELECT COUNT(DISTINCT user_id) FROM bazi_charts WHERE user_id IS NOT NULL) as unique_users
    `;

    try {
      const result = await this.pool.query(statsQuery);
      
      return {
        success: true,
        data: result.rows[0]
      };
    } catch (error) {
      console.error('❌ 取得統計資訊失敗 - Failed to get statistics:', error.message);
      throw error;
    }
  }

  /**
   * 關閉資料庫連線
   * Close database connection
   */
  async disconnect() {
    if (this.pool) {
      await this.pool.end();
      console.log('✅ PostgreSQL 連線已關閉 - PostgreSQL connection closed');
    }
  }

  /**
   * 執行原始 SQL 查詢（謹慎使用）
   * Execute raw SQL query (use with caution)
   */
  async query(sql, params = []) {
    try {
      const result = await this.pool.query(sql, params);
      return {
        success: true,
        data: result.rows,
        rowCount: result.rowCount
      };
    } catch (error) {
      console.error('❌ SQL 查詢失敗 - SQL query failed:', error.message);
      throw error;
    }
  }
}

module.exports = PostgresRepo;