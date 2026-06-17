import { Editor } from "@components/Editor/Editor";
import { Console } from "@components/Console/Console";
import { NetworkMonitor } from "@components/NetworkMonitor/NetworkMonitor";
import { TestRunner } from "@components/TestRunner/TestRunner";
import { ChatWidget } from "@components/ChatWidget/ChatWidget";

export class UIManager {
  constructor(app) {
    this.app = app;
    this.editor = null;
    this.console = null;
    this.testRunner = null;
    this.elements = {};
    // Indicates if the user manually changed the output height
    this.outputManuallyResized = false;
  }

  async init() {
    // Créer l'interface si elle n'existe pas
    this.createUI();

    // Récupérer les éléments DOM
    this.elements = {
      editor: document.getElementById("editor"),
      console: document.getElementById("console"),
      lessonsList: document.getElementById("lessons-list"),
      lessonInfo: document.getElementById("lesson-info"),
      courseSelector: document.getElementById("course-selector"),
      runButton: document.getElementById("btn-run"),
      resetButton: document.getElementById("btn-reset"),
      chatToggleButton: document.getElementById("btn-chat-toggle"),
      sidebarToggleButton: document.getElementById("btn-sidebar-toggle"),
      mobileMenuButton: document.getElementById("btn-mobile-menu"),
      sidebar: document.getElementById("sidebar"),
      progressFill: document.getElementById("progress-fill"),
      testRunner: document.getElementById("test-runner"),
      chatWidget: document.getElementById("chat-widget"),
      outputContainer: document.getElementById("output-container"),
      outputResizer: document.getElementById("output-resizer"),
      workspaceTabs: document.querySelectorAll(".workspace-tab"),
      workspacePanels: document.querySelectorAll(".workspace-panel"),
      sidebarBackdrop: document.getElementById("sidebar-backdrop"),
    };

    this.mobileQuery = window.matchMedia("(max-width: 768px)");

    // Définir la hauteur initiale de l'output
    this.setInitialLayout();

    // Sur mobile, le menu démarre fermé (tiroir hors-écran)
    if (this.mobileQuery?.matches && this.elements.mobileMenuButton) {
      this.elements.mobileMenuButton.textContent = "☰";
    }

    // Ajuster l'output lors du redimensionnement de la fenêtre
    window.addEventListener("resize", () => {
      if (!this.outputManuallyResized) {
        this.setInitialLayout();
      }
    });

    if (
      !this.app.config?.features?.collaboration &&
      this.elements.chatToggleButton
    ) {
      this.elements.chatToggleButton.style.display = "none";
    }

    // Vérifier que les éléments critiques existent
    if (!this.elements.editor) {
      throw new Error("Editor element not found in DOM");
    }

    const requiredControls = {
      runButton: "btn-run",
      resetButton: "btn-reset",
      chatToggleButton: "btn-chat-toggle",
      sidebarToggleButton: "btn-sidebar-toggle",
    };

    const missing = Object.entries(requiredControls)
      .filter(([key]) => !this.elements[key])
      .map(([, id]) => id);

    if (missing.length) {
      const message = `UI element(s) not found: ${missing.join(", ")}`;
      this.showError(message);
      throw new Error(message);
    }

    try {
      // Initialiser l'éditeur
      this.editor = new Editor(this.elements.editor);
      await this.editor.init();

      // Initialiser la console
      // Après l'initialisation de la console
      this.console = new Console(document.getElementById("console"));

      // Initialiser le Network Monitor
      this.networkMonitor = new NetworkMonitor(
        document.getElementById("network-monitor"),
      );

      // Initialiser le Test Runner
      this.testRunner = new TestRunner(document.getElementById("test-runner"));

      if (this.app.config?.features?.collaboration) {
        this.chatWidget = new ChatWidget(
          this.elements.chatWidget,
          this.app.config.registerServer,
        );
      }

      // Gérer les onglets
      this.setupOutputTabs();
      this.setupOutputResizer();
      this.setupWorkspaceTabs();

      // Configurer les événements
      this.setupEventListeners();
    } catch (error) {
      console.error("Failed to initialize UI components:", error);
      throw error;
    }
  }

