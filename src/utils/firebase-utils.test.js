import articles from "../../data/test-data.json";

import {
  doc,
  query,
  collection,
  getFirestore,
  terminate,
  where,
  getDoc,
  getDocs,
} from "firebase/firestore";

import {
  initializeFirebase,
  clearDatabase,
  loadData,
  addArticle,
  updateArticle,
} from "../utils/firebase-utils.mjs";

jest.setTimeout(8000);

describe("Firestore utility functions test", () => {
  let db;
  beforeAll(() => {
    initializeFirebase();
    db = getFirestore();
  });

  afterAll(async () => {
    await terminate(db);
  });

  beforeEach(async () => {
    // clear out any old data
    await clearDatabase();

    // load the test films
    await loadData(articles);
  });

  describe("addArticle: addArticle tests", () => {
    test("addArticle: Adding article adds both the article and the title record", async () => {
      const newArticle = {
        title: "Davros",
        contents: "Brilliant, but deranged, husk in rolling chair",
        edited: "2017-05-08",
        id: 99,
      };

      const addedArticle = await addArticle({ ...newArticle });

      // make sure the article is in the database
      let snapshot = await getDoc(doc(db, "articles", addedArticle.id));

      expect(snapshot.exists()).toBeTruthy();

      // make sure the article has the right values
      const fetchedArticle = snapshot.data();
      expect(fetchedArticle.title).toBe(newArticle.title);
      expect(fetchedArticle.contents).toBe(newArticle.contents);
      expect(fetchedArticle.edited).toBe(newArticle.edited);

      // check on the title record
      snapshot = await getDoc(
        doc(db, "sections", newArticle.title[0], "titles", addedArticle.id)
      );
      expect(snapshot.exists()).toBeTruthy();

      // make sure the title has the right values
      const fetchedTitle = snapshot.data();
      expect(fetchedTitle.title).toBe(newArticle.title);
      expect(fetchedTitle.id).toBe(addedArticle.id);
    });

    test("addArticle: Adding article add new section", async () => {
      const newArticle = {
        title: "Yeti",
        contents: "Big furry robots",
        edited: "2017-05-08",
        id: 88,
      };
      // make sure the section does exist before
      let snapshot = await getDoc(doc(db, "sections", newArticle.title[0]));
      expect(snapshot.exists()).toBeFalsy();

      const addedArticle = await addArticle({ ...newArticle });

      // the section should now exist
      snapshot = await getDoc(doc(db, "sections", newArticle.title[0]));
      expect(snapshot.exists()).toBeTruthy();

      // check on the title record
      snapshot = await getDoc(
        doc(db, "sections", newArticle.title[0], "titles", addedArticle.id)
      );
      expect(snapshot.exists()).toBeTruthy();

      // make sure the title has the right values
      const fetchedTitle = snapshot.data();
      expect(fetchedTitle.title).toBe(newArticle.title);
      expect(fetchedTitle.id).toBe(addedArticle.id);
    });
  });

  describe("updateArticle: updateArticle tests", () => {
    test("updateArticle: Simple update of contents only", async () => {
      const q = query(
        collection(db, "articles"),
        where("title", "==", "Cybermen")
      );

      let snapshot = await getDocs(q);

      const original = { ...snapshot.docs[0].data(), id: snapshot.docs[0].id };

      const updates = { contents: "Metal men with handles on their heads" };
      const updatedArticle = await updateArticle({ ...original }, updates);

      // check that the right value is being returned
      expect(updatedArticle.title).toBe(original.title);
      expect(updatedArticle.contents).toBe(updates.contents);

      // check that the article is correct in the database
      snapshot = await getDocs(q);
      // make sure the article has the right values
      const fetchedArticle = snapshot.docs[0].data();
      expect(fetchedArticle.title).toBe(original.title);
      expect(fetchedArticle.contents).toBe(updates.contents);
      expect(fetchedArticle.edited).toBe(original.edited);
    });

    test("updateArticle: Updating title changes title record", async () => {
      const q = query(
        collection(db, "articles"),
        where("title", "==", "Cybermen")
      );

      let snapshot = await getDocs(q);

      const original = { ...snapshot.docs[0].data(), id: snapshot.docs[0].id };

      const updates = {
        title: "Cybermats",
        contents: "Bug-like pets of the Cybermen",
      };
      const updatedArticle = await updateArticle({ ...original }, updates);

      snapshot = await getDoc(
        doc(db, "sections", updatedArticle.title[0], "titles", original.id)
      );

      expect(snapshot.exists()).toBeTruthy();

      // make sure the title has the right values
      const fetchedTitle = snapshot.data();
      expect(fetchedTitle.title).toBe(updatedArticle.title);
      expect(fetchedTitle.id).toBe(original.id);
    });

    test("updateArticle: Changing title to different section moves title record", async () => {
      const q = query(
        collection(db, "articles"),
        where("title", "==", "Dalek")
      );

      let snapshot = await getDocs(q);

      const original = { ...snapshot.docs[0].data(), id: snapshot.docs[0].id };

      const updates = {
        title: "Cybermats",
        contents: "Bug-like pets of the Cybermen",
      };
      const updatedArticle = await updateArticle({ ...original }, updates);

      snapshot = await getDoc(
        doc(db, "sections", original.title[0], "titles", original.id)
      );

      expect(snapshot.exists()).toBeFalsy();

      snapshot = await getDoc(
        doc(db, "sections", updatedArticle.title[0], "titles", original.id)
      );

      expect(snapshot.exists()).toBeTruthy();
    });

    test("updateArticle: Changing title to new section creates section", async () => {
      const q = query(
        collection(db, "articles"),
        where("title", "==", "Dalek")
      );

      let snapshot = await getDocs(q);

      const original = { ...snapshot.docs[0].data(), id: snapshot.docs[0].id };

      const updates = {
        title: "Ice Warriors",
        contents: "Poorly named Martians",
      };

      snapshot = await getDoc(doc(db, "sections", updates.title[0]));
      expect(snapshot.exists()).toBeFalsy();

      await updateArticle({ ...original }, updates);

      snapshot = await getDoc(doc(db, "sections", updates.title[0]));
      expect(snapshot.exists()).toBeTruthy();
    });

    test("updateArticle: Changing title for last record in section removes section", async () => {
      const q = query(
        collection(db, "articles"),
        where("title", "==", "Cybermen")
      );

      let snapshot = await getDocs(q);

      const original = { ...snapshot.docs[0].data(), id: snapshot.docs[0].id };

      const updates = {
        title: "Ice Warriors",
        contents: "Poorly named Martians",
      };

      snapshot = await getDoc(doc(db, "sections", original.title[0]));
      expect(snapshot.exists()).toBeTruthy();

      await updateArticle({ ...original }, updates);

      snapshot = await getDoc(doc(db, "sections", original.title[0]));
      expect(snapshot.exists()).toBeFalsy();
    });
  });
});
