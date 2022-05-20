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
var DIR = "/home/pi/register";

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
    let name = req.body.planet;
    let password = req.body.password;
    let system = req.body.system;

    // If no planet name found redirect to login page with failed status
    if (name == "None" || name == undefined) {
        res.redirect(`/login?system=${system}&status=failed`);
        return;
    }

    let data = {
        "planetName": name,
        "password": password,
        "system": system
    };

    // Setting up parameters for post request
    let url = URL + `/login?planetName=${name}&password=${password}`;
    let options = getOptions(url, data);

    console.log(url);
    // Making the post request to the API
    request(options, (error, response) => {
        if (error) {
            console.error(error);
        }
        console.log(response.body, data);
        // If Login is not successful redirect to login page with failed status
        if (response.body != "Successfully logged in planet!") {
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
