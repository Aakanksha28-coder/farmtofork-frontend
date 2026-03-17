import { API_BASE_URL as BASE_URL } from '../config/api';
import { handleResponse, getAuthHeader } from '../utils/apiHelper';
const API_URL = `${BASE_URL}/market`;

export const listPrices = async (category) => {
  const params = new URLSearchParams();
  if (category) params.set('category', category);
  const response = await fetch(`${API_URL}/prices?${params.toString()}`);
  return handleResponse(response);
};

export const getLatestPrice = async (product) => {
  const params = new URLSearchParams({ product });
  const response = await fetch(`${API_URL}/latest?${params.toString()}`);
  return handleResponse(response);
};

export const uploadPrice = async ({ productName, category, unit = 'kg', price, source }) => {
  const response = await fetch(`${API_URL}/prices`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    body: JSON.stringify({ productName, category, unit, price, source })
  });
  return handleResponse(response);
};

export const getIndianPrices = async ({ commodity, state, market, limit } = {}) => {
  const params = new URLSearchParams();
  if (commodity) params.set('commodity', commodity);
  if (state) params.set('state', state);
  if (market) params.set('market', market);
  if (limit) params.set('limit', String(limit));
  const response = await fetch(`${API_URL}/india/prices?${params.toString()}`);
  return handleResponse(response);
};

// Validate market price — calls backend which proxies data.gov.in Agmarknet (avoids CORS)
export const getMarketPriceForValidation = async (productName, state) => {
  // Title-case to match Agmarknet format: "tomato" → "Tomato"
  const commodity = productName.trim().charAt(0).toUpperCase() + productName.trim().slice(1).toLowerCase();

  const params = new URLSearchParams({ commodity, limit: '10' });
  if (state && state.trim()) params.set('state', state.trim());

  const response = await fetch(`${API_URL}/india/prices?${params.toString()}`);
  if (!response.ok) throw new Error('No market price found for this product');

  const records = await response.json();
  const valid = Array.isArray(records) ? records.filter(r => r && r.price && !isNaN(Number(r.price))) : [];

  if (valid.length === 0) throw new Error('No market price found for this product');

  // Average the prices (already converted to Rs./kg by backend)
  const avgPrice = valid.reduce((sum, r) => sum + Number(r.price), 0) / valid.length;

  return {
    price: avgPrice,
    unit: 'kg',
    source: 'agmarknet',
    productName: valid[0].productName || commodity,
    state: valid[0].state || state || '',
    market: valid[0].market || '',
    recordedAt: valid[0].recordedAt || new Date().toISOString()
  };
};
