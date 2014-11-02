<?php
require_once("db.php");
include("auth.php");
    if( @$_GET['deleteitem'] )
    {
        $id = mysql_real_escape_string(trim($_GET['deleteitem']));
        if(!is_numeric($id))
            die();
        $sql = "DELETE FROM items WHERE id='".$id."'";
        $query = mysql_query($sql) or die(mysql_error());
        die(); 
    }

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

    if( @$_GET['saveitem'] )
    {
        $id = trim($_GET['saveitem']);
        if( !is_numeric($id) )
            die();

        $name = trim($_GET['name']);
        if( strlen($name) < 1 )
            $name = "name";
        $desc = trim($_GET['desc']);
        if( strlen($desc) < 1 )
            $desc = "";
        $id = mysql_real_escape_string($id);
        $class = mysql_real_escape_string($_GET['class']);
        $name = mysql_real_escape_string($name);
        $desc = mysql_real_escape_string($desc);
        $weight = mysql_real_escape_string($_GET['weight']);
        $quality = mysql_real_escape_string($_GET['quality']);
        $slot = mysql_real_escape_string($_GET['slot']);
        $skill = mysql_real_escape_string($_GET['skill']);
        $damage = mysql_real_escape_string($_GET['damage']);
        $delay = mysql_real_escape_string($_GET['delay']);
        $range = mysql_real_escape_string($_GET['range']);
        $str = mysql_real_escape_string($_GET['str']);
        $sta = mysql_real_escape_string($_GET['sta']);
        $agi = mysql_real_escape_string($_GET['agi']);
        $dex = mysql_real_escape_string($_GET['dex']);
        $int = mysql_real_escape_string($_GET['int']);
        $wis = mysql_real_escape_string($_GET['wis']);
        $cha = mysql_real_escape_string($_GET['cha']);
        $ac = mysql_real_escape_string($_GET['ac']);
        $atk = mysql_real_escape_string($_GET['atk']);
        $svm = mysql_real_escape_string($_GET['svm']);
        $svf = mysql_real_escape_string($_GET['svf']);
        $svc = mysql_real_escape_string($_GET['svc']);
        $svp = mysql_real_escape_string($_GET['svp']);
        $svd = mysql_real_escape_string($_GET['svd']);
        $hp = mysql_real_escape_string($_GET['hp']);
        $mp = mysql_real_escape_string($_GET['mp']);
        $price = mysql_real_escape_string($_GET['price']);
        $reqarchetype = mysql_real_escape_string($_GET['reqarchetype']);
        $reqclass = mysql_real_escape_string($_GET['reqclass']);
        $reqlevel = mysql_real_escape_string($_GET['reqlevel']);
        $stackable = mysql_real_escape_string($_GET['stackable']);


        if($id == -1)
        {
            $sql =
                "INSERT INTO items ".
                "(itemclass, name, description, weight, quality, slot, skill, ".
                "damage, delay, arange, astr, asta, aagi, adex, aint, awis, ".
                "acha, ac, atk, svm, svf, svc, svp, svd, hp, mp, price, ".
                "reqarchetype, reqclass, reqlevel, stackable) VALUES (".
                "'".($class)."',".
                "'".($name)."',".
                "'".($desc)."',".
                "'".($weight)."',".
                "'".($quality)."',".
                "'".($slot)."',".
                "'".($skill)."',".
                "'".($damage)."',".
                "'".($delay)."',".
                "'".($range)."',".
                "'".($str)."',".
                "'".($sta)."',".
                "'".($agi)."',".
                "'".($dex)."',".
                "'".($int)."',".
                "'".($wis)."',".
                "'".($cha)."',".
                "'".($ac)."',".
                "'".($atk)."',".
                "'".($svm)."',".
                "'".($svf)."',".
                "'".($svc)."',".
                "'".($svp)."',".
                "'".($svd)."',".
                "'".($hp)."',".
                "'".($mp)."',".
                "'".($price)."',".
                "'".($reqarchetype)."',".
                "'".($reqclass)."',".
                "'".($reqlevel)."',".
                "'".($stackable)."')";
            mysql_query($sql) or die(mysql_error());
            die(''.mysql_insert_id());     
        } else {
            $sql =
                "UPDATE items SET ".
                "itemclass='".($class)."', ".
                "name='".($name)."', ".
                "description='".($desc)."', ".
                "weight='".($weight)."', ".
                "quality='".($quality)."', ".
                "slot='".($slot)."', ".
                "skill='".($skill)."', ".
                "damage='".($damage)."', ".
                "delay='".($delay)."', ".
                "arange='".($range)."', ".
                "astr='".($str)."', ".
                "asta='".($sta)."', ".
                "aagi='".($agi)."', ".
                "adex='".($dex)."', ".
                "aint='".($int)."', ".
                "awis='".($wis)."', ".
                "acha='".($cha)."', ".
                "ac='".($ac)."', ".
                "atk='".($atk)."', ".
                "svm='".($svm)."', ".
                "svf='".($svf)."', ".
                "svc='".($svc)."', ".
                "svp='".($svp)."', ".
                "svd='".($svd)."', ".
                "hp='".($hp)."', ".
                "mp='".($mp)."', ".
                "price='".($price)."', ".
                "reqarchetype='".($reqarchetype)."', ".
                "reqclass='".($reqclass)."', ".
                "reqlevel='".($reqlevel)."', ".
                "stackable='".($stackable)."' ".
                "WHERE id='".($id)."' LIMIT 1";
            mysql_query($sql) or die(mysql_error());
            die($id);
        }   
    }
    if( @$_GET['viewitem'] )
    {
        $id = trim($_GET['viewitem']);
        if( !is_numeric($id) )
            die();
        $id = mysql_real_escape_string($id);
        $fetch['itemclass'] = 0;
        $fetch['weight'] = 0;
        $fetch['id'] = -1;
        $fetch['quality'] = 0;
        $fetch['damage'] = 0;
        $fetch['delay'] = 0;
        $fetch['arange'] = 0;
        $fetch['stackable'] = 0;
        $fetch['reqlevel'] = 0;
        $fetch['reqclass'] = 0;
        $fetch['reqarchetype'] = 0;
        $fetch['price'] = 0;
        $fetch['description'] = "";
        $fetch['astr'] = 0;
        $fetch['asta'] = 0;
        $fetch['aagi'] = 0;
        $fetch['adex'] = 0;
        $fetch['aint'] = 0;
        $fetch['awis'] = 0;
        $fetch['acha'] = 0;
        $fetch['ac'] = 0;
        $fetch['atk'] = 0;
        $fetch['svm'] = 0;
        $fetch['svf'] = 0;
        $fetch['svc'] = 0;
        $fetch['svp'] = 0;
        $fetch['svd'] = 0;
        $fetch['hp'] = 0;
        $fetch['mp'] = 0;
        if($id != -1)
        {
            $sql = "SELECT * FROM items WHERE id='".$id."'";
            $query = mysql_query($sql) or die(mysql_error());
            $fetch = mysql_fetch_array($query);
        }
?>
<div style="float:left">
<fieldset>
    <legend>Details</legend>
    <input type="submit" class="submit" value="Delete"
    style="width:80px" onclick="deleteItem(<?php
        echo $fetch['id']; ?>)">
    <fieldset class="mini_fieldset">
        <legend>ID</legend>
        <input type="text" id="Itemid" value="<?php echo @$fetch['id'];?>">
    </fieldset>
    <fieldset class="mini_fieldset">
        <legend>Item Class</legend>
        <div style="float:left">
        <input type="text" id="itemclass" value="<?php
            echo @$fetch['itemclass'];?>">
        </div>
        <div style="float:right">
