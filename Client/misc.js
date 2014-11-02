/**
 * %SRPG%
 * 2011 Kevin Tyma (drachlen@gmail.com)
 * 
 **/

/*
  misc.js contains functions that are either for testing, are temporary,
  or implemented in a way that is likely to be reconsidered.
*/


//when a player presses enter or something else that brings the chat box up
function enableChat()
{
  //disable hotkey input(so we don't accidentally open a menu)
  player.allowInput=0;
  //show chat box
  $('#chatinput').show();
  //delay for some weird jquery bug if you focus too quickly:
  setTimeout( function(){ $('#chatinput').focus(); },40);
  //player is typing text and not issuing commands
  player.chatting=1;
}

/*
  meleeAttack function called when we bump into a hostile monster.
  implemented this way currently for testing that the server verifies if
  a player is close enough to attack or not, and whether their attack cooldown
  has been met.
*/
function meleeAttack(x,y)
{
  console.log("Melee Attack");
  socket.send({ 'type':'attack','data':{'x':x,'y':y} });
}

function setTarget(id)
{
  if(id==-1)
  {
    $('#targethpbar').hide();
    $('#targetname').html("No target");
    if(player.target!=-1)
    {
      console.log("force update cursor");
      updateCursor();
    }
    player.target=-1;
    $('#target').hide();
    return;
  }
  if( id==player.target || !(id in Entity.List) )
    return;
  if( Entity.List[id].attr("name") == player.name )
    return;
  player.target=id;
  var target = Entity.List[id];
  var curHP = target.attr("curHP");
  var maxHP = target.attr("maxHP");
  var name = target.attr("name");
  var level = target.attr("level");
  var con = getCon(level);
  
  var gheight = target.attr("h");
  var gwidth = target.attr("w");
  $('#target').css({
    left: target.attr("x")*16+"px",
    top: ((target.attr("y")*16)+6+(16*gheight-16))+"px",
    width: (gwidth*16)+"px"
  });
  $('#target').css("border-color", "#"+con[0]);
  $('#target').show();
  
  $('#targetname').html('<span style="color:#'+con[0]+'">'+name+'</span>');
  adjustBar('targethp', curHP, maxHP, 1, '#C41414');
  $('#targethpbar').show();  
  
}


//createBar('menugroup', 'g1hp','Drachlen','red')




function generateLookList(x,y)
{
  var tmpLL = [];
  for(var i in Entity.List)
  {
    var e = Entity.List[i];
    
    //new code support large entities
    
    var eName = e.attr("name");
    
    
    if( eName == player.name )
      continue;
    
    
    var eX = Number(e.attr("x"));
    var eY = Number(e.attr("y"));
    
    var eW = Number(e.attr("w"));
    var eH = Number(e.attr("h"));
    var eHitbox = e.attr("hitbox");
    

      if( eW == 1 && eH == 1)
      {
        //console.log("1x1 entity");
        //console.log("Floor x,y:"+tmpx+","+tmpy);
        //console.log("ex,y:"+eX+","+eY)
        if(eX == x && eY == y)
        {
          tmpLL.push(i);
          continue;
        }
      }

      var off=0;
      //special handling for big monsters
      if( eW > 1 || eH > 1 )
      {
        for( var sY=0; sY<eH; sY++ )
        {
          for( var sX=0; sX<eW; sX++ )
          {
            var nx = (eX+sX);
            var ny = (eY+sY);
            if( nx == x && ny == y && (eHitbox[off] == 1 || e.attr("type") == "corpse") )
            {
              tmpLL.push(i);
              sX=eW;
              sY=eH;
            }
            off++;  
          }
        }
      }
  }
  return tmpLL;  
}

/*
  this is a whole bunch of duplicate code from checkCursor, except
  specifically for the floor under the player and when player.view==0
*/
function checkFloor()
{
  if(player.view!=0)
    return;
  var tmpx=player.x;
  var tmpy=player.y;
  lookList = generateLookList(tmpx,tmpy);

  player.canLoot = -1;
  player.canTrade = -1;
  var statusString="";
  var stringColor="fff";
  if( lookList.length == 0)
  {
    statusString="";
    setStatus(statusString,"fff");
  } else
  if( lookList.length == 1 )
  {
    var e = Entity.List[ lookList[0] ];
    statusString="You see "+e.attr("name")+".";
    if( e.attr("type") == "corpse")
    {
      statusString = 'You see <span style="color:#999">'+e.attr("name")+'</span>. <span style="color:#FF9900">S</span> to loot.';
      player.canLoot = lookList[0];  
    }else
    if( e.attr("level") )
    {
      var con = getCon( e.attr("level") );
      
      if(e.attr("type") == "player")
      {
        statusString = "You see <span style='color:#"+con[0]+"'>"+e.attr("name")+"</span>.";
        //statusString += ' <span style="color:#FF9900">L</span> details.';
        if( player.x==e.attr("x")&&player.y==e.attr("y"))
        {
          statusString += ' <span style="color:#FF9900">D</span> to trade.';
          player.canTrade = lookList[0];
        }
        statusString += ' <span style="color:#FF9900">M</span> message.';
        statusString += ' <span style="color:#FF9900">G</span> invite to group.';
      } else {
        //This implies that the player is standing on top of something that has a level and that is not a player.
        //need to put some code here to tell the server. If this ever happens, the server should auto-correct it.
        /**
         *Note: with the new large entity implementation, this needs to be handled differently        
         */        
        //statusString = "You've entered another dimension. (Actually, some kind of bug has happened.)";
      }
    }               
    
    setStatus(statusString,"fff");
    //setTarget(lookList[0]);
  } else {
    statusString = "There are multiple things here.";
    statusString += ' <span style="color:#FF9900">S</span> for details.';
    setStatus(statusString,"fff");
  }  
}

