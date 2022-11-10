// Import the functions you need from the SDKs you need

import { getApp, initializeApp } from "firebase/app";
import {  initializeFirestore, connectFirestoreEmulator, getFirestore, collection, doc, addDoc, setDoc, updateDoc, deleteDoc, getDocs } from "firebase/firestore";

// Firebase configuration
const firebaseConfig = undefined // add your own configuration here



// Initialize Firebase

export function initializeFirebase(){
  try{
    return getApp();
  } catch (e){
    // app has not been initialized
    const app = initializeApp(firebaseConfig);

    // initialize the database
    const db = initializeFirestore(app, {useFetchStreams: false})

    // connect up the emulator to the database
    if (process.env.NEXT_PUBLIC_EMULATE // manually set flag
      || process.env.FIRESTORE_EMULATOR_HOST // running using emulator exec
      || process.env.NODE_ENV === "test" // testing
      ){
      console.log("Connecting to emulator");
      connectFirestoreEmulator(db, "localhost", 8080 );
    }
    return app;
  }
}





/**
 * This function adds a single article to the database
 * 
 * @param {Object} article
 * @return article with id set to document name
 */
export async function addArticle(article){



  return {};
}

/**
 * This function takes in an article object and an object containing updates.
 * The updates are used to update the darticle document in the database.
 * 
 * This function also handles the title record in the "Sections" collection, updating or moving as appropriate, and making sure that the "sections" are consistent with the contents of the "articles" collection.
 * 
 * The return value is a fully modified copy of the article object.
 * 
 * 
 * @param {Object} article 
 * @param {Object} updates 
 * @returns modified article object
 */
export async function updateArticle(article, updates){
  

  return {};
}



/**
 * This is a helper function for bulk loading a collection. 
 * 
 * The main reason to use this is for seeding or testing.
 * 
 * @param {*} data - an Array of articles to be stored as documents
 */
export async function loadData(data){
  const db = getFirestore();
  const sections = new Map();

  const collectionRef = collection(db, "articles");

  await Promise.all(data.map(async (d)=>{
    const section = d.title[0].toUpperCase();
    delete d.id; // firebase will generate a new id for us

    // add the document to firestore
    const docRef = await addDoc(collectionRef, d);

    // record the title and id
    const reference = {id: docRef.id, title: d.title }

    if (sections.has(section)){
      sections.get(section).push(reference);
    }else{
      sections.set(section, [reference])
    }

  }));

  const sectionsRef = collection(db, "sections");

  const sectionNames = Array.from(sections.keys());

  await Promise.all(sectionNames.map(async (section) => {
    const titles = sections.get(section);

    await setDoc(doc(sectionsRef, section), {section});

    await Promise.all(titles.map(async title => {
      await setDoc(doc(sectionsRef, section, "titles", title.id), title);
    }))
  }));

}



/**
 * This function is designed to remove all documents from a 
 * collection. (It will not take care of sub collections).
 * 
 * Its primary use is for testing.
 * 
 * @param {Object} collectionRef 
 */
export async function clearCollection(collectionRef){
  const docSnapshot = await getDocs(collectionRef);
  await Promise.all(docSnapshot.docs.map((d)=>(deleteDoc(doc(collectionRef, d.id))
  )));
}




/**
 * This function clears all data out of the database. This is only used for testing.
 */
export async function clearDatabase(){
  const db = getFirestore();

  // remove the articles
  await clearCollection(collection(db, "articles"));

  // remove the sections
  const sectionsSnapshot = await getDocs(collection(db, "sections"));
  await Promise.all(sectionsSnapshot.docs.map(async (section)=>{

    await clearCollection(collection(db, "sections", section.id, "titles"));
    await deleteDoc(doc(db, "sections", section.id));
  }));

}

