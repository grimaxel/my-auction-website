document.addEventListener("DOMContentLoaded", function () {
    // Fetch data from Airtable (Table 3)
    fetch('/.netlify/functions/fetchAirtable')
        .then(response => response.json())
        .then(data => {
            if (!data || !data.table3Records || data.table3Records.length === 0) {
                console.error("No data found in Airtable Table 3.");
                return;
            }

            const row = data.table3Records[0]; // Fetch the first row from Table 3
            const fields = row.fields;

            // Set description
            document.getElementById('description').textContent = fields.description || "No description available.";

            // Set main image
            const mainImage = document.getElementById('mainImage');
            const imagesArray = fields.images || []; // Ensure images exist

            if (imagesArray.length > 0) {
                mainImage.src = imagesArray[0]; // Use first image as main
                mainImage.alt = "Product Image";
            } else {
                console.error("No images found in Table 3.");
            }

            // Populate thumbnails
            const thumbnailScroll = document.getElementById('thumbnailGallery');
            thumbnailScroll.innerHTML = ""; // Clear existing thumbnails

            imagesArray.forEach((imgUrl, index) => {
                const thumbnail = document.createElement('img');
                thumbnail.src = imgUrl;
                thumbnail.alt = "Thumbnail Image";
                thumbnail.dataset.index = index;
                thumbnail.onclick = function () {
                    mainImage.src = imgUrl;
                    mainImage.alt = "Product Image";
                };
                thumbnailScroll.appendChild(thumbnail);
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
