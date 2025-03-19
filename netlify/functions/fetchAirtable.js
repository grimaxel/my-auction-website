const fetch = require('node-fetch');

exports.handler = async function (event, context) {
  const apiKey = process.env.AIRTABLE_API_KEY; // Ensure this is set in Netlify
  const baseId = 'appmwUSpnRzUv06sj'; // Your Airtable Base ID
  
  // Fetch Table 1, Table 2, and Table 3
  const table1Url = `https://api.airtable.com/v0/${baseId}/Table%201?view=Grid%20view`;
  const table2Url = `https://api.airtable.com/v0/${baseId}/Table%202?view=Grid%20view`;
  const table3Url = `https://api.airtable.com/v0/${baseId}/Table%203?view=Grid%20view`;

  try {
    const [table1Response, table2Response, table3Response] = await Promise.all([
      fetch(table1Url, {
        headers: { Authorization: `Bearer ${apiKey}` },
      }),
      fetch(table2Url, {
        headers: { Authorization: `Bearer ${apiKey}` },
      }),
      fetch(table3Url, {
        headers: { Authorization: `Bearer ${apiKey}` },
      })
    ]);

    if (!table1Response.ok || !table2Response.ok || !table3Response.ok) {
      return {
        statusCode: 500,
        body: `Airtable API request failed.`,
      };
    }

    const table1Data = await table1Response.json();
    const table2Data = await table2Response.json();
    const table3Data = await table3Response.json();

    // Combine all tables into one response
    return {
      statusCode: 200,
      body: JSON.stringify({
        table1Records: table1Data.records,
        table2Records: table2Data.records,
        table3Records: table3Data.records, // Add Table 3
      }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: `Internal Server Error: ${error.message}`,
    };
  }
};
