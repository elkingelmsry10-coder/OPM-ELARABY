(()=>{
  'use strict';
  if(window.__OPM_TOWN_POPOVER_V168__)return;
  const SELECTOR='.regional-choice[data-region="بنها_قليوب"]';
  const choices={all:'بنها + قليوب',banha:'بنها',qalyoub:'قليوب'};
  const chevron='<span class="opm-town-caret" aria-hidden="true"><svg viewBox="0 0 20 20" width="12" height="12" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m5 7.5 5 5 5-5"/></svg></span>';
  const menu=document.createElement('div');
  menu.id='opm-town-popover';menu.className='opm-town-popover';menu.dir='rtl';
  menu.setAttribute('role','group');menu.setAttribute('aria-label','تصفية بنها وقليوب');
  menu.hidden=true;
  menu.innerHTML=
    '<button type="button" data-town="all">بنها وقليوب <span aria-hidden="true">✓</span></button>'+
    '<button type="button" data-town="banha">بنها <span aria-hidden="true">✓</span></button>'+
    '<button type="button" data-town="qalyoub">قليوب <span aria-hidden="true">✓</span></button>';
  document.body.appendChild(menu);
  let anchor=null;
  const getTrigger=()=>document.querySelector(SELECTOR);
  const current=()=>['banha','qalyoub'].includes(window.__banhaQalyoubSubFilter)?window.__banhaQalyoubSubFilter:'all';
  function sync(){
    const v=current();
    document.querySelectorAll(SELECTOR).forEach(button=>{
      // Preserve the actual button, even after another module replaces/clones it.
      const text=choices[v];
      if(button.dataset.townDisplay!==v || !button.querySelector('.opm-town-caret svg')){
        button.textContent=text;
        button.insertAdjacentHTML('beforeend',chevron);
        button.dataset.townDisplay=v;
      }
      button.setAttribute('aria-keyshortcuts','Alt+ArrowDown');
      button.setAttribute('aria-haspopup','true');
      button.setAttribute('aria-controls',menu.id);
      button.setAttribute('aria-expanded',String(!menu.hidden&&button===anchor));
    });
    menu.querySelectorAll('[data-town]').forEach(button=>{
      const selected=button.dataset.town===v;
      button.classList.toggle('selected',selected);
      button.setAttribute('aria-pressed',String(selected));
    });
  }
  function position(){
    if(menu.hidden||!anchor?.isConnected)return;
    const r=anchor.getBoundingClientRect();
    const width=Math.min(172,window.innerWidth-20);
    const height=menu.offsetHeight||152;
    const left=Math.max(10,Math.min(r.right-width,window.innerWidth-width-10));
    const below=r.bottom+7;
    const above=r.top-height-7;
    const top=below+height<=window.innerHeight-10?below:
      above>=10?above:Math.max(10,Math.min(below,window.innerHeight-height-10));
    menu.style.width=width+'px';menu.style.left=left+'px';menu.style.top=top+'px';
  }
  function close(){
    menu.classList.remove('is-open');menu.hidden=true;
    const old=anchor;anchor=null;
    if(old?.isConnected)old.setAttribute('aria-expanded','false');
  }
  function open(button=getTrigger()){
    if(!button?.isConnected||button.disabled||window.__dashboardRegion!=='بنها_قليوب')return;
    anchor=button;
    menu.hidden=false;
    sync();position();
    requestAnimationFrame(()=>{if(!menu.hidden)menu.classList.add('is-open')});
  }
  // DOM delegation is essential: the site's navigation module clones/replaces
  // .regional-choice buttons during boot and on some render cycles.
  // Click on the label selects the region; ONLY the arrow toggles its sub-menu.
  // Keep delegation: the navigation module can replace/clone region buttons.
  function toggleFromArrow(button){
    if(!menu.hidden&&anchor===button){close();return;}
    close();
    requestAnimationFrame(()=>{
      // Let the original region/role handler finish first.
      // Resolve a fresh trigger in case navigation cloned the button.
      if(window.__dashboardRegion==='بنها_قليوب')open(getTrigger());
    });
  }
  document.addEventListener('click',event=>{
    const button=event.target.closest?.(SELECTOR);
    if(!button)return;
    if(!event.target.closest?.('.opm-town-caret')){close();return;}
    toggleFromArrow(button);
  },true);
  // Keyboard alternative to clicking the small arrow; Enter/Space still select region.
  document.addEventListener('keydown',event=>{
    const button=event.target.closest?.(SELECTOR);
    if(!button||!event.altKey||event.key!=='ArrowDown')return;
    event.preventDefault();
    if(window.__dashboardRegion!=='بنها_قليوب')button.click();
    toggleFromArrow(button);
  });
  menu.addEventListener('click',event=>{
    const button=event.target.closest('[data-town]');if(!button)return;
    event.preventDefault();event.stopPropagation();
    const value=button.dataset.town;
    const select=document.getElementById('banhaQalyoubSubFilter');
    if(select)select.value=value;
    window.setBanhaQalyoubTown?.(value);
    close();sync();
    const trigger=getTrigger();if(trigger?.isConnected)trigger.focus({preventScroll:true});
  });
  document.addEventListener('pointerdown',event=>{
    if(!menu.hidden&&!menu.contains(event.target)&&!anchor?.contains(event.target))close();
  },{passive:true});
  document.addEventListener('keydown',event=>{
    if(event.key==='Escape'&&!menu.hidden){const previous=anchor;close();previous?.focus({preventScroll:true})}
  });
  document.addEventListener('dashboardRegionChanged',()=>{
    if(window.__dashboardRegion!=='بنها_قليوب')close();
    sync();
  });
  window.addEventListener('resize',position,{passive:true});
  window.addEventListener('scroll',position,{passive:true,capture:true});
  sync();
  window.__OPM_TOWN_POPOVER_V168__={open,close,sync,menu,get trigger(){return getTrigger()}};
  window.__OPM_TOWN_POPOVER__=window.__OPM_TOWN_POPOVER_V168__;
})();
