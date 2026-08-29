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
  GitHub Pages builds the complete image list into #gallery-image-data in
  index.html. Add or remove a supported image in assets/images/slideshow and
  the gallery updates on the next deployment. Filenames do not need numbers.

  The numbered-file fallback keeps the gallery usable during a direct local
  preview where GitHub Pages has not processed the HTML template yet.
*/
const GALLERY_FALLBACK = {
  folder: "./assets/images/slideshow/",
  extensions: ["jpeg", "jpg", "png", "webp", "avif", "gif"],
  maximumNumber: 500,
  stopAfterMissing: 20
};

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

function naturalImageSort(first, second) {
  return first.localeCompare(second, undefined, {
    numeric: true,
    sensitivity: "base"
  });
}

function galleryImagesFromPage() {
  const dataElement = document.getElementById("gallery-image-data");
  if (!dataElement) return [];

  try {
    const images = JSON.parse(dataElement.textContent);
    if (!Array.isArray(images)) return [];

    return images
      .filter((src) => typeof src === "string" && src.trim())
      .map((src) => src.trim());
  } catch (error) {
    // Expected when index.html is opened directly without a GitHub Pages build.
    return [];
  }
}

function imageExists(src) {
  return new Promise((resolve) => {
    const probe = new Image();
    probe.onload = () => resolve(true);
    probe.onerror = () => resolve(false);
    probe.src = src;
  });
}

async function findNumberedImage(number) {
  for (const extension of GALLERY_FALLBACK.extensions) {
    const src = `${GALLERY_FALLBACK.folder}${number}.${extension}`;
    if (await imageExists(src)) return src;
  }

  return null;
}

async function discoverNumberedImages() {
  const images = [];
  let consecutiveMissing = 0;

  for (let number = 1; number <= GALLERY_FALLBACK.maximumNumber; number += 1) {
    const src = await findNumberedImage(number);

    if (src) {
      images.push(src);
      consecutiveMissing = 0;
    } else {
      consecutiveMissing += 1;
    }

    if (consecutiveMissing >= GALLERY_FALLBACK.stopAfterMissing) break;
  }

  return images;
}

async function getGalleryImages() {
  const generatedImages = galleryImagesFromPage();
  const images = generatedImages.length
    ? generatedImages
    : await discoverNumberedImages();

  return [...new Set(images)].sort(naturalImageSort);
}

function formatGalleryNumber(value, total) {
  const width = Math.max(2, String(Math.max(total, 1)).length);
  return String(value).padStart(width, "0");
}

