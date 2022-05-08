const express = require("express");
const res = require("express/lib/response");
const fetch = require("node-fetch");
const app = express();
const fs = require("fs");
const request = require('request');

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

//routes
var URL = "https://solar-cst499.herokuapp.com";
var DIR = "../register";


var planets;
request(URL + "/planetsInSystem?systemNum=1", function (error, response, body) {
    if (!error && response.statusCode == 200) {
        planets = JSON.parse(body);
    }
});
// the movie list
app.get('/', (req, res) => {
    let login = req.query.login;

    console.log(planets);
    res.render('login', { 'login': login, "planets" : planets });
});

const updateServer = async (url, data) => {
    console.log(data);
    var clientServerOptions = {
        uri: URL + url,
        body: data,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    }
    return request(clientServerOptions, (error, response) => {
        console.log(error, response.body);
        return;
    });
}

app.post('/login', async (req, res) => {
    let solarGroup = req.body.solarGroup;
    let planetName = req.body.username;
    let password = req.body.password;

    let data = {"planetName": planetName,"password": password};


    let response = request.post(URL + "/login", params = data);
    console.log(response)
    // if (response.status != 200) {
    //     res.redirect('/?login=failed');
    // } else {
    //     console.log(data);
    //     if (!fs.existsSync(DIR)) {
    //         fs.mkdirSync(DIR);
    //     }
    //     fs.writeFile(DIR + '/register.txt', data, (error) => {
    //         if (error) {
    //             throw error;
    //         }
    //     })
    //     res.redirect('/');
    // }
    res.redirect('/');
    // TODO: use Api to login && save solarGroup and username

});

app.get('/register', (req, res) => {
    res.render('register');
});

app.get('/new/user', (req, res) => {
    res.render('newUser');
});

app.post('/new/user', async (req, res) => {
    let group = req.body.group;
    let username = req.body.username;
    let password = req.body.password;

    request.post({ headers: {'content-type' : 'application/json'}
               , url: URL, body: data }
               , function(error, response, body){
        console.log(body); 
    }); 
    console.log(response);

    res.redirect('/new/user');
});

app.get('/new/group', (req, res) => {
    res.render('newGroup');
});

app.post('/new/group', (req, res) => {
    let group = req.body.group;
    console.log(group);
    res.redirect('/new/group');
});

//start server
app.listen(3000, () => {
    console.log("Expresss server running...")
})
