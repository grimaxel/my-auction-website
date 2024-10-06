const fetch = require('node-fetch');

exports.handler = async function (event, context) {
  const apiKey = process.env.AIRTABLE_API_KEY; // Ensure this is set in your Netlify environment variables
  const baseId = 'appmwUSpnRzUv06sj'; // Your Airtable Base ID
  const { rowId } = JSON.parse(event.body); // Get rowId from the request

  if (!rowId) {
    console.log('No row ID provided');
    return {
      statusCode: 400,
      body: 'Missing row ID',
    };
  }

  const url = `https://api.airtable.com/v0/${baseId}/Table%202/${rowId}`;
  const headers = {
    Authorization: `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
  };

  try {
    console.log(`Fetching record with rowId: ${rowId}`);
    const recordResponse = await fetch(url, { headers });

    if (!recordResponse.ok) {
      console.error(`Failed to fetch record: ${recordResponse.statusText}`);
      return {
        statusCode: 500,
        body: 'Failed to fetch record',
      };
    }

    const record = await recordResponse.json();
    const currentClickCount = record.fields.clickCount || 0;

    console.log(`Current click count: ${currentClickCount}`);

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
      console.error(`Failed to update click count: ${updateResponse.statusText}`);
      return {
        statusCode: 500,
        body: 'Failed to update click count',
      };
    }

    console.log('Click count successfully updated');
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Click count updated successfully' }),
    };
  } catch (error) {
    console.error(`Internal Server Error: ${error.message}`);
    return {
      statusCode: 500,
      body: `Internal Server Error: ${error.message}`,
    };
  }
};

