// 頁面載入時從 localStorage 讀取數據並渲染
document.addEventListener("DOMContentLoaded", () => {
  const baziAnalysis = localStorage.getItem("baziAnalysis");
  if (baziAnalysis) {
    const data = JSON.parse(baziAnalysis);
    if (data.chart && data.narrative) {
      renderChart(data.chart);
      renderNarrative(data.narrative);
    }
  }
});

// 原有的表單提交處理保留作為備用
document.getElementById("bazi-form").addEventListener("submit", async (e) => {
  e.preventDefault()
  const form = new FormData(e.target)
  const input = {
    year: parseInt(form.get("yyyy")),
    month: parseInt(form.get("mm")),
    day: parseInt(form.get("dd")),
    hour: parseInt(form.get("hh")),
    minute: 0,
    zMode: form.get("zMode")
  }
  const tone = localStorage.getItem("tone") || "default"

  try {
    // 使用新的資料庫API
    const analysisData = await getFullBaziAnalysis({
      year: input.year,
      month: input.month,
      day: input.day,
      hour: input.hour
    }, tone);

    localStorage.setItem("baziAnalysis", JSON.stringify(analysisData));
    
    if (analysisData.chart && analysisData.narrative) {
      renderChart(analysisData.chart);
      renderNarrative(analysisData.narrative);
    }
  } catch (error) {
    console.error("計算失敗：", error);
    alert("計算失敗：" + error.message);
  }
})

function renderChart(chart) {
  const pillars = chart.pillars
  const html = Object.entries(pillars).map(([key, val]) => {
    return `<div><strong>${key}柱：</strong> ${val.pillar}（${val.gan}${val.zhi}）</div>`
  }).join("")
  document.getElementById("pillars").innerHTML = html

  const ctx = document.getElementById("fiveChart").getContext("2d")
  new Chart(ctx, {
    type: "radar",
    data: {
      labels: Object.keys(chart.fiveElements),
      datasets: [{
        label: "五行分佈",
        data: Object.values(chart.fiveElements),
        backgroundColor: "rgba(255,99,132,0.2)",
        borderColor: "#ff6ec4"
      }]
    }
  })

  document.getElementById("yinYang").innerHTML =
    `陰：${chart.yinYang.陰}　陽：${chart.yinYang.陽}`
}

function renderNarrative(narrative) {
  const html = Object.entries(narrative).map(([pillar, data]) => {
    return `
      <div class="card">
        <h3>${pillar}柱軍團</h3>
        <p>主將：${data.commander}</p>
        <p>軍師：${data.strategist}</p>
        <p>納音：${data.naYin}</p>
        <div id="typed-${pillar}"></div>
      </div>
    `
  }).join("")
  document.getElementById("narrative").innerHTML = html

  Object.entries(narrative).forEach(([pillar, data]) => {
    new Typed(`#typed-${pillar}`, {
      strings: [data.story],
      typeSpeed: 40,
      showCursor: false
    })
  })
}

function exportReport() {
  window.location.href = "report.html"
}
