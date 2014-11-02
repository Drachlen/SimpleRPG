<?php
require_once("db.php");
include("auth.php");
    if( @$_GET['newsge'] )
    {
        $sgid = mysql_real_escape_string(trim($_GET['newsge']));
        if( !is_numeric($sgid) || $sgid < 1)
            die();

        $npcid = mysql_real_escape_string(trim($_GET['npcid']));
        $chance = mysql_real_escape_string(trim($_GET['chance']));
        $sl = mysql_real_escape_string(trim($_GET['sl']));



        $sql = 
            "INSERT INTO spawnentry ".
            "(spawngroupID, npcID, chance, spawn_limit) VALUES (".
            "'".$sgid."', ".
            "'".$npcid."', ".
            "'".$chance."', ".
            "'".$sl."')";
        mysql_query($sql) or die(mysql_error());

        die();
    }
    if( @$_GET['savesge'] )
    {
        $id = mysql_real_escape_string(trim($_GET['savesge']));
        if( !is_numeric($id) || $id < 1)
            die();

        $npcid = mysql_real_escape_string(trim($_GET['npcid']));
        $chance = mysql_real_escape_string(trim($_GET['chance']));
        $sl = mysql_real_escape_string(trim($_GET['sl']));
        $sql = 
            "UPDATE spawnentry SET ".
            "npcID='".$npcid."', ".
            "chance='".$chance."', ".
            "spawn_limit='".$sl."' ".
            "WHERE id='".$id."'";
        $query = mysql_query($sql) or die(mysql_error());
        die();            
    }


    if( @$_GET['deletesg'] )
    {
        $id = mysql_real_escape_string(trim($_GET['deletesg']));
        if( !is_numeric($id) )
            die();
        if( $id > 0 )
        {
            $sql = "DELETE FROM spawngroup WHERE id='".$id."'";
            $query = mysql_query($sql) or die(mysql_error());
        }
        die();
    }
    if( @$_GET['savesg'] )
    {
        $id = mysql_real_escape_string(trim($_GET['savesg']));
        if( !is_numeric($id) )
            die();
        $name = mysql_real_escape_string(trim($_GET['name']));
        $spawn_limit = mysql_real_escape_string(trim($_GET['spawn_limit']));
        $dist = mysql_real_escape_string(trim($_GET['dist']));
        $max_x = mysql_real_escape_string(trim($_GET['max_x']));
        $min_x = mysql_real_escape_string(trim($_GET['min_x']));
        $max_y = mysql_real_escape_string(trim($_GET['max_y']));
        $min_y = mysql_real_escape_string(trim($_GET['min_y']));
        $pathdelay = mysql_real_escape_string(trim($_GET['pathdelay']));
        if( $id == -1 )
        {
            $sql = 
                "INSERT INTO spawngroup ".
                "(name,spawn_limit,dist,max_x,min_x,max_y,min_y,pathdelay)".
                " VALUES (".
                "'".$name."',".
                "'".$spawn_limit."',".
                "'".$dist."',".
                "'".$max_x."',".
                "'".$min_x."',".
                "'".$max_y."',".
                "'".$min_y."',".
                "'".$pathdelay."')";
        } else {
            $sql = 
                "UPDATE spawngroup SET ".
                "name='".$name."', ".
                "spawn_limit='".$spawn_limit."', ".
                "dist='".$dist."', ".
                "max_x='".$max_x."', ".
                "min_x='".$min_x."', ".
                "max_y='".$max_y."', ".
                "min_y='".$min_y."', ".
                "pathdelay='".$pathdelay."' ".
                "WHERE id='".$id."'";
        }
        $query = mysql_query($sql) or die(mysql_error());
        die("".mysql_insert_id());

    }
    if( @$_GET['viewsg'] )
    {
        $id = mysql_real_escape_string(trim($_GET['viewsg']));
        if( !is_numeric($id) )
            die();
        $fetch['id'] = -1;
        $fetch['name'] = "";
        $fetch['spawn_limit'] = 1;
        $fetch['dist'] = 0;
        $fetch['max_x'] = 0;
        $fetch['min_x'] = 0;
        $fetch['max_y'] = 0;
        $fetch['min_y'] = 0;
        $fetch['pathdelay'] = 0;
        if( $id != -1 )
        {
            $sql =
                "SELECT * FROM spawngroup WHERE id='".$id."'";
            $query = mysql_query($sql) or die(mysql_error());
            $fetch = mysql_fetch_array($query);
        }
?>
<fieldset>
    <legend>Details</legend>    
    <input type="submit" class="submit" value="Delete"
    style="width:80px" onclick="deleteSG(<?php echo $fetch['id'];?>)">
    <fieldset class="mini_fieldset">
        <legend>ID</legend>
        <input type="text" id="sgid" value="<?php echo @$fetch['id'];?>">
    </fieldset>
    <fieldset class="mini_fieldset">
        <legend>Name</legend>
        <input type="text" id="sgname" value="<?php echo @$fetch['name'];?>">
    </fieldset>
    <fieldset class="mini_fieldset">
        <legend>Spawn Limit</legend>
        <input type="text" id="sgsl" value="<?php
            echo @$fetch['spawn_limit'];?>">
    </fieldset>
    <fieldset class="mini_fieldset">
        <legend>Distance (Wander distance per move)</legend>
        <input type="text" id="sgdist" value="<?php echo @$fetch['dist'];?>">
    </fieldset>
    <fieldset class="mini_fieldset">
        <legend>Path Delay (between each random move)</legend>
        <input type="text" id="sgpd" value="<?php
            echo @$fetch['pathdelay'];?>">
    </fieldset>
    <fieldset class="mini_fieldset">
        <legend>Roam box X</legend>
        <label style="width:40px;">Min:</label>
        <input type="text" id="sgminx" value="<?php echo $fetch['min_x'];?>">
        <br style="clear:both">
        <label style="width:40px;">Max:</label>
        <input type="text" id="sgmaxx" value="<?php echo $fetch['max_x'];?>">
    </fieldset>
    <fieldset class="mini_fieldset">
        <legend>Roam box Y</legend>
        <label style="width:40px;">Min:</label>
        <input type="text" id="sgminy" value="<?php echo $fetch['min_y'];?>">
        <br style="clear:both">
        <label style="width:40px;">Max:</label>
        <input type="text" id="sgmaxy" value="<?php echo $fetch['max_y'];?>">
    </fieldset>
    <input type="submit" class="submit" value="Save"
    onclick="saveSG(<?php echo $id;?>)">
</fieldset>
<fieldset>
    <legend>NPC Spawn Entries</legend>
<?php
    if( $id != -1 )
    {
        $sql =
            "SELECT * FROM spawnentry WHERE spawngroupID='".$id."'";
        $query = mysql_query($sql) or die(mysql_error());
        while($fetch = mysql_fetch_array($query))
        {
            $domid = "sge".$fetch['id'];
?>
        <fieldset>
            <legend><?php echo $fetch['id'];?></legend>
            <div class="delspacer"></div>
            <input type="submit" class="submit" value="Remove"
            style="width:80px"
            onclick="removeSGEntry(<?php
                echo $fetch['id'];?>)">
            <fieldset class="mini_fieldset">
                <legend>ID</legend>
                <input type="text" id="sgeid" 
                value="<?php echo $fetch['id'];?>">
            </fieldset>
            <fieldset class="mini_fieldset">
                <legend>npcID</legend>
                <input type="text" id="<?php echo $domid;?>npcid" 
                value="<?php echo $fetch['npcID'];?>">
            </fieldset>
            <fieldset class="mini_fieldset">
                <legend>chance</legend>
                <input type="text" id="<?php echo $domid;?>chance" 
                value="<?php echo $fetch['chance'];?>">
            </fieldset>
            <fieldset class="mini_fieldset">
                <legend>Spawn Limit</legend>
                <input type="text" id="<?php echo $domid;?>sl" 
                value="<?php echo $fetch['spawn_limit'];?>">
            </fieldset>
            <input type="submit" class="submit" value="Save"
            onclick="saveSGEntry(<?php
                echo $fetch['id'];?>)">
        </fieldset>
<?php                   
        }
    }
