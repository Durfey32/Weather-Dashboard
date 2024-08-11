import { Router } from 'express';
const router = Router();

import HistoryService from '../../service/historyService.js';
import WeatherService from '../../service/weatherService.js';

// TODO: POST Request with city name to retrieve weather data
router.post('/', async (req, res) => {
  // TODO: GET weather data from city name
  // TODO: save city to search history
  const { city } = req.body;
  const weather = await WeatherService.getWeatherForCity(city);
  await HistoryService.addCity(city);
  res.json(weather);
});

// TODO: GET search history
router.get('/history', async (_req, res) => {
  const history = await HistoryService.getCities();
  res.json(history);
});

// * BONUS TODO: DELETE city from search history
router.delete('/history/:id', async (req, res) => {
  const { id } = req.params;
  await HistoryService.removeCity(parseInt(id));
  res.status(204).send();
});

export default router;
