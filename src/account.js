$(document).ready(function(){

    var btnCreateAccount = $(".create-account");

    var userAddress;
    var contractAbi,
        contractAddress,
        contract;

    initWeb3();

    /*
    ==============================================================================
                   WEB3 AND CONTRACT INSTANCE INITIALIZATION
    ==============================================================================
    */

    function initWeb3(){
        if (typeof web3 !== "undefined") {
          web3 = new Web3(web3.currentProvider);
          userAddress = web3.eth.defaultAccount;
          initContract();
        }
    }

    function initContract(){
        $.get('contractABI.txt', function(data){
                var abi = jQuery.parseJSON(data);
                contractAbi = web3.eth.contract(abi);
                $.get('contractAddress.txt', function(address){
                    contractAddress = address;
                    contract = contractAbi.at(contractAddress);

                    checkIfPlayerExist();
                }, "text");
        }, "text");
    }

    
  /*
  ==============================================================================
                          CONTRACT INTERACTION LOGICS
  ==============================================================================
  */

  function addPlayer(name, address){
    contract.addNewPlayer(name,address,{gas: 500000},function(err, res){
      if(err !== null){
        alert("An error occured!");
      }
      document.location.href = "/dashboard";
    });
  }

  function checkIfPlayerExist(){
    contract.playerExist(userAddress, {gas: 30000}, function(err, res){
      if(err !== null){
        alert("Something went wrong refresh the page.");
      }else{
        if(res) { 
          document.location.href = "/dashboard";
        }
      }
    })
  }

  /*
  ==============================================================================
                            UI MANIPULATION LOGICS
  ==============================================================================
  */

  btnCreateAccount.click(function(){
     var tbName = $("#testbet_name").val();
     console.log(userAddress);
     addPlayer(tbName, userAddress);
  });


});