$(window).ready(function() {
  // Import Users class
  let ss = Users;
  let users = new ss();

  // Metamask Setup
  let metaConnected = $("#metamask-connected");
  let metaDisconnected = $("#metamask-disconnected");
  let metamaskAddress = $("#metamask-address");
  let loginBtn = $("#login-btn");

  // User Account
  let userName = $(".reg_name");
  let userPass = $(".reg_pass");
  let userLogName = $(".log_name");
  let userLogPass = $(".log_pass");
  let userAddress = $(".reg_address");

  // Init buttons
  let registerUser = $("#register-btn");
  let loginUser = $("#loginbtn");

  // Render metamask compatibility
  render();

  // Initialize modal
  $("#register").modal();
  $("#loginModal").modal();

  loginUser.click(async function() {
    let result = await users.login(
      userLogName.val(),
      userLogPass.val(),
      userAddress.val()
    );
    console.log(result);
    if (result.status == "error") {
      M.toast({ html: result.message });
    } else {
      document.location.href = "/dashboard";
    }
    resetFields();
  });

  // Adding users
  registerUser.click(async function() {
    let result = await users.register(
      userName.val(),
      userPass.val(),
      userAddress.val()
    );

    // Toast display
    let toastMessage =
      "<strong>[Message]</strong> - " + "<span> " + result.message + "</span>";
    M.toast({ html: toastMessage, classes: "rounded" });

    // Reset Textfields
    resetFields();
  });
  
  function render() {
    if (typeof web3 !== "undefined") {
      web3 = new Web3(web3.currentProvider);
      metaConnected.css("display", "block");

      let defaultAccount = web3.eth.defaultAccount;

      if (defaultAccount !== undefined) {
        metamaskAddress.html(defaultAccount);
        userAddress.val(defaultAccount);
        toggleLogin("block");
      } else {
        metamaskAddress.html("(Login to your metamask)");
        toggleLogin("none");
      }
    } else {
      metaDisconnected.css("display", "block");
      toggleLogin("none");
    }
  }

  function toggleLogin(toggle) {
    loginBtn.css("display", toggle);
  }

  function resetFields() {
    userName.val("");
    userPass.val("");
    userLogName.val("");
    userLogPass.val("");
  }
});
