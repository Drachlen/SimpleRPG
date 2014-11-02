<?php
require_once('db.php');
include("auth.php");
    if( @$_GET['itemFilter'] )
    {
        $filter = trim($_GET['filter']);
        $filter = mysql_real_escape_string($filter);
        $sql = 
            "SELECT id, name FROM items WHERE name LIKE '%".$filter."%' ".
            "OR id='".$filter."'";
        $query = mysql_query($sql) or die(mysql_error());
        while($fetch = mysql_fetch_array($query))
        {
            echo '<div class="listentry" '.
                 'onclick="viewItem('.$fetch['id'].')">'.
                 '<span class="listnum">'.$fetch['id'].'</span>'.
                 '<span class="listname">'.$fetch['name'].'</span>'.
                 '</div>';   
        }
        die();
    }

    if( @$_GET['saveDropEntry'] )
    {
        $DEID = trim($_GET['saveDropEntry']);
        $LDID = trim($_GET['lootdrop_id']);
        $itemID = trim($_GET['item_id']);
        $chance = trim($_GET['chance']);
        if( !is_numeric($LDID) || !is_numeric($itemID) ||
            !is_numeric($chance) || !is_numeric($DEID) )
            die();
        $DEID = mysql_real_escape_string($DEID);
        $LDID = mysql_real_escape_string($LDID);
        $itemID = mysql_real_escape_string($itemID);
        $chance = mysql_real_escape_string($chance);          
        $sql =
            "UPDATE lootdrop_entries SET ".
            "item_id='".$itemID."', chance='".$chance."' ".
            "WHERE id='".$DEID."'";
        mysql_query($sql) or die(mysql_error());
        die();
    }
    if( @$_GET['addDropEntry'] )
    {
        $LDID = trim($_GET['lootdrop_id']);
        $itemID = trim($_GET['item_id']);
        $chance = trim($_GET['chance']);
        if( !is_numeric($LDID) || !is_numeric($itemID) ||
            !is_numeric($chance) )
            die();
        $LDID = mysql_real_escape_string($LDID);
        $itemID = mysql_real_escape_string($itemID);
        $chance = mysql_real_escape_string($chance);
        $sql = 
            "INSERT INTO lootdrop_entries ".
            "(lootdrop_id, item_id, chance) VALUES ".
            "('".$LDID."', '".$itemID."', '".$chance."')";
        mysql_query($sql) or die(mysql_error());
        die();
    }
    
    if( @$_GET['editDropEntries'] )
    {
        $id = trim($_GET['editDropEntries']);
        if( !is_numeric($id) )
            die();
        $id = mysql_real_escape_string($id);

        $sql = "SELECT name from lootdrop WHERE id='".$id."'";
        $query = mysql_query($sql);
        $fetch = mysql_fetch_array($query);
?>
<div style="float:left;width:400px">
<legend>Loot Drop Subgroup: <?php echo $fetch['name'];?></legend>
<input type="submit" class="submit" value="Close" onclick="closeEditDE()">
<?php
        $sql = "SELECT * FROM lootdrop_entries WHERE lootdrop_id='".$id."'";
        $query = mysql_query($sql) or die(mysql_error());
        while($fetch = mysql_fetch_array($query))
        {
            $domid = 'elde_'.$fetch['id'];
?>
        <fieldset>
            <legend>Loot Drop Entry</legend>
            <input type="submit" class="submit" value="Remove"
            style="width:80px"
            onclick="removeLDE(<?php echo $id; ?>,<?php
            echo $fetch['id'];?>)" id="removeltbutton">
            <fieldset class="mini_fieldset">
                <legend>Item ID:</legend>
                <input type="text" id="<?php echo $domid;?>itemid" 
                value="<?php echo $fetch['item_id'];?>"> 
                <a href="" onclick="return filterForID(<?php
                    echo $fetch['id'];
                ?>);">Lookup Item</a>
            </fieldset>
            <fieldset class="mini_fieldset">
                <legend>Chance</legend>
                <input type="text" id="<?php echo $domid;?>chance"
                value="<?php echo $fetch['chance']; ?>">
            </fieldset>
            <input type="submit" class="submit" value="Save"
            onclick="saveDropEntry(<?php echo $fetch['id'];?>)">
        </fieldset>
