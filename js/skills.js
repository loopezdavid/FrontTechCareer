document.addEventListener('DOMContentLoaded', () => {
  const skillsBox = document.getElementById('skillsBox');
  const jobsBox = document.getElementById('jobsBox');

  // Helper to render skills
  function renderSkills() {
    const skills = JSON.parse(localStorage.getItem('skills_detected') || '[]');
    if (skills.length) {
      skillsBox.innerHTML = skills.map(s => `<span class="skill-pill">${s}</span>`).join('');
    } else {
      skillsBox.innerHTML = '<p class="muted">No se detectaron skills aún.</p>';
    }
  }

  // Helper to render jobs with matching & missing skills
  function renderJobs() {
    const jobs = JSON.parse(localStorage.getItem('jobs_detected') || '[]');
    if (!jobs.length) {
      jobsBox.innerHTML = '<p class="muted">No hay trabajos sugeridos aún.</p>';
      return;
    }

    jobsBox.innerHTML = jobs.map(j => `
      <div class="job-card">
        <strong>${j.job_title}</strong><br>
        Matching skills: ${j.matching_skills?.join(', ') || 'Ninguna'}<br>
        Faltan: ${j.missing_skills?.join(', ') || 'Ninguna'}
      </div>
    `).join('');
  }

  // Keep checking localStorage in case background fetch is not done yet
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
      setTimeout(tryRender, 300); // wait 300ms and try again
    }
  }

  tryRender();

  // CSV export
  window.exportSkills = function() {
    const skills = JSON.parse(localStorage.getItem('skills_detected') || '[]');
    if (!skills.length) return alert("No hay skills para exportar.");

    const csvContent = "data:text/csv;charset=utf-8," 
      + "Skill\n" 
      + skills.map(s => `"${s}"`).join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "skills_detectadas.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // Clear localStorage
  window.clearStorage = function() {
    localStorage.removeItem('skills_detected');
    localStorage.removeItem('jobs_detected');
    location.reload();
  }
});
