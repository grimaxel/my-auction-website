// Function to fetch data from Netlify Serverless Function
fetch('/.netlify/functions/fetchAirtable')
  .then(response => response.json())
  .then(data => {
    const gallery = document.getElementById('gallery');
    gallery.innerHTML = ''; // Clear existing content

    // Reverse the order of records from Table 1 to display the latest first
    const reversedRecords = data.table1.records.reverse();

    reversedRecords.forEach(record => {
      const post = record.fields;
      const imgElement = document.createElement('img');
      imgElement.src = post['first image'];  // Use the first image from Airtable
      imgElement.alt = post.caption || 'Auction item';  // Use the caption or fallback text
      imgElement.onclick = () => openModal(post, data.table2.records);  // Open modal when clicked

      gallery.appendChild(imgElement);  // Add the image to the gallery
    });
  })
  .catch(error => console.error('Error fetching data from Netlify function:', error));

// Function to open modal with post images, caption, asking price, and auction details from Table 2
function openModal(post, table2Records) {
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

  // Match the correct row in Table 2 based on the row number or other criteria
  const matchingRow = table2Records.find(row => row.fields['row number'] === post['row number']);

  if (matchingRow) {
    // Append asking price and auction details if available
    if (matchingRow.fields['auction price']) {
      captionText += `\n\nAsking Price: ${matchingRow.fields['auction price']}`;
    }
    if (matchingRow.fields['end date']) {
      captionText += `\n\nAuction Ends: ${matchingRow.fields['end date']}`;
    }
  }

  description.textContent = captionText;  // Add the caption, asking price, and auction details to the modal
  modal.style.display = 'block';  // Show the modal
}

// Function to close the modal
function closeModal() {
  document.getElementById('myModal').style.display = 'none';  // Hide the modal
}

}