<?php
        }
?>
        <fieldset>
            <legend>New Loot Drop Entry</legend>
            <fieldset class="mini_fieldset">
                <legend>Item ID:</legend>
                <input type="text" id="addDEitemid" value=""> 
                <a href="" onclick="return filterForID(-1)">Lookup Item</a>
            </fieldset>
            <fieldset class="mini_fieldset">
                <legend>Chance</legend>
                <input type="text" id="addDEchance" value="">
            </fieldset>
            <input type="submit" class="submit" value="Add"
            onclick="finalizeAddDropEntry()">
        </fieldset>
</div>
<div style="float:left;width:300px;margin-left:40px;">
<fieldset>
    <legend>Group Snapshot</legend>
<?php
        $sql = "SELECT * FROM lootdrop_entries WHERE lootdrop_id='".$id."'";
        $query = mysql_query($sql) or die(mysql_error());
        while($fetch = mysql_fetch_array($query))
        {
            $sqlb = "SELECT name FROM items WHERE id='".$fetch['item_id']."'";
            $queryb = mysql_query($sqlb) or die(mysql_error());
            $fetchb = mysql_fetch_array($queryb);
            echo $fetch['item_id'].". ".$fetchb['name']."<br>";
        }
?>
</fieldset>
</div>
<?php
        die();
    }
    if( @$_GET['addLTEntry'] )
    {
        $loottable_id = trim($_GET['loottable_id']);
        $lootdrop_id = trim($_GET['lootdrop_id']);
        $name = trim($_GET['name']);
        $multiplier = trim($_GET['multiplier']);
        $probability = trim($_GET['probability']);
        if( !is_numeric($loottable_id) || !is_numeric($lootdrop_id) ||
            !is_numeric($multiplier) || !is_numeric($probability) )
            die();
        /*
         * in the case where loottable_id is -1, it means that there was an 
         * attempt to add a loot table entry to a new loot table. Basically, 
         * ignore it, since the loot table doesn't exist yet.
         */
        if( $loottable_id == -1 )
            die();
        $loottable_id = mysql_real_escape_string($loottable_id);
        $lootdrop_id = mysql_real_escape_string($lootdrop_id);
        $name = mysql_real_escape_string($name);
        $multiplier = mysql_real_escape_string($multiplier);
        $probability = mysql_real_escape_string($probability);
        if($lootdrop_id == -1)
        {
            /* If lootdrop_id is -1, then we're creating a new entry in the 
             * lootdrop table.
             */
            $sql =
                "INSERT INTO lootdrop ".
                "(name) VALUES ('".$name."')";
            mysql_query($sql) or die(mysql_error());
            $lootdrop_id = mysql_insert_id();
        }
        //Next, add the row to loottable_entries:
        $sql =
            "INSERT INTO loottable_entries ".
            "(loottable_id, lootdrop_id, multiplier, probability) ".
            "VALUES ('".$loottable_id."', '".$lootdrop_id."', ".
            "'".$multiplier."', '".$probability."')";
        mysql_query($sql) or die(mysql_error());
        die();
    }

    if( @$_GET['saveLTEntry'] )
    {
        $lteid = trim($_GET['saveLTEntry']);
        $ldid = trim($_GET['lootdropid']);
        $multiplier = trim($_GET['multiplier']);
        $probability = trim($_GET['probability']);
        if( !is_numeric($lteid) || !is_numeric($ldid) ||
            !is_numeric($multiplier) || !is_numeric($probability))
            die();
        $lteid = mysql_real_escape_string($lteid);
        $ldid = mysql_real_escape_string($ldid);
        $multiplier = mysql_real_escape_string($multiplier);
        $probability = mysql_real_escape_string($probability);
        $sql =
            "UPDATE loottable_entries SET ".
            "lootdrop_id='".$ldid."', ".
            "multiplier='".$multiplier."', ".
            "probability='".$probability."' ".
            "WHERE loottable_id='".$lteid."' ".
            "AND lootdrop_id='".$ldid."' ".
            "LIMIT 1";
        $query = mysql_query($sql) or die(mysql_error());
        die();
            

    }
    if( @$_GET['removeLTEntry'] )
    {
        $lteid = $_GET['removeLTEntry'];
        $ldid = $_GET['lootdropid'];
        if( !is_numeric($lteid) || !is_numeric($ldid) )
            die();
        $lteid = mysql_real_escape_string($lteid);
        $ldid = mysql_real_escape_string($ldid);
        $sql =
            "DELETE FROM loottable_entries WHERE ".
            "loottable_id='".$lteid."' AND ".
            "lootdrop_id='".$ldid."' ".
            "LIMIT 1";
        $query = mysql_query($sql) or die(mysql_error());
        die();        
    }
    if( @$_GET['removeLT'] )
    {
        $lt = $_GET['removeLT'];
        if( !is_numeric($lt) )
            die();
        $lt = mysql_real_escape_string($lt);
        $sql =
            "DELETE FROM loottable WHERE ".
            "id='".$lt."' ".
            "LIMIT 1";
        $query = mysql_query($sql) or die(mysql_error());
        die();        
    }
    if( @$_GET['removeLDE'] )
    {
        $lde = $_GET['removeLDE'];
        if( !is_numeric($lde) )
            die();
        $lde = mysql_real_escape_string($lde);
        $sql =
            "DELETE FROM lootdrop_entries WHERE ".
            "id='".$lde."' ".
            "LIMIT 1";
        $query = mysql_query($sql) or die(mysql_error());
        die();        
    }
    if( @$_GET['saveLT'] )
    {
        $id = trim($_GET['saveLT']);
        if(!is_numeric($id))
            die();
        $id = mysql_real_escape_string($id);
        $name = mysql_real_escape_string(trim($_GET['name']));
        $mingold = mysql_real_escape_string(trim($_GET['mingold']));
        $maxgold = mysql_real_escape_string(trim($_GET['maxgold']));

        if(!is_numeric($mingold))
            $mingold = 0;
        if(!is_numeric($maxgold))
            $maxgold = 0;

        if( $id != -1 )
        {
            $sql =
                "UPDATE loottable SET ".
                "name='".$name."', ".
                "mingold='".$mingold."', ".
                "maxgold='".$maxgold."' ".
                "WHERE id='".$id."'";
        } else {
            $sql =
                "INSERT INTO loottable ".
                "(name, mingold, maxgold) ".
                "VALUES ('".$name."', '".$mingold."', '".$maxgold."')";
        }
        $query = mysql_query($sql) or die(mysql_error());
        die( ''.mysql_insert_id() );
        die();
    }
    if( @$_GET['loadentry'] )
    {
        $id = trim($_GET['loadentry']);
        if(!is_numeric($id))
            die();
        $id = mysql_real_escape_string($id);
        $name = "";
        $mingold = 0;
        $maxgold = 0;

        if($id != -1)
        {
            $sql = "SELECT * FROM loottable WHERE id='".$id."'";
            $query = mysql_query($sql) or die(mysql_error());
            $fetch = mysql_fetch_array($query);
            $name = $fetch['name'];
            $mingold = $fetch['mingold'];
            $maxgold = $fetch['maxgold'];
        }
?>
<fieldset>
    <legend>Details</legend>
    <input type="submit" class="submit" value="Remove"
    style="width:80px"
    onclick="removeLT()" id="removeltbutton">
    <fieldset class="mini_fieldset">
        <legend>ID</legend>
        <input type="text" id="LTid" value="<?php echo $id;?>">
    </fieldset>
    <fieldset class="mini_fieldset">
        <legend>Name</legend>
        <input type="text" id="LTname" value="<?php echo $name;?>">
    </fieldset>
    <fieldset class="mini_fieldset">
        <legend>Gold</legend>
        <label style="width:40px;">Min:</label>
        <input type="text" id="LTmingold" value="<?php echo $mingold;?>">
        <br style="clear:both">
        <label style="width:40px;">Max:</label>
        <input type="text" id="LTmaxgold" value="<?php echo $maxgold;?>">
    </fieldset>
    <input type="submit" class="submit" value="Save"
    onclick="saveLT(<?php echo $id;?>)">
</fieldset>

<fieldset>
    <legend>Loot Table Entries</legend>
<?php
        if($id != -1)
        {
            $sql = "SELECT lootdrop_id, multiplier, probability, name ".
                   "FROM loottable_entries lte, lootdrop ld WHERE ".
                   "lte.loottable_id='".$id."' AND ".
                   "ld.id=lte.lootdrop_id";
            $query = mysql_query($sql) or die(mysql_error());
            while($fetch = mysql_fetch_array($query))
            {
                $domid = "lte".$fetch['lootdrop_id'];
?>
        <fieldset>
            <legend><?php echo $fetch['name'];?></legend>
            <div class="delspacer"></div>
            <input type="submit" class="submit" value="Remove"
            style="width:80px"
            onclick="removeLTEntry(<?php
                echo $id;?>,<?php echo $fetch['lootdrop_id'];?>)">
            <fieldset class="mini_fieldset">
                <legend>Loot Drop ID</legend>
                <input type="text" id="ldid" 
                value="<?php echo $fetch['lootdrop_id'];?>">
            </fieldset>
            <fieldset class="mini_fieldset">
                <legend>Multiplier</legend>
                <input type="text" id="<?php echo $domid;?>multiplier"
                value="<?php echo $fetch['multiplier'];?>">
            </fieldset>
            <fieldset class="mini_fieldset">
                <legend>Probability</legend>
                <input type="text" id="<?php echo $domid;?>probability"
                value="<?php echo $fetch['probability'];?>">
            </fieldset>
            <input type="submit" class="submit" value="Edit Loot Drop Entries"
            onclick="editDropEntries(<?php echo $fetch['lootdrop_id'];?>)">
            <input type="submit" class="submit" value="Save"
            onclick="saveLTEntry(<?php
                echo $id;?>,<?php echo $fetch['lootdrop_id'];?>)">
        </fieldset>
<?php                   
            }
        }
