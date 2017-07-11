const textConverter = require('./textConversion');
const apiurl = "http://danielrutz.de:3000/api";
const updateIntervall = 5000;

let apiUserName = null;
let username = "UNEXPECTED_USERNAME";
let passwordUser = null;

let chatlogs = null;
let textinput = null;
let userbutton = null;

/**
 * Stores the current room displayed to the user
 * @type {String}
 */
let currentRoom = null;
/**
 * This stores the
 * @type {{room:{
 *      messages:[String]
 *      lastSeenLength:{number}
 * }}}
 */
let messageStorage = {};

let clockUpdate = null;

window.onload = function startup() {
    chatlogs = document.getElementById("chatlogs");
    userbutton = document.getElementById("userlist");
    textinput = document.getElementById("textinput");

    let switcher = 0;
    userbutton.addEventListener("click", function () {

        if (switcher == 0) {
            listuser();
            switcher = 1;
        } else {
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
    //function um die größe richtig zu machen
    window.addEventListener('resize', function () {
        if (document.getElementById("login") != null) {
            let d = document.getElementById("topbar").offsetHeight;
            let e = document.getElementById("mainM").offsetHeight;
            let a = document.getElementById("sideM").offsetWidth;
            let b = document.getElementById("mainM").offsetWidth;
            let s = d + e;
            let r = a + b;
            document.getElementById("login").style.width = r + "px";
            document.getElementById("login").style.height = s + "px";
        } else {
            let a = document.getElementById("sideM").offsetWidth;
            let b = document.getElementById("mainM").offsetWidth;
            let r = a + b;
            document.getElementById("topbar").style.width = r + "px";
        }
    });

    document.getElementById("submitLog").addEventListener("click", function () {
        let name = document.getElementById("name").value;
        const password = document.getElementById("password").value;
        let last4 = name.slice(-4);
        name = name.slice(0, -4);
        if (name != "" && last4 == "dhbw" && password == "dhbw-pw") {
            let logindiv = document.getElementById("login");
            logindiv.parentNode.removeChild(logindiv);

            apiUserName = last4;
            passwordUser = password;
            username = name;

            loadlobbys();
        } else {
            alert("Wrong credentials!");
        }
    });
};

/**
 * Scrolls down the chat that is currently shown
 */
function scrolldown() {
    chatlogs.scrollTop = chatlogs.scrollHeight;
}

/**
 * Generates the value vor the basic authorisation.
 *
 * @return {string}
 */
function getBasicAuthHeader() {
    return 'Basic ' + btoa(apiUserName + ':' + passwordUser);
}

/**
 * Generates the message from the object the api has produced
 * @param {{user:{String}, message:{String}, timestamp:{number}}} item
 */
function buildMessageFromAPI(item) {
    const usernameS = item.user;
    const textS = item.message;

    const timestamp = new Date(item.timestamp);
    let h = timestamp.getHours();
    let m = timestamp.getMinutes();
    if (m < 10) {
        m = '0' + m;
    }
    if (h < 10) {
        h = '0' + m;
    }
    let timeS = h + ":" + m;

    buildmessage(usernameS, textS, timeS);
}

/**
 * Build a message and adds it to the DOM in the current displayed chat.
 *
 * Should be called by buildMessageFromAPI()
 *
 * @param {String} usernameS
 * @param {String} textS
 * @param {String} timeS
 */
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

/**
 * Send the text that is in the text field "textinput"
 */
function sendtext() {
    const chatMessage = textinput.value;
    const storedCurrentRoom = currentRoom; //store the current Room to not be changed by the user while request ist running
    if (chatMessage != '') {
        const messageurl = apiurl + "/chats/" + storedCurrentRoom;
        const messagerequest = new Request(messageurl, {
            method: 'POST',
            headers: {
                'Authorization': 'Basic ' + btoa('dhbw:dhbw-pw'),
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "roomID": currentRoom,
                "user": username,
                "message": textinput.value
            })
        });
        fetch(messagerequest)
            .then(function (resp) {
                return resp.json();
            })
            .then(function (data) {
                messageStorage[storedCurrentRoom].messages = data;
                updateSreenData();
                scrolldown();
            })
            .catch(function (error) {
                console.error("Error in sending message:" + error);
            });
    }
}

/**
 * Resets the currently shown chatlog and displays the room specified
 * @param {String} room
 */
function displayAllMessages(room) {
    currentRoom = room;
    chatlogs.innerHTML = "";
    let listdiv = document.createElement("div");
    listdiv.className = "userlist";
    listdiv.id = "userlister";
    let listul = document.createElement("ul");
    listul.id = "listul";
    listdiv.appendChild(listul);
    chatlogs.appendChild(listdiv);

    messageStorage[room].lastSeenLength = messageStorage[room].messages.length;
    messageStorage[room].messages.forEach(buildMessageFromAPI);
    scrolldown();

    updateSreenData();
}

/**
 * updates the ScreenData for the currentRoom displayed and the unread messages Counter.
 * This is done with the data provided in messageStorage
 */
function updateSreenData() {
    let lobbyA = document.getElementsByClassName("lobbyname");

    if (currentRoom === null) {
        throw new Error('Could not display null room');
    }

    for (let i = 0; i < lobbyA.length; i++) {
        if (messageStorage[lobbyA[i].innerHTML] === undefined) {
            continue;
        }

        if (lobbyA[i].innerHTML === currentRoom) {
            for (let j = messageStorage[lobbyA[i].innerHTML].lastSeenLength; j < messageStorage[lobbyA[i].innerHTML].messages.length; j++) {
                buildMessageFromAPI(messageStorage[lobbyA[i].innerHTML].messages[j]);
            }
            messageStorage[lobbyA[i].innerHTML].lastSeenLength = messageStorage[lobbyA[i].innerHTML].messages.length;
        } else {
            lobbyA[i].parentNode.childNodes[1].innerHTML = messageStorage[lobbyA[i].innerHTML].messages.length - messageStorage[lobbyA[i].innerHTML].lastSeenLength;
        }
    }
}

/**
 * Updates the messages stored for this room and
 * @param room
 * @param data
 */
function updateRoomMessages(room, data) {
    if (messageStorage[room] === undefined) {
        messageStorage[room] = {
            messages: data,
            lastSeenLength: 0
        };
    } else {
        messageStorage[room].messages = data;
    }
    if (currentRoom === null) {
        switchlobby(room);
    }

    updateSreenData();
}
/**
 * Requests the messages for the specified room and stores it in to messageStorage
 * @param room
 */
function loadmessage(room) {
    let messageurl = apiurl + "/chats/" + room;

    let messagerequest = new Request(messageurl, {
        method: 'GET',
        headers: {
            'Authorization': getBasicAuthHeader()
        }
    });
    fetch(messagerequest)
        .then(function (resp) {
            return resp.json();
        })
        .then(function (data) {
            updateRoomMessages(room, data);
        })
        .catch(function (error) {
            console.error("Error in loadlobbys:" + error);
        });
}

/**
 * Opens the side menu which displays a lisst of users
 * request all users of the current lobby and displays them
 * changes the color of the button to open the side menu to "selected" color
 * */
function listuser() {
    document.getElementById("userlister").style.width = "25%";
    userbutton.style.backgroundColor = "#E0C65B";

    let userurl = apiurl + "/chats/" + document.getElementById("chatheader").innerHTML;

    let userrequest = new Request(userurl, {
        method: 'GET',
        headers: {
            'Authorization': getBasicAuthHeader()
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
            console.error("Error in loadlobbys:" + error);
        });
}

/**
 * Closes the side menu which displays all users
 * changes the color of the button to open the side menu back to normal
 */
function delistuser() {
    document.getElementById("userlister").style.width = "0";
    userbutton.style.backgroundColor = "#F2D769";
}

/**
 * Loads all lobbys form the API and updates the data stored in the messageStorage for every room
 */
function loadlobbys() {
    if (clockUpdate === null) {
        clockUpdate = setInterval(loadlobbys, updateIntervall);
    }

    let roomurl = apiurl + "/chats";

    //request object
    let roomrequest = new Request(roomurl, {
        method: 'GET',
        headers: {
            'Authorization': getBasicAuthHeader()
        }
    });

    fetch(roomrequest)
        .then(function (resp) {
            return resp.json();
        })
        .then(function (data) {
            document.getElementById('lobbylogs').innerHTML = '';
            data.forEach(function (item) {
                const divbutton = document.createElement('div');
                divbutton.className = 'lobby';

                const newbutton = document.createElement('button');
                newbutton.className = 'lobbyname';
                newbutton.onclick = function () {
                    switchlobby(this.innerHTML);
                };
                newbutton.innerHTML = item;

                const unreadMessageSpan = document.createElement('span');
                unreadMessageSpan.className = 'lobbyMessagesUnread';
                unreadMessageSpan.innerHTML = '0';

                divbutton.appendChild(newbutton);
                divbutton.appendChild(unreadMessageSpan);
                document.getElementById('lobbylogs').appendChild(divbutton);
                loadmessage(item);
            });
        })
        .catch(function (error) {
            console.error("Error in loadlobbys:" + error);
        });
}

/**
 * Switches to the specified lobby thus removing all currently displayed messages and displaying the new ones
 * @param {String} name
 */
function switchlobby(name) {
    //Html element anpassen
    let lobbyA = document.getElementsByClassName("lobbyname");
    let element;
    for (let i = 0; i < lobbyA.length; i++) {
        lobbyA[i].style.backgroundColor = "#F2D769";
        if (lobbyA[i].innerHTML === name) {
            element = lobbyA[i];
        }
    }
    element.style.backgroundColor = "#E0C65B";
    document.getElementById("chatheader").innerHTML = name;

    displayAllMessages(name);
}