<pre>0 = Basic Item
1 = Tome</pre>
        </div>
    </fieldset>     
    <fieldset class="mini_fieldset">
        <legend>Name</legend>
        <input type="text" id="itemname" value="<?php echo @$fetch['name'];?>">
    </fieldset>
    <fieldset class="mini_fieldset">
        <legend>Description</legend>
        <input type="text" id="itemdesc" value="<?php
            echo @$fetch['description'];?>">
    </fieldset>
    <fieldset class="mini_fieldset">
        <legend>Weight</legend>
        <input type="text" id="itemweight" value="<?php
            echo @$fetch['weight'];?>">
    </fieldset>
    <fieldset class="mini_fieldset">
        <legend>Quality</legend>
        <div style="float:left">
        <input type="text" id="itemquality" value="<?php
            echo @$fetch['quality'];?>">
        </div>
        <div style="float:right">
<pre>0 = Normal
1 = Magic
2 = Rare
3 = Unique
4 = Quest / Lore</pre>
        </div>
    </fieldset>  
    <fieldset class="mini_fieldset">
        <legend>Slot</legend>
        <select id="itemslot">
<?php
    $slots = Array(
        'None',
        'Primary',
        'Secondary',
        'Head',
        'Neck',
        'Chest',
        'Back',
        'Arms',
        'Hands',
        'Waist',
        'Legs',
        'Feet',
        'Finger');
    for($i=0; $i<count($slots); $i++)
    {
        if( $fetch['slot'] == $i )
            $sel = " SELECTED";
        else
            $sel = "";
        ?><option value="<?php echo $i;?>"<?php echo $sel;?>><?php
        echo $slots[$i];?></option><?php
    }
