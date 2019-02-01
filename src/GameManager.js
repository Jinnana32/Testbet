let axios = require("axios");
let ethers = require("ethers");
var fs = require('fs');
var uuid = require("uuid");
var bigInt = require("big-integer");

class GameManager {

    constructor(a1,a2,p1,p2,bet){
        this._players = [p1,p2];
        this._playerAddress = [a1,a2]
        this._questions = [];
        this._questionTracker = 0;
        this._confirmation = 0;
        this._currentCorrectAnswer;
        this._bet = bet;
        this._matchID = uuid();
        this._playerAnswer = [["","wrong"],["","wrong"]];
        this._playerScore = [0,0];

        this._contract = null;
        this._contractAbi;
        this._contractAddress;
        this._contractWithSigner;


        console.log("Player address: ", JSON.stringify(this._playerAddress));
        console.log("Total bet: " , this._bet);

        // Init Contract
        this._initContract();

        // Make a match
        this._makeMatch();

        // Load Questions
        this._fetchQuestion();

        // Init Socket events
        this._initSocketEvents();
    }

    _fetchQuestion(){
        axios.get("https://opentdb.com/api.php?amount=10&type=multiple").then((response) => {
            this._questions = response.data.results;
        });
    }

    _loadQuestion(){
        if(this._questionTracker !== 9){
        let currentQuestion = this._questions[this._questionTracker];
        this._currentCorrectAnswer = currentQuestion.correct_answer;
        console.log("Current answer: ", this._currentCorrectAnswer);
        this._players.forEach(s => s.emit("loadQuestion", currentQuestion));
        this._questionTracker++;
        }else{
            this._addMatchHistory();
            this._allocateBetToWinner();
            console.log("Game finish!");
        }
    }

    _initSocketEvents(){
                // Start match for both parties
                this._players.forEach(s => s.emit("match", "Match found"));

                this._players.forEach(s => s.on("finish", () => {
                    this._addMatchHistory();
                    this._allocateBetToWinner();
                    console.log("Game finish!");
                }));

                // Capture player ready match
                this._players.forEach(s => s.on("ready", () => {
                    this._confirmation += 1;
                    if(this._confirmation == 2){
                        this._confirmation = 0;
                        this._loadQuestion();
                    }
                }));
        
                // Capture player ready match
                this._players.forEach((s, index) => s.on("submit-answer", (answer) => {
                    this._playerAnswer[index][0] = answer;
        
                    if(answer == this._currentCorrectAnswer){
                        this._playerAnswer[index][1] = "correct";
                        let curscore = this._playerScore[index] + 1;
                        this._playerScore[index] = curscore;
                        console.log(this._playerScore[index]);
                    }
        
                    switch(index){
                        case 0:
                            this._players[0].emit("answer-update", "waiting");
                            this._players[1].emit("answer-update", "answering"); 
                        break;
                        case 1:
                            this._players[1].emit("answer-update", "waiting");
                            this._players[0].emit("answer-update", "answering"); 
                        break;
                    }
        
                    // if they both send a answer
                    if(this._playerAnswer[0][0] !== "" && this._playerAnswer[1][0] !== ""){
                        this._players[0].emit("answer-update", "Submitted");
                        this._players[1].emit("answer-update", "Submitted");
        
                        this._players.forEach((s, index) => {
                            let userAnswer = "";
                            let opponentAnswer = "";
                            let userStatus = "";
                            let opponentStatus = "";
        
                            let userScore = 0;
                            let opScore = 0;
        
                            switch(index){
                                case 0:
                                    userAnswer = this._playerAnswer[0][0];
                                    opponentAnswer = this._playerAnswer[1][0];
                                    userStatus = this._playerAnswer[0][1];
                                    opponentStatus = this._playerAnswer[1][1];
        
                                    userScore = this._playerScore[0];
                                    opScore = this._playerScore[1];
                                break;
                                case 1:
                                    userAnswer = this._playerAnswer[1][0];
                                    opponentAnswer = this._playerAnswer[0][0];
                                    userStatus = this._playerAnswer[1][1];
                                    opponentStatus = this._playerAnswer[0][1];
        
                                    userScore = this._playerScore[1];
                                    opScore = this._playerScore[0];
                                break;
                            }
        
                            s.emit("next-question", {userAnswer: userAnswer, userStatus: userStatus, opponentAnswer: opponentAnswer, opponentStatus:opponentStatus});
                            s.emit("update-scores", {userScore: userScore, opScore:opScore});
                        });
        
                        this._playerAnswer[0][0] = "";
                        this._playerAnswer[1][0] = "";
                    }
        
                }));
    }

    async _initContract(){
        // The Contract interface
        var contractABI = fs.readFileSync('config/contractABI.txt', 'utf8');
        // The Contract Address
        var contractADDRESS = fs.readFileSync('config/contractAddress.txt', 'utf8');

        let url = "http://127.0.0.1:7545";
        let provider = new ethers.providers.JsonRpcProvider(url);

        let privateKey = '0xd5d3e69ed932fdad3bf67cceea14b03fc051ccfb12a6b5558d9ab78dc02b84d7';
        let wallet = new ethers.Wallet(privateKey, provider);

        this._contract = new ethers.Contract(contractADDRESS, contractABI, provider);

        this._contractWithSigner = this._contract.connect(wallet);

        // // Connect to the network
        // //let provider = ethers.getDefaultProvider();

        // // To connect to a custom URL:
        // let url = "http://127.0.0.1:7545";
        // let provider = new ethers.providers.JsonRpcProvider(url);

        // //let provider = new ethers.providers.Web3Provider(web3.currentProvider);

        // // The address from the above deployment example
        // let contractAddress = "0xde96d687586e4a5169929dcd2993aac3b9c4ddfb";

        // // We connect to the Contract using a Provider, so we will only
        // // have read-only access to the Contract
        // this._contract = new ethers.Contract(contractAddress, abi, provider);

    }

    async _makeMatch(){
        let match = await this._contractWithSigner.MakeMatch(this._bet,this._matchID);
        console.log("Total Bet " , this._bet);
        console.log("Match created", JSON.stringify(match));
        console.log("Match ID", this._matchID);
    }

    async _allocateBetToWinner(){
        var options = { gasPrice: 1000000000, gasLimit: 85000};
        let winner = await this._contractWithSigner.allocateBetToWinner(this._playerAddress[0],this._matchID, options);
        console.log(winner);
    }

    async _addMatchHistory(){

        let winnerScore,loserScore,winnerAddress,loseAddress;

        if(this._playerScore[0] > this._playerScore[1]){
            loserScore = this._playerScore[1];
            loseAddress = this._playerAddress[1];
            winnerScore = this._playerScore[0];
            winnerAddress = this._playerAddress[0];
        }else{
            winnerScore = this._playerScore[1];
            winnerAddress = this._playerAddress[1];
            loserScore = this._playerScore[0];
            loseAddress = this._playerAddress[0];
        }

        let history = await this._contractWithSigner.addMatchHistory(
            this._bet,
            winnerScore,
            loserScore,
            10,
            winnerAddress,
            loseAddress,
            "Sept 29, 2018"
            );

        console.log("History created", JSON.stringify(history));
    }

}

module.exports = GameManager;