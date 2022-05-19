const express = require("express");
const fetch = require("node-fetch");
const app = express();
const fs = require("fs");
const request = require('request');

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));


var URL = "https://solar-cst499.herokuapp.com/";
var DIR = "/var/register";

// var planets;
// request(URL + "/planetsInSystem?systemNum=1", function (error, response, body) {
//     if (!error && response.statusCode == 200) {
//         planets = JSON.parse(body);
//     }
// });

const fetchUrl = async (url) => {
    let response = await fetch(url);
    let data = await response.json();
    return data;
}

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

app.get('/', (req, res) => {
    res.render('selectSystem');
});

app.post('/', (req, res) => {
    let system = req.body.system;
    console.log(system);
    res.redirect(`/login?system=${system}`);
});

// the Login Page
app.get('/login', async (req, res) => {
    let status = req.query.status;
    let system = req.query.system;
    if (system == undefined) {
        res.redirect('/');
        return;
    }
    let url = URL + `/planetsInSystem?systemNum=${system}`;
    let planets;
    try {
        planets = await fetchUrl(url);
    } catch (err) {
        console.log(err);
    }

    res.render('login', { 'status': status, "planets": planets, 'system': system });
});


app.post('/login', async (req, res) => {
    let planetName = req.body.username;
    let password = req.body.password;
    let system = req.body.system;

    let data = { "planetName": planetName, "password": password };
    let url = URL + "/login";
    let options = getOptions(url, data);

    if (planetName == "None") {
        res.redirect(`/login?system=${system}&status=failed`);
        return;
    }

    request(options, (error, response) => {
        if (error) {
            console.error(error);
        }
        console.log(response.statusCode, response.body);
        if (response.statusCode != 200) {
            res.redirect(`/login?system=${system}&status=failed`);
        } else {
            console.log(data);
            if (!fs.existsSync(DIR)) {
                fs.mkdirSync(DIR);
            }
            fs.writeFile(DIR + '/register.txt', JSON.stringify(data), (error) => {
                if (error) {
                    throw error;
                }
            })
            res.redirect(`/login?system=${system}&status=success`);
        }
    });
});

app.get('/register', (req, res) => {
    res.render('register');
});

app.get('/new/user', (req, res) => {
    let status = req.query.status;

    res.render('newUser', { 'status': status });
});

app.post('/new/user', async (req, res) => {
    let system = req.body.system;
    let planetName = req.body.planet_name;
    let password = req.body.password;

    data = {
        'planetName': planetName,
        'system': system,
        'password': password
    };

    let url = URL + "/register";

    let options = getOptions(url, data);

    request(options, (error, response) => {
        if (error) {
            console.error(error);
        }
        console.log(response.body, response.statusCode);
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
