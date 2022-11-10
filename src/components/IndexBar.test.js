import { screen, fireEvent, render } from "@testing-library/react";

import IndexBar from "./IndexBar";

import articles from "../../data/test-data.json";

import {
  getDocs,
  query,
  collection,
  getFirestore,
  terminate,
  where,
} from "firebase/firestore";

import {
  initializeFirebase,
  clearDatabase,
  loadData,
} from "../utils/firebase-utils.mjs";

const sampleSections = [
  ...new Set(articles.map((article) => article.title.charAt(0).toUpperCase())),
].sort();

describe("IndexBar tests", () => {
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

  describe("IndexBar: Basic IndexBar functionality", () => {
    test("IndexBar: Fetches and displays sections", async () => {
      render(<IndexBar setCurrentArticle={jest.fn()} />);
      const items = await screen.findAllByTestId("section");

      expect(items).toHaveLength(sampleSections.length);
      sampleSections.forEach((section) => {
        expect(screen.getByText(section)).toBeVisible();
      });
    });

    test("IndexBar: Clicking on a section displays titles", async () => {
      render(<IndexBar setCurrentArticle={jest.fn()} />);
      const section = await screen.findByText(sampleSections[0]);

      fireEvent.click(section);

      const titles = await screen.findAllByTestId("title");

      const expectedArticles = articles.filter(
        (article) => article.title.charAt(0).toUpperCase() === sampleSections[0]
      );

      expect(titles).toHaveLength(expectedArticles.length);

      expectedArticles.forEach((article) => {
        expect(screen.getByText(article.title)).toBeVisible();
      });
    });

    test("IndexBar: Changing sections changes the titles", async () => {
      render(<IndexBar setCurrentArticle={jest.fn()} />);
      let section = await screen.findByText(sampleSections[0]);

      fireEvent.click(section);

      section = await screen.findByText(sampleSections[1]);

      fireEvent.click(section);
      const expectedArticles = articles.filter(
        (article) => article.title.charAt(0).toUpperCase() === sampleSections[1]
      );

      await screen.findAllByText(expectedArticles[0].title);

      const titles = await screen.findAllByTestId("title");

      expect(titles).toHaveLength(expectedArticles.length);

      expectedArticles.forEach((article) => {
        expect(screen.getByText(article.title)).toBeInTheDocument();
      });
    });

    test("IndexBar: Clicking a title selects the article", async () => {
      const selectFunction = jest.fn();
      render(<IndexBar setCurrentArticle={selectFunction} />);
      const section = await screen.findByText("D");
      fireEvent.click(section);
      const title = await screen.findByText("Dalek");

      fireEvent.click(title);

      const snapshot = await getDocs(
        query(collection(db, "articles"), where("title", "==", "Dalek"))
      );

      const article = snapshot.docs[0].data();

      expect(selectFunction).toHaveBeenCalledWith({
        title: article.title,
        id: snapshot.docs[0].id,
      });
    });
  });

  describe("IndexBar: IndexBar with currentArticle", () => {
    test("IndexBar: currentArticle sets the current section", async () => {
      render(
        <IndexBar currentArticle={articles[1]} setCurrentArticle={jest.fn()} />
      );

      const title = await screen.findByText(articles[1].title);

      expect(title).toBeInTheDocument();
    });

    test("IndexBar: Changing currentArticle updates section", async () => {
      const { rerender } = render(
        <IndexBar currentArticle={articles[1]} setCurrentArticle={jest.fn()} />
      );

      await screen.findByText(articles[1].title);

      expect(screen.queryByText(articles[1].title)).toBeInTheDocument();
      expect(screen.queryByText(articles[0].title)).not.toBeInTheDocument();

      rerender(
        <IndexBar currentArticle={articles[0]} setCurrentArticle={jest.fn()} />
      );
      await screen.findByText(articles[0].title);

      expect(screen.queryByText(articles[1].title)).not.toBeInTheDocument();
      expect(screen.queryByText(articles[0].title)).toBeInTheDocument();
    });
  });
});