function cursorScan(x, y)
{
  console.log("Cursorscan called with: "+x+","+y+" player.cursor is:"+player.cursor.x+","+player.cursor.y);
  /*
    x,y is position to "direction" of next scan.
  */
  var bestDist = 999;
  var candidate = -1;
  var canx = -1;
  var cany = -1;
  player.cursor.x = Number(player.cursor.x);
  player.cursor.y = Number(player.cursor.y);
  for( var e in Entity.List )
  {
    var tmpent = Entity.List[e];
    var tmpx = tmpent.attr("x");
    var tmpy = tmpent.attr("y");
    if( tmpent.attr("name") == player.name )
      continue;
      
    console.log(" x is:"+x+", pl.cu.x is:"+player.cursor.x+", potential candidate x:"+tmpx);
    console.log(" y is:"+y+", pl.cu.y is:"+player.cursor.y+", potential candidate y:"+tmpy);
    
    if(
      (x < player.cursor.x && tmpx < player.cursor.x) ||
      (x > player.cursor.x && tmpx > player.cursor.x) ||
      (y < player.cursor.y && tmpy < player.cursor.y) ||
      (y > player.cursor.y && tmpy > player.cursor.y)
    ){     
      console.log("condition met");
      var dist = distance( x, y, tmpx, tmpy );
      if( dist < bestDist )
      {
        console.log("Found candidate");
        bestDist = dist;
        candidate = e;
        canx = tmpx;
        cany = tmpy;
      }
    }
  }

  if( candidate != -1 && canx != -1 && cany != -1 )
  {
    console.log("new cursor position");
    player.cursor.x = Number(canx);
    player.cursor.y = Number(cany);  
  }  
}


