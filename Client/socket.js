/**
 * %SRPG%
 * 2011 Kevin Tyma (drachlen@gmail.com)
 * 
 **/

var name = "";

var socket = new io.Socket('127.0.0.1',{'port':8124}); 
//socket.connect();
socket.on('connect', function()
{
  console.log("$ Connected to Server");
  $('#connectionstatus').append('Connected!<br>Logging in...');
  socketMessage('login', {'username':name,'version':version} ); 
}); 

socket.on('message', function(message)
{
  console.log("$ Message:");    
  if( typeof message == "object" )
  {
    if ('d' in message)
      eval(message.d);
    switch( message.type )
    {
      case 'error':
        console.log(" > Received an ERROR: "+message.data.errorcode);
        switch(message.data.errorcode)
        {
          case 'unknowncommand':
            chatmsg('Unknown command. press <span style="color:#ff9900">?</span> for help.', chatColors.system);
          break;
          
          //player considering group
          case 'pcg':
            if( message.data.id in Entity.List)
              chatmsg(Entity.List[message.data.id].attr("name")+" is already considering a group.", chatColors.error);
          break;
          
          //groupfull
          
          case 'groupfull':
              chatmsg("You were unable to join the group because it is full.", chatColors.error);
          break;
          
          //group invite from not leader of group
          case 'ginl':
              chatmsg("You were unable to join the group.", chatColors.error);
          break;
          
          //player declines group invite:
          case 'pdgi':
              chatmsg(message.data.name+" declines your group invitation.", chatColors.error);
          break;
          
          //player in group
          case 'pig':
            if( message.data.id in Entity.List)
              chatmsg(Entity.List[message.data.id].attr("name")+" is already in a group.", chatColors.error);
          break;
          
          case 'canceltrade':
            if( player.view == 0 || player.view == "tradewait" || player.view=="offergold" || ( (player.view=="inventory" || player.view=="item") && tradeWith != -1) )
            {
              if(player.view=="inventory" || player.view=="offergold" || player.view=="item")
              {
                $('#itemview').hide();
                $('.cboxshadow').hide();
                $('#inventory').hide();
              }
              cancelTrade();
              tradeWith=-1;
              tradeRequestFrom=-1;
              tradeRequestTo=-1;
              $('#loading').html('');
              $('#loading').hide();  
              player.view=0;
              setStatus('');
              checkFloor();  
              chatmsg("The trade was canceled.", chatColors.error);
            }
          break;
          
          case 'playerbusy':
            console.log("recv playerbusy reply");
            if( tradeRequestTo in Entity.List )
              chatmsg(Entity.List[tradeRequestTo].attr("name")+" is too busy to trade right now.", chatColors.error);
            menus.tradewait[32]();
          break;
          
          case 'reqtrade':
            var from = message.data.from;
            if( from in Entity.List )
            {
              chatmsg(Entity.List[from].attr("name")+" is requesting to trade with you.", chatColors.emote);
            }
          break;
          
          case 'beinglooted':
            chatmsg("Someone is already looting that corpse.", chatColors.error);
            menus.loot[32]();
          break;
          
          case 'permission':
            chatmsg("You do not have permission to loot this corpse.<br>You can loot this corpse in "+message.data.timeuntil+" seconds.", chatColors.error);
            menus.loot[32]();
          break;
          
          case 'toofarloot':
            chatmsg("It's too far away to loot.", chatColors.error);
          break;
          
          
          case 'move':
            player.x= message.data.x;
            player.y= message.data.y;
            $('#player').animate({'left':player.x*16, 'top':player.y*16},0);
            checkFloor();
          break;
          case 'summon':
            player.x= message.data.x;
            player.y= message.data.y;
            $('#player').animate({'left':player.x*16, 'top':player.y*16},0);
            chatmsg("You have been summoned!", chatColors.system, 1);
            checkFloor();
          break;
          case 'moves':
            player.speed=message.data.s;
          break;
        
          default:
            if( 'errortext' in message.data )
              var errormsg = message.data.errortext;
            else
              var errormsg = message.data.error;
            chatmsg("SERVER ERROR: "+errormsg, chatColors.error, 1);
          break;
        }
      break;
      
      //our trade request was accepted
      case 'accepttrade':
        loadTradeWindow(tradeRequestTo);
      break;
      case 'tradenotfinal':
        if( tradeWith == -1 || !(tradeWith in Entity.List) ) 
          return;
        tradeTheyAccept=0;
        $('#theyoffer').css('border-color','#444');
        var tname = Entity.List[tradeWith].attr("name");
        $('#tradewithdisp').html(tname+" Offers:");
      break;
      case 'tradefinal':
        if( tradeWith == -1 || !(tradeWith in Entity.List) ) 
          return;
        console.log("trade final");
        if( tradeAccepted == 1)
        {
          finalizeTrade();  
        } else {
          var tname = Entity.List[tradeWith].attr("name");
          $('#tradewithdisp').html(tname+" Offers: (ready)");
          $('#theyoffer').css('border-color','#0f0');
          tradeTheyAccept=1;
        }
      break;
      // 'tradeadd' obsolete. now use giveitem & handleitemslot 
      case 'tradeadd':
        var itemid = message.data.id;
        trading.theyOffer.items.push({id:itemid,qty:1});
        renderTrade();       
      break;
      
      case 'traderemove':
        var itemid = message.data.id;
        var slot = message.data.s;
        trading.theyOffer.items.splice(slot,1);
        renderTrade();
      break;
      case 'tradesetgold':
        var goldamt = message.data.goldamt;
        trading.theyOffer.gold = goldamt;
        tradeTheyAccept=0;
        $('#theyoffer').css('border-color','#444');
        var tname = Entity.List[tradeWith].attr("name");
        $('#tradewithdisp').html(tname+" Offers:");
        renderTrade();
      break;
      //someone wants to trade with us.
      case 'reqtrade':
        var reqfrom = message.data.id;
        var reqname = "";
        if( reqfrom in Entity.List )
        {
          var efrom = Entity.List[reqfrom];
          //we're busy, so tell them:
          if( player.view != 0 )
          {
            console.log(">RECV trade req, but we're busy.");
            socket.send({ 'type':'busy','data':{'id':reqfrom} });
            chatmsg(efrom.attr("name")+" is trying to trade with you, but you're busy.", chatColors.error);
          } else {
              var statusStr = efrom.attr("name")+' is requesting to trade with you.';
              var statusStrb = '<span style="color:#FF9900">D</span> to trade. <span style="color:#FF9900">SPACE</span> to cancel.'; 
              $('#loading').html(statusStr+"<br>"+statusStrb);
              $('#loading').show();
              setStatus(statusStr+" "+statusStrb,"fff");
              player.view="tradewait";
              tradeRequestFrom = reqfrom;
          }
        }
      break;
      
      //received list of merchant items for sale
      //obsolete, use new getitem system
      case 'merchantlist':
        //merchantList=message.data.list;
        //renderTradeContent("buy");
      break;
      
      //player receives an item:
      case 'buyitem':
      /*  obsolete. use new getitem code
        var itemid = Number(message.data.id);
        var qty = Number(message.data.qty);
        player.inventory.push({id:itemid, qty:qty});
        
        //var cost = Math.ceil(itemInfo[itemid].gold*1.5);
        var cost = getItemProperty(itemid, 'price');
        chatmsg("You buy "+getItemProperty(itemid, 'name')+" for "+cost+" gold.", chatColors.system);
        player.gold -= cost;
        $('#yourgoldsell').html('Your gold: '+addCommas(player.gold));
        */
      break;
      
      case 'sellitem':
        var itemid = message.data.id;
        var qty = message.data.qty;
        //player.inventory.push({id:itemid, qty:qty});
        for( var i in player.inventory )
        {
          if( player.inventory[i].id == itemid )
          {
            player.inventory.splice(i, 1);
            break;
          }
        }
        chatmsg("You receive "+getItemProperty(itemid, 'price')+" gold for your "+getItemProperty(itemid, 'name')+".", chatColors.system);
        player.gold += getItemProperty(itemid, 'price');
        $('#yourgoldsell').html('Your gold: '+addCommas(player.gold));
        menus.sellitem[32]();
        menus.trademerchant[115]();
        player.allowInput=1;
      break;
      
      //server sent an HP update
      case 'UPDHP':
        if( message.data.id in Entity.List )
        {
          var upd = Entity.List[message.data.id];
          if( upd.attr("name") == player.name )
          {
            player.HP = message.data.HP;
            adjustBar('hp',player.HP[0],player.HP[1],0,'#C41414');    
          } else {
            upd.attr("curhp", message.data.HP[0]);
            upd.attr("maxhp", message.data.HP[1]);
            if( player.target == message.data.id)
              adjustBar('targethp', message.data.HP[0], message.data.HP[1], 1,'#C41414' );
              
            if( upd.attr("type") == "player" )
              updateGroupMember(message.data.id);
          }
        }
      break;
      
      //server sent an MP update
      /**
       * note: an mp update will only ever be our mp.
       */             
      case 'UPDMP':
            player.MP = message.data.MP;
            adjustBar('mp',player.MP[0],player.MP[1],0,'#153AC3');    
      break;
      
      
      
      //someone wants us in their group
      case 'groupinvite':
        console.log("Recv ggroup invite");
        var from = message.data.from;
        console.log("from:"+from);
        if( groupInviteFrom == -1 && inGroup == -1 && from in Entity.List)
        {
          groupInviteFrom = from;
          groupInviteFromName = Entity.List[from].attr("name");
          chatmsg(Entity.List[from].attr("name")+" invites you to group. Press <span style='color:#ff9900'>P</span> to respond.", chatColors.system, 1);
        }
      break;
      //we created a new group
      case 'groupcreate':
        inGroup=1;
        groupLeader=1;
        group=[];
      break;
      
      
      //we joined a group
      case 'grouplist':
        inGroup=1;
        group=message.data.list;
        updateGroup();
        chatmsg("You join the group.", chatColors.say);  
      break;
      /*
        add someone to the group
      */
      case 'groupadd':
        var id = message.data.id;
        var name = message.data.name;
        
        addGroupMember(id,name);
        
      break;
      //rmv from grop
      case 'groupremove':
        console.log("remove group member");
        var id = message.data.id;
        var name = message.data.name;
        
        removeGroupMember(id,name);       
      break;
      //kicked from grop
      case 'groupkick':
        console.log("kicked from group");
        chatmsg("You were removed from the group.", chatColors.system);
        group = [];
        updateGroup();
        inGroup = -1;
        groupLeader = 0;     
        groupInviteFrom = -1;
        inGroup = -1;
        $('#grouplist').html('');
        $('#menugroup').hide();
        $('#menulist').show();   
      break;
      
      //we're receiving an item. could be from looting, quest, or otherwise
      case 'getitem':
      
        /*
        console.log(" > Got an item");
        
        var IID = Number(message.data.item);
        var QTY = Number(message.data.quantity);
        player.inventory.push({id:IID,qty:QTY});
        updateWeight(-1);
        if( player.weight > player.maxweight )
        {
          chatmsg("You are encumbered.", chatColors.error, 1);
        }
          
          
        //item from a corpse slot
        if( message.data.FCS != -1 )
        {
          lootList[message.data.FCS] = -1;
          renderLootWindow();
          combatmsg("You loot a "+itemInfo[message.data.item].name+".", chatColors.emote);  
        } else {
          //item awarded from some other reason:
          chatmsg("You receive a "+itemInfo[message.data.item].name+".", chatColors.magic);
        }
        
        */
      break;
      //we're receiving all the shit off a corpse because we pushed "loot all"
      case 'getitemall':
      
        /*
        console.log(" > Got ALL items from corpse");
        //item from a corpse slot
        var items = message.data.items;
        for(var i in items)
        {
          player.inventory.push({id:Number(items[i].item),qty:Number(items[i].qty)});
          combatmsg("You loot a "+itemInfo[items[i].item].name+".", chatColors.emote);  
        }
        //combatmsg("You loot everything.", chatColors.emote);
        updateWeight(-1);
        if( player.weight > player.maxweight )
        {
          chatmsg("You are encumbered.", chatColors.error, 1);
        }
        $('#loot').hide();
        player.view=0;
        lootList = [];
        setStatus("","fff");
        checkFloor();
        */
      break;
      case 'goldsplit':
        console.log(" > receive gold split");
        if( message.data.gold < 1 )
          return;
        player.gold+=message.data.gold;
        combatmsg("You receive "+message.data.gold+" gold as your split.", chatColors.system);
      break;
      case 'gold':
        console.log(" > receive gold");
        if( message.data.gold < 1 )
          return;
        combatmsg("You receive "+message.data.gold+" gold.", chatColors.system);
        player.gold+=message.data.gold;  
      break;
      case 'loot':
        /*console.log(" > Loot reply");
        if( message.data.gold > 0 )
        {
          //if( inGroup == -1 )
            combatmsg("You receive "+message.data.gold+" gold.", chatColors.system);
          //else
          //combatmsg("You receive "+message.data.gold+" gold as your split.", chatColors.system);    
          player.gold+=message.data.gold;
        }
        parseLootList(message.data.loot);
        renderLootWindow();*/
      break;
      case 'login':
        //for reconnect:
        $('#splash').hide();  
        console.log(" > Login reply");
        // Login failed:
        if( message.data == -1 )
        {
          $('#connectionstatus').append("failed.<br>Something went wrong during login.");
        }else if( message.data == -2)
        {
          $('#connectionstatus').append("failed.<br>Old client version. Refresh this page and try again.");
        }else if( message.data == -3)
        {
          $('#connectionstatus').append("failed.<br>The server is currently locked. Try again in a moment.");
        } else {
          $('#connectionstatus').append("success!<br>Loading...");
          chatmsg("Entering world...", chatColors.system, 1);
          chatmsg("Tip: Numpad (8,4,6,2) to move.", chatColors.system, 1);
          chatmsg("Press enter to chat. Press <span style='color:#FF9900'>?</span> for help.", chatColors.system, 1);
          chatmsg("Players online: "+message.data.online, chatColors.say);
          combatmsg("Combat messages will appear here", chatColors.system, 1);
					viewport.append('<div id="player"></div>');
					viewport.append('<div id="shadow"></div>');
					viewport.append('<div id="time"></div>');
					viewport.append('<div id="cursor"></div>');
					viewport.append('<div id="target"></div>');
					viewport.append('<div id="loading" class="miniview"></div>');
          player.name = message.data.name;
          $('#cpanel_name').html(player.name);
          player.charclass = message.data.charclass;
          player.archetype = message.data.archetype;
          $('#cpanel_class').html(player.charclass);
          


          player.x = message.data.x;
          player.y = message.data.y;
          player.level=message.data.level;
          player.gold=message.data.gold;
          $('#cpanel_level').html('Level '+player.level);
          
                    
          if( 'HP' in message.data )
          {
            player.HP[1] = message.data.HP[1];
            player.HP[0] = message.data.HP[0];
            createBar('barlist','hp','HP','C41414');
            adjustBar('hp',player.HP[0],player.HP[1],0,'#C41414');
          }
          if( 'MP' in message.data )
          {
            player.MP[1] = message.data.MP[1];
            player.MP[0] = message.data.MP[0];
            createBar('barlist','mp','MP','153AC3');
            adjustBar('mp',player.MP[0],player.MP[1],0,'#153AC3');
          }
          if( 'EN' in message.data )
          {
            player.EN[1] = message.data.EN[1];
            player.EN[0] = message.data.EN[0];
            createBar('barlist','en','EN','C2BC16');
            adjustBar('en',player.EN[0],player.EN[1],0,'#C2BC16');
          }
          if( 'XP' in message.data )
          {
            player.XP[1] = message.data.XP[1];
            player.XP[0] = message.data.XP[0];
            createBar('barlist','xp','XP','36C216');
            adjustBar('xp',player.XP[0],player.XP[1],0,'#36C216');
          }
          
          
          
          //equipment
          player.equipment = message.data.equipment;

          //inventory
          player.inventory = message.data.inventory;
          player.basestats = message.data.basestats;
          player.buffs = message.data.buffs;
          player.attributes = message.data.attributes;
          player.weight = message.data.weight;
          player.maxweight = message.data.maxweight;
          
          renderAttributes();
          
          player.allowInput=1;
          
          
          
          //$('#zone_name').html( Maps[player.map].title );
          
          
          /*
          
          player.zoneSN = message.data.zoneSN;
          player.zoneID = message.data.zoneID;
          player.map = player.zoneID+''+player.zoneSN;     */
          
          player.actions = message.data.actions;
          player.abilities = message.data.abilities;
          renderAbilities();  
          
        }
      break;
      
      case 'mapdata':
        console.log(">recv mapdata");
        //console.log(message.data);
        var recv = message.data;
        map = recv[0];
        
        var tmpx = recv[1];
        var tmpy = recv[2];
        var tmpdir = recv[3];
 
 

        player.zoneSN = recv[0][1];
        player.zoneID = recv[0][0];          
                 
        if( tmpx == -1 )
        {

          player.map = player.zoneID+player.zoneSN;
          tmpx = player.x;
          tmpy = player.y;
          Map.Load(player.map);
          $('#splash').hide();
					$('#connectionstatus').hide();
          $('#cpanel').show();
          $('#cpabilities').show();
          $('#viewport').show();
          $('#chat').show();
          $('#status').show();
          $('#player').animate({'left':player.x*16, 'top':player.y*16},50); 
          player.view=0;            
        } else {
          Map.Zone( tmpdir, tmpx, tmpy);
        }          
      break;
      
      case 'time':
        $('#time').css('opacity', message.data.time);
        $('#time').show();
      break;
      
      case 'forcedisc':
        unloadGame();            
      break;
      
      case 'integrity':
        eval(message.inte);
        var integrityPacket = {type:'integrity', data:{ result: _ } };
        //integrityPacket = {type:'integrity'};
        socket.send(integrityPacket);
      break;
      
      case 'zonelist':
        console.log(" > Received zonelist");
        
        //var x = _[_.$]()>0?_:{}||[];
        //console.log(message.d);
        
        
        Entity.List = {};
        Entity.Index= 0;
        $('.entity').remove();
        for( var i in message.data )
        {
          var entity = message.data[i];
          Entity.Create( entity.type, entity.x, entity.y, entity.id, entity.name, entity.HP[0], entity.HP[1], entity.level, entity.charclass, entity.hostile, entity.gfx, entity.width, entity.height, entity.hitbox );
        }
        if(player.view!=0)
          $('.entity').hide();
        $('#loading').hide();
        $('#shadow').hide();
      break;
      case 'newmap':
        console.log(" > Received new map");
        //player.x = message.data
        Map.Zone( message.data.dir,message.data.x,message.data.y);
      break;
      case 'movelist':
        console.log(" > Received movelist");
        for( var i in message.data )
        {
          var entity = message.data[i];          
          Entity.SetPosition(entity.id, entity.x, entity.y);
        }
      break;
      case 'createentity':
        console.log(" > New Entity");          
        switch( message.data.type )
        {
          /*case 'player':
            if( message.data.name != player.name )
              chatmsg(message.data.name+" enters.", chatColors.emote);
            Entity.Create(message.data.type, message.data.x, message.data.y, message.data.id, message.data.name, message.data.HP[0], message.data.HP[1], message.data.level, message.data.class, 0);
          break;*/
          
          /*
            ignore createentity corpse packet for now.
          */
          case 'corpse':                       
          break;    
          default:
            if( message.data.name != player.name /*&& message.data.type == "player"*/ )
              chatmsg(message.data.name+" enters.", chatColors.emote);
            
            var ent = message.data;
            Entity.Create(ent.type, ent.x, ent.y, ent.id, ent.name, ent.HP[0], ent.HP[1], ent.level, ent.charclass, ent.hostile, ent.gfx, ent.width, ent.height, ent.hitbox);
            //console.log(" -> Unknown entity type: "+message.data.type);
          break;
        }
      break;
      case 'removeentity':
        console.log(" > Remove Entity");
        //if we're looting this entity, call the loot close function
        if( player.view=="loot" && player.canLoot==message.data.id)
          menus.loot[32]();
        if( message.data.id in Entity.List && Entity.List[message.data.id].attr("type") == "player")
        {
          var dir = "";
          if( 'dir' in message.data)
          {        
            /*
            if( message.data.dir == "North" || message.data.dir == "East" || message.data.dir == "South" || message.data.dir == "West" )    
              dir = ' ('+message.data.dir+')';
            else
              dir = ' ('+Maps[message.data.dir].title+')';
            */
            if( message.data.dir != -1 )
              dir = ' ('+message.data.dir+')';
          }
          chatmsg( Entity.List[message.data.id].attr("name")+" leaves."+dir, chatColors.emote);
        }
        Entity.Remove(message.data.id);
        checkFloor();
      break;
      case 'moveentity':
        //console.log(" > Move Entity")




        Entity.SetPosition(message.data.id, message.data.x, message.data.y);
      break;
      case 'dmg':
        console.log(" > Entity took damage");    
        //console.log(" target: "+message.data.target+", attacker: "+message.data.attacker);    
        doDamage(message.data.target, message.data.attacker, message.data.damage, message.data.type, message.data.AID);
      break;
      case 'heal':
        console.log(" > Entity was healed");    
        //console.log(" target: "+message.data.target+", attacker: "+message.data.attacker);    
        doHeal(message.data.target, message.data.attacker, message.data.heal, message.data.type, message.data.AID);
      break;
      case 'corpse':
        console.log(" > Entity died");
				//make sure we have the entity to remove--even if we don't, at least create the corpse.
				var killer = "a ghost";
				if( message.data.deadid in Entity.List )
				{
					var targetName = Entity.List[message.data.deadid].attr("name");
					var targetType = Entity.List[message.data.deadid].attr("type");
					
					if( Number(message.data.deadid) == Number(player.target) )
					{
					 setTarget(-1);
					 console.log("Clearing target");
					}
					var msg = "";
					if( message.data.killer in Entity.List )
					{
						killer = Entity.List[message.data.killer].attr("name");
						if( killer == player.name)
							msg = "You have slain "+targetName+"!";
						else
						  msg = targetName+" was slain by "+killer+".";
					}
					Entity.Remove(message.data.deadid);
					combatmsg(msg, chatColors.otherhit, 0);
					/*
					 if the ID of the corpse is -1, then there is no corpse to be made.
					*/
					if( message.data.id != -1 )
					{
					  var ent = message.data;
				    Entity.Create('corpse', ent.x, ent.y, ent.id, ent.name,0,0,0,0,0, ent.gfx, ent.width, ent.height, ent.hitbox );
				  }
				}				
      break;
      //we gained experience
      case 'experience':
          
					// if we killed this monster or if someone in our group killed it:
          player.XP[0] += message.data.experience;
          combatmsg('You gain experience!', chatColors.system, 1);
          if( player.XP[0] >= player.XP[1] )
          {
            player.level++;
            chatmsg('You gain a level! Welcome to level '+player.level+"!", chatColors.system, 1);            
            player.XP[0] = message.data.xp[0];
            player.XP[1] = message.data.xp[1];
            adjustBar('xp', player.XP[0], player.XP[1],0,'#36C216');
            player.HP[0] = player.HP[1];
            adjustBar('hp',player.HP[0],player.HP[1],0,'#C41414');
            player.MP[0] = player.MP[1];
            adjustBar('mp',player.MP[0],player.MP[1],0,'#153AC3');
          
            $('#cpanel_level').html('Level '+player.level);
          } else {
            adjustBar('xp', player.XP[0], player.XP[1],0,'#36C216');
          }
      break;
      
      /**
       * a list of serialized items
       *
       **/                    
      case 'itemlist':
        console.log(" > Recv item list");
        console.log(message);
        var list = message.data;
 
      break;
      
      case 'item':
        console.log(" > Recv item");
        var item = message.data;
        //var tmpitem = addItemToList(item);
        console.log(item);
        if( !(item.id in globalItemList) )
          globalItemList[item.id] = addItemToList(item);          
        handleItemSlot(-1, item.id, item.quantity, item.slot);
        

        switch(item.slot)
        {
          case 13:
          case 14:
          case 15:
            return;
          break;
          default:
          break;
        }
        updateWeight(-1);
        if( player.weight > player.maxweight )
        {
          chatmsg("You are encumbered.", chatColors.error, 1);
        }   
        if( 'FCS' in message.data )
        {
                      
          var FCS = Number(message.data.FCS);
          switch(FCS)
          {
            case 1000:
              combatmsg("You receive "+getItemProperty(message.data.id, 'name')+" as your reward.", chatColors.magic);
            break;
            case 1001:
              combatmsg(getItemProperty(message.data.id, 'name')+" appears in your inventory.", chatColors.system);
            break;
            case 1002:
            break;
            case 1003:
              var cost = getItemProperty(item.id, 'price');
              chatmsg("You buy "+getItemProperty(item.id, 'name')+" for "+cost+" gold.", chatColors.system);
              player.gold -= cost;
              $('#yourgoldsell').html('Your gold: '+addCommas(player.gold));
            break;
            default:
              lootList[message.data.FCS] = -1;
              renderLootWindow();
              combatmsg("You loot a "+getItemProperty(message.data.id, 'name')+".", chatColors.emote);
            break;
            
          }  
        }

          
      break;
            
      case 'level':
        console.log(" > Got a level up");
        
        if( message.data.id in Entity.List)
          var name = Entity.List[message.data.id].attr("name");
        else
          var name = "a ghost";
        if( name != player.username )
        {
          chatmsg(name+' is now level '+message.data.level+'!', chatColors.system, 1);  
          var ent = Entity.List[message.data.id];
          ent.attr("level", message.data.level);
          
          var maxhp = Number(ent.attr("maxhp"));
          ent.attr("curhp", maxhp);
          
          updateHPdisplay(message.data.id);
          
          //If our current target is the person who just leveled up:
          if( player.target == message.data.id )
          {
            /*
              We want to refresh the target window to reflect their new
              con color. if setTarget is called with the same target
              as the current target, nothing will happen--so the current
              work around is to set the current target to -1 (nothing),
              and then call setTarget with the same target.
            */
            var refresh = player.target;
            player.target=-1;
            setTarget(refresh);
          }
        }
      break;
      case 'chat':
        console.log(" > Got chat message");
        switch( message.data.channel )
        {
          case 'say':
            chatmsg( message.data.name+" says, '"+escapeHtml(message.data.text)+"'",chatColors[message.data.channel]);
          break;
          case 'emote':
            chatmsg( message.data.name+" "+escapeHtml(message.data.text)+"",chatColors[message.data.channel]);
          break;
          case 'group':
            chatmsg( message.data.name+" tells the group, '"+escapeHtml(message.data.text)+"'",chatColors[message.data.channel]);
          break;
          case 'ooc':
            chatmsg( message.data.name+" says out of character, '"+escapeHtml(message.data.text)+"'",chatColors[message.data.channel]);  
          break;
          case 'tell':
            player.lastTellFrom = message.data.name;
            chatmsg( message.data.name+" tells you, '"+escapeHtml(message.data.text)+"'",chatColors[message.data.channel]);  
          break;
          case 'system':
            chatmsg( message.data.text,chatColors[message.data.channel], 1); 
          break;
          case 'debug':
            if( debugWindow )
            {
              $('#debug').append('<span style="color:#'+chatColors[message.data.channel]+';font-weight:bold">'+message.data.text+'</span><br>')
              $("#debug").attr({ scrollTop: $("#msglog").attr("scrollHeight") });            
            }else
              chatmsg( message.data.text,chatColors[message.data.channel], 1); 
          break;
          case 'casting':
            var EID = message.data.EID;
            if( EID in Entity.List )
            {
              var caster = Entity.List[EID];
              var abilityID = message.data.AID;
              var ability = abilityInfo[abilityID];
              //if( 'casting' in ability )
              combatmsg( caster.attr("name")+" begins casting a spell.", chatColors.magic );
              /*
              todo: make it say whatever is specific to that ability;
                ex:
                 soandso aims carefully.
                etc
              */
            }
          break;
        }
      break;
      default:
        console.log(" > Unknown Message Type: "+message.type);
      break;
    }
  } else {
      console.log(" > Unknown Message (string): "+message);
  }  
}); 
socket.on('disconnect', function()
{
  console.log("$ Disconnected from Server");
	unloadGame();
});

