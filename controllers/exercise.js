import { db } from "../index.js";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  startAfter,
  limit,
  startAt,
  orderBy,
  onSnapshot,
} from "firebase/firestore";

export const getExerciseGroup = async (req, res) => {
  let { bodyPart, lastItemId } = req.body;
  console.log(lastItemId)
  let exercises = [];
  let queryCount = 0;
  const countQuery = query(
    collection(db, "exercises"),
    where("bodyPart", "==", bodyPart),
    orderBy("id"))
  await getDocs(countQuery).then(querySnap => {
    queryCount = querySnap.docs.length 
  })
  let q = query(
    collection(db, "exercises"),
    where("bodyPart", "==", bodyPart),
    orderBy("id"),
    limit(1),
  );
  if (lastItemId) {
    q = query(q, startAfter(lastItemId))
  }
  /*  onSnapshot(q, (querySnapshot) => {
      querySnapshot.forEach((doc) => {
          console.log(JSON.stringify(doc.data())); 
      });
    }, (error) => {
      res.status(200).json({
        success: false,
        message: error.message
      })
    }); */
  await getDocs(q)
    .then((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        exercises.push(doc.data());
      });
      res.status(200).json({
        message: "Exercises fetch success",
        success: true,
        count: queryCount,
        exercisesList: exercises,
      });
    })
    .catch((error) => {
      console.log(error);
      res.status(200).json({
        message: error.message,
        success: false,
      });
    });
};
export const getAllBodyParts = async (req, res) => {
  let bodyParts = [];
  const q = query(collection(db, "bodyparts"));
  await getDocs(q)
    .then((querySnapshot) => {
      querySnapshot.docs.forEach((doc) => {
        doc.data().items.forEach((item) => {
          bodyParts.push(item);
        });
      });
      res.status(200).json({
        message: "Body parts fetched",
        success: true,
        bodyParts,
      });
    })
    .catch((error) => {
      console.log(error);
      res.status(500).json({
        message: "Something went wrong",
        success: false,
      });
    });
};
