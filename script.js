window.addEventListener("scroll", function () {
  const nav = document.querySelector("nav");
  const hidePoint = 20; // in pixel: punto in cui il nav scompare
  const viewPoint = 400;

  if (window.scrollY >= hidePoint && window.scrollY <= viewPoint) {
    nav.style.opacity = "0";
    nav.style.pointerEvents = "none"; // così non clicchi accidentalmente
  } else {
    nav.style.opacity = "1";
    nav.style.pointerEvents = "auto";
  }
});
