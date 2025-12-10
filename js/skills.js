// skills.js

// Get saved skills from localStorage
const saved = localStorage.getItem("skills_detected");
const box = document.getElementById("skillsBox");

if (!saved) {
  box.innerHTML = "<p class='muted'>No hay skills procesadas aún. Vuelve al matcher y procesa un CV.</p>";
} else {
  JSON.parse(saved).forEach(skill => {
    const tag = document.createElement("span");
    tag.className = "skill-pill";
    tag.textContent = skill;
    box.appendChild(tag);
  });
}

// Export skills as CSV
function exportSkills() {
  const s = localStorage.getItem("skills_detected");
  if (!s) {
    alert("No hay skills para exportar");
    return;
  }

  const arr = JSON.parse(s);
  const csv = arr.map(x => `"${x.replace(/"/g, '""')}"`).join("\n");
  const blob = new Blob([csv], { type: 'text/csv' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'skills.csv';
  a.click();
}

// Make exportSkills global so the HTML button can call it
window.exportSkills = exportSkills;
