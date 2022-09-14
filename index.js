import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

// routes
import userRoutes from "./routes/user.js";
import exerciseRoutes from "./routes/exercise.js";
import workoutRoutes from "./routes/workouts.js";
import nutritionsRoutes from "./routes/nutritions.js";

dotenv.config();



import admin from "firebase-admin";
import serviceAccount from "./serviceKey.js";

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

export const adminFirestore = admin.firestore();


import { initializeApp } from "firebase/app";

import { getAuth } from "firebase/auth";

import { getFirestore } from "firebase/firestore";
import firebaseConfig from "./firebaseConfig.js"


const firebaseapp = initializeApp(firebaseConfig);

export const db = getFirestore(firebaseapp);
export const auth = getAuth(firebaseapp);

const app = express();

app.use(cookieParser());
app.use(
  cors({
    credentials: true,
    origin: ["http://localhost:4200"],
  })
);

app.use(express.json());

// app.use('/movies', movieRoutes);
app.use("/users", userRoutes);
app.use("/exercise-group", exerciseRoutes);
app.use("/workouts", workoutRoutes);
app.use("/nutritions", nutritionsRoutes);
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
