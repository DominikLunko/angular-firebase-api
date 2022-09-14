import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { auth } from "../index.js";

import { db } from "../index.js";
import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  addDoc,
  setDoc,
  updateDoc,
  doc,
  runTransaction,
} from "firebase/firestore";

/* export const signin = async (req, res) => {
  const { userId } = req.body;
  const userDocRef = doc(db, "users", `${userId}`);
  console.log(userDocRef.id);
  const userDocSnap = await getDoc(userDocRef);
  if (userDocSnap.exists()) {
    res.status(200).json({
      success: true,
      message: "Login success",
      user: userDocSnap.id, 
    })
  } else {
    console.log("Cannot get user!");
    return null;
  }
}; */

const getUser = async (userId) => {
  const userDocRef = doc(db, "users", `${userId}`);
  const userDocSnap = await getDoc(userDocRef);
  if (userDocSnap.exists()) {
    return userDocSnap.data();
  } else {
    console.log("Cannot get user!");
    return null;
  }
};
export const signin = async (req, res) => {
  const { email, password } = req.body;

  signInWithEmailAndPassword(auth, email, password)
    .then(async (result) => {
      const userDocRef = doc(db, "users", `${result.user.uid}`);
      const userDocSnap = await getDoc(userDocRef);
      if (userDocSnap.exists()) {
        res.status(200).json({
          success: true,
          message: "Login success",
          user: userDocSnap.data(),
        });
      } else {
        res.status(200).json({
          success: false,
          message: "Cannot get user!",
        });
      }
    })
    .catch((error) => {
      res.status(200).json({
        success: false,
        message: error.message,
      });
    });
};

export const signup = async (req, res) => {
  const { email, password, firstName, lastName } = req.body;
  createUserWithEmailAndPassword(auth, email, password)
    .then(async (result) => {
      let user = {
        _id: result.user.uid,
        name: firstName + " " + lastName,
        activity_level: null,
        age: null,
        email: email,
        gender: null,
        height: null,
        weight: null,
      };
      await setDoc(doc(db, "users", result.user.uid), {
        ...user,
      })
        .then(async () => {
          await setDoc(doc(db, "user_analytics", result.user.uid), {
            userId: result.user.uid,
            bmi: null,
            bmr: null,
            createdAt: new Date(),
            daily_calory_intake: [],
            favourite_nutrients: [],
            health: null,
            healthy_bmi_range: null,
            weight_goals: null,
            workout_plans: [],
          }).then(() => {
            res.status(200).json({
              success: true,
              message: "Success",
              user: user,
            });
          });
        })
        .catch((error) => {
          res.status(200).json({
            success: false,
            message: error.message,
          });
        });
    })
    .catch((error) => {
      res.status(200).json({
        success: false,
        message: error.message,
      });
    });
};

export const signout = async (req, res) => {
  signOut(auth)
    .then((result) => {
      res.status(200).json({
        success: true,
        message: "Logout success!",
        result: result,
      });
    })
    .catch((error) => {
      res.status(200).json({
        success: false,
        message: error.message,
      });
    });
};

// USER PERSONAL DATA CONTROLLERS

export const updateUser = async (req, res) => {
  const user = req.body;
  let currentUserId = auth.currentUser.uid;

  const userRef = doc(db, "users", `${currentUserId}`);

  await updateDoc(userRef, {
    age: user.age,
    weight: user.weight,
    height: user.height,
    gender: user.gender,
    activity_level: user.activity_level,
  })
    .then(() => {
      res.status(200).json({
        success: true,
        message: "User updated successfully",
      });
    })
    .catch((error) => {
      res.status(200).json({
        success: false,
        message: error.message,
      });
    });
};

export const getUserAnalytics = async (req, res) => {
  let currentUserId = auth.currentUser.uid;
  let nutrientDocs = [];
  const userAnalyticsDocRef = doc(db, "user_analytics", `${currentUserId}`);
  await getDoc(userAnalyticsDocRef)
    .then(async (userAnalyticsSnap) => {
      if (userAnalyticsSnap.exists()) {
        nutrientDocs = await Promise.all(
          userAnalyticsSnap.data().favourite_nutrients.map((nutrientId) =>
            getDoc(doc(db, "nutrients", `${nutrientId}`)).then(
              (nutrientDoc) => {
                return nutrientDoc.data();
              }
            )
          )
        );
      }
      res.status(200).json({
        success: true,
        message: "User analytics fetch successfully",
        analytics: userAnalyticsSnap.data(),
        nutrients: nutrientDocs,
      });
    })
    .catch((error) => {
      res.status(200).json({
        success: false,
        message: error.message,
      });
    });
};

