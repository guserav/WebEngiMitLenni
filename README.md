

# Web-Engineering Chat Client

**Students**: Erik Zeiske, Lennart Purucker 
**Lecturer**: Gerrit Schmitz
**Due date**: Sunday, 6 August 2017, 00:00 AM

[![Build Status](https://api.travis-ci.org/guserav/WebEngiMitLenni.png)](https://travis-ci.org/guserav/WebEngiMitLenni)

This ReadMe incldues a list of features for our Chat Client.

We used the server of Daniel Rutz with your Backend. The Server can be changed via the global variable 'apiurl'. 

@Gerrit Schmitz
The List of Features should be an inspiration for you to find features worthy of points for a certain category. You are free to decide which feature falls under which category and free to declare other things in our chat client as feature. 

The List of Buttons should be "tutorial". 

## List of Features

### Authentification
* Displayname is your Username in the Chat Client.
* Displayname will be saved in a Cookie after you loged in. 
* Username and Password are the needed credentials for the Backend which will be used to verify our requests to the Backend.(Username= '**dhbw**', Password= '**dhbw-pw**')
* Autofocus for the first input field and 'Enter press' for the Password input field supported.


### Displaying messages (historic and new)
* supporting a custom markup languge to style your messages
* replacing characters that are reserved by html
* Display messages adequate with time stemp, colored name and flexiable room for the message


### displaying chatrooms
* splitting channels into seperate chanels you actualy toke part in conversation and other chanels you yet did not take part in a conversation 
('Used', 'Other')
* Also the number of unread messages is shown next to the chatroom
* Creating and switching to Lobbys

### Emojis
* included frequently used emojis
* Supported and easaly expandable by ading more to the array they are stored in

### Send messages
* autofocus message box when entering a chatroom
* enter automaticly sends the message and shift+enter could be used for new line


### List and Color user in room
* Supported with 'User'-Button. 
* Punkt: users are colored with 41 unique and easy humanly differentable colors which are always the same within one chat room
* User List is case insensitive sorted
* Userer have consecutive numbers
* The Color of the user in the chat room is displayed in a small box to the right of the User name  

### User Experience, Accessability
* Created a Colorblind Color Pattern Style 
* Option to select different styles
* Options to select different font-sizes for this website
* Save options and Username in a Cookie
* Autofocus supported to directly start writing after joning a lobby
* Added Feature to wwitch to a lobby. No searching needed
* Added Feature to mark all messages as read.
* Added different lobby views for "Used" and "Other"
* Added Jump feature to scroll to the newest message
* Web Page is scalebale and can still be view correctly after resizing

### Proper usage of HTML
* HTML used without Framework
* Validated with W3C

### Proper usage of CSS
* CSS used without Framework
* Validated with W3C

### Proper usage of Javascript
* Javascript used without added libary like jQuery
* Eslint Confirm (See Build information at the start)
* Recent features (Fetch,ES6)

### Your chocie
* Create/Switch Lobby
* 5 differnt styles 
* Regex for custom markdown
 
---

## Buttons on the Main page

### Options (Top-Right)
* Open option menu
* (Font-Size)You are able to change the font-size of the chat client or use the font-size of your browser
* (Style) You are able to select a style you like. Every style has its own style sheet.
    * 5 styles possible
    * 2 are proven colorblind tested ('ColorDrop' and 'ColorBlindMode' for more information see style sheet 5)
* You have to press save to store and apply  information. Information will also be stored in a cookie. 
* Press exit to leave the menu again

### TextTricks (Top-Right)
* TextTricks lists all usage of Regex for your chat message

### About (Top-Right)
* About is a direct Link to our ReadMe on the GitHub. 

### Used and Other (Left Side above Lobbys)
* "Used" and "Other" are different Lobbyviews 
* 'Used' contains all chanels you have send a message once, 'Other' lists all chanels without your participation

### Lobby-Buttons (Left Side)
* Used to switch to Lobbys in your current Lobbyview. Press one of the buttons in the Menu to switch to the lobby with the name of that button. Each will Load all Messages of the selected Lobby. 

### Mark all as read (Bottom Left)
* This Button marks all notifcations of every Lobby in your current Lobbyview as read. 

### Creat/Switch (Bottom Left)
* If you write a lobby name (Max 15 chars) in the Input field left of the button and then press the button, two things can happen.
    * The server will create a lobby with this name and switch to Lobbyview "Other", if no lobby with this name existed. 
    * You will switch to the Lobby and load all of its messages. You will also switch your Lobbyview if necessary. 

### Jump (above chat messages to the left)
* This button scrolls to the current message of a room. Used if you scrolled all the way up to a historic message.

### Users (above chat messages to the right)
* This button will open a side menu inside your chatlog which displays all users in the current lobby. The users are case insensitively sorted, have a consecutive number to the left and a display of their color to the right. 

### Send (Bottom-Right)
* Send will send your input of the textarea to the left to the server and reloads the current lobby with your  message.
* You could also send messages by pressing the enter button while typping in the message area.