  createUI() {
    const app = document.getElementById("app");
    if (!app) {
      throw new Error("App container not found");
    }

    // Remplacer le contenu de chargement par l'interface
    app.innerHTML = `
      <header class="app-header">
        <button class="btn-icon mobile-menu-toggle" id="btn-mobile-menu" title="Menu">☰</button>
        <div class="header-brand">
          <h1>🚀 CodePlay</h1>
          <span class="header-tagline">Apprends à programmer</span>
        </div>
        <nav class="header-nav">
          <div id="course-selector" class="course-selector"></div>
          <button class="btn-icon" id="btn-settings" title="Paramètres">⚙️</button>
        </nav>
      </header>

      <main class="app-main">
        <aside class="sidebar" id="sidebar">
          <button class="btn-icon sidebar-toggle" id="btn-sidebar-toggle" title="Menu">⮜</button>
          <div class="lessons-container">
            <h2>📚 Leçons</h2>
            <div id="lessons-list" class="lessons-list">
              <div class="loading">Chargement des leçons...</div>
            </div>
          </div>
          <div class="progress-container">
            <div class="progress-bar">
              <div class="progress-fill" id="progress-fill"></div>
            </div>
            <span class="progress-text">0% complété</span>
          </div>
        </aside>
        <div class="sidebar-backdrop" id="sidebar-backdrop"></div>

        <section class="workspace">
          <div class="workspace-tabs" role="tablist">
            <button class="workspace-tab active" data-panel="lesson" role="tab" aria-controls="lesson-panel">Énoncé</button>
            <button class="workspace-tab" data-panel="editor" role="tab" aria-controls="editor-panel">Workspace</button>
          </div>
          <div class="workspace-panels">
            <div class="workspace-panel active" id="lesson-panel">
              <div class="lesson-info" id="lesson-info">
                <div class="welcome-screen">
                  <h2>Bienvenue dans CodePlay ! 👋</h2>
                  <p>Sélectionne une leçon pour commencer</p>
                </div>
              </div>
            </div>
            <div class="workspace-panel" id="editor-panel">
              <div class="editor-container">
                <div id="editor" class="editor"></div>
                <div class="floating-actions">
                  <button class="btn-primary" id="btn-run">
                    ▶️ Exécuter
                  </button>
                  <button class="btn-secondary" id="btn-reset">
                    🔄 Réinitialiser
                  </button>
                  <button class="btn-secondary" id="btn-chat-toggle">
                    💬 Chat
                  </button>
                </div>
              </div>

              <div id="chat-widget"></div>
            </div>
          </div>
          <div class="output-container" id="output-container">
            <div class="output-resizer" id="output-resizer"></div>
            <div class="output-tabs">
              <button class="output-tab active" data-panel="console">Console</button>
              <button class="output-tab" data-panel="network">Réseau</button>
              <button class="output-tab" data-panel="tests">Tests</button>
            </div>
            <div class="output-panels">
              <div class="output-panel active" id="console-panel">
                <div id="console"></div>
              </div>
              <div class="output-panel" id="network-panel">
                <div id="network-monitor"></div>
              </div>
              <div class="output-panel" id="tests-panel">
                <div id="test-runner"></div>
              </div>
            </div>
          </div>
          </section>
        </main>
    `;
  }
  setupEventListeners() {
    // Bouton Exécuter
    this.elements.runButton.addEventListener("click", () => {
      this.executeCode();
    });

    // Bouton Réinitialiser
    this.elements.resetButton.addEventListener("click", () => {
      this.resetCode();
    });

    // Bouton Chat
    if (this.elements.chatToggleButton) {
      this.elements.chatToggleButton.addEventListener("click", () => {
        this.toggleChatWidget();
      });
    }

    if (this.elements.sidebarToggleButton) {
      this.elements.sidebarToggleButton.addEventListener("click", () => {
        this.toggleSidebar();
      });
    }

    if (this.elements.mobileMenuButton) {
      this.elements.mobileMenuButton.addEventListener("click", () => {
        this.toggleSidebar();
      });
    }

    if (this.elements.sidebarBackdrop) {
      this.elements.sidebarBackdrop.addEventListener("click", () => {
        this.closeMobileSidebar();
      });
    }

    // Raccourcis clavier globaux
    document.addEventListener("editor:run", () => {
      this.executeCode();
    });

    document.addEventListener("editor:save", () => {
      this.app.saveSession();
      this.showNotification("Session sauvegardée");
    });

    // Changements dans l'éditeur
    this.editor.onDidChangeContent(() => {
      this.app.emit("editor:change", {
        code: this.editor.getValue(),
      });
    });
  }

