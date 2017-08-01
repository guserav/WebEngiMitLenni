/**
 *
 * @type {[{regex:regex, url:String, alt:String}]}
 */
const emojis = [
    {regex: /:\)/g, url: 'TODO', alt: 'Smiling Face'},
    {regex: /:\)/g, url: 'TODO', alt: 'Smiling Face'},
    {regex: /:\)/g, url: 'TODO', alt: 'Smiling Face'},
    {regex: /:\)/g, url: 'TODO', alt: 'Smiling Face'},
    {regex: /:\)/g, url: 'TODO', alt: 'Smiling Face'},
    {regex: /:\)/g, url: 'TODO', alt: 'Smiling Face'},
    {regex: /:\)/g, url: 'TODO', alt: 'Smiling Face'},
    {regex: /:\)/g, url: 'TODO', alt: 'Smiling Face'}
];

/**
 * Contains all functions related to String conversion
 *
 * @type {{applyStyling: function(String), removeHTML: function(String), replaceEmojis: function(String)}}
 */
const textConverter = {
    /**
     * Gets a String of input and converts it to html by the rules of our styling it also adds line breaks to the message
     * TODO add documentation for users and for Gerrit
     * *text* gets wrapped in a span: <span class="emphasis" />
     * ~text~ gets wrapped in a span: <span class="strike" />
     * _text_ gets wrapped in a span: <span class="italic" />
     *
     * # prefixed lines into heading of form <span class="heading hX">text</span>
     *
     * --- or *** or * * *  or - - - into a horizontal line
     *
     * `text` wrapped in span: <span class="codeInLine" />
     * if there is a odd number of ` than there is a ` imagined at the end of the line
     *
     * > formats the following line as quote: <span class="quote" />
     *
     *  ```
     *  block
     *  ```
     *  wrapped in to <p class="codeBlock">block</p>
     *
     *  everything in a code block is not formatted with the rules above
     *
     * @param {String} string
     * @returns {String}
     */
    applyStyling: function (string) {
        let lines = string.split(/\n/);
        let result = '';
        let inCodeBlock = false;
        let quoteLevel = 0;
        for (let i = 0; i < lines.length; i++) {
            if (/^((&gt;)*) ?```$/.test(lines[i])) {
                if (!inCodeBlock) {//start Code block
                    result += '<p class="codeBlock">';
                } else {//end Code block
                    result += '</p>';
                }
                inCodeBlock = !inCodeBlock;
            } else {
                if (inCodeBlock) {
                    result += lines[i] + '\n';
                } else {
                    if (/^([-*] ?){3,}$/g.test(lines[i])) {
                        result += '<hr />';
                        continue;
                    }

                    let splitLine = lines[i].split('`');
                    lines[i] = '';
                    for (let j = 0; j < splitLine.length; j += 2) {
                        //emphasis text
                        splitLine[j] = splitLine[j].replace(/\*([^*]+)\*/g, '<span class="emphasis">$1</span>');
                        //strike through text
                        splitLine[j] = splitLine[j].replace(/~([^~]+)~/g, '<span class="strike">$1</span>');
                        //italic text
                        splitLine[j] = splitLine[j].replace(/_([^_]+)_/g, '<span class="italic">$1</span>');

                        lines[i] += splitLine[j] + ((j + 1 < splitLine.length) ? ('<span class="codeInLine">' + splitLine[j + 1] + '</span>') : '');
                    }

                    const quoteLevelThisLine = countOccurrences((/(&gt;)*/g.exec(lines[i]) || [''])[0], '&gt;');
                    if (quoteLevelThisLine !== quoteLevel) {
                        for (let j = quoteLevel; j < quoteLevelThisLine; j++) {
                            result += '<span class="quote">';
                        }
                        for (let j = quoteLevel; j > quoteLevelThisLine; j--) {
                            result += '</span>';
                        }
                        quoteLevel = quoteLevelThisLine;
                    }

                    if (/(^|((&gt;)+)) ?#{1,6}.+$/g.test(lines[i])) {
                        const headingType = countOccurrences(/#{1,6}/.exec(lines[i])[0], '#');
                        result += lines[i].replace(/(^|((&gt;)+)) ?#{1,6}(.+?)#*$/g, '<span class="heading h"' + headingType + '>$3</span>');
                        continue;
                    }
                    result += lines[i] + '<br />';
                }
            }
        }
        result = result.replace(/<br \/>$/g, '');

        //close left open tags
        if (inCodeBlock) {
            result += '</p>';
            console.log("i was also here and ended a paragraph");
        }
        for (let j = quoteLevel; j > 0; j--) {
            result += '</span>';
        }
        return result; //removes last linebreak that ist not wished to be in
    },

    /**
     * Removes every Character not allowed in HTML and replaces it with the HTML code for it
     * @param {String} string The user input to replace
     * @returns {String}
     */
    removeHTML: function (string) {
        return string
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&apos;');
    },

    replaceEmojis: function (string) {
        emojis.forEach(function (obj) {
            string.replace(obj.regex, '<img class="emoji" src="' + obj.url + '" alt="' + obj.alt + '" />');
        });
    }
};

const apiurl = 'http://danielrutz.de:3000/api';
const updateIntervall = 5000;
const cookieNameForDisplayName = 'displayName';

const colorBackgroundChannel = '#F2D769';
const colorBackgroundChannelSelected = '#E0C65B';

let apiUserName = null;
let username = 'UNEXPECTED_USERNAME';
let passwordUser = null;

let chatlogs = null;
let textinput = null;
let userbutton = null;

/**global array save for asyncrhon tasks
 * @type {array}
 * */
let allRooms = [];
let userCheck = [];
let currentView = [];
let secView = [];

/** define if a loadlobby is currently happening(false = no, true = yes)*
 * @type {boolean}
 */
let currentLoad = false;
let switchLobbyView = true;
/**
 * Stores the name to check if after loadlobbys a switch should occur
 * @type {String}
 */
let doswitch = '';
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
/**
 * Stores the current Lobby view (true for used/false for other)
 * @type {boolean}
 */
let lobbyview = true;

let clockUpdate = null;

/**
 * Is true if the list of Users is displayed and false otherwise
 * @type {boolean}
 */
let isUserListDisplayed = false;

window.onload = function startup() {
    chatlogs = document.getElementById('chatlogs');
    userbutton = document.getElementById('userlist');
    textinput = document.getElementById('textinput');

    userbutton.addEventListener('click', function () {

        if (isUserListDisplayed) {
            delistuser();
            isUserListDisplayed = false;
        } else {
            listuser();
            isUserListDisplayed = true;
        }
    });
    document.getElementById('scroll').addEventListener('click', function () {
        scrolldown();
    });
    document.getElementById('textsend').addEventListener('click', function () {
        sendtext();
    });
    //function um die größe richtig zu machen
    window.addEventListener('resize', function () {
        if (document.getElementById('login') !== null) {
            let d = document.getElementById('topbar').offsetHeight;
            let e = document.getElementById('mainM').offsetHeight;
            let a = document.getElementById('sideM').offsetWidth;
            let b = document.getElementById('mainM').offsetWidth;
            let s = d + e;
            let r = a + b;
            document.getElementById('login').style.width = r + 'px';
            document.getElementById('login').style.height = s + 'px';
        } else {
            let a = document.getElementById('sideM').offsetWidth;
            let b = document.getElementById('mainM').offsetWidth;
            let r = a + b;
            document.getElementById('topbar').style.width = r + 'px';
        }
    });

    /* for multi key maping
     map idea borrowed from https://stackoverflow.com/questions/10655202/detect-multiple-keys-on-single-keypress-event-in-jquery
     */
    let map = {13: false, 16: false};
    textinput.addEventListener('keydown', function (event) {
        if (event.keyCode in map) {
            map[event.keyCode] = true;
            if (map[13] && map[16]) {
                //default function of enter gets called, press shift first
                map[13] = false;
            }
            if (map[13]) {
                event.preventDefault();
                document.getElementById('textsend').click();
            }
        }
    });
    textinput.addEventListener('keyup', function (event) {
        if (event.keyCode in map) {
            map[event.keyCode] = false;
        }
    });

    document.getElementById('lobbycreate').addEventListener('click', function () {
        let createdname = document.getElementById('lobbyinput').value;
        createlobby(createdname);
    });
    document.getElementById('lobbyIN').addEventListener('click', function () {
        switchTolobbyOUT();
    });

    document.getElementById('lobbyOUT').addEventListener('click', function () {
        switchTolobbyIN();

    });

    document.getElementById('lobbyinput').addEventListener('keypress', function (event) {
        if (event.keyCode === 13) {
            document.getElementById('lobbycreate').click();
        }
    });

    document.getElementById('password').addEventListener('keypress', function (event) {
        if (event.keyCode === 13) {
            document.getElementById('submitLog').click();
        }
    });


    document.getElementById('submitLog').addEventListener('click', function () {
        username = document.getElementById('displayname').value;
        apiUserName = document.getElementById('username').value;
        passwordUser = document.getElementById('password').value;

        if (/[<>"'&]/g.test(username)) {
            alert('The Username shouldn\'t contain <>"\'&');
        } else {

            let roomUrl = apiurl + '/chats';
            //request object
            let roomRequest = new Request(roomUrl, {
                method: 'GET',
                headers: {
                    'Authorization': getBasicAuthHeader()
                }
            });

            fetch(roomRequest)
                .then(function (resp) {
                    if (resp.ok === true) {
                        document.getElementById('password').removeEventListener('keypress', function (event) {
                            if (event.keyCode === 13) {
                                document.getElementById('submitLog').click();
                            }
                        });
                        let logindiv = document.getElementById('login');
                        logindiv.parentNode.removeChild(logindiv);

                        setCookie(cookieNameForDisplayName, username, 12);

                        loadlobbys();
                    } else {
                        alert('Wrong credentials!');
                    }
                })
                .catch(function (err) {
                    console.log('Login failed ', err);
                    alert('No connection to server');
                });
        }
    });

    document.getElementById('displayname').value = getCookie(cookieNameForDisplayName);
};

function switchTolobbyIN() {
    if (switchLobbyView && !currentLoad) {
        switchLobbyView = false;
        document.getElementById('lobbyOUT').style.backgroundColor = '#E0C65B';
        document.getElementById('lobbyIN').style.backgroundColor = '#F2D769';
        lobbyview = false;
        loadlobbys();
    }
}

function switchTolobbyOUT() {
    if (switchLobbyView && !currentLoad) {
        switchLobbyView = false;
        document.getElementById('lobbyIN').style.backgroundColor = '#E0C65B';
        document.getElementById('lobbyOUT').style.backgroundColor = '#F2D769';
        lobbyview = true;
        loadlobbys();
    }
}

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
 * @param {{user:String, message:String, timestamp:number}} item
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
        h = '0' + h;
    }
    let timeS = h + ':' + m;

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
    let divchat = document.createElement('div');
    if (usernameS === username) {
        divchat.className = 'chat self';
    } else {
        divchat.className = 'chat friend';
    }
    let pchat = document.createElement('p');
    pchat.className = 'chat-message';
    pchat.innerHTML = '<br />' + textConverter.applyStyling(textConverter.removeHTML(textS));
    let sname = document.createElement('span');
    sname.className = 'username';
    sname.innerHTML = usernameS;
    let szeit = document.createElement('span');
    szeit.className = 'time';
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
    if (chatMessage !== '') {
        const messageurl = apiurl + '/chats/' + storedCurrentRoom;
        const messagerequest = new Request(messageurl, {
            method: 'POST',
            headers: {
                'Authorization': getBasicAuthHeader(),
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                'roomID': currentRoom,
                'user': username,
                'message': textinput.value
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
                textinput.value = '';
            })
            .catch(function (error) {
                console.error('Error in sending message:' + error);
            });
    }
}

/**
 * Resets the currently shown chatlog and displays the room specified
 * @param {String} room
 */
function displayAllMessages(room) {
    currentRoom = room;
    chatlogs.innerHTML = '';
    let listdiv = document.createElement('div');
    listdiv.className = 'userlist';
    listdiv.id = 'userlister';
    let listul = document.createElement('ul');
    listul.id = 'listul';
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
    let lobbyA = document.getElementsByClassName('lobbyname');

    if (currentRoom === null) { //do nochtin gif no room exist to display
        chatlogs.innerHTML = '';
        return;
    }

    for (let i = 0; i < lobbyA.length; i++) {
        if (messageStorage[lobbyA[i].innerHTML] === undefined) {
            continue;
        }

        if (lobbyA[i].innerHTML === currentRoom) {
            for (let j = messageStorage[lobbyA[i].innerHTML].lastSeenLength; j < messageStorage[lobbyA[i].innerHTML].messages.length; j++) {
                buildMessageFromAPI(messageStorage[lobbyA[i].innerHTML].messages[j]);
                scrolldown();
            }
            messageStorage[lobbyA[i].innerHTML].lastSeenLength = messageStorage[lobbyA[i].innerHTML].messages.length;
        } else {
            lobbyA[i].parentNode.childNodes[1].innerHTML = messageStorage[lobbyA[i].innerHTML].messages.length - messageStorage[lobbyA[i].innerHTML].lastSeenLength;
            if (lobbyA[i].parentNode.childNodes[1].innerHTML > 0) {
                lobbyA[i].parentNode.childNodes[1].className = 'lobbyMessagesUnread';

            }
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

    if (room === doswitch) {
        doswitch = '';
        switchlobby(room);

    } else {

        let lobbys = document.getElementsByClassName('lobbyname');
        for (let i = 0; i < lobbys.length; i++) {
            if (lobbys[i].innerHTML === currentRoom) {
                lobbys[i].style.backgroundColor = '#E0C65B';
            }
        }
    }

    updateSreenData();
}
/**
 * Requests the messages for the specified room and stores it in to messageStorage
 * @param room
 */
function loadmessage(room) {
    let messageurl = apiurl + '/chats/' + room;

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
            console.error('Error in loadmessage:', error);
        });
}

/**
 * Opens the side menu which displays a lisst of users
 * request all users of the current lobby and displays them
 * changes the color of the button to open the side menu to "selected" color
 * */
function listuser() {
    document.getElementById('userlister').style.width = '25%';
    userbutton.style.backgroundColor = '#E0C65B';

    let userurl = apiurl + '/chats/' + document.getElementById('chatheader').innerHTML;

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

            let userArray = [];
            data.forEach(function (item) {
                let usernameS = item.user;

                if (userArray.indexOf(usernameS) <= -1) {
                    userArray.push(usernameS);
                }
            });

            userArray.sort();
            document.getElementById('listul').innerHTML = '';
            userArray.forEach(function (item) {
                let userli = document.createElement('li');
                userli.innerHTML = item;
                document.getElementById('listul').appendChild(userli);
            });

        })
        .catch(function (error) {
            console.error('Error in listuser:' + error);
        });
}

