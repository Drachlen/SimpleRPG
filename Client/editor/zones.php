<?php
require_once("db.php");
include("auth.php");

    if( @$_GET['deletespawn'] )
    {
        $id = mysql_real_escape_string(trim($_GET['deletespawn']));
        if( !is_numeric($id) )
            die();

        $SQL = "DELETE FROM spawn WHERE id='".$id."'";
        mysql_query($SQL) or die(mysql_error());
        die();            
    }
    if( @$_GET['savespawn'] )
    {
        $id = mysql_real_escape_string(trim($_GET['savespawn']));
        if( !is_numeric($id) )
            die();
        $x = mysql_real_escape_string(trim($_GET['x']));
        $y = mysql_real_escape_string(trim($_GET['y']));
        $sgid = mysql_real_escape_string(trim($_GET['sgid']));
        $rt = mysql_real_escape_string(trim($_GET['rt']));
        $zone = mysql_real_escape_string(trim($_GET['zone']));

        if( $zone < 1 )
            die("Problem with specified zone ID: ".$zone);

        

        if( $id < 1 )
        {
            $SQL = 
                "INSERT INTO spawn ".
                "(spawngroupID, x, y, zone, respawntime) VALUES ".
                "('".$sgid."', '".$x."', '".$y."', '".$zone."', ".
                "'".$rt."')";
        } else {
            $SQL = 
                "UPDATE spawn SET ".
                "spawngroupID='".$sgid."',".
                "x='".$x."',".
                "y='".$y."',".
                "respawntime='".$rt."' ".
                "WHERE id='".$id."' LIMIT 1";
        }

        mysql_query($SQL) or die(mysql_error());
        die();            
    }
    if( @$_GET['savezonedetails'] )
    {
        $id = mysql_real_escape_string(trim($_GET['savezonedetails']));
        if( !is_numeric($id) )
            die(); 
        $sname = mysql_real_escape_string(trim($_GET['shortname']));
        $lname = mysql_real_escape_string(trim($_GET['longname']));
        $north = mysql_real_escape_string(trim($_GET['north']));
        $south = mysql_real_escape_string(trim($_GET['south']));
        $east = mysql_real_escape_string(trim($_GET['east']));
        $west = mysql_real_escape_string(trim($_GET['west']));
        if( $id == -1 )
        {
            $sql =
                "INSERT INTO zones (".
                "short_name, long_name, tiles, walls, north, south, east, ".
                "west, specialzones) VALUES (".
                "'".$sname."', ".
                "'".$lname."', ".
                "'-1', ".
                "'-1', ".
                "'".$north."', ".
                "'".$south."', ".
                "'".$east."', ".
                "'".$west."', ".
                "'-1') ";
        } else {
            $sql = 
                "UPDATE zones SET ".
                "short_name='".$sname."', ".
                "long_name='".$lname."', ".
                "north='".$north."', ".
                "south='".$south."', ".
                "east='".$east."', ".
                "west='".$west."' ".
                "WHERE id='".$id."'";
        }
        $query = mysql_query($sql) or die(mysql_error());
        die(''.mysql_insert_id());
    }
    if( @$_GET['savemap'] )
    {
        $id = mysql_real_escape_string(trim($_GET['savemap']));
        if( !is_numeric($id) )
            die();
        if( $id < 1 )
            die();
        $tiledata = mysql_real_escape_string(trim($_GET['tiles']));
        $walldata = mysql_real_escape_string(trim($_GET['walls']));
        $zonedata = mysql_real_escape_string(trim($_GET['zones']));


        if( strlen($zonedata) < 2 )
            $zonedata = "-1";
        else
            $zonedata = substr($zonedata, 0, -1);

        if( strlen($walldata) < 2 )
            $walldata = "-1";
        else
            $walldata = substr($walldata, 0, -1);
        /*
        $tmp = explode(",", $tiledata);
        $offs=0;
        for($y=0;$y<25; $y++)
        {
            for($x=0;$x<42; $x++)
            {
            
            }
        }*/
        $SQL = 
            "UPDATE zones SET ".
            "tiles='".$tiledata."', ".
            "walls='".$walldata."', ".
            "specialzones='".$zonedata."' ".
            "WHERE id='".$id."'";
        mysql_query($SQL) or die(mysql_error());
        $exportID = $id;
        require_once("exportmap.php");
        die();
    }
    if( @$_GET['loadzone'] )
    {
        $id = mysql_real_escape_string(trim($_GET['loadzone']));
        if( !is_numeric($id) )
            die();
        $fetch['id'] = -1;
        $fetch['short_name'] = "";
        $fetch['long_name'] = "";
        $fetch['tiles'] = "";
        $fetch['walls'] = "";
        $fetch['north'] = -1;
        $fetch['south'] = -1;
        $fetch['east'] = -1;
        $fetch['west'] = -1;
        $fetch['specialzones'] = "";
        if( $id != -1 )
        {
            $sql = 
                "SELECT * FROM zones WHERE id='".$id."'";
            $query = mysql_query($sql) or die(mysql_error());
            $fetch = mysql_fetch_array($query);
        }
?>
<input type="submit" value="Zone Details" onclick="showDetails()">
<input type="submit" value="Edit Map" onclick="showMap()">
<div id="zonedetails">
    <fieldset>
        <legend>Details</legend>    
        <input type="submit" class="submit" value="Delete"
        style="width:80px" onclick="deleteZone(<?php echo $fetch['id'];?>)">
        <fieldset class="mini_fieldset">
            <legend>ID</legend>
            <input type="text" id="zid" value="<?php echo @$fetch['id'];?>">
        </fieldset>
        <fieldset class="mini_fieldset">
            <legend>Short Name</legend>
            <input type="text" id="zsn" value="<?php
                echo @$fetch['short_name'];?>">
        </fieldset>
        <fieldset class="mini_fieldset">
            <legend>Long Name</legend>
            <input type="text" id="zln" value="<?php
                echo @$fetch['long_name'];?>">
        </fieldset>
        <fieldset class="mini_fieldset">
            <legend>North</legend>
            <input type="text" id="znorth" value="<?php
                echo @$fetch['north'];?>">
        </fieldset>
        <fieldset class="mini_fieldset">
            <legend>South</legend>
            <input type="text" id="zsouth" value="<?php
                echo @$fetch['south'];?>">
        </fieldset>
        <fieldset class="mini_fieldset">
            <legend>East</legend>
            <input type="text" id="zeast" value="<?php
                echo @$fetch['east'];?>">
        </fieldset>
        <fieldset class="mini_fieldset">
            <legend>West</legend>
            <input type="text" id="zwest" value="<?php
                echo @$fetch['west'];?>">
        </fieldset>
        <input type="submit" class="submit" value="Save"
        onclick="saveZoneDetails(<?php echo @$fetch['id'];?>)">
    </fieldset>
</div>
<div id="mapedit" style="display:none">
    <div id="viewport"></div>
    <div id="walls"></div>
    <div id="szones"></div>
    <div id="spawns"></div>
    <div id="hovertile"></div>
    <div id="coords"></div>
    <div>
        Input Mode:  
        <input type="submit" value="Edit Tiles" onclick="setMode(0)">
        <input type="submit" value="Set Walls" onclick="setMode(1)">
        <input type="submit" value="Special Zones" onclick="setMode(2)">
        <input type="submit" value="Spawns" onclick="setMode(3)">
    </div>
    <div id="editmode">
        <img src="tileset.png?<?php echo rand(0,1000);?>" id="tileset">
        <div id="selectedtile"></div>
    </div>

    <div id="wallmode"
        style="padding:30px;background-color:#000;font-size:22px;display:none">
        Click within the map to toggle solid tiles.
    </div>

    <div id="specialmode"
        style="background-color:#000;padding:5px;display:none">
    Add / Remove Special Zone lines
    </div>

    <div id="spawnmode"
        style="background-color:#000;padding:5px;display:none">
        Spawns:<br>
        Quick SpawngroupID: <input type="text" id="qsgid"><br>
        Quick Respawn Time: <input type="text" id="qrt"><br>
        <div id="spawnlistd"></div>
    </div>

    <input type="submit" value="Save" onclick="saveMap(<?php
                echo @$fetch['id'];?>)">
