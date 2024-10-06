const fetch = require('node-fetch');

exports.handler = async function (event, context) {
  const apiKey = process.env.AIRTABLE_API_KEY;
  const baseId = 'appmwUSpnRzUv06sj'; // Airtable Base ID
  const { rowId } = JSON.parse(event.body); // Get rowId from the request

  if (!rowId) {
    return {
      statusCode: 400,
      body: 'Missing row ID',
    };
  }

  // Fetch the record to get the current clickCount
  const url = `https://api.airtable.com/v0/${baseId}/Table%202/${rowId}`;
  const headers = {
    Authorization: `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
  };

  try {
    const recordResponse = await fetch(url, { headers });
    if (!recordResponse.ok) {
      return {
        statusCode: 500,
        body: 'Failed to fetch record',
      };
    }

    const record = await recordResponse.json();
    const currentClickCount = record.fields.clickCount || 0;

    // Update the click count
    const updateResponse = await fetch(url, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({
        fields: {
          clickCount: currentClickCount + 1,
        },
      }),
    });

    if (!updateResponse.ok) {
      return {
        statusCode: 500,
        body: 'Failed to update click count',
      };
    }

    return {
      statusCode: 200,
      body: 'Click count updated successfully',
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: `Internal Server Error: ${error.message}`,
    };
  }
};
