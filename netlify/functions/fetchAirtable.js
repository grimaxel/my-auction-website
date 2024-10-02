
Thank you for the clarification. You're absolutely correct, and I see that we still need to retrieve data from Table 1 for your primary content. But for the auction price and end date stored in Table 2, we’ll need to fetch those values separately. Here’s the revised approach:

Step 1: Update fetchairtable.js to Retrieve Data from Both Tables
We will modify the function to retrieve data from Table 1 for the primary content and Table 2 for auction-related data like the price and end date.

Here's how we can modify the function to fetch from both tables and then merge the data as needed:

Updated fetchairtable.js to fetch from both tables:
js
Kopiera kod
const fetch = require('node-fetch');

exports.handler = async function (event, context) {
  const apiKey = process.env.AIRTABLE_API_KEY;  // Ensure this is set in your Netlify environment variables
  const baseId = 'appmwUSpnRzUv06sj';  // Your Airtable Base ID

  // URLs for both tables
  const table1Url = `https://api.airtable.com/v0/${baseId}/Table%201?view=Grid%20view`;
  const table2Url = `https://api.airtable.com/v0/${baseId}/Table%202?view=Grid%20view`;

  try {
    // Fetch data from Table 1
    const [table1Response, table2Response] = await Promise.all([
      fetch(table1Url, { headers: { Authorization: `Bearer ${apiKey}` } }),
      fetch(table2Url, { headers: { Authorization: `Bearer ${apiKey}` } }),
    ]);

    if (!table1Response.ok || !table2Response.ok) {
      return {
        statusCode: Math.min(table1Response.status, table2Response.status),
        body: `Airtable API request failed: ${table1Response.statusText || table2Response.statusText}`,
      };
    }

    const table1Data = await table1Response.json();
    const table2Data = await table2Response.json();

    // Map and combine records from both tables as needed
    const combinedData = table1Data.records.map(record => {
      // Find matching auction data in Table 2 based on some key (like auction URL)
      const auctionData = table2Data.records.find(item => item.fields['auction url'] === record.fields['auction url']);
      
      return {
        ...record.fields, // Table 1 fields
        auctionPrice: auctionData?.fields['auction price'] || 'No price available',
        endDate: auctionData?.fields['end date'] || 'No end date available',
      };
    });

    return {
      statusCode: 200,
      body: JSON.stringify(combinedData),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: `Internal Server Error: ${error.message}`,
    };
  }
};
