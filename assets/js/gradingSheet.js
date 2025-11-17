
(function(){
  const WW = 10, PT = 10, QA = 1;
  const WEIGHT = { WW:0.20, PT:0.60, QA:0.20 };

  const thead = document.getElementById('thead');
  const tbody = document.getElementById('tbody');

  let HPS = { WW:Array(WW).fill(10), PT:Array(PT).fill(10), QA:Array(QA).fill(50) };

  function th(txt,opts={}){ const e=document.createElement('th'); if(opts.colSpan) e.colSpan=opts.colSpan; if(opts.rowSpan) e.rowSpan=opts.rowSpan; e.textContent=txt; return e; }
  function td(txt,opts={}){ const e=document.createElement('td'); if(opts.colSpan) e.colSpan=opts.colSpan; if(opts.className) e.className=opts.className; e.textContent=txt??''; return e; }
  const s2=(n)=> (Math.round((n+Number.EPSILON)*100)/100).toFixed(2);
  const sum=(a)=> a.reduce((x,y)=>x+(parseFloat(y)||0),0);
  const ps=(tot,hps)=> hps>0 ? (tot/hps)*100 : 0;

  function buildHead(){
    thead.innerHTML='';

    const r1=document.createElement('tr');
    r1.appendChild(th("LEARNERS' NAMES",{rowSpan:3}));
    r1.appendChild(th('WRITTEN WORKS (20%)',{colSpan:WW+3}));
    r1.appendChild(th('PERFORMANCE TASKS (60%)',{colSpan:PT+3}));
    r1.appendChild(th('QUARTERLY ASSESSMENT (20%)',{colSpan:QA+2}));
    r1.appendChild(th('Initial Grade',{rowSpan:3}));
    r1.appendChild(th('Quarterly Grade',{rowSpan:3}));
    thead.appendChild(r1);

    const r2=document.createElement('tr');
    for(let i=1;i<=WW;i++) r2.appendChild(th(i));
    r2.appendChild(th('Total')); r2.appendChild(th('PS')); r2.appendChild(th('WS'));
    for(let i=1;i<=PT;i++) r2.appendChild(th(i));
    r2.appendChild(th('Total')); r2.appendChild(th('PS')); r2.appendChild(th('WS'));
    for(let i=1;i<=QA;i++) r2.appendChild(th(i));
    r2.appendChild(th('PS')); r2.appendChild(th('WS'));
    thead.appendChild(r2);

    const r3=document.createElement('tr');
    // WW HPS
    for(let i=0;i<WW;i++){
      const c=document.createElement('th'); c.className='hps-cell';
      const inp=document.createElement('input'); inp.type='number'; inp.min='1'; inp.value=HPS.WW[i];
      inp.oninput=()=>{ HPS.WW[i]=parseFloat(inp.value||'0'); recomputeAll(); updateHpsTotals(); };
      c.appendChild(inp); r3.appendChild(c);
    }
    r3.appendChild(th(s2(sum(HPS.WW))));
    r3.appendChild(th('100.00'));
    r3.appendChild(th((WEIGHT.WW*100).toFixed(0)+'%'));

    // PT HPS
    for(let i=0;i<PT;i++){
      const c=document.createElement('th'); c.className='hps-cell';
      const inp=document.createElement('input'); inp.type='number'; inp.min='1'; inp.step='0.01'; inp.value=HPS.PT[i];
      inp.oninput=()=>{ HPS.PT[i]=parseFloat(inp.value||'0'); recomputeAll(); updateHpsTotals(); };
      c.appendChild(inp); r3.appendChild(c);
    }
    r3.appendChild(th(s2(sum(HPS.PT))));
    r3.appendChild(th('100.00'));
    r3.appendChild(th((WEIGHT.PT*100).toFixed(0)+'%'));

    // QA HPS
    for(let i=0;i<QA;i++){
      const c=document.createElement('th'); c.className='hps-cell';
      const inp=document.createElement('input'); inp.type='number'; inp.min='1'; inp.step='0.01'; inp.value=HPS.QA[i];
      inp.oninput=()=>{ HPS.QA[i]=parseFloat(inp.value||'0'); recomputeAll(); };
      c.appendChild(inp); r3.appendChild(c);
    }
    r3.appendChild(th('100.00'));
    r3.appendChild(th((WEIGHT.QA*100).toFixed(0)+'%'));

    thead.appendChild(r3);
  }

  function updateHpsTotals(){
    buildHead();
  }

  function addStudentRow(name=''){
    const tr=document.createElement('tr');

    const nameTd=td('',{});
    const nameInput=document.createElement('input');
    nameInput.placeholder='Last, First M.';
    nameInput.style.width='100%';
    nameInput.style.boxSizing='border-box';
    nameInput.value=name;
    nameTd.appendChild(nameInput);
    nameTd.className='sticky-name';
    tr.appendChild(nameTd);

    // WW
    for(let i=0;i<WW;i++){
      const c=document.createElement('td');
      const inp=document.createElement('input');
      inp.type='number'; inp.step='0.01'; inp.min='0'; inp.className='score';
      inp.oninput=()=>recomputeRow(tr);
      c.appendChild(inp); tr.appendChild(c);
    }
    tr.appendChild(td('0.00',{className:'bold ww-total'}));
    tr.appendChild(td('0.00',{className:'ww-ps'}));
    tr.appendChild(td('0.00',{className:'ww-ws'}));

    // PT
    for(let i=0;i<PT;i++){
      const c=document.createElement('td');
      const inp=document.createElement('input');
      inp.type='number'; inp.step='0.01'; inp.min='0'; inp.className='score';
      inp.oninput=()=>recomputeRow(tr);
      c.appendChild(inp); tr.appendChild(c);
    }
    tr.appendChild(td('0.00',{className:'bold pt-total'}));
    tr.appendChild(td('0.00',{className:'pt-ps'}));
    tr.appendChild(td('0.00',{className:'pt-ws'}));

    // QA
    for(let i=0;i<QA;i++){
      const c=document.createElement('td');
      const inp=document.createElement('input');
      inp.type='number'; inp.step='0.01'; inp.min='0'; inp.className='score';
      inp.oninput=()=>recomputeRow(tr);
      c.appendChild(inp); tr.appendChild(c);
    }
    tr.appendChild(td('0.00',{className:'qa-ps'}));
    tr.appendChild(td('0.00',{className:'qa-ws'}));

    tr.appendChild(td('0.00',{className:'bold initial'}));
    tr.appendChild(td('0.00',{className:'bold quarterly'}));

    tbody.appendChild(tr);
    recomputeRow(tr);
  }

  function recomputeRow(tr){
    const getVals=(start,count)=> {
      const arr=[];
      for(let i=0;i<count;i++){
        const cell = tr.children[start+i].querySelector('input');
        arr.push(parseFloat(cell?.value||'0'));
      }
      return arr;
    };

    // Indices:
    // 0 name, then WW (10 inputs), then 3 cols, then PT (10 inputs) + 3, then QA (1 input) + 2, then 2 grades
    const wwScores = getVals(1, WW);
    const wwTotal = sum(wwScores);
    const wwPS = ps(wwTotal, sum(HPS.WW));
    const wwWS = wwPS * WEIGHT.WW;

    const ptStart = 1 + WW + 3;
    const ptScores = getVals(ptStart, PT);
    const ptTotal = sum(ptScores);
    const ptPS = ps(ptTotal, sum(HPS.PT));
    const ptWS = ptPS * WEIGHT.PT;

    const qaStart = ptStart + PT + 3;
    const qaScores = getVals(qaStart, QA);
    const qaPS = ps(sum(qaScores), sum(HPS.QA));
    const qaWS = qaPS * WEIGHT.QA;

    tr.querySelector('.ww-total').textContent = s2(wwTotal);
    tr.querySelector('.ww-ps').textContent    = s2(wwPS);
    tr.querySelector('.ww-ws').textContent    = s2(wwWS);

    tr.querySelector('.pt-total').textContent = s2(ptTotal);
    tr.querySelector('.pt-ps').textContent    = s2(ptPS);
    tr.querySelector('.pt-ws').textContent    = s2(ptWS);

    tr.querySelector('.qa-ps').textContent    = s2(qaPS);
    tr.querySelector('.qa-ws').textContent    = s2(qaWS);

    const initial = wwWS + ptWS + qaWS;
    tr.querySelector('.initial').textContent   = s2(initial);
    tr.querySelector('.quarterly').textContent = s2(initial);
  }

  function recomputeAll(){
    [...tbody.querySelectorAll('tr')].forEach(recomputeRow);
  }

  // Public controls
  window.addStudent = ()=> addStudentRow('');
  window.addTen = ()=> { for(let i=0;i<10;i++) addStudentRow(''); };
  window.removeLast = ()=> { const r=tbody.lastElementChild; if(r) tbody.removeChild(r); };

  // Build initial sheet
  buildHead();
  // Remove MALE/FEMALE group rows
  addStudentRow('');
  addStudentRow('');
})();


