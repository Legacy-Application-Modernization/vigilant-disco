import { Router } from 'express';
import { Request, Response } from 'express';

const router = Router();

router.post('/create', (req: Request, res: Response) => {
  res.json({ message: 'Create migration endpoint - To be implemented' });
});

router.get('/:id', (req: Request, res: Response) => {
  res.json({ message: 'Get migration endpoint - To be implemented' });
});

router.get('/', (req: Request, res: Response) => {
  res.json({ message: 'List migrations endpoint - To be implemented' });
});

export default router;