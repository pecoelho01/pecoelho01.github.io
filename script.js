const githubUsername = "pecoelho01";
const projectsGrid = document.getElementById("projects-grid");
const themeToggle = document.getElementById("theme-toggle");
const root = document.documentElement;

function getPreferredTheme() {
  const storedTheme = localStorage.getItem("theme");
  if (storedTheme === "light" || storedTheme === "dark") {
    return storedTheme;
  }

  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  return prefersDark ? "dark" : "light";
}

function applyTheme(theme) {
  root.setAttribute("data-theme", theme);
  if (themeToggle) {
    themeToggle.textContent = theme === "dark" ? "Claro" : "Escuro";
  }
}

function setupThemeToggle() {
  const initialTheme = getPreferredTheme();
  applyTheme(initialTheme);

  if (!themeToggle) {
    return;
  }

  themeToggle.addEventListener("click", () => {
    const currentTheme = root.getAttribute("data-theme") || "light";
    const nextTheme = currentTheme === "dark" ? "light" : "dark";
    localStorage.setItem("theme", nextTheme);
    applyTheme(nextTheme);
  });
}

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

function renderStatus(message) {
  if (!projectsGrid) {
    return;
  }

  projectsGrid.innerHTML = "";
  const status = document.createElement("p");
  status.className = "status";
  status.textContent = message;
  projectsGrid.appendChild(status);
}

function renderFallbackLink() {
  if (!projectsGrid) {
    return;
  }

  const link = document.createElement("a");
  link.href = `https://github.com/${githubUsername}?tab=repositories`;
  link.target = "_blank";
  link.rel = "noreferrer";
  link.textContent = "Ver repositórios no GitHub";
  projectsGrid.appendChild(link);
}

async function loadProjects() {
  if (!projectsGrid) {
    return;
  }

  const limitAttr = projectsGrid.dataset.limit;
  const limit = Number.isInteger(Number(limitAttr)) && Number(limitAttr) > 0
    ? Number(limitAttr)
    : 12;

  try {
    const response = await fetch(
      `https://api.github.com/users/${githubUsername}/repos?sort=updated&per_page=100`,
      {
        headers: {
          Accept: "application/vnd.github+json",
        },
      }
    );

    if (!response.ok) {
      let message = `Erro ${response.status} ao carregar repositórios.`;

      try {
        const errorData = await response.json();
        if (errorData && errorData.message) {
          message = `GitHub API: ${errorData.message}`;
        }
      } catch (_error) {
        // Keep generic message if JSON parsing fails.
      }

      throw new Error(message);
    }

    const repos = await response.json();
    const filtered = repos.filter((repo) => !repo.fork).slice(0, limit);

    if (!filtered.length) {
      renderStatus("Nenhum projeto público encontrado.");
      return;
    }

    projectsGrid.innerHTML = "";
    filtered.forEach((repo, index) => {
      projectsGrid.appendChild(createProjectCard(repo, index));
    });
  } catch (error) {
    renderStatus(error.message || "Não foi possível carregar os projetos agora.");
    renderFallbackLink();
    console.error(error);
  }
}

setupThemeToggle();
loadProjects();
