



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