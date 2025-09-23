(function(){
  const CONFIG = [
    {
      id:'quarter-5',
      type:'quiz',
      emptyHTML:`<div class="empty-qa-msg" data-role="empty-quiz">
        <strong>No quizzes available yet</strong>
        No quiz available yet. Please check back soon.
      </div>`
    },
    {
      id:'assessmentsContainer',
      type:'assessment',
      emptyHTML:`<div class="empty-qa-msg" data-role="empty-assessment">
        <strong>No assessments available yet</strong>
        No assessment available yet. Please check back soon.
      </div>`
    }
  ];

  function hasRealCards(container){
    return !!container.querySelector('.lesson-item:not(.empty-qa-msg)');
  }

  function ensure(container, cfg){
    if(!hasRealCards(container)){
      if(!container.querySelector('[data-role="empty-'+cfg.type+'"]')){
        container.insertAdjacentHTML('beforeend', cfg.emptyHTML);
      }
    } else {
      const ph = container.querySelector('[data-role="empty-'+cfg.type+'"]');
      ph && ph.remove();
    }
  }

  function runAll(){
    CONFIG.forEach(cfg=>{
      const el = document.getElementById(cfg.id);
      if(el) ensure(el, cfg);
    });
  }

  // Initial + retries (for async Firebase / YouTube injects)
  document.addEventListener('DOMContentLoaded', ()=>{
    runAll();
    const observer = new MutationObserver(runAll);
    observer.observe(document.body,{subtree:true,childList:true});
    const stops=[1500,3000,6000,10000];
    stops.forEach(t=>setTimeout(runAll,t));
    setTimeout(()=>observer.disconnect(),12000);
  });
})();