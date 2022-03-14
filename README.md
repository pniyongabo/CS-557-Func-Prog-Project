## FIFA Squad Builder

A simple soccer (FIFA) squad-builder that uses players attributes to maximize total team chemistry. This interative command-line application was built using functional programming features. 

### How to Run this Application
1. run `npm install` to install dependencies (only the 'prompt-sync' module is required for command line interactions).
2. run  `npm start` or `node server.js` to start the application.  
### Features
With this interactive command-line application, users can create squads from a list of players (`./data/players.json`). 

Users can also continuously improve an existing squad's chemistry score (max 100) by choosing a 'pivot' position. Once a 'pivot' position is selected, the application will attempt to improve the chemistry score by replacing adjacent players with new players who are more compatible with the player in the pivot position.


After running `npm start`, the user goes through the following steps:
1. To start off, the user chooses whether to 'generate a squad randomly' or to 'generate a squad from one league'. 
2. The users picks a formation. Currently only two formation are supported: '442' and '433'. After this step, a squad will be generated and a chemistry score will be generated.
3. Once a squad has been generated, the user can start improving the overall chemistry squad by choosing a 'pivot' position, and building around that position.
4. After an attempt of improving the chemistry score, the user can either choose (1) to 'Go back to the Main Menu', (2) 'Keep Improving the Current Squad', or (3) to 'Quit the Application'`;

### Functional Programming
When coding this project, I used several functional programming concepts that are supported in Javascript:
1. First-class functions: All functions in the main file (`server.js`) are declared as constant variables. As Javascript supports 'first-class functions', I was able to use those functions just as I would use other Javascript variables. For example, I was able to pass them as arguments to other functions.  
2. Immutable constants: Except for long-lived variables that are used to keep track of the state of the application (e.g.: currentSquad, currentFormation, etc), all other variables in `server.js` are constants (declared using the `const` keyword). Using 'immutable constants' simplified the logic as I did not have to think of unintended side effects. 
3. Higher-order funtions: As players’ attributes (position, nationality, etc) are immutable, I am parsing the JSON datasets and storing them as Javascript objects. Then I am using built-in array prototype higher-order funtions such as `map` and `filter` to perfom operations such as iterating through objects & arrays, and filtering players from a certain nation & club & league. 
4. Pure functions: Except for instances where I am interacting with the user or printing some inforfmation to the console (and I need to do some IO operations); I have written my functions to be pure, i.e.: no side effects. When taking in arguments, I consume those arguments as constants, perform some operations, and return new objects without making changes to the objects that were passed in.

### Used API
In this project, I am using the top 400 players from the FUTDB API (https://futdb.app/) as the starting dataset.
In addition to the list of players, I am also using other datasets for getting and mapping players' attibutes data (list of nations, list of clubs, list of leagues).

