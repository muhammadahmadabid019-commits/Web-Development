const btn = document.getElementById("hamburgerBtn");
const menu = document.getElementById("navLinks");

btn.addEventListener("click", function () {
  btn.classList.toggle("open");
  menu.classList.toggle("open");
});

document.querySelectorAll("#navLinks .nav-link").forEach(function (link) {
  link.addEventListener("click", function () {
    btn.classList.remove("open");
    menu.classList.remove("open");
  });
});

document.addEventListener("click", function (e) {
  if (!e.target.closest("#mainNavbar")) {
    btn.classList.remove("open");
    menu.classList.remove("open");
  }
});
