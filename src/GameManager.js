let axios = require("axios");

class GameManager {

    constructor(p1,p2){
        this._players = [p1,p2];
        this._questions = [];
        this._questionTracker = 0;
        this._confirmation = 0;

        // Start match for both parties
        this._players.forEach(s => s.emit("match", "Match found"));

        // Capture player ready match
        this._players.forEach(s => s.on("ready", () => {
            this._confirmation += 1;
            if(this._confirmation == 2){
                this._loadQuestion();
            }
        }));

        // Load Questions
        this._fetchQuestion();
    }

    _fetchQuestion(){
        axios.get("https://opentdb.com/api.php?amount=10").then((response) => {
            this._questions = response.data.results;
        });
    }

    _loadQuestion(){
        let currentQuestion = this._questions[this._questionTracker];
        this._players.forEach(s => s.emit("loadQuestion", currentQuestion));
        this._questionTracker++;
    }

}

module.exports = GameManager;