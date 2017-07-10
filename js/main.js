const textConverter = require('./textConversion');

const apiurl = "http://danielrutz.de:3000/api";
let username = "user12"; //müssen wir noch irgendwie beim einlogen bekommen
let chatlogs = null;
let userbutton = null;

window.onload = function startup() {
    chatlogs = document.getElementById("chatlogs");
    userbutton = document.getElementById("userlist");
    loadlobbys();
    let switcher = 0;

    userbutton.addEventListener("click", function () {

        if (switcher == 0) {
            console.log("test");
            listuser();
            switcher = 1;
        } else {
            console.log("test2");
            delistuser();
            switcher = 0;
        }
    });
    document.getElementById("scroll").addEventListener("click", function () {
        scrolldown();
    });
    document.getElementById("textsend").addEventListener("click", function () {
        sendtext();
    });


};


function scrolldown() {
    chatlogs.scrollTop = chatlogs.scrollHeight;
}

function sendtext() {
    console.log("jop");
}

function buildmessage(usernameS, textS, timeS) {
    let divchat = document.createElement("div");
    if (usernameS == username) {
        divchat.className = "chat self";
    } else {
        divchat.className = "chat friend";
    }
    let pchat = document.createElement("p");
    pchat.className = "chat-message";
    pchat.innerHTML = '<br>' + textConverter.applyStyling(textConverter.removeHTML(textS));
    let sname = document.createElement("span");
    sname.className = "username";
    sname.innerHTML = usernameS;
    let szeit = document.createElement("span");
    szeit.className = "time";
    szeit.innerHTML = timeS;
    divchat.appendChild(pchat);
    pchat.insertBefore(szeit, pchat.firstChild);
    pchat.insertBefore(sname, pchat.firstChild);
    chatlogs.appendChild(divchat);

}


function loadmessage(room) {

    let messageurl = apiurl + "/chats/" + room;
    chatlogs.innerHTML = "";
    let listdiv = document.createElement("div");
    listdiv.className = "userlist";
    listdiv.id = "userlister";
    let listul = document.createElement("ul");
    listul.id = "listul";
    listdiv.appendChild(listul);
    chatlogs.appendChild(listdiv);


    //TODO  authenticaon not hardcoded/localstorage
    let messagerequest = new Request(messageurl, {
        method: 'GET',
        headers: {
            'Authorization': 'Basic ' + btoa('dhbw:dhbw-pw')
        }

    });
    fetch(messagerequest)
        .then(function (resp) {
            return resp.json();
        })
        .then(function (data) {
            data.forEach(function (item) {
                let usernameS = item.user;
                let textS = item.message;

                let timestamp = new Date(item.timestamp);
                let h = timestamp.getHours();
                let m = timestamp.getMinutes();
                if (m < 10) {
                    m = "0" + m;
                }
                let timeS = h + ":" + m;


                buildmessage(usernameS, textS, timeS);
            });

            scrolldown();


        })
        .catch(function (error) {
            console.log("Error in loadlobbys:" + error);
        });

}


function listuser() {
    document.getElementById("userlister").style.width = "25%";
    userbutton.style.backgroundColor = "#E0C65B";


    let userurl = apiurl + "/chats/" + document.getElementById("chatheader").innerHTML;

    //Todo authentication not hardcoded
    let userrequest = new Request(userurl, {
        method: 'GET',
        headers: {
            'Authorization': 'Basic ' + btoa('dhbw:dhbw-pw')
        }

    });
    fetch(userrequest)
        .then(function (resp) {
            return resp.json();
        })
        .then(function (data) {

            let userarray = [];
            data.forEach(function (item) {
                let usernameS = item.user;

                if (userarray.indexOf(usernameS) <= -1) {
                    userarray.push(usernameS);
                }
            });

            userarray.sort();
            document.getElementById("listul").innerHTML = "";
            userarray.forEach(function (item) {
                let userli = document.createElement("li");
                userli.innerHTML = item;
                document.getElementById("listul").appendChild(userli);
            });

        })
        .catch(function (error) {
            console.log("Error in loadlobbys:" + error);
        });


}
function delistuser() {
    document.getElementById("userlister").style.width = "0";
    userbutton.style.backgroundColor = "#F2D769";

}


function loadlobbys() {
    let roomurl = apiurl + "/chats";

    //request object TODO authenticaon not hardcoded/localstorage
    let roomrequest = new Request(roomurl, {
        method: 'GET',
        headers: {
            'Authorization': 'Basic ' + btoa('dhbw:dhbw-pw')
        }

    });

    fetch(roomrequest)
        .then(function (resp) {
            return resp.json();
        })
        .then(function (data) {

            data.forEach(function (item) {
                let divbutton = document.createElement("div");
                divbutton.className = "lobby";
                let newbutton = document.createElement("button");
                newbutton.className = "lobbyname";
                newbutton.onclick = function () {
                    switchlobby(this.innerHTML);
                };
                newbutton.innerHTML = item;
                divbutton.appendChild(newbutton);
                document.getElementById("lobbylogs").appendChild(divbutton);
            });
            switchlobby(data[0]);

        })
        .catch(function (error) {
            console.log("Error in loadlobbys:" + error);
        });


}


function switchlobby(name) {

    //Html element anpassen
    let lobbyA = document.getElementsByClassName("lobbyname");
    let element;
    for (let i = 0; i < lobbyA.length; i++) {
        lobbyA[i].style.backgroundColor = "#F2D769";
        if (lobbyA[i].innerHTML == name) {
            element = lobbyA[i];
        }
    }
    element.style.backgroundColor = "#E0C65B";
    document.getElementById("chatheader").innerHTML = name;

    loadmessage(name);
    //TODO lade alle nachrichten, lade alle user


}



