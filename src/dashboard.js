$(document).ready(function() {

  let socket = null;
  let bet = 5;

  // Init Materials components
  $(".tabs").tabs();
  $(".collapsible").collapsible();
  $(".flippers").flip({ axis: "x", trigger: "manual" });

  // Find Match
  let findMatchBtn = $("#find-match");
  findMatchBtn.click(() => {

    socket = io.connect('http://192.168.22.5:3000');
    let userAddress = web3.eth.defaultAccount;
    
    socket.emit('find match', {address: userAddress, bet: bet});

    $(".flippers").flip(true);
    
  });

  // Cancel Match
  let cancelmatchBtn = $("#cancel-match");
  cancelmatchBtn.click(() => {
    socket.disconnect();
    $(".flippers").flip(false);
  });
});