async function buildGallery() {
  const track = document.getElementById("gallery-track");
  if (!track) return;

  const galleryImages = await getGalleryImages();
  const fragment = document.createDocumentFragment();

  galleryImages.forEach((src, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "mint-gallery-pro__slide mint-gallery-slide";
    button.dataset.galleryIndex = String(index);
    button.setAttribute("aria-label", `Open detailing photo ${index + 1}`);

    const img = document.createElement("img");
    img.src = src;
    img.alt = `Mobile car detailing result, photo ${index + 1}`;
    img.loading = index < 2 ? "eager" : "lazy";
    img.decoding = "async";

    // A broken image removes only its own slide and refreshes the live count.
    img.addEventListener("error", () => {
      button.remove();
      track.dispatchEvent(new CustomEvent("gallerychange"));
    }, { once: true });

    button.appendChild(img);
    fragment.appendChild(button);
  });

  track.replaceChildren(fragment);
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
  const galleryCurrent = document.getElementById("gallery-current");
  const galleryTotal = document.getElementById("gallery-total");
  const lightboxCurrent = document.getElementById("lightbox-current");
  const lightboxTotal = document.getElementById("lightbox-total");

  let currentIndex = 0;
  let autoTimer = null;
  let restartTimer = null;
  let scrollFrame = null;
  let previouslyFocused = null;

  const availableSlides = () =>
    Array.from(track.querySelectorAll(".mint-gallery-slide"));

  function visibleSlideIndex() {
    const slides = availableSlides();
    if (!slides.length) return 0;

    const viewportCenter = track.scrollLeft + (track.clientWidth / 2);
    let closestIndex = 0;
    let closestDistance = Infinity;

    slides.forEach((slide, index) => {
      const slideCenter = slide.offsetLeft + (slide.offsetWidth / 2);
      const distance = Math.abs(slideCenter - viewportCenter);

      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = index;
      }
    });

    return closestIndex;
  }

  function updateCounters() {
    const total = availableSlides().length;
    const visibleIndex = total ? visibleSlideIndex() : 0;
    const visibleNumber = total ? visibleIndex + 1 : 0;

    if (galleryCurrent) {
      galleryCurrent.textContent =
        formatGalleryNumber(visibleNumber, total);
    }

    if (galleryTotal) {
      galleryTotal.textContent =
        formatGalleryNumber(total, total);
    }

    if (lightboxTotal) {
      lightboxTotal.textContent =
        formatGalleryNumber(total, total);
    }

    if (!total) {
      clearInterval(autoTimer);
      closeLightbox();
    } else if (currentIndex >= total) {
      currentIndex = total - 1;
    }
  }

  function updateLightboxCounter() {
    const total = availableSlides().length;

    if (lightboxCurrent) {
      lightboxCurrent.textContent =
        formatGalleryNumber(total ? currentIndex + 1 : 0, total);
    }

    if (lightboxTotal) {
      lightboxTotal.textContent =
        formatGalleryNumber(total, total);
    }
  }

  function openAt(index) {
    const slides = availableSlides();

    if (!slides.length || !lightbox || !lightboxImg) return;

    currentIndex = (index + slides.length) % slides.length;

    const img = slides[currentIndex].querySelector("img");
    if (!img) return;

    previouslyFocused = document.activeElement;

    lightboxImg.src = img.currentSrc || img.src;
    lightboxImg.alt = img.alt;

    updateLightboxCounter();

    lightbox.classList.add("active");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";

    closeBtn?.focus();
  }

  function closeLightbox() {
    if (!lightbox) return;

    const wasOpen = lightbox.classList.contains("active");

    lightbox.classList.remove("active");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";

    if (wasOpen && previouslyFocused instanceof HTMLElement) {
      previouslyFocused.focus();
    }
  }

  function moveLightbox(direction) {
    openAt(currentIndex + direction);
  }

  function scrollToSlide(index) {
    const slides = availableSlides();
    if (!slides.length) return;

    const wrappedIndex = (index + slides.length) % slides.length;

    track.scrollTo({
      left: slides[wrappedIndex].offsetLeft,
      behavior: "smooth"
    });
  }

  function scrollByPhoto(direction) {
    scrollToSlide(visibleSlideIndex() + direction);
  }

  function startAutoScroll() {
    clearInterval(autoTimer);

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    if (document.hidden || availableSlides().length < 2) {
      return;
    }

    autoTimer = setInterval(() => {
      const slides = availableSlides();
      if (slides.length < 2) return;

      const nextIndex = visibleSlideIndex() + 1;

      scrollToSlide(nextIndex >= slides.length ? 0 : nextIndex);
    }, 4500);
  }

  function pauseAndRestartAutoScroll() {
    clearInterval(autoTimer);
    clearTimeout(restartTimer);

    restartTimer = window.setTimeout(startAutoScroll, 7000);
  }

  track.addEventListener("click", (event) => {
    const slide = event.target.closest(".mint-gallery-slide");
    if (!slide) return;

    const slides = availableSlides();
    openAt(slides.indexOf(slide));
  });

  track.addEventListener("scroll", () => {
    if (scrollFrame) {
      cancelAnimationFrame(scrollFrame);
    }

    scrollFrame = requestAnimationFrame(updateCounters);
  }, { passive: true });

  track.addEventListener("gallerychange", () => {
    updateCounters();
    updateLightboxCounter();
    startAutoScroll();
  });

  closeBtn?.addEventListener("click", (event) => {
    event.stopPropagation();
    closeLightbox();
  });

  prevBtn?.addEventListener("click", (event) => {
    event.stopPropagation();
    moveLightbox(-1);
  });

  nextBtn?.addEventListener("click", (event) => {
    event.stopPropagation();
    moveLightbox(1);
  });

  lightbox?.addEventListener("click", (event) => {
    if (event.target === lightbox) {
      closeLightbox();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (!lightbox?.classList.contains("active")) return;

    if (event.key === "Escape") closeLightbox();
    if (event.key === "ArrowLeft") moveLightbox(-1);
    if (event.key === "ArrowRight") moveLightbox(1);
  });

  scrollPrev?.addEventListener("click", () => {
    scrollByPhoto(-1);
    pauseAndRestartAutoScroll();
  });

  scrollNext?.addEventListener("click", () => {
    scrollByPhoto(1);
    pauseAndRestartAutoScroll();
  });

  ["pointerdown", "touchstart", "wheel"].forEach((type) => {
    track.addEventListener(type, pauseAndRestartAutoScroll, {
      passive: true
    });
  });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      clearInterval(autoTimer);
    } else {
      startAutoScroll();
    }
  });

  updateCounters();
  updateLightboxCounter();
  startAutoScroll();
}

document.addEventListener("DOMContentLoaded", () => {
  applyCity();

  buildGallery().catch((error) => {
    console.error("Gallery could not be loaded:", error);
  });
});