const API_URL = "http://127.0.0.1:8000/api/v1/predict_pdf";
const SKILLS_URL = "http://127.0.0.1:8000/api/v1/skills/extract_skills";

let selectedFile = null;
let currentResult = null;

const fileinput = document.getElementById('fileinput');
const uploader = document.getElementById('uploader');
const sendBtn = document.getElementById('sendBtn');
const extracted = document.getElementById('extracted');
const downloadJson = document.getElementById('downloadJson');
const clearBtn = document.getElementById('clearBtn');

const predMain = document.getElementById('predMain');
const metaFilename = document.getElementById('metaFilename');
const topList = document.getElementById('topList');
const probTableBody = document.querySelector('#probTable tbody');
const top3mini = document.getElementById('top3mini');
const skillsList = document.getElementById('skillsList');  // container for skills
const jobsList = document.getElementById('jobsList');      // container for jobs with matching/missing skills

const fmtPct = v => (v * 100).toFixed(1) + '%';

function escapeHtml(s) {
  return String(s || '').replace(/[&<>"']/g, c => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[c]);
}

/* -------------------------------------- */
/* FILE SELECTION                         */
/* -------------------------------------- */
uploader.addEventListener('click', () => fileinput.click());
['dragenter', 'dragover'].forEach(ev =>
  uploader.addEventListener(ev, e => { e.preventDefault(); e.stopPropagation(); uploader.classList.add('drag'); })
);
['dragleave', 'drop'].forEach(ev =>
  uploader.addEventListener(ev, e => { e.preventDefault(); e.stopPropagation(); uploader.classList.remove('drag'); })
);
uploader.addEventListener('drop', e => {
  const f = e.dataTransfer.files?.[0];
  if (f) handleFileSelected(f);
});
fileinput.addEventListener('change', e => {
  const f = e.target.files?.[0];
  if (f && f.type === 'application/pdf') handleFileSelected(f);
  else alert('Solo PDF permitido.');
});

function handleFileSelected(file) {
  selectedFile = file;
  uploader.querySelector('strong').textContent = file.name;
  predMain.textContent = 'Archivo listo para enviar';
  extracted.value = '';
  metaFilename.textContent = '';
  topList.innerHTML = '';
  probTableBody.innerHTML = '';
  top3mini.innerHTML = '';
  skillsList.innerHTML = '';
  jobsList.innerHTML = '';
  currentResult = null;
}

/* -------------------------------------- */
/* SEND FILE (JOB + SKILLS)               */
/* -------------------------------------- */
sendBtn.addEventListener('click', async () => {
  if (!selectedFile) return alert('Selecciona un archivo.');
  predMain.textContent = 'Procesando…';
  sendBtn.disabled = true;

  try {
    // --- Job Prediction ---
    const fd = new FormData();
    fd.append('file', selectedFile, selectedFile.name);

    const res = await fetch(API_URL, { method: 'POST', body: fd });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const data = await res.json();
    currentResult = data;

    extracted.value = data.texto_extraido || data.text || '';
    metaFilename.textContent = data.filename || selectedFile.name;

    renderTop3(data.top3 || []);
    renderTable(data.probabilidades || {});

    // Store jobs with matching/missing skills
    if (data.ranking) {
      const jobsToStore = data.ranking.map(j => ({
        job_title: j.job_title,
        matching_skills: j.matching_skills || [],
        missing_skills: (data.missing_skills_by_job?.[j.job_title]) || []
      }));
      localStorage.setItem('jobs_detected', JSON.stringify(jobsToStore));
      renderJobsWithSkills();
    }

    // --- Skills Extraction (from extracted text) ---
    const resSkills = await fetch(SKILLS_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text: extracted.value
      })
    });

    if (!resSkills.ok) throw new Error('HTTP ' + resSkills.status);
    const dataSkills = await resSkills.json();

    if (dataSkills.extracted_skills) {
      localStorage.setItem(
        'skills_detected',
        JSON.stringify(dataSkills.extracted_skills)
      );

      localStorage.setItem(
        'jobs_detected',
        JSON.stringify(
          dataSkills.ranking.map(j => ({
            job_title: j.job_title,
            matching_skills: j.matching_skills,
            missing_skills: dataSkills.missing_skills_by_job[j.job_title] || []
          }))
        )
      );
      
      localStorage.setItem('top1_job', dataSkills.top1);
    }

  } catch (e) {
    console.error(e);
    alert('Error: ' + (e.message || e));
    predMain.textContent = 'Error';
  } finally {
    sendBtn.disabled = false;
  }
});

