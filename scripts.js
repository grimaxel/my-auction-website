// Function to fetch data from Netlify Serverless Function
fetch('/.netlify/functions/fetchAirtable')
  .then(response => response.json())
  .then(data => {
    const gallery = document.getElementById('gallery');
    gallery.innerHTML = ''; // Clear existing content

    // Reverse the order of records to display the latest first
    const reversedRecords = data.records.reverse();

    reversedRecords.forEach(record => {
      const post = record.fields;
      const imgElement = document.createElement('img');
      imgElement.src = post['first image'];  // Use the first image from Airtable
      imgElement.alt = post.caption || 'Auction item';  // Use the caption or fallback text
      imgElement.onclick = () => openModal(post);  // Open modal when clicked

      gallery.appendChild(imgElement);  // Add the image to the gallery
    });
  })
  .catch(error => console.error('Error fetching data from Netlify function:', error));

// Function to open modal with post images and caption
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

  description.textContent = post.caption || 'No description available';  // Add the caption
  modal.style.display = 'block';  // Show the modal
}

// Function to close the modal
function closeModal() {
  document.getElementById('myModal').style.display = 'none';  // Hide the modal
}