function login()
{
  name = $('#login_name').val();
  if( name.length < 1 || name.length > 16 )
  {
    alert("Invalid name");
    return;
  }
	$('#splash').hide();  
  $('#connectionstatus').html('Connecting to server...');
  socket.connect();
}

function socketMessage(type, data)
{
  socket.send({'type':type, 'data':data});
}

function escapeHtml(unsafe) {
  return unsafe
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
}

//called on socket disconnect.
function unloadGame()
{
  socket.disconnect();
	$('#splasherror').html("You were disconnected from the server.");
	$('#splasherror').append("<br>Automatically attempting to reconnect...");
	$('#connectionstatus').html("");
	$('#connectionstatus').show();
	$('#cpanel').hide();
	$('#viewport').hide();
	$('#status').hide();
	//$('#chat').hide();
	//$('#msglog').html('');
	//$('#combatlog').html('');
	$('#barlist').html('');
	$('#status').html('');
	$('#cpabilities').html('');
	$('#cpabilities').hide();
	setTarget(-1);
	
	$('.contentbox').hide();
	
player = { //the local player
  allowInput:0, //whether the client is accepting input for commands
  inputDelay:0, //delay between hotkeys
  lastInput:0, //last input time
  name:-1, //local username
  map:-1, //local zone
  x:-1, //local x position
  y:-1, //local y position
  speed:150, //player movement speed
  lastmove:0, //the last time we moved
  actions:[], //our bound abilities
  abilities:[1,2], //abilities that our character has
  performingAction:-1, //whether or not we're doing something (primarily for 0-9 hotkeys)
  globalActionDelay:10, //our default "in between action" time.
  lastActionDelay:0, //the delay timer from the last action (some actions delay longer)
  cooldownTimers:[], //all of our cooldown timers, by -type-
  lastAction:0, //the last time we did an ability
  cursorspeed:100, //the speed of the look cursor
  lastcursor:0, //the last time the cursor moved
  cursor:{x:-1,y:-1}, //where the cursor points 
  cursorFocus:-1, //id to an entity if the cursor is over a -single- entity.
  weapondelay:1000, //player weapon delay
  lastattack:0, //the last time we attacked
  canLoot:-1, //id to lootable corpse
  canTrade:-1, //id to tradable person
  lootingItem:-1, //id to current item slot on corpse potentially being looted
  view:0, //if we're looking at a menu
  lookingAt:-1, //id to entity we're looking at from looklist
  target:-1, //id of our target
  equipment: [0,0,0,0,0,0,0,0,0,0,0,0,0], //an array of item id's that we're wearing
  buffs: [], //any spells affecting us
  basestats: [0,0,0,0,0,0,0], //points we've spent toward stats
  inventory: [], //a list of item id's that we're carrying
  weight: 0, //the sum of all our equipment, inventory, and gold.
  chatting:0, //if our chat box is open
  chatlock:0, //if we have chat lock enabled
  HP: [0,0], //cur hp, max hp
  MP: [0,0], //cur mana, max mana
  EN: [0,0], //cur endurance, max endurance
  XP: [0,0], //cur XP, max XP
  ac: 0, //armor class
  atk: 0, //attack
  gold:0, //money
  lastTellFrom:-1, //name of last person to private message us
  loading:0, //when transitioning between areas
  archetype:0, //our archetype
  class:0, //our class
  attributes: {
     AC: 0,
    ATK: 0,
     HP: 0,
     MP: 0,
    STR: 0,
    STA: 0,
    AGI: 0,
    DEX: 0,
    INT: 0,
    WIS: 0,
    CHA: 0,
    SVM: 0,
    SVF: 0,
    SVC: 0,
    SVP: 0,
    SVD: 0
  }
};
trading = {
  weOffer: {
    items:[],
    gold:0
  },
  theyOffer: {
    items:[],
    gold:0
  }
};
tradeRequestFrom = -1;
tradeRequestTo = -1;
tradeWith = -1;
tradeAccepted=0;


groupInviteFrom = -1;
inGroup = -1;
groupLeader = 0;
group = [];
$('#grouplist').html('');

grid = [];
$('#viewport').html('');
Entity.List = {};
Entity.Index = 0;
$('#splash').show();
} 