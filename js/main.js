const textConverter = require('./textConversion');

const apiurl = "http://danielrutz.de:3000/api";
var username = "user12"; //müssen wir noch irgendwie beim einlogen bekommen


window.onload = function startup() {
    window.chatlogs = document.getElementById("chatlogs");
    window.userbutton = document.getElementById("userlist");

    loadlobbys();
};

 function listuser() {
listofuser.style.width = "25%";
        userbutton.onclick =function () {delistuser();};
        userbutton.style.backgroundColor = "#E0C65B";


        var userurl = apiurl +"/chats/"+document.getElementById("chatheader").innerHTML;

        //Todo authentication not hardcoded
        var userrequest = new Request(userurl, {
            method: 'GET',
            headers: {
                'Authorization': 'Basic ' + btoa('dhbw:dhbw-pw')
            }

        });
        fetch(userrequest)
            .then(function(resp) {
                return resp.json();
            })
            .then(function (data){

                var userarray = [];
                data.forEach(function(item){
                    varusernameS= item.user;

                    if(userarray.indexOf(usernameS) <= -1){
                        userarray.push(usernameS);
                    }
                });

                userarray.sort();
                document.getElementById("listul").innerHTML = "";
                userarray.forEach(function(item){
    var userli = document.createElement("li");
                    userli.innerHTML = item; document.getElementById("listul").appendChild(userli);
                });

            })
            .catch(function(error) {
                console.log("Error in loadlobbys:"+error);
            });


    }
    function delistuser() {
        listofuser.style.width = "0";
        userbutton.onclick = function () { listuser();};
        userbutton.style.backgroundColor = "#F2D769";

    }


    function scrolldown() {chatlogs.scrollTop = chatlogs.scrollHeight;
    }

    function sendtext() {
        console.log("jop");
    }

    function buildmessage(usernameS,textS,timeS){
    var divchat = document.createElement("div");
    if(usernameS == username){
        divchat.className = "chat self";
    }else{
        divchat.className = "chat friend";
    }
    var pchat = document.createElement("p");
    pchat.className = "chat-message";
    pchat.innerHTML = '<br>'+textConverter.applyStyling(textConverter.removeHTML(textS));
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

    }


    function loadmessage(room){

        var messageurl = apiurl +"/chats/"+room;
        chatlogs.innerHTML = "";
        var listdiv = document.createElement("div");
        listdiv.className = "userlist";
        listdiv.id = "userlister";
        var listul = document.createElement("ul");
        listul.id = "listul";
        listdiv.appendChild(listul);
        chatlogs.appendChild(listdiv);
        window.listofuser = document.getElementById("userlister");


        //TODO  authenticaon not hardcoded/localstorage
        var messagerequest = new Request(messageurl, {
            method: 'GET',
            headers: {
                'Authorization': 'Basic ' + btoa('dhbw:dhbw-pw')
            }

        });
        fetch(messagerequest)
            .then(function(resp) {
                return resp.json();
            })
            .then(function (data){
                data.forEach(function(item){
                    var usernameS = item.user;
                    var textS = item.message;

                    var timestamp = new Date(item.timestamp);
                    var h = timestamp.getHours(); var m =timestamp.getMinutes();
                    if(m < 10){ m = "0"+m;}
                    var timeS =  h+":"+m;


                    buildmessage(usernameS,textS,timeS);
                });

                scrolldown();


            })
            .catch(function (error) {
                console.log("Error in loadlobbys:" + error);
            });

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
                    newbutton.onclick = function () {switchlobby(this.innerHTML);};
                    newbutton.innerHTML = item;
                    divbutton.appendChild(newbutton);
                    document.getElementById("lobbylogs").appendChild(divbutton);
                });
                switchlobby(data[0]);

            })
            .catch(function(error) {
                console.log("Error in loadlobbys:"+error);
            });



    }



    function  switchlobby(name){

        //Html element anpassen
        var lobbyA = document.getElementsByClassName("lobbyname");
        for (var i = 0; i < lobbyA.length; i++) {
            lobbyA[i].style.backgroundColor = "#F2D769";
            if (lobbyA[i].innerHTML == name) {
                var element = lobbyA[i];
            }
        }
        element.style.backgroundColor = "#E0C65B";
        document.getElementById("chatheader").innerHTML = name;

        loadmessage(name);
        //TODO lade alle nachrichten, lade alle user


    }



