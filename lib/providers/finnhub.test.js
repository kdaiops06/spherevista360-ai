const finnhub = require('./finnhub');

(async () => {
  console.log('Testing Finnhub Provider...');

  // Test WebSocket connection
  console.log('Connecting to Finnhub WebSocket...');
  finnhub.connect();
  finnhub.subscribe('AAPL');

  // Test REST API for realtime quote
  console.log('Fetching realtime quote for AAPL...');
  try {
    const quote = await finnhub.getRealtimeQuote('AAPL');
    console.log('Realtime Quote:', quote);
  } catch (error) {
    console.error('Error fetching realtime quote:', error);
  }

  // Test REST API for company profile
  console.log('Fetching company profile for AAPL...');
  try {
    const profile = await finnhub.getCompanyProfile('AAPL');
    console.log('Company Profile:', profile);
  } catch (error) {
    console.error('Error fetching company profile:', error);
  }
})();