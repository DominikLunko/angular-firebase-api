import express from 'express';

import { getNutritions, getCategories } from '../controllers/nutritions.js';

const router = express.Router();

router.post('/get-nutritions', getNutritions);
router.get('/categories', getCategories)

export default router;