?>
        <fieldset>
            <legend>New Entry</legend>
            <fieldset class="mini_fieldset">
                <legend>npcID</legend>
                <input type="text" id="newsgenpcid" 
                value="">
            </fieldset>
            <fieldset class="mini_fieldset">
                <legend>chance</legend>
                <input type="text" id="newsgechance" 
                value="">
            </fieldset>
            <fieldset class="mini_fieldset">
                <legend>Spawn Limit</legend>
                <input type="text" id="newsgesl" 
                value="">
            </fieldset>
            <input type="submit" class="submit" value="Add"
            onclick="newSGEntry()">
        </fieldset>


    </fieldset>
        <script>var viewingSG=<?php echo $id; ?>;</script>
<?php
        die();
    }   

    if( @$_GET['removesge'] )
    {
        $id = mysql_real_escape_string(trim($_GET['removesge']));
        if( !is_numeric($id) || $id < 1 )
            die();
        $sql =
            "DELETE FROM spawnentry WHERE id='".$id."'";
        $query = mysql_query($sql) or die(mysql_error());
        die();
    } 
        //end get
?>
<script>
    
    function viewSG(id)
    {
        $.ajax(
        {
            type: "GET",
            url: 'spawngroups.php',
            data:
            'viewsg='+id,
            success: function(data)
            {
                $('#content').html(data);
            }
        });   
    }
    function saveSGEntry(id)
    {
        var node = '#sge'+id;
        var npcid = $(node+'npcid').val();
        var chance = $(node+'chance').val();
        var sl = $(node+'sl').val();
        $.ajax(
        {
            type: "GET",
            url: 'spawngroups.php',
            data:
            'savesge='+id+
            '&npcid='+npcid+
            '&chance='+chance+
            '&sl='+sl,
            success: function(data)
            {
                loadCategory('spawngroups');
                setTimeout( function(){ viewSG(viewingSG); }, 100 );
            }
        });   
    }
    function removeSGEntry(id)
    {
        $.ajax(
        {
            type: "GET",
            url: 'spawngroups.php',
            data:
            'removesge='+id,
            success: function(data)
            {
                loadCategory('spawngroups');
                setTimeout( function(){ viewSG(viewingSG); }, 100 );
            }
        });   
    }
    function newSGEntry()
    {
        var npcid = $('#newsgenpcid').val();
        var chance = $('#newsgechance').val();
        var sl = $('#newsgesl').val();
        $.ajax(
        {
            type: "GET",
            url: 'spawngroups.php',
            data:
            'newsge='+viewingSG+
            '&npcid='+npcid+
            '&chance='+chance+
            '&sl='+sl,
            success: function(data)
            {
                if( data.length > 7 )
                {
                    alert(data);
                    return;
                }
                loadCategory('spawngroups');
                setTimeout( function(){ viewSG(viewingSG); }, 100 );
            }
        });   
    }
    function deleteSG(id)
    {
        $.ajax(
        {
            type: "GET",
            url: 'spawngroups.php',
            data:
            'deletesg='+id,
            success: function(data)
            {
                if( data.length > 7 )
                {
                    alert(data);
                    return;
                }
                loadCategory('spawngroups');
            }
        });   
    }
    function saveSG(id)
    {
        var name = $('#sgname').val();
        var spawn_limit = $('#sgsl').val();
        var dist = $('#sgdist').val();
        var max_x = $('#sgmaxx').val();
        var min_x = $('#sgminx').val();
        var max_y = $('#sgmaxy').val();
        var min_y = $('#sgminy').val();
        var pathdelay = $('#sgpd').val();
        $.ajax(
        {
            type: "GET",
            url: 'spawngroups.php',
            data:
            'savesg='+id+
            '&name='+name+
            '&spawn_limit='+spawn_limit+
            '&dist='+dist+
            '&max_x='+max_x+
            '&min_x='+min_x+
            '&max_y='+max_y+
            '&min_y='+min_y+
            '&pathdelay='+pathdelay,
            success: function(data)
            {
                if( data.length > 7 )
                {
                    alert(data);
                    return;
                }
                loadCategory('spawngroups');
                if(id==-1)
                    id=data;
                setTimeout( function(){ viewSG(id); }, 100 );
            }
        });   
    }
</script>
<div id="shadow"></div>
<div id="cpanel">
    <fieldset style="width:250px">
        <legend>Spawn Groups</legend>
        <div id="sglist">
<?php
    $sql = "SELECT id, name FROM spawngroup";
    $query = mysql_query($sql) or die(mysql_error());
    while($fetch = mysql_fetch_array($query))
    {
        echo '<div class="listentry" '.
             'onclick="viewSG('.$fetch['id'].')">'.
             '<span class="listnum">'.$fetch['id'].'</span>'.
             '<span class="listname">'.$fetch['name'].'</span>'.
             '</div>';   
    }
?>
        </div>
        <input type="submit" class="submit" value="New" onclick="viewSG(-1)">
    </fieldset>
</div>
<div id="content"></div>