  async executeCode() {
    const code = this.editor.getValue();

    // Désactiver le bouton pendant l'exécution
    this.elements.runButton.disabled = true;
    this.elements.runButton.textContent = "⏳ Exécution...";

    try {
      // Effacer la console
      this.console.clear();
      this.testRunner.showResults([]);

      // Exécuter le code
      const result = await this.app.modules.executeCode(code);

      // Afficher les résultats
      if (result.logs) {
        result.logs.forEach((log) => {
          this.console[log.type](...log.args);
        });
      }

      if (result.errors && result.errors.length > 0) {
        result.errors.forEach((error) => {
          this.console.error(error.message);
        });
      }

      // Vérifier si l'exercice est réussi
      if (this.app.currentLesson) {
        const { success, tests } = await this.app.lessons.checkExercise(
          code,
          result,
        );

        if (Array.isArray(tests)) {
          tests.forEach((t) => {
            if (t.pass) {
              this.console.log(`✅ ${t.name}`);
            } else {
              this.console.error(`❌ ${t.name}`);
            }
          });
          this.testRunner.showResults(tests);
        } else {
          this.testRunner.showResults([]);
        }

        if (success) {
          this.showSuccess("Exercice réussi ! 🎉");
          this.app.lessons.completeExercise(this.app.currentLesson.fullId);
        }
      } else {
        this.testRunner.showResults([]);
      }
    } catch (error) {
      this.console.error("Erreur:", error.message);
    } finally {
      // Réactiver le bouton
      this.elements.runButton.disabled = false;
      this.elements.runButton.textContent = "▶️ Exécuter";
    }
  }

  resetCode() {
    if (this.app.currentLesson) {
      const starterCode =
        this.app.currentLesson.starterCode ||
        this.app.modules.getActiveModule()?.getStarterCode() ||
        "";
      this.editor.setValue(starterCode);
      this.console.info("Code réinitialisé");
    }
  }

  // Allow external callers to reset the manual resize flag
  resetOutputResize() {
    this.outputManuallyResized = false;
  }

  showLesson(lesson) {
    if (!lesson) {
      this.elements.lessonInfo.innerHTML = `
        <div class="welcome-screen">
          <h2>Bienvenue dans CodePlay ! 👋</h2>
          <p>Sélectionne une leçon pour commencer</p>
        </div>
      `;
      return;
    }

    this.elements.lessonInfo.innerHTML = `
      <div class="lesson-header">
        <h2>${lesson.title}</h2>
        <span class="lesson-meta">${lesson.duration || "15 min"}</span>
      </div>
      <div class="lesson-content">
        ${lesson.content || "<p>Contenu de la leçon...</p>"}
      </div>
    `;
  }

  updateProgress(percentage) {
    this.elements.progressFill.style.width = `${percentage}%`;
    document.querySelector(".progress-text").textContent =
      `${Math.round(percentage)}% complété`;
  }

