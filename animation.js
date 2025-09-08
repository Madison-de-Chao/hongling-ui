document.addEventListener("DOMContentLoaded", () => {
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
})

function enterSite() {
  const tone = document.getElementById("tone").value
  localStorage.setItem("tone", tone)
  window.location.href = "bazi.html"
}
