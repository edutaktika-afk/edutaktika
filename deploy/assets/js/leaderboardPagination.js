(function(){
  function buildBadges(rank){
    if(rank===1) return '🏅🏅🏅';
    if(rank===2) return '🏅🏅';
    return '🏅';
  }
  function renderPage(data, page, rowsPerPage, tbody){
    const start = (page-1)*rowsPerPage;
    const slice = data.slice(start, start+rowsPerPage);
    let html = '';
    slice.forEach((s,i)=>{
      const globalRank = start + i + 1;
      const avatar = s.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent((s.fname||'')+(s.lname||''))}`;
      const name = ((s.fname||'')+' '+(s.lname||'')).trim();
      html += `
        <tr${globalRank===1?' class="me"':''}>
          <td>${globalRank}</td>
          <td>
            <span class="player-cell">
              <img src="${avatar}" class="avatar-small" alt="${name}">
              <span class="player-name">${name}</span>
              <span class="tooltiptext">${globalRank===1?'Top scorer!':'Great job!'}</span>
            </span>
          </td>
          <td>${s.quizPoints||0}</td>
          <td>${s.assessmentPoints||0}</td>
          <td>${s.combinedPoints||0}</td>
          <td>${buildBadges(globalRank)}</td>
        </tr>`;
    });
    tbody.innerHTML = html || `<tr><td colspan="6" style="text-align:center;padding:18px;">No data</td></tr>`;
  }
  function renderPagination(data, page, rowsPerPage, container, onChange){
    const totalPages = Math.ceil(data.length / rowsPerPage);
    if(totalPages <= 1){ container.innerHTML=''; return; }
    let html = `<button class="pg-btn" data-page="prev" ${page===1?'disabled':''} aria-label="Previous page">«</button>`;
    for(let p=1;p<=totalPages;p++){
      html += `<button class="pg-btn${p===page?' active':''}" data-page="${p}" aria-current="${p===page?'page':'false'}">${p}</button>`;
    }
    html += `<button class="pg-btn" data-page="next" ${page===totalPages?'disabled':''} aria-label="Next page">»</button>`;
    container.innerHTML = html;
    container.querySelectorAll('.pg-btn').forEach(btn=>{
      btn.onclick = ()=>{
        let target = btn.getAttribute('data-page');
        if(target==='prev') target = Math.max(1,page-1);
        else if(target==='next') target = Math.min(totalPages,page+1);
        else target = parseInt(target,10);
        if(target!==page) onChange(target);
      };
    });
  }
  window.applyLeaderboardPagination = function(students, options){
    const {
      tbodyId='leaderboard-body',
      paginationId='pagination',
      rowsPerPage=10
    } = options||{};
    const tbody = document.getElementById(tbodyId);
    const pag = document.getElementById(paginationId);
    if(!tbody || !pag) return;
    let currentPage = 1;
    function go(p){
      currentPage = p;
      renderPage(students, currentPage, rowsPerPage, tbody);
      renderPagination(students, currentPage, rowsPerPage, pag, go);
    }
    go(1);
  };
})();