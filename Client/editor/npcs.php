<?php
    require_once("db.php");
include("auth.php");
    if( @$_GET['npcfilter'] )
    {
        $name = mysql_real_escape_string(trim($_GET['name']));
        $level = mysql_real_escape_string(trim($_GET['level']));
        $type = mysql_real_escape_string(trim($_GET['type']));
        $sql = 
            "SELECT * FROM npctypes WHERE ".
            "name LIKE '%".$name."%' ".
            "OR id='".$name."' ".
            "OR level='".$level."'";

        if( strlen($level) > 0 || strlen($type) > 0)
        {
         $sql = 
            "SELECT * FROM npctypes WHERE ".
            "name LIKE '%".$name."' ";
            if( strlen($level) > 0)
                $sql .= "AND level='".$level."' ";
            if( strlen($type) > 0)
                $sql .= "AND type LIKE '%".$type."%'";
        }
        $query = mysql_query($sql) or die(mysql_error());
        while($fetch = mysql_fetch_array($query))
        {
            echo '<div class="listentry" '.
                 'onclick="viewNPC('.$fetch['id'].')">'.
                 '<span class="listnum">'.$fetch['id'].'</span>'.
                 '<span class="listname">'.$fetch['name'].'</span>'.
                 '<span style="color:#ff9900"> Lvl: '.$fetch['level'].'</span>'.
                 '</div>';   
        }
        die();            
    }
    if( @$_GET['deletenpc'] )
    {
        $id = mysql_real_escape_string(trim($_GET['deletenpc']));
        if( !is_numeric($id) )
            die();
        if( $id < 1 )
            die();
        $sql = 
            "DELETE FROM npctypes WHERE id='".$id."'";
        $query = mysql_query($sql) or die(mysql_error());
        die();
    }
    if( @$_GET['savenpc'] )
    {
        $id = mysql_real_escape_string(trim($_GET['savenpc']));
        if( !is_numeric($id) )
            die();

        $name = mysql_real_escape_string(trim($_GET['name']));
        $type = mysql_real_escape_string(trim($_GET['type']));
        $desc = mysql_real_escape_string(trim($_GET['desc']));
        $level = mysql_real_escape_string(trim($_GET['level']));
        $speed = mysql_real_escape_string(trim($_GET['speed']));
        $weapondelay = mysql_real_escape_string(trim($_GET['weapondelay']));
        $abilities = mysql_real_escape_string(trim($_GET['abilities']));
        $abilityfreq = mysql_real_escape_string(trim($_GET['abilityfreq']));
        $viewrange = mysql_real_escape_string(trim($_GET['viewrange']));
        $xpbonus = mysql_real_escape_string(trim($_GET['xpbonus']));
        $loottable = mysql_real_escape_string(trim($_GET['loottable']));
        $social = mysql_real_escape_string(trim($_GET['social']));
        $hp = mysql_real_escape_string(trim($_GET['hp']));
        $mp = mysql_real_escape_string(trim($_GET['mp']));
        $invulnerable = mysql_real_escape_string(trim($_GET['invulnerable']));
        $sell = mysql_real_escape_string(trim($_GET['sell']));
        $dialog = mysql_real_escape_string(trim($_GET['dialog']));
        $hostile = mysql_real_escape_string(trim($_GET['hostile']));
        $ac = mysql_real_escape_string(trim($_GET['ac']));
        $atk = mysql_real_escape_string(trim($_GET['atk']));
        $str = mysql_real_escape_string(trim($_GET['str']));
        $sta = mysql_real_escape_string(trim($_GET['sta']));
        $agi = mysql_real_escape_string(trim($_GET['agi']));
        $dex = mysql_real_escape_string(trim($_GET['dex']));
        $int = mysql_real_escape_string(trim($_GET['int']));
        $wis = mysql_real_escape_string(trim($_GET['wis']));
        $cha = mysql_real_escape_string(trim($_GET['cha']));
        $svm = mysql_real_escape_string(trim($_GET['svm']));
        $svf = mysql_real_escape_string(trim($_GET['svf']));
        $svc = mysql_real_escape_string(trim($_GET['svc']));
        $svp = mysql_real_escape_string(trim($_GET['svp']));
        $svd = mysql_real_escape_string(trim($_GET['svd']));
        $gfx = mysql_real_escape_string(trim($_GET['gfx']));
        $width = mysql_real_escape_string(trim($_GET['width']));
        $height = mysql_real_escape_string(trim($_GET['height']));
        $hitbox = mysql_real_escape_string(trim($_GET['hitbox']));
        //new npc
        if( $id == -1 )
        {
            $sql = 
                "INSERT INTO npctypes ".
                "(name, level, speed, weapondelay, abilities, abilityfreq,".
                "viewrange, xpbonus, loottable, social, HP, MP, invulnerable,".
                "sell, dialog, hostile, AC, ATK, STR, STA, AGI, DEX, `INT`,".
                "WIS, CHA, SVM, SVF, SVC, SVP, SVD, description, type, gfx,".
                "width, height,hitbox)".
                " VALUES (".
                "'".$name."',".
                "'".$level."',".
                "'".$speed."',".
                "'".$weapondelay."',".
                "'".$abilities."',".
                "'".$abilityfreq."',".
                "'".$viewrange."',".
                "'".$xpbonus."',".
                "'".$loottable."',".
                "'".$social."',".
                "'".$hp."',".
                "'".$mp."',".
                "'".$invulnerable."',".
                "'".$sell."',".
                "'".$dialog."',".
                "'".$hostile."',".
                "'".$ac."',".
                "'".$atk."',".
                "'".$str."',".
                "'".$sta."',".
                "'".$agi."',".
                "'".$dex."',".
                "'".$int."',".
                "'".$wis."',".
                "'".$cha."',".
                "'".$svm."',".
                "'".$svf."',".
                "'".$svc."',".
                "'".$svp."',".
                "'".$svd."',".
                "'".$desc."',".
                "'".$type."', '".$gfx."', '".$width."', '".$height."',".
                "'".$hitbox."')";

        } else {
            $sql = 
                "UPDATE npctypes SET ".
                "name='".$name."', ".
                "level='".$level."', ".
                "speed='".$speed."', ".
                "weapondelay='".$weapondelay."', ".
                "abilities='".$abilities."', ".
                "abilityfreq='".$abilityfreq."', ".
                "viewrange='".$viewrange."', ".
                "xpbonus='".$xpbonus."', ".
                "loottable='".$loottable."', ".
                "social='".$social."', ".
                "HP='".$hp."', ".
                "MP='".$mp."', ".
                "invulnerable='".$invulnerable."', ".
                "sell='".$sell."', ".
                "dialog='".$dialog."', ".
                "hostile='".$hostile."', ".
                "AC='".$ac."', ".
                "ATK='".$atk."', ".
                "STR='".$str."', ".
                "STA='".$sta."', ".
                "AGI='".$agi."', ".
                "DEX='".$dex."', ".
                "`INT`='".$int."', ".
                "WIS='".$wis."', ".
                "CHA='".$cha."', ".
                "SVM='".$svm."', ".
                "SVF='".$svf."', ".
                "SVC='".$svc."', ".
                "SVP='".$svp."', ".
                "SVD='".$svd."', ".
                "description='".$desc."', ".
                "type='".$type."', ".
                "gfx='".$gfx."', ".
                "width='".$width."', ".
                "height='".$height."', ".
                "hitbox='".$hitbox."' ".
                "WHERE id='".$id."'";

        }

        $query = mysql_query($sql) or die(mysql_error());
        die("".mysql_insert_id());
    }
    if( @$_GET['viewnpc'] )
    {
        $id = mysql_real_escape_string(trim($_GET['viewnpc']));
        if( !is_numeric($id) )
            die();

        $fetch['id'] = -1;
        $fetch['name'] = "";
        $fetch['type'] = "";
        $fetch['type'] = "merchant";
        $fetch['level'] = 1;
        $fetch['speed'] = 1600;
        $fetch['weapondelay'] = 1600;
        $fetch['abilityfreq'] = 0;
        $fetch['viewrange'] = 0;
        $fetch['xpbonus'] = 0;
        $fetch['loottable'] = 0;
        $fetch['social'] = "merchant";
        $fetch['HP'] = 1;
        $fetch['MP'] = 0;
        $fetch['invulnerable'] = 0;
        $fetch['hostile'] = 0;
        $fetch['AC'] = 0;
        $fetch['ATK'] = 0;
        $fetch['STR'] = 0;
        $fetch['STA'] = 0;
        $fetch['AGI'] = 0;
        $fetch['DEX'] = 0;
        $fetch['INT'] = 0;
        $fetch['WIS'] = 0;
        $fetch['CHA'] = 0;
        $fetch['SVM'] = 0;
        $fetch['SVF'] = 0;
        $fetch['SVC'] = 0;
        $fetch['SVP'] = 0;
        $fetch['SVD'] = 0;
        $fetch['gfx'] = "player";
        $fetch['width'] = 1;
        $fetch['height'] = 1;
        $fetch['hitbox'] = 1;
        if( $id != -1)
        {
            $sql = "SELECT * FROM npctypes WHERE id='".$id."'";
            $query = mysql_query($sql);
            $fetch = mysql_fetch_array($query);
        } 
?>
<fieldset>
    <legend>Details</legend>    
    <input type="submit" class="submit" value="Delete"
    style="width:80px" onclick="deleteNPC(<?php echo $fetch['id'];?>)">
    <fieldset class="mini_fieldset">
        <legend>ID</legend>
        <input type="text" id="npcid" value="<?php echo @$fetch['id'];?>">
    </fieldset>
    <fieldset class="mini_fieldset">
        <legend>Name</legend>
        <input type="text" id="npcname" value="<?php echo @$fetch['name'];?>">
    </fieldset>
    <fieldset class="mini_fieldset">
        <legend>Type</legend>
        <input type="text" id="npctype" value="<?php echo @$fetch['type'];?>">
    </fieldset>
    <fieldset class="mini_fieldset">
        <legend>Graphic (filename, no extension)</legend>
        <input type="text" id="npcgfx" value="<?php echo @$fetch['gfx'];?>">
    </fieldset>
    <fieldset class="mini_fieldset">
        <legend>Width (in tiles)</legend>
        <input type="text" id="npcwidth" value="<?php
            echo @$fetch['width'];?>">
    </fieldset>
    <fieldset class="mini_fieldset">
        <legend>Height (in tiles)</legend>
        <input type="text" id="npcheight" value="<?php
            echo @$fetch['height'];?>">
    </fieldset>
    <fieldset class="mini_fieldset">
        <legend>Hitbox (Tiles in order)</legend>
        <div style="float:left">
            <input type="text" id="npchitbox" value="<?php
                echo @$fetch['hitbox'];?>">
        </div>
        <div style="float:right">
<pre>
    Examples:
    WxH = 1x1, then Hitbox = 1
    WxH = 2x2, then Hitbox needs to be:
    0011
     - The bottom two tiles are hittable
    1000
     - The top left tile is hittable
    1001
     - The top left & Bottom right
    etc
</pre>
</div>
    </fieldset>
    <fieldset class="mini_fieldset">
        <legend>Description</legend>
        <input type="text" id="npcdescription" value="<?php
            echo @$fetch['description'];?>">
    </fieldset>
    <fieldset class="mini_fieldset">
        <legend>Level</legend>
        <input type="text" id="npclevel" value="<?php echo @$fetch['level'];?>">
    </fieldset>
    <fieldset class="mini_fieldset">
        <legend>Speed</legend>
        <input type="text" id="npcspeed" value="<?php echo @$fetch['speed'];?>">
    </fieldset>
    <fieldset class="mini_fieldset">
        <legend>Weapon Delay:</legend>
        <input type="text" id="npcweapondelay" value="<?php
            echo @$fetch['weapondelay'];?>">
    </fieldset>
    <fieldset class="mini_fieldset">
        <legend>Abilities</legend>
        <input type="text" id="npcabilities" value="<?php
            echo @$fetch['abilities'];
            //todo 
    ?>">
    </fieldset>
    <fieldset class="mini_fieldset">
        <legend>Ability Frequency (0-100)</legend>
        <input type="text" id="npcabilityfreq" value="<?php
            echo @$fetch['abilityfreq'];?>">
    </fieldset>
    <fieldset class="mini_fieldset">
        <legend>View Range (in a box)</legend>
        <input type="text" id="npcviewrange" value="<?php
            echo @$fetch['viewrange'];?>">
    </fieldset>
    <fieldset class="mini_fieldset">
        <legend>Experience Bonus</legend>
        <input type="text" id="npcxpbonus" value="<?php
            echo @$fetch['xpbonus'];?>">
    </fieldset>
    <fieldset class="mini_fieldset">
        <legend>Loot Table (ID)</legend>
        <input type="text" id="npcloottable" value="<?php
            echo @$fetch['loottable']; ?>">
    </fieldset>
    <fieldset class="mini_fieldset">
        <legend>Social With NPC Type:</legend>
        <input type="text" id="npcsocial" value="<?php
            echo @$fetch['social'];?>">
    </fieldset>
    <fieldset class="mini_fieldset">
        <legend>HP</legend>
        <input type="text" id="npchp" value="<?php echo @$fetch['HP'];?>">
    </fieldset>
    <fieldset class="mini_fieldset">
        <legend>MP</legend>
        <input type="text" id="npcmp" value="<?php echo @$fetch['MP'];?>">
    </fieldset>
    <fieldset class="mini_fieldset">
        <legend>Invulnerable</legend>
        <input type="text" id="npcinvulnerable" value="<?php
            echo @$fetch['invulnerable'];?>">
    </fieldset>
    <fieldset class="mini_fieldset">
        <legend>Sells (Item ID List for merchants)</legend>
        <?php //todo ?>
        <input type="text" id="npcsell" value="<?php echo @$fetch['sell'];?>">
    </fieldset>
    <fieldset class="mini_fieldset">
        <legend>Dialog (ID)</legend>
        <input type="text" id="npcdialog" value="<?php
            echo @$fetch['dialog'];?>">
    </fieldset>
    <fieldset class="mini_fieldset">
        <legend>Hostile</legend>
        <input type="text" id="npchostile" value="<?php
            echo @$fetch['hostile'];?>">
    </fieldset>
    <fieldset class="mini_fieldset">
        <legend>AC</legend>
        <input type="text" id="npcac" value="<?php echo @$fetch['AC'];?>">
    </fieldset>
    <fieldset class="mini_fieldset">
        <legend>ATK</legend>
        <input type="text" id="npcatk" value="<?php echo @$fetch['ATK'];?>">
    </fieldset>
    <fieldset class="mini_fieldset">
        <legend>STR</legend>
        <input type="text" id="npcstr" value="<?php echo @$fetch['STR'];?>">
    </fieldset>
    <fieldset class="mini_fieldset">
        <legend>STA</legend>
        <input type="text" id="npcsta" value="<?php echo @$fetch['STA'];?>">
    </fieldset>
    <fieldset class="mini_fieldset">
        <legend>AGI</legend>
        <input type="text" id="npcagi" value="<?php echo @$fetch['AGI'];?>">
    </fieldset>
    <fieldset class="mini_fieldset">
        <legend>DEX</legend>
        <input type="text" id="npcdex" value="<?php echo @$fetch['DEX'];?>">
    </fieldset>
    <fieldset class="mini_fieldset">
        <legend>INT</legend>
        <input type="text" id="npcint" value="<?php echo @$fetch['INT'];?>">
    </fieldset>
    <fieldset class="mini_fieldset">
        <legend>WIS</legend>
        <input type="text" id="npcwis" value="<?php echo @$fetch['WIS'];?>">
    </fieldset>
    <fieldset class="mini_fieldset">
        <legend>CHA</legend>
        <input type="text" id="npccha" value="<?php echo @$fetch['CHA'];?>">
    </fieldset>
    <fieldset class="mini_fieldset">
        <legend>SVM</legend>
        <input type="text" id="npcsvm" value="<?php echo @$fetch['SVM'];?>">
    </fieldset>
    <fieldset class="mini_fieldset">
        <legend>SVF</legend>
        <input type="text" id="npcsvf" value="<?php echo @$fetch['SVF'];?>">
    </fieldset>
    <fieldset class="mini_fieldset">
        <legend>SVC</legend>
        <input type="text" id="npcsvc" value="<?php echo @$fetch['SVC'];?>">
    </fieldset>
    <fieldset class="mini_fieldset">
        <legend>SVP</legend>
        <input type="text" id="npcsvp" value="<?php echo @$fetch['SVP'];?>">
    </fieldset>
    <fieldset class="mini_fieldset">
        <legend>SVD</legend>
        <input type="text" id="npcsvd" value="<?php echo @$fetch['SVD'];?>">
    </fieldset>
    <input type="submit" class="submit" value="Save"
    onclick="saveNPC(<?php echo $fetch['id'];?>)">
<?php
        die();
    }