</div>
<script>
    var spawnlist = [];

    var mapTileString = "<?php echo @$fetch['tiles'];?>";
    var mapWalls = "<?php echo @$fetch['walls'];?>";
    var mapSpecialZones = "<?php echo @$fetch['specialzones'];?>";
    var tileset = {x:0,y:0};


    var grid = [],
        wall = [],
        special = [];

    function prepgrid()
    {
        console.log("prepping grid");
        for(var y=0;y<25;y++)
        {
            for(var x=0; x<42; x++)
            {
                if( !grid[x] )
                grid[x] = [];
               // if( !wall[x] )
               //     wall[x] = [];          
                grid[x][y] = [0,0];
                //wall[x][y] = 0;
            }
        }
    }

    function loadTiles()
    {  
        prepgrid(); 
        var offs=0;

        wall = [];
        speical = [];

        if( mapSpecialZones != "-1" )
        {
            var tmp = mapSpecialZones.split("|");
            for( var i in tmp )
            {
                var tz = tmp[i].split(",");
                var x = tz[0];
                var y = tz[1];
                var z = tz[2];
                special.push({x:x,y:y,zoneto:z});
                var vz =
                $('<div></div>')
                .addClass('szone')
                .attr("id", 'z'+x+'z'+y)
                .css({
                    'top' : ( y * 16 )+'px',
                    'left' : ( x * 16 )+'px'
                });
                $('#szones').append(vz);
            }
        }

        if( mapWalls != "-1" )
        {
            var tmp = mapWalls.split("|");
            for(var i in tmp)
            {
                var tw = tmp[i].split(",");
                var x = tw[0];
                var y = tw[1];
                var vwall =
                $('<div></div>')
                .addClass('wall')
                .attr("id", 'w'+x+'w'+y)
                .css({
                    'top' : ( y * 16 )+'px',
                    'left' : ( x * 16 )+'px'
                });
                $('#walls').append(vwall);
                wall.push({
                    x: x,
                    y: y,
                    solid: 1
                });
            }
        }
        if( mapTileString != "-1" )
        {
            var tmp = mapTileString.split("|");
            var tx=0;
            var ty=0;
            for(var i in tmp)
            {
                var coords = tmp[i].split(",");
                grid[tx][ty] = [coords[0], coords[1]];
                tx++;
                if(tx>41)
                {
                    tx=0;
                    ty++;
                }
            }
        } else {

        }

        var offs=0;
        for(var y=0;y<25; y++)
        {
            for(var x=0;x<42; x++)
            {
                setTile(x,y, grid[x][y]);
                offs++;
            }
        }
    }


    $('#tileset').click(function(e)
    {
        var offset = $('#tileset').offset();
        var x = Math.floor( (e.offsetX)/16 );
        var y = Math.floor( (e.offsetY)/16 );

        var spX = offset.left + ( x * 16 );
        var spY = offset.top + ( y * 16 );
        $('#selectedtile').css(
        {
             'top' : spY+"px",
            'left' : spX+"px"
        });
        tileset.x=x;
        tileset.y=y;
    });
    
    var viewport = $('#viewport');
    var mouseState = 0;
    viewport.click(function(e)
    {      
        var offset = viewport.offset();
        var x = ( e.clientX - offset.left ) / 16;
        var y = ( e.clientY - offset.top ) / 16;
        x = Math.floor( x );
        y = Math.floor( y );
        //var id = getTileID(tileset.x, tileset.y);

        if(inputMode==0)
            setTile(x, y, [tileset.x, tileset.y]);
    });

 
    viewport.mousedown(function(e)
    {
        mouseState=1;
    });
    viewport.mouseup(function(e)
    {
        mouseState=0;
        console.log("mouse up");
    });
    $(document).mouseup(function(e)
    {
        mouseState=0;
    });
    $('.block').mouseup(function(e)
    {
        mouseState=0;
        console.log("mouse up");
    });


    var hov = $('#hovertile');
    hov.click(function(e)
    {      
        var offset = viewport.offset();
        var x = ( e.clientX - offset.left ) / 16;
        var y = ( e.clientY - offset.top ) / 16;
        x = Math.floor( x );
        y = Math.floor( y );
        //var id = getTileID(tileset.x, tileset.y);

        if(inputMode==0)
            setTile(x, y, [tileset.x, tileset.y]);
    });
    hov.mousedown(function(e)
    {
        mouseState=1;
    });
    hov.mouseup(function(e)
    {
        mouseState=0;
    });


    viewport.mousemove(function(e)
    {

        handleMM(e);

    });

    hov.mousemove(function(e)
    {

        handleMM(e);

    });

    function handleMM(e)
    {
        var offset = viewport.offset();
        var x = ( e.clientX - offset.left ) / 16;
        var y = ( e.clientY - offset.top ) / 16;
        x = Math.floor( x );
        y = Math.floor( y );
        var spX = offset.left + ( x * 16 );
        var spY = offset.top + ( y * 16 );
        $('#hovertile').css(
        {
             'top' : spY+"px",
            'left' : spX+"px"
        });


        $('#coords').html(x+", "+y);

    

        if(mouseState)
        {
            //var id = getTileID(tileset.x, tileset.y);
            if(inputMode==0)
                setTile(x, y, [tileset.x, tileset.y]);
        }
    }



    $('#walls').click(function(e)
    {      
        var offset = viewport.offset();
        var x = ( e.clientX - offset.left ) / 16;
        var y = ( e.clientY - offset.top ) / 16;
        x = Math.floor( x );
        y = Math.floor( y );
        //var id = getTileID(tileset.x, tileset.y);

        if(inputMode==1)
            toggleWall(x, y);
    });


    function toggleWall(x,y)
    {
        if( wall.length > 0 )
        {
            for(var i in wall)
            {
                var tmp = wall[i];
                if( tmp.x == x && tmp.y == y )
                {
                    console.log(tmp);
                    if( tmp.solid == 1 )
                        makeWalkable(i, x, y);
                    else
                        makeSolid(i, x,y);
                    return;
                }
            }
        }
        makeSolid(-1, x,y);
    }

    function makeWalkable(id, x, y)
    {
        console.log("makeWalkable "+id+", "+x+", "+y);
        $('#w'+x+'w'+y).css('display','none');
        wall[id].solid = 0;        
    }

    function makeSolid(id, x,y)
    {
        console.log("makeSolid "+id+", "+x+", "+y);
        var offset = viewport.offset();
        if( id == -1 )
        {
            
            var vwall =
            $('<div></div>')
            .addClass('wall')
            .attr("id", 'w'+x+'w'+y)
            .css({
                'top' : ( y * 16 )+'px',
                'left' : ( x * 16 )+'px'
            });
            $('#walls').append(vwall);
            console.log("appended");
            wall.push({
                x: x,
                y: y,
                solid: 1
            });
        } else {
            $('#w'+x+'w'+y).css('display','block');
            wall[id].solid = 1;      
        }
    }

    $('#walls').mousemove(function(e)
    {
        var offset = viewport.offset();
        var x = ( e.clientX - offset.left ) / 16;
        var y = ( e.clientY - offset.top ) / 16;
        x = Math.floor( x );
        y = Math.floor( y );
        var spX = offset.left + ( x * 16 );
        var spY = offset.top + ( y * 16 );
    });



    $('#szones').click(function(e)
    {      
        var offset = viewport.offset();
        var x = ( e.clientX - offset.left ) / 16;
        var y = ( e.clientY - offset.top ) / 16;
        x = Math.floor( x );
        y = Math.floor( y );
        //var id = getTileID(tileset.x, tileset.y);

        if(inputMode==2)
            addSpecialZone(x, y);
    });

    function addSpecialZone(x,y)
    {
        for(var i in special)
        {
            var tmp = special[i];
            if( tmp.x == x && tmp.y == y )
            {
                if(tmp.zoneto == -1)
                {
                    newSpecialZone(x,y);
                } else {
                    removeSpecialZone(i, x, y);
                }
                return;
            }
        }
        newSpecialZone(x,y);
    }

    function removeSpecialZone(id,x,y)
    {
        $('#z'+x+'z'+y).remove();
        //special[id].zoneto=-1;
        special.splice(id,1);
    }

    function newSpecialZone(x,y)
    {
        var newzoneid = prompt('Enter destination zone ID or short name:','');
        //console.log(newzoneid);
        if(newzoneid==null||newzoneid.length<1)
            return;
        special.push({x:x,y:y,zoneto:newzoneid});
            var vz =
            $('<div></div>')
            .addClass('szone')
            .attr("id", 'z'+x+'z'+y)
            .css({
                'top' : ( y * 16 )+'px',
                'left' : ( x * 16 )+'px'
            });
            $('#szones').append(vz);
    }


    $('.block').mousedown(function(e)
    {
        console.log("MD BLOCK");
    });


    function setTile(x, y, tile)
    {
        //var tilepos = getTilePos(tileid);
        //

        //var tmp = tile

        var offset = viewport.offset();
        var vtile =
            $('<div></div>')
            .addClass('block')
            .css({
                'background-position' : 
                    '-'+(tile[0]*16)+'px -'+(tile[1]*16)+'px',
                'top' : offset.top + ( y * 16 )+'px',
                'left' : offset.left + ( x * 16 )+'px'
            });    
        grid[x][y] = tile;
        viewport.append(vtile); 
    }


    $('#spawns').click(function(e)
    {      
        var offset = viewport.offset();
        var x = ( e.clientX - offset.left ) / 16;
        var y = ( e.clientY - offset.top ) / 16;
        x = Math.floor( x );
        y = Math.floor( y );

        if(inputMode==3)
            selectSpawn(x, y);
    });

    
    var tmpsx = -1;
    var tmpsy = -1;
    var tmpsi = -1;
    function selectSpawn(x,y)
    {
        console.log("Select spawn");
        for(var i in spawnlist)
        {
            var stmp = spawnlist[i];
            if(stmp.x==x && stmp.y==y)
            {
                viewSpawnDetails(i);
                return;
            }
        }
        tmpsx = x;
        tmpsy = y;
        tmpsi = -1;
        viewSpawnDetails(-1);
    }

    function viewSpawnDetails(id)
    {
        console.log("Viewspawndetails: "+id);
        var x = -1;
        var y = -1;
        var sgid = -1;
        var rt = -1;

        if( id != -1 )
        {
            x = spawnlist[id].x;
            y = spawnlist[id].y;
            sgid = spawnlist[id].sgid;
            rt = spawnlist[id].rt;
        } else {
            x = tmpsx;
            y = tmpsy;
            var quicksgid = $('#qsgid').val();
            var quickrt = $('#qrt').val();
            if( quicksgid.length > 0 )
                sgid = quicksgid;
            if( quickrt.length > 0 )
                rt = quickrt;
        }
        tmpsi = id;
        $('#spawnid').val(id);
        $('#spawnx').val(x);
        $('#spawny').val(y);
        $('#spawnsgid').val(sgid);
        $('#spawnrt').val(rt);


        $('#shadow').show();
        $('#spawnlookup').show();
    }

    function closeSpawnDetails()
    {
        $('#shadow').hide();
        $('#spawnlookup').hide();
    }

    function deleteSpawn()
    {
        var deleteID = tmpsi;
        console.log("delete id: "+deleteID);

        var spawn = spawnlist[deleteID];
        var x = spawn.x;
        var y = spawn.y;
        var dbid = spawn.dbid;

        if( dbid != -1 )
        {
            $.ajax(
            {
                type: "GET",
                url: 'zones.php',
                data:
                'deletespawn='+dbid,
                success: function(data)
                {
                    if( data.length > 5 )
                        alert(data);
                }
            });
        }   

        console.log("delete: "+x+","+y);
       
        spawnlist.splice(deleteID, 1);
        $('#s'+x+'s'+y).remove();
        renderSpawnList();
        closeSpawnDetails();
    }

    function loadSpawn(x,y,sgid,rt,dbid)
    {
        spawnlist.push({x:x,y:y,sgid:sgid,rt:rt,dbid:dbid});
        var stile =
            $('<div></div>')
            .addClass('spawn')
            .attr("id", 's'+x+'s'+y)
            .css({
                'top' : ( y * 16 )+'px',
                'left' : ( x * 16 )+'px'
            });    
        $('#spawns').append(stile); 
    }

    function saveSpawn()
    {
        var x = $('#spawnx').val();
        var y = $('#spawny').val();
        var sgid = $('#spawnsgid').val();
        var rt = $('#spawnrt').val();
        var id = $('#spawnid').val();
        var dbid = -1;

        if( x == -1 || y == -1 || sgid == -1 || rt == -1 )
            return;

        if( id == -1 )        
        {
            spawnlist.push({x:x,y:y,sgid:sgid,rt:rt,dbid:-1});
        } else {
            spawnlist[id].x = x;
            spawnlist[id].y = y;
            spawnlist[id].sgid = sgid;
            spawnlist[id].rt = rt;
            dbid = spawnlist[id].dbid;
        }


        $.ajax(
        {
            type: "GET",
            url: 'zones.php',
            data:
            'savespawn='+dbid+
            '&x='+x+
            '&y='+y+
            '&sgid='+sgid+
            '&rt='+rt+
            '&zone='+zone,
            success: function(data)
            {
                if( data.length > 5 )
                    alert(data);
            }
        });

        var offset = viewport.offset();
        var stile =
            $('<div></div>')
            .addClass('spawn')
            .attr("id", 's'+x+'s'+y)
            .css({
                'top' : ( y * 16 )+'px',
                'left' : ( x * 16 )+'px'
            });    
        $('#spawns').append(stile); 

        renderSpawnList();
        
        $('#shadow').hide();
        $('#spawnlookup').hide();
    }

    function renderSpawnList()
    {
        console.log(spawnlist);
        var domSL = $('#spawnlistd');
        //domSL.html('');
        var slstr = "";
        for(var i in spawnlist)
        {
            var spawn = spawnlist[i];
            slstr +=
                '<div id="sle'+i+'" class="zspawnlistentry" '+
                ' '+
                'onclick="viewSpawnDetails('+i+')">'+
                i+' - Spawn Group ID '+spawn.sgid+
                ' At '+spawn.x+','+spawn.y+
                '</div>'
        }
        domSL.html(slstr);
    }
 

    function showDetails()
    {
        $('#zonedetails').show();
        $('#mapedit').hide();
    }
    var mapLoaded = 0;
    function showMap()
    {
        $('#zonedetails').hide();
        $('#mapedit').show();
        if(mapLoaded==0)
        {
            loadTiles();
            mapLoaded=1;
        }
    }




    var inputMode = 0;
    function setMode(mode)
    {
        $('#editmode').hide();
        $('#walls').hide();
        $('#wallmode').hide();
        $('#hovertile').hide();
        $('#specialmode').hide();
        $('#szones').hide();
        $('#spawns').hide();
        $('#spawnlist').hide();
        switch(mode)
        {
            case 0:
                $('#editmode').show();
                $('#hovertile').show();
                inputMode = 0;
            break;
            case 1:
                $('#wallmode').show();
                $('#walls').show();
                inputMode = 1;
            break;
            case 2:
                $('#specialmode').show();
                $('#szones').show();
                inputMode = 2;
            break;
            case 3:
                $('#spawns').show();
                $('#spawnmode').show();
                renderSpawnList();
                inputMode = 3;
            break;                
        }
    }





    function blink(s)
    {
        s=(s)?0:1;
        if(s)
            $('#selectedtile').css('border-color', '#fff');
        else
            $('#selectedtile').css('border-color', '#000');
        setTimeout(function(){blink(s);},100);
    }
    blink(0);


   // setTimeout(loadTiles,500);
