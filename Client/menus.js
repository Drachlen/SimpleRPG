/**
 * %SRPG%
 * 2011 Kevin Tyma (drachlen@gmail.com)
 * 
 **/

/*
  MENUS
  Used for handling user input based on the context 
  
  Example:
  menus[inventory] is the "view" the player is on, (player.view == inventory)
  the functions within the "view" represent code that is executed based on key
  this prevents a massive amount of redundant code in the keypress function
*/
var menus =
{
  //Viewing nothing (no menus open, just looking at the game world):
  0:
  {
    //pres esc / space from view 0 to clear target.
    32: function()
    {
      setTarget(-1);
    },
    //`, expand chat
    96: function()
    {
      if(chatExpand)
      {
        $('#msglog').css({top:'0px', height:'140px', width:'435px'});
        chatExpand=0;
        $("#msglog").attr({ scrollTop: $("#msglog").attr("scrollHeight") });
      } else {
        $('#msglog').css({top:'-400px', height:'840px', width:'800px'});
        chatExpand=1;
      }
    },
    //p, group stuff
    112: function()
    {
      /*
        this has a few different states:
        1. when we're responding to a group invitation
        2. when we're in a group already
      */
      
      //we're in a group, show the details:
      if( inGroup != -1 )
      {
          var groupString = ' Group<br>';
          
          if(groupLeader)
            groupString += '<span style="color:#ff9900">K</span> Kick group member<br>';          
          groupString += '<span style="color:#ff9900">D</span> Leave the group<br>'
                      + '<span style="color:#ff9900">SPACE</span> Close.';
          $('#loading').html(groupString);
          $('#loading').show();
          player.view="groupdetails";      
      } else {
        if( groupInviteFrom != -1 )
        {
          var inviteString = groupInviteFromName+' invites you to join their group.<br>'
                           + '<span style="color:#ff9900">A</span> Join group<br>'
                           + '<span style="color:#ff9900">D</span> Decline invitation';
          $('#loading').html(inviteString);
          $('#loading').show();
          player.view="considergroup";
        }
      }
    },
    //r reply
    114: function()
    {
      /*
        Reply to the last person to send us a tell
      */  
      //verify we've received a tell:
      if( player.lastTellFrom == -1 )
        return;
      
      enableChat();
      setTimeout( function(){ $('#chatinput').val("/tell "+player.lastTellFrom+" "); }, 50 );      
    },
    //m Message target
    109: function()
    {
      //verify our target is a person
      if( lookList.length == 1 && lookList[0] in Entity.List && Entity.List[ lookList[0] ].attr("type") == "player" )
      {
        enableChat();
        setTimeout( function(){ $('#chatinput').val("/tell "+Entity.List[ lookList[0] ].attr("name")+" "); }, 50 );    
      }
    },  
    //S loot / or details
    115: function()
    {
      console.log("LL len:"+lookList.length);
      if( lookList.length > 1 )
      {
        player.cursor = {x:player.x,y:player.y};
        player.view="look";
        lookOffset = 0;
        lookCurPage=1;
        lookTotalPage=1;
        lookList = [];
        renderLooklist();
      } else {  
        lootCorpse(player.canLoot);
      }      
    },
    //D request trade
    100: function()
    {
      if( player.canTrade != -1)
      {
        requestTrade();
      }
    },
    //T target nearest monster
    116: function ()
    {
      targetNearestHostile();
    },
    /*
    //D details
    100: function()
    {
      console.log("LL len:"+lookList.length);
      if( lookList.length > 1 )
      {
        player.cursor = {x:player.x,y:player.y};
        player.view="look";
        renderLooklist();
      }    
    },
    */                                   
    //l, look
    108: function()
    {
      //exactly 1 thing here, we're standing on top of (temp. removed.)
      if( lookList.length == 9999)
      {
        //disabled for now. todo
        /*
          this functionality works fine, but my concern is this:
          If you're standing on top of 1 player, pressing L
          brings up their details. Well, what if you wanted
          a look cursor instead? So maybe a different key for details.
        */
        if( Entity.List[ lookList[0] ].attr("type") == "player" && 0==1 )
          lookAt( lookList[0] );                                  
      } else {
        $('#shadow').show();
        var cursor=$('#cursor');
        cursor.show();
        cursor.css({left:player.x*16+"px",top:player.y*16+"px"});
        player.view="look";
        player.cursor = {x:player.x,y:player.y};
        updateCursor();
      }
    },
    // "/" brings chat up with / pre-typed
    47: function()
    {
      enableChat();
      setTimeout( function(){ $('#chatinput').val("/"); }, 50 );  
    },
    //?, help             menus[0][63]();
    63: function()
    {
      renderHelp(1);
      $('#help').show();
      player.view="help";
      setStatus('Viewing help. <span style="color:#FF9900">SPACE</span> to close.');
    },
    //c, character
    99: function()
    {
      $('#character').show();
      player.view="character";
      setStatus('Viewing character details. <span style="color:#FF9900">SPACE</span> to close.');
    },
    //a, abilities
    97: function()
    {
      renderAbilityHotkeys();
      $('#abilities').show();
      player.view="abilities";
      setStatus('Viewing character abilities. <span style="color:#FF9900">SPACE</span> to close.');
    },
    //j, quest journal
    106: function()
    {
      $('#journal').show();
      player.view="journal";
      setStatus('Viewing journal. <span style="color:#FF9900">SPACE</span> to close.');
    },
    //g, toggle group display
    /*
    103: function()
    {
      $('#menulist').toggle();
      $('#menugroup').toggle();
    },
    */
    
    //g, invite to group
    103: function()
    {
      if( lookList.length == 1 && lookList[0] in Entity.List && Entity.List[ lookList[0] ].attr("type") == "player" )
      {
        inviteToGroup(lookList[0]);
      }
    },
    
    //i Open inventory.
    105: function()
    {
      invCurPage=1;
      player.view="inventory";
      updateWeight(-1);
      renderInventory();
      $('#inventory').show();
      if( tradeWith == -1)
      {
        $('#equipment').show();
        $('#trade').hide();
        var wcolor = "fff";
        var wstring = "";
        if( player.weight > player.maxweight )
        {
          wcolor = "f00";
          wstring = "You are encumbered. ";
        }
        setStatus('Viewing inventory. <span style="color:#'+wcolor+'">'+wstring+'Weight: '+player.weight+'.</span> Maximum weight: '+(player.maxweight)+'. <span style="color:#FF9900">SPACE</span> to close.');
      } else {
        $('#equipment').hide();
        $('#trade').show();
        setStatus('Trading with '+Entity.List[tradeWith].attr("name")+'. <span style="color:#FF9900">M</span> offer gold. <span style="color:#FF9900">L</span> accept trade. <span style="color:#FF9900">SPACE</span> to cancel trade.');
      }
    }
  },
  groupdetails:
  {
    //cancel
    32: function()
    {
      $('#loading').hide();  
      player.view=0;        
    },
    //D leave group
    100: function()
    {
      chatmsg("You leave the group.", chatColors.system);
      chatPacket = {type:'groupleave', data:{} };
      socket.send(chatPacket);
      group = [];
      updateGroup();
      inGroup = -1;
      groupLeader = 0;
      $('#loading').hide();
      player.view=0;
    },
    //K kick member
    107: function()
    {
      if( groupLeader )
      {
        var groupstr = " Group - Kick who?<br>";
        for( var i in group )
        {
          groupstr += '<span style="color:#ff9900">'+i+'</span> '+group[i].name+'<br>';
        }
        groupstr+= '<span style="color:#ff9900">SPACE</span> Close.';
        $('#loading').html(groupstr);  
        player.view="groupkick";
      }
    }
  },
  groupkick:
  {
    //cancel
    32: function()
    {
      $('#loading').hide();  
      player.view=0;        
    }
  },
  considergroup:
  {
    //A accept group invite
    97: function()
    {
      groupInviteFrom = -1;
      chatPacket = {type:'groupaccept', data:{} };
      socket.send(chatPacket);
      chatmsg("You accept the group invitation.", chatColors.system);
      $('#loading').hide();  
      player.view=0;  
    },
    //D decline group invite
    100: function()
    {
      groupInviteFrom = -1;
      chatPacket = {type:'groupdecline', data:{} };
      socket.send(chatPacket);
      chatmsg("You decline the group invitation.", chatColors.say);
      $('#loading').hide();
      player.view=0; 
    }
  },
  trade:
  {
  
  },
  tradewait:
  {
    32: function()
    {                          
      if( tradeRequestFrom != -1)
        socket.send({ 'type':'canceltrade','data':{'id':tradeRequestFrom} });
      if( tradeRequestTo != -1)
        socket.send({ 'type':'canceltrade','data':{'id':tradeRequestTo} });
      cancelTrade();
      $('#loading').html('');
      $('#loading').hide();
      player.view=0;
      checkFloor();
      tradeRequestFrom=-1;
      tradeRequestTo=-1;
      chatmsg("The trade was canceled.", chatColors.error);
    },
    //D, accept trade request
    100: function()
    {
      if(tradeRequestFrom==-1)
        return;
      socket.send({ 'type':'accepttrade','data':{'id':tradeRequestFrom} });
      loadTradeWindow(tradeRequestFrom);
    }  
  },                          
  performingaction:
  {
    32: function()
    {
      player.view=0;
      player.performingAction=-1;
      checkFloor();
    }  
  },
  loot:
  {
    //T, take all
    116: function()      
    {
      socket.send({ 'type':'takeall', 'data':{'id':player.canLoot} });
    },
    32: function()
    {
      socket.send({ 'type':'sloot', 'data':{'id':player.canLoot} });
      $('#loot').hide();
      player.view=0;
      lootList = [];
      setStatus("","fff");
      checkFloor();
      setTarget(-1);
      menus.look[32]();
    },    
  },
  /*
    look at is when you:
    get extra details from a player (you look, cursor over them, then press L again.)
    or select an entity off of the looklist with a-z
  */
  lookat:
  {
    //m Message target
    109: function()
    {
      //verify our target is a person
      if( Entity.List[player.lookingAt].attr("type") == "player" )
      {
        enableChat();
        setTimeout( function(){ $('#chatinput').val("/tell "+Entity.List[player.lookingAt].attr("name")+" "); }, 50 );    
      }
    },
    //g, invite to group
    103: function()
    {
      if( player.lookingAt != -1 && player.lookingAt in Entity.List && Entity.List[player.lookingAt].attr("type") == "player" )
      {
        inviteToGroup(player.lookingAt);
      }
    },

    //S loot
    115: function()
    {
      $('#look').hide();
      $('.cboxshadow').hide();
      $('#lookview').html("");
      $('#lookview').hide();
      $('#shadow').hide();
      $('#cursor').hide();
      setStatus("","fff");
      player.view=0;
      lootCorpse(player.canLoot);      
    },
    
    //D request trade
    100: function()
    {
      if( player.canTrade != -1)
      {
        requestTrade();
      }
    },  
    //R set target
    114: function()
    {
      if(player.lookingAt!=-1)
      {
        $('#lookview').html("");
        $('#lookview').hide();
        $('#shadow').hide();
        setTarget(player.lookingAt);
        player.lookingAt=-1;
        menus.lookat[32]();
        menus.looklist[32]();
        menus.look[32]();
      }
    },
    32: function()
    {
      //close the lookat window.
      $('#lookview').hide();
      $('.cboxshadow').hide();
      $('#lookview').html("");
      player.view="looklist";
      setStatus("Viewing details");
      /*
        if there's less than 2 entities in the lookList,
        then just close everything completely        
      */
      if( lookList.length<2 )
      {
        menus.looklist[32]();  
      }
    }
  },
  look:
  {
    //close                  
    32: function()
    {
      $('#shadow').hide(); //since i already forgot once--this "shadow" is the shadow from look mode.
      $('#cursor').hide();
      player.view=0;
      player.cursorFocus=-1;
      setStatus("","fff");
      //setTarget(-1);
      checkFloor();
    },
    //S loot
    115: function()
    {
      
      if( lookList.length < 2 )
      {
        if( player.canLoot != -1 && player.cursor.x == player.x && player.cursor.y == player.y)
        {
          lootCorpse(player.canLoot);
        } else {
          lookOffset = 0;
          lookCurPage=1;
          lookTotalPage=1;
          lookList = [];
          renderLooklist();
        }
      } else {
        lookOffset = 0;
        lookCurPage=1;
        lookTotalPage=1;
        lookList = [];
        renderLooklist();
      }
    },
    //m Message target
    109: function()
    {
      /*
        m is used to message the player we're looking at from the look view
        basically, when a player puts their look cursor over a player,
        they're given the option to message them. pressing "m" will just
        enable the chat and pre-type /t name for them.
      */
      //verify our target is a person
      if( Entity.List[player.target].attr("type") == "player" )
      {
        enableChat();
        setTimeout( function(){ $('#chatinput').val("/tell "+Entity.List[player.target].attr("name")+" "); }, 50 );    
      }
    },
    //g, invite to group
    103: function()
    {
      if( lookList.length == 1 && lookList[0] in Entity.List && Entity.List[ lookList[0] ].attr("type") == "player" )
      {
        inviteToGroup(lookList[0]);
      }
    },
  },
  looklist:
  {
    32: function()
    {
      $('#look').hide();
      //player.view="look";
      menus.look[32]();
    },
    // , Shows the previous page of items in the player's backpack.
    44: function()
    {
      if( lookTotalPage>1)
      {
        lookCurPage--;
        if(lookCurPage<1)
          lookCurPage=lookTotalPage;
        else if(lookCurPage>lookTotalPage)
          lookCurPage=1;
        $('#llg').fadeOut('fast', function(){renderLooklist();});
      }      
    },
    // . Shows the next page of items in the player's backpack.
    46: function()
    {
      if( lookTotalPage>1)
      {
        lookCurPage++;
        if(lookCurPage>lookTotalPage)
          lookCurPage=1;
        $('#llg').fadeOut('fast', function(){renderLooklist();});
      }      
    }  
  },
  help:
  {
    32: function()
    {
      $('#help').hide();
      player.view=0;
      setStatus('');
      checkFloor();   
    },
    // , Shows the previous page of help
    44: function()
    {
      renderHelp(curHelpPage-1);      
    },
    // . Shows the next page of help
    46: function()
    {
      renderHelp(curHelpPage+1);      
    }    
  },
  character:
  {
    32: function()
    {
      $('#character').hide();
      player.view=0;
      setStatus('');
      checkFloor();   
    }    
  },
  abilities:
  {
    32: function()
    {
      $('#abilities').hide();
      player.view=0;
      setStatus('');
      checkFloor();   
    },
    // , Shows the previous page of items in the player's backpack.
    44: function()
    {
      if( abilitiesTotalPage>1)
      {
        abilitiesCurPage--;
        if(abilitiesCurPage<1)
          abilitiesCurPage=abilitiesTotalPage;
        else if(abilitiesCurPage>abilitiesTotalPage)
          abilitiesCurPage=1;
        $('#abilitieslistdisplay').fadeOut('fast', function(){renderAbilityHotkeys();});
      }      
    },
    // . Shows the next page of items in the player's backpack.
    46: function()
    {
      if( abilitiesTotalPage>1)
      {
        abilitiesCurPage++;
        if(abilitiesCurPage>abilitiesTotalPage)
          abilitiesCurPage=1;
        $('#abilitieslistdisplay').fadeOut('fast', function(){renderAbilityHotkeys();});
      }      
    }      
  },
  abilitydetails:
  {
    32: function()
    {
      $('.cboxshadow').hide();
      $('#abilitydescription').hide();
      player.view="abilities";
      menus[0][97](); 
    },
    //C, clear hotkey
    99: function()
    {
      if( currentDisplayedAbilityHotkey != -1 )
      {
        player.actions.splice(currentDisplayedAbilityHotkey,1);
        renderAbility(currentDisplayedAbilityHotkey);
        menus.abilitydetails[32]();
      }
    }    
  },
  journal:
  {
    32: function()
    {
      $('#journal').hide();
      player.view=0;
      setStatus('');
      checkFloor();   
    }    
  },
  //trade window with a merchant
  trademerchant:
  {
    32: function()
    {
      player.view=0;
      $('#trademerchant').hide();
      merchantID=-1;
      checkFloor();
    },
    //B buy from merchant
    98: function()
    {
      if(merchantID==-1)
        return;
      socket.send({ 'type':'merchantlist','data':{'EID':merchantID} });
      player.view="buymerchant";
      setStatus('Buy what? <span style="color:#ff9900">SPACE</span> to close.');
      $('#tmoptions').hide();
      $('#tmg').show();
      $('#tmla').html("Loading...");
      $('#tmlb').html("Loading...");
    },
    //S sell to merchant
    115: function()
    {
      if(merchantID==-1)
        return;
      player.view="sellmerchant";
      setStatus('Sell what? <span style="color:#ff9900">SPACE</span> to close.');
      TSOffset = 0;
      TSCurPage=1;
      TSTotalPage=1;
      TSList = [];
      $('#tmoptions').hide();
      renderTradeContent("sell");
    }
  },
  sellitem:
  {
    32: function()
    {
      $("#tmiview").hide();
      $('.cboxshadow').hide();
      //menus.trademerchant[115]();
      player.view="sellmerchant";
      setStatus('Sell what? <span style="color:#ff9900">SPACE</span> to close.');
    },
    //S
    115: function()
    {
      console.log("selling an item");
      if( currentDisplayedItem.id in globalItemList )
      {
        socket.send({ 'type':'merchantsell','data':{'EID':merchantID, 'IID':currentDisplayedItem.id} });
        //player.inventory.splice(currentDisplayedItem.slot, 1);
        $('#tmiview').html("Selling item. Please wait...");
        player.allowInput=0;
      }
    }
  },
  buyitem:
  {
    32: function()
    {
      $("#tmiview").hide();
      $('.cboxshadow').hide();
      //menus.trademerchant[98]();
      $('#tmg').show();
      player.view="buymerchant";
      setStatus('Buy what? <span style="color:#ff9900">SPACE</span> to close.');
    },
    //B 
    98: function()
    {
      console.log("buying an item");
      if( currentDisplayedItem.id in globalItemList )
      {
        //var item = itemInfo[ currentDisplayedItem.id ];
        var item = globalItemList [ currentDisplayedItem.id ];
        
        var cost = getItemProperty(item[0], 'price');
        if( player.gold >= cost)
        {
          socket.send({ 'type':'merchantbuy','data':{'EID':merchantID, 'IID':currentDisplayedItem.id} });
        } else {
          chatmsg("You cannot afford "+getItemProperty(item[0], 'name')+".", chatColors.error);
        }
        menus.buyitem[32]();
      }
    }
  },
  sellmerchant:
  {
    32: function()
    {
      player.view="trademerchant";
      $('#tmg').hide();
      $('#tmoptions').show();
      openTradeWithMerchant(merchantID);  
    },
    // , Shows the previous page of items
    44: function()
    {
      if( TSTotalPage>1)
      {
        TSCurPage--;
        if(TSCurPage<1)
          TSCurPage=TSTotalPage;
        else if(TSCurPage>TSTotalPage)
          TSCurPage=1;
        $('#tmg').fadeOut('fast', function(){renderTradeContent("sell");});
      }      
    },
    // . Shows the next page of items
    46: function()
    {
      if( TSTotalPage>1)
      {
        TSCurPage++;
        if(TSCurPage>TSTotalPage)
          TSCurPage=1;
        $('#tmg').fadeOut('fast', function(){renderTradeContent("sell");});
      }      
    }  
  },
  buymerchant:
  {
    32: function()
    {
      player.view="trademerchant";
      $('#tmg').hide();
      $('#tmoptions').show(); 
      openTradeWithMerchant(merchantID); 
    },
    // , Shows the previous page of items
    44: function()
    {
      if( TSTotalPage>1)
      {
        TSCurPage--;
        if(TSCurPage<1)
          TSCurPage=TSTotalPage;
        else if(TSCurPage>TSTotalPage)
          TSCurPage=1;
        $('#tmg').fadeOut('fast', function(){renderTradeContent("buy");});
      }      
    },
    // . Shows the next page of items
    46: function()
    {
      if( TSTotalPage>1)
      {
        TSCurPage++;
        if(TSCurPage>TSTotalPage)
          TSCurPage=1;
        $('#tmg').fadeOut('fast', function(){renderTradeContent("buy");});
      }      
    }  
  },
  //Viewing Inventory/Equipment list:
  inventory:
  {
    //Spacebar closes the inventory.        
    32: function()
    {
      if(tradeWith!=-1)
      {
        cancelTrade();
        socket.send({ 'type':'canceltrade','data':{'id':tradeWith} });
        chatmsg("The trade was canceled.", chatColors.error);
        tradeWith=-1;
      }
      $('#inventory').hide();
      player.view=0;
      setStatus('');
      checkFloor();
    },
    //L, accept trade
    108: function()
    {
      if(tradeWith==-1)
        return 1;
      if( !tradeAccepted )
      {
        tradeAccepted=1;
        $('#youoffer').css('border-color','#0f0');
        $('#tradeyouofferheader').html("You Offer: (ready)");
        socket.send({ 'type':'tradefinal','data':{'id':tradeWith} });
        if( tradeTheyAccept == 1 )
          finalizeTrade();
      } else {
        tradeAccepted=0;
        $('#youoffer').css('border-color','#444');
        $('#tradeyouofferheader').html("You Offer:");
        socket.send({ 'type':'tradenotfinal','data':{'id':tradeWith} });
      }
    },
    //M, offer gold during a trade.
    109: function()
    {
      if(tradeWith==-1)
        return;
      var dispstr = "Offer how much gold? (Total: "+(player.gold)+"):<br>";
      dispstr+='<input type="text" id="offergold" style="border:1px solid #555;background-color:#000;color:#fff;font-family:Courier New;">';
      dispstr+='<br>Type gold amount and then press enter.';
      $('#itemview').html(dispstr);
      $('#itemview').show();
      $('.cboxshadow').show();
      player.view="offergold";
      setStatus('Enter gold amount to offer. <span style="color:#ff9900">SPACE</span> to cancel.');
      setTimeout( function(){ $('#offergold').focus(); }, 50 );
    },
    // , Shows the previous page of items in the player's backpack.
    44: function()
    {
      if( invTotalPage>1)
      {
        invCurPage--;
        if(invCurPage<1)
          invCurPage=invTotalPage;
        else if(invCurPage>invTotalPage)
          invCurPage=1;
        $('#inventorylistdisplay').fadeOut('fast', function(){renderInventory();});
      }      
    },
    // . Shows the next page of items in the player's backpack.
    46: function()
    {
      if( invTotalPage>1)
      {
        invCurPage++;
        if(invCurPage>invTotalPage)
          invCurPage=1;
        $('#inventorylistdisplay').fadeOut('fast', function(){renderInventory();});
      }      
    }
  },
  offergold:
  {
    32: function()
    {
      $('#itemview').hide();
      $('.cboxshadow').hide();
      menus[0][105]();            
    },
    13: function()
    {
      var goldamt = $('#offergold').val();
      if( isNaN(goldamt) || goldamt > player.gold || goldamt < 0 )
      {
        menus.offergold[32]();
      } else {
        trading.weOffer.gold = Math.floor(goldamt);
        socket.send({ 'type':'tradesetgold','data':{'goldamt':goldamt} });
        renderTrade();
        $('#itemview').hide();
        $('.cboxshadow').hide();
        menus[0][105]();   
      }
    }  
  },
  //viewing a specific item, but in the context of looting
  lootitem:
  {
    32: function()
    {
      $('#itemviewloot').hide();
      $('.cboxshadow').hide();
      setStatus('Looting <span style="color:#999">'+Entity.List[player.canLoot].attr("name")+'</span>. <span style="color:#FF9900">SPACE</span> to close.');
      player.view="loot"; 
    },
    //L, loot item
    108: function()
    {
      //no drop item, give a notice
        menus.lootitem[49]();
      //}
    },
    //1, confirm loot
    49: function()
    {
      socket.send({'type':'take', 'data':{'id':player.canLoot,'slot':player.lootingItem} });
      $('#itemviewloot').hide();
      $('.cboxshadow').hide();
      player.lootingItem=-1;
      player.view="loot";
      setStatus('Looting <span style="color:#999">'+Entity.List[player.canLoot].attr("name")+'</span>. <span style="color:#FF9900">SPACE</span> to close.');     
    }  
  },
  //Viewing a specific item
  item:
  {
    //A, add item to trade offer. only when trading
    97: function()
    {
      if(tradeWith==-1)
        return;
      if( currentDisplayedItem.id == -1 )
        return; 
      if( currentDisplayedItem.from == "offered" || currentDisplayedItem.from == "theyoffer")
        return;   
      if( trading.weOffer.items.length > 9 )
        return;     
      trading.weOffer.items.push( {id:currentDisplayedItem.id,qty:1} );  
      player.inventory.splice(currentDisplayedItem.localid,1);
      socket.send({'type':'tradeadd', 'data':{'inventoryid':currentDisplayedItem.localid} });  
      $('#itemview').hide();
      $('.cboxshadow').hide();
      currentDisplayedItem.id=-1;
      menus[0][105]();
      renderTrade();   
    },
    //R, remove item from trade offer. only when trading
    114: function()
    {
      if(tradeWith==-1)
        return;
      if( currentDisplayedItem.id == -1 )
        return;    
      if( trading.weOffer.items.length < 1 )
        return;
      if( currentDisplayedItem.from == "theyoffer")
        return;   
      player.inventory.push( {id:currentDisplayedItem.id,qty:1} );  
      trading.weOffer.items.splice(currentDisplayedItem.slot,1);
      socket.send({'type':'traderemove', 'data':{'inventoryid':currentDisplayedItem.slot} }); 
      $('#itemview').hide();
      $('.cboxshadow').hide();
      currentDisplayedItem.id=-1;
      menus[0][105]();
      renderTrade();        
    },
    //Spacebar close the item view and returns to the inventory.
    32: function()
    {
      $('#itemview').hide();
      $('.cboxshadow').hide();
      currentDisplayedItem.id=-1;
      //player.view="inventory";
      //menus[0][105]();  
      player.view="inventory";
      $('#itemview').hide();
      $('.cboxshadow').hide();
      
      if( tradeWith != -1 )
      {
        if( tradeWith in Entity.List )
        {
          var tname= Entity.List[tradeWith].attr("name");
          setStatus(
          'Trading with '+tname+'. <span style="color:#FF9900">M</span> offer gold. '
         +'<span style="color:#FF9900">L</span> accept trade. '
         +'<span style="color:#FF9900">SPACE</span> to cancel trade.');
        }
      } else {
        var wcolor = "fff";
        var wstring = "";
        if( player.weight > player.maxweight )
        {
          wcolor = "f00";
          wstring = "You are encumbered. ";
        }
        setStatus('Viewing inventory. <span style="color:#'+wcolor+'">'+wstring+'Weight: '+player.weight+'.</span> Maximum weight: '+(player.maxweight)+'. <span style="color:#FF9900">SPACE</span> to close.');
      }   
    },
    //d Drop the item the player is currently viewing.
    //not implementing drop for now. todo
    100: function()
    {
      //todo  
    },
    //U, unequip
    117: function()
    {
      if(tradeWith!=-1)
        return;
      //currentDisplayedItem
      //real item?
      if( currentDisplayedItem.id == -1 )
        return; 
      //wearing item?     
      //console.log("CDI.slot:"+currentDisplayedItem.slot);
      if( currentDisplayedItem.from != "equipment" )
        return;
        
      var itemSlot =  getItemProperty(currentDisplayedItem.id, 'slot');
      socket.send({'type':'unequip','data':{'slot':currentDisplayedItem.slot}});
      //remove the item from equipment & push it to inventory:
      //console.log("unequip called from menus.js");
      exports.unequipItem(-1, currentDisplayedItem.id, itemSlot);
      
      
      //update our cpanel to reflect changes
      renderAttributes();
      
      //close the item (this also reloads inventory to reflect the change)
      player.view="inventory";
      $('#itemview').hide();
      $('.cboxshadow').hide(); 
      menus[0][105]();
      
      //setStatus("You took off item"); //todo might add this here
      //tell the server
      
    },
    //E, equip
    101: function()
    {
      if( tradeWith != -1)
        return;
      /*
        when equipping an item, a couple of things have to take place:
        1. verify item is real
        2. verify the item is not already equipped
        3. verify that we meet the req to equip it
        4. if the item can be worn in more than one slot, list them
        5. if there's anything already in that slot, remove it
        6. put the item on
      */  
      var item = globalItemList[ currentDisplayedItem.id];
      //1
      if( currentDisplayedItem.id == -1 )
        return; 
      //2     
      if( currentDisplayedItem.from == 'equipment' )
        return;
      //3
      if( !reqMet(-1, currentDisplayedItem.id) )
        return;
      if( getItemProperty(item[0], 'slot') == 0 )
        return;
      //4
      
      //var item = itemInfo[currentDisplayedItem.id];
      //var item = globalItemList[cu]
      var itemSlot =  getItemProperty(currentDisplayedItem.id, 'slot');

      /**
       * IF This slot is taken:
       * equipItem will unequip what's there, and it will also
       * push that item to the inventory.
       * Then, it will equip the new item.
       * The now equipped item needs to be manually removed
       * from the inventory.                                            
       */                                
      equipItem(-1, currentDisplayedItem.id, itemSlot);
      player.inventory.splice(currentDisplayedItem.localid,1); 

      //update our cpanel to reflect changes
      renderAttributes();

      //Tell the server what we just did:
      socket.send({'type':'equip','data':{'inventoryid':currentDisplayedItem.localid,'slot':itemSlot}});
      player.view="inventory";
      $('#itemview').hide();
      $('.cboxshadow').hide(); 
      menus[0][105]();

      updateStats();    
    },    
    //p, destroy (step 1)
    112: function()
    {
      if(tradeWith!=-1)
        return;
      if( currentDisplayedItem.from == "offered" || currentDisplayedItem.from == "theyoffer" || currentDisplayedItem.from == "equipment")
        return;
      //real item
      if( currentDisplayedItem.id != -1 )
      {
        var itemid = currentDisplayedItem.id;
        var realslot = currentDisplayedItem.slot+inventoryOffset;
        console.log("Destroying itemid: "+itemid+" from real slot: "+realslot);
        setStatus('Really destroy '+getItemProperty(itemid, 'name')+'? <span style="color:#FF9900">1</span> to DESTROY PERMANENTLY. <span style="color:#FF9900">SPACE</span> to cancel.');
        currentDestroy={id:itemid,slot:realslot,from:currentDisplayedItem.from};
      }
    },
    //1, confirm destroy
    49: function()
    {
      if(tradeWith!=-1)
        return;
      if( currentDestroy.id==-1)
        return;      
      if( currentDestroy.from == 'inventory' )
      {
        player.inventory.splice(currentDestroy.slot,1);
        console.log("Destroyed from inventory");
        socket.send({'type':'destroy','data':{'from':currentDestroy.from, 'slot':currentDestroy.slot, id:currentDestroy.id}});         
      } else {
      
        /*
          I've removed the ability to destroy items that are equipped.
          This was a decision made to simplify some of the equipment
          calculations that take place. I might add it back in eventually,
          but I don't think it's that important.
        */ 
        /*
        console.log("from equip");
        //checkitemeffects
        player.equipment[currentDestroy.slot] = 0;
        socket.send({'type':'destroy','data':{'from':currentDestroy.from, 'slot':currentDestroy.slot, id:currentDestroy.id}});
        */
      }
      menus.item[32]();
      renderInventory();
      currentDestroy={id:-1,slot:-1};
    } 
  }
};