// Function to fetch data from Netlify Serverless Function
fetch('/.netlify/functions/fetchAirtable')
  .then(response => response.json())
  .then(data => {
    const gallery = document.getElementById('gallery');
    gallery.innerHTML = ''; // Clear existing content

    const table1Records = data.table1Records.reverse(); // Reverse Table 1 records
    const table2Records = data.table2Records.reverse(); // Reverse Table 2 records

    // Log the fetched data for debugging
    console.log("Fetched data from Table 1:", table1Records);
    console.log("Fetched data from Table 2:", table2Records);

    // Display front images from Table 1
    table1Records.forEach(record => {
      const post = record.fields;
      const imgElement = document.createElement('img');
      imgElement.src = post['first image'];  // Use the first image from Table 1
      imgElement.alt = `Auction item ${post['row number']}`;  // Alt text
      imgElement.onclick = () => openModal(post['row number'], table2Records);  // Pass row number and Table 2 records

      gallery.appendChild(imgElement);  // Add the image to the gallery
    });
  })
  .catch(error => console.error('Error fetching data from Netlify function:', error));

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
    ['first image', 'second image', 'third image'].forEach(field => {
      if (post[field]) {
        const imgElement = document.createElement('img');
        imgElement.src = post[field];  // Add images from Table 2
        modalImages.appendChild(imgElement);
      }
    });

    // Add caption, auction price, and auction URL link to the modal
    description.innerHTML = `<strong>Caption:</strong> ${post.caption || 'No caption available'}<br>
                             <strong>Asking Price:</strong> ${post['auction price'] || 'Not available'}<br>
                             <a href="${post['auction url']}" target="_blank">Link to the auction</a>`;

    // Extract and format the end date
    const endDateStr = post['end date'];
    console.log("End date from Airtable:", endDateStr);

    // Parse the date into a Date object, and REMOVE 2 hours from the end date to adjust for CEST to UTC
    const endDate = parseDateToCEST(endDateStr);
    if (endDate) {
      const adjustedEndDate = new Date(endDate.getTime() - (2 * 60 * 60 * 1000));  // Subtract 2 hours

      const currentTime = new Date();
      const timeDiffMs = adjustedEndDate - currentTime;
      console.log("Time difference (ms):", timeDiffMs);

      if (timeDiffMs > 0) {
        startCountdown(timeDiffMs, timerElement);  // Start the countdown
      } else {
        // If auction has ended, show 00 h 00 min and an empty bar
        timerElement.innerHTML = '00 h 00 min';
        updateCountdownBar(0, timerElement);  // Empty the countdown bar
      }
    }
  }

  // Display the modal
  modal.style.display = 'block';
}

// Parse the date string to a Date object, considering CEST (UTC+2)
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
    // Create a Date object and adjust to CEST (Central European Summer Time UTC+2)
    const utcDate = new Date(Date.UTC(year, month, day, hour, minute));
    return utcDate;  // Do not apply any extra offset here
  }
  console.error('Invalid date format:', dateStr);
  return null;
}

// Start countdown timer and update every minute
function startCountdown(timeDiffMs, timerElement) {
  const totalTime = 168 * 60 * 60 * 1000; // 168 hours in milliseconds
  function updateTimer() {
    const hours = Math.floor(timeDiffMs / (1000 * 60 * 60));
    const minutes = Math.floor((timeDiffMs % (1000 * 60 * 60)) / (1000 * 60));
    const countdownText = `${hours.toString().padStart(2, '0')} h ${minutes.toString().padStart(2, '0')} min`;
    
    timerElement.innerHTML = `
      <div class="light-gray-bar"></div>
      <div class="dark-gray-bar"></div>
      <div class="timer-text">${countdownText}</div>
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

// Function to close the modal
function closeModal() {
  document.getElementById('myModal').style.display = 'none';  // Hide the modal
}

