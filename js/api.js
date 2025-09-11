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
  const res = await fetch(`${API_BASE}/bazi/analysis`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...birthData, tone })
  });

  if (!res.ok) throw new Error("八字分析失敗");
  return await res.json();
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
