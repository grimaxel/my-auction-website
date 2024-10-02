const fetch = require('node-fetch');

exports.handler = async function (event, context) {
  const apiKey = process.env.AIRTABLE_API_KEY;  // Ensure this is set in your Netlify environment variables
  const baseId = 'appmwUSpnRzUv06sj';  // Your Airtable Base ID
  const tableName1 = 'Table%201';  // Table 1 for the images and captions
  const tableName2 = 'Table%202';  // Table 2 for the asking price and end date
  const viewName = 'Grid view';  // The name of your Airtable view

  const url1 = `https://api.airtable.com/v0/${baseId}/${tableName1}?view=${encodeURIComponent(viewName)}`;
  const url2 = `https://api.airtable.com/v0/${baseId}/${tableName2}?view=${encodeURIComponent(viewName)}`;

  try {
    const [response1, response2] = await Promise.all([
      fetch(url1, { headers: { Authorization: `Bearer ${apiKey}` } }),
      fetch(url2, { headers: { Authorization: `Bearer ${apiKey}` } })
    ]);

    if (!response1.ok || !response2.ok) {
      return {
        statusCode: response1.status || response2.status,
        body: `Airtable API request failed: ${response1.statusText || response2.statusText}`,
      };
    }

    const data1 = await response1.json();
    const data2 = await response2.json();

    // Merging data from both tables based on auction URLs
    const mergedData = data1.records.map(record1 => {
      const record2 = data2.records.find(r => r.fields['auction url'] === record1.fields['auction url']);
      return { ...record1, priceData: record2 ? record2.fields : null };
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ records: mergedData }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: `Internal Server Error: ${error.message}`,
    };
  }
};
