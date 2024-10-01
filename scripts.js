const apiKey = `${process.env.AIRTABLE_API_KEY}`;  // Netlify will inject this at build time
const baseId = 'appmwUSpnRzUv06sj';  // Your Airtable Base ID
const tableName = 'Table%201';  // Your Table Name (URL-encoded if necessary)

// Function to fetch data from Airtable and dynamically populate the gallery
fetch(`https://api.airtable.com/v0/${baseId}/${tableName}`, {
  headers: {
    Authorization: `Bearer ${apiKey}`
  }
})
  .then(response => response.json())
  .then(data => {
    const gallery = document.getElementById('gallery');
    gallery.innerHTML = ''; // Clear existing content
    data.records.forEach(record => {
      const post = record.fields;
      const imgElement = document.createElement('img');
      imgElement.src = post['first image']; // Use the first image from Airtable
      imgElement.alt = post.caption || 'Auction item';  // Use the caption or fallback text
      imgElement.onclick = () => openModal(post);  // Open modal when clicked

      gallery.appendChild(imgElement);  // Add the image to the gallery
    });
  })
  .catch(error => console.error('Error fetching data:', error));

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

function closeModal() {
  document.getElementById('myModal').style.display = 'none';  // Hide the modal
}
