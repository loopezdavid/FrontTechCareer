document.addEventListener('DOMContentLoaded', () => {
  const skillsBox = document.getElementById('skillsBox');
  const jobsBox = document.getElementById('jobsBox');

  let visibleJobsCount = 1; // start with top1

  /* ----------------------------- */
  /* RENDER SKILLS                 */
  /* ----------------------------- */
  function renderSkills() {
    const skills = JSON.parse(localStorage.getItem('skills_detected') || '[]');
    if (skills.length) {
      skillsBox.innerHTML = skills
        .map(s => `<span class="skill-pill">${s}</span>`)
        .join('');
    } else {
      skillsBox.innerHTML = '<p class="muted">No se detectaron skills aún.</p>';
    }
  }

  /* ----------------------------- */
  /* RENDER JOBS (WITH PAGING)     */
  /* ----------------------------- */
    function toTitleCase(str) {
      return str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase());
    }

    function renderJobs() {
      const jobs = JSON.parse(localStorage.getItem('jobs_detected') || '[]');

      if (!jobs.length) {
        jobsBox.innerHTML = '<p class="muted">No hay trabajos sugeridos aún.</p>';
        return;
      }

      const visibleJobs = jobs.slice(0, visibleJobsCount);

      const jobsHtml = visibleJobs
        .map((j, index) => `
          <div class="job-card">
            <strong class="${index === 0 ? 'prediction' : ''}">${toTitleCase(j.job_title)}</strong>

            <div class="job-skills-columns">
              <div class="job-column">
                <div class="column-title">Matching skills:</div>
                ${j.matching_skills.length 
                  ? j.matching_skills.map(s => `<div class="skill-item">${toTitleCase(s)}</div>`).join('') 
                  : '<div class="skill-item muted">Ninguna</div>'}
              </div>

              <div class="job-column">
                <div class="column-title">Faltan:</div>
                ${j.missing_skills.length 
                  ? j.missing_skills.map(s => `<div class="skill-item">${toTitleCase(s)}</div>`).join('') 
                  : '<div class="skill-item muted">Ninguna</div>'}
              </div>
            </div>
          </div>
        `)
        .join('');



      const showLoadMore = visibleJobsCount < jobs.length;
      const showShowLess = visibleJobsCount > 1;

      jobsBox.innerHTML = `
        ${jobsHtml}

        <div class="jobs-actions">
          ${showShowLess ? `<button id="lessBtn" class="btn ghost">Ver menos</button>` : ''}
          ${showLoadMore ? `<button id="moreBtn" class="btn ghost">Cargar más</button>` : ''}
        </div>
      `;

      if (showLoadMore) {
        document.getElementById('moreBtn').addEventListener('click', () => {
          visibleJobsCount = Math.min(visibleJobsCount + 3, jobs.length);
          renderJobs();
        });
      }

      if (showShowLess) {
        document.getElementById('lessBtn').addEventListener('click', () => {
          visibleJobsCount = 1;
          renderJobs();
        });
      }
    }

  /* ----------------------------- */
  /* WAIT FOR DATA (LOCALSTORAGE)  */
  /* ----------------------------- */
  const maxRetries = 10;
  let attempt = 0;

  function tryRender() {
    attempt++;
    const skills = JSON.parse(localStorage.getItem('skills_detected') || '[]');
    const jobs = JSON.parse(localStorage.getItem('jobs_detected') || '[]');

    if (skills.length || jobs.length || attempt >= maxRetries) {
      renderSkills();
      renderJobs();
    } else {
      setTimeout(tryRender, 300);
    }
  }

  tryRender();

  /* ----------------------------- */
  /* EXPORT CSV                    */
  /* ----------------------------- */
  window.exportSkills = function () {
    const skills = JSON.parse(localStorage.getItem('skills_detected') || '[]');
    if (!skills.length) return alert("No hay skills para exportar.");

    const csvContent =
      "data:text/csv;charset=utf-8," +
      "Skill\n" +
      skills.map(s => `"${s}"`).join('\n');

    const link = document.createElement("a");
    link.href = encodeURI(csvContent);
    link.download = "skills_detectadas.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  /* ----------------------------- */
  /* CLEAR STORAGE                 */
  /* ----------------------------- */
  window.clearStorage = function () {
    localStorage.removeItem('skills_detected');
    localStorage.removeItem('jobs_detected');
    location.reload();
  };
});
