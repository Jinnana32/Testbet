pragma solidity ^0.4.0;

contract TestBetManager {
    
    address owner;
    
    mapping(address => Player) public playerInfo;
    mapping(uint => uint) pending_bets;
    
    modifier validateBalance(uint amount) {
        require(address(this).balance > 0);
        require(address(this).balance >= amount);
        _;
    }

    // Save player address for checking
    address[] public players;
    uint[] public bets;
    
    struct Player {
        string name;
        string rank;
        Match[] matches;
    }
    
    struct Match {
        uint256 bet;
        uint256 score;
        uint256 totalQuestion;
        address winner;
        address loser;
        string date_created;
        Quiz[] quizes;
    }
    
    struct Quiz {
        string question;
        string correctAnswer;
        string choice1;
        string choice2;
        string choice3;
    }
    
    constructor() public{
        owner = msg.sender;
    }
    
    /*
    ===========================
          Player Functions
    ===========================
    */
    
    // adds new player
    function addNewPlayer(string _name, address _playerAddress) public returns(bool){
        
        for(uint256 i = 0; i < getPlayerLength(); i++){
            if(players[i] == _playerAddress){
                return false;
            }
        }
        
        playerInfo[_playerAddress].name = _name;
        playerInfo[_playerAddress].rank = "Newbie";
        players.push(_playerAddress);
        
        return true;

    }
    
    function playerExist(address _playerAddress) public view returns(bool){
        for(uint256 i = 0; i < getPlayerLength(); i++){
            if(players[i] == _playerAddress){
                return true;
            }
        }
        
        return false;
    }
    
    function getPlayerInfo(address _playerAddress) public view 
    returns(string _name,
            string _rank,
            uint256 _matches)
    {
        _name = playerInfo[_playerAddress].name;
        _rank = playerInfo[_playerAddress].rank;
        _matches = playerInfo[_playerAddress].matches.length;
    }
    
    function getPlayerMatchHistory(address _playerAddress, uint index) public view 
    returns(uint256 bet,
            uint256 score,
            uint256 totalQuestion,
            address winner,
            address loser,
            string date_created)
    {
        
        Match cm = playerInfo[_playerAddress].matches[index];
        bet = cm.bet;
        score = cm.score;
        totalQuestion = cm.totalQuestion;
        winner = cm.winner;
        loser = cm.loser;
        date_created = cm.date_created;
    }
    
    function getMatchQuestions(address _playerAddress, uint matchIndex, uint quizIndex) public view 
    returns(string question,
            string correctAnswer,
            string choice1,
            string choice2,
            string choice3)
    {
        Match cm = playerInfo[_playerAddress].matches[matchIndex];
        Quiz qz = cm.quizes[quizIndex];
        
        question = qz.question;
        correctAnswer = qz.correctAnswer;
        choice1 = qz.choice1;
        choice2 = qz.choice2;
        choice3 = qz.choice3;
    }
    
    /*
    ===========================
         Match Functions
    ===========================
    */
    
    // Send bet to contract
    function placeBet() public payable{}
    
    // Start match by saving the total bet
    function MakeMatch(uint _bet, uint _uuid) public returns(uint id){
        pending_bets[_uuid] = _bet;
        bets.push(_uuid);
       return _uuid;
    }
    
    function allocateBetToWinner(address _winner, uint _uuid) public validateBalance(amount){
        uint amount = pending_bets[_uuid];
         if(!_winner.send(amount)){
           throw;
         }    
    }
    
    /*
    ===========================
         Helper Functions
    ===========================
    */
    
    function getPlayerLength() public view returns(uint256 length){
        length = players.length;
    }
    
}