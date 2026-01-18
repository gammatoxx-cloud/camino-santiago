/**
 * Geocoding service using Mapbox Geocoding API
 * Converts addresses to latitude/longitude coordinates
 */

export interface GeocodeResult {
  latitude: number;
  longitude: number;
  formattedAddress: string;
  error?: string;
}

const MAPBOX_API_KEY = import.meta.env.VITE_MAPBOX_API_KEY;
const MAPBOX_GEOCODING_URL = 'https://api.mapbox.com/geocoding/v5/mapbox.places';

/**
 * Geocode an address string to coordinates
 * @param address - The address string to geocode
 * @returns Promise with latitude, longitude, and formatted address
 */
export async function geocodeAddress(address: string): Promise<GeocodeResult> {
  if (!MAPBOX_API_KEY) {
    throw new Error('Mapbox API key is not configured. Please add VITE_MAPBOX_API_KEY to your .env file.');
  }

  if (!address || address.trim().length === 0) {
    throw new Error('Address cannot be empty');
  }

  try {
    // URL encode the address
    const encodedAddress = encodeURIComponent(address.trim());
    const url = `${MAPBOX_GEOCODING_URL}/${encodedAddress}.json?access_token=${MAPBOX_API_KEY}&limit=1`;

    const response = await fetch(url);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `Geocoding failed with status ${response.status}`
      );
    }

    const data = await response.json();

    if (!data.features || data.features.length === 0) {
      return {
        latitude: 0,
        longitude: 0,
        formattedAddress: address,
        error: 'No se encontraron resultados para esta dirección',
      };
    }

    const feature = data.features[0];
    const [longitude, latitude] = feature.center;
    const formattedAddress = feature.place_name || address;

    return {
      latitude,
      longitude,
      formattedAddress,
    };
  } catch (error: any) {
    console.error('Geocoding error:', error);
    return {
      latitude: 0,
      longitude: 0,
      formattedAddress: address,
      error: error.message || 'No se pudo geocodificar la dirección. Por favor verifica tu conexión e intenta de nuevo.',
    };
  }
}

/**
 * Reverse geocode coordinates to an address
 * @param latitude - Latitude coordinate
 * @param longitude - Longitude coordinate
 * @returns Promise with formatted address
 */
export async function reverseGeocode(
  latitude: number,
  longitude: number
): Promise<{ address: string; error?: string }> {
  if (!MAPBOX_API_KEY) {
    throw new Error('Mapbox API key is not configured');
  }

  try {
    const url = `${MAPBOX_GEOCODING_URL}/${longitude},${latitude}.json?access_token=${MAPBOX_API_KEY}&limit=1`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Reverse geocoding failed with status ${response.status}`);
    }

    const data = await response.json();

    if (!data.features || data.features.length === 0) {
      return {
        address: '',
        error: 'No address found for these coordinates',
      };
    }

    const feature = data.features[0];
    return {
      address: feature.place_name || '',
    };
  } catch (error: any) {
    console.error('Reverse geocoding error:', error);
    return {
      address: '',
      error: error.message || 'Failed to reverse geocode coordinates',
    };
  }
}

