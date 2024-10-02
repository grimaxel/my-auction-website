// Function to fetch data from Netlify Serverless Function
fetch('/.netlify/functions/fetchAirtable')
  .then(response => response.json())
  .then(data => {
    const gallery = document.getElementById('gallery');
    gallery.innerHTML = ''; // Clear existing content

    // Get Table 1 records and sort them by row number in ascending order
    const table1Records = data.table1Records.sort((a, b) => a.fields['row number'] - b.fields['row number']);
    
    // Log the fetched data for debugging
    console.log("Fetched data from Table 1:", table1Records);

    table1Records.forEach(record => {
      const post = record.fields;
      const imgElement = document.createElement('img');
      imgElement.src = post['first image'];  // Use the first image from Airtable
      imgElement.alt = 'Auction item';  // Use the caption or fallback text
      imgElement.onclick = () => openModal(post['row number']);  // Open modal when clicked

      gallery.appendChild(imgElement);  // Add the image to the gallery
    });

    // Store all table 2 records (auction info)
    window.table2Records = data.table2Records;  // Store globally for access in openModal

    // Log the Table 2 records for debugging
    console.log("Table 2 Records:", window.table2Records);
  })
  .catch(error => console.error('Error fetching data from Netlify function:', error));

// Function to open modal with post images, caption, and asking price
function openModal(rowNumber) {
  const modal = document.getElementById('myModal');
  const modalImages = modal.querySelector('.modal-images');
  const description = modal.querySelector('.description p');

  modalImages.innerHTML = '';  // Clear any previous images

  // Find the matching row from Table 2
  const matchingRecord = window.table2Records.find(row => row.fields['row number'] === rowNumber);

  // Log the matching row for debugging
  console.log("Opening Modal for row number:", rowNumber, "Matching Record:", matchingRecord);

  if (matchingRecord) {
    ['first image', 'second image', 'third image'].forEach(field => {
      if (matchingRecord.fields[field]) {
        const imgElement = document.createElement('img');
        imgElement.src = matchingRecord.fields[field];  // Add images from Airtable
        modalImages.appendChild(imgElement);
      }
    });

    // Display the caption
    let captionText = matchingRecord.fields.caption || 'No description available';

    // Append auction price if available
    if (matchingRecord.fields['auction price']) {
      captionText += `\n\nAsking Price: ${matchingRecord.fields['auction price']}`;
    }

    description.textContent = captionText;  // Add the caption and asking price to the modal
    modal.style.display = 'block';  // Show the modal
  } else {
    console.error('No matching record found in Table 2');
  }
}

// Function to close the modal
function closeModal() {
  document.getElementById('myModal').style.display = 'none';  // Hide the modal
}