function updateCursor()
{
  if( frame-player.lastcursor < player.cursorspeed || player.cursor.x==-1 )
    return;         
  player.lastcursor = frame;  
  if( player.view != "look")
    return;  
  var tmpx = Number(player.cursor.x);
  var tmpy = Number(player.cursor.y);
  var diffx = 0;
  var diffy = 0;
 
  var dir = -1;
  
  //north
  if( keystate[104] || queuedKey[104] )
  {
    //tmpy-=1;
    diffy=-1;
    queuedKey[104] = 0; 
  } 
  if( keystate[38] || queuedKey[38] )
  {
    //tmpy-=1;
    diffy=-1;
    queuedKey[38] = 0;
  } 
  //south
  if( keystate[40] || queuedKey[40] )
  {
    //tmpy+=1;
    diffy=1;
    queuedKey[40] = 0;
  }
  //south
  if( keystate[98] || queuedKey[98] )
  {
    //tmpy+=1;
    diffy=1;
    queuedKey[98] = 0;
  }
  //south (but using 5) possibly temporary until 5 has a use
  if( keystate[101] || queuedKey[101] )
  {
    //tmpy+=1;
    diffy=1;
    queuedKey[101] = 0;
  }
  //west
  if( keystate[100] || queuedKey[100])
  {
    //tmpx-=1;
    diffx=-1;
    queuedKey[100] = 0;
  }
  //west
  if( keystate[37] || queuedKey[37])
  {
    //tmpx-=1;
    diffx=-1;
    queuedKey[37] = 0;
  }
  //east
  if( keystate[102] || queuedKey[102] )
  {
    //tmpx+=1;
    diffx=1;
    queuedKey[102] = 0;
  }
  if( keystate[39] || queuedKey[39] )
  {
    //tmpx+=1;
    diffx=1;
    queuedKey[39] = 0;
  }
  
  //north-east
  if( keystate[105] || queuedKey[105] )
  {
    //tmpy-=1;
    //tmpx+=1;
    diffx=1;
    diffy=-1;
    queuedKey[105] = 0;
  }
  //south-east
  if( keystate[99] || queuedKey[99] )
  {
    //tmpy+=1;
    //tmpx+=1;
    diffx=1;
    diffy=1;
    queuedKey[99] = 0;
  }
  //south-west
  if( keystate[97] || queuedKey[97])
  {
    //tmpx-=1;
    //tmpy+=1;
    diffx=-1;
    diffy=1;
    queuedKey[97] = 0;
  }
  //north-west
  if( keystate[103] || queuedKey[103] )
  {
    //tmpx-=1;
    //tmpy-=1;
    diffx=-1;
    diffy=-1;
    queuedKey[103] = 0;
  }
  tmpx+=diffx;
  tmpy+=diffy;
  
  if( tmpx<0)
    tmpx=0;
  if(tmpx>41)
    tmpx=41;
  if(tmpy<0)
    tmpy=0;
  if(tmpy>24)
    tmpy=24;
  

  if(tmpx == player.cursor.x && tmpy == player.cursor.y)
  {
    //return;
  }
  
  if( diffx != 0 || diffy != 0)
  {
    //console.log("diff:"+diffx+","+diffy+" -- About to call cursorScan with:"+tmpx+","+tmpy+", p.c is:"+player.cursor.x+","+player.cursor.y);
    cursorScan(tmpx,tmpy);
  }
 

  $('#cursor').css({left:player.cursor.x*16+"px",top:player.cursor.y*16+"px"});
  $('#cursor').css(
    {height:16+"px",
    width:16+"px"});
  //player.view="look";
  //player.cursor = {x:tmpx,y:tmpy};
  tmpx = player.cursor.x;
  tmpy = player.cursor.y;
/*  
  $('#cursor').css({left:tmpx*16+"px",top:tmpy*16+"px"});
  //player.view="look";
  player.cursor = {x:tmpx,y:tmpy};
*/  

  /*
    Current plans for "look":
    When you move the cursor, loop through the entity list,
    if there's no entity at the location, clear the status bar
    if there's 1 entity at the location, describe it
    if there's >1 entity at the location, say there's multiple things
  */
  lookList = [];
  var biggestW = 1;
  var biggestH = 1;
  for(var i in Entity.List)
  {
    var e = Entity.List[i];     
    if( e.attr("x") == tmpx && e.attr("y") == tmpy && e.attr("name") != player.name )
    {
      lookList.push(i);
      if( e.attr("w") > biggestW )
        biggestW = e.attr("w");
      if( e.attr("h") > biggestH )
        biggestH = e.attr("h");
    }
  }
  
  var statusString="";
  var stringColor="fff";
  if( lookList.length == 0)
  {
    setStatus('Look at what? <span style="color:#FF9900">SPACE</span> to stop looking.', "fff");
    setTarget(-1);
  } else
  if( lookList.length == 1 )
  {
    player.cursorFocus = lookList[0];
    var e = Entity.List[ lookList[0] ];
    
    var gw = e.attr("w");
    var gh = e.attr("h");
    $('#cursor').css(
    {height:16*gh+"px",
    width:16*gw+"px"});
    statusString="You see "+e.attr("name")+".";
    if( e.attr("type") == "corpse")
    {
      if( player.x==tmpx&&player.y==tmpy)
      {
        statusString = 'You see <span style="color:#999">'+e.attr("name")+'</span>. <span style="color:#FF9900">S</span> to loot.';
        player.canLoot = lookList[0]; 
      } else {
        statusString = "You see <span style='color:#999'>"+e.attr("name")+"</span>. <span style='color:#ff9900'>S</span> for details. Get closer to loot it.";
      }  
    }else
    if( e.attr("level") )
    {
      statusString = getEntityStatusOptions(lookList[0]);
      
    }               
    
    
    statusString += ' <span style="color:#FF9900">SPACE</span> to stop looking.';
    
    setStatus(statusString,"fff");
    setTarget(lookList[0]);
  } else {
    setTarget(-1);
    $('#cursor').css(
    {height:16*biggestH+"px",
    width:16*biggestW+"px"});
    statusString = "There are multiple things here.";
    statusString += ' <span style="color:#FF9900">S</span> for details.';
    statusString += ' <span style="color:#FF9900">SPACE</span> to close.';
    setStatus(statusString,"fff");
  }
}

function getCon(level)
{
  var diff = level-player.level;
  var ccolor = "fff";
  var cstring = "";
  if(diff>2)
  {
    ccolor = "f00";
    cstring = "It looks like an impossible fight.";
  }
  else if(diff>0)
  {
    ccolor = "ff0";
    cstring = "It looks like a tough fight.";
  } 
  else if(diff==0)
  {
    ccolor = "fff";
    cstring = "It looks like an even fight.";
  }
  else if(diff>-3)
  {
    ccolor="00f";
    cstring="It looks like you would have the upper hand.";
  }
  else
  {
    ccolor="0f0";
    cstring="It looks like a safe opponent.";
  }
  if(level==0)
  {
    ccolor="999";
    cstring="";
  }
  return [ccolor,cstring];
}



