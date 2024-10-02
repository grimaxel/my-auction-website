// Function to fetch data from Netlify Serverless Function
fetch('/.netlify/functions/fetchAirtable')
  .then(response => response.json())
  .then(data => {
    const gallery = document.getElementById('gallery');
    gallery.innerHTML = ''; // Clear existing content

    const table1Records = data.table1Records.reverse(); // Reverse Table 1 records
    const table2Records = data.table2Records.reverse(); // Reverse Table 2 records

    // Log fetched data for debugging
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
  const countdownTimer = modal.querySelector('.countdown-timer'); // Countdown timer element

  modalImages.innerHTML = '';  // Clear previous images
  description.innerHTML = '';  // Clear previous description
  countdownTimer.innerHTML = '';  // Clear previous countdown

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

    // Log the end date for debugging
    console.log("End date from Airtable:", post['end date']);

    // Parse the end date
    const endDate = new Date(post['end date']);

    // Get current time and calculate difference
    const currentTime = new Date();
    const timeDifference = endDate - currentTime;

    console.log("Time difference (ms):", timeDifference);

    if (timeDifference > 0) {
      // Convert time difference to hours and minutes
      const hours = Math.floor(timeDifference / (1000 * 60 * 60));
      const minutes = Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60));

      // Display the countdown
      countdownTimer.innerHTML = `${hours} h ${minutes} min`;

      // Adjust the countdown bar width based on time remaining
      const maxTime = 168 * 60 * 60 * 1000; // 168 hours in milliseconds (7 days)
      const percentage = Math.max(0, Math.min(100, (timeDifference / maxTime) * 100));
      countdownTimer.style.background = `linear-gradient(to right, #bbb ${percentage}%, #eee ${percentage}%)`;
    } else {
      // Auction ended
      countdownTimer.innerHTML = '00 h 00 min';
      countdownTimer.style.background = 'linear-gradient(to right, #bbb 0%, #eee 100%)';
    }

    // Display the modal
    modal.style.display = 'block';
  }
}

// Function to close the modal
function closeModal() {
  document.getElementById('myModal').style.display = 'none';  // Hide the modal
}
