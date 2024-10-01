const apiKey = process.env.AIRTABLE_API_KEY;  // Replace with your Airtable Personal Access Token
const baseId = 'appmwUSpnRzUv06sj';  // Your Airtable Base ID
const tableName = 'Table%201';  // Replace with your Table Name (URL-encoded)

fetch(`https://api.airtable.com/v0/${baseId}/${tableName}`, {
  headers: {
    Authorization: `Bearer ${apiKey}`
  }
})
  .then(response => response.json())
  .then(data => {
    data.records.forEach(record => {
      const post = record.fields;
      console.log('First Image:', post['first image']);
      console.log('Second Image:', post['second image']);
      console.log('Third Image:', post['third image']);
      console.log('Caption:', post.caption);
      
      // Here, you can dynamically create HTML elements to display the post data on your website
    });
  })
  .catch(error => console.error('Error fetching data:', error));