?>
        <input type="submit" class="submit" value="Add Entry"
        onclick="addLTEntry(<?php echo $id;?>)">
    </fieldset>
    <script>var viewingLT=<?php echo $id; ?>;</script>
<?php
        die();
    }

    //end $_GET handling
?>
    <script>
    function removeLT()
    {
        if(viewingLT == -1)
            return;
        $.ajax(
        {
            type: "GET",
            url: 'loottables.php',
            data: 'removeLT='+viewingLT,
            success: function(data)
            {
                if(data.length>1)
                    alert(data);
                loadCategory('loottables');
            }
        });
    }
    function removeLDE(lootdropID, lootdrop_entryID)
    {
        $.ajax(
        {
            type: "GET",
            url: 'loottables.php',
            data: 'removeLDE='+lootdrop_entryID,
            success: function(data)
            {
                if(data.length>1)
                {
                    alert(data);
                    return;
                }
                loadCategory('loottables');
                setTimeout(function()
                {
                    selectLT(viewingLT);
                    editDropEntries(lootdropID);
                }, 100);
                
            }
        });
    }
    function selectLT(id)        
    {
        console.log("SelectLT: "+id);
        $.ajax(
        {
            type: "GET",
            url: 'loottables.php',
            data: 'loadentry='+id,
            success: function(data)
            {
                $('#content').hide();
                $('#content').html(data);
                $('#content').fadeIn('fast');
                editingLTID = id;
                if(id==-1)
                    $('#removeltbutton').hide();
                else
                    $('#removeltbutton').show();
            }
        });
    }
    function saveLT(id)
    {
        var name = $('#LTname').val();
        var mingold = $('#LTmingold').val();
        var maxgold = $('#LTmaxgold').val();
        $.ajax(
        {
            type: "GET",
            url: 'loottables.php',
            data:
            'saveLT='+id+'&'+
            'name='+name+'&'+
            'mingold='+mingold+'&'+
            'maxgold='+maxgold,                
            success: function(data)
            {
                if( data.length > 11 )
                {
                    alert(data);
                    return;
                }  
                loadCategory('loottables');
                console.log(data);
                if(data==0)
                    data=id;
                setTimeout(function(){selectLT(data)}, 100);
            }
        });
    }
    function saveLTEntry(ltid, ldid)
    {
        var multiplier = $('#lte'+ldid+'multiplier').val();
        var probability = $('#lte'+ldid+'probability').val();
        $.ajax(
        {
            type: "GET",
            url: 'loottables.php',
            data:
            'saveLTEntry='+ltid+'&'+
            'lootdropid='+ldid+'&'+
            'multiplier='+multiplier+'&'+
            'probability='+probability,                
            success: function(data)
            {
                if(data.length > 1)
                {
                    alert('Error: '+data);
                } else {
                    loadCategory('loottables');
                    setTimeout(function(){selectLT(ltid);},100);  
                }
            }
        });
    }
    function removeLTEntry(LTID, LDID)
    {
        $.ajax(
        {
            type: "GET",
            url: 'loottables.php',
            data:
            'removeLTEntry='+LTID+'&'+
            'lootdropid='+LDID,
            success: function(data)
            {
                if(data.length > 1)
                {
                    alert('Error: '+data);
                } else {
                    loadCategory('loottables');
                    setTimeout(function(){selectLT(LTID);},100);
                }
            }
        });
    }
    function addLTEntry(ltid)
    {
        if(ltid == -1)
        {
            alert(
                "Cannot add a Loot Table Entry to a nonexistent Loot Table."+
                "\nCreate the Loot Table first.");
            return;
        }
        $('#shadow').show();
        $('#addlte').fadeIn('fast');
        editingLTID = ltid;
    }
    function finalizeAddLTEntry()
    {
        var name = $('#newlte').val();
        var multiplier = $('#newltemultiplier').val();
        var probability = $('#newlteprobability').val();
        var id = -1;
        var ltid = editingLTID;
        if( name.length > 1 )
        {
            //Creating a NEW lootdrop entry
        } else {
            //Using an existing lootdrop entry
            id = $('#existinglte').val();            
        }
        $.ajax(
        {
            type: "GET",
            url: 'loottables.php',
            data:
            'addLTEntry=1&'+
            'loottable_id='+editingLTID+'&'+
            'lootdrop_id='+id+'&'+
            'name='+name+'&'+
            'multiplier='+multiplier+'&'+
            'probability='+probability,
            success: function(data)
            {
                if(data.length > 1)
                {
                    alert('Error: '+data);
                } else {
                    loadCategory('loottables');
                    setTimeout(function(){selectLT(ltid);},100); 
                }
            }
        });
    }
    var editingLTID = -1;
    function cancelAddLTEntry()
    {
        $('#shadow').fadeOut('fast');
        $('#addlte').fadeOut('fast');
    }

    function editDropEntries(ltid)
    {
        editingLTID=ltid;
        $('#shadow').show();
        $.ajax(
        {
            type: "GET",
            url: 'loottables.php',
            data:
            'editDropEntries='+ltid,
            success: function(data)
            {
                            
                $('#editlde').html(data);
                $('#editlde').fadeIn('fast');
                $('#itemlookup').fadeIn('fast');
            }
        });
    }

    function finalizeAddDropEntry()
    {
        console.log("finalize");
        console.log("editingltid: "+editingLTID);
        var ldid = editingLTID;
        var itemid = $('#addDEitemid').val();
        var chance = $('#addDEchance').val();
        if( itemid.length < 1 || chance.length < 1 )
            return;
        $.ajax(
        {
            type: "GET",
            url: 'loottables.php',
            data:
            'addDropEntry=1&'+
            'lootdrop_id='+ldid+"&"+
            'item_id='+itemid+"&"+
            'chance='+chance,
            success: function(data)
            {
                if(data.length>7)
                {
                    alert(data);
                    return;
                }
                closeEditDE();
                loadCategory('loottables');
                setTimeout(function(){
                    selectLT(viewingLT);
                    setTimeout(function(){editDropEntries(ldid);},100);
                },100);
            }
        });        
    }

    function saveDropEntry(id)
    {
        var ldid = editingLTID;
        var itemid = $('#elde_'+id+'itemid').val();
        var chance = $('#elde_'+id+'chance').val();
        if( itemid.length < 1 || chance.length < 1 )
            return;
        $.ajax(
        {
            type: "GET",
            url: 'loottables.php',
            data:
            'saveDropEntry='+id+'&'+
            'lootdrop_id='+ldid+"&"+
            'item_id='+itemid+"&"+
            'chance='+chance,
            success: function(data)
            {
                if(data.length>5)
                    alert(data);
                else
                    alert(id+" saved");    
            }
        });   
    }


    function closeEditDE()
    {
        $('#editlde').hide();
        $('#itemlookup').hide();
        $('#shadow').hide();
    }

    function viewItem(id)
    {
        
    }

    function filterForID(id)
    {
        if(id==-1)
            var itemID = $('#addDEitemid').val();
        else
            var itemID = $('#elde_'+id+'itemid').val();
        $('#itemfilter').val(itemID);
        itemFilter();
        return false;
    }

    function itemFilter()
    {
        var filter = $('#itemfilter').val();
        $.ajax(
        {
            type: "GET",
            url: 'loottables.php',
            data:
            'itemFilter=1&filter='+filter,
            success: function(data)
            {
                $('#itemlist').html(data);
            }
        });   
    }

