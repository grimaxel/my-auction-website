const fetch = require('node-fetch');

exports.handler = async function (event, context) {
  const apiKey = process.env.AIRTABLE_API_KEY;
  const baseId = 'appmwUSpnRzUv06sj';
  
  const table1Url = `https://api.airtable.com/v0/${baseId}/Table%201?view=Grid%20view`;
  const table2Url = `https://api.airtable.com/v0/${baseId}/Table%202?view=Grid%20view`;

  try {
    const [table1Response, table2Response] = await Promise.all([
      fetch(table1Url, {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      }),
      fetch(table2Url, {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      })
    ]);

    if (!table1Response.ok || !table2Response.ok) {
      return {
        statusCode: 500,
        body: `Airtable API request failed for one of the tables: ${table1Response.statusText} or ${table2Response.statusText}`,
      };
    }

    const table1Data = await table1Response.json();
    const table2Data = await table2Response.json();

    return {
      statusCode: 200,
      body: JSON.stringify({
        table1Records: table1Data.records,
        table2Records: table2Data.records,
      }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: `Internal Server Error: ${error.message}`,
    };
  }
};
