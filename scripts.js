// Function to fetch data from Netlify Serverless Function
fetch('/.netlify/functions/fetchAirtable')
  .then(response => response.json())
  .then(data => {
    const gallery = document.getElementById('gallery');
    gallery.innerHTML = ''; // Clear existing content

    // Reverse the order of records to display the latest first
    const reversedRecords = data.records.reverse();

    // Log the fetched data for debugging
    console.log("Fetched data from Table 1:", reversedRecords);

    reversedRecords.forEach(record => {
      const post = record.fields;
      const imgElement = document.createElement('img');
      imgElement.src = post['first image'];  // Use the first image from Airtable
      imgElement.alt = post.caption || 'Auction item';  // Use the caption or fallback text
      imgElement.onclick = () => openModal(post);  // Open modal when clicked

      gallery.appendChild(imgElement);  // Add the image to the gallery
    });

    // Store all table 2 records (auction info)
    const table2Records = data.table2Records; // Replace with how your Table 2 data is structured
    
    // Log the Table 2 records for debugging
    console.log("Table 2 Records:", table2Records);
    
    window.table2Records = table2Records;  // Store globally for access in openModal
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

  // Search for matching row in Table 2 based on row number or other identifier
  const matchingAuctionData = window.table2Records.find(row => row.fields['row number'] === post['row number']);

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
