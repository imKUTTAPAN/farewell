const cardContainer = document.querySelector('.card-container');
const prevButton = document.getElementById('prevButton');
const nextButton = document.getElementById('nextButton');
const randomImagesContainer = document.querySelector('.random-images');
let currentIndex = 0;
let isDragging = false;
let startPosX = 0;
let currentTranslateX = 0;
let prevTranslateX = 0;
let animationID = 0;

// Array of image paths (replace with your folder path)
const imageFolder = 'images/'; // Path to your image folder
const totalImages = 100; // Total number of images
const imagePaths = Array.from({ length: totalImages }, (_, i) => `${imageFolder}image (${i + 1}).jpg`);

// Preload a few images around the current index
const preloadCount = 3; // Number of images to preload before and after the current index

// Function to create a card element
function createCard(imagePath, index) {
  const card = document.createElement('div');
  card.classList.add('card');
  card.dataset.index = index;

  const img = document.createElement('img');
  img.src = imagePath;
  img.alt = `Image ${index + 1}`;
  img.loading = 'lazy'; // Enable native lazy loading

  card.appendChild(img);
  return card;
}

// Function to load cards around the current index
function loadCards() {
  cardContainer.innerHTML = ''; // Clear existing cards

  // Load the current card and a few surrounding cards
  for (let i = Math.max(0, currentIndex - preloadCount); i <= Math.min(imagePaths.length - 1, currentIndex + preloadCount); i++) {
    const card = createCard(imagePaths[i], i);
    cardContainer.appendChild(card);
  }

  // Add event listeners to the newly loaded cards
  addEventListeners();
  showCards();
}

// Function to add event listeners to cards
function addEventListeners() {
  const cards = document.querySelectorAll('.card');
  cards.forEach((card, index) => {
    const cardIndex = parseInt(card.dataset.index);

    // Mouse events
    card.addEventListener('mousedown', (e) => {
      if (e.button === 0) { // Only respond to the left mouse button
        startDrag(e, cardIndex);
      }
    });
    card.addEventListener('mouseup', endDrag);
    card.addEventListener('mouseleave', endDrag);
    card.addEventListener('mousemove', (e) => {
      if (isDragging) {
        drag(e, cardIndex);
      }
    });

    // Touch events
    card.addEventListener('touchstart', (e) => startDrag(e.touches[0], cardIndex));
    card.addEventListener('touchend', endDrag);
    card.addEventListener('touchmove', (e) => drag(e.touches[0], cardIndex));
  });
}

// Function to load random images
function loadRandomImages() {
  randomImagesContainer.innerHTML = ''; // Clear existing random images

  // Number of random images to display
  const numRandomImages = 4;

  // Array to store positions and sizes of placed images
  const placedImages = [];

  // Randomly pick images from the folder
  for (let i = 0; i < numRandomImages; i++) {
    const randomIndex = Math.floor(Math.random() * totalImages);
    const img = document.createElement('img');
    img.src = imagePaths[randomIndex];
    img.alt = `Random Image ${i + 1}`;
    img.classList.add('random-image');

    // Random size (between 80px and 150px)
    const size = Math.floor(Math.random() * 70) + 80;
    img.style.width = `${size}px`;

    // Random tilt (between -15deg and 15deg)
    const tilt = Math.floor(Math.random() * 30) - 15;
    img.style.transform = `rotate(${tilt}deg)`;

    // Random position without overlapping (only on sides)
    let top, left;
    let overlap;
    do {
      overlap = false;

      // Place on left or right side (not too close to the edge)
      const side = Math.random() < 0.5 ? 'left' : 'right';
      if (side === 'left') {
        left = 15; // 15% from the left edge
      } else {
        left = 75; // 15% from the right edge
      }

      // Random vertical position (not too close to the top or bottom)
      top = Math.random() * 60 + 20; // Between 20% and 80%

      // Check for overlap with existing images
      for (const placed of placedImages) {
        const distance = Math.sqrt((top - placed.top) ** 2 + (left - placed.left) ** 2);
        if (distance < 40) { // Minimum distance to avoid overlap
          overlap = true;
          break;
        }
      }
    } while (overlap);

    // Store the position of the placed image
    placedImages.push({ top, left });

    // Set the position of the image
    img.style.top = `${top}%`;
    img.style.left = `${left}%`;

    randomImagesContainer.appendChild(img);
  }
}

