import dotenv from 'dotenv';
// import { response } from 'express';
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


// TODO: Define a class for the Weather object
class Weather {
  cityName: string;
  temperature: number;
  humidity: number;
  windSpeed: number;
  weatherIcon: string;
  weatherDescription: string;

  constructor(
    cityName: string,
    temperature: number,
    humidity: number,
    windSpeed: number,
    weatherIcon: string,
    weatherDescription: string
  ) {
    this.cityName = cityName;
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
  
  constructor() {
    this.baseURL = 'https://api.openweathermap.org/data/2.5/';
    this.apiKey = process.env.WEATHER_API_KEY ?? '';
  }
  // TODO: Define the baseURL, API key, and city name properties

  // TODO: Create fetchLocationData method
  private async fetchLocationData(query: string) {
    const url = this.buildGeocodeQuery(query);
    const response = await fetch(url);
    return response.json();
  }

  // TODO: Create destructureLocationData method
  private destructureLocationData(locationData: any): Coordinates {
    const { coord: { lat, lon } } = locationData;
    return { lat, lon };
  }

  // TODO: Create buildGeocodeQuery method
  private buildGeocodeQuery(city: string): string {
    return `${this.baseURL}weather?q=${city}&appid=${this.apiKey}&units=metric`;
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
    return response.json() as Promise<WeatherApiResponse>;
  }

  // TODO: Build parseCurrentWeather method
  private parseCurrentWeather(response: any): Weather {
    const {name, main, weather, wind} = response;
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
  async getWeatherForCity(city: string) {
    const coordinates = await this.fetchAndDestructureLocationData(city);
    const weatherData = await this.fetchWeatherData(coordinates);
    const currentWeather = this.parseCurrentWeather(weatherData);
    const forecast = this.buildForecastArray(weatherData.daily);
    return { currentWeather, forecast };
  }
}


export default new WeatherService();
