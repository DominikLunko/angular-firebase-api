import { db, adminFirestore } from "../index.js";

import {
  collection,
  query,
  startAt,
  endAt,
  where,
  getDocs,
  getDoc,
  orderBy,
  limit,
  startAfter,
} from "firebase/firestore";

export const getCategories = async (req, res) => {
  let categories = [];
  // firebase admin omogućuje odabir željenih polja dokumenta uz pomoću metode "select()",
  //  koja kao rezultat vraća JSON objekte sa navedenim poljima, kao na primjer:
  // { category: 'Dairy products' }, { category: 'Fruits R-Z' }
  /* adminFirestore
    .collection("nutrients")
    .select("category")
    .get()
    .then((querysnapshot) => {
      querysnapshot.forEach((doc) => {
        categories.push(doc.data().category);
      });
      res.status(200).json({
        success: true,
        categories: [...new Set(categories)],
      });
    }); */
  const q = query(
    collection(db, "nutrients"),
    );
    await getDocs(q)
      .then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
          categories.push(doc.data().category);
        });
        res.status(200).json({
          message: "Categories fetched success",
          success: true,
          categories: [...new Set(categories)],
        });
      })
      .catch((error) => {
        res.status(200).json({
          message: error.message,
          success: false,
        });
      });
};

export const getNutritions = async (req, res) => {
  const { macros, foodName, categories, lastFoodName } = req.body;
  let nutrientList = [];
  let queryCount = 0;
  const countQuery = query(
    collection(db, "nutrients"),
    where("category", "in", categories),
    orderBy("food"),
    startAt(foodName),
    endAt(foodName + "\uf8ff"))
  await getDocs(countQuery).then(querySnap => {
    queryCount = querySnap.docs.length 
  })
  let q = query(
    collection(db, "nutrients"),
    where("category", "in", categories),
    orderBy("food"),
    startAt(foodName),
    endAt(foodName + "\uf8ff"),
    limit(1)
  );
  if (lastFoodName) {
    q = query(q, startAfter(lastFoodName))
  }
  await getDocs(q)
    .then((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        let newObj = {
          _id: doc.id,
          protein: macros.protein ? doc.data().protein : null,
          carbs: macros.carbs ? doc.data().carbs : null,
          fat: macros.fat ? doc.data().fat : null,
          fiber: macros.fiber ? doc.data().fiber : null,
          calories: doc.data().calories,
          category: doc.data().category,
          food: doc.data().food,
          grams: doc.data().grams,
          measure: doc.data().measure,
        };
        Object.keys(newObj).filter((key) => {
          newObj[key] == null ? delete newObj[key] : key;
        });
        nutrientList.push(newObj);
      });
      res.status(200).json({
        message: "Nutrients fetch success",
        success: true,
        count: queryCount,
        nutrients: nutrientList,
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
