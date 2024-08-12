import { Router } from 'express';
const router = Router();

import HistoryService from '../../service/historyService.js';
import WeatherService from '../../service/weatherService.js';

// TODO: POST Request with city name to retrieve weather data 
// TODO: GET weather data from city name // TODO: save city to search history
router.post('/', async (req, res) => {
  const { city } = req.body;
  if (!city) {
    return res.status(400).json({ error: 'City name is required' });
  }
  try {
    const weather = await WeatherService.getWeatherForCity(city, res);
    await HistoryService.addCity(city);
    return res.json(weather);
  } catch (error) {
    // Handle any errors
    return res.status(500).json({ error: 'An unknown error occurred' });
  }
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
