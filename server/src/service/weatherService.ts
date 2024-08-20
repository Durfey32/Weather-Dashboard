import dotenv from 'dotenv';
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
  list: {
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
  cityName: string;
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
  // TODO: Define the baseURL, API key, and city name properties
  constructor() {
    this.baseURL = process.env.BASE_URL ?? 'https://api.openweathermap.org/';
    this.apiKey = process.env.WEATHER_API_KEY ?? '38662cb52989288bb7671256cb34a9bb';
    console.log('API Key:', this.apiKey);
    console.log('Loaded API Key:', process.env.WEATHER_API_KEY);
  }

  // TODO: Create fetchLocationData method
  async fetchLocationData(cityName: string): Promise<Location> {
    const response = await fetch(this.buildGeocodeQuery(cityName));
    if (!response.ok) {
      throw new Error(`Failed to fetch location data: ${response.statusText}`);
    }
    const data = await response.json() as Location;
    console.log('Fetching location data for city:', cityName);
    // console.log('Data: ', data);
    return data;
    
  }

  // TODO: Create destructureLocationData method
  private destructureLocationData(locationData: any): Coordinates {
    // console.log('Lat:', locationData.Data[0].lat);
    // console.log('Locationdata', locationData[0].lat);
    if (!locationData [0].lat) {
      throw new Error('Invalid location data received from API');
    }
    const { lat, lon } = locationData [0];
    return { lat, lon };
  }

  // TODO: Create buildGeocodeQuery method
  private buildGeocodeQuery(cityName: string): string {
    const queryURL = `${this.baseURL}geo/1.0/direct?q=${encodeURIComponent(cityName)}&appid=${this.apiKey}&units=metric`;
    console.log('Geocode Query URL:', queryURL);
    return queryURL;
  }


  // TODO: Create buildWeatherQuery method
  private buildWeatherQuery(coordinates: Coordinates): string {
    return `${this.baseURL}data/2.5/forecast?lat=${coordinates.lat}&lon=${coordinates.lon}&appid=${this.apiKey}&units=metric`;
  }

  // TODO: Create fetchAndDestructureLocationData method
  private async fetchAndDestructureLocationData(cityName: string): Promise<Coordinates> {
    const locationData = await this.fetchLocationData(cityName);
    return this.destructureLocationData(locationData);
  }

  // TODO: Create fetchWeatherData method
  private async fetchWeatherData(coordinates: Coordinates): Promise<WeatherApiResponse> {
    console.log(this.buildWeatherQuery(coordinates));
    const response = await fetch(this.buildWeatherQuery(coordinates));
    const responseBody = await response.text();
  
    try {
      return JSON.parse(responseBody) as WeatherApiResponse;
    } catch (error) {
      throw new Error(`Failed to parse weather data: ${error}`);
    }
  }
  // TODO: Build parseCurrentWeather method
  private parseCurrentWeather(response: any): Weather {
    const cityName = response.city?.name;
    if (!cityName) {
      throw new Error("City name is undefined in the weather API response");
    }
    const { main, weather, wind } = response.list[0];
    return new Weather(
      cityName,                
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
      temp: day.main.temp,
      windSpeed: day.wind.speed,
      humidity: day.main.humidity,
      weatherIcon: day.weather[0].icon,
      weatherDescription: day.weather[0].description,
    }));
  }

  // TODO: Complete getWeatherForCity method
  async getWeatherForCity(cityName: string): Promise<{ current: Weather; forecast: any[]; }> {
    try {
      const coordinates = await this.fetchAndDestructureLocationData(cityName);
      const weatherData = await this.fetchWeatherData(coordinates);
      const currentWeather = this.parseCurrentWeather(weatherData);
      console.log('Current Weather:', currentWeather);
      const forecast = this.buildForecastArray(weatherData.list);
      
      return { current: currentWeather, forecast };
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  }
}

export default new WeatherService();
