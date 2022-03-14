## FIFA Squad Builder

A simple soccer (FIFA) squad-builder that uses players attributes to maximize total team chemistry. This interative command line application was built using functional-style programming when possible.

### How to Run this Application
1. run `npm install` to install dependencies (only the 'prompt-sync' module is required for command line interactions).
2. run  `npm start` or `node server.js` to start the application.  
### Features
The end goal of this application is to generate squad with the highest chemistry score (max 100) from a list of players.
In this project, I am using the top 100 players from the FUTDB API as the starting data set.
And then based on that list of players, and other datasets (maps of formations and positions, list of nations & clubs & leagues), the user goes through the following steps:
1. To start off, the user can choose whether to 'generate a squad randomly' or to 'generate a squad from one league'. 
2. Once a starting squad has been generated, the user can start improving the overall chemistry squad by choosing one player, and building around them.

### Functional Programming
When coding this project, I used several functional programming concepts that are supported in Javascript:
1. First-class functions: All functions in the main file (`server.js`) are declared as constant variables. And as Javascript support 'first-class functions', I am able to use those functions just like I would use other JS varibles. For example, I am able to pass them as arguments to other functions.  
2. Immutable constants: Except for long-lived variable that are used to keep track of the state of teh application (e.g.: ), all variables in `server.js` are constant (using the `const` keyword). Using 'immutable constants' simplified the logic as I did not have to think of unintended side effects. Each of the function takes in some input, and return a newly-created output.
3. Higher-order funtions: As players’ attributes are immutables, I am reading-in the JSON datasets as Javascript objects, and then using JS higher-order funtions such as `map`, `filter`, and `reduce` to do operations such as iterating through objects & arrays, or filtering players from a certain nation & club & league. 
4. Pure functions: Except for instances where I am interacting with the user, and I need to do IO operations, I have written my functions to be pure, i.e.: no side effects. When taking in arguments, I am reading-in some constants, doing some operations, and returning new objects without making any changes to the passed-in args.

### Used APIs
1. Fifa Ultimate Team Database API: https://futdb.app/
