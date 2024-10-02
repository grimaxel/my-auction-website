// Function to fetch data from Netlify Serverless Function
fetch('/.netlify/functions/fetchAirtable')
  .then(response => response.json())
  .then(data => {
    const gallery = document.getElementById('gallery');
    gallery.innerHTML = ''; // Clear existing content

    // Reverse the order of records for both Table 1 and Table 2 to display the latest first
    const reversedTable1Records = data.records.reverse();
    const reversedTable2Records = data.table2Records.reverse(); // Reverse Table 2 as well

    // Log the fetched data for debugging
    console.log("Fetched data from Table 1:", reversedTable1Records);
    console.log("Fetched data from Table 2:", reversedTable2Records);

    // Loop over Table 1 to create the gallery images and modals
    reversedTable1Records.forEach(record => {
      const post = record.fields;
      const imgElement = document.createElement('img');
      imgElement.src = post['first image'];  // Use the first image from Airtable
      imgElement.alt = post.caption || 'Auction item';  // Use the caption or fallback text
      imgElement.onclick = () => openModal(post, reversedTable2Records);  // Pass both post and Table 2 data

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

  // Try to fetch matching row from reversed Table 2
  const matchingAuctionData = table2Records[0]; // The first row in reversed Table 2 will match the most recent

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
