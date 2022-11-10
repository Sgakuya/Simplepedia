/**
 * The goal is to be able to fetch the titles separate from the article contents. 
 * structure:
 * - articles: contains raw articles
 * - sections: contains a sections document with the list of sections and an individual section document for each section containing a list of titles and associated ids
 */


 import process from "node:process";
 import {readFileSync} from "node:fs";
 
 import {initializeFirebase, loadData} from "./firebase-utils.mjs";

 
 
 const seedFirestore = async(seedfile)=>{
    const contents = readFileSync(seedfile);
    const data = JSON.parse(contents);

    initializeFirebase();

    await loadData(data);
    console.log("Done");
 }
 
 
const args = process.argv.slice(2);

 // check for --emulate
const index = args.indexOf("--emulate");
if (index !== -1){
   process.env.NEXT_PUBLIC_EMULATE = true
   args.splice(index,1)
}



 const filename = args[0];
 console.log(`Loading data from ${filename}`);
 
 seedFirestore(filename).then(process.exit);