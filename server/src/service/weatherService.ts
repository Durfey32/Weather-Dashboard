import dotenv from 'dotenv';
import { Response } from 'express';
import fetch from 'node-fetch';
dotenv.config();


// Define an interface for the Weather API response
interface WeatherApiResponse {
  current: {
    temp: number;
    humidity: number;
    wind_speed: number;
    weather: {
      icon: string;
      description: string;
    }[];
  };
  daily: {
    dt: number;
    temp: {
      day: number;
    };
    wind_speed: number;
    humidity: number;
    weather: {
      icon: string;
      description: string;
    }[];
  }[];
}

// TODO: Define an interface for the Coordinates object
interface Coordinates {
  lat: number;
  lon: number;
}

interface Location {
  coord: {
    lat: number;
    lon: number;
  };
  city: string;
}

// TODO: Define a class for the Weather object
class Weather {
  city: string;
  temperature: number;
  humidity: number;
  windSpeed: number;
  weatherIcon: string;
  weatherDescription: string;

  constructor(
    city: string,
    temperature: number,
    humidity: number,
    windSpeed: number,
    weatherIcon: string,
    weatherDescription: string
  ) {
    this.city = city;
    this.temperature = temperature;
    this.humidity = humidity;
    this.windSpeed = windSpeed;
    this.weatherIcon = weatherIcon;
    this.weatherDescription = weatherDescription;
  }
}
// TODO: Complete the WeatherService class
class WeatherService {
  baseURL: string;
  apiKey: string;
  // TODO: Define the baseURL, API key, and city name properties
  constructor() {
    this.baseURL = 'https://api.openweathermap.org/data/2.5/';
    this.apiKey = process.env.WEATHER_API_KEY ?? '38662cb52989288bb7671256cb34a9bb';
    console.log('API Key:', this.apiKey);
  }

  // TODO: Create fetchLocationData method
  async fetchLocationData(city: string): Promise<Location> {
    const response = await fetch(this.buildGeocodeQuery(city));
    if (!response.ok) {
      throw new Error(`Failed to fetch location data: ${response.statusText}`);
    }
    const data = await response.json() as Location;
    console.log('Fetching location data for city:', city);
    return data;
    
  }

  // TODO: Create destructureLocationData method
  private destructureLocationData(locationData: any): Coordinates {
    if (!locationData.coord) {
      throw new Error('Invalid location data received from API');
    }
    const { coord: { lat, lon } } = locationData;
    return { lat, lon };
  }

  // TODO: Create buildGeocodeQuery method
  private buildGeocodeQuery(city: string): string {
    const queryURL = `${this.baseURL}weather?q=${encodeURIComponent(city)}&appid=${this.apiKey}&units=metric`;
    console.log('Geocode Query URL:', queryURL);
    return queryURL;
  }


  // TODO: Create buildWeatherQuery method
  private buildWeatherQuery(coordinates: Coordinates): string {
    return `${this.baseURL}onecall?lat=${coordinates.lat}&lon=${coordinates.lon}&appid=${this.apiKey}&units=metric`;
  }

  // TODO: Create fetchAndDestructureLocationData method
  private async fetchAndDestructureLocationData(city: string): Promise<Coordinates> {
    const locationData = await this.fetchLocationData(city);
    return this.destructureLocationData(locationData);
  }

  // TODO: Create fetchWeatherData method
  private async fetchWeatherData(coordinates: Coordinates): Promise<WeatherApiResponse> {
    const response = await fetch(this.buildWeatherQuery(coordinates));
    if (!response.ok) {
      throw new Error(`Failed to fetch weather data: ${response.statusText}`);
    }
    return response.json() as Promise<WeatherApiResponse>;
  }
  // TODO: Build parseCurrentWeather method
  private parseCurrentWeather(response: any): Weather {
    const { name, main, weather, wind } = response;
    return new Weather(
      name,
      main.temp,
      main.humidity,
      wind.speed,
      weather[0].icon,
      weather[0].description
    );
  }

  // TODO: Complete buildForecastArray method
  private buildForecastArray(weatherData: any[]): any[] {
    return weatherData.map((day: any) => ({
      date: new Date(day.dt * 1000).toLocaleDateString(),
      temp: day.temp.day,
      windSpeed: day.wind_speed,
      humidity: day.humidity,
      weatherIcon: day.weather[0].icon,
      weatherDescription: day.weather[0].description,
    }));
  }

  // TODO: Complete getWeatherForCity method
  async getWeatherForCity(city: string, res: Response): Promise<void> {
    try {
      const coordinates = await this.fetchAndDestructureLocationData(city);
      const weatherData = await this.fetchWeatherData(coordinates);
      const currentWeather = this.parseCurrentWeather(weatherData);
      const forecast = this.buildForecastArray(weatherData.daily);
  
      res.status(200).json({ currentWeather, forecast });
    } catch (error) {
      const errorMessage = (error as Error).message;
      console.error('Error getting weather data:', errorMessage);
  
      if (errorMessage.includes('Unauthorized')) {
        res.status(401).json({ error: 'Invalid API key or Unauthorized request' });
      } else {
        res.status(500).json({ error: 'An unknown error occurred' });
      }
    }
  }
}

export default new WeatherService();
