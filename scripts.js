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
    const countdownTimer = modal.querySelector('.countdown-timer');

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

        // Add caption, auction price, and link to the modal
        description.innerHTML = `<strong>Caption:</strong> ${post.caption || 'No caption available'}<br>
                                 <strong>Asking Price:</strong> ${post['auction price'] || 'Not available'}<br>
                                 <a href="${post['auction url']}" target="_blank">Link to the auction</a>`;

        // Extract the end date and log it
        const endDateStr = post['end date'];
        console.log("End Date String from Airtable:", endDateStr);

        if (endDateStr) {
            const endDate = new Date(endDateStr.replace("okt", "Oct")); // Replace month for compatibility
            console.log("Parsed End Date:", endDate);

            if (!isNaN(endDate)) {
                updateCountdown(endDate, countdownTimer);
            } else {
                console.error("Invalid Date Format. Cannot parse:", endDateStr);
                countdownTimer.innerHTML = "Invalid Date";
            }
        } else {
            countdownTimer.innerHTML = "No end date provided";
        }

        // Display the modal
        modal.style.display = 'block';
    }
}

// Countdown timer function
function updateCountdown(endDate, countdownTimer) {
    const interval = setInterval(() => {
        const now = new Date().getTime();
        const distance = endDate.getTime() - now;

        if (distance < 0) {
            clearInterval(interval);
            countdownTimer.innerHTML = "Expired";
            countdownTimer.style.width = '0%';  // Set bar width to 0 if expired
            return;
        }

        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));

        countdownTimer.innerHTML = `${hours} h ${minutes} min`;

        // Bar animation based on remaining time
        const totalDuration = 168 * 60 * 60 * 1000;  // 168 hours in milliseconds
        const percentRemaining = Math.max((distance / totalDuration) * 100, 0);
        countdownTimer.style.width = `${percentRemaining}%`;

        console.log("Remaining Time: ", hours, "hours", minutes, "minutes");
    }, 60000); // Update every minute
}
