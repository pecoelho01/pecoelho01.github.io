const githubUsername = "pecoelho01";
const projectsGrid = document.getElementById("projects-grid");
const themeToggle = document.getElementById("theme-toggle");
const root = document.documentElement;
const THEME_STORAGE_KEY = "theme";
const customProjectBriefs = {
  // Adicione aqui explicações específicas por repositório.
  // Exemplo:
  // "nome-do-repo": {
  //   proposal: "O que o projeto propõe resolver.",
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
    themeToggle.setAttribute(
      "aria-label",
      theme === "dark" ? "Mudar para modo claro" : "Mudar para modo escuro"
    );
    themeToggle.innerHTML = theme === "dark"
      ? '<svg aria-hidden="true" viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"></circle><path d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.42-1.42M17.66 6.34l1.41-1.41"></path></svg>'
      : '<svg aria-hidden="true" viewBox="0 0 24 24"><path d="M20 14.8A8.5 8.5 0 0 1 9.2 4a7.2 7.2 0 1 0 10.8 10.8Z"></path></svg>';
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
  return new Intl.DateTimeFormat("pt-PT", {
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
    return `Projeto em ${repo.language} para resolver um problema prático com código reutilizável.`;
  }

  return "Projeto técnico para resolver um problema real e evoluir continuamente.";
}

function createFallbackObjective(repo) {
  const topics = listTopics(repo.topics);
  const languagePart = repo.language ? ` em ${repo.language}` : "";

  if (normalizeText(repo.homepage)) {
    return `Entregar uma solução funcional${languagePart}, com demonstração pública e base para melhorias futuras.`;
  }

  if (topics.length) {
    return `Consolidar competências${languagePart} e produzir funcionalidades práticas na área de ${topics.join(", ")}.`;
  }

  return `Consolidar competências${languagePart} e criar uma base sólida para novas iterações.`;
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

function getDetectedLanguage(repo) {
  if (normalizeRepoName(repo.name) === normalizeRepoName(githubUsername)) {
    return normalizeText(repo.detected_language) || normalizeText(repo.language) || "Perfil GitHub";
  }

  return normalizeText(repo.detected_language) || normalizeText(repo.language) || "Sem linguagem";
}

function createProjectCard(repo, index) {
  const card = document.createElement("article");
  card.className = "project-card";
  card.style.animationDelay = `${(index + 1) * 50}ms`;

  const language = getDetectedLanguage(repo);
  const description = normalizeText(repo.description) || "Projeto GitHub";
  const demoUrl = normalizeUrl(repo.homepage);

  const title = createElement("h3");
  const primaryLink = createElement("a");
  primaryLink.href = demoUrl || repo.html_url;
  primaryLink.target = "_blank";
  primaryLink.rel = "noreferrer";
  primaryLink.appendChild(createElement("span", "project-description", description));
  primaryLink.appendChild(createElement("span", "project-title-text", repo.name));

  const meta = createElement("div", "project-meta");
  meta.appendChild(createElement("span", "", `${language} · ${formatDate(repo.updated_at)}`));
  meta.appendChild(createElement("span", "arrow", "->"));
  primaryLink.appendChild(meta);

  title.appendChild(primaryLink);

  card.appendChild(title);

  return card;
}

async function fetchRepoLanguage(repo) {
  if (normalizeText(repo.language) || !normalizeText(repo.languages_url)) {
    return repo;
  }

  try {
    const response = await fetch(repo.languages_url, {
      headers: {
        Accept: "application/vnd.github+json",
      },
    });

    if (!response.ok) {
      return repo;
    }

    const languages = await response.json();
    const detectedLanguage = Object.entries(languages)
      .sort((first, second) => second[1] - first[1])
      .map(([language]) => language)[0];

    return {
      ...repo,
      detected_language: detectedLanguage || "",
    };
  } catch (_error) {
    return repo;
  }
}

async function enrichRepositoryLanguages(repos) {
  return Promise.all(repos.map((repo) => fetchRepoLanguage(repo)));
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

    const enrichedRepos = await enrichRepositoryLanguages(filtered);

    projectsGrid.innerHTML = "";
    enrichedRepos.forEach((repo, index) => {
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
