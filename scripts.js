// Function to fetch data from Netlify Serverless Function
fetch('/.netlify/functions/fetchAirtable')
  .then(response => response.json())
  .then(data => {
    const gallery = document.getElementById('gallery');
    gallery.innerHTML = ''; // Clear existing content

    const table1Records = data.table1Records.reverse(); // Reverse Table 1 records
    console.log("Fetched data from Table 1:", table1Records);

    // Display front images from Table 1
    table1Records.forEach(record => {
      const post = record.fields;
      const imgElement = document.createElement('img');
      imgElement.src = post['first image'];  // Use the first image from Table 1
      imgElement.alt = `Auction item ${post['row number']}`;  // Alt text
      imgElement.onclick = () => fetchTable2AndOpenModal(post['row number']);  // Fetch Table 2 for this modal on click

      gallery.appendChild(imgElement);  // Add the image to the gallery
    });
  })
  .catch(error => console.error('Error fetching data from Netlify function:', error));

// Function to fetch Table 2 data and open the modal
function fetchTable2AndOpenModal(rowNumber) {
  fetch('/.netlify/functions/fetchAirtable')
    .then(response => response.json())
    .then(data => {
      const table2Records = data.table2Records.reverse();
      console.log("Fetched data from Table 2:", table2Records);

      // Open the modal with specific row data
      openModal(rowNumber, table2Records);
    })
    .catch(error => console.error('Error fetching Table 2 data:', error));
}

// Function to open modal with post images, caption, and auction details from Table 2
function openModal(rowNumber, table2Records) {
  const modal = document.getElementById('myModal');
  const modalImages = modal.querySelector('.modal-images');
  const description = modal.querySelector('.description p');
  const timerElement = modal.querySelector('.countdown-timer');

  modalImages.innerHTML = '';  // Clear previous images
  description.innerHTML = '';  // Clear previous description
  timerElement.innerHTML = ''; // Clear previous countdown

  // Find the matching record in Table 2 by row number
  const matchingRecord = table2Records.find(record => record.fields['row number'] === rowNumber);

  if (matchingRecord) {
    const post = matchingRecord.fields;

    // Add all images to the modal
    ['first image', 'second image', 'third image'].forEach((field, index) => {
      if (post[field]) {
        const imgElement = document.createElement('img');
        imgElement.src = post[field];  // Add images from Table 2
        imgElement.classList.add('modal-image');  // Add a class for targeting with arrows
        imgElement.dataset.index = index;  // Add an index to keep track of images
        modalImages.appendChild(imgElement);
      }
    });

    // Add caption, auction price, and auction URL link to the modal
    description.innerHTML = `${post.caption || 'No caption available'}<br><br>
                             <strong>Asking Price:</strong> ${post['auction price'] || 'Not available'}<br><br>
                             <a href="${post['auction url']}" target="_blank">Link to the auction</a>`;

    // Extract and format the end date
    const endDateStr = post['end date'];
    console.log("End date from Airtable:", endDateStr);

    // Parse the date into a Date object, and ADD 4 hours from the end date to adjust for EDT to UTC
    const endDate = parseDateToCEST(endDateStr);
    if (endDate) {
      const adjustedEndDate = new Date(endDate.getTime() + (4 * 60 * 60 * 1000));  // Add 4 hours

      const currentTime = new Date();
      const timeDiffMs = adjustedEndDate - currentTime;
      console.log("Time difference (ms):", timeDiffMs);

      if (timeDiffMs > 0) {
        startCountdown(timeDiffMs, timerElement, post['auction url']);  // Start the countdown
      } else {
        // If auction has ended, show 00 h 00 min and an empty bar
        timerElement.innerHTML = `
            <a href="${post['auction url']}" target="_blank" style="text-decoration: none;" class="countdown-link">
            <div class="light-gray-bar"></div>
            <div class="dark-gray-bar" style="width: 0%;"></div>
            <div class="timer-text">00 h 00 min</div>
            </a>
            `;
      }
    }

    // Initialize the first image and show arrows
    initializeImageArrows(modalImages, post);
  }

  // Display the modal
  modal.style.display = 'block';

  // Reset the image scroll position and arrows
  modalImages.scrollTo({ left: 0 });
  hideArrow('left');
  showArrow('right');
}