</script>
<div id="shadow"></div>
<div id="itemlookup" class="special"
style="left:20px;width:300px;position:fixed">
    <fieldset style="width:300px">
        <legend>Item Lookup</legend>
        Name/ID: <input type="text" id="itemfilter" 
                onkeyup="itemFilter()">
        <div id="itemlist">
<?php
    $sql = "SELECT id, name FROM items";
    $query = mysql_query($sql) or die(mysql_error());
    while($fetch = mysql_fetch_array($query))
    {
        echo '<div class="listentry" '.
             'onclick="viewItem('.$fetch['id'].')">'.
             '<span class="listnum">'.$fetch['id'].'</span>'.
             '<span class="listname">'.$fetch['name'].'</span>'.
             '</div>';   
    }

?>
        </div>
    </fieldset>
</div>
<div id="editlde" class="special" style="width:800px"></div>
<div id="addlte" class="special">
    <fieldset>
        <legend>Add Loot Table Entry</legend>
        <fieldset class="mini_fieldset">
            <legend>From</legend>
            Existing Entry:
            <select id="existinglte">
<?php
    $sql = "SELECT * FROM lootdrop";
    $query = mysql_query($sql) or die(mysql_error());
    while($fetch = mysql_fetch_array($query))
    {
?>
    <option value="<?php echo $fetch['id'];?>"><?php echo $fetch['name'];?>
    </option>
<?php
    }
