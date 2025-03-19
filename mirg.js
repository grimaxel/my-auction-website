document.addEventListener("DOMContentLoaded", function () {
    // Fetch data from Airtable (Table 3)
    fetch('/.netlify/functions/fetchAirtable')
        .then(response => response.json())
        .then(data => {
            if (!data || !data.table3Records || data.table3Records.length === 0) {
                console.error("No data found in Airtable Table 3.");
                return;
            }

            const row = data.table3Records[0]; // We still pick the first row (only for description)
            const fields = row.fields;

            // Set description text
            document.getElementById('description').textContent = fields.description || "No description available.";

            // Fetch images from the column "images"
            let imagesArray = fields.images; // Ensure we fetch all images from the column

            if (Array.isArray(imagesArray)) {
                imagesArray = imagesArray.map(img => (typeof img === "object" ? img.url : img)); // Get proper URLs
            } else {
                imagesArray = [];
            }

            console.log("Fetched images from Airtable:", imagesArray); // Debugging output

            // Update the main image if images exist
            const mainImage = document.getElementById('mainImage');
            if (imagesArray.length > 0) {
                mainImage.src = imagesArray[0]; // Default to first image
                mainImage.alt = "Product Image";
            } else {
                console.error("No images found in Table 3.");
                mainImage.src = ""; // Clear image if none found
            }

            // Populate the thumbnail gallery
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

    // Handle signup form submission
    document.getElementById("signup-form").addEventListener("submit", function (event) {
        event.preventDefault(); // Prevent page reload

        const emailInput = document.getElementById("email");
        const email = emailInput.value.trim();

        if (email) {
            fetch("/.netlify/functions/storeEmailTable3", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email }),
            })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        alert("Successfully signed up!");
                        emailInput.value = ""; // Clear input field
                    } else {
                        alert("Error signing up. Please try again.");
                    }
                })
                .catch(error => {
                    console.error("Error submitting email:", error);
                    alert("Error signing up. Please try again.");
                });
        } else {
            alert("Please enter a valid email.");
        }
    });
});