export const saveAnalytics = async (req, res) => {
  let user_analytics = req.body;
  user_analytics.createdAt = new Date().toISOString();
  let currentUserId = auth.currentUser.uid;

  const userAnalyticsRef = doc(db, "user_analytics", `${currentUserId}`);

  await updateDoc(userAnalyticsRef, {
    ...user_analytics,
  })
    .then(() => {
      res.status(200).json({
        success: true,
        message: "User analytics updated successfully",
      });
    })
    .catch((error) => {
      res.status(200).json({
        success: false,
        message: error.message,
      });
    });
};
export const addToFavourite = async (req, res) => {
  const currentUserId = auth.currentUser.uid;
  const { nutrientId } = req.params;
  try {
    const userAnalyticsRef = doc(db, "user_analytics", `${currentUserId}`);
    await runTransaction(db, async (transaction) => {
      const userAnalyticsDoc = await transaction.get(userAnalyticsRef);
      if (!userAnalyticsDoc.exists()) {
        throw "Document does not exist!";
      }
      let newFavouriteNutritions = userAnalyticsDoc.data().favourite_nutrients;
      const index = newFavouriteNutritions.indexOf(nutrientId);

      if (index == -1) {
        newFavouriteNutritions.push(nutrientId);
      } else {
        newFavouriteNutritions = newFavouriteNutritions.filter(
          (id) => id != nutrientId
        );
      }
      transaction.update(userAnalyticsRef, {
        favourite_nutrients: newFavouriteNutritions,
      });
    });
    res.status(200).json({
      success: true,
      message: "Favourite nutritions updated",
    });
  } catch (error) {
    res.status(200).json({
      success: false,
      message: error.message,
    });
  }
};

export const addToDailyCaloryIntake = async (req, res) => {
  const currentUserId = auth.currentUser.uid;
  const { calories, todayDate, _id } = req.body;
  console.log(calories, todayDate);
  // const checkTodayDate = new Date().toISOString().split("T")[0];
  try {
    const userAnalyticsRef = doc(db, "user_analytics", `${currentUserId}`);
    await runTransaction(db, async (transaction) => {
      const userAnalyticsDoc = await transaction.get(userAnalyticsRef);
      if (!userAnalyticsDoc.exists()) {
        throw "Document does not exist!";
      }
      let dailyIntakeArray = userAnalyticsDoc.data().daily_calory_intake;

      let todayDailyCalories = dailyIntakeArray.find(
        (item) => item.date == todayDate.split("T")[0]
      );
      if (todayDailyCalories) {
        todayDailyCalories.calories = todayDailyCalories.calories + calories;
      } else {
        dailyIntakeArray.push({
          _id: _id,
          date: todayDate.split("T")[0],
          calories: calories,
        });
      }
      transaction.update(userAnalyticsRef, {
        daily_calory_intake: dailyIntakeArray,
      });
    });
    res.status(200).json({
      success: true,
      message: "Daily calorie intake updated",
    });
  } catch (error) {
    res.status(200).json({
      success: false,
      message: error.message,
    });
  }
};

export const saveWorkoutPlan = async (req, res) => {
  const currentUserId = auth.currentUser.uid;
  const { workout } = req.body;
  try {
    const userAnalyticsRef = doc(db, "user_analytics", `${currentUserId}`);
    await runTransaction(db, async (transaction) => {
      const userAnalyticsDoc = await transaction.get(userAnalyticsRef);
      if (!userAnalyticsDoc.exists()) {
        throw "Document does not exist!";
      }
      let workoutPlans = userAnalyticsDoc.data().workout_plans;

      const index = workoutPlans.findIndex((item) => item._id == workout._id);
      if (index == -1) {
        workoutPlans.push(workout);
      } else {
        workoutPlans[index] = JSON.parse(JSON.stringify(workout));
      }
      transaction.update(userAnalyticsRef, {
        workout_plans: workoutPlans,
      });
    });
    res.status(200).json({
      success: true,
      message: "Workout plan saved successfully",
    });
  } catch (error) {
    res.status(200).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteWorkoutPlan = async (req, res) => {
  const currentUserId = auth.currentUser.uid;
  const { workoutId } = req.params;
  try {
    const userAnalyticsRef = doc(db, "user_analytics", `${currentUserId}`);
    await runTransaction(db, async (transaction) => {
      const userAnalyticsDoc = await transaction.get(userAnalyticsRef);
      if (!userAnalyticsDoc.exists()) {
        throw "Document does not exist!";
      }
      let workoutPlans = userAnalyticsDoc
        .data()
        .workout_plans.filter((item) => item._id != workoutId);

      transaction.update(userAnalyticsRef, {
        workout_plans: workoutPlans,
      });
    });
    res.status(200).json({
      success: true,
      message: "Workout plan deleted successfully",
    });
  } catch (error) {
    res.status(200).json({
      success: false,
      message: error.message,
    });
  }
};
