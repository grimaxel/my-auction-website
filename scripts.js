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

// Function to calculate time left based on auction end date
function calculateTimeLeft(endDateString) {
  // Convert endDateString to a format JS can understand (e.g. "3 okt 2024 15:49" to ISO)
  const months = {
    'jan': '01', 'feb': '02', 'mar': '03', 'apr': '04',
    'maj': '05', 'jun': '06', 'jul': '07', 'aug': '08',
    'sep': '09', 'okt': '10', 'nov': '11', 'dec': '12'
  };

  const parts = endDateString.toLowerCase().split(' ');
  const day = parts[0];
  const month = months[parts[1]];
  const year = parts[2];
  const time = parts[3];

  // Create ISO date string: YYYY-MM-DDTHH:MM:SS
  const isoString = `${year}-${month}-${day}T${time}:00`;

  // Parse the end date
  const endDate = new Date(isoString);

  // Get current time
  const now = new Date();

  // Calculate the difference in time
  const diff = endDate - now;

  if (diff <= 0) {
    return "00 h 00 min"; // Auction has ended
  }

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  return `${hours} h ${minutes} min`;
}

// Function to open modal with post images, caption, and auction details from Table 2
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

    // Calculate the time left for the countdown
    const timeLeft = calculateTimeLeft(post['end date']);

    // Add caption, auction price, end date, and auction URL link to the modal
    description.innerHTML = `<strong>Caption:</strong> ${post.caption || 'No caption available'}<br>
                             <strong>Asking Price:</strong> ${post['auction price'] || 'Not available'}<br>
                             <div class="countdown-timer">${timeLeft}</div><br>
                             <a href="${post['auction url']}" target="_blank">Link to the auction</a>`;

    // Display the modal
    modal.style.display = 'block';
  }
}

// Function to close the modal
function closeModal() {
  document.getElementById('myModal').style.display = 'none';  // Hide the modal
}
