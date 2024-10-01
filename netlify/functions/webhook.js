exports.handler = async (event, context) => {
  // Parse the incoming JSON data from the webhook
  const data = JSON.parse(event.body);

  // Log the received data for debugging (optional)
  console.log(data);

  // Here you can do things like save the data to a file or update your site's content
  // For now, we'll just return a success message
  return {
    statusCode: 200,
    body: JSON.stringify({ message: "Webhook received successfully", data }),
  };
};
