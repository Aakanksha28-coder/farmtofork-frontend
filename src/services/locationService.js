// Location service: geolocation, reverse geocoding, and hierarchical location data

const NOMINATIM_REVERSE_URL = 'https://nominatim.openstreetmap.org/reverse';
const REST_COUNTRIES_URL = 'https://restcountries.com/v3.1/all';
const COUNTRIES_NOW_STATES_URL = 'https://countriesnow.space/api/v0.1/countries/states';
const COUNTRIES_NOW_CITIES_URL = 'https://countriesnow.space/api/v0.1/countries/state/cities';
const INDIA_STATE_DISTRICT_URL = 'https://raw.githubusercontent.com/bhanuc/indian-list/master/state_district.json';

export const getCurrentPosition = (options = { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }) =>
  new Promise((resolve, reject) => {
    if (!navigator.geolocation) return reject(new Error('Geolocation not supported'));
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => reject(err),
      options
    );
  });

export const reverseGeocode = async ({ lat, lng }) => {
  const params = new URLSearchParams({ format: 'jsonv2', lat: String(lat), lon: String(lng), addressdetails: '1' });
  const res = await fetch(`${NOMINATIM_REVERSE_URL}?${params.toString()}`, {
    headers: {
      'Accept': 'application/json',
    },
  });
  if (!res.ok) throw new Error('Reverse geocoding failed');
  const data = await res.json();
  const a = data.address || {};
  // Map Nominatim fields to our schema
  return {
    country: a.country || '',
    state: a.state || a.region || a.state_district || '',
    district: a.county || a.state_district || a.suburb || '',
    city: a.city || a.town || a.village || a.hamlet || a.suburb || '',
    postcode: a.postcode || '',
    displayAddress: data.display_name || '',
  };
};

export const fetchCountries = async () => {
  const res = await fetch(REST_COUNTRIES_URL);
  if (!res.ok) throw new Error('Failed to load countries');
  const data = await res.json();
  // Map to {name, code}
  return data
    .map((c) => ({ name: c.name?.common || c.name, code: c.cca2 || c.cca3 || '' }))
    .sort((a, b) => a.name.localeCompare(b.name));
};

export const fetchStates = async (countryName) => {
  if (!countryName) return [];
  // CountriesNow API expects exact country name
  const res = await fetch(COUNTRIES_NOW_STATES_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ country: countryName })
  });
  if (!res.ok) return [];
  const data = await res.json();
  if (data.error || !data.data) return [];
  return (data.data.states || []).map(s => s.name);
};

export const fetchCities = async (countryName, stateName) => {
  if (!countryName || !stateName) return [];
  const res = await fetch(COUNTRIES_NOW_CITIES_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ country: countryName, state: stateName })
  });
  if (!res.ok) return [];
  const data = await res.json();
  if (data.error || !data.data) return [];
  return data.data;
};

let indiaStateDistrictCache = null;
export const fetchIndiaDistricts = async (stateName) => {
  if (!stateName) return [];
  if (!indiaStateDistrictCache) {
    const res = await fetch(INDIA_STATE_DISTRICT_URL);
    if (!res.ok) return [];
    indiaStateDistrictCache = await res.json();
  }
  const districts = indiaStateDistrictCache[stateName];
  return Array.isArray(districts) ? districts : [];
};

export const matchClosest = (value, options) => {
  if (!value || !options?.length) return '';
  const v = value.toLowerCase();
  // exact match first
  const exact = options.find(o => (o.name || o).toLowerCase() === v);
  if (exact) return exact.name || exact;
  // startsWith
  const starts = options.find(o => (o.name || o).toLowerCase().startsWith(v));
  if (starts) return starts.name || starts;
  // includes
  const incl = options.find(o => (o.name || o).toLowerCase().includes(v));
  return incl ? (incl.name || incl) : '';
};