function getEntityStatusOptions(EID)
{                   
  if( !(EID in Entity.List) )
    return "";
  var statusString = "";
  var e = Entity.List[EID];
  var ename = e.attr("name");
  var con = getCon( e.attr("level") );
  if( e.attr("type") == "merchant" )
  {
    con = ["999", ""];
  }
  
  if(e.attr("type") == "player")
  {
    statusString = "You see <span style='color:#"+con[0]+"'>"+e.attr("name")+"</span>.";
    if( player.view != "lookat" )
    {
      statusString += ' <span style="color:#FF9900">S</span> details.';
    } else {
        if( player.x==e.attr("x")&&player.y==e.attr("y"))
        {
          statusString += ' <span style="color:#FF9900">D</span> to trade.';
          player.canTrade = EID;
        }
      statusString += ' <span style="color:#FF9900">R</span> set as target.';
    }
    statusString += ' <span style="color:#FF9900">M</span> message.';
    statusString += ' <span style="color:#FF9900">G</span> invite to group.';
  } else {
    if( player.view == "lookat" )
    {
      statusString = "You see <span style='color:#"+con[0]+"'>"+ename+".</span>";
      if( e.attr("type") == "corpse" )
      {
        var dist = exports.distance(player.x, player.y, e.attr("x"), e.attr("y"));
        //todo maybe make this based on actual monster size?maybe not
        if( dist < 5)
        {
          statusString += ' <span style="color:#FF9900">S</span> to loot.';
          player.canLoot = EID;
        }
      } else {
        if( player.x==e.attr("x")&&player.y==e.attr("y"))
        {
          statusString += ' <span style="color:#FF9900">D</span> to trade.';
          player.canTrade = EID;
        }
      }
      statusString += ' <span style="color:#FF9900">R</span> set as target.';
    }else{
      statusString = "You see <span style='color:#"+con[0]+"'>"+e.attr("name")+". "+con[1]+"</span>";
    }
  }
  return statusString;
}

function lookAt(EID)
{
  if( EID in Entity.List )
  {
    player.lookingAt=EID;
    $('#look').show();
    $('#lookview').show();
    $('.cboxshadow').show();
    
    var lookViewStr = "";
    if( Entity.List[EID].attr("type") == 'player' )
    {
      lookViewStr = Entity.List[EID].attr("name")+" is a level "+Entity.List[EID].attr("level")+" "+Entity.List[EID].attr("charclass")+".";
    }
    $('#lookview').html(lookViewStr);
    player.view="lookat";
    var status = "";
    status += getEntityStatusOptions(EID);
    status += ' <span style="color:#FF9900">SPACE</span> to close.';    
    setStatus(status, "fff");
  }  
}

var lookOffset = 0;
var lookCurPage=1;
var lookTotalPage=1;
var lookList = [];
function renderLooklist()
{
  console.log("render look list");
  /* renderLooklist() is called when the player opens the look list window
  // We always want to update it before displaying it, in case any information
  // has changed.
  */
 
  $('#llg').animate({opacity:1},0);
  player.lookingAt=-1;
  setTarget(-1);
      
  lookList = generateLookList(player.cursor.x,player.cursor.y);
  /*
  for(var i in Entity.List)
  {
    var e = Entity.List[i];     
    if( e.attr("x") == player.cursor.x && e.attr("y") == player.cursor.y && e.attr("name") != player.name )
    {
      lookList.push(i);
    }
  }*/
  if(lookList.length<2)
  {
    //return;
  }
  
  lookOffset=(lookCurPage-1)*26;
  
  //erase old list
  $('#looklista').html('');
  $('#looklistb').html('');
    
  //set page numbers:
  $('#looklistcurrentpage').html(lookCurPage);  
  var totalpages = Math.ceil(lookList.length/26);
  $('#looklisttotalpages').html(totalpages);
  lookTotalPage=totalpages;
  
  var leftdisplay="";
  var rightdisplay="";
  
  for(var i=0; i<26; i++)
  {
    if( (i+lookOffset) in lookList )
    {
      var tmpstr= '<div class="invitem"><span style="color:#FF9900">'+String.fromCharCode( (97+i) )+'</span> '+lookList[i+lookOffset]+' '+ Entity.List[lookList[i+lookOffset]].attr("name") +'</div>';
      if(i<13)
        leftdisplay+=tmpstr;
      else
        rightdisplay+=tmpstr;
    }
  }
  $('#looklista').html(leftdisplay);
  $('#looklistb').html(rightdisplay);
  
  $('#look').show();
  player.view = "looklist";
  setStatus('Viewing details. <span style="color:#ff9900">SPACE</span> to close.');  
  $('#llg').fadeIn('fast');
  
  //this implies we have our look cursor over a player
  if( player.target != -1 && Entity.List[player.target].attr("type") == "player" )
  {
    lookAt(player.target);
  }
}             

