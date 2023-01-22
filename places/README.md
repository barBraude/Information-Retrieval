# Information Retrieval - crawler google maps api

This project is part of Information Retrieval course.
We build crawler to google  maps from `google places api` to improve the searching in the website.
We build 3 features that we didn't find answer to them in google maps website 

1. Filter the places with range of rating. For example rating between 3 - 4
2. Filter the places with minimum amount of reviews that wrote on this place
3. Filter the places with rang of opening hours. For example open Friday at 10:00 - 14:00

We also put the results of the filtering searching on Google maps so that the user can see where each place is located

This project is divided into two parts:

* crawler - Node js project
* website - frontend and backend project


## Instalation
Clone the project : `git clone https://github.com/barBraude/Information-Retrieval.git`

## To run crawler project

1. open the terminal in `crawler` folder
2. run the command  `node app.js`
3. the results will show on the terminal

## To run website project

1. open terminal in `website_client` folder 
2. open terminal in `backend` folder
3. run on each terminal `npm install`
4. run in the terminal in `backend` folder the command : `node app.js`
5. run in the terminal in `website_client` folder the command : `ng serve`
6. navigate to `http://localhost:4200/`


