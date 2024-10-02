const fetch = require('node-fetch');

exports.handler = async function (event, context) {
  const apiKey = process.env.AIRTABLE_API_KEY;
  const baseId = 'appmwUSpnRzUv06sj';
  const table1Name = 'Table%201';  // Your first table name
  const table2Name = 'Table%202';  // Your second table name

  const table1Url = `https://api.airtable.com/v0/${baseId}/${table1Name}`;
  const table2Url = `https://api.airtable.com/v0/${baseId}/${table2Name}`;

  try {
    // Fetch both tables
    const [table1Response, table2Response] = await Promise.all([
      fetch(table1Url, { headers: { Authorization: `Bearer ${apiKey}` } }),
      fetch(table2Url, { headers: { Authorization: `Bearer ${apiKey}` } }),
    ]);

    // Check for errors in both requests
    if (!table1Response.ok || !table2Response.ok) {
      return {
        statusCode: 500,
        body: 'Failed to fetch data from Airtable',
      };
    }

    const table1Data = await table1Response.json();
    const table2Data = await table2Response.json();

    return {
      statusCode: 200,
      body: JSON.stringify({
        table1Data,
        table2Data,
      }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: `Error fetching data: ${error.message}`,
    };
  }
};
