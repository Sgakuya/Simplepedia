
import Head from "next/head";


import styles from "../styles/Simplepedia.module.css";

export default function Simplepedia({collection}) {
  

  return (
    <div className={styles.container}>
      <Head>
        <title>Simplepedia</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <h1 className="title">Simplepedia</h1>
       
      </main>

      <footer>CS 312 Assignment 4</footer>
    </div>
  );
}
