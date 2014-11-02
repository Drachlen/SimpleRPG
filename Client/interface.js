/**
 * %SRPG%
 * 2011 Kevin Tyma (drachlen@gmail.com)
 * 
 **/

var chatColors = {
     system : 'E1D901',
        say : 'FFFFFF',
      group : '0890A4',
       tell : '00FF00',
        ooc : '175905',
      emote : 'CCC',
	 otherhit : 'FFF',
	   youhit : 'FFF',
	   hityou : 'F00',
	   error  : 'F00',
	   magic  : '688AF8',
	   debug  : 'D88E0E'
};

/*
obviously can combine these two functions v v v
*/
function chatmsg(msg,color,bold)
{
  $('#msglog').append('<span style="color:#'+color+';font-weight:'+(bold?'bold':'normal')+'">'+msg+'</span><br>')
  $("#msglog").attr({ scrollTop: $("#msglog").attr("scrollHeight") });
}
function combatmsg(msg,color,bold)
{
  $('#combatlog').append('<span style="color:#'+color+';font-weight:'+(bold?'bold':'normal')+'">'+msg+'</span><br>')
  $("#combatlog").attr({ scrollTop: $("#combatlog").attr("scrollHeight") });
}

function setStatus(msg,color)
{
  $('#status').html('<span style="color:#'+color+'">'+msg+'</span>');
}


var curHelpPage=1;
function renderHelp(page)
{
  if( page == 5 )
    page = 1;
  if( page == 0)
    page = 4;
  curHelpPage=page;
  $('.helpcontent').hide();
  $('#helpcontent'+page).show();
  $('#helpcurrentpage').html(page);
}


function doHeal(targetID, attackerID, heal, damageType, abilityID)
{
  console.log("doHeal call");
  if( !(targetID in Entity.List) || !(attackerID in Entity.List) )
    return;
  var target = Entity.List[targetID];
  var attacker = Entity.List[attackerID]; 
  //adjust the health of the target:
  var targetNewHP = Number(target.attr("curHP"))+heal;
  target.attr("curHP", targetNewHP);
  //if this is our target, update the health bar display:
  if( player.target == targetID )
    adjustBar('targethp', targetNewHP, target.attr("maxHP"), 1,'#C41414' );
  var healString = "";
  //we're the one being hit  
  if( target.attr("name") == player.name )
  {
    healString = attacker.attr("name")+" heals you for "+heal+" health.";
    /*if( player.target == -1 )
		  setTarget(attackerID);*/
    player.HP[0] += heal;
    adjustBar('hp', player.HP[0], player.HP[1], 0, '#C41414');  
  } else {
    var healer = attacker.attr("name")+ " heals";
    if( attacker.attr("name") == player.name )
      healer = "You heal";
    healString = healer+" "+target.attr("name")+" for "+heal+" health.";
  }
  if(target.attr("type")=="player")
    updateGroupMember(targetID);
    
  castAbility(attackerID, targetID, abilityID);     
  combatmsg( healString, chatColors.magic, 0);  
}

