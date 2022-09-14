import { db } from "../index.js";
import {
  collection,
  query,
  getDocs,
  orderBy,
  startAt,
  endAt
} from "firebase/firestore";
export const getExercisesByName = async (req, res) => {
  const { exerciseName } = req.params;
  let exercises = [];
  
  let exercisesQuery = query(
    collection(db, "workouts"),
    orderBy("exerciseName"),
    startAt(exerciseName),
    endAt(exerciseName + "\uf8ff")
  );
  await getDocs(exercisesQuery).then((querySnap) => {
    querySnap.forEach(doc => {
        exercises.push(doc.data())
    })
    res.status(200).json({
        success: true,
        message: "Exercises fetch success",
        exercises: exercises
    })
  }).catch(error => {
    res.status(200).json({
        success: false,
        message: error.message
    })
  })
};
