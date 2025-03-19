document.addEventListener("DOMContentLoaded", function () {
    // Fetch data from Airtable (Table 3)
    fetch('/.netlify/functions/fetchAirtable')
        .then(response => response.json())
        .then(data => {
            if (!data || !data.table3Records || data.table3Records.length === 0) {
                console.error("No data found in Airtable Table 3.");
                return;
            }

            // Extract all image URLs from all rows
            let imagesArray = [];
            data.table3Records.forEach(row => {
                if (row.fields.images) {
                    imagesArray.push(row.fields.images); // Push each image URL to the array
                }
            });

            console.log("Fetched images from Airtable:", imagesArray); // Debugging output

            if (imagesArray.length === 0) {
                console.error("No images found in Table 3.");
                return;
            }

            // Set main image (first image in the array)
            const mainImage = document.getElementById('mainImage');
            mainImage.src = imagesArray[0];
            mainImage.alt = "Product Image";

            // Populate thumbnails
            const thumbnailGallery = document.getElementById('thumbnailGallery');
            thumbnailGallery.innerHTML = ""; // Clear existing thumbnails

            imagesArray.forEach((imgUrl, index) => {
                const thumbnail = document.createElement('img');
                thumbnail.src = imgUrl;
                thumbnail.alt = "Thumbnail Image";
                thumbnail.dataset.index = index;
                thumbnail.onclick = function () {
                    mainImage.src = imgUrl;
                    mainImage.alt = "Product Image";
                };
                thumbnailGallery.appendChild(thumbnail);
            });
        })
        .catch(error => console.error("Error fetching data for mirg.html:", error));
});