// Parse the date string to a Date object, considering EDT (UTC-4)
function parseDateToCEST(dateStr) {
  const parts = dateStr.split(' ');
  const day = parseInt(parts[0]);
  const monthNames = ['jan', 'feb', 'mar', 'apr', 'maj', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec'];
  const month = monthNames.indexOf(parts[1].toLowerCase());
  const year = parseInt(parts[2]);
  const timeParts = parts[3].split(':');
  const hour = parseInt(timeParts[0]);
  const minute = parseInt(timeParts[1]);

  if (!isNaN(day) && month !== -1 && !isNaN(year) && !isNaN(hour) && !isNaN(minute)) {
    // Create a Date object and adjust to EDT
    const utcDate = new Date(Date.UTC(year, month, day, hour, minute));
    return utcDate;  // Do not apply any extra offset here
  }
  console.error('Invalid date format:', dateStr);
  return null;
}

// Start countdown timer and update every minute
function startCountdown(timeDiffMs, timerElement, auctionUrl) {
  const totalTime = 168 * 60 * 60 * 1000; // 168 hours in milliseconds
  function updateTimer() {
    const hours = Math.floor(timeDiffMs / (1000 * 60 * 60));
    const minutes = Math.floor((timeDiffMs % (1000 * 60 * 60)) / (1000 * 60));
    const countdownText = `${hours.toString().padStart(2, '0')} h ${minutes.toString().padStart(2, '0')} min`;

    timerElement.innerHTML = `
      <a href="${auctionUrl}" target="_blank" class="countdown-link" style="text-decoration: none;">
        <div class="light-gray-bar"></div>
        <div class="dark-gray-bar"></div>
        <div class="timer-text">${countdownText}</div>
      </a>
    `;

    // Update the countdown bar
    const progress = timeDiffMs / totalTime;
    updateCountdownBar(progress, timerElement);

    timeDiffMs -= 60 * 1000;  // Subtract one minute from the countdown
  }

  updateTimer();  // Initial update
  setInterval(updateTimer, 60 * 1000);  // Update every minute
}

// Update the countdown bar width
function updateCountdownBar(progress, timerElement) {
  const darkGrayBar = timerElement.querySelector('.dark-gray-bar');
  if (darkGrayBar) {
    darkGrayBar.style.width = `${Math.max(progress * 100, 0)}%`;  // Deplete over time
  }
}

// Function to initialize arrow navigation
function initializeImageArrows(modalImages, post) {
  const images = modalImages.querySelectorAll('.modal-image');
  let currentIndex = 0;

  hideArrow('left');  // Ensure the left arrow is hidden initially

  // Add arrows if more than one image
  if (images.length > 1) {
    showArrow('right');  // Show the right arrow initially

    const rightArrow = document.querySelector('.right-arrow');
    const leftArrow = document.querySelector('.left-arrow');

    if (rightArrow && leftArrow) {
      rightArrow.onclick = () => {
        if (currentIndex < images.length - 1) {
          currentIndex++;
          modalImages.scrollTo({
            left: images[currentIndex].offsetLeft,
            behavior: 'smooth'
          });
          updateArrows(currentIndex, images.length);
        }
      };

      leftArrow.onclick = () => {
        if (currentIndex > 0) {
          currentIndex--;
          modalImages.scrollTo({
            left: images[currentIndex].offsetLeft,
            behavior: 'smooth'
          });
          updateArrows(currentIndex, images.length);
        }
      };

      modalImages.addEventListener('scroll', function () {
        const scrollPosition = modalImages.scrollLeft;
        const maxScroll = modalImages.scrollWidth - modalImages.clientWidth;

        currentIndex = Math.round((scrollPosition / maxScroll) * (images.length - 1));
        updateArrows(currentIndex, images.length);
      });
    }
  }
}

// Function to show or hide arrows
function updateArrows(currentIndex, totalImages) {
  if (currentIndex === 0) {
    hideArrow('left');
  } else {
    showArrow('left');
  }

  if (currentIndex === totalImages - 1) {
    hideArrow('right');
  } else {
    showArrow('right');
  }
}

// Show arrow by class
function showArrow(direction) {
  const arrow = document.querySelector(`.${direction}-arrow`);
  if (arrow) {
    arrow.style.display = 'block';
  }
}

// Hide arrow by class
function hideArrow(direction) {
  const arrow = document.querySelector(`.${direction}-arrow`);
  if (arrow) {
    arrow.style.display = 'none';
  }
}

// Function to close the modal
function closeModal() {
  const modal = document.getElementById('myModal');
  modal.style.display = 'none';  // Hide the modal

  // Reset modal scroll and arrows when closed
  const modalImages = modal.querySelector('.modal-images');
  modalImages.scrollTo({ left: 0 });
  hideArrow('left');
  showArrow('right');

  // Disable further clicks/touches briefly to prevent new modals from opening
  document.body.style.pointerEvents = 'none';
  setTimeout(() => {
    document.body.style.pointerEvents = 'auto';
  }, 300);  // Delay of 300ms before re-enabling interactions
}

// Function to close modal when clicking outside it
window.onclick = function (event) {
  const modal = document.getElementById('myModal');
  if (event.target === modal) {
    closeModal();
  }
};

// For mobile touch events as well
window.addEventListener('touchstart', function (event) {
  const modal = document.getElementById('myModal');
  if (event.target === modal) {
    closeModal();
  }
});


