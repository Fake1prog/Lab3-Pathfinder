/**
 * Naruto Pathfinder - Main Application
 * The journey to become Hokage begins here!
 */

class NarutoPathfinder {
    constructor() {
        this.grid = null;
        this.algorithm = null;
        this.isInitialized = false;
    }

    /**
     * Initialize the application
     */
    init() {
        console.log('🍥 Naruto Pathfinder Initializing...');

        try {
            // Create grid
            this.grid = new Grid(10, 10);

            // Create algorithm
            this.algorithm = new AStar(this.grid);

            // Initialize UI components
            GridRenderer.init(this.grid);
            GridRenderer.render();

            Controls.init(this.grid, this.algorithm);

            // Setup additional features
            this.setupAdditionalFeatures();

            this.isInitialized = true;
            console.log('✅ Initialization complete! Dattebayo!');

            // Show welcome message
            this.showWelcomeMessage();

        } catch (error) {
            console.error('❌ Initialization failed:', error);
            this.showErrorMessage();
        }
    }

    /**
     * Setup additional features
     */
    setupAdditionalFeatures() {
        // Add save/load functionality
        this.addSaveLoadButtons();

        // Add theme switcher (future feature)
        // this.addThemeSwitcher();

        // Add tutorial mode (future feature)
        // this.addTutorialMode();

        // Performance monitoring
        this.setupPerformanceMonitoring();
    }

    /**
     * Add save/load buttons to controls
     */
    addSaveLoadButtons() {
        const controlsPanel = document.querySelector('.controls-panel');

        const saveLoadSection = document.createElement('div');
        saveLoadSection.className = 'control-section';
        saveLoadSection.innerHTML = `
            <h3>Save/Load Mission</h3>
            <button id="save-btn" class="btn btn-secondary">
                <span class="btn-icon">💾</span> Save Grid
            </button>
            <button id="load-btn" class="btn btn-secondary">
                <span class="btn-icon">📂</span> Load Grid
            </button>
            <input type="file" id="file-input" accept=".json" style="display: none;">
        `;

        controlsPanel.appendChild(saveLoadSection);

        // Add event listeners
        document.getElementById('save-btn').addEventListener('click', () => this.saveGrid());
        document.getElementById('load-btn').addEventListener('click', () => this.loadGrid());
        document.getElementById('file-input').addEventListener('change', (e) => this.handleFileLoad(e));
    }

    /**
     * Save current grid configuration
     */
    saveGrid() {
        const data = Helpers.exportGrid(this.grid);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `naruto-grid-${new Date().getTime()}.json`;
        a.click();
        URL.revokeObjectURL(url);

        Controls.showMessage('Grid saved successfully!', 'success');
    }

    /**
     * Load grid configuration
     */
    loadGrid() {
        document.getElementById('file-input').click();
    }

    /**
     * Handle file load
     */
    handleFileLoad(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const success = Helpers.importGrid(this.grid, e.target.result);
            if (success) {
                GridRenderer.render();
                Controls.showMessage('Grid loaded successfully!', 'success');
            } else {
                Controls.showMessage('Failed to load grid!', 'error');
            }
        };
        reader.readAsText(file);

        // Reset file input
        event.target.value = '';
    }

    /**
     * Setup performance monitoring
     */
    setupPerformanceMonitoring() {
        // Monitor FPS
        let lastTime = performance.now();
        let frames = 0;

        const updateFPS = () => {
            frames++;
            const currentTime = performance.now();

            if (currentTime >= lastTime + 1000) {
                const fps = Math.round((frames * 1000) / (currentTime - lastTime));
                console.log(`FPS: ${fps}`);
                frames = 0;
                lastTime = currentTime;
            }

            requestAnimationFrame(updateFPS);
        };

        // Uncomment to enable FPS monitoring
        // updateFPS();
    }

    /**
     * Show welcome message
     */
    showWelcomeMessage() {
        const messages = [
            "Welcome to Naruto's Pathfinder! Dattebayo!",
            "Help Naruto find the fastest path to the Hokage office!",
            "Click to place walls, then hit 'Find Path!'",
            "Press SPACE to start, R to reset, C to clear path"
        ];

        let index = 0;
        messages.forEach((msg, i) => {
            setTimeout(() => {
                Controls.showMessage(msg, 'info');
            }, i * 1000);
        });
    }

    /**
     * Show error message
     */
    showErrorMessage() {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-container';
        errorDiv.innerHTML = `
            <h2>❌ Initialization Failed</h2>
            <p>Something went wrong while loading the Naruto Pathfinder.</p>
            <p>Please refresh the page and try again.</p>
            <button onclick="location.reload()">Refresh Page</button>
        `;
        document.body.appendChild(errorDiv);
    }
}

// Create and initialize the application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Add loading animation
    const loader = document.createElement('div');
    loader.className = 'loader';
    loader.innerHTML = `
        <div class="loader-content">
            <div class="loader-symbol">🍥</div>
            <div class="loader-text">Loading Ninja Way...</div>
        </div>
    `;
    document.body.appendChild(loader);

    // Initialize app after a short delay for effect
    setTimeout(() => {
        const app = new NarutoPathfinder();
        app.init();

        // Remove loader
        loader.classList.add('fade-out');
        setTimeout(() => loader.remove(), 500);

        // Make app globally accessible for debugging
        window.narutoApp = app;
    }, 1000);
});

// Add loader styles
const loaderStyle = document.createElement('style');
loaderStyle.textContent = `
    .loader {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: var(--bg-primary);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
        transition: opacity 0.5s ease-out;
    }
    
    .loader.fade-out {
        opacity: 0;
    }
    
    .loader-content {
        text-align: center;
    }
    
    .loader-symbol {
        font-size: 4rem;
        animation: spin 2s linear infinite;
    }
    
    .loader-text {
        margin-top: 1rem;
        font-size: 1.2rem;
        color: var(--naruto-orange);
        animation: pulse 1.5s ease-in-out infinite;
    }
    
    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
    
    .error-container {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: var(--bg-secondary);
        padding: 2rem;
        border-radius: 10px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
        text-align: center;
    }
    
    .error-container button {
        margin-top: 1rem;
        padding: 0.5rem 1rem;
        background: var(--naruto-orange);
        color: white;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        font-size: 1rem;
    }
    
    .error-container button:hover {
        background: var(--hokage-red);
    }
`;
document.head.appendChild(loaderStyle);

// Log ASCII art
console.log(`
    _   _                  _        
   | \\ | | __ _ _ __ _   _| |_ ___  
   |  \\| |/ _\` | '__| | | | __/ _ \\ 
   | |\\  | (_| | |  | |_| | || (_) |
   |_| \\_|\\__,_|_|   \\__,_|\\__\\___/ 
                                    
   ____       _   _      __ _           _           
  |  _ \\ __ _| |_| |__  / _(_)_ __   __| | ___ _ __ 
  | |_) / _\` | __| '_ \\| |_| | '_ \\ / _\` |/ _ \\ '__|
  |  __/ (_| | |_| | | |  _| | | | | (_| |  __/ |   
  |_|   \\__,_|\\__|_| |_|_| |_|_| |_|\\__,_|\\___|_|   
                                                    
  🍥 Dattebayo! 🍥
`);