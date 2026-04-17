//You can edit ALL of the code here

// Store episodes data globally to avoid re-fetching
let cachedEpisodes = null;

async function setup() {
  const rootElem = document.getElementById("root");

  // Show loading state
  rootElem.innerHTML = '<div class="loading">Loading episodes...</div>';

  try {
    const episodes = await fetchEpisodes();
    cachedEpisodes = episodes;
    makePageForEpisodes(episodes);
  } catch (error) {
    showError(error.message);
  }
}

async function fetchEpisodes() {
  const response = await fetch("https://api.tvmaze.com/shows/82/episodes");

  if (!response.ok) {
    throw new Error(
      `Failed to load episodes: ${response.status} ${response.statusText}`,
    );
  }

  return response.json();
}

function makePageForEpisodes(episodeList) {
  const rootElem = document.getElementById("root");
  rootElem.innerHTML = "";

  // Create controls section (search and selector)
  const controls = document.createElement("div");
  controls.className = "controls";

  // Create search input
  const searchLabel = document.createElement("label");
  searchLabel.htmlFor = "search-input";
  searchLabel.textContent = "Search Episodes: ";

  const searchInput = document.createElement("input");
  searchInput.id = "search-input";
  searchInput.type = "text";
  searchInput.placeholder = "Search by name or summary...";
  searchInput.className = "search-input";

  // Create episode selector
  const selectorLabel = document.createElement("label");
  selectorLabel.htmlFor = "episode-selector";
  selectorLabel.textContent = "Jump to Episode: ";

  const selector = document.createElement("select");
  selector.id = "episode-selector";
  selector.className = "episode-selector";

  const defaultOption = document.createElement("option");
  defaultOption.value = "";
  defaultOption.textContent = "-- Select an episode --";
  selector.appendChild(defaultOption);

  episodeList.forEach((episode) => {
    const option = document.createElement("option");
    const episodeCode = `S${String(episode.season).padStart(2, "0")}E${String(episode.number).padStart(2, "0")}`;
    option.value = episode.id;
    option.textContent = `${episodeCode} - ${episode.name}`;
    selector.appendChild(option);
  });

  controls.appendChild(searchLabel);
  controls.appendChild(searchInput);
  controls.appendChild(selectorLabel);
  controls.appendChild(selector);
  rootElem.appendChild(controls);

  // Create header with episode count
  const header = document.createElement("div");
  header.className = "header";
  const countSpan = document.createElement("span");
  countSpan.id = "episode-count";
  countSpan.textContent = episodeList.length;
  header.innerHTML = `<p>Showing <strong id="episode-count">${episodeList.length}</strong> episode(s)</p>`;
  rootElem.appendChild(header);

  // Create episodes container
  const episodesContainer = document.createElement("div");
  episodesContainer.className = "episodes-container";
  episodesContainer.id = "episodes-container";

  episodeList.forEach((episode) => {
    const episodeCard = createEpisodeCard(episode);
    episodesContainer.appendChild(episodeCard);
  });

  rootElem.appendChild(episodesContainer);

  // Add attribution
  const attribution = document.createElement("footer");
  attribution.className = "attribution";
  attribution.innerHTML = `<p>Data sourced from <a href="https://www.tvmaze.com/" target="_blank">TVMaze.com</a></p>`;
  rootElem.appendChild(attribution);

  // Add event listeners for search and selector
  searchInput.addEventListener("input", (e) => {
    filterEpisodes(e.target.value, episodeList);
  });

  selector.addEventListener("change", (e) => {
    if (e.target.value) {
      jumpToEpisode(e.target.value, episodeList);
      e.target.value = "";
    }
  });
}

function filterEpisodes(searchTerm, allEpisodes) {
  const container = document.getElementById("episodes-container");
  const countElement = document.getElementById("episode-count");
  const lowerSearchTerm = searchTerm.toLowerCase();

  let displayedCount = 0;
  const cards = container.querySelectorAll(".episode-card");

  cards.forEach((card, index) => {
    const episode = allEpisodes[index];
    const name = episode.name.toLowerCase();
    const summary = (episode.summary || "").toLowerCase();

    if (name.includes(lowerSearchTerm) || summary.includes(lowerSearchTerm)) {
      card.style.display = "";
      displayedCount++;
    } else {
      card.style.display = "none";
    }
  });

  countElement.textContent = displayedCount;
}

function jumpToEpisode(episodeId, allEpisodes) {
  const container = document.getElementById("episodes-container");
  const cards = container.querySelectorAll(".episode-card");

  let targetIndex = -1;
  allEpisodes.forEach((episode, index) => {
    if (episode.id === parseInt(episodeId)) {
      targetIndex = index;
    }
  });

  if (targetIndex !== -1) {
    // Remove highlight from all cards
    cards.forEach((card) => card.classList.remove("highlighted"));

    const targetCard = cards[targetIndex];
    // Add highlight to selected card
    targetCard.classList.add("highlighted");
    targetCard.scrollIntoView({ behavior: "smooth", block: "center" });

    // Remove highlight after 3 seconds
    setTimeout(() => {
      targetCard.classList.remove("highlighted");
    }, 3000);
  }
}

function createEpisodeCard(episode) {
  const card = document.createElement("div");
  card.className = "episode-card";

  const episodeCode = `S${String(episode.season).padStart(2, "0")}E${String(episode.number).padStart(2, "0")}`;

  const image = episode.image?.medium || "no-image.png";

  card.innerHTML = `
    <img src="${image}" alt="${episode.name}" class="episode-image" />
    <div class="episode-info">
      <h2><a href="${episode.url}" target="_blank">${episode.name}</a></h2>
      <p class="episode-code">${episodeCode}</p>
      <div class="episode-summary">${episode.summary || "No summary available"}</div>
    </div>
  `;

  return card;
}

function showError(message) {
  const rootElem = document.getElementById("root");
  rootElem.innerHTML = `
    <div class="error">
      <h2>Error Loading Episodes</h2>
      <p>${message}</p>
      <p>Please check your connection and try refreshing the page.</p>
    </div>
  `;
}

window.onload = setup;
