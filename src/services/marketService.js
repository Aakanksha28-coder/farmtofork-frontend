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

// Validate market price — calls data.gov.in Agmarknet directly (no backend needed)
export const getMarketPriceForValidation = async (productName, state) => {
  const DATA_GOV_API_KEY = '579b464db66ec23bdd00000134def222aee64b8c4c651e16b6397a35';
  const govBaseUrl = 'https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070';

  // Title-case to match Agmarknet format: "tomato" → "Tomato"
  const commodity = productName.trim().charAt(0).toUpperCase() + productName.trim().slice(1).toLowerCase();

  const govParams = new URLSearchParams({
    'api-key': DATA_GOV_API_KEY,
    format: 'json',
    limit: '10'
  });
  govParams.set('filters[commodity]', commodity);
  if (state && state.trim()) govParams.set('filters[state]', state.trim());

  const govRes = await fetch(`${govBaseUrl}?${govParams.toString()}`);
  if (!govRes.ok) throw new Error('No market price found for this product');

  const json = await govRes.json();
  const records = Array.isArray(json.records) ? json.records : [];
  const valid = records.filter(r => r && r.modal_price && !isNaN(Number(r.modal_price)));

  if (valid.length === 0) throw new Error('No market price found for this product');

  // Average modal prices — Agmarknet is Rs./Quintal, convert to Rs./kg
  const avgModal = valid.reduce((sum, r) => sum + Number(r.modal_price), 0) / valid.length;
  const pricePerKg = avgModal / 100;

  return {
    price: pricePerKg,
    unit: 'kg',
    source: 'agmarknet',
    productName: valid[0].commodity,
    state: valid[0].state || state || '',
    market: valid[0].market || '',
    recordedAt: valid[0].arrival_date || new Date().toISOString()
  };
};