function doDamage(targetID, attackerID, damage, damageType, abilityID)
{
  console.log("doDamage dmgtype:"+damageType);
  //verify we have these entities in our client:
  if( !(targetID in Entity.List) || !(attackerID in Entity.List) )
  {
    //chatmsg("ERROR: Client desync. Missing entities: ["+targetID+", "+attackerID+"]. Server will send a new zone list to try to fix it.", chatColors.error, 1);
    //todo socket send here tell server we're desync. server will then reply with full new zone list to try to fix it.
    return;
  }
  var localPlayerIsTarget = 0;
  var target = Entity.List[targetID];
  var attacker = Entity.List[attackerID];
  var DS_ATTACKERNAME = "";
  var   DS_TARGETNAME = "";
  var       DS_ACTION = "";
  var       DS_RESULT = "";
  var        DS_COLOR = chatColors.otherhit;
  var         POINT_S = "point"+(damage!=1?'s':''); 
  var hit;
  if( damageType in hitTypes )
    hit = hitTypes[damageType];
  else
    hit = hitTypes.hit;    
  if( target.attr("name") == player.name )
  {
    DS_ACTION = (damage>0?hit[0]+hit[1]:'tries to '+hit[0]);
    localPlayerIsTarget=1;
  }else
  {
    if( attacker.attr("name") == player.name )
      DS_ACTION = (damage>0?hit[0]:'try to '+hit[0]);
    else
      DS_ACTION = (damage>0?hit[0]+hit[1]:'tries to '+hit[0]);
  }
  if( damage > 0 )
  {
    DS_RESULT = " for "+damage+" damage."; 
  } else {
    if( attacker.attr("name") == player.name )
      DS_RESULT = ", but miss.";
    else
      DS_RESULT = ", but misses.";
  }

  
  //adjust the health of the target:
  var targetNewHP = Number(target.attr("curHP"))-damage;
  target.attr("curHP", targetNewHP);
  
  //if this is our target, update the health bar display:
  if( player.target == targetID )
    adjustBar('targethp', targetNewHP, target.attr("maxHP"), 1,'#C41414' );
  
  //we're the one being hit  
  if( target.attr("name") == player.name )
  {
    DS_TARGETNAME = "YOU";
    if( damage > 0 && damageType != "magic" )
      DS_COLOR = chatColors.hityou;
    if( player.target == -1 )
		  setTarget(attackerID);
    player.HP[0] -= damage;
    adjustBar('hp', player.HP[0], player.HP[1], 0, '#C41414');  
  } else {
    DS_TARGETNAME = target.attr("name");
  }
  //we're the one attacking
  if( attacker.attr("name") == player.name )
  {
    DS_ATTACKERNAME = "You";
    DS_COLOR = chatColors.youhit;
  } else {
    DS_ATTACKERNAME = attacker.attr("name");
  }
  if( damageType == "magic" || damageType == "nonmelee" )
  {
    DS_COLOR = chatColors.magic;
  }

  var damageString = DS_ATTACKERNAME+" "+DS_ACTION+" "+DS_TARGETNAME+""+DS_RESULT;
  
  if(target.attr("type")=="player")
    updateGroupMember(targetID);


  castAbility(attackerID, targetID, abilityID);  

  combatmsg( damageString, DS_COLOR, 0);  
}

function castAbility(casterID, targetID, abilityID)
{
  if( 
  abilityID === undefined || 
  abilityID == -1 || 
  !(abilityID in abilityInfo) || 
  !(targetID in Entity.List)  ||
  !(casterID in Entity.List) )
    return;
  var ability = abilityInfo[abilityID];
  if('cast' in ability)
  {
    console.log("casting ability");
    ability.cast(casterID, targetID);
  }
  
  var caster = Entity.List[casterID];
  var castername = caster.attr("name");
  var target = Entity.List[targetID];
  var targetname = target.attr("name");
  if( castername == player.name && 'MP' in ability )
  {
    player.MP[0] -= ability.MP;
    adjustBar('mp',player.MP[0],player.MP[1],0,'#153AC3');
  }  
  if( targetname == player.name && 'castonyou' in ability )
  {
    combatmsg(ability.castonyou, chatColors.magic, 0);
  } else
  if( targetname != player.name && 'castonother' in ability )
  {
    combatmsg(targetname+ability.castonother, chatColors.magic, 1);
  }   
}



function createBar(context, id, text, color)
{

  console.log("createBar context, id, ( "+context+", "+id+" )");
  /*bar colors:
    #C41414  red     health
    #153AC3  blue    mana
    #C2BC16  yellow  endurance
    #36C216  green   experience
  */
  var bar = '<div class="bar" style="background-color:#'+color+'" id="'+id+'bar">'+
            '<div style="float:left;margin-left:5px;">'+text+'</div>'+
            '<div style="float:right;margin-right:5px;" id="'+id+'barnumbers"></div>'+
            '</div>';
  $('#'+context).append(bar);
}

/*
  @param id string ex: 'hp'
  @param current int current value
  @param max int max value
  @param percent boolean display current&max value or percent value
*/
function adjustBar(id, current, max, percent, rcolor)
{
  if( current<0)
    current=0;
  if(max<0)
    max=0;
  var barSize = 150;
  var barDisplay = 150/(max/current); 
  if(barDisplay<0)
    barDisplay=0; 
  var barID = $('#'+id+'bar');  
  var bgcolor = $(barID).css('background-color');
  $(barID).css('background-color','#fff');
  $(barID).css('border-color','#fff');
  if(typeof percent == "string")
  {
    var percentd = Math.round( (barDisplay/barSize)*100 );    
    if( current==0&&max==0 )
    {
      percentd=0;
      barDisplay=0;
    }
    $(barID).html('<span style="padding-left:5px;">'+percent+'</span>');// <span style="float:right;padding-right:5px;">'+percentd+'%</span>');  
  }else
  if(percent==1)
  {
    var percent = Math.round( (barDisplay/barSize)*100 );    
    if( current==0&&max==0 )
    {
      percent=0;
      barDisplay=0;
    }
    $(barID).html(percent+'%');
  }else{
    if(current<0)
      current=0;
    if( current==0&&max==0 )
      barDisplay=0;
    $('#'+id+'barnumbers').html(current+'/'+max);
  }  
  
  /*if( percent )
  {
    $(barID).css({'background-position':barDisplay});
    $(barID).css('background-color',bgcolor);
    $(barID).css('border-color','#999');
  }else{*/
    $(barID).stop(true,true);
    $(barID).animate({'background-position':barDisplay},200,function()
    {
      $(barID).css('background-color',rcolor);
      $(barID).css('border-color','#999');
    });
  //}
}

