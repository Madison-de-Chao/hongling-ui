const API_BASE = "https://rainbow-sanctuary-bazu-production.up.railway.app";

// 呼叫後端 API，取得敘事報告
async function fetchReport(pillars, tone = "default") {
  const res = await fetch(`${API_BASE}/report`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ pillars, tone })
  });

  if (!res.ok) throw new Error("API 回應失敗");
  return await res.json();
}

// 新增：從資料庫計算八字
async function calculateBaziFromDatabase(birthData) {
  const res = await fetch(`${API_BASE}/bazi/calculate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(birthData)
  });

  if (!res.ok) throw new Error("八字計算失敗");
  return await res.json();
}

// 新增：從資料庫獲取完整八字分析
async function getFullBaziAnalysis(birthData, tone = "default") {
  try {
    const res = await fetch(`${API_BASE}/bazi/analysis`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...birthData, tone })
    });

    if (!res.ok) throw new Error("八字分析失敗");
    return await res.json();
  } catch (error) {
    console.warn("資料庫API暫時無法使用，使用演示數據：", error);
    return getDemoAnalysis(birthData, tone);
  }
}

// 演示數據生成器
function getDemoAnalysis(birthData, tone = "default") {
  const toneStyles = {
    "military": {
      prefix: "將軍",
      suffix: "，準備迎接人生戰場的挑戰！",
      style: "軍事化"
    },
    "healing": {
      prefix: "療癒師",
      suffix: "，用溫柔的力量撫慰世界。",
      style: "溫柔療癒"
    },
    "poetic": {
      prefix: "詩人",
      suffix: "，如詩如畫般綻放生命之美。",
      style: "詩意美學"
    },
    "mythic": {
      prefix: "神話使者",
      suffix: "，承載著古老的神秘力量。",
      style: "神話傳說"
    },
    "default": {
      prefix: "守護者",
      suffix: "，在人生道路上勇敢前行。",
      style: "平衡"
    }
  };

  const currentTone = toneStyles[tone] || toneStyles.default;
  
  // 使用sample.json中的數據作為演示
  return {
    chart: {
      pillars: {
        年: {
          pillar: "庚午",
          gan: "庚",
          zhi: "午"
        },
        月: {
          pillar: "辛巳",
          gan: "辛",
          zhi: "巳"
        },
        日: {
          pillar: "甲子",
          gan: "甲",
          zhi: "子"
        },
        時: {
          pillar: "丙午",
          gan: "丙",
          zhi: "午"
        }
      },
      fiveElements: {
        金: 2,
        木: 1,
        水: 1,
        火: 3,
        土: 1
      },
      yinYang: {
        陰: 3,
        陽: 5
      }
    },
    narrative: {
      年: {
        commander: `金馬${currentTone.prefix}`,
        strategist: "堅韌軍師",
        naYin: "路旁土",
        story: `出生於${birthData.year}年的你，如金馬奔騰，充滿勇氣與決心。年柱金馬${currentTone.prefix}代表你的根基扎實，無論面對什麼挑戰都能勇敢前行${currentTone.suffix}`
      },
      月: {
        commander: `金蛇${currentTone.prefix}`,
        strategist: "智慧導師", 
        naYin: "白鑞金",
        story: `青春時期的金蛇${currentTone.prefix}賦予你敏銳的洞察力，你善於在複雜的情況中找到最佳的解決方案，智慧如蛇般靈活${currentTone.suffix}`
      },
      日: {
        commander: `木鼠${currentTone.prefix}`,
        strategist: "機智先鋒",
        naYin: "海中金", 
        story: `你的核心本質如機智的木鼠，外表溫和但內心充滿活力。日柱木鼠${currentTone.prefix}象徵你的適應能力極強，能在任何環境中茁壯成長${currentTone.suffix}`
      },
      時: {
        commander: `火馬${currentTone.prefix}`,
        strategist: "熱情戰士",
        naYin: "天河水",
        story: `晚年的火馬${currentTone.prefix}讓你保持青春的熱情，永遠對生活充滿好奇心和冒險精神，是天生的領導者${currentTone.suffix}`
      }
    }
  };
}

// 點擊「開始召喚你的軍團」時執行 - 保留作為備用方法
function enterSiteOld() {
  const tone = document.getElementById("tone").value;

  // 暫時使用固定四柱資料（你之後可以改成使用者輸入）
  const pillars = {
    year: { gan: "甲", zhi: "子", pillar: "甲子" },
    month: { gan: "丙", zhi: "寅", pillar: "丙寅" },
    day: { gan: "戊", zhi: "午", pillar: "戊午" },
    hour: { gan: "庚", zhi: "申", pillar: "庚申" }
  };

  // 顯示 loading 或遮罩（可選）
  document.querySelector(".enter-btn").innerText = "召喚中...";

  fetchReport(pillars, tone)
    .then(data => {
      console.log("敘事結果：", data);

      // 你可以在這裡跳轉頁面或顯示結果
      alert("召喚成功！請查看控制台結果");
      document.querySelector(".enter-btn").innerText = "開始召喚你的軍團";
    })
    .catch(err => {
      console.error("API 錯誤", err);
      alert("召喚失敗，請稍後再試");
      document.querySelector(".enter-btn").innerText = "開始召喚你的軍團";
    });
}
// 動態生成年份選單
window.addEventListener("DOMContentLoaded", () => {
  const yearSelect = document.getElementById("birth-year");
  for (let y = 1900; y <= new Date().getFullYear(); y++) {
    const opt = document.createElement("option");
    opt.value = y;
    opt.textContent = y + "年";
    yearSelect.appendChild(opt);
  }

  const monthSelect = document.getElementById("birth-month");
  for (let m = 1; m <= 12; m++) {
    const opt = document.createElement("option");
    opt.value = m;
    opt.textContent = m + "月";
    monthSelect.appendChild(opt);
  }

  const daySelect = document.getElementById("birth-day");
  for (let d = 1; d <= 31; d++) {
    const opt = document.createElement("option");
    opt.value = d;
    opt.textContent = d + "日";
    daySelect.appendChild(opt);
  }
});

// 主召喚函式 - 使用資料庫計算
async function enterSite() {
  const tone = document.getElementById("tone").value;
  const y = parseInt(document.getElementById("birth-year").value);
  const m = parseInt(document.getElementById("birth-month").value);
  const d = parseInt(document.getElementById("birth-day").value);
  const h = parseInt(document.getElementById("birth-hour").value);

  if (!y || !m || !d || isNaN(h)) {
    alert("請完整輸入出生年月日時");
    return;
  }

  // 準備出生資料
  const birthData = {
    year: y,
    month: m,
    day: d,
    hour: h,
    tone: tone
  };

  document.querySelector(".enter-btn").innerText = "召喚中...";
  document.querySelector(".enter-btn").disabled = true;

  try {
    // 從資料庫獲取完整八字分析
    const analysisData = await getFullBaziAnalysis(birthData, tone);
    
    console.log("八字分析結果：", analysisData);
    
    // 保存數據到 localStorage 以便其他頁面使用
    localStorage.setItem("baziAnalysis", JSON.stringify(analysisData));
    localStorage.setItem("tone", tone);
    
    // 跳轉到結果頁面
    window.location.href = "bazi.html";
    
  } catch (err) {
    console.error("API 錯誤", err);
    alert("召喚失敗，請稍後再試: " + err.message);
    document.querySelector(".enter-btn").innerText = "開始召喚你的軍團";
    document.querySelector(".enter-btn").disabled = false;
  }
}
