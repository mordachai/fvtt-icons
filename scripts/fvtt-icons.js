const MODULE_ID = "fvtt-icons";
const MAX_RENDER = 600;      // hard cap on cards/rows rendered at once (perf guard)

const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

/** Holds the loaded icon database in memory. */
let DB = null;

/**
 * Load and normalize the icon database once.
 * @returns {Promise<Array<{path,name,tags,description,haystack,tagline}>>}
 */
async function loadDatabase() {
  if (DB) return DB;
  const url = `modules/${MODULE_ID}/ImageDatabase_clean.json`;
  const raw = await foundry.utils.fetchJsonWithTimeout(url);
  DB = raw.map(entry => {
    const tags = Array.isArray(entry.tags) ? entry.tags : [];
    const description = entry.description ?? "";
    const name = entry.path.split("/").pop();
    return {
      path: entry.path,
      name,
      tags,
      description,
      tagline: tags.join(", "),
      haystack: `${name} ${tags.join(" ")} ${description}`.toLowerCase()
    };
  });
  return DB;
}

class IconSearchApp extends HandlebarsApplicationMixin(ApplicationV2) {
  static DEFAULT_OPTIONS = {
    id: "fvtt-icons-search",
    classes: ["fvtt-icons"],
    tag: "div",
    window: {
      title: "FVTT Icons — Image Search",
      icon: "fas fa-icons",
      resizable: true
    },
    position: { width: 1100, height: 720 }
  };

  static PARTS = {
    body: { template: `modules/${MODULE_ID}/templates/search.hbs` }
  };

  /** Current search string. */
  query = "";

  /** @override */
  async _prepareContext() {
    const db = await loadDatabase();
    const q = this.query.trim().toLowerCase();
    const terms = q.split(/\s+/).filter(Boolean);

    let matches;
    if (!terms.length) {
      matches = [];
    } else {
      matches = db.filter(e => terms.every(t => e.haystack.includes(t)));
    }

    const total = matches.length;
    const results = matches.slice(0, MAX_RENDER);

    return {
      query: this.query,
      hasQuery: terms.length > 0,
      total,
      shown: results.length,
      capped: total > MAX_RENDER,
      results,
      showMosaic: total > 0,
      size: game.settings.get(MODULE_ID, "previewSize"),
      libraryCount: db.length
    };
  }

  /** @override */
  _onRender(context, options) {
    const root = this.element;

    // Live search (debounced).
    const input = root.querySelector('input[name="query"]');
    if (input) {
      let timer;
      input.addEventListener("input", ev => {
        clearTimeout(timer);
        const val = ev.target.value;
        timer = setTimeout(() => {
          this.query = val;
          this.render({ parts: ["body"] });
        }, 200);
      });
      // keep focus after re-render
      input.focus();
      const len = input.value.length;
      input.setSelectionRange(len, len);
    }

    // Click anything with a path -> copy.
    for (const el of root.querySelectorAll("[data-path]")) {
      el.addEventListener("click", () => this.#choosePath(el.dataset.path));
    }

    // Preview size buttons.
    for (const btn of root.querySelectorAll(".fvtt-icons-sizes button")) {
      btn.addEventListener("click", async ev => {
        ev.stopPropagation();
        await game.settings.set(MODULE_ID, "previewSize", btn.dataset.size);
        this.render({ parts: ["body"] });
      });
    }

    // Lazy-load images only as they approach the viewport (protects the server).
    this.#observer?.disconnect();
    this.#observer = new IntersectionObserver((entries, obs) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const img = entry.target;
        img.src = img.dataset.src;
        obs.unobserve(img);
      }
    }, { root: null, rootMargin: "200px" });
    for (const img of root.querySelectorAll("img[data-src]")) this.#observer.observe(img);
  }

  #observer = null;

  /** @override */
  _onClose(options) {
    this.#observer?.disconnect();
    this.#observer = null;
    return super._onClose(options);
  }

  /** Optional callback used in picker mode: receives the chosen path. */
  onPick = null;

  /** Handle an icon being chosen (list row or mosaic card). */
  #choosePath(path) {
    if (this.onPick) {
      this.onPick(path);
      this.close();
      return;
    }
    game.clipboard.copyPlainText(path);
    ui.notifications.info(`Copied: ${path}`);
  }
}

/**
 * Open the icon search window.
 * @param {object} [options]
 * @param {(path:string)=>void} [options.onPick]  If set, runs in picker mode:
 *        clicking an icon calls this with the path and closes the window.
 * @returns {IconSearchApp}
 */
function openSearch({ onPick = null } = {}) {
  _app ??= new IconSearchApp();
  _app.onPick = onPick;
  _app.render(true);
  return _app;
}
let _app = null;

Hooks.once("init", () => {
  game.settings.register(MODULE_ID, "previewSize", {
    scope: "client",
    config: false,
    type: String,
    default: "medium"
  });
  const mod = game.modules.get(MODULE_ID);
  mod.api = { open: openSearch, IconSearchApp };
  // Global convenience accessor: Icons.Open()
  globalThis.Icons = { Open: openSearch, App: IconSearchApp };
});

// Add a shortcut button to the FilePicker that opens the search and applies the pick.
Hooks.on("renderFilePicker", (app, element) => {
  const root = element instanceof HTMLElement ? element : element?.[0];
  if (!root) return;
  // Top address bar (for button placement) and the bottom "Selected" field (the real target).
  const addressInput = root.querySelector('input[name="target"]');
  const selectedInput = root.querySelector('input[name="file"]') ?? addressInput;
  const anchor = addressInput ?? selectedInput;
  if (!anchor || !selectedInput || root.querySelector(".fvtt-icons-fp-btn")) return;

  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "fvtt-icons-fp-btn";
  btn.innerHTML = '<i class="fas fa-icons"></i>';
  btn.dataset.tooltip = "Search icons (FVTT Icons)";
  btn.addEventListener("click", ev => {
    ev.preventDefault();
    openSearch({
      onPick: path => {
        selectedInput.value = path;
        selectedInput.dispatchEvent(new Event("change", { bubbles: true }));
      }
    });
  });
  anchor.after(btn);
});

// Auto-create a launcher macro the first time the world is ready.
Hooks.once("ready", async () => {
  if (!game.user.isGM) return;
  const name = "FVTT Icons Search";
  const exists = game.macros.find(m => m.name === name && m.author?.id === game.user.id);
  if (exists) return;
  await Macro.create({
    name,
    type: "script",
    img: "icons/tools/scribal/magnifying-glass.webp",
    command: `Icons.Open();`
  });
  ui.notifications.info(`FVTT Icons: created macro "${name}". Drag it to your hotbar.`);
});
