# Installation

First you'll need to have a local postgresql database.

Install postgresql and make sure that the database server is running and it accepts connections

After installing the postgresql you'll need modifiy the .env (follow the instructions in the .env.example file), and add your:
 - type (which mainly is postgresql)
 - host (which for development will be localhost)
 - port (which will be 5432)
 - user (username and password), database name
 - database name

After setting up the database, to install the dependencies, you need to run:
```bash
npm install
``` 

And lastly, to start the server, you can run:
```bash
npm run dev
# or
npm start
```