?>
            </select>
            <br>
            - OR -
            <br>
            New Entry: <input type="text" id="newlte">
        </fieldset>
        <fieldset class="mini_fieldset">
            <legend>Multiplier</legend>
            <input type="text" id="newltemultiplier" value="0">
        </fieldset>
        <fieldset class="mini_fieldset">
            <legend>Probability</legend>
            <input type="text" id="newlteprobability" value="0">
        </fieldset>
        <input type="submit" class="submit" value="Cancel" 
        onclick="cancelAddLTEntry()">
        <input type="submit" class="submit" value="Add"
        onclick="finalizeAddLTEntry()">
    </fieldset>
</div>
<div id="cpanel">
    <fieldset style="width:250px">
        <legend>Loot Tables</legend>
<?php
    $sql = "SELECT * FROM loottable";
    $query = mysql_query($sql);
    while($fetch = mysql_fetch_array($query))
    {
        echo '<div class="listentry" '.
             'onclick="selectLT('.$fetch['id'].')">'.
             '<span class="listnum">'.$fetch['id'].'</span>'.
             '<span class="listname">'.$fetch['name'].'</span>'.
             '</div>';   
    }
?>
    <input type="submit" class="submit" value="New" onclick="selectLT(-1)">
    </fieldset>    
    <fieldset style="width:250px">
        <legend>Drop Groups</legend>
<?php
    $sql = "SELECT * FROM lootdrop";
    $query = mysql_query($sql);
    while($fetch = mysql_fetch_array($query))
    {
        echo '<div class="listentry" '.
             'onclick="editDropEntries('.$fetch['id'].')">'.
             '<span class="listnum">'.$fetch['id'].'</span>'.
             '<span class="listname">'.$fetch['name'].'</span>'.
             '</div>';   
    }
?>
    <input type="submit" class="submit" value="New"
    onclick="addLTEntry(-1)">
    </fieldset>
</div>
<div id="content"></div>
