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

    let amountToBet = $(".bet_options").val();

    startMatchMaking(amountToBet);

    // contract.placeBet({gas: 50000, value: amountToBet},function(err,res){
    //   if(err !== null) return false;
    // });

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

  function startMatchMaking(amountToBet){
          // Flip cancel button
          $(".flippers").flip(true);

          let yourScore = 0;
          let enemyScore = 0;
          let questionTracker = 1;

          // Init socket IO
          socket = io.connect('http://localhost:3000');
    
          // Initialize start match
          socket.emit('find match', {address: userAddress, bet: amountToBet});
    
          // Listen for match event
          socket.on("match", function(data){
            $("#cancel-match").attr("disabled", "disabled");
            $("#profile_area").css("display", "none");
            $("#start_area").css("display", "block");
            
            // Click listener if player is ready
            $(".readyBtn").click(function(){
              $(".readyBtn").text("Waiting for other players");
              socket.emit("ready");
            });
    
          });
          
          socket.on("loadQuestion", function(results){
            $("#start_area").css("display", "none");
            $("#gaming_area").css("display", "block");
            // Player views of the question
            $(".player_question").html("Question " + questionTracker);
            loadQuestionTemplate(results);
            questionTracker++;

            $(".socketSubmit").click(function(){
                let userAnswer = $('.bet_options').val();
                socket.emit("submit-answer", userAnswer);
            });
          });

          socket.on("answer-update", function(status){
            switch(status){
              case "waiting":
                $("#sub_status").html("Waiting opponent");
              break;
              case "answering":
                $("#sub_status").html("Opponent submmited");
              break;
              case "Submitted":
                $("#sub_status").html("Both Party submitted");
              break;
            }
          });

          socket.on("next-question", function(results){
            $(".socketSubmit").css("display", "none");
            let userAns = results.userAnswer;
            let opAns = results.opponentAnswer;
            let userStats = results.userStatus;
            let opStats = results.opponentStatus;

            if(userStats == "wrong"){
              $(".userAnswer").removeClass("grey").addClass("red");
            }else{
              $(".userAnswer").removeClass("grey").addClass("green");
            }

            if(opStats == "wrong"){
              $(".opponentAnswer").removeClass("grey").addClass("red");
            }else{
              $(".opponentAnswer").removeClass("grey").addClass("green");
            }

            $(".userAnswer").html(userAns);
            $(".opponentAnswer").html(opAns);

          });

          socket.on("update-scores", function(scores){
            alert("score update");
              $(".your_score").html(scores.userScore + "/10");
              $(".opp_score").html(scores.opScore + "/10");
          });

  }

  function loadQuestionTemplate(results){
    //console.log(results);
    let question = results.question;
    let correct_answer = results.correct_answer;
    let wrong_answer = results.incorrect_answers;

    let choices = [correct_answer, wrong_answer[0],wrong_answer[1],wrong_answer[2]];

    var parent = $(".shuffle");
    var lis = parent.children();

    // Question
    $(".quiz_question").html("'" + question + "'");

    // Choices
    $(".item1").html(correct_answer);
    $(".item2").html(wrong_answer[0]);
    $(".item3").html(wrong_answer[1]);
    $(".item4").html(wrong_answer[2]);

    // Shuffle Choices
    while (lis.length) {
      parent.append(lis.splice(Math.floor(Math.random() * lis.length), 1)[0]);
    }

    $(".bet_options").html("");
    console.log(choices);

    // Player select answer
    for(let x = 0; x < choices.length; x++){
      console.log(choices[x]);
      //$(".bet_options").append("hello");
      $(".bet_options").append('<option value="' + choices[x] + '">'+ choices[x] +'</option>');
    }


  }



});
