
function Users(){}

Users.prototype.register = async function(username,password,address){
    let data = {username: username, password: password, address: address};
    let url = "/user/register";

    let message = this.request(url, data, "POST");
    return message;
}

Users.prototype.request = async function(url, data, type){
    const result = await $.ajax({
        url: url,
        type: type,
        data: data
    });

    return result;
}