/* -------------------------------------- */
/* DOWNLOAD JSON                           */
/* -------------------------------------- */
downloadJson.addEventListener('click', () => {
  if (!currentResult) return alert('Nada para descargar');
  const blob = new Blob([JSON.stringify(currentResult, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = (currentResult.filename || 'resultado') + '.json';
  a.click();
});

/* -------------------------------------- */
/* CLEAR STATE                             */
/* -------------------------------------- */
clearBtn.addEventListener('click', () => {
  selectedFile = null;
  extracted.value = '';
  predMain.textContent = '— Esperando archivo —';
  topList.innerHTML = '';
  probTableBody.innerHTML = '';
  top3mini.innerHTML = '';
  skillsList.innerHTML = '';
  jobsList.innerHTML = '';
  uploader.querySelector('strong').textContent = 'Haz clic o arrastra tu archivo';
  localStorage.removeItem('skills_detected');
  localStorage.removeItem('jobs_detected');
});

/* -------------------------------------- */
/* RENDER TOP 3 JOBS                        */
/* -------------------------------------- */
function renderTop3(arr) {
  topList.innerHTML = '';
  top3mini.innerHTML = '';

  if (!arr.length) {
    topList.innerHTML = '<div class="muted">Sin predicciones</div>';
    return;
  }

  arr.forEach(item => {
    const pct = fmtPct(item.prob || 0);
    top3mini.innerHTML += `${escapeHtml(item.job_title)} — ${pct}<br/>`;

    const el = document.createElement('div');
    el.className = 'top3-card';
    el.innerHTML = `
      <div class="t-left">
        <div class="t-title">${escapeHtml(item.job_title)}</div>
        <div class="t-sub muted">${pct}</div>
      </div>
      <div class="t-bar">
        <div class="bar" style="width:${(item.prob || 0) * 100}%"></div>
      </div>
    `;
    topList.appendChild(el);
  });
}

/* -------------------------------------- */
/* RENDER PROBABILITIES                    */
/* -------------------------------------- */
function renderTable(obj) {
  const entries = Object.entries(obj).sort((a, b) => b[1] - a[1]);
  probTableBody.innerHTML = '';
  entries.forEach(([k, v]) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${escapeHtml(k)}</td>
      <td style="text-align:right">${fmtPct(v)}</td>
    `;
    probTableBody.appendChild(tr);
  });
}

/* -------------------------------------- */
/* RENDER SKILLS                           */
/* -------------------------------------- */
function renderSkills() {
  const skills = JSON.parse(localStorage.getItem('skills_detected') || '[]');
  if (!skills.length) {
    skillsList.textContent = 'No se detectaron skills.';
    return;
  }
  skillsList.innerHTML = skills.map(s => `<div>${escapeHtml(s)}</div>`).join('');
}

/* -------------------------------------- */
/* RENDER JOBS WITH MATCHING & MISSING     */
/* -------------------------------------- */
function renderJobsWithSkills() {
  const jobs = JSON.parse(localStorage.getItem('jobs_detected') || '[]');
  if (!jobs.length) {
    jobsList.innerHTML = '<div>No se detectaron trabajos.</div>';
    return;
  }

  jobsList.innerHTML = jobs.map(j => `
    <div class="job-card">
      <strong>${escapeHtml(j.job_title)}</strong><br>
      Matching skills: ${j.matching_skills.join(', ') || 'Ninguna'}<br>
      Faltan: ${j.missing_skills.join(', ') || 'Ninguna'}
    </div>
  `).join('');
}

/* -------------------------------------- */
/* HIGHLIGHT BEST JOB (OPTIONAL)           */
/* -------------------------------------- */
function highlightBest() {
  const first = document.querySelector('.top3-card');
  if (first) {
    first.animate(
      [{ transform: 'scale(1)' }, { transform: 'scale(1.03)' }],
      { duration: 220, fill: 'forwards' }
    );
  }
}


// --- INITIAL RENDER IF DATA EXISTS ---
document.addEventListener('DOMContentLoaded', () => {
  renderSkills();
  renderJobsWithSkills();
});
