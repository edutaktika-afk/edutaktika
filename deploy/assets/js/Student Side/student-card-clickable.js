(function(){
  const SELECTORS = [
    '.quarter-section .lessons-container .lesson-item',
    '#youtube-lessons .lessons-container .lesson-item',
    '#quizzesContainer .lesson-item',
    '#assessmentsContainer .lesson-item'
  ];

  function findTargetURL(card){
    // If already stored
    if(card.dataset.href) return card.dataset.href;

    // 1. Check badge/button onclick
    const badge = card.querySelector('.lesson-badge, .watch-btn');
    if(badge){
      const raw = badge.getAttribute('onclick') || '';
      const m = raw.match(/location\.href\s*=\s*['"]([^'"]+)['"]/i) ||
                raw.match(/window\.location\.href\s*=\s*['"]([^'"]+)['"]/i);
      if(m) return m[1];
    }

    // 2. Look for anchor inside (if any)
    const a = card.querySelector('a[href*=".html"], a.full-hit');
    if(a) return a.getAttribute('href');

    // 3. Video card data attribute
    if(card.dataset.watchUrl) return card.dataset.watchUrl;

    // 4. Fallback: try data-presentation (present.html)
    if(card.dataset.presentation && /quarter-\d/.test(card.closest('.quarter-section')?.id||'')){
      const quarterId = card.closest('.quarter-section').id.replace('quarter-','');
      return `present.html?name=${encodeURIComponent(card.dataset.presentation)}&quarter=${encodeURIComponent(quarterId)}`;
    }

    return null;
  }

  function enhanceCard(card){
    if(card.classList.contains('clickable-card')) return;
    const url = findTargetURL(card);
    if(!url) return;

    card.classList.add('clickable-card');
    card.setAttribute('tabindex','0');
    card.setAttribute('role','button');
    card.dataset.href = url;
    const title = (card.querySelector('h3')?.textContent || 'Lesson').trim();
    card.setAttribute('aria-label', 'Open: '+title);

    // Main click
    card.addEventListener('click', e=>{
      // If user explicitly clicked badge/button let it navigate (badge already has onclick or we override)
      if(e.target.closest('.lesson-badge, .watch-btn')) {
        // If badge lacks onclick, navigate manually
        if(!e.target.getAttribute('onclick')) window.location.href = url;
        return;
      }
      if(window.getSelection && window.getSelection().toString()) return;
      window.location.href = url;
    });

    // Keyboard
    card.addEventListener('keydown', e=>{
      if(e.key === 'Enter' || e.key === ' '){
        e.preventDefault();
        window.location.href = url;
      }
    });

    // If badge exists but no onclick, add fallback
    const badge = card.querySelector('.lesson-badge, .watch-btn');
    if(badge && !badge.getAttribute('onclick')){
      badge.addEventListener('click', ev=>{
        ev.stopPropagation();
        window.location.href = url;
      });
    }
  }

  function scan(){
    SELECTORS.forEach(sel=>{
      document.querySelectorAll(sel).forEach(enhanceCard);
    });
  }

  // Initial + observe dynamic inserts (Firebase / YouTube)
  document.addEventListener('DOMContentLoaded', ()=>{
    scan();
    const mo = new MutationObserver(scan);
    mo.observe(document.body,{subtree:true,childList:true});
    // Stop observing after 15s (enough for async loads)
    setTimeout(()=>mo.disconnect(),15000);
  });
})();