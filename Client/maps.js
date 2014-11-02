/**
 * %SRPG%
 * 2011 Kevin Tyma (drachlen@gmail.com)
 * 
 **/ 


/*
  Maps:
  Everything to do with how the world is laid out.
  Both the client and server use this same object
  
  Map format:
  mapid: {
    gfx: [672x400 image of the map (this might be changed)] //for client use
    title: 'The display name of the zone',
    walls: possibly obsolete, might reference a 2d array of where the walls are, currently unused
    zones: {
      North, South, East, West all identifiers that represent touching the edge of the map. points to the adjacent mapid.
      special:
      [
        OPTIONAL zone, an additional list of any spots on the map that teleport somewhere else
        {x:10,y:10,goto:'mapid'},
        {},
        etc
      ] 
    }
  },
*/






var Map = {
  Load: function(id)
  {
    console.log("map.load:"+id);
    grid=[];
    initGrid();
    Map.LoadWalls(id);
    var MID = "map"+id;
    viewport.append('<div class="map" id="'+MID+'"></div>');
    var nocache = Math.floor(Math.random()*1000);    
    
    var mapPath = "world/"+id+".png?"+nocache;
    var mapimg = new Image(); 
    mapimg.src = mapPath;
    $('#'+MID).css('background-image', "url('"+mapPath+"')");  
  },
  LoadWalls: function(id)
  {
                        
                  
    console.log("load walls");
    var walldata = map[7]; 
    var zonedata = map[8];
    
    if( walldata.length > 2 )
    {
      var tmp = walldata.split("|");
      for(var i in tmp)
      {
        var wd = tmp[i].split(",");
        grid[ wd[0] ][ wd[1] ] = 1;
      }
    } 
    

    if( zonedata.length > 2 )
    {
      var tmp = zonedata.split("|");
      for(var i in tmp)
      {
        var zd = tmp[i].split(",");
        grid[ zd[0] ][ zd[1] ] = 2;
      }
    } 
    
    
    return;
    /*
     var walls = Maps[id].walls;
    //console.log(walls);
    //return;
       
    old wall code
    for(var wall in walls)
    {
      grid[ walls[wall].x  ][  walls[wall].y ] = 1;
    }  
    
    if( 'special' in Maps[id].zones )
    {
      var specialzones = Maps[id].zones.special;
      for(var zone in specialzones)
      {
        grid[ specialzones[zone].x ][ specialzones[zone].y ] = specialzones[zone].z;
      }
    }
    
    */
  },
  Preload: function(id, direction)
  {
    var left=0;
    var top=0;
    switch(direction)
    {
      case "North":
        top=-400;
      break;
      case "South":
        top=400;
      break;
      case "East":
        left=672;
      break;
      case "West":
        left=-672;
      break;
    }
    this.Load(id);
    $('#map'+id).css({'top':top+'px','left':left+'px'});
  },
  Unload: function(id)
  {
    $('#map'+id).remove();
    //grid=[];
  },
  /*
    Loading: Called when the client recognizes it touched a zone line.
    Pauses the client while the server gets everything ready
  */
  Loading: function()
  {
    player.view="loading";
    player.allowInput=0;
    player.loading=1;
    checkFloor();
    updateCursor();
    setTarget(-1);
    $('#status').html("");   
    player.canTrade=-1; 
    $('#shadow').show();
    $('#loading').html("Loading a new area. Please wait...");
    $('#loading').show();
  },
  Zone: function(direction,x,y)
  {
    console.log("zone called with: d:"+direction+",x:"+x+",y:"+y);
    //disable player input
    player.allowInput=0;


    var nextMap = player.zoneID + player.zoneSN; 
    
    //Preload the map offscreen
    Map.Preload(nextMap, direction);

    //If the response went well, and we're done preloading the new zone,
    //slide it into screen:
    var left = "+=0";
    var top = "+=0";
    var pleft = "+=0";
    var ptop = "+=0";
    var slide=1;
    switch(direction)
    {
      case "North":
        top = "+=400";
        ptop = "+=368";
      break;
      case "South":
        top = "-=400";
        ptop = "-=368";
      break;
      case "East":
        left = "-=672";
        pleft = "-=640";
      break;
      case "West":
        left = "+=672";
        pleft = "+=640";
      break;
      default:
        slide=0;  
      break;
    }
    
    //console.log("pleft:"+pleft+", top;"+ptop);
    var delay=1200;
    if(slide)
    {
      $('.map').animate({'left':left,'top':top},1000);
      $('#player').animate({'left':pleft,'top':ptop},1000);
    } else {
      $('.entity').show();
      player.x=x;
      player.y=y;
      $('#player').animate({'left':player.x*16, 'top':player.y*16},50);
      delay=100;
    }
    updateGroup(); 
    setTimeout(function(){
      Map.Unload( player.map );
      player.map = nextMap;
      player.allowInput = 1;
      player.x=x;
      player.y=y;
      player.view=0;
      $('.entity').show();
      $('.playerself').hide();
      checkFloor();
      updateCursor();
      setTarget(-1);
      player.loading=0;
    }, delay); 
  }
}


//invisible grid for figuring out collisions with the map
//possibly deleting this function, currently not using it for anything
function initGrid()
{
  for(var y=0;y<60;y++)
  {
    for(var x=0;x<80;x++)
    {
      grid[x]= grid[x] || {};
      grid[x][y]=0;
    }
  }
}

