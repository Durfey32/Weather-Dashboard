import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

// TODO: Define a City class with name and id properties
class City {
  constructor(public name: string, public id: number) {}
}

// TODO: Complete the HistoryService class
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class HistoryService {
   filepath: string;

  constructor() {
    this.filepath = path.join(__dirname, '../../data/searchHistory.json');
  }
  // TODO: Define a read method that reads from the searchHistory.json file
  // private async read() {}
  private async read(): Promise<City[]> {
    try {
      const cities = await fs.readFile(this.filepath, 'utf-8');
      return JSON.parse(cities);
    } catch (error) {
      console.error('Error reading search history file:', error);
      return [];
    }
  }
  // TODO: Define a write method that writes the updated cities array to the searchHistory.json file
  // private async write(cities: City[]) {}
  private async write(cities: City[]): Promise<void> {
    try {
      await fs.writeFile(this.filepath, JSON.stringify(cities, null, 2));
    } catch (error) {
      console.error('Error writing search history file:', error);
    }
  }
  // TODO: Define a getCities method that reads the cities from the searchHistory.json file and returns them as an array of City objects
  // async getCities() {}
  async getCities(): Promise<City[]> {
    return await this.read();
  }
  // TODO Define an addCity method that adds a city to the searchHistory.json file
  // async addCity(city: string) {}
  async addCity(cityName: string): Promise<void> {
    const cities = await this.read();
    const newCity = new City(cityName, cities.length + 1);
    cities.push(newCity);
    await this.write(cities);
  }
  // * BONUS TODO: Define a removeCity method that removes a city from the searchHistory.json file
  // async removeCity(id: string) {}
  async removeCity(id: number): Promise<void> {
    const cities = await this.read();
    const updatedCities = cities.filter(city => city.id !== id);
    await this.write(updatedCities);
  }
}

export default new HistoryService();
