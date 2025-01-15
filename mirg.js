// Fetch data for the specific row (row 11) from Airtable
fetch('/.netlify/functions/fetchAirtable')
    .then(response => response.json())
    .then(data => {
        const table2Records = data.table2Records;

        // Fetch data for row 11
        const row = table2Records.find(record => record.fields['row number'] === 11);
        if (row) {
            const fields = row.fields;

            // Set main image
            const mainImage = document.getElementById('mainImage');
            mainImage.src = fields['first image'];
            mainImage.alt = fields.caption || "Product Image";

            // Set thumbnail gallery
            const thumbnailGallery = document.getElementById('thumbnailGallery');
            ['first image', 'second image', 'third image'].forEach(field => {
                if (fields[field]) {
                    const thumbnail = document.createElement('img');
                    thumbnail.src = fields[field];
                    thumbnail.alt = "Thumbnail Image";
                    thumbnail.onclick = () => {
                        mainImage.src = fields[field];
                        mainImage.alt = "Product Image";
                    };
                    thumbnailGallery.appendChild(thumbnail);
                }
            });

            // Set description
            const description = document.getElementById('description');
            description.textContent = fields.caption || "No description available.";
        } else {
            console.error("Row not found.");
        }
    })
    .catch(error => console.error('Error fetching data for mirg.html:', error));
