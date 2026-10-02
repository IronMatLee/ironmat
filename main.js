import './style.css'

const projects = [
  {
    id: 1,
    title: "Avoir & Être",
    description: "Jeu éducatif pour apprendre à différencier et conjuguer les verbes avoir et être.",
    icon: "🎓",
    category: "scolaire",
    categoryLabel: "Jeux Scolaires",
    url: "/avoir-etre/"
  },
  {
    id: 2,
    title: "Course Lecture",
    description: "Activité ludique pour améliorer la fluidité et la vitesse de lecture.",
    icon: "📖",
    category: "scolaire",
    categoryLabel: "Jeux Scolaires",
    url: "/course-lecture/"
  },
  {
    id: 3,
    title: "Mois & Année",
    description: "Apprendre les mois de l'année et se repérer dans le temps.",
    icon: "📅",
    category: "scolaire",
    categoryLabel: "Jeux Scolaires",
    url: "/mois-annee/"
  }
];

function renderProjects(filter = 'all') {
  const grid = document.getElementById('projects-grid');
  grid.innerHTML = '';

  const filteredProjects = projects.filter(p => filter === 'all' || p.category === filter);

  filteredProjects.forEach(project => {
    const card = document.createElement('a');
    card.href = project.url;
    card.className = 'project-card';
    card.target = '_blank';
    card.rel = 'noopener noreferrer';
    if(project.url === '#') {
      card.onclick = (e) => { e.preventDefault(); alert("Ce test n'est pas encore en ligne !"); };
    }

    card.innerHTML = `
      <div class="icon">${project.icon}</div>
      <h2>${project.title}</h2>
      <p>${project.description}</p>
      <span class="category">${project.categoryLabel}</span>
    `;

    grid.appendChild(card);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  renderProjects();

  const filterBtns = document.querySelectorAll('.filter-btn');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      // Remove active class from all
      filterBtns.forEach(b => b.classList.remove('active'));
      // Add active to clicked
      e.target.classList.add('active');
      // Filter projects
      renderProjects(e.target.dataset.filter);
    });
  });
});
