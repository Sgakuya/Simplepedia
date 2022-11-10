
import Head from "next/head";

import styles from "../../styles/Simplepedia.module.css";


export default function SimplepediaEditor({
  currentArticle,
  setCurrentArticle,
}) {


  return (
    <div className={styles.container}>
      <Head>
        <title>Simplepedia</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <p>Simplepedia Editor</p>
      </main>

      <footer>CS 312 Assignment 4</footer>
    </div>
  );
}


