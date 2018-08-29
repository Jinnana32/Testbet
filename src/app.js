$(window).ready(function(){

    // Import Users class
    let ss = Users;
    let users = new ss();

    let metaConnected = $('#metamask-connected');
    let metaDisconnected = $('#metamask-disconnected');
    let metamaskAddress = $('#metamask-address');
    let loginBtn = $('#login-btn');

    let userAddress = $("#user_address");
    let registerUser = $("#register-user");

    // Render metamask compatibility
    render();

    // Initialize modal
    $("#register").modal();

    // test adding users
    registerUser.click(function(){
        let message = users.register("hello", "hy","daw");
        console.log(message);
        /*let test = users.addUser("tj coyoca", "Jinnana3232","myaddress");
        if(test){
            console.log("User already exist!");
        }*/

        //console.log("pass");

        //users.authenticate("tj coyoca", "Jinnana3232","myaddress");
    });


    function render(){
        if(typeof web3 !== "undefined"){
            web3 = new Web3(web3.currentProvider);
            metaConnected.css("display", "block");

            let defaultAccount = web3.eth.defaultAccount;

            if(defaultAccount !== undefined){
                metamaskAddress.html(defaultAccount);
                userAddress.val(defaultAccount);
                toggleLogin("block");
            }else{
                metamaskAddress.html("(Login to your metamask)");
                toggleLogin("none");
            }

        }else{
            metaDisconnected.css("display", "block");
            toggleLogin("none");
        }
    }

    function toggleLogin(toggle){
        loginBtn.css("display", toggle);
    }

});