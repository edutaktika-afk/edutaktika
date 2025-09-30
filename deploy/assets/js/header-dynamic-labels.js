(function(){
  function init(type){
    const cap = type[0].toUpperCase()+type.slice(1);          // Subject / Leaderboard
    const btn = document.getElementById('nav'+cap+'Btn');
    const label = document.getElementById('nav'+cap+'Label');
    const menu = document.getElementById('nav'+cap+'Menu');
    if(!btn || !label || !menu) return;

    const storageKey = 'current'+cap;
    const attr = 'data-'+type;
    const filePattern = type==='subject'
      ? /^subject_(.+?)\.html$/i
      : /^leaderboard_(.+?)\.html$/i;

    function pretty(s){
      return s.replace(/[-_]/g,' ')
              .replace(/\b\w/g,c=>c.toUpperCase());
    }
    function deriveFromPath(){
      const file = location.pathname.split('/').pop() || '';
      const m = file.match(filePattern);
      return m ? pretty(m[1]) : null;
    }
    function setLabel(name){
      label.textContent = name;
      btn.setAttribute('aria-label','Current '+type+': '+name);
      btn.classList.toggle('dynamic-active', name && name!==cap);
    }
    function markActive(name){
      menu.querySelectorAll('a['+attr+']').forEach(a=>{
        a.classList.toggle('active-item', a.getAttribute(attr)===name);
      });
    }
    function toggle(open){
      const li = btn.closest('.dropdown');
      const will = open!==undefined ? open : !li.classList.contains('open');
      li.classList.toggle('open',will);
      btn.setAttribute('aria-expanded',will?'true':'false');
    }

    const pathVal = deriveFromPath();
    const stored = localStorage.getItem(storageKey);
    const current = pathVal || stored || cap;
    setLabel(current);
    markActive(current);
    if(pathVal) localStorage.setItem(storageKey, current);

    btn.addEventListener('click',()=>toggle());
    document.addEventListener('click',e=>{
      if(!btn.contains(e.target) && !menu.contains(e.target)) toggle(false);
    });
    btn.addEventListener('keydown',e=>{
      if(e.key==='ArrowDown'){toggle(true); const first=menu.querySelector('a['+attr+']'); first&&first.focus(); e.preventDefault();}
      if(e.key==='Escape'){toggle(false);}
    });
    menu.addEventListener('keydown',e=>{
      const items=[...menu.querySelectorAll('a['+attr+']')];
      const i=items.indexOf(document.activeElement);
      if(e.key==='ArrowDown'){items[(i+1)%items.length].focus(); e.preventDefault();}
      if(e.key==='ArrowUp'){items[(i-1+items.length)%items.length].focus(); e.preventDefault();}
      if(e.key==='Home'){items[0].focus(); e.preventDefault();}
      if(e.key==='End'){items[items.length-1].focus(); e.preventDefault();}
      if(e.key==='Escape'){toggle(false); btn.focus();}
    });
    menu.addEventListener('click',e=>{
      const link = e.target.closest('a['+attr+']');
      if(!link) return;
      const val = link.getAttribute(attr);
      localStorage.setItem(storageKey,val);
      setLabel(val);
      markActive(val);
      toggle(false);
      // navigation continues naturally
    });
  }

  init('subject');
  init('leaderboard');
})();