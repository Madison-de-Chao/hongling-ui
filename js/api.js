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

// 新增：從資料庫計算八字 - 使用正確的API端點
async function calculateBaziFromDatabase(birthData) {
  // 轉換為後端API期望的格式
  const apiData = {
    datetime_local: `${birthData.year}-${String(birthData.month).padStart(2, '0')}-${String(birthData.day).padStart(2, '0')}T${String(birthData.hour).padStart(2, '0')}:00:00`,
    timezone: "Asia/Taipei",
    longitude: 120.0,
    use_true_solar_time: false
  };

  const res = await fetch(`${API_BASE}/api/bazi/compute`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(apiData)
  });

  if (!res.ok) throw new Error("八字計算失敗");
  return await res.json();
}

// 新增：從資料庫獲取完整八字分析
async function getFullBaziAnalysis(birthData, tone = "default") {
  try {
    const baziResult = await calculateBaziFromDatabase(birthData);
    
    // 轉換後端數據格式為前端期望的格式
    const analysisData = convertBackendToFrontend(baziResult.data, tone);
    return analysisData;
  } catch (error) {
    console.warn("資料庫API暫時無法使用，使用演示數據：", error);
    return getDemoAnalysis(birthData, tone);
  }
}

// 轉換後端API數據格式為前端期望的格式
function convertBackendToFrontend(backendData, tone = "default") {
  const toneStyles = {
    "military": { prefix: "將軍", suffix: "，準備迎接人生戰場的挑戰！", style: "軍事化" },
    "healing": { prefix: "療癒師", suffix: "，用溫柔的力量撫慰世界。", style: "溫柔療癒" },
    "poetic": { prefix: "詩人", suffix: "，如詩如畫般綻放生命之美。", style: "詩意美學" },
    "mythic": { prefix: "神話使者", suffix: "，承載著古老的神秘力量。", style: "神話傳說" },
    "default": { prefix: "守護者", suffix: "，在人生道路上勇敢前行。", style: "平衡" }
  };

  const currentTone = toneStyles[tone] || toneStyles.default;
  
  // 轉換四柱數據
  const pillars = {
    年: {
      pillar: backendData.four_pillars.year.stem + backendData.four_pillars.year.branch,
      gan: backendData.four_pillars.year.stem,
      zhi: backendData.four_pillars.year.branch
    },
    月: {
      pillar: backendData.four_pillars.month.stem + backendData.four_pillars.month.branch,
      gan: backendData.four_pillars.month.stem,
      zhi: backendData.four_pillars.month.branch
    },
    日: {
      pillar: backendData.four_pillars.day.stem + backendData.four_pillars.day.branch,
      gan: backendData.four_pillars.day.stem,
      zhi: backendData.four_pillars.day.branch
    },
    時: {
      pillar: backendData.four_pillars.hour.stem + backendData.four_pillars.hour.branch,
      gan: backendData.four_pillars.hour.stem,
      zhi: backendData.four_pillars.hour.branch
    }
  };

  // 轉換五行統計
  const fiveElements = backendData.five_elements_stats.elements_count;

  return {
    chart: {
      pillars: pillars,
      fiveElements: fiveElements,
      yinYang: {
        陰: Math.round(Object.values(fiveElements).reduce((a, b) => a + b, 0) * 0.4),
        陽: Math.round(Object.values(fiveElements).reduce((a, b) => a + b, 0) * 0.6)
      }
    },
    narrative: {
      年: {
        commander: `${pillars.年.gan}${pillars.年.zhi}${currentTone.prefix}`,
        strategist: backendData.ten_gods.year_stem || "智慧軍師",
        naYin: "路旁土", // 可以後續從後端獲取
        story: `年柱${pillars.年.pillar}代表你的根基與出身，${currentTone.prefix}的特質在你身上展現${currentTone.suffix}`
      },
      月: {
        commander: `${pillars.月.gan}${pillars.月.zhi}${currentTone.prefix}`,
        strategist: backendData.ten_gods.month_stem || "青春導師",
        naYin: "白鑞金",
        story: `月柱${pillars.月.pillar}展現你青年時期的特質，${currentTone.prefix}的智慧指引你前行${currentTone.suffix}`
      },
      日: {
        commander: `${pillars.日.gan}${pillars.日.zhi}${currentTone.prefix}`,
        strategist: backendData.ten_gods.day_stem || "核心本質",
        naYin: "海中金",
        story: `日柱${pillars.日.pillar}是你的核心本質，${currentTone.prefix}的力量從內心散發${currentTone.suffix}`
      },
      時: {
        commander: `${pillars.時.gan}${pillars.時.zhi}${currentTone.prefix}`,
        strategist: backendData.ten_gods.hour_stem || "未來戰士",
        naYin: "天河水",
        story: `時柱${pillars.時.pillar}預示你的未來發展，${currentTone.prefix}的潛能將在晚年綻放${currentTone.suffix}`
      }
    },
    spirits: backendData.spirits || [],
    calculation_log: backendData.calculation_log,
    data_provenance: backendData.data_provenance
  };
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
        story: `出生於${birthData.year}年的你，如金馬奔騰，充滿勇氣與決心。年柱金馬${currentTone.prefix}代表你的根基扎實，無論面對什麼挑戰都能勇敢前行。你的性格中蘊含著堅韌不拔的精神，就像路旁土一般默默承載著一切，為他人提供穩固的支撐。在人生的道路上，你總是能夠以最踏實的方式前進，不急不躁，但每一步都走得堅定有力。你的存在就像大地一般可靠，讓身邊的人感到安心和溫暖${currentTone.suffix}`
      },
      月: {
        commander: `金蛇${currentTone.prefix}`,
        strategist: "智慧導師", 
        naYin: "白鑞金",
        story: `青春時期的金蛇${currentTone.prefix}賦予你敏銳的洞察力，你善於在複雜的情況中找到最佳的解決方案，智慧如蛇般靈活。你的思維敏捷，總能在關鍵時刻做出正確的判斷，就像白鑞金一般純淨而珍貴。在人際關係中，你展現出卓越的溝通能力，能夠理解他人的內心世界，並給予最適當的建議。你的智慧不僅體現在學識上，更在於對人性的深刻理解，這讓你成為朋友們信賴的智慧導師${currentTone.suffix}`
      },
      日: {
        commander: `木鼠${currentTone.prefix}`,
        strategist: "機智先鋒",
        naYin: "海中金", 
        story: `你的核心本質如機智的木鼠，外表溫和但內心充滿活力。日柱木鼠${currentTone.prefix}象徵你的適應能力極強，能在任何環境中茁壯成長。你擁有敏銳的直覺和靈活的思維，總能在變化中找到機會，就像海中金一般在深邃的海洋中閃閃發光。你的人格魅力在於那種不張揚但深具內涵的特質，你不需要大聲宣告自己的存在，卻能在關鍵時刻展現出驚人的能力。你是天生的問題解決者，總能以創新的方式化解困難${currentTone.suffix}`
      },
      時: {
        commander: `火馬${currentTone.prefix}`,
        strategist: "熱情戰士",
        naYin: "天河水",
        story: `晚年的火馬${currentTone.prefix}讓你保持青春的熱情，永遠對生活充滿好奇心和冒險精神，是天生的領導者。你的熱情如火焰般燃燒，照亮身邊每一個人的心靈，就像天河水一般源源不絕地滋養著周圍的生命。即使歲月流逝，你依然保持著年輕的心態，對未來充滿憧憬和期待。你的領導風格溫暖而有力，能夠激發他人的潛能，讓團隊在你的帶領下創造出驚人的成就。你的人生哲學是永遠保持前進的動力，永不停歇地追求更高的目標${currentTone.suffix}`
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