function checkHBCollision(x,y)
{
  for(var i in Entity.List)
  {
    var e = Entity.List[i];
    var eX = Number(e.attr('x'));
    var eY = Number(e.attr('y'));
    var eW = Number(e.attr('w'));
    var eH = Number(e.attr('h'));
    var eHitbox = e.attr('hitbox');
    var eType = e.attr('type');
    /**
     * In the case where the entity has a width and height of 1 and it does
     * have a hitbox, just return:     
     */ 
     
    if( eW == 1 && eH == 1)
    {        
      if( eX == x && eY == y && eHitbox==1)
        return i;
    } else {    
      //console.log("This entity has a hitbox larger than 1x1");
      //console.log(" checkHB x,y:"+x+","+y);
      //console.log("entity x,y: "+eX+","+eY);
      
      var offset=0;
      for( var sY=0; sY<eH; sY++ )
      {
        for( var sX=0; sX<eW; sX++ )
        {
          
          //console.log(" eX+sX: "+(eX+sX)+", eY+sY: "+(eY+sY));
          if( (eX+sX) == x && (eY+sY) == y )
          {
            console.log("possible collision");
            console.log("eHit:"+eHitbox);
            console.log("offset:"+offset);
            console.log("eH[o]:"+eHitbox[offset]);
            if( eHitbox[offset] == 1 && eType != "corpse")
            {
              console.log("collision decided. type is:"+eType); 
              return i;
            }
          }
          offset++;                                  
        }
      }                                         
    }
  }
  return -1;  
}

function reactToCollision(entityID)
{
  if( entityID == -1 || entityID===undefined)
    return 0;
  var entity = Entity.List[entityID];
  if(  entity.attr('hostile') == "1")
  {
    if( frame-player.weapondelay > player.lastattack )
    {
      setTarget(entityID);
      meleeAttack( entity.attr('x'), entity.attr('y'));
      player.lastattack = frame;
    }               
    return 1;
  }
  if( entity.attr('type') == "merchant" )
  {
    openTradeWithMerchant(entityID);
    return 1;
  }
  if( entity.attr('type') == "corpse" )
    return 0; 
  if( entity.css('display') == "none" )
    return 0;    
  if( entity.attr('type') == "player" )
    return 0;
  return 1;  
}

//Check if the player bumped into anything
function checkCollision(x,y)
{
  //console.log("Check col:"+grid[x][y]);
  //if( grid[x][y] == 1 )
  //  return 1;
  for(var i in Entity.List)
  {
    if( Number(Entity.List[i].attr('x')) == x && Number(Entity.List[i].attr('y')) == y )
    {
      if( Entity.List[i].attr('type') == "corpse" )
        continue;
        
      if( Entity.List[i].css('display') == "none" )
        continue;
        
      if( Entity.List[i].attr('type') == "player" )
        continue;
    
      //It's a hostile NPC, attack it
      if(  Entity.List[i].attr('hostile') == "1")
      {
        if( frame-player.weapondelay > player.lastattack )
        {
          setTarget(i);
          meleeAttack(x,y);
          player.lastattack = frame;
        }               
        return 1;
      }
      if( Entity.List[i].attr('type') == "merchant" )
      {
        openTradeWithMerchant(i);
        return 1;
      }
      return 1;                       
    }
  }
  return 0;
}

function checkMovement()
{
  if( frame-player.lastmove < player.speed || player.view != 0)
    return;         
  player.lastmove = frame;

  var tmpx = player.x;
  var tmpy = player.y;
  var diffx = 0;
  var diffy = 0;
  
  //north
  if( keystate[104] || queuedKey[104] )
  {
    //tmpy-=1;
    diffy=-1;
    queuedKey[104] = 0;
  } 
  //north
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
  
  
  if( tmpx == player.x && tmpy == player.y)
    return;



  
  //bumped into a special zone line:
  if( grid[tmpx][tmpy] == 2)
  {
    Map.Loading();
  } else {
    var collID = checkHBCollision(tmpx,tmpy);
    if( reactToCollision(collID) )
    {
      return;
    }
    //bumped into a wall
    if( grid[tmpx][tmpy] == 1)
    {
        return;
    }
  }
    
  /*
    This is the current solution to the following problem:
    If a player moves diagonally into a corner of the map,
    they'll be in a position where it's possible for them to
    zone two different directions. As a result, any move that
    would potentially put them into a corner will be cancelled.
  */
      //top left                 bottom right          bottom left              top right
  if( (tmpx==0&&tmpy==0) || (tmpx==41&&tmpy==24) || (tmpx==0&&tmpy==24) || (tmpx==41&&tmpy==0) )
    return;
    
    
    
  
  if( tmpy < 1 && map[3] == -1 )
    return;
  if( tmpx > 40 && map[4] == -1 )
    return;
  if( tmpy > 23 && map[5] == -1 )
    return;
  if( tmpx < 1 && map[6] == -1 )
    return;

    

  player.x=tmpx;
  player.y=tmpy;
  $('#player').animate({'left':player.x*16, 'top':player.y*16},50);
  checkFloor();

  socket.send({'type':'move','data':{x:player.x,y:player.y}});
  //console.log("send");

  //If the player walks to the edge of the map:
  if( player.x<1 || player.x>40 || player.y<1 || player.y>23)
  {
  
    Map.Loading();
  }

  
}


/*

  //old, client-side code for zoning:
  
  if( player.y<1 )
  {
    player.y=-1;
    Map.Zone('North');
    $('#player').animate({'top':"+=368"},950, function(){player.y=23;});
  } else
  if( player.y>23 )
  {
    player.y=-1;
    Map.Zone('South');
    $('#player').animate({'top':"-=368"},950, function(){player.y=1;});
  }  
  if( player.x<1 )
  {
    player.x=-1;
    Map.Zone('West');
    $('#player').animate({'left':"+=640"},950, function(){player.x=40;});
  } else
  if( player.x>40 )
  {
    player.x=-1;
    Map.Zone('East');
    $('#player').animate({'left':"-=640"},950, function(){player.x=1;});
  }
*/