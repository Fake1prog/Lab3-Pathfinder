/**
 * Naruto Pathfinder - Main Application
 * Arcade Edition - Insert Coin to Start!
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
        console.log('Initializing Naruto Pathfinder Arcade Edition...');

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
            console.log('Initialization complete! Ready to play!');

            // Show welcome message
            this.showWelcomeMessage();

        } catch (error) {
            console.error('Initialization failed:', error);
            this.showErrorMessage();
        }
    }

    /**
     * Setup additional features
     */
    setupAdditionalFeatures() {
        // Add save/load functionality
        this.addSaveLoadButtons();

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
                Save Grid
            </button>
            <button id="load-btn" class="btn btn-secondary">
                Load Grid
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
        const gridDataObject = this.grid.getGridData(); // Use the new method from Grid.js
        const dataString = JSON.stringify(gridDataObject, null, 2); // Beautify JSON for readability
        const blob = new Blob([dataString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `naruto-grid-${new Date().getTime()}.json`;
        document.body.appendChild(a); // Required for Firefox
        a.click();
        document.body.removeChild(a); // Clean up
        URL.revokeObjectURL(url);

        Controls.showMessage('GRID SAVED!', 'success');
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
            try {
                const gridDataObject = JSON.parse(e.target.result);
                const success = this.grid.loadGridData(gridDataObject); // Use the new method from Grid.js

                if (success) {
                    // GridRenderer.render(); // loadGridData should handle necessary rendering or call GridRenderer.render()
                    Controls.showMessage('GRID LOADED!', 'success');
                } else {
                    Controls.showMessage('LOAD FAILED! Could not apply grid data.', 'error');
                }
            } catch (error) {
                console.error("Error processing loaded file:", error);
                Controls.showMessage('LOAD FAILED! Invalid file format.', 'error');
            }
        };
        reader.readAsText(file);

        // Reset file input to allow loading the same file again if needed
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
                // console.log(`FPS: ${fps}`);
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
            "WELCOME TO NARUTO'S PATHFINDER!",
            "HELP NARUTO REACH THE HOKAGE OFFICE!",
            "CLICK TO PLACE WALLS",
            "PRESS SPACE TO START"
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
            <h2>GAME OVER</h2>
            <p>Initialization Failed</p>
            <p>Please refresh to try again</p>
            <button onclick="location.reload()">RETRY</button>
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
            <div class="loader-symbol">LOADING</div>
            <div class="loader-text">NINJA WAY...</div>
            <div class="loader-bar">
                <div class="loader-bar-fill"></div>
            </div>
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
        font-family: 'Press Start 2P', monospace;
    }
    
    .loader-symbol {
        font-size: 2rem;
        color: var(--naruto-orange);
        margin-bottom: 1rem;
        animation: arcade-flash 0.5s step-start infinite;
        text-shadow: 0 0 20px var(--naruto-orange);
    }
    
    .loader-text {
        font-size: 1rem;
        color: var(--text-secondary);
        margin-bottom: 2rem;
        animation: arcade-flash 0.5s step-start infinite;
        animation-delay: 0.25s;
    }
    
    .loader-bar {
        width: 200px;
        height: 20px;
        background: #222;
        border: 2px solid #444;
        border-radius: 4px;
        overflow: hidden;
        margin: 0 auto;
    }
    
    .loader-bar-fill {
        height: 100%;
        background: linear-gradient(90deg, var(--naruto-orange), var(--chakra-blue));
        animation: loader-fill 1s ease-out forwards;
    }
    
    @keyframes arcade-flash {
        0%, 50% { opacity: 1; }
        51%, 100% { opacity: 0.3; }
    }
    
    @keyframes loader-fill {
        from { width: 0%; }
        to { width: 100%; }
    }
    
    .error-container {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: var(--bg-secondary);
        padding: 2rem;
        border-radius: 10px;
        border: 4px solid var(--hokage-red);
        box-shadow: 0 0 30px rgba(220, 20, 60, 0.5);
        text-align: center;
        font-family: 'Press Start 2P', monospace;
    }
    
    .error-container h2 {
        color: var(--hokage-red);
        margin-bottom: 1rem;
        font-size: 1.2rem;
    }
    
    .error-container p {
        color: var(--text-primary);
        margin-bottom: 0.5rem;
        font-size: 0.8rem;
        line-height: 1.5;
    }
    
    .error-container button {
        margin-top: 1rem;
        padding: 0.5rem 1rem;
        background: var(--hokage-red);
        color: white;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        font-size: 0.8rem;
        font-family: 'Press Start 2P', monospace;
        text-transform: uppercase;
        box-shadow: 0 3px 0 #8B0000;
        transition: all 0.1s;
    }
    
    .error-container button:hover {
        transform: translateY(-2px);
        box-shadow: 0 5px 0 #8B0000;
    }
    
    .error-container button:active {
        transform: translateY(2px);
        box-shadow: 0 1px 0 #8B0000;
    }
`;
document.head.appendChild(loaderStyle);

// Log arcade style message
console.log('%cNARUTO PATHFINDER - ARCADE EDITION', 'color: #FF6B35; font-size: 20px; font-weight: bold; text-shadow: 2px 2px 0 #000;');
console.log('%cInsert coin to continue...', 'color: #FFD700; font-size: 14px;');