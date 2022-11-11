# capstone-frontend
This is the backend code for my capstone for a Software Engineering Graduate degree at University of Wisconsin Lacrosse.
It in conjunction with the [Backend](https://github.com/emwitth/capstone-backend).
This code is meant as a (relatively) portable application to be run on linux for network analysis.
I have provisionally named this program *Remora Fish* over its similarity to, and thus simbiotic relationship with, Wireshark.

## running and packages
This project runs using the [Angular](https://ancgular.io/) framework and [NPM](https://www.npmjs.com/). To install, first 
[install NPM](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm), 
then [install Angular CLI](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm).

Next, navigate to the folder capstone within this repository, this is the Angular project. 
If you run the following commands outsid of this repository, they won't have the right scope.

To install the packages via npm run 
```
npm install
```
This should create a node_modules folder with all of the packages needed for this project.
The notable non-standard packages are 
1. [d3](https://d3js.org/)
2. [ng bootstrap](https://www.npmjs.com/package/ngx-bootstrap)
3. [ngx-toaster](https://www.npmjs.com/package/ngx-toaster)

To run the project run
```
npm run start
```
This is critical to use over `ng serve` because a proxy is used to communicate with the backend over localhost 
and the `npm run start` script is configured to set this up.
