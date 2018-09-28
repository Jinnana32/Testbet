$(document).ready(function() {

  let socket = null;

  var userAddress;
  var contractAbi,
      contractAddress,
      contract;

      
  initWeb3();
  initContract();

  /*
  ==============================================================================
                   WEB3 AND CONTRACT INSTANCE INITIALIZATION
  ==============================================================================
  */

  function initContract(){
    $.get('contractABI.txt', function(data){
            var abi = jQuery.parseJSON(data);
            contractAbi = web3.eth.contract(abi);
            $.get('contractAddress.txt', function(address){
                contractAddress = address;
                contract = contractAbi.at(contractAddress);

                checkIfPlayerExist();

                loadProfile();
            }, "text");
    }, "text");
  }

  function initWeb3(){
    if (typeof web3 !== "undefined") {
        web3 = new Web3(web3.currentProvider);
        userAddress = web3.eth.defaultAccount;


    }
  }

  /*
  ==============================================================================
                          CONTRACT INTERACTION LOGICS
  ==============================================================================
  */

  function checkIfPlayerExist(){
    contract.playerExist(userAddress, function(err, res){
      if(err !== null){
        alert("Something went wrong refresh the page.");
      }else{
        if(!res) document.location.href = "/account";
      }
    })
  }

  function loadProfile(){
    contract.getPlayerInfo(userAddress, function(err,res){
      if(err !== null){
        alert("Something went wrong refresh the page.");
      }else{
        $(".acc_name").text(res[0]);
        $("#acc_address").text(userAddress);
        $("#acc_rank").text(res[1]);
        console.log(res[0]);
      }
    });
  }


   /*
  ==============================================================================
                            UI MANIPULATION LOGICS
  ==============================================================================
  */

  // Init Materials components
  $(".tabs").tabs();
  $(".collapsible").collapsible();
  $(".flippers").flip({ axis: "x", trigger: "manual" });
  $('select').formSelect();

  // Find Match
  let findMatchBtn = $("#find-match");
  findMatchBtn.click(() => {

    // Init socket IO
    socket = io.connect('http://localhost:3000');

    socket.emit('find match', {address: userAddress, bet: $(".bet_options").val()});
    $(".flippers").flip(true);

    socket.on("match", function(data){
      $("#cancel-match").attr("disabled", "disabled");
      console.log(data);
    });

  });

  // Cancel Match
  let cancelmatchBtn = $("#cancel-match");
  cancelmatchBtn.click(() => {
    socket.disconnect();
    $(".flippers").flip(false);
  });

     /*
  ==============================================================================
                            SOCKET IO LOGICS
  ==============================================================================
  */



});
