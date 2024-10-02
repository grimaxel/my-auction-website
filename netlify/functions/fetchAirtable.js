
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