function lootCorpse(id)
{
  if(id==-1)
    return;
  $('#dlootlist').html("Loading...");
  $('#loot').show();
  renderLootWindow();
  lootList = [];
  if( id in Entity.List )
  {
    setStatus('Looting <span style="color:#999">'+Entity.List[id].attr("name")+'</span>. <span style="color:#FF9900">SPACE</span> to close.');
    player.view="loot";
    socket.send({ 'type':'loot', 'data':{'id':id} });
  } else {
    player.view=0;
    $('#loot').hide();
    checkFloor();
  }  
}       


var lootList = [];
function parseLootList(lootdata)
{
  for(var i=0;i<13;i++)
  {
    if( i in lootdata && lootdata[i] !== null )
    {
      console.log("pushing i:"+i+", val:"+lootdata[i]);
      lootList.push(lootdata[i]);
      renderLootWindow();
    }
  }
}



/*
  lots to do here with timers and visuals and such.
*/
function doAbility(slot)
{
  if( frame-player.lastAction < player.globalActionDelay+player.lastActionDelay || player.view != 0 || player.actions[slot] == -1 || player.performingAction != -1)
    return;         
  player.lastAction = frame;
  player.lastActionDelay=100;
  
  console.log("Ability activated:"+slot);
  console.log("view:"+player.view);
  
  var abilityID = player.actions[slot];
  
  if( !(abilityID in abilityInfo) )
    return;
  var ability = abilityInfo[abilityID];
  
  player.performingAction=abilityID;
  
  switch( ability.target )
  {
    case 0:
      player.view="performingaction";
      setStatus('In what direction? <span style="color:#ff9900">SPACE</span> to cancel.');
    break;
    case 1:
      if( player.target==-1)
      {
        player.view="performingaction";
        setStatus('In what direction? <span style="color:#ff9900">SPACE</span> to cancel.');
      } else {
        performAbility(abilityID, player.target, -1);
      }
    break;
    case 2:
      if( player.target!=-1)
      {
        performAbility(abilityID, player.target, -1);
      }else{
        setStatus("This ability requires a target.");
        combatmsg("This ability requires a target", chatColors.error, 1);
        player.performingAction=-1;
      }
    break;
    case 3:
      performAbility(abilityID, -1, -1);
    break;
    case 5:
      if( player.target!=-1)
      {
        if( Entity.List[player.target].attr("type") == "player" )
          performAbility(abilityID, player.target, -1);
        else
          performAbility(abilityID, -1, -1);
      }else{
        performAbility(abilityID, -1, -1);
      }
    break;
    default:
    break;  
  }
  return;
}