?>
        </select>
    </fieldset>   
    <fieldset class="mini_fieldset">
        <legend>Skill</legend>
        <select id="itemskill">
<?php
    $skills = Array(
        'None',
        'Hand to hand',
        'Slashing',
        '2 Hand Slashing',
        'Piercing',
        '2 Hand Piercing',
        'Blunt',
        '2 Hand Blunt');
    for($i=0; $i<count($skills); $i++)
    {
        if( $fetch['skill'] == $i )
            $sel = " SELECTED";
        else
            $sel = "";
        ?><option value="<?php echo $i;?>"<?php echo $sel;?>><?php
        echo $skills[$i];?></option><?php
    }
?>
        </select>
    </fieldset>
    <fieldset class="mini_fieldset">
        <legend>Damage</legend>
        <input type="text" id="itemdamage" value="<?php
            echo @$fetch['damage'];?>">
    </fieldset>
    <fieldset class="mini_fieldset">
        <legend>Delay</legend>
        ( <input type="text" id="itemdelay" value="<?php
            echo @$fetch['delay'];?>"> * 10 )ms
    </fieldset>
    <fieldset class="mini_fieldset">
        <legend>Range</legend>
        <input type="text" id="itemrange" value="<?php
            echo @$fetch['arange'];?>">
    </fieldset>
    <fieldset class="mini_fieldset">
        <legend>STR</legend>
        <input type="text" id="itemstr" value="<?php
            echo @$fetch['astr'];?>">
    </fieldset> 
    <fieldset class="mini_fieldset">
        <legend>STA</legend>
        <input type="text" id="itemsta" value="<?php
            echo @$fetch['asta'];?>">
    </fieldset> 
    <fieldset class="mini_fieldset">
        <legend>AGI</legend>
        <input type="text" id="itemagi" value="<?php
            echo @$fetch['aagi'];?>">
    </fieldset> 
    <fieldset class="mini_fieldset">
        <legend>DEX</legend>
        <input type="text" id="itemdex" value="<?php
            echo @$fetch['adex'];?>">
    </fieldset> 
    <fieldset class="mini_fieldset">
        <legend>INT</legend>
        <input type="text" id="itemint" value="<?php
            echo @$fetch['aint'];?>">
    </fieldset> 
    <fieldset class="mini_fieldset">
        <legend>WIS</legend>
        <input type="text" id="itemwis" value="<?php
            echo @$fetch['awis'];?>">
    </fieldset> 
    <fieldset class="mini_fieldset">
        <legend>CHA</legend>
        <input type="text" id="itemcha" value="<?php
            echo @$fetch['acha'];?>">
    </fieldset>    
    <fieldset class="mini_fieldset">
        <legend>AC</legend>
        <input type="text" id="itemac" value="<?php
            echo @$fetch['ac'];?>">
    </fieldset> 
    <fieldset class="mini_fieldset">
        <legend>ATK</legend>
        <input type="text" id="itematk" value="<?php
            echo @$fetch['atk'];?>">
    </fieldset> 
    <fieldset class="mini_fieldset">
        <legend>SVM</legend>
        <input type="text" id="itemsvm" value="<?php
            echo @$fetch['svm'];?>">
    </fieldset> 
    <fieldset class="mini_fieldset">
        <legend>SVF</legend>
        <input type="text" id="itemsvf" value="<?php
            echo @$fetch['svf'];?>">
    </fieldset> 
    <fieldset class="mini_fieldset">
        <legend>SVC</legend>
        <input type="text" id="itemsvc" value="<?php
            echo @$fetch['svc'];?>">
    </fieldset> 
    <fieldset class="mini_fieldset">
        <legend>SVP</legend>
        <input type="text" id="itemsvp" value="<?php
            echo @$fetch['svp'];?>">
    </fieldset> 
    <fieldset class="mini_fieldset">
        <legend>SVD</legend>
        <input type="text" id="itemsvd" value="<?php
            echo @$fetch['svd'];?>">
    </fieldset> 
    <fieldset class="mini_fieldset">
        <legend>HP</legend>
        <input type="text" id="itemhp" value="<?php
            echo @$fetch['hp'];?>">
    </fieldset> 
    <fieldset class="mini_fieldset">
        <legend>MP</legend>
        <input type="text" id="itemmp" value="<?php
            echo @$fetch['mp'];?>">
    </fieldset> 
    <fieldset class="mini_fieldset">
        <legend>Price</legend>
        <input type="text" id="itemprice" value="<?php
            echo @$fetch['price'];?>">
    </fieldset> 

    <fieldset class="mini_fieldset">
        <legend>Required Archetype</legend>
        <select id="itemreqarchetype">
<?php
    $archs = Array(
        'None',
        'Fighter',
        'Scout',
        'Priest',
        'Magician');
    for($i=0; $i<count($archs); $i++)
    {
        if( $fetch['reqarchetype'] == $i )
            $sel = " SELECTED";
        else
            $sel = "";
        ?><option value="<?php echo $i;?>"<?php echo $sel;?>><?php
        echo $archs[$i];?></option><?php
    }
?>
        </select>
    </fieldset>  

    <fieldset class="mini_fieldset">
        <legend>Required Class</legend>
        <select id="itemreqclass">
<?php
    $classes = Array(
        'None',
        'Paladin',
        'Warrior',
        'Shadowknight',
        'Ranger',
        'Bard',
        'Rogue',
        'Cleric',
        'Druid',
        'Shaman',
        'Enchanter',
        'Wizard',
        'Necromancer');
    for($i=0; $i<count($classes); $i++)
    {
        if( $fetch['reqclass'] == $i )
            $sel = " SELECTED";
        else
            $sel = "";
        ?><option value="<?php echo $i;?>"<?php echo $sel;?>><?php
        echo $classes[$i];?></option><?php
    }
?>
        </select>
    </fieldset>  

    <fieldset class="mini_fieldset">
        <legend>Required Level</legend>
        <input type="text" id="itemreqlevel" value="<?php
            echo @$fetch['reqlevel'];?>">
    </fieldset> 

    <fieldset class="mini_fieldset">
        <legend>Stackable</legend>
        <input type="text" id="itemstackable" value="<?php
            echo @$fetch['stackable'];?>">
    </fieldset> 
    <input type="submit" class="submit" value="Save"
    onclick="saveItem(<?php echo $fetch['id'];?>)">
</div>
<div style="float:left">
    <fieldset>
        <legend>Found in Loot Tables:</legend>
<pre>
<?php
            $sql = 
            "SELECT * FROM lootdrop_entries lde, lootdrop ld WHERE ".
            "lde.item_id=".$fetch['id']." AND ld.id=lde.lootdrop_id";
    $query = mysql_query($sql) or die(mysql_error());
    while($fetch = mysql_fetch_array($query))
    {
        ?>
Drop Group: <?php echo $fetch['name']; ?>

    Chance: <?php echo $fetch['chance']; ?>


<?php
    }
        
?>
    </fieldset>
</div>
<?php
    die();
    }
    //end $_GET handling