/**
 * Retruns true if a user is in a chat room /false if not
 */
function checkuser(room, rooms) {
    let userurl = apiurl + '/chats/' + room + '/users';

    let userrequestNew = new Request(userurl, {
        method: 'GET',
        headers: {
            'Authorization': getBasicAuthHeader()
        }
    });

    fetch(userrequestNew)
        .then(function (resp) {
            return resp.json();
        })
        .then(function (data) {
            let userIN = (data.indexOf(username) > -1);
            if ((userIN && lobbyview) || (!userIN && !lobbyview)) {

                userCheck.push(true);
            } else {
                userCheck.push(false);

            }
            allRooms.shift();
            loadforeach(rooms);


        })
        .catch(function (error) {
            console.error('Error in checkuser:', error);
        });
}
/** insync version for load of lobby that in the lobby view*/
function loadforeach(data) {
    if (allRooms.length > 0) {
        checkuser(allRooms[0], data);

    } else {
        let newLobbylogs = document.createElement('div');
        newLobbylogs.className = 'lobbylogs';
        newLobbylogs.id = 'lobbylogs';
        currentView = [];
        secView = [];
        data.forEach(function (item) {
            if (userCheck[0]) {

                const divbutton = document.createElement('div');
                divbutton.className = 'lobby';

                const newbutton = document.createElement('button');
                newbutton.className = 'lobbyname';
                newbutton.onclick = function () {
                    switchlobby(this.innerHTML);
                };
                newbutton.innerHTML = item;
                newbutton.style.backgroundColor = (item === currentRoom) ? colorBackgroundChannelSelected : colorBackgroundChannel;

                const unreadMessageSpan = document.createElement('span');
                if (messageStorage[item] !== undefined) {
                    unreadMessageSpan.innerHTML = '' + (messageStorage[item].messages.length - messageStorage[item].lastSeenLength);
                } else {
                    unreadMessageSpan.innerHTML = '0';
                }

                if (unreadMessageSpan.innerHTML === '0') {
                    unreadMessageSpan.className = 'lobbyMessagesRead';
                } else {
                    unreadMessageSpan.className = 'lobbyMessagesUnRead';
                }

                divbutton.appendChild(newbutton);
                divbutton.appendChild(unreadMessageSpan);
                newLobbylogs.appendChild(divbutton);
                currentView.push(item);
            }
            secView.push(item);
            userCheck.shift();
        });
        let oldLobbyLogs = document.getElementById('lobbylogs');
        const saveScrolling = oldLobbyLogs.scrollTop;//To remove jump to top
        oldLobbyLogs.parentNode.replaceChild(newLobbylogs, oldLobbyLogs);
        newLobbylogs.scrollTop = saveScrolling;
        data.forEach(loadmessage);
        currentLoad = false;
        if (!switchLobbyView) {
            if(document.getElementById('lobbylogs').firstChild !== null){
                switchlobby(document.getElementById('lobbylogs').firstChild.firstChild.innerHTML);
            } else {
                switchlobby(null);
            }
        }
        switchLobbyView = true;

    }

}