function performAbility(abilityID, targetID, direction)
{
  if( !(abilityID in abilityInfo) )
    return;
  var ability = abilityInfo[abilityID];
  
  console.log(player.cooldownTimers);
  if( ability.slot in player.cooldownTimers )
  { 
    if(frame-player.cooldownTimers[ability.slot] < abilityInfo[abilityID].cooldown )
    {
      setStatus("This ability is not ready yet.");
      combatmsg("This ability is not ready yet.", chatColors.error, 1);
      player.performingAction=-1;
      player.view=0;
      return;  
    }
  } 
  
  if( abilityInfo[abilityID].MP > player.MP[0])
  {
    setStatus("You do not have enough mana to use this ability.");
    combatmsg("You do not have enough mana to use this ability.", chatColors.error, 1); 
    player.performingAction=-1;
    player.view=0;
    return;   
  }
  
  if( targetID != -1 )
  {
    if( !(targetID in Entity.List) )
      return;
    var distance = 99;
    
    //var dist = distance(player.x, player.y, Entity.List[targetID].attr("x"), Entity.List[targetID].attr("y") );
    var victim = Entity.List[targetID];
    var vwidth = Number(victim.attr('w'));
    var vheight = Number(victim.attr('h'));
    var vx = Number(victim.attr('x'));
    var vy = Number(victim.attr('y'));
    var vhitbox = victim.attr('hitbox');
    //c&p this here. prlly need function owell.support for large mob
          if( vwidth == 1 && vheight == 1)
            distance = exports.distance(player.x, player.y, vx, vy );
          
          var off=0;
          //special handling for big monsters
          if( vwidth > 1 || vheight > 1 )
          {
            for( tmph=0; tmph<vheight; tmph++)
            {
              for(tmpw=0; tmpw<vwidth; tmpw++)
              {
                if( vhitbox[off] == 1 )
                {
                  var tmpdist = exports.distance(vx+tmpw,vy+tmph, player.x, player.y);
                  if( tmpdist<distance )
                    distance=tmpdist;
                  if(distance<2)
                    break;
                }
                off++;  
              }
            }
          }      
    
    console.log("The distance is:"+distance);
    if( distance > abilityInfo[abilityID].range )
    {
        setStatus("Your target is too far away.");
        combatmsg("Your target is too far away.", chatColors.error, 1);
        player.performingAction=-1;
        player.view=0;
        return;      
    }
    if( Entity.List[targetID].attr("type") == "merchant" )
    {
      setStatus("Your target is invulnerable.");
      combatmsg("Your target is invulnerable.", chatColors.error, 1);
      player.performingAction=-1;
      player.view=0;
      return;    
    }
  }
  setStatus(""); 
  
  $('#abilitystatus').show();
  $('#status').hide();
  $('#abilitystatus').html(ability.name+" ("+ability.atype+")");
  socket.send( {'type':'doability', 'data':{'abilityID':abilityID, 'targetID':targetID, 'direction':direction} } );
  $('#abilitystatus').animate({width:"0px"}, ability.delay, 'linear', function()
  {
    if( player.name==-1)
      return;
    $('#abilitystatus').hide();
    $('#abilitystatus').css("width","830px");
    player.performingAction=-1;
    $('#status').show();
    player.cooldownTimers[ability.slot] = frame+ability.delay;
    console.log(" ability.slot is:"+ability.slot+", p.cT[a.s] is:"+player.cooldownTimers[ability.slot])
    console.log("ab de"+ability.delay);
    renderAbilityBySlot(ability.slot);
    //renderAbilities();
  });
  player.view=0;  
}


function popout()
{
  window.open("client.php","srpg","status=0,toolbar=0,location=0,menubar=0,directories=0,resizable=0,scrollbars=0,height=577,width=848");  
}

function loadTradeWindow(eid)
{
  invCurPage=1;
  if( eid in Entity.List )
  {
    var tradetarget = Entity.List[eid];
    var tname = tradetarget.attr("name");
    renderInventory();
    $('#itemview').hide();
    $('.cboxshadow').hide();
    $('#loading').html('');
    $('#loading').hide();
    $('#inventory').show();
    $('#equipment').hide();
    $('#trade').show();
    $('#tradewithdisp').html(tname+" Offers:");
    setStatus('Trading with '+tname+'. <span style="color:#FF9900">M</span> offer gold. <span style="color:#FF9900">L</span> accept trade. <span style="color:#FF9900">SPACE</span> to cancel trade.');
    player.view="inventory";
    tradeWith = eid;
  }    
}

function requestTrade()
{
      /*
        When we press T, do the following:
        1. Make sure we have someone to trade with.
        2. send the request to the server
        3. show a window telling us we're waiting for the trade to be accepted
        4. give the user the option to cancel by moving or pressing space
      */
  tradeRequestFrom=-1;
  tradeWith=-1;      
  socket.send({ 'type':'reqtrade','data':{'id':player.canTrade} });
  
  player.view = "tradewait";
  $('#look').hide();
  $('.cboxshadow').hide();
  $('#lookview').html("");
  $('#lookview').hide();
  $('#shadow').hide();
  $('#cursor').hide();
  
  var statusStr = 'Requesting to trade with '+Entity.List[player.canTrade].attr("name")+'.';
  var statusStrb = '<span style="color:#FF9900">SPACE</span> to cancel.'; 
  $('#loading').html(statusStr+"<br>"+statusStrb);
  $('#loading').show();
  setStatus(statusStr+" "+statusStrb,"fff");
  tradeRequestTo = player.canTrade;
}


function cancelTrade()
{
  for( var i in trading.weOffer.items )
  {
    player.inventory.push({id:trading.weOffer.items[i].id,qty:1});
  }
  trading.weOffer.items = [];
  trading.theyOffer.items = [];
  trading.weOffer.gold=0;
  trading.theyOffer.gold=0;
  tradeRequestFrom = -1;
  tradeRequestTo = -1;
  tradeWith = -1;
  tradeAccepted=0;
  renderTrade();
  menus.inventory[32]();
}

