document.addEventListener('DOMContentLoaded', () => {
  const body = document.body;
  const nav = document.querySelector('.main-nav');
  const siteHeader = document.querySelector('.site-header');
  const navToggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');
  const joinButton = document.querySelector('.join-button');

  if (nav && navToggle && navLinks) {
    const closeNavigation = (restoreFocus = false) => {
      nav.classList.remove('nav-open');
      siteHeader?.classList.remove('nav-open');
      body.classList.remove('nav-menu-open');
      navToggle.setAttribute('aria-expanded', 'false');
      if (restoreFocus) navToggle.focus();
    };

    navToggle.addEventListener('click', () => {
      const isOpen = nav.classList.toggle('nav-open');
      siteHeader?.classList.toggle('nav-open', isOpen);
      body.classList.toggle('nav-menu-open', isOpen);
      navToggle.setAttribute('aria-expanded', String(isOpen));

      if (isOpen) {
        navLinks.querySelector('a')?.focus();
      }
    });

    navLinks.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        closeNavigation();
      });
    });

    document.addEventListener('click', (event) => {
      if (nav.classList.contains('nav-open') && !nav.contains(event.target)) {
        closeNavigation();
      }
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && nav.classList.contains('nav-open')) {
        closeNavigation(true);
      }
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth > 900 && nav.classList.contains('nav-open')) {
        closeNavigation();
      }
    });
  }

  const activePage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach((link) => {
    const href = link.getAttribute('href');
    if (href === activePage) {
      link.classList.add('active');
    }
  });

  const revealItems = document.querySelectorAll('.reveal, .service-card, article, section, .cta, .card, .feature-card');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });

    revealItems.forEach((item) => observer.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add('visible'));
  }

  const contactForm = document.querySelector('form');
  if (contactForm) {
    contactForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const submitButton = contactForm.querySelector('button[type="submit"]');
      const message = document.createElement('p');
      message.className = 'form-feedback';
      message.textContent = 'Thank you! Your message has been sent successfully.';

      const existingFeedback = contactForm.querySelector('.form-feedback');
      if (existingFeedback) existingFeedback.remove();

      submitButton.insertAdjacentElement('afterend', message);
      contactForm.reset();
      submitButton.disabled = true;
      submitButton.textContent = 'Sent';

      setTimeout(() => {
        submitButton.disabled = false;
        submitButton.textContent = 'Send Message';
      }, 2000);
    });
  }

  const yearTarget = document.querySelector('[data-year]');
  if (yearTarget) {
    yearTarget.textContent = new Date().getFullYear();
  }

  const photoCarousel = document.querySelector('.tournament-photo-carousel');
  if (photoCarousel) {
    const track = photoCarousel.querySelector('.tournament-photo-grid');
    const previousButton = photoCarousel.querySelector('[data-carousel-previous]');
    const nextButton = photoCarousel.querySelector('[data-carousel-next]');
    const position = photoCarousel.querySelector('[data-carousel-position]');
    const photos = [...track.querySelectorAll('[data-photo-trigger]')];

    const updateCarouselControls = () => {
      const firstPhoto = photos[0];
      const gap = Number.parseFloat(getComputedStyle(track).columnGap) || 0;
      const step = firstPhoto.getBoundingClientRect().width + gap;
      const currentPhoto = Math.min(photos.length, Math.round(track.scrollLeft / step) + 1);

      position.textContent = `${String(currentPhoto).padStart(2, '0')} / ${String(photos.length).padStart(2, '0')}`;
      previousButton.disabled = track.scrollLeft <= 2;
      nextButton.disabled = track.scrollLeft + track.clientWidth >= track.scrollWidth - 2;
    };

    const scrollCarousel = (direction) => {
      const firstPhoto = photos[0];
      const gap = Number.parseFloat(getComputedStyle(track).columnGap) || 0;
      const step = firstPhoto.getBoundingClientRect().width + gap;
      track.scrollBy({
        left: direction * step,
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'
      });
    };

    previousButton.addEventListener('click', () => scrollCarousel(-1));
    nextButton.addEventListener('click', () => scrollCarousel(1));
    track.addEventListener('scroll', updateCarouselControls, { passive: true });
    window.addEventListener('resize', updateCarouselControls);
    updateCarouselControls();
  }

  const photoLightbox = document.querySelector('.photo-lightbox');
  if (photoLightbox) {
    const lightboxImage = photoLightbox.querySelector('.photo-lightbox-image');
    const lightboxCaption = photoLightbox.querySelector('.photo-lightbox-caption');
    const lightboxCount = photoLightbox.querySelector('.photo-lightbox-count');
    const previousPhotoButton = photoLightbox.querySelector('.photo-lightbox-previous');
    const nextPhotoButton = photoLightbox.querySelector('.photo-lightbox-next');
    let activePhotos = [];
    let activePhotoIndex = 0;
    let lastFocusedPhoto = null;

    const showPhoto = (index) => {
      activePhotoIndex = (index + activePhotos.length) % activePhotos.length;
      const photoButton = activePhotos[activePhotoIndex];
      const photo = photoButton.querySelector('img');

      lightboxImage.src = photo.currentSrc || photo.src;
      lightboxImage.alt = photo.alt;
      lightboxCaption.textContent = photoButton.dataset.caption || photo.alt;
      lightboxCount.textContent = `${String(activePhotoIndex + 1).padStart(2, '0')} / ${String(activePhotos.length).padStart(2, '0')}`;
    };

    document.querySelectorAll('[data-photo-gallery]').forEach((gallery) => {
      const galleryPhotos = [...gallery.querySelectorAll('[data-photo-trigger]')];
      galleryPhotos.forEach((photoButton, index) => {
        photoButton.addEventListener('click', () => {
          activePhotos = galleryPhotos;
          lastFocusedPhoto = photoButton;
          showPhoto(index);
          photoLightbox.showModal();
        });
      });
    });

    previousPhotoButton.addEventListener('click', () => showPhoto(activePhotoIndex - 1));
    nextPhotoButton.addEventListener('click', () => showPhoto(activePhotoIndex + 1));
    photoLightbox.querySelector('.photo-lightbox-close').addEventListener('click', () => photoLightbox.close());

    photoLightbox.addEventListener('click', (event) => {
      if (event.target === photoLightbox) photoLightbox.close();
    });

    photoLightbox.addEventListener('close', () => {
      lightboxImage.removeAttribute('src');
      lastFocusedPhoto?.focus();
    });

    document.addEventListener('keydown', (event) => {
      if (!photoLightbox.open) return;
      if (event.key === 'Escape') {
        event.preventDefault();
        photoLightbox.close();
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault();
        showPhoto(activePhotoIndex - 1);
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        showPhoto(activePhotoIndex + 1);
      }
    });
  }

  if (joinButton) {
    joinButton.addEventListener('mouseenter', () => {
      body.classList.add('cursor-boost');
    });

    joinButton.addEventListener('mouseleave', () => {
      body.classList.remove('cursor-boost');
    });
  }
});
