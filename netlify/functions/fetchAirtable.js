const fetch = require('node-fetch');

exports.handler = async function (event, context) {
  const apiKey = process.env.AIRTABLE_API_KEY;  // Ensure this is set in your Netlify environment variables
  const baseId = 'appmwUSpnRzUv06sj';  // Your Airtable Base ID
  const table1Name = 'Table%201';  // Table 1
  const table2Name = 'Table%202';  // Table 2
  const viewName = 'Grid view';  // The name of your Airtable view

  const urlTable1 = `https://api.airtable.com/v0/${baseId}/${table1Name}?view=${encodeURIComponent(viewName)}`;
  const urlTable2 = `https://api.airtable.com/v0/${baseId}/${table2Name}?view=${encodeURIComponent(viewName)}`;

  try {
    const responseTable1 = await fetch(urlTable1, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    const responseTable2 = await fetch(urlTable2, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    if (!responseTable1.ok || !responseTable2.ok) {
      return {
        statusCode: responseTable1.status,
        body: `Airtable API request failed: ${responseTable1.statusText}, ${responseTable2.statusText}`,
      };
    }

    const dataTable1 = await responseTable1.json();
    const dataTable2 = await responseTable2.json();

    // Return combined data from both tables
    return {
      statusCode: 200,
      body: JSON.stringify({
        table1: dataTable1,
        table2: dataTable2,
      }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: `Internal Server Error: ${error.message}`,
    };
  }
};

