import { render, screen, fireEvent, waitFor } from "@testing-library/react";

import MainApp from "../pages/_app";
import Simplepedia from "..//pages/[[...id]]";
import SimplepediaEditor from "../pages/edit/[[...id]]";
import articles from "../../data/test-data.json";

import {
  collection,
  query,
  getDocs,
  where,
  getFirestore,
  terminate,
} from "firebase/firestore";
import {
  initializeFirebase,
  clearDatabase,
  loadData,
} from "../utils/firebase-utils.mjs";

import mockRouter from "next-router-mock";
import { createDynamicRouteParser } from "next-router-mock/dynamic-routes";

// replace the router with the mock
jest.mock("next/router", () => require("next-router-mock"));

// tell the mock router about the pages we will use
// this allows us to use dynamic routes
mockRouter.useParser(
  createDynamicRouteParser([
    // These paths should match those found in the `/pages` folder:
    "/[[...id]]",
    "/edit/[[...id]]",
  ])
);

jest.setTimeout(10000);

export const sampleSections = [
  ...new Set(articles.map((article) => article.title.charAt(0).toUpperCase())),
].sort();

/**
 * A convenience function for grabbing an article by title out of the database
 * @param {Object} db
 * @param {string} title
 */
async function getArticle(db, title) {
  const q = query(collection(db, "articles"), where("title", "==", title));

  const snapshot = await getDocs(q);

  return { ...snapshot.docs[0].data(), id: snapshot.docs[0].id };
}

describe("End to end testing", () => {
  let db;
  beforeAll(() => {
    initializeFirebase();
    db = getFirestore();
  });

  afterAll(async () => {
    await terminate(db);
  });

  beforeEach(async () => {
    mockRouter.setCurrentUrl("/");

    // clear out any old data
    await clearDatabase();

    // load the test films
    await loadData(articles);
  });

  describe("Testing Simplepedia end-to-end behavior", () => {
    test("Correct sections are displayed", async () => {
      mockRouter.setCurrentUrl("/");
      render(<MainApp Component={Simplepedia} />);
      const items = await screen.findAllByTestId("section");
      expect(items).toHaveLength(sampleSections.length);

      sampleSections.forEach((section) => {
        expect(screen.getByText(section)).toBeVisible();
      });
    });

    test("Selecting a section displays correct titles", async () => {
      mockRouter.setCurrentUrl("/");
      render(<MainApp Component={Simplepedia} />);

      const section = sampleSections[2];

      const sampleArticles = articles.filter(
        (d) => d.title[0].toUpperCase() === section
      );

      const sectionComponent = await screen.findByText(section);

      fireEvent.click(sectionComponent);

      const titles = await screen.findAllByTestId("title");

      expect(titles).toHaveLength(sampleArticles.length);

      sampleArticles.forEach((article) => {
        expect(screen.getByText(article.title)).toBeVisible();
      });
    });

    test("Selecting a title requests the correct article", async () => {
      const article = await getArticle(db, "Cybermen");
      mockRouter.setCurrentUrl("/");
      render(<MainApp Component={Simplepedia} />);

      const sectionComponent = await screen.findByText(
        article.title[0].toUpperCase()
      );

      fireEvent.click(sectionComponent);

      const titleComponent = await screen.findByText(article.title);

      fireEvent.click(titleComponent);

      expect(mockRouter.asPath).toBe(`/${article.id}`);
    });

    test("Displayed article matches the route", async () => {
      const article = await getArticle(db, "Cybermen");

      mockRouter.setCurrentUrl(`/${article.id}`);
      render(<MainApp Component={Simplepedia} />);

      // wait for IndexBar to get the section changed and the titles fetched
      await screen.findAllByTestId("title");
      const titles = await screen.findAllByText(article.title);

      expect(titles).toHaveLength(2);

      expect(screen.getByText(article.contents)).toBeInTheDocument();
    });
  });

  describe("Testing Edit end-to-end behavior", () => {
    test("With no id, editor has no content", () => {
      mockRouter.setCurrentUrl(`/edit`);
      const { container } = render(<MainApp Component={SimplepediaEditor} />);

      const titleEditor = container.querySelector("input[type=text]");
      const contentsEditor = container.querySelector("textarea");

      expect(titleEditor.value).toBe("");
      expect(contentsEditor.value).toBe("");
    });

    test("With an id set, the editor is populated with the correct article", async () => {
      const article = await getArticle(db, "Cybermen");
      mockRouter.setCurrentUrl(`/edit/${article.id}`);
      const { container } = render(<MainApp Component={SimplepediaEditor} />);
      const titleEditor = container.querySelector("input[type=text]");
      const contentsEditor = container.querySelector("textarea");

      await waitFor(() => expect(titleEditor.value).toBe(article.title));
      expect(contentsEditor.value).toBe(article.contents);
    });
  });
});
