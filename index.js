// Mint Car Detail — site behavior
// The HTML/CSS structure is intentionally preserved. This file only adds behavior.

function toggleHeader() {
  const menu = document.getElementById("collapsed-items");
  if (menu) menu.classList.toggle("active");
}

const CITY_DATA = {
  hamilton: {
    name: "Hamilton",
    title: "Mobile Car Detailing in Hamilton, ON | Mint Car Detail",
    description: "Premium mobile car detailing in Hamilton, Ontario. Interior and exterior detailing brought to your home or workplace."
  },
  burlington: {
    name: "Burlington",
    title: "Mobile Car Detailing in Burlington, ON | Mint Car Detail",
    description: "Premium mobile car detailing in Burlington, Ontario. Interior and exterior detailing brought to your home or workplace."
  },
  ancaster: {
    name: "Ancaster",
    title: "Mobile Car Detailing in Ancaster, ON | Mint Car Detail",
    description: "Premium mobile car detailing in Ancaster, Ontario. Interior and exterior detailing brought to your home or workplace."
  },
  waterdown: {
    name: "Waterdown",
    title: "Mobile Car Detailing in Waterdown, ON | Mint Car Detail",
    description: "Premium mobile car detailing in Waterdown, Ontario. Interior and exterior detailing brought to your home or workplace."
  },
  dundas: {
    name: "Dundas",
    title: "Mobile Car Detailing in Dundas, ON | Mint Car Detail",
    description: "Premium mobile car detailing in Dundas, Ontario. Interior and exterior detailing brought to your home or workplace."
  }
};

/*
  GALLERY:
  Add as many entries as you want here. The HTML never needs to change.
  You can use .jpeg, .jpg, .png or .webp and any filename.
*/
const GALLERY_IMAGES = [
  "./assets/images/slideshow/1.jpeg",
  "./assets/images/slideshow/2.jpeg",
  "./assets/images/slideshow/3.jpeg",
  "./assets/images/slideshow/4.jpeg",
  "./assets/images/slideshow/5.jpeg",
  "./assets/images/slideshow/6.jpeg",
  "./assets/images/slideshow/7.jpeg",
  "./assets/images/slideshow/8.jpeg",
  "./assets/images/slideshow/9.jpeg",
  "./assets/images/slideshow/10.jpeg"
];

function currentCity() {
  const slug = location.pathname.toLowerCase().split("/").filter(Boolean)[0] || "";
  return CITY_DATA[slug] ? { slug, ...CITY_DATA[slug] } : null;
}

function setMetaDescription(content) {
  let meta = document.querySelector('meta[name="description"]');
  if (!meta) {
    meta = document.createElement("meta");
    meta.name = "description";
    document.head.appendChild(meta);
  }
  meta.content = content;
}

function applyCity() {
  const city = currentCity();
  if (!city) return;

  document.title = city.title;
  setMetaDescription(city.description);

  const canonical = document.querySelector('link[rel="canonical"]');
  if (canonical) canonical.href = `https://mintcardetail.com/${city.slug}/`;

  const kicker = document.getElementById("city-kicker");
  const heroTitle = document.getElementById("city-hero-title");
  const heroCopy = document.getElementById("city-hero-copy");
  const serviceTitle = document.getElementById("city-service-title");
  const cityField = document.getElementById("service-city");

  if (kicker) kicker.textContent = `Mint Car Detail · ${city.name} Mobile Service`;
  if (heroTitle) heroTitle.textContent = `Premium mobile car detailing in ${city.name}.`;
  if (heroCopy) heroCopy.textContent =
    `Interior and exterior mobile car detailing brought directly to your home or workplace in ${city.name}. ` +
    `Tell us what you drive and we’ll get back to you with the right service and exact price.`;
  if (serviceTitle) serviceTitle.textContent = `Mobile Car Detailing in ${city.name}`;
  if (cityField) cityField.value = city.name;
}

function buildGallery() {
  const track = document.getElementById("gallery-track");
  if (!track) return;

  track.innerHTML = "";

  GALLERY_IMAGES.forEach((src, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "mint-gallery-slide";
    button.dataset.galleryIndex = String(index);
    button.setAttribute("aria-label", `Open detailing photo ${index + 1}`);

    const img = document.createElement("img");
    img.src = src;
    img.alt = `Mobile car detailing result, photo ${index + 1}`;
    img.loading = index < 2 ? "eager" : "lazy";
    img.decoding = "async";

    // If one file is missing, only that slide is removed; the gallery keeps working.
    img.addEventListener("error", () => button.remove(), { once: true });

    button.appendChild(img);
    track.appendChild(button);
  });

  setupGallery(track);
}

function setupGallery(track) {
  const lightbox = document.getElementById("lightbox");
  const lightboxImg = document.getElementById("lightbox-img");
  const closeBtn = document.getElementById("close");
  const prevBtn = document.getElementById("prev");
  const nextBtn = document.getElementById("next");
  const scrollPrev = document.getElementById("gallery-scroll-prev");
  const scrollNext = document.getElementById("gallery-scroll-next");

  let currentIndex = 0;
  let autoTimer = null;

  const availableSlides = () => Array.from(track.querySelectorAll(".mint-gallery-slide"));

  function openAt(index) {
    const slides = availableSlides();
    if (!slides.length || !lightbox || !lightboxImg) return;
    currentIndex = (index + slides.length) % slides.length;
    const img = slides[currentIndex].querySelector("img");
    if (!img) return;
    lightboxImg.src = img.src;
    lightboxImg.alt = img.alt;
    lightbox.classList.add("active");
    document.body.style.overflow = "hidden";
  }

  function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove("active");
    document.body.style.overflow = "";
  }

  function moveLightbox(direction) {
    openAt(currentIndex + direction);
  }

  track.addEventListener("click", (event) => {
    const slide = event.target.closest(".mint-gallery-slide");
    if (!slide) return;
    const slides = availableSlides();
    openAt(slides.indexOf(slide));
  });

  closeBtn?.addEventListener("click", (e) => { e.stopPropagation(); closeLightbox(); });
  prevBtn?.addEventListener("click", (e) => { e.stopPropagation(); moveLightbox(-1); });
  nextBtn?.addEventListener("click", (e) => { e.stopPropagation(); moveLightbox(1); });
  lightbox?.addEventListener("click", (e) => { if (e.target === lightbox) closeLightbox(); });

  document.addEventListener("keydown", (e) => {
    if (!lightbox?.classList.contains("active")) return;
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowLeft") moveLightbox(-1);
    if (e.key === "ArrowRight") moveLightbox(1);
  });

  const scrollAmount = () => Math.min(track.clientWidth * 0.82, 920);
  const scrollByPhoto = (direction) => {
    track.scrollBy({ left: direction * scrollAmount(), behavior: "smooth" });
  };

  scrollPrev?.addEventListener("click", () => scrollByPhoto(-1));
  scrollNext?.addEventListener("click", () => scrollByPhoto(1));

  function startAutoScroll() {
    clearInterval(autoTimer);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    autoTimer = setInterval(() => {
      const atEnd = track.scrollLeft + track.clientWidth >= track.scrollWidth - 24;
      if (atEnd) track.scrollTo({ left: 0, behavior: "smooth" });
      else scrollByPhoto(1);
    }, 4500);
  }

  ["pointerdown", "touchstart", "wheel"].forEach((type) => {
    track.addEventListener(type, () => {
      clearInterval(autoTimer);
      window.setTimeout(startAutoScroll, 7000);
    }, { passive: true });
  });

  startAutoScroll();
}

document.addEventListener("DOMContentLoaded", () => {
  applyCity();
  buildGallery();
});
