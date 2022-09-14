import express from 'express';


import { getExercisesByName } from '../controllers/workouts.js';

const router = express.Router();


router.get('/get-workouts-by-name/:exerciseName', getExercisesByName);
export default router;