(function fixQuarterSheets(){
  // Constants (match your table sizes)
  const WW = 10, PT = 10, QA = 1;

  // Safe defaults
  const DEFAULT_WEIGHTS = { WW:0.20, PT:0.60, QA:0.20 };
  const DEFAULT_HPS = { WW:Array(WW).fill(10), PT:Array(PT).fill(10), QA:Array(QA).fill(50) };

  // DOM refs
  const thead = document.getElementById('thead');
  const tbody = document.getElementById('tbody');

  // Ensure global quarter storage
  if (!window.quarterData) {
    window.quarterData = {
      1: { weights: {...DEFAULT_WEIGHTS}, hps: JSON.parse(JSON.stringify(DEFAULT_HPS)) },
      2: { weights: {...DEFAULT_WEIGHTS}, hps: JSON.parse(JSON.stringify(DEFAULT_HPS)) },
      3: { weights: {...DEFAULT_WEIGHTS}, hps: JSON.parse(JSON.stringify(DEFAULT_HPS)) },
      4: { weights: {...DEFAULT_WEIGHTS}, hps: JSON.parse(JSON.stringify(DEFAULT_HPS)) }
    };
  }

  function getCurrentQuarter() {
    return (document.getElementById('quarterSelect')?.value || '1');
  }
  function getCurrentWeights() {
    return window.quarterData[getCurrentQuarter()].weights;
  }
  function getCurrentHPS() {
    return window.quarterData[getCurrentQuarter()].hps;
  }

  // Expose for other code paths already using these
  window.getCurrentQuarter = getCurrentQuarter;
  window.getCurrentWeights = getCurrentWeights;
  window.getCurrentHPS = getCurrentHPS;

  function getProfileInfo() {
    const grade = document.getElementById('profileGrade')?.textContent?.trim();
    const section = document.getElementById('profileSection')?.textContent?.trim();
    const schoolYear = localStorage.getItem('schoolYear');
    if (grade && grade !== '-' && section && section !== '-' && schoolYear) {
      return { grade, section, schoolYear };
    }
    return null;
  }

  function getCurrentSheetPath() {
    const user = firebase.auth().currentUser;
    if (!user) return null;
    const teacherId = user.uid;
    const subject = document.getElementById('subjectName')?.textContent.trim();
    const schoolYear = localStorage.getItem('schoolYear');
    const section = document.getElementById('profileSection')?.textContent.trim();
    const quarter = getCurrentQuarter();
    if (!teacherId || !subject || subject === "Loading..." || subject === "N/A" ||
        !schoolYear || !section || section === "-" || schoolYear === "-") {
      return null;
    }
    return `teachers/${teacherId}/gradingSheets/${subject}/${schoolYear}/${section}/${quarter}`;
  }

  function getSheetData() {
    // Collect HPS/weights from current quarter + scores from DOM
    const hps = { WW: [...getCurrentHPS().WW], PT: [...getCurrentHPS().PT], QA: [...getCurrentHPS().QA] };
    const weights = { ...getCurrentWeights() };
    const students = [];
    tbody.querySelectorAll('tr').forEach(tr => {
      const name = tr.querySelector('.sticky-name')?.textContent || '';
      const scores = [];
      tr.querySelectorAll('input.score').forEach(inp => {
        scores.push(parseFloat(inp.value) || 0);
      });
      students.push({ name, scores });
    });
    return { hps, weights, students };
  }

  function saveSheetToFirebase() {
    const path = getCurrentSheetPath();
    if (!path) return;
    const data = getSheetData();
    firebase.database().ref(path).set(data);
  }
  window.saveSheetToFirebase = saveSheetToFirebase;

  function loadSheetFromFirebase(cb) {
    const path = getCurrentSheetPath();
    if (!path) { cb(null); return; }
    firebase.database().ref(path).once('value', snap => cb(snap.val() || null));
  }
  window.loadSheetFromFirebase = loadSheetFromFirebase;

  // Build rows: prefer saved scores for this quarter, otherwise empty
  function rebuildRowsWith(data) {
    if (typeof window.buildHead === 'function') window.buildHead();
    tbody.innerHTML = '';

    const info = getProfileInfo();
    if (!info) return;

    const savedByName = new Map();
    if (data && Array.isArray(data.students)) {
      data.students.forEach(s => savedByName.set(s.name, s.scores || []));
    }

    firebase.database().ref('students').once('value', snap => {
      if (!snap.exists()) return;
      snap.forEach(child => {
        const st = child.val();
        if (
          (st.grade + '').trim() === info.grade &&
          (st.section + '').trim() === info.section &&
          (st.school_year + '').trim() === info.schoolYear
        ) {
          const name = (st.lname ? st.lname + ', ' : '') +
                       (st.fname || '') +
                       (st.mname ? ' ' + st.mname : '');
          const scores = savedByName.get(name) || [];
          if (typeof window.addStudentRowDisplayOnly === 'function') {
            window.addStudentRowDisplayOnly(name, scores);
          }
        }
      });
    });
  }

  // Ensure percent edits only affect current quarter and persist immediately
  (function wirePercentEdits(){
    const btn = document.getElementById('editPercentBtn');
    if (!btn) return;
    btn.addEventListener('click', function(){
      window.percentEditMode = !window.percentEditMode;
      if (typeof window.buildHead === 'function') window.buildHead();

      if (window.percentEditMode) {
        ['ww','pt','qa'].forEach(type => {
          const inp = document.getElementById(type + 'PercentInput');
          if (!inp) return;
          inp.addEventListener('change', function onChange(){
            inp.removeEventListener('change', onChange);
            let val = Math.max(0, Math.min(100, parseFloat(this.value) || 0));
            this.value = val;
            getCurrentWeights()[type.toUpperCase()] = val / 100;
            window.percentEditMode = false;
            if (typeof window.buildHead === 'function') window.buildHead();
            saveSheetToFirebase();
          });
        });
      }
    });
  })();

  // Quarter change: load that quarter's sheet, isolate HPS/weights per quarter
  (function wireQuarterChange(){
    const sel = document.getElementById('quarterSelect');
    if (!sel) return;

    sel.addEventListener('change', function(){
      localStorage.setItem('selectedQuarter', this.value);
      const qLbl = document.getElementById('quarterLabel');
      if (qLbl) qLbl.textContent = 'Quarter ' + this.value;
      window.percentEditMode = false;

      loadSheetFromFirebase(function(data){
        // Set HPS/weights for this quarter
        if (data && data.hps) {
          window.quarterData[getCurrentQuarter()].hps = {
            WW: Array.isArray(data.hps.WW) ? data.hps.WW : [...DEFAULT_HPS.WW],
            PT: Array.isArray(data.hps.PT) ? data.hps.PT : [...DEFAULT_HPS.PT],
            QA: Array.isArray(data.hps.QA) ? data.hps.QA : [...DEFAULT_HPS.QA]
          };
        } else {
          window.quarterData[getCurrentQuarter()].hps = JSON.parse(JSON.stringify(DEFAULT_HPS));
        }
        if (data && data.weights) {
          window.quarterData[getCurrentQuarter()].weights = {
            WW: (typeof data.weights.WW === 'number') ? data.weights.WW : DEFAULT_WEIGHTS.WW,
            PT: (typeof data.weights.PT === 'number') ? data.weights.PT : DEFAULT_WEIGHTS.PT,
            QA: (typeof data.weights.QA === 'number') ? data.weights.QA : DEFAULT_WEIGHTS.QA
          };
        } else {
          window.quarterData[getCurrentQuarter()].weights = {...DEFAULT_WEIGHTS};
        }
        // Rebuild rows with saved scores (or blanks)
        rebuildRowsWith(data);
      });
    });
  })();

  // Initial load after profile is ready
  (function initialLoad(){
    function ready() {
      const info = getProfileInfo();
      return !!info;
    }
    function tick() {
      if (!ready()) return setTimeout(tick, 150);
      // Trigger a synthetic change to load current quarter
      const sel = document.getElementById('quarterSelect');
      if (sel) sel.dispatchEvent(new Event('change'));
    }
    tick();
  })();

})();