//end get handler
?>
<script>
    function NPCFilter()
    {
        var name = $('#npcfiltername').val();
        var level = $('#npcfilterlevel').val();
        var type = $('#npcfiltertype').val();
        $.ajax(
        {
            type: "GET",
            url: 'npcs.php',
            data:
            'npcfilter=1'+
            '&name='+name+
            '&level='+level+
            '&type='+type,
            success: function(data)
            {
                $('#npclist').html(data);
            }
        });   
    }

    function viewNPC(id)
    {
        $.ajax(
        {
            type: "GET",
            url: 'npcs.php',
            data:
            'viewnpc='+id,
            success: function(data)
            {
                $('#content').html(data);
            }
        });           
    }
    function deleteNPC(id)
    {
        $.ajax(
        {
            type: "GET",
            url: 'npcs.php',
            data:
            'deletenpc='+id,
            success: function(data)
            {
                if(data.length>7)
                {
                    alert(data);
                    return;
                }
                loadCategory('npcs');
            }
        });           
    }
    function saveNPC(id)
    {
        var name = $('#npcname').val();
        var type = $('#npctype').val();
        var description = $('#npcdescription').val();
        var level = $('#npclevel').val();
        var speed = $('#npcspeed').val();
        var weapondelay = $('#npcweapondelay').val();
        var abilities = $('#npcabilities').val();
        var abilityfreq = $('#npcabilityfreq').val();
        var viewrange = $('#npcviewrange').val();
        var xpbonus = $('#npcxpbonus').val();
        var loottable = $('#npcloottable').val();
        var social = $('#npcsocial').val();
        var hp = $('#npchp').val();
        var mp = $('#npcmp').val();
        var invulnerable = $('#npcinvulnerable').val();
        var sell = $('#npcsell').val();
        var dialog = $('#npcdialog').val();
        var hostile = $('#npchostile').val();
        var ac = $('#npcac').val();
        var atk = $('#npcatk').val();
        var str = $('#npcstr').val();
        var sta = $('#npcsta').val();
        var agi = $('#npcagi').val();
        var dex = $('#npcdex').val();
        var int = $('#npcint').val();
        var wis = $('#npcwis').val();
        var cha = $('#npccha').val();
        var svm = $('#npcsvm').val();
        var svf = $('#npcsvf').val();
        var svc = $('#npcsvc').val();
        var svp = $('#npcsvp').val();
        var svd = $('#npcsvd').val();
        var gfx = $('#npcgfx').val();
        var width = $('#npcwidth').val();
        var height = $('#npcheight').val();
        var hitbox = $('#npchitbox').val();
        $.ajax(
        {
            type: "GET",
            url: 'npcs.php',
            data:
            'savenpc='+id+
            '&name='+name+
            '&type='+type+
            '&desc='+description+
            '&level='+level+
            '&speed='+speed+
            '&weapondelay='+weapondelay+
            '&abilities='+abilities+
            '&abilityfreq='+abilityfreq+
            '&viewrange='+viewrange+
            '&xpbonus='+xpbonus+
            '&loottable='+loottable+
            '&social='+social+
            '&hp='+hp+
            '&mp='+mp+
            '&invulnerable='+invulnerable+
            '&sell='+sell+
            '&dialog='+dialog+
            '&hostile='+hostile+
            '&ac='+ac+
            '&atk='+atk+
            '&str='+str+
            '&sta='+sta+
            '&agi='+agi+
            '&dex='+dex+
            '&int='+int+
            '&wis='+wis+
            '&cha='+cha+
            '&svm='+svm+
            '&svf='+svf+
            '&svc='+svc+
            '&svp='+svp+
            '&svd='+svd+
            '&gfx='+gfx+
            '&width='+width+
            '&height='+height+
            '&hitbox='+hitbox,
            success: function(data)
            {
                if(data.length>7)
                {
                    alert(data);
                    return;
                }
                loadCategory('npcs');
                if(id==-1)
                    id=data;
                setTimeout(function(){ viewNPC(id); }, 100);
            }
        }); 
    }
</script>
<div id="shadow"></div>
<div id="cpanel">
    <fieldset style="width:250px">
        <legend>NPCS</legend>
        Search<br>
        
        Name:
        <input type="text" id="npcfiltername" onkeyup="NPCFilter()"><br>
        Level:
        <input type="text" id="npcfilterlevel" onkeyup="NPCFilter()"><br>
        Type:
        <input type="text" id="npcfiltertype" onkeyup="NPCFilter()"><br>
        <div id="npclist">
<?php
    $sql = "SELECT id, name, level FROM npctypes";
    $query = mysql_query($sql) or die(mysql_error());
    while($fetch = mysql_fetch_array($query))
    {
        echo '<div class="listentry" '.
             'onclick="viewNPC('.$fetch['id'].')">'.
             '<span class="listnum">'.$fetch['id'].'</span>'.
             '<span class="listname">'.$fetch['name'].'</span>'.
             '<span style="color:#ff9900"> Lvl: '.$fetch['level'].'</span>'.
             '</div>';   
    }

?>
        </div>
        <input type="submit" class="submit" value="New" onclick="viewNPC(-1)">
    </fieldset>
</div>
<div id="content"></div>
