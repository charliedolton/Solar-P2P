const express = require("express");

const app = express();

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

//routes

// the movie list
app.get('/', (req, res) => {
    res.render('login');
});

app.post('/login', async(req, res)=>{
    let solarGroup = req.body.solarGroup;
    let username = req.body.username;
    let password = req.body.password;

    // TODO: use Api to login
    console.log(solarGroup, username, password);

    res.redirect('/');
});

app.get('/register', (req, res) => {
    res.render('register');
});

app.get('/new/user', (req, res) => {
    res.render('newUser');
});

app.post('/new/user', (req, res) => {
    let group = req.body.group;
    let username = req.body.username;
    let password = req.body.password;

    console.log(group, username, password);

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