textConverter = require('textConversion');

const apiurl = "http://danielrutz.de:3000/api";

window.onload = function startup(){

    loadlobbys();
    testbuild();

}

//test function vor message html build
function testbuild(){
    //informationen die man vom server bekommen müsste
    var usernameS = "test";
    var timeS = "ztest";
    var textS = "texttest";
    var whoS = "self"; //irgendwie bestimmen ob die nachricht von dir oder jemand anderem ist

    var chatlogs = document.getElementById("chatlogs"); //chat container element

    //build element (normal looped für alle nachrichten anfangen mit der ältesten)
    var divchat = document.createElement("div");
    divchat.className = "chat self";
    var pchat = document.createElement("p");
    pchat.className = "chat-message";
    pchat.innerHTML = '<br>'+textS;
    var sname = document.createElement("span");
    sname.className = "username";
    sname.innerHTML = usernameS;
    var szeit = document.createElement("span");
    szeit.className = "time";
    szeit.innerHTML = timeS;
    divchat.appendChild(pchat);
    pchat.insertBefore(szeit,pchat.firstChild);
    pchat.insertBefore(sname,pchat.firstChild);

    chatlogs.appendChild(divchat);

    //scrolldown
    chatlogs.scrollTop = chatlogs.scrollHeight;

}


function sendtext(){
    var text = document.getElementById("textinput").value;
    console.log(text);




    
    //TODO regex and emoticons (here or do loadmessages after and also load your text)
}


function loadlobbys(){
    var roomurl = apiurl + "/chats";

    //request object TODO authenticaon not hardcoded/localstorage
    var roomrequest = new Request(roomurl, {
        method: 'GET',
        headers: {
            'Authorization': 'Basic ' + btoa('dhbw:dhbw-pw')
        }

    });

    //TODO filter lobby only for our lobbys
    fetch(roomrequest)
        .then(function(resp) {
            return resp.json();
        })
        .then(function (data){

            data.forEach(function(item){
                var divbutton = document.createElement("div");
                divbutton.className = "lobby";
                var newbutton = document.createElement("button");
                newbutton.className = "lobbyname";
                newbutton.onclick = function () {switchlobby(this.innerHTML)};
                newbutton.innerHTML = item;
                divbutton.appendChild(newbutton);
                document.getElementById("lobbylogs").appendChild(divbutton);
            })
            switchlobby(data[0]);

        })
        .catch(function(error) {
            console.log("Error in loadlobbys:"+error);
        });



}



function  switchlobby(name){

    //Html element anpassen
    var lobbyA = document.getElementsByClassName("lobbyname")
    for(var i=0; i<lobbyA.length;i++){
        lobbyA[i].style.backgroundColor = "#F2D769";
        if(lobbyA[i].innerHTML == name){
            var element = lobbyA[i];
        }
    }
    element.style.backgroundColor = "#E0C65B";
    document.getElementById("chatheader").innerHTML = name;

    //TODO lade alle nachrichten, lade alle user


}