  showNotification(message, type = "info") {
    // Créer une notification temporaire
    const notification = document.createElement("div");
    notification.className = `notification notification-${type}`;
    notification.textContent = message;

    document.body.appendChild(notification);

    // Animation d'entrée
    setTimeout(() => notification.classList.add("show"), 10);

    // Suppression après 3 secondes
    setTimeout(() => {
      notification.classList.remove("show");
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }

  showSuccess(message) {
    this.showNotification(message, "success");
  }

  showError(message) {
    this.showNotification(message, "error");
  }

  setupOutputTabs() {
    const tabs = document.querySelectorAll(".output-tab");
    const panels = document.querySelectorAll(".output-panel");

    tabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        const targetPanel = tab.dataset.panel;

        // Mettre à jour les onglets
        tabs.forEach((t) => t.classList.remove("active"));
        tab.classList.add("active");

        // Mettre à jour les panneaux
        panels.forEach((panel) => {
          panel.classList.remove("active");
          if (panel.id === `${targetPanel}-panel`) {
            panel.classList.add("active");
          }
        });
      });
    });
  }

  setupOutputResizer() {
    const { outputResizer, outputContainer } = this.elements;
    if (!outputResizer || !outputContainer) return;

    const minHeight = parseInt(
      window.getComputedStyle(outputContainer).minHeight,
      10,
    ) || 62;
    let startY = 0;
    let startHeight = 0;

    const onMouseMove = (e) => {
      const newHeight = Math.max(startHeight + (startY - e.clientY), minHeight);
      outputContainer.style.height = `${newHeight}px`;
    };

    const stopDrag = () => {
      this.outputManuallyResized = true;
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", stopDrag);
    };

    outputResizer.addEventListener("mousedown", (e) => {
      startY = e.clientY;
      startHeight = outputContainer.offsetHeight;
      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", stopDrag);
    });

    const onTouchMove = (e) => {
      const touchY = e.touches[0].clientY;
      const newHeight = Math.max(startHeight + (startY - touchY), minHeight);
      outputContainer.style.height = `${newHeight}px`;
      e.preventDefault();
    };

    const stopTouchDrag = () => {
      this.outputManuallyResized = true;
      document.removeEventListener("touchmove", onTouchMove);
      document.removeEventListener("touchend", stopTouchDrag);
    };

    outputResizer.addEventListener(
      "touchstart",
      (e) => {
        startY = e.touches[0].clientY;
        startHeight = outputContainer.offsetHeight;
        document.addEventListener("touchmove", onTouchMove, { passive: false });
        document.addEventListener("touchend", stopTouchDrag);
      },
      { passive: true },
    );
  }

  setInitialLayout() {
    if (this.outputManuallyResized) return;
    requestAnimationFrame(() => {
      const workspace = document.querySelector(".workspace");
      const { outputContainer } = this.elements;
      if (!workspace || !outputContainer) return;
      const minHeight =
        parseInt(window.getComputedStyle(outputContainer).minHeight, 10) || 62;
      const desired = Math.max(
        Math.floor(workspace.clientHeight / 3),
        minHeight,
      );
      outputContainer.style.height = `${desired}px`;
    });
  }

  setupWorkspaceTabs() {
    const { workspaceTabs: tabs, workspacePanels: panels } = this.elements;

    tabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        const target = tab.dataset.panel;

        tabs.forEach((t) => t.classList.remove("active"));
        tab.classList.add("active");

        panels.forEach((panel) => {
          panel.classList.remove("active");
          if (panel.id === `${target}-panel`) {
            panel.classList.add("active");
          }
        });
      });
    });
  }

  toggleChatWidget() {
    const widget = this.elements.chatWidget;
    const btn = this.elements.chatToggleButton;
    if (!widget || !btn) return;
    const visible = widget.classList.toggle("visible");
    btn.textContent = visible ? "❌ Fermer" : "💬 Chat";
  }

  toggleSidebar() {
    const sidebar = this.elements.sidebar;
    if (!sidebar) return;

    if (this.mobileQuery?.matches) {
      const open = sidebar.classList.toggle("mobile-open");
      this.elements.sidebarBackdrop?.classList.toggle("visible", open);
      if (this.elements.mobileMenuButton) {
        this.elements.mobileMenuButton.textContent = open ? "✕" : "☰";
      }
      return;
    }

    const collapsed = sidebar.classList.toggle("collapsed");
    const btn = this.elements.sidebarToggleButton;
    if (btn) {
      btn.textContent = collapsed ? "⮞" : "⮜";
    }
  }

  closeMobileSidebar() {
    const sidebar = this.elements.sidebar;
    if (!sidebar) return;
    sidebar.classList.remove("mobile-open");
    this.elements.sidebarBackdrop?.classList.remove("visible");
    if (this.elements.mobileMenuButton) {
      this.elements.mobileMenuButton.textContent = "☰";
    }
  }
  showLoading(message = "Chargement...") {
    // Créer ou mettre à jour l'overlay de chargement
    let loader = document.getElementById("global-loader");

    if (!loader) {
      loader = document.createElement("div");
      loader.id = "global-loader";
      loader.className = "loading-overlay";
      document.body.appendChild(loader);
    }

    loader.innerHTML = `
    <div class="loading-content">
      <div class="loading-spinner"></div>
      <p class="loading-message">${message}</p>
    </div>
  `;

    loader.classList.add("show");
  }

  hideLoading() {
    const loader = document.getElementById("global-loader");
    if (loader) {
      loader.classList.remove("show");
      // Retirer complètement après l'animation
      setTimeout(() => {
        if (!loader.classList.contains("show")) {
          loader.remove();
        }
      }, 300);
    }
  }
}
