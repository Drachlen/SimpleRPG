
/*
var itemColors = {
  normal:'fff',
  magic:'3A90DB',
  rare:'40FF33',
  unique:'FFFF00',
  lore:'999',
};  */

var itemColors = [
  "#fff",
  "#3A90DB",
  "#40FF33",
  "#FFFF00",
  "#999"];

var itemQuality = [
'NORMAL',
'MAGIC',
'RARE',
'UNIQUE',
'LORE'
];


var equipmentSlots = ['primary','secondary','head','neck','chest','back','arms','hands','waist','legs','feet','finger'];
var weaponSkills = ['','Hand to hand', 'Slashing', '2 Hand Slashing', 'Piercing', '2 Hand Piercing', 'Blunt', '2 Hand Blunt'];

function itemStatsDisplay(itemID)
{
  console.log("Displaying stats for item id: "+itemID);
  var display = "";
  if( itemID in globalItemList )
  {
    //var item = itemInfo[itemID];
    var item = globalItemList[itemID];
    
    //getItemProperty(item[0], 'name')
    display += '<div style="width:400px;text-align:center; color:#fff">';

    display += '<span style="color:'+itemColors[getItemProperty(itemID, 'quality')]+';font-weight:bold;">'+getItemProperty(itemID, 'name')+'</span><br>';
    display += '<span style="color:#fff">'+itemQuality[ getItemProperty(itemID, 'quality') ]+", ";
    display += 'WT: '+getItemProperty(itemID, 'weight')+'</span><br>';
    display += '<span style="color:#999">'+getItemProperty(itemID, 'desc')+'</span>';
    display += '</div>';
    //equippable slots
    if( getItemProperty(itemID, 'slot') != 0 )
      display += 'Slot: <span style="color:#0f0">'+(equipmentSlots[ getItemProperty(itemID, 'slot')-1 ])+'</span><br>';    
    if( getItemProperty(itemID, 'skill') != 0 )
      display += 'Skill: <span style="color:#0f0">'+weaponSkills[getItemProperty(itemID, 'skill')]+'</span><br>';
    //damage (if it's a weapon)
    if( getItemProperty(itemID, 'damage') != 0 )
      display += 'Damage: <span style="color:#0f0">'+getItemProperty(itemID, 'damage')+'</span> ';
    //delay (if it's a weapon)
    if( getItemProperty(itemID, 'delay') != 0 )
      display += 'Delay: <span style="color:#0f0">'+getItemProperty(itemID, 'damage')+'</span><br>';
    for(var i=0;i<itemStats.length; i++)
    {
      //console.log("stat:"+itemStats[i]);
      var statvalue = getItemProperty(itemID, itemStats[i].toLowerCase() );
      if( statvalue > 0 )
        display += itemStats[i]+': <span style="color:#0f0">+'+statvalue+'</span> ';
      else if( statvalue < 0 )
        display += itemStats[i]+': <span style="color:#f00">'+statvalue+'</span> ';     
    }
    display += '<br>';
    
    var reqlevel = getItemProperty(itemID, 'reqlevel');
    var reqclass = getItemProperty(itemID, 'reqclass');
    var reqarchetype = getItemProperty(itemID, 'reqarchetype');
    if( reqlevel != 0 || reqclass != 0 || reqarchetype != 0 )
    {
      display += '<span style="color:#999">Requirements:</span><br>';
      if( reqlevel != 0)
      {
        var reqColor="fff";
        if( player.level < reqlevel )
          reqColor = "f00";
        else
          reqColor = "0f0";
        display += '<span style="color:#'+reqColor+'">Level</span>: <span style="color:#'+reqColor+'">'+reqlevel+'</span><br>';
      }
      if( reqclass != 0)
      {
        var reqColor="fff";
        if( player.charclass != reqclass )
          reqColor = "f00";
        else
          reqColor = "0f0";
        display += '<span style="color:#'+reqColor+'">Class</span>: <span style="color:#'+reqColor+'">'+reqclass+'</span><br>';
      }
      if( reqarchetype != 0)
      {
        var reqColor="fff";
        if( player.archetype != reqarchetype )
          reqColor = "f00";
        else
          reqColor = "0f0";
        display += '<span style="color:#'+reqColor+'">Archetype</span>: <span style="color:#'+reqColor+'">'+reqarchetype+'</span><br>';
      }  
    } 
/*
    

    
    if( 'focus' in item )
    {
      for(var f=0;f<item.focus.length;f++)
      {
        var focus = item.focus[f];
        display += '<br><span style="color:#3A90DB">Focus:</span>'
        +' '+abilityInfo[focus].name+'<br>'
        +'<span style="color:#999">'+abilityInfo[focus].desc+'</span><br>';
      }
    }
    
    if( 'effects' in item )
    {
      for(var f=0;f<item.focus.length;f++)
      {
        var effect = item.effects[f];
        display += '<br><span style="color:#3A90DB">Effect:</span>'
        +' '+abilityInfo[effect].name+'<br>'
        +'<span style="color:#999">'+abilityInfo[effect].desc+'</span><br>';
      }
    }
*/

      
    /*
      Slot is passed to this function so that we can decide
      what details to render.
      for example, if the slot is 'primary', meaning it's in our right hand,
      then we need to be able to tell the client that they can do two things:
      unequip the item, or drop the item.
      
      if the slot is 0, then it's in the player's inventory. they can only:
      equip the item (if req are met), or drop the item.
      
      some special items will have more options.
    */  
  } else {
    display = "No such item.";
  }
  return display;
}
function displayItemDetails(itemid,slotid,from)
{
  console.log("itemidd"+itemid+", slotid:"+slotid);
  var localid = itemid;
  //inventory, not equipment:
  var context="itemview";
  if( from == "inventory" )
  {
    var localid = itemid+inventoryOffset;
    itemid = player.inventory[localid].id;
  }
  
  if( from == "sellmerchant" )
  {
    context = "tmiview";
    var localid = itemid+TSOffset;
    itemid = player.inventory[localid].id;
  }
  
  if( from == "buymerchant" )
  {
    context = "tmiview";
    var localid = itemid+TSOffset;
    itemid = merchantList[localid];
  }
  
  if( from == "offered")
  {
    //var localid = itemid;
    //itemid = 
  }
  
  console.log("local"+localid);
  
  var status = "Viewing item. ";
  if( itemid in globalItemList )
  {
    //var item = itemInfo[itemid];
    var item = globalItemList[itemid];
    currentDisplayedItem.id=itemid;
    currentDisplayedItem.slot=slotid;
    currentDisplayedItem.droppable=1;
    currentDisplayedItem.localid = localid;
    currentDisplayedItem.from = from;
    /*
      Slot is passed to this function so that we can decide
      what details to render.
      for example, if the slot is 'primary', meaning it's in our right hand,
      then we need to be able to tell the client that they can do two things:
      unequip the item, or drop the item.
      
      if the slot is 0, then it's in the player's inventory. they can only:
      equip the item (if req are met), or drop the item.
      
      some special items will have more options.
    */
    
    
    if( from != "buymerchant" && from != "sellmerchant" )
    {
      //this is something that is equipped.
      if( from == "equipment" )
      {
        status += '<span style="color:#FF9900">U</span> unequip. ';
      } else {
        //this item is not equipped.
        
        //is it equippable?
        if( getItemProperty(itemid, 'slot') != 0 && tradeWith==-1 )
        {
          //it can be equipped, but can it be by us?
          if( reqMet(-1, itemid) )
            status += '<span style="color:#FF9900">E</span> equip. ';
          else
            status += '<span style="color:#f55">Requirements not met.</span> ';
        }
        
        if( tradeWith!=-1 )
        {
          if( from == "offered" )
          {
            status += '<span style="color:#FF9900">R</span> remove from trade. ';
          } else {
            if( from != "theyoffer" )
              status += '<span style="color:#FF9900">A</span> add to trade. ';
          }
        }      
      }
    } else {
      if( from == "sellmerchant" )
        status += '<span style="color:#FF9900">S</span> sell this item. ';
      if( from == "buymerchant" )
        status += '<span style="color:#FF9900">B</span> buy this item. ';
    }     
  //    if(currentDisplayedItem.droppable)
  //      status += '<span style="color:#FF9900">D</span> drop. '; 
    
    console.log("context is:"+context);
    $("#"+context).show();
    $('.cboxshadow').show();
    if( from != "offered" && from != "theyoffer" && from != "sellmerchant" && from != "buymerchant" && from != "equipment")
      status += '<span style="color:#FF9900">P</span> destroy. ';
    status += '<span style="color:#FF9900">SPACE</span> close.';
    setStatus(status);
    $("#"+context).html( itemStatsDisplay(itemid) );    
    
    if( from == "sellmerchant" )
    {
      var appstr
      = "<br><br>"
      + '<span style="color:#FF9900">S</span> '
      + '<span style="color:#3A90DB">Sell this item for</span> '
      + '<span style="color:#E1D901">'+ getItemProperty(itemid, 'price') + ' gold.</span>';
      $('#'+context).append(appstr);
    }
    if( from == "buymerchant" )
    {
      var appstr
      = "<br><br>"
      + '<span style="color:#FF9900">B</span> '
      + '<span style="color:#3A90DB">Buy this item for</span> '
      + '<span style="color:#E1D901">'+ getItemProperty(item[0], 'price') + ' gold.</span>';
      $('#'+context).append(appstr);
    }     
  } else {
    //item was not found;
    console.log(itemid+","+slotid);
    player.view="inventory";
  }
}