/**
 * Closes the side menu which displays all users
 * changes the color of the button to open the side menu back to normal
 */
function delistuser() {
    document.getElementById('userlister').style.width = '0';
    userbutton.style.backgroundColor = '#F2D769';
}

/**
 * Loads all lobbys form the API and updates the data stored in the messageStorage for every room
 */
function loadlobbys() {
    if (!currentLoad) {
        currentLoad = true;
        if (clockUpdate === null) {
            clockUpdate = setInterval(loadlobbys, updateIntervall);
        }

        let roomUrl = apiurl + '/chats';

        //request object
        let roomRequest = new Request(roomUrl, {
            method: 'GET',
            headers: {
                'Authorization': getBasicAuthHeader()
            }
        });

        fetch(roomRequest)
            .then(function (resp) {
                return resp.json();
            })
            .then(function (data) {

                /* borrowed from stack overflow https://stackoverflow.com/questions/8996963/how-to-perform-case-insensitive-sorting-in-javascript*/
                data.sort(function (first, sec) {
                    return first.toLowerCase().localeCompare(sec.toLowerCase());
                });

                allRooms = data.slice();
                userCheck = [];
                loadforeach(data);


            })
            .catch(function (error) {
                console.error('Error in loadlobbys:' + error);
            });
    }
}

