function loadSummaryTab() {
  const info = typeof getProfileInfo === "function" ? getProfileInfo() : null;
  if (!info) return;
  const { section, schoolYear } = info;
  const subject = document.getElementById('subjectName')?.textContent.trim() || 'N/A';
  const attQuarter = document.getElementById('quarterSelect')?.value || '1';
  const user = firebase.auth().currentUser;
  if (!user) return;
  const teacherId = user.uid;

  // Prepare grade paths for all quarters
  const gradePaths = [1,2,3,4].map(q =>
    firebase.database().ref(`teachers/${teacherId}/gradingSheets/${subject}/${schoolYear}/${section}/${q}`).once('value')
  );
  // Attendance path for selected quarter
  const attPath = `attendance/${subject}/${schoolYear}/${section}/${attQuarter}`;

  Promise.all([
    firebase.database().ref(attPath).once('value'),
    ...gradePaths
  ]).then(([attSnap, ...gradeSnaps]) => {
    const attData = attSnap.val() || [];
    // Build a map: { studentName: [Q1, Q2, Q3, Q4] }
    const gradesByName = {};
    gradeSnaps.forEach((snap, idx) => {
      const q = idx; // 0-based, so Q1 is idx=0
      const data = snap.val();
      if (data && data.students) {
        data.students.forEach(stu => {
          const normName = normalizeName(stu.name);
          if (!gradesByName[normName]) gradesByName[normName] = ['', '', '', ''];
          if (stu.scores && data.hps && data.weights) {
            gradesByName[normName][q] = computeInitialGrade(stu.scores, data.hps, data.weights);
          } else {
            gradesByName[normName][q] = '';
          }
        });
      }
    });

    let passCount = 0, failCount = 0;
    const tbody = document.getElementById('summaryTbody');
    tbody.innerHTML = '';

    // Collect all unique student names from gradingSheets (all quarters)
    const allNamesSet = new Set();
    gradeSnaps.forEach(snap => {
      const data = snap.val();
      if (data && data.students) {
        data.students.forEach(stu => allNamesSet.add(normalizeName(stu.name)));
      }
    });
    const allNames = Array.from(allNamesSet);

    allNames.forEach(normName => {
      // Find the original name for display (from gradingSheets)
      let displayName = '';
      for (const snap of gradeSnaps) {
        const data = snap.val();
        if (data && data.students) {
          const stu = data.students.find(s => normalizeName(s.name) === normName);
          if (stu) {
            displayName = stu.name;
            break;
          }
        }
      }
      // Fallback to normalized name if not found
      if (!displayName) displayName = normName;

      // Attendance
      const attRow = attData.find(r => normalizeName(r.name) === normName);
      const totalPresent = attRow && attRow.checks ? attRow.checks.filter(Boolean).length : 0;
      const grades = gradesByName[normName] || ['', '', '', ''];
      const safeGrades = grades.map(g => (g === null || g === undefined) ? '' : g);

      // Compute final grade (average of available quarters)
      const numericGrades = safeGrades.map(g => parseFloat(g)).filter(g => !isNaN(g));
      const finalGrade = numericGrades.length ? (numericGrades.reduce((a,b)=>a+b,0)/numericGrades.length).toFixed(2) : '';

      // Count pass/fail (only if finalGrade is not zero or blank)
      if (finalGrade && parseFloat(finalGrade) > 0) {
        if (parseFloat(finalGrade) >= 75) passCount++;
        else failCount++;
      }

      const trSum = document.createElement('tr');
      trSum.innerHTML = `
        <td>${displayName}</td>
        <td style="text-align:center;">${totalPresent}/40</td>
        <td style="text-align:center;">${safeGrades[0]}</td>
        <td style="text-align:center;">${safeGrades[1]}</td>
        <td style="text-align:center;">${safeGrades[2]}</td>
        <td style="text-align:center;">${safeGrades[3]}</td>
        <td style="text-align:center;">${finalGrade}</td>
      `;
      tbody.appendChild(trSum);
    });

    document.getElementById('summaryStats').innerHTML = `
  <div style="display:flex;justify-content:center;gap:30px;margin-bottom:10px;">
    <div style="background:#e6f9ec;border-radius:10px;padding:18px 36px;box-shadow:0 2px 8px #0001;display:flex;align-items:center;gap:12px;">
      <span style="font-size:2.2em;color:#2ecc71;"><i class="fas fa-check-circle"></i></span>
      <div>
        <div style="font-size:1.3em;font-weight:700;color:#2ecc71;">Passed</div>
        <div style="font-size:1.7em;font-weight:700;">${passCount}</div>
      </div>
    </div>
    <div style="background:#ffeaea;border-radius:10px;padding:18px 36px;box-shadow:0 2px 8px #0001;display:flex;align-items:center;gap:12px;">
      <span style="font-size:2.2em;color:#e74c3c;"><i class="fas fa-times-circle"></i></span>
      <div>
        <div style="font-size:1.3em;font-weight:700;color:#e74c3c;">Failed</div>
        <div style="font-size:1.7em;font-weight:700;">${failCount}</div>
      </div>
    </div>
  </div>
`;
  });
}

function computeInitialGrade(scores, hps, weights) {
  const WW = hps.WW.length, PT = hps.PT.length, QA = hps.QA.length;
  let idx = 0;
  const wwScores = scores.slice(idx, idx+WW); idx += WW;
  const ptScores = scores.slice(idx, idx+PT); idx += PT;
  const qaScores = scores.slice(idx, idx+QA);

  const sum = arr => arr.reduce((a,b)=>a+parseFloat(b||0),0);
  const wwHpsSum = sum(hps.WW), ptHpsSum = sum(hps.PT), qaHpsSum = sum(hps.QA);

  const wwPS = wwHpsSum ? (sum(wwScores)/wwHpsSum)*100 : 0;
  const ptPS = ptHpsSum ? (sum(ptScores)/ptHpsSum)*100 : 0;
  const qaPS = qaHpsSum ? (sum(qaScores)/qaHpsSum)*100 : 0;

  return (wwPS*weights.WW + ptPS*weights.PT + qaPS*weights.QA).toFixed(2);
}

function normalizeName(name) {
  return (name || '').trim().toLowerCase();
}