?>
<script>
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
    function deleteItem(id)
    {
        console.log("delete item: "+id);
        $.ajax(
        {
            type: "GET",
            url: 'items.php',
            data: 'deleteitem='+id,
            success: function(data)
            {
                loadCategory('items');
            }
        });
    }
    function viewItem(id)
    {
        console.log("view item: "+id);
        $.ajax(
        {
            type: "GET",
            url: 'items.php',
            data: 'viewitem='+id,
            success: function(data)
            {
                $('#content').hide();
                $('#content').html(data);
                $('#content').fadeIn('fast');
            }
        });
    }
    
    function saveItem(id)
    {
        console.log("save item: "+id);

        var itemClass = $('#itemclass').val();
        var itemName = $('#itemname').val();
        var itemDesc = $('#itemdesc').val();
        var itemWeight = $('#itemweight').val();
        var itemQuality = $('#itemquality').val();
        var itemSlot = $('#itemslot').val();
        var itemSkill = $('#itemskill').val();
        var itemDamage = $('#itemdamage').val();
        var itemDelay = $('#itemdelay').val();
        var itemRange = $('#itemrange').val();
        var itemstr = $('#itemstr').val();
        var itemsta = $('#itemsta').val();
        var itemagi = $('#itemagi').val();
        var itemdex = $('#itemdex').val();
        var itemint = $('#itemint').val();
        var itemwis = $('#itemwis').val();
        var itemcha = $('#itemcha').val();
        var itemac = $('#itemac').val();
        var itematk = $('#itematk').val();
        var itemsvm = $('#itemsvm').val();
        var itemsvf = $('#itemsvf').val();
        var itemsvc = $('#itemsvc').val();
        var itemsvp = $('#itemsvp').val();
        var itemsvd = $('#itemsvd').val();
        var itemhp = $('#itemhp').val();
        var itemmp = $('#itemmp').val();
        var itemprice = $('#itemprice').val();
        var itemreqarchetype = $('#itemreqarchetype').val();
        var itemreqclass = $('#itemreqclass').val();
        var itemreqlevel = $('#itemreqlevel').val();
        var itemstackable = $('#itemstackable').val();
        
        
        console.log("Name: "+itemName);

        $.ajax(
        {
            type: "GET",
            url: 'items.php',
            data:
            'saveitem='+id+
            '&class='+itemClass+
            '&name='+itemName+
            '&desc='+itemDesc+
            '&weight='+itemWeight+
            '&quality='+itemQuality+
            '&slot='+itemSlot+
            '&skill='+itemSkill+
            '&damage='+itemDamage+
            '&delay='+itemDelay+
            '&range='+itemRange+
            '&str='+itemstr+
            '&sta='+itemsta+
            '&agi='+itemagi+
            '&dex='+itemdex+
            '&int='+itemint+
            '&wis='+itemwis+
            '&cha='+itemcha+
            '&ac='+itemac+
            '&atk='+itematk+
            '&svm='+itemsvm+
            '&svf='+itemsvf+
            '&svc='+itemsvc+
            '&svp='+itemsvp+
            '&svd='+itemsvd+
            '&hp='+itemhp+
            '&mp='+itemmp+
            '&price='+itemprice+
            '&reqarchetype='+itemreqarchetype+
            '&reqclass='+itemreqclass+
            '&reqlevel='+itemreqlevel+
            '&stackable='+itemstackable,

            success: function(data)
            {
                if( data.length > 10 )
                {
                    alert(data);
                    return;
                }
                loadCategory('items');            
                setTimeout(function(){viewItem(data);},100);
            }
        });
    }
</script>
<div id="shadow"></div>
<div id="cpanel">
    <fieldset style="width:250px">
        <legend>Items</legend>
        Search: <input type="text" id="itemfilter" 
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
        <input type="submit" class="submit" value="New" onclick="viewItem(-1)">
    </fieldset>
</div>
<div id="content"></div>
