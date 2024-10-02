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
  const countdownDiv = modal.querySelector('.countdown-timer');

  modalImages.innerHTML = '';  // Clear previous images
  description.innerHTML = '';  // Clear previous description
  countdownDiv.innerHTML = '';  // Clear countdown

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

    // Add caption, auction price, and link to the modal
    description.innerHTML = `<strong>Caption:</strong> ${post.caption || 'No caption available'}<br>
                             <strong>Asking Price:</strong> ${post['auction price'] || 'Not available'}<br>
                             <a href="${post['auction url']}" target="_blank">Link to the auction</a>`;

    // Calculate and display the countdown timer
    const endDate = new Date(post['end date']);
    startCountdown(endDate, countdownDiv);

    // Display the modal
    modal.style.display = 'block';
  }
}

// Function to start countdown timer
function startCountdown(endDate, countdownDiv) {
  function updateCountdown() {
    const now = new Date();
    const timeDiff = endDate - now;
    const minutesLeft = Math.floor(timeDiff / (1000 * 60));
    const hoursLeft = Math.floor(minutesLeft / 60);
    const minsLeft = minutesLeft % 60;

    if (timeDiff <= 0) {
      countdownDiv.innerHTML = 'Auction ended';
      return;
    }

    // Update countdown text
    countdownDiv.innerHTML = `<span>${hoursLeft} h ${minsLeft} min</span>`;

    // Update the progress bar
    const totalMinutes = 168 * 60;  // 168 hours is the full width
    const minutesElapsed = totalMinutes - minutesLeft;
    const progressPercentage = (minutesElapsed / totalMinutes) * 100;
    countdownDiv.style.setProperty('--progress', `${progressPercentage}%`);

    // Repeat every minute
    setTimeout(updateCountdown, 60000);
  }

  updateCountdown();  // Start countdown
}

// Function to close the modal
function closeModal() {
  document.getElementById('myModal').style.display = 'none';  // Hide the modal
}

