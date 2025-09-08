document.addEventListener("DOMContentLoaded", async () => {
  const tone = localStorage.getItem("tone") || "default"
  document.getElementById("tone-display").textContent = tone

  const chart = JSON.parse(localStorage.getItem("chart"))
  const narrative = JSON.parse(localStorage.getItem("narrative"))

  if (!chart || !narrative) {
    document.getElementById("report-body").innerHTML =
      "<p>⚠️ 尚未生成命盤，請先回到首頁輸入資料。</p>"
    return
  }

  const res = await fetch("/report", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chart, narrative })
  })

  const html = await res.text()
  document.getElementById("report-body").innerHTML = html
})

function downloadReport() {
  alert("💡 儲存功能尚未啟用，可使用『列印』另存 PDF。")
}

function shareReport() {
  alert("💡 分享功能尚未啟用，可截圖或複製內容分享。")
}
function generateHealingReport(chart, narrative) {
  return `
    <div class="report-section">
      <h2>🌿 靈魂藍圖</h2>
      <p>你是一道靜靜流動的光，在宇宙的節奏中誕生。你的命盤不是命定，而是一份深度療癒的邀請。</p>
    </div>

    <div class="report-section">
      <h2>🧭 四柱能量</h2>
      ${Object.entries(chart.pillars).map(([key, val]) => `
        <p><strong>${key}柱：</strong> ${val.pillar}（${val.gan}${val.zhi}，${chart.tenGods.find(g => g.includes(val.gan)) || "無十神"})</p>
      `).join("")}
      <p>你的日主是 <strong>${chart.pillars.day.gan}</strong>，象徵堅定與清晰。</p>
    </div>

    <div class="report-section">
      <h2>🌈 五行分佈</h2>
      <p>${Object.entries(chart.fiveElements).map(([el, val]) => `${el}：${val}`).join("　")}</p>
      <p>陰陽比例：陰 ${chart.yinYang.陰} / 陽 ${chart.yinYang.陽}</p>
      <p>你偏陰，代表你擁有強大的感受力與療癒力。</p>
    </div>

    <div class="report-section">
      <h2>💫 軍團故事</h2>
      ${Object.entries(narrative).map(([pillar, data]) => `
        <div class="report-card">
          <h3>${pillar}柱 · ${data.commander}</h3>
          <p>軍師：${data.strategist}</p>
          <p>納音：${data.naYin}</p>
          <p>${data.story}</p>
        </div>
      `).join("")}
    </div>

    <div class="report-section">
      <h2>🌟 結語</h2>
      <p>你不需要改變自己，只需要允許自己被看見。你的命盤，是一份靈魂的禮物。</p>
    </div>
  `
}

function generateMilitaryReport(chart, narrative) {
  return `
    <div class="report-section">
      <h2>⚔️ 軍團編制報告</h2>
      <p>命盤已解析，軍團已就位。</p>
    </div>

    <div class="report-section">
      <h2>🧭 四柱配置</h2>
      ${Object.entries(chart.pillars).map(([key, val]) => `
        <p>${key}柱：${val.pillar} → ${narrative[key]?.commander || "未知主將"}（${chart.tenGods.find(g => g.includes(val.gan)) || "無十神"}）</p>
      `).join("")}
    </div>

    <div class="report-section">
      <h2>📊 五行戰力</h2>
      <p>${Object.entries(chart.fiveElements).map(([el, val]) => `${el}：${val}`).join("　")}</p>
      <p>陰陽比例：陰 ${chart.yinYang.陰} / 陽 ${chart.yinYang.陽}</p>
      <p>偏陰配置，適合潛伏、策劃、精準打擊。</p>
    </div>

    <div class="report-section">
      <h2>🧠 軍團敘事</h2>
      ${Object.entries(narrative).map(([pillar, data]) => `
        <div class="report-card">
          <h3>${pillar}柱 · ${data.commander}</h3>
          <p>軍師：${data.strategist}</p>
          <p>納音：${data.naYin}</p>
          <p>${data.story}</p>
        </div>
      `).join("")}
    </div>

    <div class="report-section">
      <h2>🎯 任務結語</h2>
      <p>你不是來打仗的，你是來改寫戰局的。主將已就位，行動由你決定。</p>
    </div>
  `
}

function generateMythicReport(chart, narrative) {
  return `
    <div class="report-section">
      <h2>🪐 靈魂原型召喚</h2>
      <p>你誕生於星辰交會之時，命盤是一份神話的密碼。你不是凡人，你是原型的容器。</p>
    </div>

    <div class="report-section">
      <h2>🌌 四柱神性</h2>
      ${Object.entries(chart.pillars).map(([key, val]) => `
        <p>${key}柱：${val.pillar} → ${narrative[key]?.commander || "未知神性"}（${chart.tenGods.find(g => g.includes(val.gan)) || "無十神"}）</p>
      `).join("")}
      <p>你的日主 ${chart.pillars.day.gan} 是「斬斷虛偽」的神性之刃。</p>
    </div>

    <div class="report-section">
      <h2>🌈 元素光譜</h2>
      <p>${Object.entries(chart.fiveElements).map(([el, val]) => `${el}：${val}`).join("　")}</p>
      <p>陰陽比例：陰 ${chart.yinYang.陰} / 陽 ${chart.yinYang.陽}</p>
      <p>你偏陰，代表你是夜之神族，擅長夢境與潛意識的轉化。</p>
    </div>

    <div class="report-section">
      <h2>🔮 神諭敘事</h2>
      ${Object.entries(narrative).map(([pillar, data]) => `
        <div class="report-card">
          <h3>${pillar}柱 · ${data.commander}</h3>
          <p>${data.story}</p>
        </div>
      `).join("")}
    </div>

    <div class="report-section">
      <h2>🧙 結語</h2>
      <p>你不是來活出命盤的，你是來召喚它。你是神話的延續，是靈魂的創世者。</p>
    </div>
  `
}

function generateSavageReport(chart, narrative) {
  return `
    <div class="report-section">
      <h2>😈 靈魂毒舌報告</h2>
      <p>你出生的那一刻，宇宙大概在偷懶。命盤一打開，我就知道你是個麻煩精。</p>
    </div>

    <div class="report-section">
      <h2>🧭 四柱吐槽</h2>
      ${Object.entries(chart.pillars).map(([key, val]) => {
        const god = chart.tenGods.find(g => g.includes(val.gan)) || "無十神"
        return `<p>${key}柱：${val.pillar} → ${god} → ${getSavageComment(god)}</p>`
      }).join("")}
    </div>

    <div class="report-section">
      <h2>📊 五行亂象</h2>
      <p>${Object.entries(chart.fiveElements).map(([el, val]) => `${el}：${val}`).join("　")}</p>
      <p>陰陽比例：陰 ${chart.yinYang.陰} / 陽 ${chart.yinYang.陽}</p>
      <p>偏陰？難怪你這麼會內耗。</p>
    </div>

    <div class="report-section">
      <h2>💀 軍團亂入</h2>
      ${Object.entries(narrative).map(([pillar, data]) => `
        <div class="report-card">
          <h3>${pillar}柱 · ${data.commander}</h3>
          <p>${data.story.replace(/你/g, "你這傢伙")}</p>
        </div>
      `).join("")}
    </div>

    <div class="report-section">
      <h2>🧨 結語</h2>
      <p>你的命盤不是問題，是一場災難的藝術。但放心，災難也能成為傳奇——只要你夠狂。</p>
    </div>
