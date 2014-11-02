<?php
  $cacheversion = "0.5.9";
?>
<html>
  <head>
    <title>srpg</title>
    <link rel="stylesheet" type="text/css" href="reset.css">
    <link rel="stylesheet" type="text/css" href="client.css">
    <script type="text/javascript" src="jquery.js"></script>
    <script type="text/javascript" src="def.js?<?php echo $cacheversion; ?>"></script>
    <script type="text/javascript" src="menus.js?<?php echo $cacheversion; ?>"></script>
    <script type="text/javascript" src="client.js?<?php echo $cacheversion; ?>"></script>
    <script type="text/javascript" src="http://72.211.157.105:8080/node/bin/shared.js?<?php echo $cacheversion; ?>"></script>
    <script type="text/javascript" src="interface.js?<?php echo $cacheversion; ?>"></script>
    <script type="text/javascript" src="entities.js?<?php echo $cacheversion; ?>"></script>
    <script type="text/javascript" src="maps.js?<?php echo $cacheversion; ?>"></script>
    <script type="text/javascript" src="items.js?<?php echo $cacheversion; ?>"></script>
    <script type="text/javascript" src="misc.js?<?php echo $cacheversion; ?>"></script>
    <script src="http://72.211.157.105:8080/node/bin/socket.io/support/socket.io-client/socket.io.js"></script>
    <script type="text/javascript" src="socket.js?<?php echo $cacheversion; ?>"></script> 
  </head>
  <body>
    <div id="splash" style="background-color:#000">
      <div style="margin-left:0px;width:848px;" class="scon">
        <div class="shea">RPG Game Name</div>
        <img src="gfx/goblin.png"><img src="gfx/player.png"><img src="gfx/merchant.png"><br>
        Username:<br><input type="text" id="login_name" value="<?php echo rand(1,10000); ?>" class="sinput"><br>
        Password:<br><input type="password" id="login_pass" class="sinput"><br><br>
        <input type="submit" value="Login" onClick="login()" class="suinput"><br><br>
        <input type="submit" value="Create New Account" onClick="createaccount()" class="suinput"><br>
        <div id="splasherror"></div>

      </div>      
    </div>
    
    <div id="connectionstatus" style="color:#fff; font-family:Courier New;font-size:14px;"></div>
    
    <div id="status"></div>
    <div id="abilitystatus"></div>
    
    <div id="cpanel">
      <span style="color:#2555DD;" id="cpanel_name"></span><br>
      <span style="color:#2555DD;" id="cpanel_class"></span><br>
      <span style="color:#fff;" id="cpanel_level">Level 1</span><br>
      <div id="barlist"></div>
      
      <div id="statgroup" style="height:100px;">
        <div id="stats" class="statc">
             
        STR <div class="sval" id="cpanel_STR"></div><br>
        STA <div class="sval" id="cpanel_STA"></div><br>
        AGI <div class="sval" id="cpanel_AGI"></div><br>
        DEX <div class="sval" id="cpanel_DEX"></div><br>
        INT <div class="sval" id="cpanel_INT"></div><br>
        WIS <div class="sval" id="cpanel_WIS"></div><br>
        CHA <div class="sval" id="cpanel_CHA"></div><br>
        </div> 
        
        <div id="resists" class="statc" style="margin-left:8px;">
        &nbsp;AC <div class="sval" id="cpanel_AC"></div><br>     
        ATK <div class="sval" id="cpanel_ATK"></div><br>  
        SVM <div class="sval" id="cpanel_SVM"></div><br>
        SVF <div class="sval" id="cpanel_SVF"></div><br>
        SVC <div class="sval" id="cpanel_SVC"></div><br>
        SVP <div class="sval" id="cpanel_SVP"></div><br>
        SVD <div class="sval" id="cpanel_SVD"></div><br>
        </div>
      </div>

      <div id="menulist" class="cmenu" style="display:block;">
        <span style="font-weight:bold">Menu</span><br>      
        <span style="color:#FF9900">C</span> Character<br>
        <span style="color:#FF9900">I</span> Inventory<br>
        <span style="color:#FF9900">A</span> Abilities<br>
        <span style="color:#FF9900">P</span> Group<br>
        <span style="color:#FF9900">J</span> Journal<br>
        <span style="color:#FF9900">?</span> Help<br>
      </div>
      
      <div id="menugroup" class="cmenu" style="display:none;">
        <span style="font-weight:bold" id="groupheader">Group</span><br>
        <div id="grouplist"></div>        
      </div>
      
      <div id="targetgroup" style="height:34px;margin-top:5px;">
        <span id="targetname">No target</span>                        
        <div class="bar" style="background-color:#C41414;text-align:center;display:none;" id="targethpbar">100%</div>
      </div>
    </div>
    <div id="cpabilities"></div>
    <div id="viewport"></div>
    
    <div id="chat"> 
      <div id="msglog"></div>
      <div id="combatlog"></div>
      <input type="text" id="chatinput" maxlength="200">
    </div>
    
    <div class="contentbox" id="character" style="display:none;">
      Is there even a need for this window?<br>
      You can pretty much see all of your stats on the panel.<br>
      todo
    </div>
    
    <div class="contentbox" id="loot" style="display:none;">
      <div class="cboxshadow"></div>
      <div id="itemviewloot" class="miniview"></div>
      <div id="dlootlist"></div>
    </div>
    
    <div class="contentbox" id="abilities" style="display:none;">
      <div class="cboxshadow"></div>
      <div id="abilitydescription" class="miniview"></div>
      <div style="float:left;width:316px;border:0px solid red;height:300px">
        <div style="width:302px;border:0px solid red;text-align:center;color:#E1D901">Hotkeys</div>        
        <div id="abilitieshotkeydisplay"></div>      
      </div>      
      <div style="float:left;width:316px;height:300px;">
        <div style="width:320px;border:0px solid red;text-align:center; color:#E1D901">Abilities</div>
        <div id="abilitieslistdisplay"></div>
        <div style="position:absolute;top:350px;left:360px;">
          <span style="color:#555;margin-left:5px;">Page <span style="color:#fff;" id="abilitieslistcurrentpage">1</span> of <span style="color:#fff;" id="abilitieslisttotalpages">1</span>
          [<span style="color:#FF9900">,</span> prev, <span style="color:#FF9900">.</span> next]</span>
        </div>
      </div>

    </div>
    
    <div class="contentbox" id="journal" style="display:none;">
      <pre>
      journal
      todo
      </pre>
    </div>
    
    <div class="contentbox" id="bugreport" style="display:none;">
      <span style="color:#3A90DB">Bug report:</span><br>
      Please describe the bug you experienced, and what you were doing when it happened.<br>
      Use <span style="color:#ff9900">ESC</span> to cancel. (SPACE will not cancel here.)<br>
      <textarea id="bugreportdesc" class="bugreportinput"></textarea><br>
      <input type="submit" class="bugreportsubmit" value="Click here to report bug" onClick="fileBugReport()"><br>
      Thank you for your bug report.
    </div>
    
    <div class="contentbox" id="look" style="display:none;">
      <div class="cboxshadow"></div>
      <div id="lookview" class="miniview"></div>
      <div id="llg">
      <div style="float:left;width:316px;height:300px;" id="looklista"></div>      
      <div style="float:left;width:316px;height:300px;" id="looklistb"></div>
      </div>
        <div style="position:absolute;top:350px;left:360px;" id="looklistpage">
          <span style="color:#555;margin-left:5px;">Page <span style="color:#fff;" id="looklistcurrentpage">1</span> of <span style="color:#fff;" id="looklisttotalpages">1</span>
          [<span style="color:#FF9900">,</span> prev, <span style="color:#FF9900">.</span> next]</span>
        </div>
    </div>
    
    <div class="contentbox" id="trademerchant" style="display:none;">
      <div id="tmoptions">
        <span style="color:#FF9900">B</span> Buy<br>
        <span style="color:#FF9900">S</span> Sell<br>
        <span style="color:#FF9900">SPACE</span> Nevermind
      </div>
      <div class="cboxshadow"></div>
      <div id="tmiview" class="miniview"></div>
      <div id="tmg">
      <div style="float:left;width:316px;height:300px;" id="tmla"></div>      
      <div style="float:left;width:316px;height:300px;" id="tmlb"></div>
      </div>
        <div style="position:absolute;top:350px;left:360px;" id="tmpage">
          <span style="color:#555;margin-left:5px;">Page <span style="color:#fff;" id="tmcurrentpage">1</span> of <span style="color:#fff;" id="tmtotalpages">1</span>
          [<span style="color:#FF9900">,</span> prev, <span style="color:#FF9900">.</span> next]</span>
        </div>
    </div>
    
    <div class="contentbox" id="help" style="display:none;">    
      <div id="helpcontent1" class="helpcontent">
        <span style="text-decoration:underline">General:</span><br>
        Hotkeys are <b>always</b> noted with <span style="color:#FF9900">this color</span><br>
        Hotkeys are <b>NOT</b> case sensitive.<br>
        Helpful information will appear at the top of the screen.<br>
        If you <b>can't move</b>: Try <span style="color:#FF9900">ESC</span> or <span style="color:#FF9900">SPACE</span> first. Make sure the chatbox is disabled (<span style="color:#FF9900">ENTER</span>).<br>
        <div style="color:3A90DB;width:90px;float:left;text-align:right;height:150px;background-color:#111;padding:5px;border-right:1px dotted #999;line-height: 20px;">
        Movement:<br> 
        Attack:<br>
        Loot:<br>
        Cancel/Close:<br> 
        Look:<br>
        Chat:<br>
        </div>
        <div style="width:520px;float:left;height:150px;padding:5px;background-color:#222;line-height: 20px;">
          Arrow keys or numpad<br>
          Walk into a monster to attack it (hold to repeatedly attack)<br>
          <span style="color:#FF9900">S</span> (Stand over an object or a corpse)<br>
          <span style="color:#FF9900">ESC</span> or <span style="color:#FF9900">SPACE</span> (universally cancels or closes)<br>
          <span style="color:#FF9900">L</span> (use Numpad to move the cursor)<br>
          <span style="color:#FF9900">ENTER</span> (toggles chat on/off)<br> 
        </div>
        <div style="width:600px;"> 
        </div>
      </div>

      <div id="helpcontent2" class="helpcontent">
        <span style="text-decoration:underline">Hotkeys/Input:</span><br>
        <div style="color:ff9900;width:40px;float:left;text-align:right;height:280px;background-color:#111;padding:5px;border-right:1px dotted #999;line-height: 20px;">
          S<br>
          0<span style="color:#fff">-</span>9<br>
          T<br>
          L<br>
        </div>
        <div style="color:#fff;width:570px;float:left;height:280px;padding:5px;background-color:#222;line-height: 20px; ">
          Loots a corpse. Stand directly on top of the corpse first.<br>
          Performs an ability.<br>
          Targets the nearest hostile monster.<br>
          Enables the look cursor. Use arrow keys to guide it.<br>
        </div>
        <div style="width:600px;">
        </div>
      </div>
      
      <div id="helpcontent3" class="helpcontent">
        <span style="text-decoration:underline">Chatting & Messages:</span><br>
        Chat messages will always appear in the left chat. Combat messages appear in the right.<br>
        Normal chat is zone wide. Anyone on your screen will hear it.<br>
        If you <b>can't move</b>, you might have the chatbox open. Toggle it with <span style="color:#FF9900">ENTER</span>.<br>
        <div style="color:3A90DB;width:90px;float:left;text-align:right;height:260px;background-color:#111;padding:5px;border-right:1px dotted #999;line-height: 20px;">
          /ooc<br> 
          /tell, /t<br>
          /reply, /r<br>
          /emote, /me<br>
          /group, /g<br> 
          /who<br>
          /friend<br>
          /ignore<br>
          /roll<br>
          /afk<br>
          /follow<br>
          /help<br>
          /exit, /quit<br>
        </div>
        <div style="width:520px;float:left;height:260px;padding:5px;background-color:#222;line-height: 20px; ">
          Out Of Character chat. This chat is game wide.<br>
          Private message. Format: /tell &lt;username&gt; &lt;message&gt;<br>
          Reply to last received private message.<br>
          Express emotion. Format: /emote &lt;text&gt;<br>
          Group chat. Format: /group &lt;message&gt;. Anyone in your group will hear it.<br>
          Finds online players. Format: /who &lt;text&gt;. Example: <i>/who Drachlen</i><br>
          Add to friends list. Format: /friend &lt;name&gt;.<br>
          Ignore player's chat. Format: /ignore &lt;name&gt;.<br> 
          Generates a random number 0-100. <span style="color:E1D901">Will appear in this color.</span><br>
          Sets your status to away. Format: /afk &lt;optional message&gt;<br>
          Makes your character follow your current target.<br>
          Full list of chat commands<br>
          Quits the game.
        </div>
        <div style="width:600px;"> 
        </div>
      </div>
      
      <div id="helpcontent4" class="helpcontent">
        <span style="text-decoration:underline">Player Stats:</span><br>
        <div style="color:3A90DB;width:140px;float:left;text-align:right;height:280px;background-color:#111;padding:5px;border-right:1px dotted #999;line-height: 20px;">
        Strength STR<br> 
        Stamina STA<br>
        Agility AGI<br>
        Dexterity DEX<br>
        Intelligence INT<br> 
        Wisdom WIS<br>
        Charisma CHA<br>
        Armor Class&nbsp; AC<br>
        Attack ATK<br>
        Save Vs Magic SVM<br>
        Save Vs Fire SVF<br>
        Save Vs Cold SVC<br>
        Save Vs Poison SVP<br>
        Save Vs Disease SVD<br>
        </div>
        <div style="width:470px;float:left;height:280px;padding:5px;background-color:#222;line-height: 20px; ">
          Increases physical damage. Increases total carried weight.<br>
          Increases maximum HP.<br>
          Increases avoidance. Increases movement speed.<br>
          Increases chance to hit.<br>
          Increases maximum MP for Magicians. Increases spell damage.<br>
          Increases maximum MP for Priests. Increases benficial abilities.<br>
          Increases beneficial abilities.<br>
          Increases avoidance.<br>
          Increases chance to hit.<br>
          Resistance of magic.<br>
          Resistance of fire.<br>
          Resistance of cold.<br>
          Resistance of poison.<br>
          Resistance of disease.<br>
        </div>
        <div style="width:600px;">
        </div>
      </div>
      
      <div style="position:absolute;top:350px;left:360px;">
        <span style="color:#555;margin-left:5px;">Page <span style="color:#fff;" id="helpcurrentpage">1</span> of <span style="color:#fff;" id="helptotalpages">4</span>
        [<span style="color:#FF9900">,</span> prev, <span style="color:#FF9900">.</span> next]</span>
      </div>      
    </div>
    
    <div class="contentbox" id="inventory" style="display:none;">
      <div class="cboxshadow"></div>
      <div id="itemview" class="miniview"></div>
      <div id="confirmtrade" class="miniview" style="left:334px;width:200px"></div>
      <div style="float:left;width:316px;border:0px solid red;height:300px;display:block;" id="equipment">
        <div style="width:302px;border:0px solid red;text-align:center;color:#E1D901">Equipment</div>        
        <div id="equipmentlistdisplay">
          <div class="slot">Primary:</div><div id="inv_primary" class="equipped"></div>
          <div class="slot">Secondary:</div><div id="inv_secondary" class="equipped"></div>
          <div class="slot">Head:</div><div id="inv_head" class="equipped"></div>
          <div class="slot">Neck:</div><div id="inv_neck" class="equipped"></div>
          <div class="slot">Chest:</div><div id="inv_chest" class="equipped"></div>
          <div class="slot">Back:</div><div id="inv_back" class="equipped"></div>
          <div class="slot">Arms:</div><div id="inv_arms" class="equipped"></div>
          <div class="slot">Hands:</div><div id="inv_hands" class="equipped"></div>
          <div class="slot">Waist:</div><div id="inv_waist" class="equipped"></div>
          <div class="slot">Legs:</div><div id="inv_legs" class="equipped"></div>
          <div class="slot">Feet:</div><div id="inv_feet" class="equipped"></div>
          <div class="slot">Finger:</div><div id="inv_finger" class="equipped"></div>
        </div>        
      </div>
      
      
      <div style="float:left;width:316px;border:0px solid red;height:380px;display:none;" id="trade">
        <div style="width:302px;text-align:center;color:#E1D901" id="tradeyouofferheader">You Offer:</div>
        <div style="height:170px;border:1px solid #444;margin-bottom:5px;"id="youoffer">
          <div id="youofferlist"></div>
          Gold: <span id="youoffergold">0</span>
        </div>
        
        <div style="width:302px;text-align:center;color:#E1D901" id="tradewithdisp"> Offers:</div>
        <div style="height:170px;border:1px solid #444;"id="theyoffer">
          <div id="theyofferlist"></div>
          Gold: <span id="theyoffergold">0</span>
        </div>  
      </div>
      
      
      
            
      <div style="float:left;width:316px;height:300px;">
        <div style="width:320px;border:0px solid red;text-align:center; color:#E1D901">Inventory (Gold: <span id="golddisplay">0</span>)</div>        
        <div id="inventorylistdisplay"></div>
        <div style="position:absolute;top:350px;left:360px;">
          <span style="color:#555;margin-left:5px;">Page <span style="color:#fff;" id="inventorylistcurrentpage">1</span> of <span style="color:#fff;" id="inventorylisttotalpages">1</span>
          [<span style="color:#FF9900">,</span> prev, <span style="color:#FF9900">.</span> next]</span>
        </div>
      </div>
    </div>
    
    <div id="debug"></div>    
  </body>
</html>
