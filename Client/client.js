/**
 * %SRPG%
 * 2011 Kevin Tyma (drachlen@gmail.com)
 * 
 **/

var exports = this;
jQuery(document).ready(function()
{
  viewport = $('#viewport');
                                     
  $(document).keypress(function(e)
  {
    if( player.loading )
      return;
    //console.log("keypress:"+e.which);
    /*
    if( frame-player.lastInput < player.inputDelay)
      return;         
    player.lastInput = frame;
    */


    // If the player is not chatting AND the player is allowed to input,
    if( !player.chatting&&player.allowInput)
    {
      var key = e.which;
      //if key is uppercase, make it lowercase
      if(key>64&&key<91)
        key+=32;
      //if this menu (view) has a handler for this key, execute code
      if( player.view in menus && key in menus[player.view] )
      {
        /*
          In some cases, the menu function will return 1.
          If the menu function returns 1, -do not- return
          from the keypress call.
          This is because of possible key conflicts in special contexts
        */
        var result = menus[player.view][key]();
        if( !result )
          return;
      }
    } 
    
    var listKey = -1;
    if( player.allowInput && !player.chatting )
    {
      //console.log("e.w:"+e.which);
      if( e.which>64 && e.which<91 )
      {
        listKey = e.which-65;
      } else
      if( e.which>96 && e.which<123 )
      {
        listKey = e.which-97;
      }
    }
    // listKey is a-z and A-Z, just set to 0-25. It's used for lists.
    if( listKey != -1 )
    {
      switch(player.view)
      {
        case "abilities":
          var abilityslot = listKey+abilitiesOffset;
          console.log("abs: "+abilityslot);
          if( !(abilityslot in player.abilities) )
            return;
          var ability = player.abilities[abilityslot].id;
          if( !(ability in abilityInfo) )
            return;
          abilityDetails( ability, -1 );
        break;        
        case "loot":
          /*
            player is looting, loot list a-z, but probably just
            a-m or so.
          */
            var slot = listKey;
            if( slot in lootList && lootList[slot] != -1 )
            {
              var itemId = lootList[slot];
              if( !(itemId in globalItemList) || itemId==0 )
                return;
              var display = itemStatsDisplay(itemId);
              $('#itemviewloot').html(display);
              $('#itemviewloot').show();
              $('.cboxshadow').show();
              var status="Viewing Item. ";
              //droppable todo
              //if( !(3 in itemInfo[itemId].attributes) )
              status += '<span style="color:#FF9900">L</span> to loot. ';
              status += '<span style="color:#FF9900">SPACE</span> to close. '; 
              setStatus(status,'fff');
              player.view="lootitem";
              player.lootingItem=slot;     
            }
        break;
        case "sellmerchant":
          var itemId = -1;
          var viewItem = listKey;
          var slot=-1;
          var from=-1;
          if( viewItem in player.inventory )
          {
            console.log("item in inventory");
            itemId = viewItem;
            slot= viewItem;
            from="sellmerchant";
          }        
          if(itemId==-1||(slot==-1)||from==-1)
            return;          
          displayItemDetails(itemId,slot,from);
          player.view="sellitem";          
        break;
        case "buymerchant":
          var itemId = -1;
          var viewItem = listKey;
          var slot=-1;
          var from=-1;
          if( viewItem in merchantList )
          {
            console.log("item in merchantlist");
            itemId = viewItem;
            slot= viewItem;
            from="buymerchant";
          }        
          if(itemId==-1||(slot==-1)||from==-1)
            return;          
          displayItemDetails(itemId,slot,from);
          player.view="buyitem";          
        break;
        case "inventory":
          /*
            When a player views their inventory, they will see a list
            of items on the left, as well as a list of what they're wearing
            on the right.
            The equipment keys do not change, regardless of how many items
            they are carrying, or whether they don't have an item in every
            equipment slot.
            for example:
            the hotkey to view what a player is currently wearing on their neck
            is always z. If there's nothing on their neck, nothing will happen.
            
            inventory item hotkeys are a through m. when a player scrolls their
            list up or down (, or . respectively), the new list that is shown
            will again use a through m.
          */
          var itemId = -1;
          var viewItem = listKey;
          var slot=-1;
          var from=-1;
          console.log("listkey:"+listKey);
          //Trying to view something from the inventory:
          if( viewItem > 12 )
          {
            viewItem-=13;
            //viewItem+=inventoryOffset;
            if( viewItem in player.inventory )
            {
              console.log("view from inventory;");
              itemId = viewItem;
              slot= viewItem;
              from="inventory";
            }else{
              itemId = -1;
            }
          }else{
          
            //if we're not trading, then show that equipment slot:
            if( tradeWith == -1)
            {
              //viewing a piece of equipment:
              console.log("viewitem:"+viewItem);
              if( viewItem in player.equipment )
              {
                console.log("view from equipment");
                itemId = player.equipment[viewItem];
                slot=viewItem;
                from="equipment";
              }
            } else {
              /*since we're trading, a-j is any item we have
                offered to trade.
              */
              if( viewItem in trading.weOffer.items )
              {
                console.log("item in trade.weoffer");
                itemId = trading.weOffer.items[viewItem].id;
                slot= viewItem;
                from="offered";
              }
            }
          }          
          
          console.log(" ItemId: "+itemId+", slot: "+slot);
          if(itemId==-1||(slot==-1)||from==-1)
            return;            
          player.view="item";
          displayItemDetails(itemId,slot,from);
        break;
        
        case "looklist":
          console.log("a-z for looklist");
          var viewEntity = listKey;
          if( (viewEntity+lookOffset) in lookList )
          {
            //console.log(" found entity: "+Entity.List[lookList[viewEntity+lookOffset]].attr("name") );
            lookAt( lookList[ viewEntity+lookOffset ] );
          }
        break;
      }
    }
    //enter
    //todo: consider moving this code into menus
    if( e.which == 13 )
    {
      //player reporting a bug:
      if( player.view=="bug")
      {
        return;
      }
      //Check if the player is logged in yet:
      if( player.name != -1)
      {
        //If we don't already have the chat input box up
        if(!player.chatting)
        {
          enableChat();
        } else {
          //We were typing a message, and we pressed enter.
          //chatlock is a command "/" to allow players to continuously type,
          //even after sending a message, the chat box will continue to be open
          if(player.chatlock==0)
            player.allowInput=1;            
          //if the message wasn't empty,
          if( $('#chatinput').val().length > 0 )
          {
            var msg = $('#chatinput').val();            
            //remove a starting space, this is for a bug if focus
            //is applied too quickly to the text box
            if( msg.charAt(0) == " " )
              msg = msg.substr(1,msg.length);
            /*  our default client-side message
              We have our chat string, which is shown in our client
              we have the chat type, which is used for coloring the message
              and for telling the server what kind of message it is
              the chatPacket is the outgoing data for this chat message
            */
            var chatString = "You say, '"+msg+"'";
            var chatType = "say";
            var chatPacket = {type:'chat', data:{ channel:chatType, text:msg  } };
            
            if( msg.charAt(0) == "#" )
            {
              var tmp = msg.split(" ");
              msg = msg.substr(tmp[0].length+1, msg.length);
              var cmd = tmp[0].substr(1,tmp[0].length).toLowerCase();
              chatPacket = {type:'chat', data:{ channel:'gmcmd', cmd:cmd, text:msg } };
              chatString = "#"+cmd+" "+msg;
              chatType = "system";
            }            
            //The message begins with a / implying the client is doing
            //some sort of command. 
            if( msg.charAt(0) == "/" )
            {
              //split the command from the message (commands don't have spaces)
              var tmp = msg.split(" ");
              msg = msg.substr(tmp[0].length+1, msg.length);
              var cmd = tmp[0].substr(1,tmp[0].length).toLowerCase();
              switch( cmd )
              {
                case 'debugwindow':
                  debugWindow = 1;
                  $('#debug').show();
                  chatString="";
                  chatType="";
                  chatPacket="";
                break;
                case 'xyzzy':
                  chatPacket={type:'chat', data:{ channel:'cmd', text:msg  } };
                  chatType="emote";
                  chatString="Nothing happens";
                break;
                //chat lock is for continuous typing, when a player might just
                //be chatting.
                case 'lock':
                  player.allowInput=player.chatlock;
                  player.chatlock = (player.chatlock)?0:1;
                  chatString="Chat lock is "+(player.chatlock?'ON':'OFF');
                  chatType="system";
                  //This is a client-side feature, so no need to tell the server
                  chatPacket="";
                break;
                case 'bug':
                  player.view="bug";
                  $('#bugreport').show();
                  $('#bugreportdesc').html(msg);
                  chatString="";
                  chatType="";
                  chatPacket="";
                  setTimeout( function(){ $('#bugreportdesc').focus(); },40); 
                  setStatus('Reporting a bug. <span style="color:#ff9900">ESC</span> to cancel.');
                break;                           
                //Player emote.
                case 'me':
                case 'em':
                case 'emote':
                  if( msg !== undefined && msg.length > 0 )
                  {
                    chatString = "You "+msg+"";
                    chatType = "emote";
                    chatPacket = {type:'chat', data:{ channel:chatType, text:msg  } };
                  } else {
                    chatString="Emote format: /me <emotion>";
                    chatType="system";
                    chatPacket=""; 
                  }
                break; 
                //group chat. chat messages intended just for players that are
                //in the same group as the issuing client
                case 'g':
                case 'group':
                  if( msg !== undefined && msg.length > 0)
                  {
                    if(inGroup)
                    {
                      chatString = "You tell your group, '"+msg+"'";
                      chatType = "group";
                      chatPacket = {type:'chat', data:{ channel:chatType, text:msg  } };
                    }else{
                      chatString = "You're not in a group.";
                      chatType = "say";
                      chatPacket = "";
                    }
                  } else {
                    chatString="Group chat format: /group <message>";
                    chatType="system";
                    chatPacket=""; 
                  }
                break;
                //private message, directed to a specific player
                /*
                  Note that while /tell does generate a client side message:
                  "You tell Drachlen, 'hey'", the server will reply to the
                  issuing client "User not online" if it can't find anyone
                  by that name.
                  I haven't decided if I want to remove the client side
                  message or not.
                */
                case 'r':
                case 're':
                case 'reply':
                  if( player.lastTellFrom == -1 )
                  {
                    chatString="No one has messaged you.";
                    chatType="system";
                    chatPacket="";
                  } else {                      
                    var tellTo = player.lastTellFrom;
                    if( tellTo !== undefined && tellTo.length > 0 && msg !== undefined && msg.length > 0)
                    {
                      chatString = "You tell "+tellTo+", '"+msg+"'";
                      chatType = "tell";
                      chatPacket = {type:'chat', data:{ channel:chatType, text:msg, player:tellTo  } };
                    } else {
                      chatString="Tell format: /tell <username> <message>";
                      chatType="system";
                      chatPacket=""; 
                    }                    
                  }
                break;
                case 't':
                case 'tell':
                  //the name of the recipient--names never have spaces
                  if( !(1 in tmp) )
                  {
                    chatString="Tell format: /tell <username> <message>";
                    chatType="system";
                    chatPacket=""; 
                  } else {
                    var tellTo = tmp[1];
                    msg = msg.substr(tellTo.length+1, msg.length);
                    if( tellTo !== undefined && tellTo.length > 0 && msg !== undefined && msg.length > 0)
                    {
                      chatString = "You tell "+tellTo+", '"+msg+"'";
                      chatType = "tell";
                      chatPacket = {type:'chat', data:{ channel:chatType, text:msg, player:tellTo  } };
                    } else {
                      chatString="Tell format: /tell <username> <message>";
                      chatType="system";
                      chatPacket=""; 
                    }
                  }
                break;                
                /*
                  out of character chat.
                  this chat is server-wide. it also implies that the message
                  contained within it is basically speaking from a person's
                  perspective, and not from their character's perspective.
                  this is useful for anyone who likes to roleplay.
                  ooc chat can be seen by anyone online.
                */
                case 'ooc':
                  if( msg !== undefined && msg.length>0)
                  {
                    chatString = "You say out of character, '"+msg+"'";
                    chatType = "ooc";
                    chatPacket = {type:'chat', data:{ channel:chatType, text:msg  } };
                  } else {
                    chatString="OOC format: /ooc <message>";
                    chatType="system";
                    chatPacket=""; 
                  }
                break;
                case 'help':
                  menus[0][63]();
                  chatString="";
                  chatType="";
                  chatPacket="";
                break;
                
                
                /*
                  -any- other command that wasn't handled above.
                  Even if the client doesn't specifically know of the command,
                  it will be sent to the server. I don't think it's important
                  that the client is aware of all of the commands that the
                  server can process, even though it doesn't make much of a
                  difference.
                */
                default:
                  chatPacket = {type:'chat', data:{ channel:'cmd',cmd:cmd, text:msg } };
                  chatString = cmd+" "+msg;
                  chatType = "system";
                break; 
              }                
            }
            // Verify that there's any text to send
            if( chatString.length > 0 )
            {             
              //Show the result in our client:
              chatmsg(escapeHtml(chatString), chatColors[chatType]);          
            }
            //Tell the server what we did:
            if( typeof chatPacket == "object")
            {
              chatPacket.data.target = player.target;
              socket.send(chatPacket);
            }      
          }
          //clear our input box
          $('#chatinput').val('');
          //hide the input box if chatlock is off
          if(!player.chatlock)
          {
            $('#chatinput').hide();
            player.chatting=0;
          }
        }
      } else {
        //if the player is not logged in and they press enter, attempt to login
        login();
      }
    }
  });
  /*
    When a player presses a key, do the following:
    1. verify if the player is allowed to issue any commands (player.allowInput)
    2. set the keystate to 1 for that key (debounce)
    3. add the keypress to a queue, in case they pressed the key between
    loops of the think tick
  */
  $(document).keydown(function(e)
  {     
    //console.log("keydown: "+e.which);
    
    // If the player is not chatting AND the player is allowed to input,
    if( !player.chatting&&player.allowInput)
    {
      var key = e.which;
      //special handler to capture esc key, duplicate code
      //if space was pressed, ignore it since it will be caught with keypress
      if( key == 32)
        return;
      
      //special handler for bug report window because SPACE does not close it  
      if( key == 27 && player.view=="bug")
      {
        player.view=0;
        $('#bugreport').hide();
        $('#bugreportdesc').val('');
      }
      //if esc was pressed, treat it like space was pressed
      if( key == 27)
        key=32;
      //if this menu (view) has a handler for this key, execute code
      if( key == 32 && player.view in menus && key in menus[player.view] )
      {
        menus[player.view][key]();
        return;
      }
    } 
    
    
    if( !player.allowInput )
      return;      
    //if the player is pressing an ability key 0-9
    if( e.which>47 && e.which<58)
    {
      var slot = e.which-48;
      
      switch( player.view )
      { 
        case 0:
          doAbility(slot);
        break;
        case 'abilites':
          if( player.actions[slot] == -1 )
            return;
          abilityDetails(slot, slot);
        break;
        case 'abilitydetails':
          if( currentDisplayedAbilityHotkey == -1 && currentDisplayedAbility != -1)
          {
            var dupe=0;
            for(var i in player.actions)
            {
              if( player.actions[i] == currentDisplayedAbility)
                dupe=1;
            }
            if( !dupe )
            {
              player.actions[slot] = currentDisplayedAbility; 
              console.log("render here");
              menus.abilitydetails[32]();
              renderAbility(slot);
            } else {
              setStatus("This ability is already on a hotkey.");
            }
          }
        break;
        case 'inventory':
          console.log("number pressed from inv. num is:"+slot);
          if(slot==0)
            slot=9;
          else
            slot--;
          if( slot in trading.theyOffer.items )
          {
            player.view="item";
            displayItemDetails( trading.theyOffer.items[slot].id,slot,'theyoffer');
          }
        break;
        case 'groupkick':
          kickGroupMember(slot);
        break;
      }
    }
    
    if( player.view == "performingaction")
    {
      switch(e.which)
      {
      
        //NORTH
        case 104:
        case 38:
          console.log("do action NORTH");
          performAbility(player.performingAction, -1, 'north');
        break;
        //SOUTH
        case 98:
        case 40:
          console.log("do action SOUTH");
          performAbility(player.performingAction, -1, 'south');
        break;
        //5 (SOUTH OR DOWN?)
        case 101:
          console.log("this is 5, center of numpad. What direction for action? DOWN? SOUTH?");
        break;
        //WEST
        case 100:
        case 37:
          console.log("do action WEST");
          performAbility(player.performingAction, -1, 'west');
        break;
        //EAST
        case 102:
        case 39:
          console.log("do action EAST");
          performAbility(player.performingAction, -1, 'east');
        break;     
      }
    } else { 
      keystate[e.which] = 1;
      if(player.view==0||player.view=="look")
        queuedKey[e.which] = 1;
    }
  });
  $(document).keyup(function(e)
  {
    keystate[e.which] = 0;
  });
  tickInterval = setInterval(tick, 10);
});
function tick()
{
  var time = new Date();         
  frame = time.getTime();
  if( (player.x != -1 && player.y != -1) && player.allowInput )
  {
    if(player.view == "look")
      updateCursor();
    else      
      checkMovement();    
    //$('#player').css({'left':player.x*10, 'top':player.y*10});
    //$('#player').animate({'left':player.x*10, 'top':player.y*10},10);  
  }  
}

