const githubUsername = "pecoelho01";
const projectsGrid = document.getElementById("projects-grid");
const themeToggle = document.getElementById("theme-toggle");
const root = document.documentElement;
const THEME_STORAGE_KEY = "theme";
const customProjectBriefs = {
  // Adicione aqui explicacoes especificas por repositorio.
  // Exemplo:
  // "nome-do-repo": {
  //   proposal: "O que o projeto propoe resolver.",
  //   objective: "Objetivo principal e resultado esperado."
  // }
};

function getPreferredTheme() {
  try {
    const storedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    if (storedTheme === "light" || storedTheme === "dark") {
      return storedTheme;
    }
  } catch (_error) {
    // Continue with system preference when localStorage is unavailable.
  }

  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  return prefersDark ? "dark" : "light";
}

function applyTheme(theme) {
  root.setAttribute("data-theme", theme);
  if (document.body) {
    document.body.classList.toggle("theme-dark", theme === "dark");
    document.body.classList.toggle("theme-light", theme === "light");
  }

  root.style.colorScheme = theme;

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
    try {
      localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
    } catch (_error) {
      // Ignore storage failures and still apply the selected theme.
    }
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

function normalizeRepoName(name) {
  return String(name || "").trim().toLowerCase();
}

function normalizeText(text) {
  return String(text || "").trim();
}

function listTopics(topics) {
  if (!Array.isArray(topics)) {
    return [];
  }

  return topics
    .map((topic) => normalizeText(topic))
    .filter(Boolean)
    .slice(0, 4);
}

function createFallbackProposal(repo) {
  const description = normalizeText(repo.description);
  if (description) {
    return description;
  }

  const topics = listTopics(repo.topics);
  if (topics.length) {
    return `Projeto centrado em ${topics.join(", ")}.`;
  }

  if (repo.language) {
    return `Projeto em ${repo.language} para resolver um problema pratico com codigo reutilizavel.`;
  }

  return "Projeto tecnico para resolver um problema real e evoluir continuamente.";
}

function createFallbackObjective(repo) {
  const topics = listTopics(repo.topics);
  const languagePart = repo.language ? ` em ${repo.language}` : "";

  if (normalizeText(repo.homepage)) {
    return `Entregar uma solucao funcional${languagePart}, com demonstracao publica e base para melhorias futuras.`;
  }

  if (topics.length) {
    return `Consolidar competencias${languagePart} e produzir funcionalidades praticas na area de ${topics.join(", ")}.`;
  }

  return `Consolidar competencias${languagePart} e criar uma base solida para novas iteracoes.`;
}

function getProjectBrief(repo) {
  const customBrief = customProjectBriefs[normalizeRepoName(repo.name)];
  const proposal = normalizeText(customBrief && customBrief.proposal) || createFallbackProposal(repo);
  const objective = normalizeText(customBrief && customBrief.objective) || createFallbackObjective(repo);

  return { proposal, objective };
}

function createElement(tagName, className, textContent) {
  const element = document.createElement(tagName);
  if (className) {
    element.className = className;
  }
  if (typeof textContent === "string") {
    element.textContent = textContent;
  }
  return element;
}

function createProjectTopics(topics) {
  const validTopics = listTopics(topics);
  if (!validTopics.length) {
    return null;
  }

  const list = createElement("ul", "project-topics");
  validTopics.forEach((topic) => {
    const item = createElement("li", "project-topic", topic);
    list.appendChild(item);
  });

  return list;
}

function createBriefItem(label, value) {
  const item = createElement("p", "project-brief-item");
  const labelEl = createElement("span", "project-brief-label", `${label}:`);
  const valueEl = createElement("span", "project-brief-value", value);
  item.appendChild(labelEl);
  item.appendChild(valueEl);
  return item;
}

function normalizeUrl(url) {
  const cleaned = normalizeText(url);
  if (!cleaned) {
    return "";
  }
  if (cleaned.startsWith("http://") || cleaned.startsWith("https://")) {
    return cleaned;
  }
  return `https://${cleaned}`;
}

function createProjectCard(repo, index) {
  const card = document.createElement("article");
  card.className = "project-card";
  card.style.animationDelay = `${index * 80}ms`;

  const description = normalizeText(repo.description) || "Sem descricao curta disponivel.";
  const language = repo.language || "Sem linguagem";
  const { proposal, objective } = getProjectBrief(repo);
  const topicsList = createProjectTopics(repo.topics);
  const demoUrl = normalizeUrl(repo.homepage);

  const title = createElement("h3", "", repo.name);
  const descriptionEl = createElement("p", "project-description", description);
  const brief = createElement("div", "project-brief");
  brief.appendChild(createBriefItem("Proposta", proposal));
  brief.appendChild(createBriefItem("Objetivo", objective));

  const meta = createElement("div", "project-meta");
  meta.appendChild(createElement("span", "", language));
  meta.appendChild(createElement("span", "", formatDate(repo.updated_at)));

  const actions = createElement("div", "project-actions");
  const repoLink = createElement("a", "", "Abrir repositorio");
  repoLink.href = repo.html_url;
  repoLink.target = "_blank";
  repoLink.rel = "noreferrer";
  actions.appendChild(repoLink);

  if (demoUrl) {
    const demoLink = createElement("a", "", "Ver demo");
    demoLink.href = demoUrl;
    demoLink.target = "_blank";
    demoLink.rel = "noreferrer";
    actions.appendChild(demoLink);
  }

  card.appendChild(title);
  card.appendChild(descriptionEl);
  if (topicsList) {
    card.appendChild(topicsList);
  }
  card.appendChild(brief);
  card.appendChild(meta);
  card.appendChild(actions);

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
  const parsedLimit = Number.parseInt(limitAttr || "", 10);
  const path = window.location.pathname.replace(/\/+$/, "");
  const isHomePage = path === "" || path.endsWith("/index.html");
  const defaultLimit = isHomePage ? 3 : 100;
  const limit = Number.isInteger(parsedLimit) && parsedLimit > 0
    ? parsedLimit
    : defaultLimit;

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
