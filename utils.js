const baseHeaders = {
  isBase64Encoded: false
  // 'access-control-allow-origin': '*',
  // 'connection': 'close',
};
const makeXmlResponse = (status, message) => {
  return {
    statusCode: status || 200,
    headers: Object.assign(baseHeaders, {
      'Content-Type': 'text/xml'
    }),
    body: message
  };
};

module.exports = {
  makeXmlResponse
};
