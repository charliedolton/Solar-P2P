const express = require("express");
const fetch = require("node-fetch");
const app = express();
const fs = require("fs");
const request = require("request");
const bcrypt = require("bcryptjs");

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

// API URL to perform login, register and get Planets from same system
var URL = "https://solar-cst499.herokuapp.com";

// DIR where the server stores planet ID
<<<<<<< Updated upstream
var DIR = "/home/pi/Solar";
=======
var DIR = "../register";
>>>>>>> Stashed changes

// Method to pull data using GET request
const fetchUrl = async (url) => {
    let response = await fetch(url);
    let data = await response.json();
    return data;
}

// Setting options for the Post requests
const getOptions = (url, data) => {
    let options = {
        uri: url,
        body: JSON.stringify(data),
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    }
    return options;
};

// Home Page where the user enters the System Number
app.get('/', (req, res) => {
    res.render('selectSystem');
});

// Home post method implementation that redirects to login while passing the system number
app.post('/', (req, res) => {
    let system = req.body.system;
    res.redirect(`/login?system=${system}`);
});

// Login Page
app.get('/login', async (req, res) => {
    // Getting info from the URL of the request
    let status = req.query.status;
    let system = req.query.system;

    // Redirect to home page if no system parameter was found
    if (system == undefined) {
        res.redirect('/');
        return;
    }

    // Trying to fetch all planets from the same system
    let url = URL + `/planetsInSystem?systemNum=${system}`;
    let planets;
    try {
        planets = await fetchUrl(url);
    } catch (err) {
        console.log(err);
    }

    res.render('login', { 'status': status, "planets": planets, 'system': system });
});

// Login page's post implementation to try and login
app.post('/login', async (req, res) => {
    // Accessing information from request body
    let planet = req.body.planet;
    let password = req.body.password;
    let system = req.body.system;

    planet = JSON.stringify(planet);
    planet = JSON.parse(planet);
    let planetName = planet.id;
    let name = planet.name;
    console.log(planet, planetName, name);
    // Setting up parameters for post request
    let data = {
        "planetName": planetName,
        "password": password,
        "system": system
    };
    console.log(data);
    let url = URL + `/login?planetName=${planetName}&password=${password}`;
    let options = getOptions(url, data);

    // If no planet name found redirect to login page with failed status
    if (planetName == "None" || planetName == undefined) {
        res.redirect(`/login?system=${system}&status=failed`);
        return;
    }

    // Making the post request to the API
    request(options, (error, response) => {
        if (error) {
            console.error(error);
        }

        // If Login is not successful redirect to login page with failed status
        if (response.statusCode != 200) {
            res.redirect(`/login?system=${system}&status=failed`);
        } else {
            // If DIR doesn't exist on the sytem create the DIR
            if (!fs.existsSync(DIR)) {
                fs.mkdirSync(DIR);
            }
            // Write planet info into register.txt in directory DIR
            fs.writeFile(DIR + '/register.txt', JSON.stringify(data), (error) => {
                if (error) {
                    throw error;
                }
            })

            // Redirect to login page with success status
            res.redirect(`/login?system=${system}&status=success`);
        }
    });
});

// New User registration page
app.get('/new/user', (req, res) => {
    let status = req.query.status;

    res.render('newUser', { 'status': status });
});

// New User's post implementation used to register the planet to the server
app.post('/new/user', async (req, res) => {
    // Getting data from request body
    let system = req.body.system;
    let planetName = req.body.planet_name;
    let password = req.body.password;

    // Setting parameters for POST request to API
    data = {
        'planetName': planetName,
        'system': system,
        'password': password
    };

    let url = URL + `/register?planetName=${planetName}&password=${password}&systemNum=${system}`;

    let options = getOptions(url, data);

    // Making POST request 
    request(options, (error, response) => {
        if (error) {
            console.error(error);
        }
        if (response.statusCode == 200) {
            res.redirect('/new/user?status=success');
        } else {
            res.redirect('/new/user?status=failed')
        }
    });
});

//start server
app.listen(3000, () => {
    console.log("Expresss server running...")
})
