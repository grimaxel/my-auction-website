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
  const countdown = modal.querySelector('.countdown');
  const progressBar = modal.querySelector('.progress-bar');

  modalImages.innerHTML = '';  // Clear previous images
  description.innerHTML = '';  // Clear previous description
  countdown.innerHTML = '';  // Clear countdown timer
  progressBar.style.width = '100%';  // Reset progress bar

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

    // Add caption and auction details to the modal
    description.innerHTML = `<strong>Caption:</strong> ${post.caption || 'No caption available'}<br>
                             <strong>Asking Price:</strong> ${post['auction price'] || 'Not available'}<br>`;

    // Auction End Time Logic
    const endTime = new Date(post['end date']);  // Convert the end date to Date object
    const currentTime = new Date();

    let timeLeft = Math.max(0, endTime - currentTime);  // Time left in milliseconds
    let totalAuctionTime = 168 * 60 * 60 * 1000; // 168 hours in milliseconds (7 days)
    
    if (timeLeft > totalAuctionTime) timeLeft = totalAuctionTime;

    // Countdown Timer Logic
    const updateTimer = setInterval(() => {
      const hours = Math.floor(timeLeft / (1000 * 60 * 60));
      const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
      
      countdown.textContent = `${hours} h ${minutes} min`;

      // Update progress bar width based on remaining time (timeLeft/totalAuctionTime)
      const progress = Math.max(0, (timeLeft / totalAuctionTime) * 100);
      progressBar.style.width = `${progress}%`;

      if (timeLeft <= 0) {
        clearInterval(updateTimer);  // Stop the timer when time is up
        countdown.textContent = 'Auction Ended';
        progressBar.style.width = '0%';
      }

      timeLeft -= 60000; // Subtract one minute in milliseconds
    }, 60000);  // Update every minute

    // Display the modal
    modal.style.display = 'block';
  }
}

// Function to close the modal
function closeModal() {
  document.getElementById('myModal').style.display = 'none';  // Hide the modal
}
