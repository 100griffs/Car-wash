// =========================
// MOBILE MENU TOGGLE
// =========================
function toggleHeader() {
  const menu = document.getElementById("collapsed-items");
  if (!menu) return;
  menu.classList.toggle("active");
}

// =========================
// LIGHTBOX GALLERY (FULL FIXED SYSTEM)
// =========================

document.addEventListener("DOMContentLoaded", () => {

  const images = Array.from(document.querySelectorAll(".gallery-img, .square img"));
  const lightbox = document.getElementById("lightbox");
  const lightboxImg = document.getElementById("lightbox-img");
  const closeBtn = document.getElementById("close");
  const prevBtn = document.getElementById("prev");
  const nextBtn = document.getElementById("next");

  // SAFETY CHECK
  if (!images.length || !lightbox || !lightboxImg) {
    console.error("Lightbox missing elements or images not found");
    return;
  }

  let currentIndex = 0;

  // OPEN LIGHTBOX
  images.forEach((img, index) => {
    img.addEventListener("click", () => {
      currentIndex = index;
      openLightbox();
    });
  });

  function openLightbox() {
    lightbox.classList.add("active");
    updateImage();
  }

  function closeLightbox() {
    lightbox.classList.remove("active");
  }

  function updateImage() {
    lightboxImg.src = images[currentIndex].src;
  }

  function nextImage() {
    if (!images.length) return;
    currentIndex = (currentIndex + 1) % images.length;
    updateImage();
  }

  function prevImage() {
    if (!images.length) return;
    currentIndex = (currentIndex - 1 + images.length) % images.length;
    updateImage();
  }

  // =========================
  // BUTTON EVENTS (FIXED)
  // =========================

  if (nextBtn) {
    nextBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      nextImage();
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      prevImage();
    });
  }

  if (closeBtn) {
    closeBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      closeLightbox();
    });
  }

  // =========================
  // KEYBOARD NAVIGATION
  // =========================
  document.addEventListener("keydown", (e) => {
    if (!lightbox.classList.contains("active")) return;

    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowRight") nextImage();
    if (e.key === "ArrowLeft") prevImage();
  });

  // =========================
  // CLICK OUTSIDE CLOSE
  // =========================
  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) closeLightbox();
  });

});