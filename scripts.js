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

// Helper function to parse the end date from text format
function parseEndDate(textDate) {
  // Convert your text date, e.g., '3 okt 2024 15:49' to a valid date format
  const months = {
    'jan': '01', 'feb': '02', 'mar': '03', 'apr': '04', 'maj': '05', 
    'jun': '06', 'jul': '07', 'aug': '08', 'sep': '09', 'okt': '10',
    'nov': '11', 'dec': '12'
  };

  // Split text by space: e.g., ['3', 'okt', '2024', '15:49']
  let [day, month, year, time] = textDate.split(' ');
  
  // Map month name to number
  month = months[month.toLowerCase()];

  // Return a parsed date string: "YYYY-MM-DDTHH:MM:SS"
  return `${year}-${month}-${day}T${time}:00Z`;
}

// Function to open modal with post images, caption, auction details, and countdown timer
function openModal(rowNumber, table2Records) {
  const modal = document.getElementById('myModal');
  const modalImages = modal.querySelector('.modal-images');
  const description = modal.querySelector('.description p');
  const countdownElement = document.createElement('div');
  countdownElement.classList.add('countdown-timer');
  
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

    // Add caption, auction price, and link to auction
    description.innerHTML = `<strong>Caption:</strong> ${post.caption || 'No caption available'}<br>
                             <strong>Asking Price:</strong> ${post['auction price'] || 'Not available'}<br>
                             <a href="${post['auction url']}" target="_blank">Link to the auction</a>`;

    // Countdown Timer Logic
    const endDateText = post['end date'];  // Fetch the textual end date from Airtable
    const formattedEndDate = parseEndDate(endDateText);  // Parse it into a valid date format
    
    const endDate = new Date(formattedEndDate);
    const countdownInterval = setInterval(() => {
      const now = new Date();
      const timeDiff = endDate - now;

      // Calculate time left in hours and minutes
      const hours = Math.floor(timeDiff / (1000 * 60 * 60));
      const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));

      if (timeDiff <= 0) {
        clearInterval(countdownInterval);
        countdownElement.innerHTML = "Auction Ended";
      } else {
        countdownElement.innerHTML = `${hours} h ${minutes} min`;
      }

      // Update the bar width
      const maxHours = 168;  // Max full bar width for 7 days (168 hours)
      const percentage = Math.max(0, Math.min((hours / maxHours) * 100, 100));
      countdownElement.style.background = `linear-gradient(to right, #ccc ${percentage}%, transparent ${percentage}%)`;

    }, 60000);  // Update every minute

    // Append countdown timer to the description
    description.appendChild(countdownElement);

    // Display the modal
    modal.style.display = 'block';
  }
}

// Function to close the modal
function closeModal() {
  document.getElementById('myModal').style.display = 'none';  // Hide the modal
}