// Initialize the cards and random images
loadCards();
loadRandomImages();

// Button to switch cards
prevButton.addEventListener('click', () => {
  if (currentIndex > 0) {
    currentIndex--;
    transitionCards(-1); // Transition to the previous card
  }
});

nextButton.addEventListener('click', () => {
  if (currentIndex < imagePaths.length - 1) {
    currentIndex++;
    transitionCards(1); // Transition to the next card
  }
});

// Function to transition cards
function transitionCards(direction) {
  const cards = document.querySelectorAll('.card');
  cards.forEach((card) => {
    const cardIndex = parseInt(card.dataset.index);

    if (cardIndex === currentIndex) {
      // Current card slides in
      card.style.transition = 'transform 0.5s ease, opacity 0.5s ease';
      card.style.transform = 'translateX(0)';
      card.style.opacity = 1;
      card.style.zIndex = 2;
    } else if (cardIndex === currentIndex - direction) {
      // Previous/next card slides out
      card.style.transition = 'transform 0.5s ease, opacity 0.5s ease';
      card.style.transform = `translateX(${direction * 100}%)`;
      card.style.opacity = 0;
      card.style.zIndex = 1;
    } else {
      // Hide other cards
      card.style.transition = 'none';
      card.style.transform = 'translateX(100%)';
      card.style.opacity = 0;
      card.style.zIndex = 0;
    }
  });

  // Load new cards after the transition
  setTimeout(() => {
    loadCards();
  }, 500); // Match the duration of the transition
}

function startDrag(e, index) {
  if (index !== currentIndex) return; // Only drag the top card
  isDragging = true;
  startPosX = e.clientX;
  animationID = requestAnimationFrame(animation);
  cardContainer.style.cursor = 'grabbing';
}

function drag(e, index) {
  if (isDragging && index === currentIndex) {
    const currentPosition = e.clientX;
    currentTranslateX = prevTranslateX + currentPosition - startPosX;

    // Calculate the opacity of the next card based on drag distance
    const nextIndex = (currentIndex + 1) % imagePaths.length;
    const opacity = Math.min(Math.abs(currentTranslateX) / 100, 1); // Opacity ranges from 0 to 1
    const nextCard = document.querySelector(`.card[data-index="${nextIndex}"]`);
    if (nextCard) {
      nextCard.style.opacity = opacity;
    }
  }
}

function endDrag() {
  if (!isDragging) return;
  isDragging = false;
  cancelAnimationFrame(animationID);
  cardContainer.style.cursor = 'grab';

  // Snap to the next or previous card based on drag distance
  const threshold = 100;
  if (currentTranslateX < -threshold) {
    currentIndex = (currentIndex + 1) % imagePaths.length;
  } else if (currentTranslateX > threshold) {
    currentIndex = (currentIndex - 1 + imagePaths.length) % imagePaths.length;
  }

  // Reset translation and load new cards
  currentTranslateX = 0;
  prevTranslateX = 0;
  loadCards();
}

function animation() {
  setCardPosition();
  if (isDragging) requestAnimationFrame(animation);
}

function setCardPosition() {
  const currentCard = document.querySelector(`.card[data-index="${currentIndex}"]`);
  if (currentCard) {
    currentCard.style.transform = `translateX(${currentTranslateX}px)`;
  }
}

