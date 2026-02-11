const githubUsername = "pecoelho01";
const projectsGrid = document.getElementById("projects-grid");

function formatDate(date) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

function createProjectCard(repo, index) {
  const card = document.createElement("article");
  card.className = "project-card";
  card.style.animationDelay = `${index * 80}ms`;

  const description = repo.description || "Sem descrição disponível.";
  const language = repo.language || "Sem linguagem";

  card.innerHTML = `
    <h3>${repo.name}</h3>
    <p>${description}</p>
    <div class="project-meta">
      <span>${language}</span>
      <span>${formatDate(repo.updated_at)}</span>
    </div>
    <a href="${repo.html_url}" target="_blank" rel="noreferrer">Abrir repositório</a>
  `;

  return card;
}

async function loadProjects() {
  try {
    const response = await fetch(
      `https://api.github.com/users/${githubUsername}/repos?sort=updated&per_page=12`
    );

    if (!response.ok) {
      throw new Error("Erro ao carregar repositórios");
    }

    const repos = await response.json();
    const filtered = repos.filter((repo) => !repo.fork);

    if (!filtered.length) {
      projectsGrid.innerHTML =
        '<p class="status">Nenhum projeto público encontrado.</p>';
      return;
    }

    projectsGrid.innerHTML = "";
    filtered.forEach((repo, index) => {
      projectsGrid.appendChild(createProjectCard(repo, index));
    });
  } catch (error) {
    projectsGrid.innerHTML =
      '<p class="status">Não foi possível carregar os projetos agora.</p>';
    console.error(error);
  }
}

loadProjects();