function finalizeTrade()
{
  for( var i in trading.theyOffer.items )
  {
    player.inventory.push({id:trading.theyOffer.items[i].id,qty:1});
  }
  trading.weOffer.items = [];
  trading.theyOffer.items = [];
  player.gold-=Number(trading.weOffer.gold);
  player.gold+=Number(trading.theyOffer.gold);
  trading.weOffer.gold=0;
  trading.theyOffer.gold=0;
  tradeRequestFrom = -1;
  tradeRequestTo = -1;
  tradeWith = -1;
  tradeAccepted=0;
  renderTrade();
  menus.inventory[32]();

  chatmsg("The trade was completed.", chatColors.say);
}
function renderTrade()
{
  $('#youoffer').css('border-color','#444');
  $('#theyoffer').css('border-color','#444');
  $('#tradeyouofferheader').html("You Offer:");
  tradeAccepted=0;
  tradeTheyAccept=0;
  var weOfferStr = "";
  var theyOfferStr = "";
  var o=0;
  for(var i in trading.weOffer.items)
  {
    //var item = itemInfo[trading.weOffer.items[i].id];
    var itemid = trading.weOffer.items[i].id;
    weOfferStr += '<span style="color:#FF9900">'+String.fromCharCode( (97+o) )+'</span> <span style="color:'+itemColors[ getItemProperty(itemid, 'quality') ]+'">'+getItemProperty(itemid, 'name')+"</span><br>";  
    o++;
  }
  weOfferStr += 'Gold: '+addCommas(trading.weOffer.gold);
  $('#youoffer').html(weOfferStr);
  
  o = 1;
  for(var i in trading.theyOffer.items)
  {
    //var item = itemInfo[trading.theyOffer.items[i].id];
    var itemid = trading.theyOffer.items[i].id;
    theyOfferStr += '<span style="color:#FF9900">'+o+'</span> <span style="color:'+itemColors[ getItemProperty(itemid, 'quality') ]+'">'+getItemProperty(itemid, 'name')+"</span><br>";  
    o++;
    if(o==10)
      o=0;
  }
  theyOfferStr += 'Gold: '+addCommas(trading.theyOffer.gold);       
  $('#theyoffer').html(theyOfferStr);
}

function targetNearestHostile()
{
  /*
    loop thru the entity list and find the closest hostile monster,
    then target it.
  */
  var bestDist = 999;
  var candidate = -1;
  for( var e in Entity.List )
  {
    var tmpent = Entity.List[e];
    if( tmpent.attr("hostile") == 1 )
    {
      var dist = distance( player.x, player.y, tmpent.attr("x"), tmpent.attr("y") );
      if( dist < bestDist )
      {
        bestDist = dist;
        candidate = e;
      }
    }
  }
  
  /*
    If a candidate was found, it will become our target.
    If no target was found, it'll clear our target anyway. (maybe this is bad?)
  */
  setTarget(candidate);  
}

function inviteToGroup(EID)
{
  for(var m in group)
    if(group[m].id == EID)
      return;
      
  if( !groupLeader && inGroup != -1 )
  {
    chatmsg("Only the leader of the group can invite someone.", chatColors.say);
    return;
  }
  if( group.length >= 5 )
  {
    chatmsg("The group is full.", chatColors.say);
    return;
  }          
  chatmsg("You invite "+Entity.List[EID].attr("name")+" to join your group.", chatColors.say);
  socket.send({ 'type':'groupinvite','data':{'eid':EID} });
}

function updateGroup()
{
  if( inGroup==-1 )
    return;
  if( group.length == 0)
  {
    chatmsg( "The group has disbanded.", chatColors.say );
    groupInviteFrom = -1;
    inGroup = -1;
    groupLeader = 0;
    group = [];
    $('#grouplist').html('');
    $('#menugroup').hide();
    $('#menulist').show();
  } else {
    $('#grouplist').html('');
    

    for( var m in group )
    {
      createBar('grouplist', 'GL'+m, group[m].name, 'C41414');
      
      var gmID = group[m].id;
      //if this group member is in the zone with us:
      if( gmID in Entity.List )
        adjustBar('GL'+m, Entity.List[gmID].attr("curhp"), Entity.List[gmID].attr("maxhp"), group[m].name, 'C41414');
      else
        adjustBar('GL'+m, 1, 1, group[m].name, '7E0866');
    }
    
    if( groupLeader )
      $('#groupheader').html("Group (leader)");
    else
      $('#groupheader').html("Group");
    $('#menulist').hide();  
    $('#menugroup').show();
    inGroup=1;  
  }
}

function kickGroupMember(slot)
{
  console.log("kick group member slot: "+slot);
  if( slot in group )
  {
    socket.send({ 'type':'groupkick','data':{'id':group[slot].id} });
    player.view=0;
    $('#loading').hide();
  }  
}

function updateGroupMember(EID)
{
  console.log("upd group member called on eid:"+EID);
  
  var groupID = getGroupID(EID);
  if( groupID != -1 )
  {
    if( EID in Entity.List )
    {
      adjustBar('GL'+(groupID), Entity.List[EID].attr("curhp"), Entity.List[EID].attr("maxhp"), group[groupID].name, 'C41414');
    }else{
      adjustBar('GL'+(groupID), 1, 1, group[groupID].name, '7E0866');
    }    
  }
}

