const express = require("express");
const app = express();
const bodyParser = require('body-parser');

let db = null;

// Render html files from views folder
app.use(express.static(__dirname + '/views'));
app.use(express.static(__dirname + '/src'));

// Inject body-parser
app.use(bodyParser.urlencoded({extended: true}));


app.get('/', (req,res) => {
    res.sendFile('index.html');
});


app.get('/dashboard', (req, res) => {
    res.sendFile('dashboard.html',{"root": "views/"});
});

// register new user
app.post('/user/register', (req, res) => {
    console.log(req.body);
    db.collection('users').findOne({address: req.body.address}, (err, user) => {
        if (err) return console.log(err)
        if(user == null){
            db.collection('users').insertOne(req.body, (err,result) => {
                if (err) return console.log(err)
                console.log('save to database');
                res.json({status: "successfull", message: "Yay! Welcome to the fray."});
            })
        }else{
            res.json({status: "error", message: "Sorry, Address already registered"});
        }
    })
});

// login user
app.post('/user/login', (req, res) => {
    db.collection('users').findOne(req.body, (err, user) => {
        if (err) return console.log(err)
        if(user == null){
            res.json({status: "error", message: "Invalid username or password"});
        }else{
            res.json({status: "success", message: "Login successfull"});
        }
    })
});


// MongoDB
const mdclient = require('mongodb').MongoClient;

mdclient.connect('mongodb://powerofpanda:Jinnana3232##@ds015924.mlab.com:15924/testbet',{ 
    useNewUrlParser: true 
    }, (err, client) => {
    if(err) return console.log(err);
    db = client.db("testbet"); // database name
    app.listen(3000, function(){
        console.log("Server is running at http://localhost:3000");
    });   
});

