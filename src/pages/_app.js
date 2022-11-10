/* eslint-disable */
import "../styles/globals.css";
import { useState } from "react";


import data from "../../data/seed.json";

function MainApp({ Component, pageProps }) {
  const [collection, setCollection] = useState(data);
  

  const props = {
    ...pageProps,
    collection,
    setCollection,
  };
  return <Component {...props} />;
}

export default MainApp;