function addGroupMember(id,name)
{

  createBar('grouplist', 'GL'+group.length, name, 'C41414');
  
  //if this group member is in the zone with us:
  if( id in Entity.List )
    adjustBar('GL'+group.length, Entity.List[id].attr("curhp"), Entity.List[id].attr("maxhp"), name, 'C41414');
  else
    adjustBar('GL'+group.length, 1, 1, name, '7E0866');  
  chatmsg(name+" joins the group.", chatColors.say);

  if( groupLeader )
    $('#groupheader').html("Group (leader)");
  else
    $('#groupheader').html("Group");
      
  $('#menulist').hide();  
  $('#menugroup').show();
  group.push({id:id,name:name});  
}

function removeGroupMember(id,name)
{
  console.log("remov group member id:"+id+", name:"+name);
  var groupID = getGroupID(id);
  if( groupID != -1)
  {
    $('#GL'+groupID+"bar").remove();
    group.splice(groupID,1);    
    chatmsg(name+" leaves the group.", chatColors.say);
    if(group.length==0)
      updateGroup();
  } 
}

function getGroupID(id)
{
  for( var m in group )
    if( group[m].id == id )
      return m;
  return -1;
}

function openTradeWithMerchant(EID)
{
  merchantList = [];
  merchantID = EID;
  player.view="trademerchant";
  $('#trademerchant').show();
  setStatus('Trading with '+Entity.List[EID].attr("name")+'. <span style="color:#ff9900">SPACE</span> to close.');  
}







var TSOffset = 0;
var TSCurPage=1;
var TSTotalPage=1;
var TSList = [];
function renderTradeContent(which)
{
  console.log("render trade content (with merchant)");
  $('#tmg').animate({opacity:1},0);
  
  TSList = [];

  var leftdisplay='';
  var rightdisplay='';
  
    
  if( which == "sell" )
  {
    leftdisplay = '<span style="color:#E1D901">Sell what items?</span><br>';
    rightdisplay = '<div style="color:#E1D901" id="yourgoldsell">Your gold: '+addCommas(player.gold)+'</div>';
    for(var i in player.inventory)
    {
      TSList.push( player.inventory[i].id );
    }
  } else {
    leftdisplay = '<span style="color:#E1D901">'+Entity.List[merchantID].attr("name")+' sells:</span><br>';
    rightdisplay = '<div style="color:#E1D901" id="yourgoldsell">Your gold: '+addCommas(player.gold)+'</div><br>';
    for(var i in merchantList )
    {
      TSList.push( merchantList[i] );
    }
  }
  TSOffset=(TSCurPage-1)*26;
  //erase old list
  $('#tmla').html('');
  $('#tmlb').html('');
    
  //set page numbers:
  $('#tmcurrentpage').html(TSCurPage);  
  var totalpages = Math.ceil(TSList.length/26);
  $('#tmtotalpages').html(totalpages);
  TSTotalPage=totalpages;
  

  
  for(var i=0; i<26; i++)
  {
    if( (i+TSOffset) in TSList )
    {
      //var item = itemInfo[ TSList[i+TSOffset] ];
      var item = globalItemList[ TSList[i+TSOffset] ];
      var tmpstr= '<div class="invitem"><span style="color:#FF9900">'+String.fromCharCode( (97+i) )+'</span> <span style="color:'+itemColors[getItemProperty(item[0], 'quality')]+'">'+ getItemProperty(item[0], 'name') +'</span></div>';
      if(i<13)
        leftdisplay+=tmpstr;
      else
        rightdisplay+=tmpstr;
    }
  }
  $('#tmla').html(leftdisplay);
  $('#tmlb').html(rightdisplay);
  $('#tmg').fadeIn('fast');
}           

function fileBugReport()
{
  var report = $('#bugreportdesc').val();
  socket.send( {type:'bug', data:{'report':report} } );
  player.view=0;
  $('#bugreport').hide();
  checkFloor();
}


function addItemToInventory(IID, QTY)
{
  player.inventory.push({id:IID,qty:QTY});
  updateWeight(-1);
  if( player.weight > player.maxweight )
  {
    chatmsg("You are encumbered.", chatColors.error, 1);
  }
}



function getPos(EID)
{
  var x = player.x;
  var y = player.yl
  if( EID in Entity.List )
  {  
    var e = Entity.List[EID];
    if( e.attr("name") == player.name )
    {
      x = player.x;
      y = player.y;
    } else {
      x = e.attr("x");
      y = e.attr("y");
    }
    return {x:x,y:y};
  }
}