</script>

<?php
    $sql = "SELECT * FROM spawn WHERE zone='".@$fetch['id']."'";
    $query = mysql_query($sql);
    while($sfetch = mysql_fetch_array($query))
    {
        echo
           '<script>loadSpawn('.
           $sfetch['x'].','.
           $sfetch['y'].','.
           $sfetch['spawngroupID'].','.
           $sfetch['respawntime'].','.
           $sfetch['id'].');</script>';
    }
?>


<?php
    die();
    }
?>
    <script>
    var zone = -1;
    function loadZone(id)
    {
        $.ajax(
        {
            type: "GET",
            url: 'zones.php',
            data:
            'loadzone='+id,
            success: function(data)
            {
                $('#content').html(data);
                zone = id;   
            }
        });           
    }
    function saveZoneDetails(id)
    {
        var sname = $('#zsn').val();
        var lname = $('#zln').val();
        var north = $('#znorth').val();
        var south = $('#zsouth').val();
        var east = $('#zeast').val();
        var west = $('#zwest').val();
        $.ajax(
        {
            type: "GET",
            url: 'zones.php',
            data:
            'savezonedetails='+id+
            '&shortname='+sname+
            '&longname='+lname+
            '&north='+north+
            '&south='+south+
            '&east='+east+
            '&west='+west,
            success: function(data)
            {
                if( data.length > 7 )
                {
                    alert(data);
                    return;
                }
                loadCategory('zones');
                if( id==-1 )
                    id=data;
                setTimeout( function(){ loadZone(id); }, 100 );    
            }
        });  
    }

    function saveMap(id)
    {
        var tilestring = "";
        var offs=0;
        for(var y=0;y<25; y++)
        {
            for(var x=0;x<42; x++)
            {
                var t = grid[x][y];
                tilestring += t[0]+','+t[1]+'|';
                //offs++;
            }
        }
        var wallstr = "";
        for(var i in wall)
        {
            var tmp = wall[i];
            if( tmp.solid==1)
            {
                if( tmp.x===undefined || tmp.y===undefined)
                    continue;
                wallstr += tmp.x+","+tmp.y+"|";
            }
        }
        var zonestr = "";
        for(var i in special)
        {
            var tmp = special[i];
            if( tmp.x===undefined || tmp.y===undefined )
                continue;
            zonestr += tmp.x+","+tmp.y+","+tmp.zoneto+"|";
        }
        $.ajax(
        {
            type: "GET",
            url: 'zones.php',
            data:
            'savemap='+id+
            '&tiles='+tilestring+
            '&walls='+wallstr+
            '&zones='+zonestr,
            success: function(data)
            {
                if( data.length > 7 )
                {
                    alert(data);
                    return;
                }
                loadCategory('zones');
                if( id==-1 )
                    id=data;
                setTimeout( function(){ loadZone(id); }, 100 );    
            }
        });  
    }