/**
 * Switches to the specified lobby thus removing all currently displayed messages and displaying the new ones
 * @param {String} name
 */
function switchlobby(name) {
    if(name === null){
        currentRoom = name;
        chatlogs.innerHTML = '';
        return;
    }
    let lobbyA = document.getElementsByClassName('lobbyname');
    let element;
    for (let i = 0; i < lobbyA.length; i++) {
        if (lobbyA[i].innerHTML === name) {
            element = lobbyA[i];
        } else {
            lobbyA[i].style.backgroundColor = colorBackgroundChannel;
        }
    }
    element.style.backgroundColor = colorBackgroundChannelSelected;
    element.parentNode.childNodes[1].className = 'lobbyMessagesRead';
    element.parentNode.childNodes[1].innerHTML = '0';
    document.getElementById('chatheader').innerHTML = name;
    textinput.value = '';
    textinput.focus();

    document.getElementById('lobbylogs').scrollTop = element.offsetTop - 130;

    displayAllMessages(name);


}


/**
 * creates new lobby and switches to it if there is no lobby with the enterd name
 * switches to lobby if there is a lobby with the entered name
 * @param {String} name
 */
function createlobby(name) {
    let lobbyA = document.getElementsByClassName('lobbyname');
    let create = true;


    if (currentView.indexOf(name) > -1) {
        for (let i = 0; i < lobbyA.length; i++) {
            if (lobbyA[i].innerHTML === name) {
                switchlobby(name);
                create = false;
            }
        }
    } else if (secView.indexOf(name) > -1) {
        if (lobbyview) {
            switchTolobbyIN();
        } else {
            switchTolobbyOUT();
        }
        for (let i = 0; i < lobbyA.length; i++) {
            if (lobbyA[i].innerHTML === name) {
                switchlobby(name);
                create = false;
            }
        }
    }
    if (create) {
        switchTolobbyIN();


        const newlobby = apiurl + '/chats/' + name;
        const newlobbyrequest = new Request(newlobby, {
            method: 'POST',
            headers: {
                'Authorization': getBasicAuthHeader(),
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                'roomID': name,
                'user': 'Server',
                'message': 'The Server created this room!'
            })
        });
        //?unnötig vlt? check replacement possible
        fetch(newlobbyrequest)
            .catch(function (error) {
                console.error('Error in sending message:' + error);
            });
        currentRoom = name;
        doswitch = name;
        loadlobbys();
    }
    document.getElementById('lobbyinput').value = '';

}
/**
 * Sets a cookie with the specified value and name. It will expire in the specified amount of hours.
 *
 * The cookie will either will be created or overwritten
 *
 * Inspired by https://www.w3schools.com/js/js_cookies.asp
 *
 * @param name {String} the cookies name
 * @param value {String} the value to store
 * @param hours {Number} the number of hours till the cookie will expire
 */
