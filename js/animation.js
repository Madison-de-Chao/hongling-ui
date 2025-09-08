document.addEventListener("DOMContentLoaded", () => {
  // 打字機動畫
  new Typed("#typed-slogan", {
    strings: [
      "Art, Bravery, Creation & Truth",
      "Always Bring Care & Truth",
      "靈魂的骨架 × 情感的光譜",
      "從這裡開始，成為自己生命劇本的主角"
    ],
    typeSpeed: 50,
    backSpeed: 30,
    backDelay: 1500,
    loop: false
  })

  // logo 漸現
  const logos = document.querySelectorAll(".logo")
  logos.forEach((logo, i) => {
    setTimeout(() => {
      logo.style.opacity = 1
    }, i * 500)
  })

  // 語音開場（可選）
  const audio = document.getElementById("welcome-audio")
  if (audio) audio.play()
})

function enterSite() {
  const tone = document.getElementById("tone").value
  localStorage.setItem("tone", tone)
  window.location.href = "bazi.html"
}