function renderLootWindow()
{
  var lootstring="Loot:<br>";
  for(var i=0;i<13;i++)
  {
    if( i in lootList && lootList[i] != -1 )
    {
      console.log("i is "+i+", lootList[i] is "+lootList[i]);
      //var item = itemInfo[lootList[i]];
      var item = globalItemList[ lootList[i] ];
      lootstring+= '<span style="color:#FF9900">'+String.fromCharCode( (97+i) )+'</span>  <span style="color:'+itemColors[ getItemProperty(lootList[i], 'quality') ]+'">'+getItemProperty(lootList[i], 'name')+'</span><br>';
    } else {
      lootstring+="<br>";
    }
  }
  lootstring += "<span style='color:#FF9900'>t</span> Loot everything";
  $("#dlootlist").html(lootstring);
}

function addCommas(nStr)
{
	nStr += '';
	x = nStr.split('.');
	x1 = x[0];
	x2 = x.length > 1 ? '.' + x[1] : '';
	var rgx = /(\d+)(\d{3})/;
	while (rgx.test(x1)) {
		x1 = x1.replace(rgx, '$1' + ',' + '$2');
	}
	return x1 + x2;
}

function renderAbilities()
{
  $('#cpabilities').html('');
  for(var i=0;i<10;i++)
  {
    var dispnum = i+1;
    if(dispnum==10)
      dispnum=0;
    $('#cpabilities').append('<div class="ability" id="abilitydisp'+dispnum+'">'+dispnum+'</div>');
    renderAbility(dispnum);
  }
}

function renderAbilityBySlot(slot)
{
  for(var i=0;i<10;i++)
  {
    if( player.actions[i] != -1 && abilityInfo[player.actions[i]].slot == slot )
      renderAbility(i);
  }
}

function renderAbility(aslot)
{              
  //console.log("rA aslot:"+aslot);   
  if( player.actions[aslot] == -1 )
  {
    $('#abilitydisp'+aslot).css({backgroundColor:"#000", border:"1px solid #111", color:"#111"});
  } else {
    var abilityID = player.actions[aslot];
    var ability = abilityInfo[abilityID];
    var rdy=1;                   
      //console.log(" a.s in p.cT");
      if(frame-player.cooldownTimers[ability.slot] < abilityInfo[abilityID].cooldown )
      {
        console.log("cooldown timer active");
        rdy=0;
        var timeleft = abilityInfo[abilityID].cooldown-(frame-player.cooldownTimers[ability.slot]);
        $('#abilitydisp'+aslot).stop(true, true);
        $('#abilitydisp'+aslot).css({backgroundColor:"#000", border:"1px solid #444", width:"0px"});
        $('#abilitydisp'+aslot).animate({width:"16px"},timeleft,'linear', function()
        {
          $('#abilitydisp'+aslot).css({backgroundColor:"#0E200C", color:"#ff9900", border:"1px solid #1C6816", width:"16px"});
        });
      } else {
        $('#abilitydisp'+aslot).css({backgroundColor:"#0E200C", color:"#ff9900", border:"1px solid #1C6816", width:"16px"});  
      }

    if(rdy)
      $('#abilitydisp'+aslot).css({color:"#ff9900",backgroundColor:"#0E200C", border:"1px solid #1C6816", width:"16px"});
  }
}


