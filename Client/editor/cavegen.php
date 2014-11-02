<?php
    require_once("db.php");
    //include("auth.php");

    
    header("Content-type: image/png");
    $tileset = imagecreatefrompng("tileset.png");
    $output = imagecreatetruecolor(672, 400);


    for($ix=0;$ix<2;$ix++)
    {


    for($y=0; $y<25; $y++)
    {
        for($x=0; $x<42; $x++)
        {
            imagecopy(
                $output, $tileset,
                $x*16, $y*16,
                0*16, 2*16, 16, 16);
            $grid[$x][$y] = "void";
        }
    }



    $ff = rand(50,100);
    for($i=0;$i<$ff;$i++)
    {
        $x = rand(0,41);
        $y = rand(0,24);
        for($sy=-2;$sy<2;$sy++)
        {
            for($sx=-2;$sx<2;$sx++)
            {
                $grid[$x+$sx][$y+$sy] = "floor";
            }
        }
    }


    for($i=0;$i<3;$i++)
    {

        for($y=0; $y<25; $y++)
        {
            for($x=0; $x<42; $x++)
            {
                if( @$grid[$x][$y] == "void" )
                {
                    if( @$grid[$x-1][$y] == "floor" &&
                        //@$grid[$x+1][$y] == "floor" &&
                        //@$grid[$x][$y-1] == "floor" &&
                        @$grid[$x][$y+1] == "floor")
                    {
                        @$grid[$x][$y] = "floor";
                    }
                }
            }
        }
    }


    for($i=0;$i<5;$i++)
    {
        for($y=0; $y<25; $y++)
        {
            for($x=0; $x<42; $x++)
            {
                if( @$grid[$x][$y] == "void" )
                {
                    if(@$grid[$x][$y+1] == "floor")
                    {
                        @$grid[$x][$y] = "topwall";
                    } 
                    if(@$grid[$x][$y-1] == "floor")
                    {
                        @$grid[$x][$y] = "botwall";
                    }
                    if(@$grid[$x][$y+1] == "leftwall")
                    {
                        @$grid[$x][$y] = "left";
                    } 
                    if(@$grid[$x][$y+1] == "rightwall")
                    {
                        @$grid[$x][$y] = "right";
                    }
                    if(@$grid[$x+1][$y] == "floor")
                    {
                        @$grid[$x][$y] = "right";
                    } 
                    if(@$grid[$x-1][$y] == "floor")
                    {
                        @$grid[$x-1][$y] = "left";
                    } 

                    if(@$grid[$x][$y-1] == "right" &&
                        @$grid[$x+1][$y] == "botwall"
                    )
                    {
                        @$grid[$x][$y] = "trcornerpiece";
                    } 

                    if(@$grid[$x][$y-1] == "left" &&
                        @$grid[$x-1][$y] == "botwall"
                    )
                    {
                        @$grid[$x][$y] = "tlcornerpiece";
                    } 


                    if(@$grid[$x+1][$y] == "topwall" &&
                        @$grid[$x][$y+1] == "right"
                    )
                    {
                        @$grid[$x][$y] = "rightcon";
                    } 

                    if(@$grid[$x+1][$y] == "trightcorner" &&
                        @$grid[$x][$y-1] == "right"
                    )
                    {
                        @$grid[$x][$y] = "trcornerpiece";
                    } 

                    if(@$grid[$x+1][$y] == "rightwall" &&
                        @$grid[$x][$y+1] == "right"
                    )
                    {
                        @$grid[$x][$y] = "rightcon";
                    } 

                    if(@$grid[$x][$y-1] == "tleftcorner" &&
                        @$grid[$x-1][$y] == "tleftcorner"
                    )
                    {
                        @$grid[$x][$y] = "tlcornerpiece";
                    } 
   


                }
                if( @$grid[$x][$y] == "right" )
                {

                    if(@$grid[$x+1][$y] == "void")
                    {
                        @$grid[$x][$y] = "void";
                    } 

                    if(@$grid[$x+1][$y] == "rightwall")
                    {
                        @$grid[$x][$y] = "rightcon";
                    } 

                    if(@$grid[$x][$y+1] == "floor")
                    {
                        @$grid[$x][$y] = "topwall";
                    }

                    if(@$grid[$x][$y-1] == "floor")
                    {
                        @$grid[$x][$y] = "trightcorner";
                    } 

                    if(@$grid[$x][$y-1] == "rightwall")
                    {
                        @$grid[$x][$y-1] = "right";
                    } 


                    if(@$grid[$x+1][$y] == "topwall")
                    {
                        @$grid[$x][$y] = "rightcon";
                    } 
                    if(@$grid[$x-1][$y] == "botwall")
                    {
                        @$grid[$x][$y] = "trightcorner";
                    } 
                    if(@$grid[$x][$y+1] == "topwall")
                    {
                        @$grid[$x][$y+1] = "rightwall";
                    } 
                     if(@$grid[$x+1][$y] == "right")
                    {
                        @$grid[$x][$y] = "void";
                    }
                      if(@$grid[$x+1][$y] == "rightcon")
                    {
                        @$grid[$x][$y] = "void";
                    }


                    if(@$grid[$x+1][$y] == "floor" &&
                        @$grid[$x+1][$y+1] == "botwall"
                    )
                    {
                        @$grid[$x][$y+1] = "trcornerpiece";
                    } 
                }
                if( @$grid[$x][$y] == "leftcon" )
                {
                    if(@$grid[$x-1][$y] == "left")
                    {
                        @$grid[$x][$y] = "void";
                    }
                    if(@$grid[$x+1][$y] == "floor")
                    {
                        @$grid[$x][$y] = "right";
                    }
                }
                if( @$grid[$x][$y] == "tleftcorner" )
                {
                    if(@$grid[$x+1][$y] == "leftwall")
                    {
                        @$grid[$x][$y] = "floor";
                    }
                    if(@$grid[$x+1][$y] == "void" && 
                       @$grid[$x+1][$y-1] == "left"
                    )
                    {
                        @$grid[$x+1][$y] = "tlcornerpiece";
                    }
                    
                    if(@$grid[$x-1][$y] == "floor" &&
                       @$grid[$x][$y+1] == "floor"
                    )
                    {
                        @$grid[$x][$y] = "floor";
                    }
                }
                if( @$grid[$x][$y] == "tlcornerpiece" )
                {
                    if(@$grid[$x][$y+1] == "floor")
                    {
                        @$grid[$x][$y+1] = "topwall";
                    }

                    if(@$grid[$x+1][$y] == "topwall" &&
                       @$grid[$x][$y+1] == "rightwall"
                    )
                    {
                        @$grid[$x][$y] = "tlcornerpiecem";
                    }
                    if(@$grid[$x+1][$y] == "rightwall" &&
                       @$grid[$x][$y+1] == "rightwall"
                    )
                    {
                        @$grid[$x][$y] = "tlcornerpiecem";
                    }
                    if(@$grid[$x+1][$y] == "topwall" &&
                       @$grid[$x][$y+1] == "right"
                    )
                    {
                        @$grid[$x][$y] = "tlcornerpiecem";
                    }

                    if(@$grid[$x+1][$y] == "rightwall" &&
                       @$grid[$x][$y+1] == "right"
                    )
                    {
                        @$grid[$x][$y] = "tlcornerpiecem";
                    }

                    if(@$grid[$x-1][$y] == "floor" &&
                       @$grid[$x][$y-1] == "left"
                    )
                    {
                        @$grid[$x][$y] = "left";
                    }

                }
                if( @$grid[$x][$y] == "trcornerpiece" )
                {
                    if(@$grid[$x][$y-1] == "floor")
                    {
                        @$grid[$x][$y] = "botwall";
                        @$grid[$x-1][$y] = "trcornerpiece";
                    }
                    if(@$grid[$x-1][$y] == "topwall" &&
                       @$grid[$x][$y+1] == "left"
                    )
                    {
                        @$grid[$x][$y] = "trcornerpiecem";
                    }
                }
                if( @$grid[$x][$y] == "trightcorner" )
                {

                    if(@$grid[$x-1][$y] == "void" &&
                       @$grid[$x-1][$y-1] == "trightcorner"
                    )
                    {
                        @$grid[$x][$y] = "botwall";
                        @$grid[$x-1][$y] = "trcornerpiece";
                    }


                    if(@$grid[$x+1][$y] == "floor" &&
                       @$grid[$x][$y+1] == "floor"
                    )
                    {
                        @$grid[$x][$y] = "floor";
                    }



                    if(
                        @$grid[$x+1][$y] == "trightcorner"
                    )
                    {
                        @$grid[$x][$y] = "botwall";
                    }
                    if(
                        @$grid[$x-1][$y] == "trightcorner"
                    )
                    {
                        @$grid[$x][$y] = "botwall";
                    }
                }
                if( @$grid[$x][$y] == "left" )
                {

                    if(@$grid[$x][$y-1] == "floor")
                    {
                        @$grid[$x][$y] = "tleftcorner";
                    } 

                    if(@$grid[$x-1][$y] == "leftwall")
                    {
                        @$grid[$x][$y] = "leftcon";
                    } 

                    if(@$grid[$x-1][$y] == "tlcornerpiece")
                    {
                        @$grid[$x][$y] = "void";
                    } 

                    if(@$grid[$x-1][$y] == "void")
                    {
                        @$grid[$x][$y] = "void";
                    } 

                    if(@$grid[$x][$y-1] == "floor" &&
                        @$grid[$x+1][$y-1] == "left"
                    )
                    {
                        @$grid[$x][$y] = "tleftcorner";
                    } 

                    if(@$grid[$x-1][$y] == "tleftcorner" &&
                        @$grid[$x][$y-1] == "left"
                    )
                    {
                        @$grid[$x][$y] = "tlcornerpiece";
                    } 


                    if(@$grid[$x-1][$y] == "left")
                    {
                        @$grid[$x][$y] = "void";
                    }
                    if(@$grid[$x-1][$y] == "leftcon")
                    {
                        @$grid[$x][$y] = "void";
                    }


                    if(@$grid[$x-1][$y] == "topwall")
                    {
                        @$grid[$x][$y] = "leftcon";
                    }
                   if(@$grid[$x+1][$y] == "botwall")
                    {
                        @$grid[$x][$y] = "tleftcorner";
                    }
                    if(@$grid[$x+1][$y] == "topwall" &&
                        @$grid[$x][$y-1] == "left"
                    )
                    {
                        @$grid[$x][$y] = "leftwall";
                    } 

                    if(@$grid[$x+1][$y] == "right" &&
                        @$grid[$x][$y+1] == "floor"
                    )
                    {
                        @$grid[$x][$y] = "blcornerpiece";
                        @$grid[$x+1][$y] = "brcornerpiece";
                    }    
                }



                if( @$grid[$x][$y] == "botwall" )
                {
                    if( @$grid[$x][$y+1] == "floor" )
                    {
                        @$grid[$x][$y+1] = "topwall";
                    }

                    if( @$grid[$x][$y+1] == "right" )
                    {
                        @$grid[$x][$y] = "trightcorner";
                    }


                    if( @$grid[$x][$y+1] == "rightwall" )
                    {
                        @$grid[$x][$y] = "trightcorner";
                    }

                    if( @$grid[$x][$y+1] == "rightwall" && 
                        @$grid[$x+1][$y] == "topwall"
                    )
                    {
                        @$grid[$x][$y] = "rightcon";
                    }

                    if( @$grid[$x][$y+1] == "leftwall" && 
                        @$grid[$x-1][$y] == "topwall"
                    )
                    {
                        @$grid[$x][$y] = "leftcon";
                    }
                    if( @$grid[$x-1][$y] == "void" && 
                        @$grid[$x-1][$y-1] == "trightcorner"
                    )
                    {
                        @$grid[$x][$y] = "trcornerpiece";
                    }

                    if( @$grid[$x-1][$y] == "floor"
                    )
                    {
                        @$grid[$x][$y] = "left";
                    }

                }
                if( @$grid[$x][$y] == "leftwall" )
                {
                    if( @$grid[$x+1][$y] == "right" )
                    {
                        @$grid[$x+1][$y] = "rightwall";
                    }
                    if( @$grid[$x-1][$y] == "left" )
                    {
                        @$grid[$x-1][$y] = "leftwall";
                        @$grid[$x][$y] = "topwall";
                    }
                    if( @$grid[$x][$y-1] == "trcornerpiece" )
                    {
                        @$grid[$x][$y] = "topwall";
                        @$grid[$x-1][$y] = "leftwall";
                        @$grid[$x-1][$y-1] = "left";
                    }
                    if(@$grid[$x-1][$y] == "void")
                    {
                        @$grid[$x][$y] = "void";
                    }

                    if(@$grid[$x][$y-1] == "left" &&
                       @$grid[$x][$y+1] == "left"
                    )
                    {
                        @$grid[$x][$y] = "left";
                    } 
                }

                if( @$grid[$x][$y] == "rightwall" )
                {
                    if( @$grid[$x-1][$y] == "left" )
                    {
                        @$grid[$x-1][$y] = "leftwall";
                    }
                    if( @$grid[$x+1][$y] == "right" )
                    {
                        @$grid[$x+1][$y] = "rightwall";
                        @$grid[$x][$y] = "topwall";
                    }
                    if( @$grid[$x][$y+1] == "leftwall" )
                    {
                        @$grid[$x][$y] = "leftcon";
                    }
                    if( @$grid[$x][$y+1] == "rightwall" )
                    {
                        @$grid[$x][$y] = "rightcon";
                    }
                    if( @$grid[$x+1][$y] == "rightwall" )
                    {
                        @$grid[$x][$y] = "topwall";
                    }
                }

                   
                if( @$grid[$x][$y] == "topwall" )
                {
                    if( @$grid[$x+1][$y] == "floor" )
                    {
                        @$grid[$x][$y] = "rightwall";
                    }
                    if( @$grid[$x+1][$y] == "right" )
                    {
                        @$grid[$x][$y] = "rightwall";
                    }

                    if( @$grid[$x-1][$y] == "left" )
                    {
                        @$grid[$x][$y] = "leftwall";
                    }


                    if( @$grid[$x-1][$y] == "floor" )
                    {
                        @$grid[$x-1][$y] = "leftwall";
                    }
                    if( @$grid[$x][$y+1] == "topwall" || 
                        @$grid[$x][$y+1] == "leftwall" ||
                        @$grid[$x][$y+1] == "rightwall"
                    )
                    {
                        @$grid[$x][$y] = "void";
                    }

                    if( @$grid[$x][$y+1] == "left" && 
                        @$grid[$x-1][$y] == "topwall"
                    )
                    {
                        @$grid[$x][$y] = "leftcon";
                    }

                    if( @$grid[$x-1][$y] == "leftwall" && 
                        @$grid[$x][$y+1] == "left"
                    )
                    {
                        @$grid[$x][$y] = "leftcon";
                    }
                } 
            }
        }

    }
    

    for($y=0; $y<25; $y++)
    {
        for($x=0; $x<42; $x++)
        {
            if( @$grid[$x][$y] == "floor" )
            {
                imagecopy(
                $output, $tileset,
                $x*16, $y*16,
                0*16, 3*16, 16, 16);
            }
            if( @$grid[$x][$y] == "topwall" )
            {
                imagecopy(
                $output, $tileset,
                $x*16, $y*16,
                0*16, 4*16, 16, 16);
            }
            if( @$grid[$x][$y] == "botwall" )
            {
                imagecopy(
                $output, $tileset,
                $x*16, $y*16,
                3*16, 5*16, 16, 16);
            }
            if( @$grid[$x][$y] == "rightwall" )
            {
                imagecopy(
                $output, $tileset,
                $x*16, $y*16,
                2*16, 5*16, 16, 16);
            }
            if( @$grid[$x][$y] == "leftwall" )
            {
                imagecopy(
                $output, $tileset,
                $x*16, $y*16,
                2*16, 6*16, 16, 16);
            }
            if( @$grid[$x][$y] == "left" )
            {
                imagecopy(
                $output, $tileset,
                $x*16, $y*16,
                1*16, 3*16, 16, 16);
            }
            if( @$grid[$x][$y] == "right" )
            {
                imagecopy(
                $output, $tileset,
                $x*16, $y*16,
                2*16, 3*16, 16, 16);
            }
            if( @$grid[$x][$y] == "leftcon" )
            {
                imagecopy(
                $output, $tileset,
                $x*16, $y*16,
                6*16, 2*16, 16, 16);
            }
            if( @$grid[$x][$y] == "rightcon" )
            {
                imagecopy(
                $output, $tileset,
                $x*16, $y*16,
                1*16, 5*16, 16, 16);
            }

            if( @$grid[$x][$y] == "trightcorner" )
            {
                imagecopy(
                $output, $tileset,
                $x*16, $y*16,
                1*16, 2*16, 16, 16);
            }

            if( @$grid[$x][$y] == "tleftcorner" )
            {
                imagecopy(
                $output, $tileset,
                $x*16, $y*16,
                3*16, 4*16, 16, 16);
            }

            if( @$grid[$x][$y] == "trcornerpiece" )
            {
                imagecopy(
                $output, $tileset,
                $x*16, $y*16,
                0*16, 5*16, 16, 16);
            }

            if( @$grid[$x][$y] == "tlcornerpiece" )
            {
                imagecopy(
                $output, $tileset,
                $x*16, $y*16,
                4*16, 5*16, 16, 16);
            }



            if( @$grid[$x][$y] == "trcornerpiecem" )
            {
                imagecopy(
                $output, $tileset,
                $x*16, $y*16,
                0*16, 1*16, 16, 16);
            }

            if( @$grid[$x][$y] == "tlcornerpiecem" )
            {
                imagecopy(
                $output, $tileset,
                $x*16, $y*16,
                1*16, 1*16, 16, 16);
            }
            

            if( @$grid[$x][$y] == "brcornerpiece" )
            {
                imagecopy(
                $output, $tileset,
                $x*16, $y*16,
                5*16, 2*16, 16, 16);
            }

            if( @$grid[$x][$y] == "blcornerpiece" )
            {
                imagecopy(
                $output, $tileset,
                $x*16, $y*16,
                2*16, 2*16, 16, 16);
            }

        }
    }

    
    imagepng($output/*, "gen/s".$ix.".png"*/);

    
    }
    imagedestroy($output);
?>

