let axios = require("axios");
let ethers = require("ethers");

class GameManager {

    constructor(a1,a2,p1,p2,bet){
        this._players = [p1,p2];
        this._playerAddress = [a1,a2]
        this._questions = [];
        this._questionTracker = 0;
        this._confirmation = 0;
        this._currentCorrectAnswer;
        this._bet = bet;
        this._playerAnswer = [["","wrong"],["","wrong"]];
        this._playerScore = [0,0];

        this._contract = null;

        console.log("Player address: ", JSON.stringify(this._playerAddress));
        console.log("Total bet: " , this._bet);

        // Start match for both parties
        this._players.forEach(s => s.emit("match", "Match found"));

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

        
        // Init Contract
        this._initContract();

        // Load Questions
        this._fetchQuestion();
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
            console.log("Game finish!");
        }
    }

    _initContract(){
        // The Contract interface
        let abi = [
            {
                "constant": true,
                "inputs": [
                    {
                        "name": "",
                        "type": "uint256"
                    }
                ],
                "name": "bets",
                "outputs": [
                    {
                        "name": "",
                        "type": "uint256"
                    }
                ],
                "payable": false,
                "stateMutability": "view",
                "type": "function"
            },
            {
                "constant": true,
                "inputs": [
                    {
                        "name": "",
                        "type": "address"
                    }
                ],
                "name": "playerInfo",
                "outputs": [
                    {
                        "name": "name",
                        "type": "string"
                    },
                    {
                        "name": "rank",
                        "type": "string"
                    }
                ],
                "payable": false,
                "stateMutability": "view",
                "type": "function"
            },
            {
                "constant": true,
                "inputs": [
                    {
                        "name": "_playerAddress",
                        "type": "address"
                    }
                ],
                "name": "getPlayerInfo",
                "outputs": [
                    {
                        "name": "_name",
                        "type": "string"
                    },
                    {
                        "name": "_rank",
                        "type": "string"
                    },
                    {
                        "name": "_matches",
                        "type": "uint256"
                    }
                ],
                "payable": false,
                "stateMutability": "view",
                "type": "function"
            },
            {
                "constant": true,
                "inputs": [],
                "name": "getPlayerLength",
                "outputs": [
                    {
                        "name": "length",
                        "type": "uint256"
                    }
                ],
                "payable": false,
                "stateMutability": "view",
                "type": "function"
            },
            {
                "constant": false,
                "inputs": [
                    {
                        "name": "_name",
                        "type": "string"
                    },
                    {
                        "name": "_playerAddress",
                        "type": "address"
                    }
                ],
                "name": "addNewPlayer",
                "outputs": [
                    {
                        "name": "",
                        "type": "bool"
                    }
                ],
                "payable": false,
                "stateMutability": "nonpayable",
                "type": "function"
            },
            {
                "constant": true,
                "inputs": [
                    {
                        "name": "_playerAddress",
                        "type": "address"
                    },
                    {
                        "name": "matchIndex",
                        "type": "uint256"
                    },
                    {
                        "name": "quizIndex",
                        "type": "uint256"
                    }
                ],
                "name": "getMatchQuestions",
                "outputs": [
                    {
                        "name": "question",
                        "type": "string"
                    },
                    {
                        "name": "correctAnswer",
                        "type": "string"
                    },
                    {
                        "name": "choice1",
                        "type": "string"
                    },
                    {
                        "name": "choice2",
                        "type": "string"
                    },
                    {
                        "name": "choice3",
                        "type": "string"
                    }
                ],
                "payable": false,
                "stateMutability": "view",
                "type": "function"
            },
            {
                "constant": false,
                "inputs": [
                    {
                        "name": "_winner",
                        "type": "address"
                    },
                    {
                        "name": "_uuid",
                        "type": "uint256"
                    }
                ],
                "name": "allocateBetToWinner",
                "outputs": [],
                "payable": false,
                "stateMutability": "nonpayable",
                "type": "function"
            },
            {
                "constant": true,
                "inputs": [
                    {
                        "name": "_playerAddress",
                        "type": "address"
                    },
                    {
                        "name": "index",
                        "type": "uint256"
                    }
                ],
                "name": "getPlayerMatchHistory",
                "outputs": [
                    {
                        "name": "bet",
                        "type": "uint256"
                    },
                    {
                        "name": "score",
                        "type": "uint256"
                    },
                    {
                        "name": "totalQuestion",
                        "type": "uint256"
                    },
                    {
                        "name": "winner",
                        "type": "address"
                    },
                    {
                        "name": "loser",
                        "type": "address"
                    },
                    {
                        "name": "date_created",
                        "type": "string"
                    }
                ],
                "payable": false,
                "stateMutability": "view",
                "type": "function"
            },
            {
                "constant": false,
                "inputs": [
                    {
                        "name": "_bet",
                        "type": "uint256"
                    },
                    {
                        "name": "_uuid",
                        "type": "uint256"
                    }
                ],
                "name": "MakeMatch",
                "outputs": [
                    {
                        "name": "id",
                        "type": "uint256"
                    }
                ],
                "payable": false,
                "stateMutability": "nonpayable",
                "type": "function"
            },
            {
                "constant": true,
                "inputs": [
                    {
                        "name": "",
                        "type": "uint256"
                    }
                ],
                "name": "players",
                "outputs": [
                    {
                        "name": "",
                        "type": "address"
                    }
                ],
                "payable": false,
                "stateMutability": "view",
                "type": "function"
            },
            {
                "constant": false,
                "inputs": [],
                "name": "placeBet",
                "outputs": [],
                "payable": true,
                "stateMutability": "payable",
                "type": "function"
            },
            {
                "constant": true,
                "inputs": [
                    {
                        "name": "_playerAddress",
                        "type": "address"
                    }
                ],
                "name": "playerExist",
                "outputs": [
                    {
                        "name": "",
                        "type": "bool"
                    }
                ],
                "payable": false,
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [],
                "payable": false,
                "stateMutability": "nonpayable",
                "type": "constructor"
            }
        ];

        // Connect to the network
        let provider = ethers.getDefaultProvider();

        // The address from the above deployment example
        let contractAddress = "0xde96d687586e4a5169929dcd2993aac3b9c4ddfb";

        // We connect to the Contract using a Provider, so we will only
        // have read-only access to the Contract
        this._contract = new ethers.Contract(contractAddress, abi, provider);
    }

}

module.exports = GameManager;