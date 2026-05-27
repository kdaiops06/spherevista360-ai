// Finnhub Provider Implementation

const WebSocket = require('ws');
const axios = require('axios');

const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY;
const FINNHUB_WS_URL = 'wss://ws.finnhub.io?token=' + FINNHUB_API_KEY;
const FINNHUB_REST_URL = 'https://finnhub.io/api/v1';

class FinnhubProvider {
  constructor() {
    this.ws = null;
    this.subscribedSymbols = new Set();
  }

  connect() {
    if (this.ws) {
      this.ws.close();
    }

    this.ws = new WebSocket(FINNHUB_WS_URL);

    this.ws.on('open', () => {
      console.log('Finnhub WebSocket connected');
      this.subscribedSymbols.forEach((symbol) => this.subscribe(symbol));
    });

    this.ws.on('message', (data) => {
      const message = JSON.parse(data);
      console.log('Received data:', message);
    });

    this.ws.on('close', () => {
      console.log('Finnhub WebSocket disconnected. Reconnecting...');
      setTimeout(() => this.connect(), 5000);
    });

    this.ws.on('error', (error) => {
      console.error('Finnhub WebSocket error:', error);
    });
  }

  subscribe(symbol) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: 'subscribe', symbol }));
      this.subscribedSymbols.add(symbol);
    }
  }

  unsubscribe(symbol) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: 'unsubscribe', symbol }));
      this.subscribedSymbols.delete(symbol);
    }
  }

  async getCompanyProfile(symbol) {
    const url = `${FINNHUB_REST_URL}/stock/profile2?symbol=${symbol}`;
    const response = await axios.get(url, {
      headers: { 'X-Finnhub-Token': FINNHUB_API_KEY },
    });
    return response.data;
  }

  async getRealtimeQuote(symbol) {
    const url = `${FINNHUB_REST_URL}/quote?symbol=${symbol}`;
    const response = await axios.get(url, {
      headers: { 'X-Finnhub-Token': FINNHUB_API_KEY },
    });
    return response.data;
  }
}

module.exports = new FinnhubProvider();