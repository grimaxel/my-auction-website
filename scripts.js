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

// Function to open modal with post images, caption, auction details, and countdown timer
function openModal(rowNumber, table2Records) {
  const modal = document.getElementById('myModal');
  const modalImages = modal.querySelector('.modal-images');
  const description = modal.querySelector('.description p');
  const timerDiv = document.querySelector('.countdown-timer');

  modalImages.innerHTML = '';  // Clear previous images
  description.innerHTML = '';  // Clear previous description

  // Find the matching record in Table 2 by row number
  const matchingRecord = table2Records.find(record => record.fields['row number'] === rowNumber);

  if (matchingRecord) {
    const post = matchingRecord.fields;

    // Log the end date to check its format
    console.log("End date from Airtable:", post['end date']);

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

    // Try to format the end date and calculate the remaining time
    const auctionEndDate = new Date(post['end date']);
    const now = new Date();
    const timeDiff = auctionEndDate - now;

    // Log the time difference to check if the calculation is correct
    console.log("Time difference (ms):", timeDiff);

    if (timeDiff > 0) {
      const hours = Math.floor(timeDiff / (1000 * 60 * 60));
      const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
      const totalTime = 168 * 60 * 60 * 1000; // 168 hours in milliseconds

      // Log remaining hours and minutes
      console.log("Remaining time: ", hours, "h", minutes, "min");

      // Update the countdown display
      timerDiv.innerHTML = `${hours} h ${minutes} min`;

      // Calculate the width of the bar as a percentage
      const percentage = Math.max((timeDiff / totalTime) * 100, 0);
      timerDiv.style.width = `${percentage}%`;

      // Log the calculated percentage for the bar
      console.log("Percentage of time left:", percentage);
    } else {
      timerDiv.innerHTML = 'Auction ended';
      timerDiv.style.width = '0%';
    }

    // Display the modal
    modal.style.display = 'block';
  }
}

// Function to close the modal
function closeModal() {
  document.getElementById('myModal').style.display = 'none';  // Hide the modal
}
