<?php
    require_once("db.php");
    include("auth.php");

    //$exportID = 1;
    
    if( !@is_numeric($exportID) || @$exportID < 1 )
        die();


    $id = mysql_real_escape_string(trim($exportID));

    $sql = "SELECT * FROM zones WHERE id='".$id."'";
    $query = mysql_query($sql);
    $fetch = mysql_fetch_array($query);
    
    header("Content-type: image/png");
    $tileset = imagecreatefrompng("tileset.png");
    $output = imagecreatetruecolor(672, 400);


    $tmp = explode("|", substr($fetch['tiles'], 0, -1));

    $x=0;
    $y=0;
    foreach($tmp as $tile)
    {    
        $c = explode(",", $tile);
        //$c[0] += $x/16;
        //$c[0] = sin($x-$y);
        //$c[1] = cos($y+$x);
        imagecopy(
            $output, $tileset,
            $x*16, $y*16,
            $c[0]*16, $c[1]*16, 16, 16);
        $x++;
        if($x>41)
        {
            $x=0;
            $y++;
        }
    }

    $filename = $fetch['id'].$fetch['short_name'];
    imagepng($output, "../world/".$filename.".png");
    imagedestroy($output);
?>
