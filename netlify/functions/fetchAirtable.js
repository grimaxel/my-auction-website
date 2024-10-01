const fetch = require('node-fetch');

exports.handler = async function () {
  const apiKey = process.env.AIRTABLE_API_KEY;
  const baseId = 'appmwUSpnRzUv06sj';  // Your Airtable Base ID
  const tableName = 'Table%201';  // Your Table Name

  const response = await fetch(`https://api.airtable.com/v0/${baseId}/${tableName}`, {
    headers: {
      Authorization: `Bearer ${apiKey}`
    }
  });

  const data = await response.json();

  return {
    statusCode: 200,
    body: JSON.stringify(data)
  };
};