</script>



<div id="cpanel">
    <fieldset style="width:250px">
        <legend>Zones</legend>
        <div id="maplist">
<?php
    $sql = "SELECT id, short_name, long_name FROM zones";
    $query = mysql_query($sql) or die(mysql_error());
    while($fetch = mysql_fetch_array($query))
    {
        echo '<div class="listentry" '.
             'onclick="loadZone('.$fetch['id'].')">'.
             '<span class="listnum">'.$fetch['id'].'</span>'.
             '<span class="listname" style="font-family: Courier New">['.
                $fetch['short_name'].'] </span>'.
             '<span class="listname">'.$fetch['long_name'].'</span>'.
             '</div>';   
    }
?>
        </div>
        <input type="submit" class="submit" value="New" onclick="loadZone(-1)">
    </fieldset>
</div>
<div id="content"></div>

<div id="shadow"></div>
<div id="spawnlookup" class="special"
style="left:220px;width:350px;position:fixed">
    <input type="submit" value="Cancel" onclick="closeSpawnDetails()">
    <input type="submit" value="Delete" onclick="deleteSpawn()">
    <fieldset style="width:300px">
        <legend>Spawn</legend>
        <fieldset class="mini_fieldset">
            <legend>ID</legend>
            <input type="text" id="spawnid">
        </fieldset>
        <fieldset class="mini_fieldset">
            <legend>spawngroupID</legend>
            <input type="text" id="spawnsgid">
        </fieldset>
        <fieldset class="mini_fieldset">
            <legend>X</legend>
            <input type="text" id="spawnx">
        </fieldset>
        <fieldset class="mini_fieldset">
            <legend>Y</legend>
            <input type="text" id="spawny">
        </fieldset>
        <fieldset class="mini_fieldset">
            <legend>Respawn Time (ms)</legend>
            <input type="text" id="spawnrt">
        </fieldset>
        <input type="submit" value="Save Spawn" onclick="saveSpawn()">
    </fieldset>
</div>
