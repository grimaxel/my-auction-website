const fetch = require('node-fetch');

exports.handler = async function (event, context) {
  const apiKey = process.env.AIRTABLE_API_KEY;
  const baseId = 'your_airtable_base_id';
  const table1Name = 'Table 1';
  const table2Name = 'Table 2';

  const urlTable1 = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(table1Name)}?view=Grid%20view`;
  const urlTable2 = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(table2Name)}?view=Grid%20view`;

  try {
    // Fetch Table 1 data
    const responseTable1 = await fetch(urlTable1, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    // Fetch Table 2 data
    const responseTable2 = await fetch(urlTable2, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    if (!responseTable1.ok || !responseTable2.ok) {
      return {
        statusCode: 500,
        body: `Airtable API request failed: ${responseTable1.statusText} ${responseTable2.statusText}`,
      };
    }

    const dataTable1 = await responseTable1.json();
    const dataTable2 = await responseTable2.json();

    return {
      statusCode: 200,
      body: JSON.stringify({
        table1Records: dataTable1.records,
        table2Records: dataTable2.records,
      }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: `Internal Server Error: ${error.message}`,
    };
  }
};

