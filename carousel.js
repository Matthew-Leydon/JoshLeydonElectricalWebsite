function setUpCarousel(carousel) {
  const slidesContainer = carousel.querySelector('[data-carousel-slides-container]');
  const originalSlides = Array.from(slidesContainer.children);
  const buttonPrevious = carousel.querySelector('[data-carousel-button-previous]');
  const buttonNext = carousel.querySelector('[data-carousel-button-next]');
  
  let currentIndex = 0;
  let autoPlayInterval;
  let touchStartX = 0;
  let touchEndX = 0;
  const slidesVisible = 3;
  let isTransitioning = false;

  // Clone slides for infinite loop effect
  originalSlides.forEach(slide => {
    const clone = slide.cloneNode(true);
    slidesContainer.appendChild(clone);
  });
  
  const slides = Array.from(slidesContainer.children);

  // Update slide position with transform
  function updateSlidePosition(instant = false) {
    const slideWidth = slides[0].offsetWidth;
    const gap = parseFloat(getComputedStyle(slidesContainer).gap) || 20;
    const offset = -(currentIndex * (slideWidth + gap));
    
    if (instant) {
      slidesContainer.style.transition = 'none';
    } else {
      slidesContainer.style.transition = 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
    }
    
    slidesContainer.style.transform = `translateX(${offset}px)`;
    
    if (instant) {
      // Force reflow
      slidesContainer.offsetHeight;
      slidesContainer.style.transition = 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
    }
    
    updatePaginationDots();
  }

  // Create pagination dots (only for original slides)
  function createPaginationDots() {
    const paginationContainer = document.createElement('div');
    paginationContainer.className = 'carousel-pagination';
    paginationContainer.setAttribute('role', 'tablist');
    
    // Create dots for each original slide
    for (let i = 0; i < originalSlides.length; i++) {
      const dot = document.createElement('button');
      dot.className = 'carousel-dot';
      dot.setAttribute('role', 'tab');
      dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
      dot.addEventListener('click', () => {
        currentIndex = i;
        updateSlidePosition();
        resetAutoPlay();
      });
      paginationContainer.appendChild(dot);
    }
    
    carousel.appendChild(paginationContainer);
    updatePaginationDots();
  }

  // Update pagination dots
  function updatePaginationDots() {
    const dots = carousel.querySelectorAll('.carousel-dot');
    // Map current index to original slide index
    let activeIndex = currentIndex % originalSlides.length;
    if (activeIndex < 0) {
      activeIndex = originalSlides.length + activeIndex;
    }
    
    dots.forEach((dot, index) => {
      if (index === activeIndex) {
        dot.classList.add('active');
        dot.setAttribute('aria-current', 'true');
      } else {
        dot.classList.remove('active');
        dot.setAttribute('aria-current', 'false');
      }
    });
  }

  // Handle transition end for infinite loop
  function handleTransitionEnd() {
    if (isTransitioning) return;
    
    if (currentIndex >= originalSlides.length) {
      isTransitioning = true;
      currentIndex = currentIndex - originalSlides.length;
      updateSlidePosition(true);
      setTimeout(() => {
        isTransitioning = false;
      }, 50);
    } else if (currentIndex < 0) {
      isTransitioning = true;
      currentIndex = currentIndex + originalSlides.length;
      updateSlidePosition(true);
      setTimeout(() => {
        isTransitioning = false;
      }, 50);
    }
  }

  // Next slide
  function nextSlide() {
    if (isTransitioning) return;
    currentIndex++;
    updateSlidePosition();
  }

  // Previous slide
  function previousSlide() {
    if (isTransitioning) return;
    currentIndex--;
    updateSlidePosition();
  }

  // Auto-play functionality
  function startAutoPlay() {
    autoPlayInterval = setInterval(() => {
      nextSlide();
    }, 5000);
  }

  function resetAutoPlay() {
    if (autoPlayInterval) {
      clearInterval(autoPlayInterval);
    }
    startAutoPlay();
  }

  // Touch/Swipe support
  function handleSwipe() {
    const swipeThreshold = 50;
    if (touchStartX - touchEndX > swipeThreshold) {
      nextSlide();
      resetAutoPlay();
    } else if (touchEndX - touchStartX > swipeThreshold) {
      previousSlide();
      resetAutoPlay();
    }
  }

  // Event listeners
  buttonNext.addEventListener('click', () => {
    nextSlide();
    resetAutoPlay();
  });

  buttonPrevious.addEventListener('click', () => {
    previousSlide();
    resetAutoPlay();
  });

  slidesContainer.addEventListener('transitionend', handleTransitionEnd);

  slidesContainer.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  slidesContainer.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
  }, { passive: true });

  // Click on slide to go to next
  slides.forEach(slide => {
    slide.addEventListener('click', () => {
      nextSlide();
      resetAutoPlay();
    });
  });

  carousel.addEventListener('mouseenter', () => {
    if (autoPlayInterval) {
      clearInterval(autoPlayInterval);
    }
  });

  carousel.addEventListener('mouseleave', () => {
    startAutoPlay();
  });

  // Handle window resize
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      updateSlidePosition(true);
    }, 250);
  });

  // Initialize
  updateSlidePosition(true);
  createPaginationDots();
  startAutoPlay();
}

const carousels = document.querySelectorAll('[data-carousel]');
carousels.forEach(setUpCarousel);
  