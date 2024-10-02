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

// Function to open modal with post images, caption, auction details, and countdown
function openModal(rowNumber, table2Records) {
  const modal = document.getElementById('myModal');
  const modalImages = modal.querySelector('.modal-images');
  const description = modal.querySelector('.description p');

  modalImages.innerHTML = '';  // Clear previous images
  description.innerHTML = '';  // Clear previous description

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

    // Calculate the time remaining for countdown
    const endDate = new Date(post['end date']);
    const now = new Date();
    let timeLeft = endDate - now; // in milliseconds

    let hoursLeft = Math.floor(timeLeft / (1000 * 60 * 60));
    let minutesLeft = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));

    // Clamp the progress bar to be full when timeLeft is more than 168 hours
    let maxTime = 168 * 60 * 60 * 1000; // 168 hours in milliseconds
    let timeProgress = Math.max(0, Math.min(timeLeft / maxTime, 1)); // Ratio for progress bar

    // Add countdown timer and auction details to the modal
    description.innerHTML = `<strong>Caption:</strong> ${post.caption || 'No caption available'}<br>
                             <strong>Asking Price:</strong> ${post['auction price'] || 'Not available'}<br>
                             <div class="countdown-bar">
                               <div class="countdown-progress" style="width: ${timeProgress * 100}%"></div>
                               <span>${hoursLeft} h ${minutesLeft} min</span>
                             </div><br>
                             <a href="${post['auction url']}" target="_blank">Link to the auction</a>`;

    // Display the modal
    modal.style.display = 'block';
  }
}

// Function to close the modal
function closeModal() {
  document.getElementById('myModal').style.display = 'none';  // Hide the modal
}

