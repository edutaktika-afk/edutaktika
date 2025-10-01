// Student Empty State Handler
// Inserts a friendly placeholder if a quarter has no lessons or video lessons yet.
// Parity with teacher UX, but simplified (no create lesson CTA).
(function(){
  function isCoreQuarter(section){
    const id = section.id || '';
    return /^quarter-[1-4]$/.test(id);
  }

  function applyEmptyStates(){
    document.querySelectorAll('.quarter-section').forEach(section => {
      if(!isCoreQuarter(section)) return; // skip quizzes & assessments
      const mainContainer = section.querySelector(':scope > .lessons-container');
      if(!mainContainer) return;
      const youtubeContainer = section.querySelector('#youtube-lessons .lessons-container');

      // Skip if a blocking message already exists
      const blocking = ['No teacher found','No section set'];
      if(blocking.some(txt => mainContainer.textContent.includes(txt))){
        const existing = section.querySelector('.empty-state');
        if(existing) existing.remove();
        return;
      }

      let cardCount = 0;
      [mainContainer, youtubeContainer].forEach(c => {
        if(!c) return;
        cardCount += c.querySelectorAll('.lesson-item, .youtube-lesson-card, .video-lesson-card').length;
      });

      const existing = section.querySelector('.empty-state');
      if(cardCount === 0){
        if(!existing){
          const ph = document.createElement('div');
          ph.className = 'empty-state';
          ph.innerHTML = '<strong>No lessons available yet</strong><br><span style="font-weight:400;">Please check back soon.</span>';
          const title = section.querySelector('.quarter-title');
          if(title) title.insertAdjacentElement('afterend', ph); else section.appendChild(ph);
        }
      } else if(existing){
        existing.remove();
      }
    });
  }

  function init(){
    const observer = new MutationObserver(applyEmptyStates);
    document.querySelectorAll('.quarter-section').forEach(section => {
      if(!isCoreQuarter(section)) return;
      section.querySelectorAll('.lessons-container').forEach(c => observer.observe(c, {childList:true}));
    });
    applyEmptyStates();
    // Deferred retries for async Firebase & YouTube loads
    let tries = 0;
    const timer = setInterval(() => {
      applyEmptyStates();
      tries++;
      if(tries > 10) clearInterval(timer);
    }, 1000);
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
