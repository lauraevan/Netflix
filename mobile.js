/* Mobile Netflix app interface. Shares the exact catalog, profiles, lists, and playback with app.js. */
(function(){
 "use strict";
 var source=window.NetflixUI, root=document.getElementById("mobileRoot");
 if(!source||!root)return;
 var screen={tab:"home",filter:"all",news:"coming",search:"",heroIndex:0,upcoming:[],ready:false,gameTab:"mobile"};
 var spotlight={id:1093971,type:"movie",name:"Srikanth",year:2024,age:"TV-14",rating:7.6,language:"hi",genres:"Inspiring, Drama, Based on Real Life",poster:"",backdrop:"",overview:"A visually impaired man overcomes extraordinary obstacles in education and business in this inspiring true story.",featureImage:"assets/srikanth-reference.webp"}; 
 source.addItems([spotlight]);
 var IMG="https://image.tmdb.org/t/p/";
 var $=function(id){return document.getElementById(id);};
 function esc(s){return String(s==null?"":s).replace(/[&<>"']/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];});}
 function icon(name){return '<svg class="icon" aria-hidden="true"><use href="#'+name+'"/></svg>';}
 function localKey(item){return source.key(item);}
 function image(item,kind){if(item.featureImage)return item.featureImage;return source.safeImage((kind==="poster"?item.poster:item.backdrop||item.poster),kind==="poster"?"w500":"w780");}
 function items(){return Array.from(source.catalog.values());}
 function unique(list){var used=new Set();return (list||[]).filter(function(x){if(!x)return false;var id=localKey(x);if(used.has(id))return false;used.add(id);return true;});}
 function profile(){return source.getProfiles().find(function(x){return x.id===source.state.profile;})||{name:"Netflix",color:"blue"};}
 function face(){var avatarIndex=Math.max(0,Math.min(6,Number(profile().avatar)||0));return '<span class="m-avatar avatar-art" style="background-position:'+(avatarIndex*100/6).toFixed(5)+'% center" aria-label="'+esc(profile().name)+' avatar"></span>';}
 function featureItems(){var all=items();var tv=all.filter(function(x){return x.type==="tv";}), movies=all.filter(function(x){return x.type==="movie";});
  if(screen.filter==="tv")return unique([].concat(source.state.live.netflixTv||[],tv));
  if(screen.filter==="movie")return unique([].concat(source.state.live.movies||[],movies));
  return unique([source.catalog.get("movie:1093971"),source.catalog.get("tv:66732"),source.catalog.get("tv:119051"),source.catalog.get("tv:93405")].concat(source.state.live.netflixTv||[],all));
 }
 function selectedFeature(){var opts=featureItems();return opts[screen.heroIndex%Math.max(opts.length,1)]||items()[0];}
 function poster(item,index,extra){var path=image(item,screen.tab==="home"?"backdrop":"poster"),tag=extra==="rank"?'<span class="m-poster-rank">'+(index+1)+'</span>':extra==="progress"?'<span class="m-mini-progress"></span>':"";
  return '<button class="m-poster'+(extra==="rank"?" m-ranked-poster":"")+'" data-m-open="'+esc(localKey(item))+'" aria-label="Details for '+esc(item.name)+'"><span class="m-poster-placeholder">'+esc(item.name)+'</span>'+(path?'<img loading="lazy" src="'+esc(path)+'" alt="" onerror="this.style.display=&quot;none&quot;">':"")+tag+'</button>';
 }
 function shelf(title,list,extra){var set=unique(list).slice(0,20);if(!set.length)return "";return '<section class="m-shelf"><div class="m-shelf-heading"><h2>'+esc(title)+'</h2><button class="m-shelf-next" data-m-shelf="1" aria-label="Scroll '+esc(title)+'">'+icon("right")+'</button></div><div class="m-shelf-items">'+set.map(function(item,i){return poster(item,i,extra||"");}).join("")+'</div></section>';}
 function topHeader(title){
   var logo='<img class="m-netflix-n" src="assets/netflix-n.svg" alt="Netflix">';
   return '<header class="m-header"><div class="m-headrow"><div class="'+(title?'m-headtitle':'m-wordmark')+'">'+(title?esc(title):logo)+'</div><div class="m-headright"><button class="m-header-btn" data-m-action="search" aria-label="Search">'+icon("search")+'</button></div></div></header>';
 }
 function tabs(){var parts=[
 ["home","Home",'<path d="m3 11 9-8 9 8v10h-7v-7h-4v7H3Z"/>'],
 ["games","Games",'<rect x="3" y="8" width="18" height="11" rx="5"/><path d="M7 13h5m-2.5-2.5v5M16 12h.1M18 15h.1"/>'],
 ["hot","New & Hot",'<rect x="4" y="5" width="16" height="15" rx="2"/><path d="m10 9 6 3.5-6 3.5V9Z"/><path d="M7 2h10"/>'],
 ["my","My Netflix",null]
 ];
 return '<nav class="m-bottom" aria-label="Netflix mobile navigation">'+parts.map(function(p){var glyph=(p[0]==="home"&&screen.tab==="home")?'<path d="m3 11 9-8 9 8v10h-7v-7h-4v7H3Z" fill="currentColor" stroke="none"/>':p[2];var symbol=glyph?'<svg viewBox="0 0 24 24" class="icon" aria-hidden="true" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round" fill="none">'+glyph+'</svg>':face();return '<button class="m-tab'+(screen.tab===p[0]?" active":"")+'" data-m-tab="'+p[0]+'" aria-current="'+(screen.tab===p[0]?"page":"false")+'">'+symbol+'<span>'+p[1]+'</span></button>';}).join("")+'</nav>';
 }
 function home(){var feature=selectedFeature();if(!feature)return "";var all=items(),shows=all.filter(function(x){return x.type==="tv";}),movies=all.filter(function(x){return x.type==="movie";});
 var curated=unique([].concat(source.state.live.trending||[],source.state.live.netflixTv||[],shows,movies));
 var continueItems=source.state.recent.map(function(k){return source.catalog.get(k);}).filter(Boolean);
 var featPoster=feature.featureImage||image(feature,"poster");
 var isListed=source.state.lists.has(localKey(feature));
 var tagNames=typeof feature.genres==="string"?feature.genres.split(","):Array.isArray(feature.genres)?feature.genres.map(function(g){return typeof g==="string"?g:g.name;}):[];
 var tags=tagNames.filter(Boolean).slice(0,3);if(!tags.length)tags=feature.type==="tv"?["Mystery","Drama","Thrilling"]:["Drama","Cinematic","Immersive"];
 var nav='<div class="m-filterbar"><button class="m-filter'+(screen.filter==="tv"?" active":"")+'" data-m-filter="tv">TV Shows</button><button class="m-filter'+(screen.filter==="movie"?" active":"")+'" data-m-filter="movie">Movies</button><button class="m-filter" data-m-action="categories">Categories '+icon("down")+'</button></div>';
 var card='<div class="m-feature" aria-label="Featured: '+esc(feature.name)+'"><div class="m-feature-backup"></div>'+(featPoster?'<img class="m-feature-img" src="'+esc(featPoster)+'" alt="" fetchpriority="high" onerror="this.style.display=&quot;none&quot;">':"")+
 '<div class="m-feature-top">'+(feature.type==="tv"?'<img class="m-card-n" src="assets/netflix-n.svg" alt=""> SERIES':"")+'</div>'+
 '<div class="m-feature-bottom">'+(source.state.heroLogo&&source.state.hero&&localKey(feature)===localKey(source.state.hero)?'<img class="m-feature-logo" src="'+esc(source.state.heroLogo)+'" alt="'+esc(feature.name)+'">':'<h1 class="m-feature-title">'+esc(feature.name)+'</h1>')+'<div class="m-feature-rank"><span class="m-rank-symbol">TOP<br>10</span> #'+(feature.id===1093971?3:screen.heroIndex+1)+' in '+(feature.type==="tv"?"TV Shows":"Movies")+' Today</div><p class="m-feature-tags">'+tags.map(esc).join('<b>•</b>')+'</p>'+
 '<div class="m-feature-actions"><button class="m-cta m-cta-play" data-m-play="'+esc(localKey(feature))+'">'+icon("play")+' Play</button><button class="m-cta m-cta-list" data-m-add="'+esc(localKey(feature))+'">'+icon(isListed?"check":"plus")+' My List</button></div></div></div>';
 var indicators='<div class="m-feature-indicators">'+[0,1,2,3,4].map(function(i){return '<i class="'+(screen.heroIndex%5===i?"active":"")+'"></i>';}).join("")+'</div>';
 var shown=screen.filter==="tv"?shows:screen.filter==="movie"?movies:screen.filter==="korean"?curated.filter(function(x){return x.language==="ko";}):screen.filter==="spanish"?curated.filter(function(x){return x.language==="es";}):screen.filter==="anime"?curated.filter(function(x){return /animation|anime/i.test(x.genres||"");}):curated;
 var blocks=shelf("Your Next Watch",shown)+shelf("Trending Now",source.state.live.trending||curated)+shelf("Top 10 in the U.S. Today",source.state.live.tv||shows,"rank");
 if(continueItems.length)blocks+=shelf("Continue Watching for "+profile().name,continueItems,"progress");
 blocks+=shelf(source.state.live.netflixTv?"Only on Netflix":"Series to Binge",source.state.live.netflixTv||shows)+shelf("Popular Films",source.state.live.movies||movies);
 return '<div class="m-page m-page-home">'+topHeader("")+'<div class="m-header m-filterheader" style="padding-top:0">'+nav+'</div>'+card+'<div class="m-content">'+blocks+'</div></div>';
 }
 function releaseDate(item){var date=item.release_date||item.first_air_date||"";if(!/^\d{4}-\d\d-\d\d$/.test(date))return null;var d=new Date(date+"T12:00:00Z");return Number.isNaN(d.getTime())?null:d;}
 function hot(){var featuredHot=[source.catalog.get("tv:66732"),source.catalog.get("tv:119051"),source.catalog.get("tv:93405"),source.catalog.get("tv:94605")].filter(Boolean);
  var list=screen.news==="coming"?(screen.upcoming.length?screen.upcoming:unique([].concat(featuredHot,source.state.live.trending||[],items()))):screen.news==="watching"?unique([].concat(featuredHot,source.state.live.trending||[],items())):unique([].concat(source.state.live.tv||[],source.state.live.movies||[],items())).slice(0,10);
  var buttons=[["coming","Coming Soon"],["watching","Everyone's Watching"],["top","Top 10"]];
  var sub='<div class="m-subtabs">'+buttons.map(function(p){return '<button class="m-subtab'+(screen.news===p[0]?" active":"")+'" data-m-news="'+p[0]+'">'+esc(p[1])+'</button>';}).join("")+'</div>';
  var entries=list.slice(0,14).map(function(item,i){var d=screen.upcoming.includes(item)?releaseDate(item):null,mon=d?d.toLocaleDateString("en-US",{month:"short",timeZone:"UTC"}).toUpperCase():"NOW",day=d?String(d.getUTCDate()).padStart(2,"0"):"•";
   var cover=image(item,"backdrop"),posterCover=image(item,"poster"),subtitle=d?"Coming "+d.toLocaleDateString("en-US",{month:"long",day:"numeric",timeZone:"UTC"}):"Now Streaming";
   var remindKey=localKey(item),reminders=new Set(readReminders()),remind=reminders.has(remindKey);
   return '<article class="m-release"><div class="m-release-date">'+esc(mon)+'<strong>'+esc(day)+'</strong></div><div>'+
     '<button class="m-release-cover" data-m-open="'+esc(remindKey)+'" aria-label="View '+esc(item.name)+'"><span class="m-trailer-placeholder">'+esc(item.name)+'</span><img class="m-preview-n" src="assets/netflix-n.svg" alt=""><span class="m-trailer-label">PREVIEW</span>'+(cover||posterCover?'<img src="'+esc(cover||posterCover)+'" data-fallback="'+esc(posterCover)+'" loading="lazy" alt="" onerror="this.onerror=null;this.dataset.fallback?this.src=this.dataset.fallback:this.style.display=&quot;none&quot;">':"")+'<span class="m-trailer-play">'+icon("play")+'</span></button>'+
     '<div class="m-release-details"><div class="m-release-title-row"><h2 class="m-release-title">'+esc(item.name)+'</h2><div class="m-release-actions"><button class="m-small-action" data-m-remind="'+esc(remindKey)+'">'+icon(remind?"check":"bell")+'<span>'+(remind?"Reminded":"Remind Me")+'</span></button><button class="m-small-action" data-m-open="'+esc(remindKey)+'">'+icon("info")+'<span>Info</span></button></div></div>'+
     '<p class="m-release-soon">'+esc(subtitle)+'</p><p class="m-release-overview">'+esc((item.overview||"").slice(0,225))+'</p><p class="m-release-tags">'+esc(item.type==="tv"?"Series":"Film")+' · '+esc(item.language||"English")+' · '+esc(item.year||"Netflix")+'</p></div></div></article>';
  }).join("");
  var empty=screen.news==="coming"&&!screen.ready?'Loading upcoming titles…':"No titles available right now.";
  return '<div class="m-page m-tabpage">'+topHeader("New & Hot")+sub+(entries||'<div class="m-empty m-coming-empty">'+esc(empty)+'</div>')+'</div>';
 }
 function primeSpotlight(){
  if(!source.state.profile)return;
  source.api("/movie/1093971").then(function(raw){
   if(!raw||!raw.id)return;var x=source.normalize(raw,"movie");if(!x)return;
   source.addItems([Object.assign({},x,{featureImage:spotlight.featureImage,genres:spotlight.genres,age:"TV-14"})]);
   if(screen.tab==="home")render();
  }).catch(function(){});
 }
 setTimeout(primeSpotlight,0);
 function readReminders(){try{return JSON.parse(localStorage.getItem("nf-reminders-"+source.state.profile)||"[]");}catch(e){return [];}}
 function toggleReminder(key){var set=new Set(readReminders());if(set.has(key))set.delete(key);else set.add(key);localStorage.setItem("nf-reminders-"+source.state.profile,JSON.stringify(Array.from(set)));source.persist();render();}
 function myNetflix(){var watched=source.state.recent.map(function(k){return source.catalog.get(k);}).filter(Boolean),favorites=Array.from(source.state.lists).map(function(k){return source.catalog.get(k);}).filter(Boolean);
 return '<div class="m-page m-myn-page"><div class="m-myn-top"><span class="m-myn-title">My Netflix</span><div class="m-headright"><button class="m-header-btn" data-m-action="search" aria-label="Search">'+icon("search")+'</button><button class="m-header-btn" data-m-action="changeProfile" aria-label="Manage profiles">'+icon("pencil")+'</button></div></div>'+
 '<div class="m-myn-profile">'+face()+'<div><b>'+esc(profile().name)+'</b><p>Switch profiles and manage your favorites</p></div></div>'+
 '<button class="m-service-row" data-m-action="notification"><span class="m-service-icon">'+icon("bell")+'</span><span><b>Notifications</b><small>You are all caught up</small></span></button>'+
 '<button class="m-service-row" data-m-action="mylist"><span class="m-service-icon">'+icon("check")+'</span><span><b>My List</b><small>'+favorites.length+' saved titles</small></span></button>'+
 (watched.length?shelf("Continue Watching",watched,"progress"):"")+
 (favorites.length?shelf("My List",favorites):'<div class="m-empty">Add shows and movies to My List to find them here.</div>')+
 shelf("Recommended for You",items().slice(0,15))+'</div>';
 }
 function games(){return '<div class="m-page m-tabpage">'+topHeader("Games")+'<div class="m-empty" style="padding:80px 28px"><strong style="display:block;color:#fff;font-size:23px;margin-bottom:14px">Netflix Games</strong>Games are not part of this browser beta yet. Home, New & Hot, My Netflix, and EvanPlayer are ready to explore.</div></div>';}
 function searchPage(){return '<div class="m-page m-search-page"><div class="m-search-form"><label class="m-search-wrap">'+icon("search")+'<input id="mSearchInput" type="search" autocomplete="off" placeholder="Search games, shows, movies" aria-label="Search Netflix"></label><button class="m-search-cancel" data-m-action="searchBack">Cancel</button></div><h2 class="m-search-heading">Top Searches</h2><div id="mSearchResults"></div></div>';}
 function searchResults(){var x=$("mSearchResults");if(!x)return;var query=screen.search.trim().toLowerCase();var found=items().filter(function(item){return !query||(item.name+" "+item.overview+" "+item.genres).toLowerCase().includes(query);}).slice(0,60);
 x.innerHTML=found.length?'<div class="m-grid">'+found.map(function(item,i){return poster(item,i,"");}).join("")+'</div>':'<div class="m-empty">No matches found. Try another title.</div>';}
 function categorySheet(){var options=[["all","All"],["tv","TV Shows"],["movie","Movies"],["korean","Korean"],["spanish","Spanish"],["anime","Animation"]];return '<div class="m-subtabs" style="padding-top:12px">'+options.map(function(x){return '<button class="m-subtab'+(screen.filter===x[0]?" active":"")+'" data-m-filter="'+x[0]+'">'+x[1]+'</button>';}).join("")+'</div>';}
 function render(){if(!source.state.profile)return;var main=screen.tab==="home"?home():screen.tab==="hot"?hot():screen.tab==="my"?myNetflix():screen.tab==="games"?games():searchPage();
  root.innerHTML=main+tabs();
  if(screen.tab==="home"&&screen.categories){root.querySelector(".m-filterbar").insertAdjacentHTML("afterend",categorySheet());}
  if(screen.tab==="search"){var input=$("mSearchInput");input.value=screen.search;searchResults();}
 }
 function setTab(tab){screen.tab=tab;screen.categories=false;render();window.scrollTo({top:0,behavior:"instant"});}
 root.addEventListener("click",function(event){
   var el=event.target.closest("button[data-m-tab],button[data-m-action],button[data-m-filter],button[data-m-open],button[data-m-play],button[data-m-add],button[data-m-news],button[data-m-remind],button[data-m-shelf]");
   if(!el||!root.contains(el))return;
   var d=el.dataset;
   if(d.mTab){setTab(d.mTab);return;}
   if(d.mOpen){source.openModal(d.mOpen);return;}
   if(d.mPlay){source.startPlayback(source.catalog.get(d.mPlay));return;}
   if(d.mAdd){var list=source.state.lists,k=d.mAdd;if(list.has(k))list.delete(k);else list.add(k);source.persist();render();return;}
   if(d.mFilter){screen.filter=screen.filter===d.mFilter&&["tv","movie"].includes(d.mFilter)?"all":d.mFilter;screen.heroIndex=0;screen.categories=false;render();return;}
   if(d.mNews){screen.news=d.mNews;render();return;}
   if(d.mRemind){toggleReminder(d.mRemind);return;}
   if(d.mShelf){var track=el.closest(".m-shelf").querySelector(".m-shelf-items");track.scrollBy({left:260,behavior:"smooth"});return;}
   if(d.mAction==="categories"){screen.categories=!screen.categories;render();return;}
   if(d.mAction==="search"){setTab("search");$("mSearchInput").focus();return;}
   if(d.mAction==="searchBack"){setTab("home");return;}
   if(d.mAction==="profile"||d.mAction==="changeProfile"){source.profileScreen();return;}
   if(d.mAction==="mylist"){setTab("my");return;}
   if(d.mAction==="notification"){var t=$("toast");t.textContent="You're all caught up";t.classList.add("visible");setTimeout(function(){t.classList.remove("visible");},1600);return;}
 });
 root.addEventListener("input",function(e){if(e.target.id==="mSearchInput"){screen.search=e.target.value;searchResults();}});
 var startX=0;
 root.addEventListener("touchstart",function(e){if(e.target.closest(".m-feature"))startX=e.touches[0].clientX;},{passive:true});
 root.addEventListener("touchend",function(e){if(!startX||!e.target.closest(".m-feature"))return;var delta=e.changedTouches[0].clientX-startX;startX=0;if(Math.abs(delta)>45){var count=featureItems().length;screen.heroIndex=(screen.heroIndex+(delta<0?1:-1)+count)%count;render();}},{passive:true});
 window.NetflixMobile={refresh:render};
 render();
 (async function discoverUpcoming(){
   try{
    var results=await Promise.allSettled([source.api("/movie/upcoming?region=US"),source.api("/tv/on_the_air")]);var now=new Date();
    var future=[];
    results.forEach(function(r,i){if(r.status!=="fulfilled")return;(r.value.results||[]).forEach(function(raw){
     var date=raw.release_date||raw.first_air_date||"";if(!date)return;var d=new Date(date+"T12:00:00Z");if(!Number.isFinite(d.getTime())||d<new Date(now.getTime()-86400000))return;var item=source.normalize(raw,i?"tv":"movie");if(item){item.release_date=date;future.push(item);}
    });});
    future.sort(function(a,b){return String(a.release_date).localeCompare(String(b.release_date));});
    screen.upcoming=unique(future);source.addItems(screen.upcoming);screen.ready=true;if(screen.tab==="hot")render();
   }catch(e){screen.ready=true;if(screen.tab==="hot")render();}
 }());
}());