function updateStats()
{
  //getplayerstats

  player.weapondelay = weaponDelay(-1);

  
  //adjustBar('hp',player.HP[0],player.HP[1],0,'#C41414');
  //adjustBar('mp',player.MP[0],player.MP[1],0,'#153AC3');
  //adjustBar('en',player.EN[0],player.EN[1],0,'#C2BC16');  
}

//player.inventory.push({id:1,qty:1});



var inventoryOffset = 0;
var invCurPage=1;
var invTotalPage=1;
function renderInventory()
{
  
  /* renderInventory() is called when the player opens their inventory window
  // We always want to update it before displaying it, in case any information
  // has changed.
  */
  $('#golddisplay').html(addCommas(player.gold-trading.weOffer.gold));
  inventoryOffset=(invCurPage-1)*13;
  
  //erase old list
  $('#inventorylistdisplay').html('');
  
  //hide item display in case it's still up for any reason:
  $('#itemview').hide();
  $('.cboxshadow').hide();
    
  //set page numbers:
  $('#inventorylistcurrentpage').html(invCurPage);  
  var totalpages = Math.ceil(player.inventory.length/13);
  $('#inventorylisttotalpages').html(totalpages);
  invTotalPage=totalpages;
  
  var inventoryDisplay = "";
  
  $('#inventorylistdisplay').animate({opacity:1},0);
  
  //List first 13 inventory items
  for(var i=0; i<13; i++)
  {
    if( (i+inventoryOffset) in player.inventory )
    {
      var invItem = player.inventory[(i+inventoryOffset)];
      //var item = itemInfo[ invItem.id ];
      //if( invItem.id in)
      var item = globalItemList[ invItem.id ];
      inventoryDisplay
      += '<div class="invitem"><span style="color:#FF9900">'+String.fromCharCode( (110+i) )+'</span> '
       + '<span style="color:'+itemColors[ getItemProperty(item[0], 'quality') ]+'">'+getItemProperty(item[0], 'name') +' '+(invItem.qty>1?'</span><span style="color:#aaa">('+invItem.qty+')</span>':'')+'</div>';
    }
  }
  $('#inventorylistdisplay').html(inventoryDisplay);
  for(var i=0;i<12; i++)
  {
    if( /*equipmentSlots[i] in*/ player.equipment[ i ] != 0 )
    {
      //var item = itemInfo[player.equipment[i]];
      //var item = itemInfo[ player.equipment[i] ];
      var item = globalItemList[ player.equipment[i] ]; 
      $('#inv_'+equipmentSlots[i]).html('<span style="color:#FF9900">'+String.fromCharCode( (97+i) )+'</span> <span style="color:'+itemColors[ getItemProperty(item[0], 'quality') ]+'">'+getItemProperty(item[0], 'name') );
    }else 
      $('#inv_'+equipmentSlots[i]).html('<span style="color:#999">Nothing</span>');
     
    //$('#inv_'+equipmentSlots[i]).css('color','#40FF33');
  }
  $('#inventorylistdisplay').fadeIn('fast');
}                                                                                              