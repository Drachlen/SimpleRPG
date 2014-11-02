/**
 * %SRPG%
 * 2011 Kevin Tyma (drachlen@gmail.com)
 * 
 **/
 
 
var g_hitbox = [];

function updateHitboxes(eID, eX, eY, eWidth, eHeight, eHitbox)
{
  if( eWidth==1 && eHeight == 1 )
  {
    
  }
  for(var sY=0; sY<eHeight; sY++)
  {
    for(var sX=0; sX<eWidth; sX++)
    {
    
    }
  }  
}

function xxcheckCollision()
{

}

var Entity =
{
  List: {},
  Index: 0,
  Create: function(type, x, y, id, name, curHP, maxHP, level, charclass, hostile, gfx, gwidth, gheight, hitbox)
  {                  
    console.log("Entity.Create type:"+type);
    console.log("GFX: "+gfx);    
    if(gfx===undefined||gfx==-1)
    {
      gfx="player";
    }    
    if(gwidth===undefined||gwidth<1)
      gwidth=1;
    if(gheight===undefined||gheight<1)
      gheight=1;
    if(hitbox===undefined)
      hitbox=1; 
      
    
    //updateHitboxes(id, x, y, gwidth, gheight, hitbox);  
    
       
    EID = id;
    var attributes = {
      'type':type,
      'x':x,
      'y':y,
      'w':gwidth,
      'h':gheight,
      'hitbox':hitbox,
      'hostile': hostile,
			'name': name,
			'curHP': curHP,
			'maxHP': maxHP,
			'level': level,
			'charclass': charclass
    };
    var nocache = Math.floor(Math.random()*1000);
    var node = $('<div></div>')
      .addClass('entity')
      .addClass((name==player.name?'playerself':type))
      .css({
        'left':x*16,
        'top':y*16,
        'width':gwidth*16,
        'height':gheight*16,
        'display':(name==player.name?'none':'block'),
        'background-image':"url('gfx/"+gfx+".png?"+nocache+"')"
      })                 
      .attr(attributes);
    this.List[EID] = node;
    viewport.append(node); 
    if(type=="player")
      updateGroupMember(EID);    
  },
  Remove: function(EID)
  {
    console.log("Entity.Removed called on:"+EID);
    if( EID in Entity.List)
    {
      console.log("EID is in E.L");
      var type = Entity.List[EID].attr("type");
      if( tradeWith == EID)
      {
        cancelTrade();
      }
      if(tradeRequestTo==EID && player.view=="tradewait")
      {
        $('#loading').hide();
        player.view=0;
      }
      if( EID == player.target )
        setTarget(-1);
      $('#NBI'+EID).remove();
      Entity.List[EID].remove(); 
      delete Entity.List[EID];
      if(type=="player")
        updateGroupMember(EID);
    }
  },
  SetPosition: function(EID, x, y)
  {
    var check=0;
    
    if( !(EID in Entity.List) )
      return;
    
    //if an entity moves away from us, update our current floor status
    if(Entity.List[EID].attr('x')==player.x&&Entity.List[EID].attr('y')==player.y)
      check=1;
    Entity.List[EID].attr('x', x);
    Entity.List[EID].attr('y', y);
    Entity.List[EID].animate({'left':x*16, 'top':y*16},50);
    //if an entity moves on top of us
    if(x==player.x&&y==player.y)
      check=1;
    if(check)
      checkFloor();
    if( EID == player.cursorFocus )
    {
      player.cursor.x = Number(x);
      player.cursor.y = Number(y);
      $('#cursor').animate({left:player.cursor.x*16+"px",top:player.cursor.y*16+"px"},50);
    } 
      
    //our target moved, update the visual cursor:
    if( EID == player.target )
    {
      var target = Entity.List[EID];
      var gheight = target.attr("h");
      $('#target').animate({
      left: target.attr("x")*16+"px",
      top: ((target.attr("y")*16)+6+(16*gheight-16))+"px"
      },50);

    }
  }
};