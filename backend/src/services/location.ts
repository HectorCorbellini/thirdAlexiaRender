import axios from 'axios';
import { logger } from '../utils/logger';

interface LocationResult {
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  type: string;
}

export class LocationService {
  private provider: string;

  constructor() {
    this.provider = process.env.MAP_PROVIDER || 'nominatim';
  }

  async searchPlaces(query: string, location?: { latitude: number; longitude: number }): Promise<LocationResult[]> {
    try {
      if (this.provider === 'google' && process.env.GOOGLE_PLACES_API_KEY) {
        return await this.searchWithGoogle(query, location);
      } else {
        return await this.searchWithNominatim(query, location);
      }
    } catch (error) {
      logger.error('Error searching places:', error);
      return [];
    }
  }

  private async searchWithNominatim(query: string, location?: { latitude: number; longitude: number }): Promise<LocationResult[]> {
    try {
      let url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5`;
      
      if (location) {
        url += `&lat=${location.latitude}&lon=${location.longitude}`;
      }

      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'ALEXIA-WhatsApp-Assistant/1.0'
        }
      });

      return response.data.map((item: any) => ({
        name: item.display_name.split(',')[0],
        address: item.display_name,
        latitude: parseFloat(item.lat),
        longitude: parseFloat(item.lon),
        type: item.type || 'place'
      }));
    } catch (error) {
      logger.error('Error with Nominatim search:', error);
      return [];
    }
  }

  private async searchWithGoogle(query: string, location?: { latitude: number; longitude: number }): Promise<LocationResult[]> {
    try {
      let url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&key=${process.env.GOOGLE_PLACES_API_KEY}`;
      
      if (location) {
        url += `&location=${location.latitude},${location.longitude}&radius=5000`;
      }

      const response = await axios.get(url);

      if (response.data.status !== 'OK') {
        logger.warn('Google Places API error:', response.data.status);
        return [];
      }

      return response.data.results.slice(0, 5).map((item: any) => ({
        name: item.name,
        address: item.formatted_address,
        latitude: item.geometry.location.lat,
        longitude: item.geometry.location.lng,
        type: item.types[0] || 'place'
      }));
    } catch (error) {
      logger.error('Error with Google Places search:', error);
      return [];
    }
  }

  async reverseGeocode(latitude: number, longitude: number): Promise<string> {
    try {
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
        {
          headers: {
            'User-Agent': 'ALEXIA-WhatsApp-Assistant/1.0'
          }
        }
      );

      return response.data.display_name || `${latitude}, ${longitude}`;
    } catch (error) {
      logger.error('Error with reverse geocoding:', error);
      return `${latitude}, ${longitude}`;
    }
  }
}