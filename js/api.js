const API_BASE = "https://web-production-a01dc.up.railway.app";

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

// 點擊「開始召喚你的軍團」時執行
function enterSite() {
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

// 主召喚函式
function enterSite() {
  const tone = document.getElementById("tone").value;
  const y = parseInt(document.getElementById("birth-year").value);
  const m = parseInt(document.getElementById("birth-month").value);
  const d = parseInt(document.getElementById("birth-day").value);
  const h = parseInt(document.getElementById("birth-hour").value);

  if (!y || !m || !d || isNaN(h)) {
    alert("請完整輸入出生年月日時");
    return;
  }

  // 使用 utils.ts 的四柱推演邏輯（你已經有）
  const yearPillar = calculateYearPillar(y, m, d);
  const monthPillar = calculateMonthPillar(yearPillar.gan, y, m, d);
  const dayPillar = calculateDayPillar(y, m, d);
  const hourPillar = calculateHourPillar(h, dayPillar.gan);

  const pillars = {
    year: yearPillar,
    month: monthPillar,
    day: dayPillar,
    hour: hourPillar
  };

  document.querySelector(".enter-btn").innerText = "召喚中...";

  fetchReport(pillars, tone)
    .then(data => {
      console.log("敘事結果：", data);
      alert("召喚成功！請查看控制台結果");
      document.querySelector(".enter-btn").innerText = "開始召喚你的軍團";
    })
    .catch(err => {
      console.error("API 錯誤", err);
      alert("召喚失敗，請稍後再試");
      document.querySelector(".enter-btn").innerText = "開始召喚你的軍團";
    });
}
