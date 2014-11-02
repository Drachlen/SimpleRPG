SimpleRPG
=========
Video of the game: https://www.youtube.com/watch?v=t1mEynbk-Ts

Web-based multiplayer RPG using node.js & socket.io

This is a project from 2011. The gameplay itself is influenced by the RPG elements you'd find in games like EverQuest and Ultima Online.

The client is built using primarily JavaScript and HTML. The client communicates with the server over socket.io.

The server was written entirely in node.js. Unfortunately the server code has been lost through the years.

Client
=========
The client itself is built heavily using HTML elements to position aspects of the player's interface.
The gameplay itself is heavily hotkey based like you'd find in a roguelike. The client communicates with the server (which is authoritative) real time.

Players are able to move around, attack enemies, loot items, gain experience, level up, activate skills, manage inventory, buy and sell, and trade with each other.

Editor
=========
The project also includes a full-fledged editor.

The editor includes the ability to alter nearly every aspect of content, in real time, without restarting the client or the server. Data such as items, monsters, drop tables, abilities, maps, and players can all be altered while the server is active.
