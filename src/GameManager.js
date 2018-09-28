class GameManager {

    constructor(p1,p2){
        this._p1 = p1;
        this._p2 = p2;

        [this._p1, this._p2].forEach(s => s.emit("match", "Match found"));
    }

}

module.exports = GameManager;