var abilitiesOffset = 0;
var abilitiesCurPage=1;
var abilitiesTotalPage=1;
function renderAbilityHotkeys()
{
  abilitiesOffset=(abilitiesCurPage-1)*13;
  $('#abilitieshotkeydisplay').html('');
  
  $('#abilitieslistcurrentpage').html(abilitiesCurPage);  
  var totalpages = Math.ceil(player.abilities.length/13);
  $('#abilitieslisttotalpages').html(totalpages);
  abilitiesTotalPage=totalpages;
  
  var abilitiesDisplay = "";
  
  $('#abilitieslistdisplay').animate({opacity:1},0);
  
  //List  13 abilities
  for(var i=0; i<13; i++)
  {
    if( (i+abilitiesOffset) in player.abilities )
    {
      var ability = player.abilities[(i+abilitiesOffset)].id;
      abilitiesDisplay += '<div class="invitem"><span style="color:#FF9900">'+String.fromCharCode( (97+i) )+'</span> '+ abilityInfo[ ability ].name +' ('+abilityInfo[ability].atype+')</div>';
    }
  }
  $('#abilitieslistdisplay').html(abilitiesDisplay);
  $('#abilitieslistdisplay').fadeIn('fast');
    
  for(var i=0;i<10;i++)
  {
    var disp=i+1;
    if(disp==10)
      disp=0;
    var name = '<span style="color:#999">Nothing</span>';
    var color = '999';
    if( player.actions[disp] != -1 && player.actions[disp] in abilityInfo )
    {
      name = abilityInfo[player.actions[disp]].name;
      color='fff';
    }
    $('#abilitieshotkeydisplay').append('<div class="invitem"><span style="color:#'+color+'">'+disp+'</span> '+ name +'</div>');
  }
  
  //renderAbilities();
}

function abilityDetails(abilityID,hotkey)
{
  currentDisplayedAbility = abilityID;
  currentDisplayedAbilityHotkey = hotkey;
  console.log(abilityID);
  if( !(abilityID in abilityInfo) )
    return;
  player.view="abilitydetails";
  $('.cboxshadow').show();
  $('#abilitydescription').show();
  
  var status = 'Viewing ability.';
  if(hotkey!=-1)
    status+= ' <span style="color:#ff9900">C</span> clear hotkey.';
  else
    status+= ' <span style="color:#ff9900">0</span>-<span style="color:#ff9900">9</span> set hotkey.';
  
  status+= ' <span style="color:#ff9900">SPACE</span> to close.'
  setStatus(status);
  var desc = "No description";
  var ability = abilityInfo[ abilityID ];
  desc = '<div style="text-align:center;padding:5px;color:#E1D901">'+ability.name+' ('+ability.atype+')</div>';
  desc += '<span style="color:#999">'+ability.desc+"</span><br>";
  desc += "Cast: "+ability.delay+"<br>";
  desc += "MP: "+ability.MP+"<br>";
  desc += 'Cooldown: '+ability.cooldown;
  desc += '<br><br>';
  desc += 'Use <span style="color:#ff9900">0</span>-<span style="color:#ff9900">9</span> to set this ability to a hotkey.';
  $('#abilitydescription').html(desc);
}

function handleVisual(AID,x,y,targetID,direction)
{

    var visual = $('<div></div>')
        .addClass('fireball')
        .css({
          'left':x*16+"px",
          'top':(y)*16+"px",
        });
        
    viewport.append(visual);

  
  var cmsg = "";
  if( targetID != -1 )
  {
    if( targetID in Entity.List )
    {
      var target = Entity.List[targetID];
      if( target.attr("name") == player.name )
      {
        cmsg = abilityInfo[AID].hityou;
        x = player.x;
        y = player.y;
      } else {
        x = target.attr("x");
        y = target.attr("y");
        cmsg = target.attr("name")+abilityInfo[AID].otherhit;
      }
    }
  }
  
  combatmsg(cmsg, chatColors.magic);
  
  if( direction != -1 )
  {
    switch( direction )
    {
      case 'north':
        y-=20;
      break;
      case 'east':
        x+=20;
      break;
      case 'south':
        y+=20;
      break;
      case 'west':
        x-=20;
      break;
    }
  } 
  $('.fireball').animate({left:(x*16)+"px",top:(y*16)+"px"},500,'linear', function()
  {
    $(this).remove();
  });

}

function renderAttributes()
{
  for(var a=0; a<16; a++)
  {
    var attributeName = itemStats[a];
    //skip HP & MP attributes, since those are rendered as bars
    if( !(attributeName in ["HP", "MP"]) )
      $('#cpanel_'+attributeName).html( player.attributes[ attributeName ] );
  }
  //update our HP & MP bars (even if nothing changed)
  adjustBar('hp',player.HP[0],player.HP[1],0,'#C41414');
  adjustBar('mp',player.MP[0],player.MP[1],0,'#153AC3');
}

function updateHPdisplay(EID)
{
  if( !(EID in Entity.List) )
    return;
  var ent = Entity.List[EID];
  if( player.target == EID)
    adjustBar('targethp', ent.attr("curhp"), ent.attr("maxhp"), 1,'#C41414' );    
  if( ent.attr("type") == "player" )
    updateGroupMember(EID);
}