# Simplepedia

## Author
Smith Gakuya

A stripped down version of wikipedia that allows adding, editing and uploading text-only articles which are stored in a Firestore NoSQL database. 

## Usage
1. After opening directory with files install dependencies by running
> npm install
2. Open the database and authentication emulators by running:
> firebase emulators:start    
*Note: Emulators by default are set to use the ports 5000, 9099 and 8000. To change this, open the firebase.json file and edit there*   
*You can open these emulators by going to the links displayed in your terminal in order to view how the data is stored in Firestore*    
3. There are already some articles in data/seed.json which you can seed into the site by running   
> npm run seed
4. Run the developer version of the site:
> npm run dev
5. Go to the link displayed in your terminal.
6. Clicking on the boldened characters on the top will show you the articles that begin with the clicked character.
7. When adding a new article, you must set the title, the content is optional.

