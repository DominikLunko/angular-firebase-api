import express from 'express';

import auth from '../middleware/auth.js'
import { getExerciseGroup, getAllBodyParts } from '../controllers/exercise.js';

const router = express.Router();

router.get('/allBodyParts', getAllBodyParts);
router.post('/exercise-list', getExerciseGroup);

export default router;