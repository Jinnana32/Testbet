pragma solidity ^0.4.0;

contract TestBetManager {
    
    address owner;
    
    mapping(address => bool) public playerExist;
    mapping(address => Player) public playerInfo;
    mapping(string => uint) pending_bets;
    
    modifier validateBalance(uint amount) {
        require(address(this).balance > 0);
        require(address(this).balance >= amount);
        _;
    }

    // Save player address for checking
    address[] public players;
    string[] public bets;
    
    struct Player {
        string name;
        string rank;
        Match[] matches;
    }
    
    struct Match {
        uint256 bet;
        uint256 winnerScore;
        uint256 loserScore;
        uint256 totalQuestion;
        address winner;
        address loser;
        string date_created;
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

        if(playerExist[_playerAddress]) return false;
        
        playerInfo[_playerAddress].name = _name;
        playerInfo[_playerAddress].rank = "Newbie";
        players.push(_playerAddress);
        
        playerExist[_playerAddress] = true;

        return true;

    }
     
    function addMatchHistory(
        uint256 bet,
        uint256 winnerScore,
        uint256 loserScore,
        uint256 totalQuestion,
        address winner,
        address loser,
        string date_created
    ) public {
        playerInfo[winner].matches.push(
            Match(bet,winnerScore,loserScore,totalQuestion,winner,loser,date_created)    
        );
        
        playerInfo[loser].matches.push(
            Match(bet,winnerScore,loserScore,totalQuestion,winner,loser,date_created)    
        );
    }
    
    function playerExist(address _playerAddress) public view returns(bool doesPlayerExist){
        doesPlayerExist = playerExist[_playerAddress];
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
            uint256 winnerScore,
            uint256 loserScore,
            uint256 totalQuestion,
            address winner,
            address loser,
            string date_created)
    {
        
        Match cm = playerInfo[_playerAddress].matches[index];
        bet = cm.bet;
        winnerScore = cm.winnerScore;
        loserScore = cm.loserScore;
        totalQuestion = cm.totalQuestion;
        winner = cm.winner;
        loser = cm.loser;
        date_created = cm.date_created;
    }
    
    
    /*
    ===========================
         Match Functions
    ===========================
    */
    
    // Send bet to contract
    function placeBet() public payable{}
    
    // Start match by saving the total bet
    function MakeMatch(uint _bet, string _uuid) public{
        uint amount = convertFinneyToWei(_bet);
        pending_bets[_uuid] = amount;
        bets.push(_uuid);
    }
    
    function allocateBetToWinner(address _winner, string _uuid) public validateBalance(amount){
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
    
    function getBet(string _uuid) public view returns(uint256 bet){
        bet = pending_bets[_uuid];
    }
    
    function convertFinneyToWei(uint finn) public view returns(uint256 wwei){
        wwei = finn * 1000000000000000;
    }
    
}