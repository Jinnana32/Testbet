    
function Users(){
    this.loginUrl = "/user/login";
    this.regUrl = "/user/register";
}

Users.prototype.register = async function(username,password,address){
    let data = {username: username, password: password, address: address};
    let result = await this.request(this.regUrl, data, "POST");

    return result;
}

Users.prototype.login = async function(username,password,address){
    let data = {username: username, password: password, address: address};
    let result = await this.request(this.loginUrl, data, "POST");
    return result;
}

Users.prototype.request = async function(url, data, type){
    const result = await $.ajax({
        url: url,
        type: type,
        data: data
    });

    return result;
}