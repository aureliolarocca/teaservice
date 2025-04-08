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

const hamMen = document.querySelector(".container-ham-men");

if (hamMen) {
  hamMen.addEventListener("click", () => {
    const menuActive = document.querySelector(".menuHam");
    if (menuActive) {
      menuActive.classList.toggle("active");
    }
  });
}

const closeBtnHamMen = document.querySelector("#close-ham-men");

closeBtnHamMen.addEventListener("click", () => {
  const menuActive = document.querySelector(".menuHam");
  if (menuActive) {
    menuActive.classList.toggle("active");
  }
});
