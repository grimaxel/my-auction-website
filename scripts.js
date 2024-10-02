// Function to fetch data from Netlify Serverless Function
fetch('/.netlify/functions/fetchAirtable')
  .then(response => response.json())
  .then(data => {
    const gallery = document.getElementById('gallery');
    gallery.innerHTML = ''; // Clear existing content

    // Sort the records by 'row number' in descending order (highest number first)
    const sortedRecords = data.records.sort((a, b) => b.fields['row number'] - a.fields['row number']);

    // Log the sorted data for debugging
    console.log("Sorted data from Table 1:", sortedRecords);

    sortedRecords.forEach(record => {
      const post = record.fields;
      const imgElement = document.createElement('img');
      imgElement.src = post['first image'];  // Use the first image from Airtable
      imgElement.alt = post.caption || 'Auction item';  // Use the caption or fallback text
      imgElement.onclick = () => openModal(post);  // Open modal when clicked

      gallery.appendChild(imgElement);  // Add the image to the gallery
    });
  })
  .catch(error => console.error('Error fetching data from Netlify function:', error));

// Function to open modal with post images, caption, and asking price
function openModal(post) {
  const modal = document.getElementById('myModal');
  const modalImages = modal.querySelector('.modal-images');
  const description = modal.querySelector('.description p');

  modalImages.innerHTML = '';  // Clear any previous images
  ['first image', 'second image', 'third image'].forEach(field => {
    if (post[field]) {
      const imgElement = document.createElement('img');
      imgElement.src = post[field];  // Add images from Airtable
      modalImages.appendChild(imgElement);
    }
  });

  // Display the caption
  let captionText = post.caption || 'No description available';

  // Log the post for debugging
  console.log("Opening Modal for Post:", post);

  // Fetch specific row from Table 2 based on the row number
  const rowNumber = post['row number'];

  // Now call a function or fetch Table 2 data dynamically based on rowNumber
  fetchSpecificDataFromTable2(rowNumber)
    .then(table2Data => {
      // Append auction price and other details if available
      if (table2Data && table2Data.fields['auction price']) {
        captionText += `\n\nAsking Price: ${table2Data.fields['auction price']}`;
      }

      // Display caption and additional data in the modal
      description.textContent = captionText;
      modal.style.display = 'block';  // Show the modal
    });
}

// Function to close the modal
function closeModal() {
  document.getElementById('myModal').style.display = 'none';  // Hide the modal
}

// Example function for fetching data from Table 2 using row number
function fetchSpecificDataFromTable2(rowNumber) {
  return fetch('/.netlify/functions/fetchSpecificAirtable?rowNumber=' + rowNumber)
    .then(response => response.json())
    .then(data => {
      // Return the specific record matching the row number
      return data.records.find(record => record.fields['row number'] === rowNumber);
    })
    .catch(error => console.error('Error fetching specific data from Table 2:', error));
}

