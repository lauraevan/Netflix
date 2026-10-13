/* Native-feeling, mobile-only title & profile views. Desktop overlays are never used on phones. */
(function(){
 "use strict";
 var app=window.NetflixUI, root=document.getElementById("mobileRoot");
 if(!app||!root)return;
 var layer=document.createElement("div");
 layer.className="native-layer";
 layer.id="nativeLayer";
 layer.hidden=true;
 document.body.appendChild(layer);
 var current=null, editing=null, chosenAvatar=0, focusedSeason=1, openedWithHistory=false;
 var isPhone=function(){return matchMedia("(max-width:760px)").matches;};
 var icon=function(id){return '<svg class="icon" aria-hidden="true"><use href="#'+id+'"/></svg>';};
 function esc(value){return String(value===null||value===undefined?"":value).replace(/[&<>"']/g,function(x){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[x];});}
 function titleKey(item){return app.key(item);}
 function image(item,type){return app.safeImage(type==="poster"?item.poster:item.backdrop||item.poster,type==="poster"?"w500":"w1280");}
 function sprite(index){return '<span class="native-avatar" style="background-position:'+((index||0)*100/6).toFixed(5)+'% center"></span>';}
 function show(view){
   layer.hidden=false;
   layer.innerHTML=view;
   document.body.classList.add("native-open");
   if(!openedWithHistory){history.pushState({netflixNative:true},"",location.href);openedWithHistory=true;}
   layer.scrollTop=0;
 }
 function dismiss(fromHistory){
   if(layer.hidden)return;
   current=null;editing=null;
   layer.hidden=true;layer.innerHTML="";
   document.body.classList.remove("native-open");
   if(openedWithHistory&&!fromHistory){openedWithHistory=false;history.back();}
   if(fromHistory)openedWithHistory=false;
   if(window.NetflixMobile)window.NetflixMobile.refresh();
 }
 function releaseLabel(x){return x.type==="tv"?"Series":"Film";}
 function isSaved(item){return app.state.lists.has(titleKey(item));}
 function toolbarButton(label,symbol,data){return '<button type="button" class="native-icon-action" '+data+' aria-label="'+esc(label)+'"><span>'+icon(symbol)+'</span><small>'+esc(label)+'</small></button>';}
 function openDetails(key,keepHistory){
   var item=app.catalog.get(key);if(!item)return;
   current=item; editing=null;focusedSeason=1;
   var wallpaper=image(item,"backdrop"),poster=image(item,"poster");
   var genres=typeof item.genres==="string"?item.genres.split(",").map(function(s){return s.trim();}):Array.isArray(item.genres)?item.genres.map(function(g){return typeof g==="string"?g:g.name;}):[];
   var related=Array.from(app.catalog.values()).filter(function(x){return x.type===item.type&&x.id!==item.id;}).slice(0,9);
   var labels=[item.year||"New",item.age||"TV-MA",releaseLabel(item),"HD"];
   var art=wallpaper||poster;
   var html='<section class="native-screen native-details" role="dialog" aria-label="'+esc(item.name)+' details" aria-modal="true">'+
    '<div class="native-art">'+(art?'<img src="'+esc(art)+'" alt="" onerror="this.hidden=true">':"")+
      '<div class="native-art-shade"></div>'+
      '<button class="native-back" data-native-close aria-label="Back">'+icon("left")+'</button>'+
      '<span class="native-art-mark">N <small>'+releaseLabel(item).toUpperCase()+'</small></span>'+
      '<div class="native-art-title">'+esc(item.name)+'</div>'+
    '</div>'+
    '<div class="native-content">'+
      '<div class="native-meta"><span class="native-match">'+Math.round(Math.min(99,Math.max(68,(item.rating||7.7)*10)))+'% Match</span>'+labels.map(function(x){return '<span>'+esc(x)+'</span>';}).join("")+'</div>'+
      '<div class="native-primary-actions"><button class="native-main-play" data-native-play>'+icon("play")+' Play</button><button class="native-main-download" data-native-remind>'+icon("bell")+' Remind Me</button></div>'+
      '<div class="native-synopsis">'+esc(item.overview||"Discover this title.")+'</div>'+
      '<div class="native-submeta">'+(genres.length?'<span>'+esc(genres.slice(0,4).join(" • "))+'</span>':'<span>Entertainment • Immersive</span>')+'</div>'+
      '<div class="native-actions">'+
        toolbarButton(isSaved(item)?"In My List":"My List",isSaved(item)?"check":"plus","data-native-list")+
        toolbarButton("Rate","thumb","data-native-rate")+
        toolbarButton("Share","right","data-native-share")+
      '</div>'+
      (item.type==="tv"?'<div class="native-episodes"><div class="native-section-head"><h2>Episodes</h2><select id="nativeSeasons" aria-label="Choose season"><option value="1">Season 1</option></select></div><div id="nativeEpisodeList" class="native-episode-list"><p class="native-muted">Loading episodes…</p></div></div>':"")+
      '<div class="native-related"><h2>More Like This</h2><div class="native-related-grid">'+related.map(function(x){var pic=image(x,"poster");return '<button class="native-related-tile" data-native-open="'+esc(titleKey(x))+'">'+(pic?'<img src="'+esc(pic)+'" loading="lazy" alt="">':'<span>'+esc(x.name)+'</span>')+'</button>';}).join("")+'</div></div>'+
    '</div>'+
   '</section>';
   if(keepHistory){layer.hidden=false;layer.innerHTML=html;document.body.classList.add("native-open");layer.scrollTop=0;}
   else show(html);
   if(item.type==="tv")loadSeasons(item,1);
 }
 async function loadSeasons(item,season){
   var k=titleKey(item);
   try{
     var showData=await app.api("/tv/"+item.id);
     if(!current||titleKey(current)!==k)return;
     var available=(showData.seasons||[]).filter(function(x){return x.season_number>0;});
     var select=layer.querySelector("#nativeSeasons");
     if(!select)return;
     select.innerHTML=available.map(function(x){return '<option value="'+x.season_number+'">'+esc(x.name||"Season "+x.season_number)+'</option>';}).join("")||'<option value="1">Season 1</option>';
     select.value=String(season);
     await loadEpisodeList(item,season);
   }catch(e){if(current&&titleKey(current)===k){var target=layer.querySelector("#nativeEpisodeList");if(target)target.innerHTML='<button class="native-episode-fallback" data-native-episode="1" data-native-season="1">'+icon("play")+' Play first episode</button>';}}
 }
 async function loadEpisodeList(item,season){
   var target=layer.querySelector("#nativeEpisodeList");
   if(!target)return;
   var expectedKey=titleKey(item);
   target.innerHTML='<p class="native-muted">Loading episodes…</p>';
   try{
     var result=await app.api("/tv/"+item.id+"/season/"+season);
     if(!current||titleKey(current)!==expectedKey||layer.querySelector("#nativeSeasons")?.value!==String(season))return;
     var episodes=(result.episodes||[]).filter(function(x){return x.episode_number>0;});
     target.innerHTML=episodes.map(function(e){
       var still=app.safeImage(e.still_path,"w300");
       return '<button class="native-episode-row" data-native-episode="'+e.episode_number+'" data-native-season="'+season+'">'+
         '<span class="native-episode-image">'+(still?'<img src="'+esc(still)+'" alt="" loading="lazy">':icon("play"))+'</span>'+
         '<span class="native-episode-copy"><b>'+e.episode_number+'. '+esc(e.name||"Episode "+e.episode_number)+'</b>'+
         '<small>'+esc(e.runtime?e.runtime+"m • ":"")+esc((e.overview||"").slice(0,110))+'</small></span>'+icon("play")+'</button>';
     }).join("")||'<button class="native-episode-fallback" data-native-episode="1" data-native-season="'+season+'">'+icon("play")+' Play Season '+season+'</button>';
   }catch(e){target.innerHTML='<button class="native-episode-fallback" data-native-episode="1" data-native-season="'+season+'">'+icon("play")+' Play first episode</button>';}
 }
 function toggleList(){
   if(!current)return;
   var k=titleKey(current);
   if(isSaved(current))app.state.lists.delete(k);else app.state.lists.add(k);
   app.persist();
   var btn=layer.querySelector("[data-native-list]");
   if(btn){btn.innerHTML='<span>'+icon(isSaved(current)?"check":"plus")+'</span><small>'+(isSaved(current)?"In My List":"My List")+'</small>';}
 }
 function play(season,episode){
   if(!current)return;
   var item=current;
   dismiss(false);
   app.startPlayback(item,season||1,episode||1);
 }
 function openEditor(id){
   var profile=app.getProfiles().find(function(p){return p.id===id;});
   if(!profile)return;
   editing=profile;current=null;chosenAvatar=Number(profile.avatar)||0;
   var html='<section class="native-screen native-profile-edit" role="dialog" aria-modal="true" aria-label="Edit profile">'+
     '<header class="native-editor-head"><button data-native-close class="native-back" aria-label="Back">'+icon("left")+'</button><h1>Edit Profile</h1><button class="native-save" data-native-save>Save</button></header>'+
     '<div class="native-editor-body">'+
       '<div class="native-avatar-preview" id="nativeAvatarPreview">'+sprite(chosenAvatar)+'</div>'+
       '<label class="native-input-label" for="nativeProfileName">Profile Name</label>'+
       '<input id="nativeProfileName" class="native-name-input" type="text" maxlength="30" value="'+esc(profile.name)+'">'+
       '<h2>Choose an icon</h2>'+
       '<div class="native-avatar-choices">'+[0,1,2,3,4,5,6].map(function(i){return '<button type="button" class="native-avatar-option'+(i===chosenAvatar?" selected":"")+'" data-native-avatar="'+i+'" aria-label="Avatar '+(i+1)+'">'+sprite(i)+'</button>';}).join("")+'</div>'+
     '</div></section>';
   show(html);
 }
 function saveProfile(){
   if(!editing)return;
   var value=(layer.querySelector("#nativeProfileName")?.value||"").trim().slice(0,30);
   if(!value){layer.querySelector("#nativeProfileName")?.focus();return;}
   var all=app.getProfiles();
   var p=all.find(function(x){return x.id===editing.id;});
   p.name=value;p.avatar=chosenAvatar;
   localStorage.setItem("nf-profiles",JSON.stringify(all));
   dismiss(false);
   app.profileScreen();
 }
 // Capture on mobile before the legacy desktop handlers can open a web modal.
 document.addEventListener("click",function(e){
   if(!isPhone())return;
   var control=e.target.closest("[data-m-open]");
   if(control&&root.contains(control)){
     e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();
     openDetails(control.dataset.mOpen,false);
     return;
   }
   var chooser=e.target.closest("#profileCards [data-profile]");
   if(chooser&&app.state.manage){
     e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();
     openEditor(chooser.dataset.profile);
   }
 },true);
 layer.addEventListener("click",function(e){
   var el=e.target.closest("button");if(!el)return;
   if(el.hasAttribute("data-native-close")){dismiss(false);return;}
   if(el.hasAttribute("data-native-play")){play(1,1);return;}
   if(el.hasAttribute("data-native-list")){toggleList();return;}
   if(el.hasAttribute("data-native-rate")){if(current){var k=titleKey(current);if(app.state.likes.has(k))app.state.likes.delete(k);else app.state.likes.add(k);app.persist();el.classList.toggle("active",app.state.likes.has(k));}return;}
   if(el.hasAttribute("data-native-share")){if(navigator.share){navigator.share({title:current.name,url:location.href}).catch(function(){});}else if(navigator.clipboard){navigator.clipboard.writeText(current.name).catch(function(){});}return;}
   if(el.hasAttribute("data-native-remind")){el.classList.toggle("active");el.innerHTML=icon(el.classList.contains("active")?"check":"bell")+" "+(el.classList.contains("active")?"Reminder set":"Remind Me");return;}
   if(el.dataset.nativeEpisode){play(Number(el.dataset.nativeSeason)||1,Number(el.dataset.nativeEpisode)||1);return;}
   if(el.dataset.nativeOpen){openDetails(el.dataset.nativeOpen,true);return;}
   if(el.dataset.nativeAvatar){chosenAvatar=Number(el.dataset.nativeAvatar);layer.querySelectorAll(".native-avatar-option").forEach(function(node){node.classList.toggle("selected",Number(node.dataset.nativeAvatar)===chosenAvatar);});layer.querySelector("#nativeAvatarPreview").innerHTML=sprite(chosenAvatar);return;}
   if(el.hasAttribute("data-native-save")){saveProfile();}
 });
 layer.addEventListener("change",function(e){if(e.target.id==="nativeSeasons"&&current){focusedSeason=Number(e.target.value)||1;loadEpisodeList(current,focusedSeason);}});
 document.addEventListener("keydown",function(e){if(e.key==="Escape"&&!layer.hidden){e.preventDefault();e.stopImmediatePropagation();dismiss(false);}},true);
 window.addEventListener("popstate",function(){if(!layer.hidden)dismiss(true);});
 var touchY=0;
 layer.addEventListener("touchstart",function(e){if(e.target.closest(".native-art"))touchY=e.touches[0].clientY;},{passive:true});
 layer.addEventListener("touchend",function(e){if(!touchY)return;var moved=e.changedTouches[0].clientY-touchY;touchY=0;if(moved>125&&layer.scrollTop<=10)dismiss(false);},{passive:true});
 window.NetflixNative={open:openDetails,close:dismiss};
}());