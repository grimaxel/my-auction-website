// Function to fetch data from Netlify Serverless Function
fetch('/.netlify/functions/fetchAirtable')
  .then(response => response.json())
  .then(data => {
    const gallery = document.getElementById('gallery');
    gallery.innerHTML = ''; // Clear existing content

    // Check if the data for both tables exists and is an array
    if (!Array.isArray(data.table1Data.records) || !Array.isArray(data.table2Data.records)) {
      throw new Error('Invalid data format received');
    }

    // Reverse the order of records to display the latest first
    const reversedRecords = data.table1Data.records.reverse();
    const table2Records = data.table2Data.records.reverse();

    // Log fetched data
    console.log("Fetched data from Table 1:", reversedRecords);
    console.log("Table 2 Records:", table2Records);

    reversedRecords.forEach(record => {
      const post = record.fields;
      const imgElement = document.createElement('img');
      imgElement.src = post['first image'];  // Use the first image from Airtable
      imgElement.alt = post.caption || 'Auction item';  // Use the caption or fallback text
      imgElement.onclick = () => openModal(post, table2Records);  // Open modal when clicked

      gallery.appendChild(imgElement);  // Add the image to the gallery
    });
  })
  .catch(error => console.error('Error fetching data from Netlify function:', error));

// Function to open modal with post images, caption, and asking price
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

  // Log the post for debugging
  console.log("Opening Modal for Post:", post);

  // Search for matching row in Table 2 based on row number or other identifier
  const matchingAuctionData = table2Records.find(row => row.fields['row number'] === post['row number']);

  // Log the matching row for debugging
  console.log("Matching Row from Table 2:", matchingAuctionData);

  // Append auction price if available
  if (matchingAuctionData && matchingAuctionData.fields['auction price']) {
    captionText += `\n\nAsking Price: ${matchingAuctionData.fields['auction price']}`;
  }

  description.textContent = captionText;  // Add the caption and asking price to the modal
  modal.style.display = 'block';  // Show the modal
}

// Function to close the modal
function closeModal() {
  document.getElementById('myModal').style.display = 'none';  // Hide the modal
}
