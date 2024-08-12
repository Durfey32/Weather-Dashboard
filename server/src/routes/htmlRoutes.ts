import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Router } from 'express';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const router = Router();

// Serve index.html
router.get('/', (_req, res) => {
  const indexPath = path.resolve(__dirname, '../../client/dist/index.html');
  res.sendFile(indexPath);  
});

export default router;