function showCards() {
  const cards = document.querySelectorAll('.card');
  cards.forEach((card, index) => {
    const cardIndex = parseInt(card.dataset.index);
    if (cardIndex === currentIndex) {
      // Current card is fully visible
      card.style.transform = `translateX(0)`;
      card.style.zIndex = 2;
      card.style.opacity = 1;
    } else if (cardIndex === (currentIndex + 1) % imagePaths.length) {
      // Next card is partially visible
      card.style.transform = `translateX(20px)`;
      card.style.zIndex = 1;
      card.style.opacity = 0; // Start with 0 opacity, will fade in during drag
    } else {
      // Other cards are hidden
      card.style.transform = `translateX(100%)`;
      card.style.zIndex = 0;
      card.style.opacity = 0;
    }
  });
}











 // Create particle effect
 const particlesContainer = document.getElementById('particles-container');
 const particleCount = 80;
 
 // Create particles
 for (let i = 0; i < particleCount; i++) {
     createParticle();
 }
 
 function createParticle() {
     const particle = document.createElement('div');
     particle.className = 'particle';
     
     // Random size (small)
     const size = Math.random() * 3 + 1;
     particle.style.width = `${size}px`;
     particle.style.height = `${size}px`;
     
     // Initial position
     resetParticle(particle);
     
     particlesContainer.appendChild(particle);
     
     // Animate
     animateParticle(particle);
 }
 
 function resetParticle(particle) {
     // Random position
     const posX = Math.random() * 100;
     const posY = Math.random() * 100;
     
     particle.style.left = `${posX}%`;
     particle.style.top = `${posY}%`;
     particle.style.opacity = '0';
     
     return {
         x: posX,
         y: posY
     };
 }
 
 function animateParticle(particle) {
     // Initial position
     const pos = resetParticle(particle);
     
     // Random animation properties
     const duration = Math.random() * 10 + 10;
     const delay = Math.random() * 5;
     
     // Animate with GSAP-like timing
     setTimeout(() => {
         particle.style.transition = `all ${duration}s linear`;
         particle.style.opacity = Math.random() * 0.3 + 0.1;
         
         // Move in a slight direction
         const moveX = pos.x + (Math.random() * 20 - 10);
         const moveY = pos.y - Math.random() * 30; // Move upwards
         
         particle.style.left = `${moveX}%`;
         particle.style.top = `${moveY}%`;
         
         // Reset after animation completes
         setTimeout(() => {
             animateParticle(particle);
         }, duration * 1000);
     }, delay * 1000);
 }
 
 // Mouse interaction
 document.addEventListener('mousemove', (e) => {
     // Create particles at mouse position
     const mouseX = (e.clientX / window.innerWidth) * 100;
     const mouseY = (e.clientY / window.innerHeight) * 100;
     
     // Create temporary particle
     const particle = document.createElement('div');
     particle.className = 'particle';
     
     // Small size
     const size = Math.random() * 4 + 2;
     particle.style.width = `${size}px`;
     particle.style.height = `${size}px`;
     
     // Position at mouse
     particle.style.left = `${mouseX}%`;
     particle.style.top = `${mouseY}%`;
     particle.style.opacity = '0.6';
     
     particlesContainer.appendChild(particle);
     
     // Animate outward
     setTimeout(() => {
         particle.style.transition = 'all 2s ease-out';
         particle.style.left = `${mouseX + (Math.random() * 10 - 5)}%`;
         particle.style.top = `${mouseY + (Math.random() * 10 - 5)}%`;
         particle.style.opacity = '0';
         
         // Remove after animation
         setTimeout(() => {
             particle.remove();
         }, 2000);
     }, 10);
     
     // Subtle movement of gradient spheres
     const spheres = document.querySelectorAll('.gradient-sphere');
     const moveX = (e.clientX / window.innerWidth - 0.5) * 5;
     const moveY = (e.clientY / window.innerHeight - 0.5) * 5;
     
     spheres.forEach(sphere => {
         const currentTransform = getComputedStyle(sphere).transform;
         sphere.style.transform = `translate(${moveX}px, ${moveY}px)`;
     });
 });