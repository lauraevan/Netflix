/* Netflix browsing prototype. Vanilla JavaScript, no router/build step.
   Data and artwork: TMDB. Video playback: EvanPlayer's existing /watch routes. */
(function () {
  "use strict";
  var cfg = window.NETFLIX_CONFIG || {};
  var TMDB = "https://api.themoviedb.org/3";
  var IMG = "https://image.tmdb.org/t/p/";
  var profiles = [
    {id:"one", name:"Evan", color:"blue"},
    {id:"two", name:"Guest", color:"orange"},
    {id:"three", name:"Kids", color:"purple"},
    {id:"four", name:"Profile 4", color:"teal"}
  ];
  var state = {profile:null,view:"home",search:"",modal:null,hero:null,locale:"all",live:{},lists:new Set(),likes:new Set(),recent:[],manage:false,playerSelection:null};
  var fallback = [
    {id:66732,type:"tv",name:"Stranger Things",year:2016,age:"TV-14",rating:8.6,language:"en",genres:"Sci-Fi & Fantasy, Mystery, Drama",poster:"/49WJfeN0moxb9IPfGn8AIqMGskD.jpg",backdrop:"/56v2KjBlU4XaOv9rVYEQypROD7P.jpg",overview:"When a young boy vanishes, a small town uncovers a mystery involving secret experiments, terrifying supernatural forces and one strange little girl."},
    {id:119051,type:"tv",name:"Wednesday",year:2022,age:"TV-14",rating:8.4,language:"en",genres:"Mystery, Comedy, Fantasy",poster:"/9PFonBhy4cQy7Jz20NpMygczOkv.jpg",backdrop:"/iHSwvRVsRyxpX7FE7GbviaDvgGZ.jpg",overview:"Smart, sarcastic and a little dead inside, Wednesday Addams investigates twisted mysteries at Nevermore Academy."},
    {id:93405,type:"tv",name:"Squid Game",year:2021,age:"TV-MA",rating:8,language:"ko",genres:"Action & Adventure, Mystery, Drama",poster:"/dDlEmu3EZ0Pgg93K2SVNLCjCSvE.jpg",backdrop:"/2meX1nMdScFOoV4370rqHWKmXhY.jpg",overview:"Hundreds of players accept a strange invitation to compete in children's games for a tempting prize, but the stakes are deadly."},
    {id:94605,type:"tv",name:"Arcane",year:2021,age:"TV-14",rating:8.7,language:"en",genres:"Animation, Action & Adventure",poster:"/fqldf2t8ztc9aiwn3k6mlX3tvRT.jpg",backdrop:"/rkB4LyZHo1NHXFEDHl9vSD9r1lI.jpg",overview:"Amid the bitter discord of twin cities Piltover and Zaun, two sisters fight on rival sides of a war between magic technologies and clashing convictions."},
    {id:1396,type:"tv",name:"Breaking Bad",year:2008,age:"TV-MA",rating:8.9,language:"en",genres:"Drama, Crime",poster:"/3xnWaLQjelJDDF7LT1WBo6f4BRe.jpg",backdrop:"/tsRy63Mu5cu8etL1X7ZLyf7UP1M.jpg",overview:"A chemistry teacher diagnosed with inoperable cancer starts manufacturing methamphetamine with a former student."},
    {id:60059,type:"tv",name:"Better Call Saul",year:2015,age:"TV-MA",rating:8.7,language:"en",genres:"Crime, Drama",poster:"/fC2HDm5t0kHl7mTm7jxMR31b7by.jpg",backdrop:"/9faGSFi5jam6pDWGNd0p8JcJgXQ.jpg",overview:"The trials and tribulations of criminal lawyer Jimmy McGill in the years before he meets Walter White and Jesse Pinkman."},
    {id:71446,type:"tv",name:"Money Heist",year:2017,age:"TV-MA",rating:8.2,language:"es",genres:"Crime, Drama",poster:"/reEMJA1uzscCbkpeRJeTT2bjqUp.jpg",backdrop:"/xGexTKCJDkl12dTW4YCBDXWb1AD.jpg",overview:"Eight thieves take hostages and lock themselves in the Royal Mint of Spain as a criminal mastermind manipulates the police."},
    {id:70523,type:"tv",name:"Dark",year:2017,age:"TV-MA",rating:8.4,language:"de",genres:"Crime, Drama, Mystery",poster:"/apbrbWs8M9lyOpJYU5WXrpFbk1Z.jpg",backdrop:"",overview:"A missing child sets four families on a frantic hunt for answers as they unearth a mind-bending mystery spanning three generations."},
    {id:87739,type:"tv",name:"The Queen's Gambit",year:2020,age:"TV-MA",rating:8.6,language:"en",genres:"Drama",poster:"/zU0htwkhNvBQdVSIKB9s6hgVeFK.jpg",backdrop:"",overview:"In a 1950s orphanage, a young girl reveals an astonishing talent for chess and begins an unlikely journey to stardom."},
    {id:100088,type:"tv",name:"The Last of Us",year:2023,age:"TV-MA",rating:8.6,language:"en",genres:"Drama, Action & Adventure",poster:"/uKvVjHNqB5VmOrdxqAt2F7J78ED.jpg",backdrop:"/uDgy6hyPd82kOHh6I95FLtLnj6p.jpg",overview:"After a global pandemic destroys civilization, a hardened survivor takes charge of a teenage girl who may be humanity's last hope."},
    {id:60574,type:"tv",name:"Peaky Blinders",year:2013,age:"TV-MA",rating:8.5,language:"en",genres:"Crime, Drama",poster:"/vUUqzWa2LnHIVqkaKVlVGkVcZIW.jpg",backdrop:"",overview:"A notorious gang rises to power in 1919 Birmingham, England, led by the fierce Tommy Shelby."},
    {id:42009,type:"tv",name:"Black Mirror",year:2011,age:"TV-MA",rating:8.3,language:"en",genres:"Sci-Fi & Fantasy, Drama",poster:"",backdrop:"",overview:"An anthology series exploring humanity's twisted relationship with its greatest technological innovations."},
    {id:157336,type:"movie",name:"Interstellar",year:2014,age:"PG-13",rating:8.5,language:"en",genres:"Adventure, Drama, Science Fiction",poster:"/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",backdrop:"/xJHokMbljvjADYdit5fK5VQsXEG.jpg",overview:"A team of explorers travels beyond this galaxy to discover whether mankind has a future among the stars."},
    {id:693134,type:"movie",name:"Dune: Part Two",year:2024,age:"PG-13",rating:8.1,language:"en",genres:"Science Fiction, Adventure",poster:"/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg",backdrop:"/xOMo8BRK7PfcJv9JCnx7s5hj0PX.jpg",overview:"Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family."},
    {id:872585,type:"movie",name:"Oppenheimer",year:2023,age:"R",rating:8.1,language:"en",genres:"Drama, History",poster:"/ptpr0kGAckfQkJeJIt8st5dglvd.jpg",backdrop:"/fm6KqXpk3M2HVveHwCrBSSBaO0V.jpg",overview:"The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb."},
    {id:414906,type:"movie",name:"The Batman",year:2022,age:"PG-13",rating:7.7,language:"en",genres:"Crime, Mystery, Thriller",poster:"/74xTEgt7R36Fpooo50r9T25onhq.jpg",backdrop:"/5P8SmMzSNYikXpxil6BYzJ16611.jpg",overview:"Batman ventures into Gotham City's underworld when a sadistic killer leaves behind a trail of cryptic clues."},
    {id:346698,type:"movie",name:"Barbie",year:2023,age:"PG-13",rating:7.0,language:"en",genres:"Comedy, Adventure",poster:"/iuFNMS8U5cb6xfzi51Dbkovj7vM.jpg",backdrop:"/ctMserH8g2SeOAnCw5gFjdQF8mo.jpg",overview:"Barbie and Ken are having the time of their lives in the seemingly perfect world of Barbie Land, until they get a chance to go to the real world."},
    {id:27205,type:"movie",name:"Inception",year:2010,age:"PG-13",rating:8.4,language:"en",genres:"Action, Science Fiction",poster:"/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg",backdrop:"/s3TBrRGB1iav7gFOCNx3H31MoES.jpg",overview:"A skilled thief steals secrets through dream-sharing technology and is offered one last chance to redeem himself."},
    {id:569094,type:"movie",name:"Spider-Man: Across the Spider-Verse",year:2023,age:"PG",rating:8.3,language:"en",genres:"Animation, Action, Adventure",poster:"/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg",backdrop:"/4HodYYKEIsGOdinkGi2Ucz6X9i0.jpg",overview:"Miles Morales reunites with Gwen Stacy and meets a new team of Spider-People across the Multiverse."},
    {id:603,type:"movie",name:"The Matrix",year:1999,age:"R",rating:8.2,language:"en",genres:"Action, Science Fiction",poster:"/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg",backdrop:"/fNG7i7RqMErkcqhohV2a6cV1Ehy.jpg",overview:"A computer hacker discovers that his reality is an elaborate simulation and joins a rebellion against its controllers."}
  ];
  var catalog = new Map();
  var $ = function(id){return document.getElementById(id);};
  function key(item){return item.type + ":" + item.id;}
  function icon(name){return '<svg class="icon" aria-hidden="true"><use href="#' + name + '"/></svg>';}
  function esc(value){return String(value==null?"":value).replace(/[&<>"']/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];});}
  function safeImage(path,size){return typeof path==="string" && /^\/[A-Za-z0-9_-]+\.(jpg|jpeg|png|webp)$/.test(path) ? IMG + size + path : "";}
  function uniq(items){var seen=new Set();return items.filter(function(item){if(!item||seen.has(key(item)))return false;seen.add(key(item));return true;});}
  function byType(t){return Array.from(catalog.values()).filter(function(x){return x.type===t;});}
  function notify(message){var el=$("toast");el.textContent=message;el.classList.add("visible");clearTimeout(notify.timer);notify.timer=setTimeout(function(){el.classList.remove("visible");},2200);}
  function parseJson(value,defaultValue){try {return JSON.parse(value) || defaultValue;}catch(e){return defaultValue;}}
  function dataKey(s){return "nf-" + s + "-" + state.profile;}
  function persist(){if(!state.profile)return;localStorage.setItem(dataKey("list"),JSON.stringify(Array.from(state.lists)));localStorage.setItem(dataKey("likes"),JSON.stringify(Array.from(state.likes)));localStorage.setItem(dataKey("recent"),JSON.stringify(state.recent));}
  function restore(){state.lists=new Set(parseJson(localStorage.getItem(dataKey("list")),[]));state.likes=new Set(parseJson(localStorage.getItem(dataKey("likes")),[]));state.recent=parseJson(localStorage.getItem(dataKey("recent")),[]);}
  function avatar(profile){var face='<svg viewBox="0 0 80 80" aria-hidden="true"><circle cx="40" cy="29" r="15" fill="#fff"/><path d="M6 80c1-23 14-33 34-33s33 10 34 33" fill="#fff"/></svg>';return '<span class="avatar '+esc(profile.color)+'">'+face+'</span>';}
  function getProfiles(){return parseJson(localStorage.getItem("nf-profiles"),profiles);}
  function profileScreen(){var list=getProfiles();$("profileCards").innerHTML=list.map(function(p){return '<button class="profile-choice" data-profile="'+esc(p.id)+'">'+avatar(p)+'<span>'+esc(p.name)+'</span></button>';}).join("");$("profilesScreen").hidden=false;$("site").hidden=true;$("playerShell").hidden=true;document.body.classList.add("locked");$("manageProfiles").textContent=state.manage?"Done":"Manage Profiles";}
  function setProfile(id){var p=getProfiles().find(function(x){return x.id===id;});if(!p)return;if(state.manage){var name=prompt("Profile name",p.name);if(name&&name.trim()){var arr=getProfiles();arr.find(function(x){return x.id===id;}).name=name.trim().slice(0,30);localStorage.setItem("nf-profiles",JSON.stringify(arr));profileScreen();}return;}
    state.profile=id;localStorage.setItem("nf-current-profile",id);restore();$("currentAvatar").outerHTML='<span id="currentAvatar" class="avatar '+esc(p.color)+'">'+avatar(p).replace(/^<span[^>]*>|<\/span>$/g,"")+'</span>';$("profilesScreen").hidden=true;$("site").hidden=false;document.body.classList.remove("locked");$("accountPopover").hidden=true;renderSwitcher();render();window.scrollTo(0,0);}
  function renderSwitcher(){var choices=getProfiles().filter(function(p){return p.id!==state.profile;});$("profileSwitchItems").innerHTML=choices.map(function(p){return '<button data-switch="'+esc(p.id)+'">'+avatar(p)+' '+esc(p.name)+'</button>';}).join("");}
  function normalize(raw,forced){if(!raw||!raw.id)return null;var type=forced || raw.media_type || (raw.title?"movie":"tv");if(type!=="movie"&&type!=="tv")return null;var name=raw.title||raw.name;var d=raw.release_date||raw.first_air_date||"";if(!name)return null;return {id:raw.id,type:type,name:name,year:Number(d.slice(0,4))||0,age:type==="movie"?"PG-13":"TV-MA",rating:Number(raw.vote_average)||0,language:raw.original_language||"en",genres:[],poster:raw.poster_path||"",backdrop:raw.backdrop_path||"",overview:raw.overview||""};}
  function addItems(items){(items||[]).forEach(function(x){if(x&&x.id&&x.name){var old=catalog.get(key(x));catalog.set(key(x),old?Object.assign({},old,x,{genres:old.genres||x.genres}):x);}});}
  function titleTile(item,rank){var k=esc(key(item));var img=safeImage(rank?item.poster:item.backdrop||item.poster,rank?"w342":"w780");var number=rank?'<span class="rank">'+rank+'</span>':"";return '<button type="button" class="tile'+(rank?" rank-tile":"")+'" data-open="'+k+'" aria-label="More information about '+esc(item.name)+'">'+number+'<span class="tile-fallback">'+esc(item.name)+'</span>'+(img?'<img src="'+esc(img)+'" loading="lazy" alt="" onerror="this.style.display=&quot;none&quot;">':"")+'<span class="tile-overlay"><b>'+esc(item.name)+'</b><small>'+(item.year||"")+' &nbsp; '+esc(item.type==="tv"?"Series":"Film")+'</small></span></button>';}
  function rail(name,items,rank){var arr=uniq((items||[]).filter(Boolean)).slice(0,rank?10:21);if(!arr.length)return "";var id="track-"+String(Math.random()).slice(2,10);return '<section class="rail"><h2 class="rail-title">'+esc(name)+'<small>Explore all ›</small></h2><button class="rail-scroll prev" data-scroll="-1" data-track="'+id+'" aria-label="Scroll previous">'+icon("left")+'</button><div class="rail-track" id="'+id+'">'+arr.map(function(x,i){return titleTile(x,rank?i+1:0);}).join("")+'</div><button class="rail-scroll next" data-scroll="1" data-track="'+id+'" aria-label="Scroll next">'+icon("right")+'</button></section>';}
  function featured(){var x=state.hero||fallback[0];var logo=$("heroLogo");if(state.heroLogo){if(!logo){logo=document.createElement("img");logo.id="heroLogo";logo.className="hero-logo";logo.alt=x.name;logo.onerror=function(){this.hidden=true;$("heroTitle").hidden=false;};$("heroTitle").after(logo);}logo.hidden=false;logo.src=state.heroLogo;$("heroTitle").hidden=true;}else{$("heroTitle").hidden=false;if(logo)logo.hidden=true;}$("heroBackdrop").style.backgroundImage=safeImage(x.backdrop,"original")?'url("'+safeImage(x.backdrop,"original")+'")':"none";$("heroTitle").textContent=x.name;$("heroDescription").textContent=x.overview||"Explore this featured title.";$("heroLabel").textContent=x.year?String(x.year)+"  |  "+(x.type==="tv"?"Series":"Film"):"Featured";$("heroType").innerHTML='<span class="n">N</span> '+(x.type==="tv"?"SERIES":"FILM");$("heroMaturity").textContent=x.age||"TV-MA";}
  function currentItems(){return uniq(Array.from(catalog.values()));}
  function renderHome(){var all=currentItems(),tv=byType("tv"),movies=byType("movie"),live=state.live,recents=state.recent.map(function(k){return catalog.get(k);}).filter(Boolean),listed=Array.from(state.lists).map(function(k){return catalog.get(k);}).filter(Boolean);var output="";
    if(recents.length)output+=rail("Continue Watching for "+(getProfiles().find(function(p){return p.id===state.profile;})||{name:"You"}).name,recents);
    output+=rail("Popular on Netflix",live.trending||all);
    output+=rail("Trending Now",live.popular||all.slice().reverse());
    output+=rail("Top 10 Series in the U.S. Today",live.tv||tv,true);
    output+=rail(live.netflixTv?"Only on Netflix":"Binge-Worthy Series",live.netflixTv||tv);
    output+=rail("Top 10 Movies in the U.S. Today",live.movies||movies,true);
    output+=rail("Critically Acclaimed",live.top||all);
    if(listed.length)output+=rail("My List",listed);
    output+=rail("Binge-Worthy TV Shows",tv.slice().reverse());
    output+=rail("Films to Watch Tonight",movies.slice().reverse());
    $("rails").innerHTML=output;$("rails").hidden=false;$("hero").hidden=false;$("browseView").hidden=true;featured();}
  function browsePage(){var view=state.view,items=currentItems(),heading="";
    if(view==="tv"){heading="TV Shows";items=items.filter(function(x){return x.type==="tv";});}
    if(view==="movie"){heading="Movies";items=items.filter(function(x){return x.type==="movie";});}
    if(view==="new"){heading="New & Popular";items=uniq([].concat(state.live.trending||[],state.live.popular||[],items)).sort(function(a,b){return (b.year||0)-(a.year||0);});}
    if(view==="list"){heading="My List";items=Array.from(state.lists).map(function(k){return catalog.get(k);}).filter(Boolean);}
    if(view==="languages"){heading="Browse by Languages";if(state.locale!=="all")items=items.filter(function(x){return x.language===state.locale;});}
    if(view==="search"){heading=state.search?'Explore results for "'+state.search+'"':"Search";var query=state.search.toLowerCase();items=items.filter(function(x){return (x.name+" "+x.genres+" "+x.overview).toLowerCase().includes(query);});}
    $("hero").hidden=true;$("rails").hidden=true;$("browseView").hidden=false;
    var filters=view==="languages"?'<div class="language-row">'+[["all","All Languages"],["en","English"],["ko","Korean"],["es","Spanish"],["ja","Japanese"],["hi","Hindi"],["de","German"]].map(function(row){return '<button class="language-btn'+(state.locale===row[0]?" selected":"")+'" data-language="'+row[0]+'">'+row[1]+'</button>';}).join("")+'</div>':"";
    $("browseView").innerHTML='<h1>'+esc(heading)+'</h1>'+filters+(items.length?'<div class="browse-grid">'+items.map(function(x){return titleTile(x,0);}).join("")+'</div>':'<div class="empty">'+(view==="list"?"Titles you add to My List will appear here.":"No titles found. Try another search.")+'</div>');
  }
  function render(){if(!state.profile)return;document.querySelectorAll("[data-nav]").forEach(function(btn){btn.classList.toggle("active",btn.dataset.nav===state.view);});if(state.view==="home")renderHome();else browsePage();$("header").classList.toggle("scrolled",window.scrollY>30);if(window.NetflixMobile)window.NetflixMobile.refresh();}
  function go(view){state.view=view||"home";$("mobileMenu").hidden=true;$("accountPopover").hidden=true;document.querySelectorAll(".nav button").forEach(function(b){b.classList.toggle("active",b.dataset.nav===view);});if(location.hash!=="#"+view)history.replaceState(null,"","#"+view);window.scrollTo({top:0,behavior:"instant"});render();}
  function formatGenre(x){if(Array.isArray(x.genres))return x.genres.map(function(g){return typeof g==="string"?g:g.name;}).join(", ");return x.genres||"Drama, Entertainment";}
  function modalContents(item){$("modalTitle").textContent=item.name;$("modalBrand").innerHTML='<span class="n">N</span> '+(item.type==="tv"?"SERIES":"FILM");
    var art=safeImage(item.backdrop||item.poster,"original");$("modalArt").style.backgroundImage=art?'url("'+art+'")':"none";
    $("modalMeta").innerHTML='<span class="match">'+Math.max(80,Math.round((item.rating||7)*10))+'% Match</span><span>'+(item.year||"")+'</span><span class="rating-box">'+esc(item.age||"TV-MA")+'</span><span>HD</span>';
    $("modalDescription").textContent=item.overview||"Explore this title.";
    $("modalGenres").innerHTML='<div><b>Genres:</b> '+esc(formatGenre(item))+'</div><div><b>This show is:</b> Immersive, Cinematic</div>';
    var saved=state.lists.has(key(item));$("modalList").innerHTML=icon(saved?"check":"plus");$("modalList").title=saved?"Remove from My List":"Add to My List";
    $("modalLike").style.borderColor=state.likes.has(key(item))?"#fff":"#888";
    $("aboutSection").innerHTML='<b>About '+esc(item.name)+'</b><br>Genres: '+esc(formatGenre(item))+'<br>Maturity Rating: '+esc(item.age||"Not Rated");
    var other=byType(item.type).filter(function(x){return key(x)!==key(item);}).slice(0,6);
    $("similarGrid").innerHTML=other.map(function(x){return titleTile(x,0);}).join("");
    $("episodeSection").hidden=item.type!=="tv";
    if(item.type==="tv"){renderEpisodeLoading();loadEpisodes(item,1);}
  }
  function openModal(k){var item=catalog.get(k);if(!item)return;state.modal=item;modalContents(item);$("modalOverlay").hidden=false;document.body.classList.add("locked");$("modalOverlay").scrollTop=0;}
  function closeModal(){state.modal=null;$("modalOverlay").hidden=true;if($("playerShell").hidden)document.body.classList.remove("locked");}
  function renderEpisodeLoading(){$("seasonSelect").innerHTML='<option value="1">Season 1</option>';$("episodeList").innerHTML='<p class="muted">Loading episodes…</p>';}
  async function api(path){if(!cfg.tmdbApiKey)throw new Error("Metadata API not configured");var ac=new AbortController();var timer=setTimeout(function(){ac.abort();},7500);try{var sep=path.includes("?")?"&":"?";var response=await fetch(TMDB+path+sep+"api_key="+encodeURIComponent(cfg.tmdbApiKey)+"&language=en-US",{signal:ac.signal});if(!response.ok)throw new Error("Metadata request failed: "+response.status);return await response.json();}finally{clearTimeout(timer);}}
  async function loadEpisodes(show,season){var originalKey=key(show);try{
      var details=await api("/tv/"+show.id);
      if(!state.modal||key(state.modal)!==originalKey)return;
      var seasons=(details.seasons||[]).filter(function(s){return s.season_number>0;});
      $("seasonSelect").innerHTML=seasons.map(function(s){return '<option value="'+s.season_number+'">'+esc(s.name||"Season "+s.season_number)+'</option>';}).join("")||'<option value="1">Season 1</option>';
      $("seasonSelect").value=String(season);
      var data=await api("/tv/"+show.id+"/season/"+season);
      if(!state.modal||key(state.modal)!==originalKey||$("seasonSelect").value!==String(season))return;
      var episodes=(data.episodes||[]).filter(function(e){return e.episode_number>0;});
      $("episodeList").innerHTML=episodes.length?episodes.map(function(e){var still=safeImage(e.still_path,"w300");return '<button class="episode" data-episode="'+e.episode_number+'" data-season="'+season+'"><span class="episode-number">'+e.episode_number+'</span>'+(still?'<img alt="" loading="lazy" src="'+esc(still)+'">':'<span class="episode-thumb"></span>')+'<div><h4>'+esc(e.name||"Episode "+e.episode_number)+'<small>'+(e.runtime?e.runtime+"m":"")+'</small></h4><p>'+esc(e.overview||"Watch this episode.")+'</p></div></button>';}).join(""):'<p class="muted">Episodes unavailable for this season.</p>';
    }catch(e){if(state.modal&&key(state.modal)===originalKey)$("episodeList").innerHTML='<p class="muted">Episode information is temporarily unavailable. Use Play to start the first episode.</p>';}
  }
  function startPlayback(item,season,episode){if(!item)return;state.playerSelection={item:item,season:season||1,episode:episode||1};state.recent=[key(item)].concat(state.recent.filter(function(x){return x!==key(item);})).slice(0,15);persist();$("playerShell").hidden=false;document.body.classList.add("locked");$("playerFrame").src="about:blank";$("playerSetup").hidden=true;$("modalOverlay").hidden=true;var backend=getBackend();if(backend){loadPlayer(backend);}else{$("playerSetup").hidden=false;$("backendUrl").focus();}}
  function getBackend(){return String(localStorage.getItem("nf-player-backend")||cfg.playerBaseUrl||"").trim();}
  function validBackend(value){try{var parsed=new URL(value);if(parsed.username||parsed.password)return false;return parsed.protocol==="https:"||(parsed.protocol==="http:"&&["localhost","127.0.0.1"].includes(parsed.hostname));}catch(e){return false;}}
  function loadPlayer(base){if(!validBackend(base)){$("playerSetup").hidden=false;$("backendError").textContent="Enter a valid HTTPS address (HTTP is allowed for localhost).";return;}
    var selected=state.playerSelection;if(!selected)return;
    var x=selected.item;var url=new URL("/watch/"+(x.type==="movie"?"movie":"tv")+"/"+x.id,base);
    url.searchParams.set("title",x.name);if(x.type==="tv"){url.searchParams.set("season",selected.season);url.searchParams.set("episode",selected.episode);}
    $("backendError").textContent="";$("playerSetup").hidden=true;$("playerFrame").src=url.href;
  }
  function closePlayer(){$("playerFrame").src="about:blank";$("playerShell").hidden=true;$("playerSetup").hidden=true;document.body.classList.remove("locked");state.playerSelection=null;render();}
  async function fetchCollection(path,kind){var data=await api(path);return (data.results||[]).map(function(row){return normalize(row,kind);}).filter(function(x){return x&&(x.poster||x.backdrop);});}
  async function loadLive(){
    if(!cfg.tmdbApiKey)return;
    var endpoints=[
      ["trending","/trending/all/week",null],
      ["popular","/trending/all/day",null],
      ["tv","/trending/tv/week","tv"],
      ["movies","/trending/movie/week","movie"],
      ["netflixTv","/discover/tv?sort_by=popularity.desc&watch_region=US&with_watch_providers=8","tv"],
      ["top","/movie/top_rated?page=1","movie"]
    ];
    var result=await Promise.allSettled(endpoints.map(function(e){return fetchCollection(e[1],e[2]);}));
    result.forEach(function(r,i){if(r.status==="fulfilled"&&r.value.length){state.live[endpoints[i][0]]=r.value;addItems(r.value);}});
    if(state.profile)render();
  }
  function onAction(event){
    var tile=event.target.closest("[data-open]");if(tile){openModal(tile.dataset.open);return;}
    var nav=event.target.closest("[data-nav]");if(nav){go(nav.dataset.nav);return;}
    var scroll=event.target.closest("[data-scroll]");if(scroll){var track=$(scroll.dataset.track);if(track)track.scrollBy({left:track.clientWidth*.9*Number(scroll.dataset.scroll),behavior:"smooth"});return;}
    var profile=event.target.closest("[data-profile]");if(profile){setProfile(profile.dataset.profile);return;}
    var switchButton=event.target.closest("[data-switch]");if(switchButton){setProfile(switchButton.dataset.switch);return;}
    var language=event.target.closest("[data-language]");if(language){state.locale=language.dataset.language;render();return;}
    var episode=event.target.closest("[data-episode]");if(episode&&state.modal){startPlayback(state.modal,Number(episode.dataset.season),Number(episode.dataset.episode));return;}
  }
  document.addEventListener("click",onAction);
  $("heroPlay").addEventListener("click",function(){startPlayback(state.hero||fallback[0]);});
  $("heroInfo").addEventListener("click",function(){openModal(key(state.hero||fallback[0]));});
  $("modalClose").addEventListener("click",closeModal);
  $("modalOverlay").addEventListener("click",function(e){if(e.target===$("modalOverlay"))closeModal();});
  $("modalPlay").addEventListener("click",function(){if(state.modal)startPlayback(state.modal);});
  $("modalList").addEventListener("click",function(){if(!state.modal)return;var k=key(state.modal);if(state.lists.has(k)){state.lists.delete(k);notify("Removed from My List");}else{state.lists.add(k);notify("Added to My List");}persist();modalContents(state.modal);render();});
  $("modalLike").addEventListener("click",function(){if(!state.modal)return;var k=key(state.modal);if(state.likes.has(k)){state.likes.delete(k);notify("Rating removed");}else{state.likes.add(k);notify("Rated");}persist();$("modalLike").style.borderColor=state.likes.has(k)?"#fff":"#888";});
  $("seasonSelect").addEventListener("change",function(){if(state.modal)loadEpisodes(state.modal,Number(this.value));});
  $("playerBack").addEventListener("click",closePlayer);
  $("saveBackend").addEventListener("click",function(){var base=$("backendUrl").value.trim().replace(/\/+$/,"");if(!validBackend(base)){$("backendError").textContent="Use HTTPS or localhost HTTP for the player address.";return;}localStorage.setItem("nf-player-backend",base);loadPlayer(base);});
  $("backendUrl").addEventListener("keydown",function(e){if(e.key==="Enter")$("saveBackend").click();});
  $("searchToggle").addEventListener("click",function(){var open=$("searchControl").classList.toggle("open");$("header").classList.toggle("searching",open);if(open){$("searchInput").focus();go("search");}else{$("searchInput").value="";state.search="";go("home");}});
  $("searchInput").addEventListener("input",function(){state.search=this.value.trim();if(state.view!=="search")state.view="search";render();});
  $("mobileBrowse").addEventListener("click",function(){$("mobileMenu").hidden=!$("mobileMenu").hidden;});
  $("accountButton").addEventListener("click",function(){var pop=$("accountPopover");pop.hidden=!pop.hidden;$("accountButton").setAttribute("aria-expanded",String(!pop.hidden));});
  $("profileExit").addEventListener("click",function(){localStorage.removeItem("nf-current-profile");state.profile=null;state.manage=false;profileScreen();});
  $("manageProfiles").addEventListener("click",function(){state.manage=!state.manage;profileScreen();});
  $("bellButton").addEventListener("click",function(){notify("You're all caught up.");});
  $("heroMute").addEventListener("click",function(){notify("Featured video previews are unavailable in beta.");});
  document.addEventListener("keydown",function(e){if(e.key==="Escape"){if(!$("playerShell").hidden)closePlayer();else if(!$("modalOverlay").hidden)closeModal();else if(!$("accountPopover").hidden)$("accountPopover").hidden=true;else if($("searchControl").classList.contains("open"))$("searchToggle").click();}});
  document.addEventListener("click",function(e){if(!e.target.closest(".account")){$("accountPopover").hidden=true;$("accountButton").setAttribute("aria-expanded","false");}});
  window.addEventListener("scroll",function(){$("header").classList.toggle("scrolled",window.scrollY>35);},{passive:true});
  window.addEventListener("hashchange",function(){var view=location.hash.slice(1);if(["home","tv","movie","new","list","languages"].includes(view)&&view!==state.view)go(view);});
  // Shared catalog/actions for the standalone mobile Netflix app surface.
  window.NetflixUI = {
    state:state,
    catalog:catalog,
    key:key,
    safeImage:safeImage,
    getProfiles:getProfiles,
    openModal:openModal,
    closeModal:closeModal,
    startPlayback:startPlayback,
    persist:persist,
    profileScreen:profileScreen,
    go:go,
    api:api,
    normalize:normalize,
    addItems:addItems,
    render:render
  };
  // Startup: show actual app UI, never a welcome/marketing page.
  addItems(fallback);state.hero=fallback[0];state.view=["home","tv","movie","new","list","languages"].includes(location.hash.slice(1))?location.hash.slice(1):"home";
  var remembered=localStorage.getItem("nf-current-profile");
  if(remembered&&getProfiles().some(function(p){return p.id===remembered;})){setProfile(remembered);}else{profileScreen();}
  loadLive().catch(function(){/* Curated titles remain usable when metadata is offline. */});
  (async function loadHeroLogo(){try{var x=state.hero||fallback[0];var data=await api("/"+x.type+"/"+x.id+"/images?include_image_language=en,null");var logos=(data.logos||[]).filter(function(l){return l.iso_639_1==="en"&&l.file_path&&l.file_path.endsWith(".png");}).sort(function(a,b){return (b.vote_average||0)-(a.vote_average||0);});if(logos.length){state.heroLogo=safeImage(logos[0].file_path,"w500");if(state.profile&&state.view==="home")featured();}}catch(e){/* Keep accessible title text when artwork is unavailable. */}}());
}());