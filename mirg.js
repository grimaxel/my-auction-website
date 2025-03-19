document.addEventListener("DOMContentLoaded", function () {
    // Fetch data from Airtable (Table 3)
    fetch('/.netlify/functions/fetchTable3')
        .then(response => response.json())
        .then(data => {
            if (!data || !data.records || data.records.length === 0) {
                console.error("No data found in Airtable Table 3.");
                return;
            }

            const row = data.records[0]; // Fetch the first row from Table 3
            const fields = row.fields;

            // Set description
            document.getElementById('description').textContent = fields.Description || "No description available.";

            // Set main image
            const mainImage = document.getElementById('mainImage');
            mainImage.src = fields["Image 1"] || "";
            mainImage.alt = "Product Image";

            // Populate thumbnails
            const thumbnailScroll = document.getElementById('thumbnailScroll');
            thumbnailScroll.innerHTML = ""; // Clear existing thumbnails

            let imageKeys = Object.keys(fields).filter(key => key.startsWith("Image"));

            imageKeys.forEach((key, index) => {
                if (fields[key]) {
                    const thumbnail = document.createElement('img');
                    thumbnail.src = fields[key];
                    thumbnail.alt = "Thumbnail Image";
                    thumbnail.dataset.index = index;
                    thumbnail.onclick = function () {
                        mainImage.src = fields[key];
                        mainImage.alt = "Product Image";
                    };
                    thumbnailScroll.appendChild(thumbnail);
                }
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
