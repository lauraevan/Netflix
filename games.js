/* A working Netflix Games browse/detail surface for the mobile replica.
 * The browser preview does not pretend that native mobile games execute in HTML. */
(function(){
 "use strict";
 const catalog=[
  ["hades","Hades","Action • Roguelike","Battle your way out of the Underworld in this fast-paced action adventure.","1145360"],
  ["dead-cells","Dead Cells","Action • Adventure","Explore a sprawling world with fluid, challenging combat.","588650"],
  ["tmnt","TMNT: Shredder's Revenge","Action • Arcade","Retro-style beat-'em-up adventure with the Teenage Mutant Ninja Turtles.","1361510"],
  ["oxenfree","OXENFREE","Story • Mystery","Unravel a supernatural mystery in this story-driven adventure.","388880"],
  ["into-the-breach","Into the Breach","Strategy","Defend humanity using tactical turn-based battles.","590380"],
  ["monument-valley","Monument Valley","Puzzle","Explore impossible architecture in an atmospheric puzzle adventure.","1927720"]
 ];
 const esc=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
 const img=g=>"https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/"+g[4]+"/header.jpg";
 function render(selectedId){
  const selected=catalog.find(g=>g[0]===selectedId);
  if(selected)return '<section class="m-game-detail"><button class="m-game-back" data-m-action="gamesBack" aria-label="Back">‹</button><div class="m-game-detail-art"><img src="'+img(selected)+'" alt="" onerror="this.hidden=true"></div><div class="m-game-detail-body"><img class="m-game-brand" src="assets/netflix-n.svg" alt="Netflix"><span class="m-game-type">GAMES</span><h1>'+esc(selected[1])+'</h1><p class="m-game-genre">'+esc(selected[2])+'</p><p>'+esc(selected[3])+'</p><div class="m-game-note">Available with Netflix on supported mobile devices.</div><button class="m-game-primary" data-m-action="gamesBack">Back to Games</button></div></section>';
  return '<div class="m-page m-game-page"><header class="m-games-header"><h1>Games</h1><img src="assets/netflix-n.svg" alt="Netflix"></header><div class="m-game-intro"><span class="m-game-kicker">NETFLIX GAMES</span><h2>Fun starts here.</h2><p>Games for every mood.</p></div>'+
   '<div class="m-game-feature"><img src="'+img(catalog[0])+'" alt="" onerror="this.hidden=true"><div class="m-game-feature-shade"></div><div class="m-game-feature-text"><small>FEATURED</small><h2>Hades</h2><p>Action • Roguelike</p><button data-m-game="hades">Explore Game ›</button></div></div>'+
   '<div class="m-game-row"><h2>Explore Games</h2><div class="m-game-cards">'+catalog.map(g=>'<button class="m-game-card" data-m-game="'+g[0]+'"><span class="m-game-thumb"><span class="m-game-thumb-fallback">'+esc(g[1])+'</span><img src="'+img(g)+'" alt="" loading="lazy" onerror="this.hidden=true"></span><b>'+esc(g[1])+'</b><small>'+esc(g[2])+'</small></button>').join("")+'</div></div>'+
   '<p class="m-game-footnote">Games require compatible mobile devices. Browser game playback is not supported in this beta.</p></div>';
 }
 window.NetflixGames={render};
}());