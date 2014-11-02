<script>
var singled = 0, doubled = 0;

for(i=0; i<100;i++)
{
  var a = Math.floor(Math.random()*20);
  singled+=a;
  var b = Math.floor(Math.random()*8);
  var c = Math.floor(Math.random()*12);
  doubled+=b;
  doubled+=c;
}
document.write("single: "+singled+", double: "+doubled);
</script>