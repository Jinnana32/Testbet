let express = require("express");
let http = require('http');
let app = express();
let bodyParser = require('body-parser');

// Socket IO inits
let server = http.createServer(app);
let io = require('socket.io').listen(server);
let GameManager = require("./src/GameManager");

let db = null;

/* 
===========================================
            Server Api Logic
===========================================
 */

// Render html files from views folder
app.use(express.static(__dirname + '/views'));
app.use(express.static(__dirname + '/src'));
app.use(express.static(__dirname + '/config'));

// Inject body-parser
app.use(bodyParser.urlencoded({extended: true}));

app.get('/', (req,res) => {
    res.sendFile('index.html');
});

app.get('/dashboard', (req, res) => {
    res.sendFile('dashboard.html',{"root": "views/"});
});

app.get('/account', (req, res) => {
    res.sendFile('account.html',{"root": "views/"});
});

// register new user
app.post('/user/register', (req, res) => {
    //console.log(req.body);
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

/* 
===========================================
           Sockets Logic
===========================================
 */
let connections = [];
let queue = [];
io.sockets.on('connection', (socket) => {
  
    connections.push(socket);
    console.log(`Connected Sockets: ${connections.length}`);

    // Disconnection Event
    socket.on('disconnect', (data) => {
        connections.splice(connections.indexOf(socket), 1);
        console.log(`Connected Sockets: ${connections.length}`);
    });

    // Find Match
    socket.on('find match', (data) => {

        if(queue.length > 0) {
            // find a player with the same bet
            queue.forEach((users, index) => {
                if(data.bet == users.bet){
                    let total_bet = parseInt(data.bet) + parseInt(users.bet);

                    console.log(data.bet);
                    console.log(users.bet);

                    new GameManager(users.address, data.address,connections[index], socket, total_bet);
                    
                    // Remove the user from QUEUE
                    removeFromQueue(users.address);

                }else{
                    queue.push(data);
                }
            });

        }else{
            queue.push(data);
        }
    });

    function removeFromQueue(address){
        queue.forEach((users, index, obj) => {
            if(users.address == address){
                obj.splice(index, 1);
            }
        });
    }

});

// MongoDB
const mdclient = require('mongodb').MongoClient;

mdclient.connect('mongodb://powerofpanda:Jinnana3232##@ds015924.mlab.com:15924/testbet',{ 
    useNewUrlParser: true 
    }, (err, client) => {
    if(err) return console.log(err);
    db = client.db("testbet"); // database name
    server.listen(3000, '0.0.0.0', function(){
        console.log("Server is running at http://localhost:3000");
    });   
});

