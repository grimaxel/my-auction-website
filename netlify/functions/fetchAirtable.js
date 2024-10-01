const fetch = require('node-fetch');

exports.handler = async function (event, context) {
  const apiKey = process.env.AIRTABLE_API_KEY;  // Ensure this is set in your Netlify environment variables
  const baseId = 'appmwUSpnRzUv06sj';  // Your Airtable Base ID
  const tableName = 'Table%201';  // Your Table Name (URL encoded)
  const viewName = 'Grid view';  // The name of your Airtable view

  const url = `https://api.airtable.com/v0/${baseId}/${tableName}?view=${encodeURIComponent(viewName)}`;

  try {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    if (!response.ok) {
      return {
        statusCode: response.status,
        body: `Airtable API request failed: ${response.statusText}`,
      };
    }

    const data = await response.json();

    return {
      statusCode: 200,
      body: JSON.stringify(data),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: `Internal Server Error: ${error.message}`,
    };
  }
};
