let axios = require("axios");

class GameManager {

    constructor(p1,p2,bet){
        this._players = [p1,p2];
        this._questions = [];
        this._questionTracker = 0;
        this._confirmation = 0;
        this._currentCorrectAnswer;
        this._bet = bet;
        this._playerAnswer = [["","wrong"],["","wrong"]];
        this._playerScore = [0,0];

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

}

module.exports = GameManager;