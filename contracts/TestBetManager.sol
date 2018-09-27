pragma solidity ^0.4.0;

contract BetCollector{
    
    function PlaceBet(uint bet) public payable{}
    function AllocateBet(address winner) public payable{
        winner.transfer(address(this).balance);
    }
    
}

contract TestBetManager {
    
    address owner;
    
    mapping(address => Player) public playerInfo;
    mapping(string => uint) pending_bets;
    mapping(uint => address) betContracts;
    
    modifier validateBalance() {
        require(address(this).balance > 0);
        _;
    }

    // Save player address for checking
    address[] public players;
    
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
    function addNewPlayer(string memory _name, address _playerAddress) public returns(bool){
        
        for(uint256 i = 0; i < getPlayerLength(); i++){
            if(players[i] == _playerAddress){
                return false;
            }
                
        }
        
        playerInfo[_playerAddress].name = _name;
        playerInfo[_playerAddress].rank = "Newbie";
        players.push(msg.sender);
        
        return true;
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
    function placeBet(uint _bet, address _winner) public payable{
     // user is sending nothing so they must want to withdraw
      if (msg.value == 0) {
         withdraw(_bet);
      }
    }
    
    function withdraw(uint _bet) public payable{
        
    }
    
    // Start match by saving the total bet
    function MakeMatch(uint _bet) public  returns(bool){
        uint matchID = uint(block.blockhash(block.number-1));
        
        address matchAddress = new BetCollector();
        betContracts[matchID] = matchAddress;
        
        matchAddress.placeBet(_bet);
    }
    
    function SaveMatchHistory() public validateBalance{
        
    }
    
    // Allocate bet to the winner
    function AllocateBet() public validateBalance{
        
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