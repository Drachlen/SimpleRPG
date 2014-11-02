<?php
include("auth.php");
?>
<html>
    <head>
        <title>SRPG Content Editor</title>
        <link rel="stylesheet" type="text/css" href="../reset.css">
        <link rel="stylesheet" type="text/css" href="editor.css">
        <script type="text/javascript" src="../jquery.js"></script>
        <script type="text/javascript" src="editor.js"></script>
    </head>
    <body>
        <div id="header">
            <div class="headerbutton" cat="items">Items</div>
            <div class="headerbutton" cat="loottables">Loot Tables</div>
            <div class="headerbutton" cat="npcs">NPCs</div>
            <div class="headerbutton" cat="spawngroups">Spawn Groups</div>
            <div class="headerbutton" cat="abilities">Abilities</div>
            <div class="headerbutton" cat="quests">Quests</div>
            <div class="headerbutton" cat="zones">Zones</div>
            <div class="headerbutton" cat="other">Other</div>
        </div>
        <div id="view"></div>
    </body>
</html>