function setCookie(name, value, hours) {
    let d = new Date();
    d.setTime(d.getTime() + (hours * 60 * 60 * 1000));
    document.cookie = name + '=' + value + '; expires=' + d.toUTCString() + '; path=/';
}

/**
 * Gets the value stored in the cookie specified or returns a empty string if not send
 *
 * Inspired by https://www.w3schools.com/js/js_cookies.asp
 *
 * @param name {String} the name of the cookie
 * @return {String}
 */
function getCookie(name) {
    name = name + '=';
    let splitCookies = decodeURIComponent(document.cookie).split(';');
    for (let i = 0; i < splitCookies.length; i++) {
        let c = splitCookies[i].replace(/^ */g, '');
        if (c.indexOf(name) === 0) {
            return c.substring(name.length, c.length);
        }
    }
    return '';
}

/**
 * Counts the occurrences  of the subString in string
 * @param {String} string the string to check
 * @param {String} subString the subString to find
 *
 * @see http://stackoverflow.com/questions/4009756/how-to-count-string-occurrence-in-string/7924240#7924240
 */
function countOccurrences(string, subString) {
    let n = 0;
    let pos = 0;
    let step = subString.length;

    while (pos <= string.length) {
        pos = string.indexOf(subString, pos);
        if (pos >= 0) {
            n = n + 1;
            pos += step;
        } else break;
    }
    return n;
}
