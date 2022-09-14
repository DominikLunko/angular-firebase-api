import express from 'express';

import { signin, signout, signup, updateUser, saveAnalytics,
getUserAnalytics, addToFavourite, addToDailyCaloryIntake, saveWorkoutPlan, deleteWorkoutPlan } from '../controllers/user.js';

const router = express.Router();

router.post('/signin', signin);
router.post('/signup', signup);
router.get('/signout', signout);
router.put('/update-user', updateUser);
router.post('/save-user-analytics', saveAnalytics)
router.get('/get-user-analytics', getUserAnalytics)
router.patch('/:nutrientId/add-to-favourite', addToFavourite);
router.post('/daily-calory-intake', addToDailyCaloryIntake);
router.post('/save-workout-plan', saveWorkoutPlan)
router.delete('/delete-workout-plan/:workoutId', deleteWorkoutPlan)


export default router;