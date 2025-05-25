/**
 * UI Controls Handler
 * Managing all the jutsu control seals (buttons) - Arcade Edition
 */

const Controls = {
    /**
     * Initialize all controls
     */
    init(grid, algorithm) {
        this.grid = grid;
        this.algorithm = algorithm;
        this.isRunning = false;

        // Cache DOM elements
        this.elements = {
            startBtn: document.getElementById('start-btn'),
            resetBtn: document.getElementById('reset-btn'),
            clearPathBtn: document.getElementById('clear-path-btn'),
            speedSlider: document.getElementById('speed-slider'),
            speedValue: document.getElementById('speed-value'),
            gridSize: document.getElementById('grid-size'),
            resizeBtn: document.getElementById('resize-btn'),
            pathLength: document.getElementById('path-length'),
            nodesExplored: document.getElementById('nodes-explored'),
            timeTaken: document.getElementById('time-taken')
        };

        this.setupEventListeners();
        this.updateSpeedDisplay();
    },

    /**
     * Setup all event listeners
     */
    setupEventListeners() {
        // Main controls
        this.elements.startBtn.addEventListener('click', () => this.handleStart());
        this.elements.resetBtn.addEventListener('click', () => this.handleReset());
        this.elements.clearPathBtn.addEventListener('click', () => this.handleClearPath());

        // Speed control
        this.elements.speedSlider.addEventListener('input', () => this.handleSpeedChange());

        // Grid size control
        this.elements.resizeBtn.addEventListener('click', () => this.handleResize());
        this.elements.gridSize.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handleResize();
        });

        // Keyboard shortcuts
        this.setupKeyboardShortcuts();

        // Add preset patterns dropdown
        this.addPresetPatterns();
    },

    /**
     * Setup keyboard shortcuts
     */
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Prevent shortcuts when typing in input
            if (e.target.tagName === 'INPUT') return;

            switch(e.key.toLowerCase()) {
                case ' ':
                    e.preventDefault();
                    this.handleStart();
                    break;
                case 'r':
                    this.handleReset();
                    break;
                case 'c':
                    this.handleClearPath();
                    break;
                case '1':
                    this.applyPreset('maze');
                    break;
                case '2':
                    this.applyPreset('spiral');
                    break;
                case '3':
                    this.applyPreset('diagonal');
                    break;
            }
        });
    },

    /**
     * Handle start/stop button
     */
    async handleStart() {
        if (this.isRunning) {
            this.stopAlgorithm();
        } else {
            await this.startAlgorithm();
        }
    },

    /**
     * Start the pathfinding algorithm
     */
    async startAlgorithm() {
        this.isRunning = true;
        this.updateButtonStates();

        // Clear previous path
        this.grid.resetPathfinding();

        // Update stats
        this.updateStats({ pathLength: '-', nodesExplored: 0, timeTaken: 0 });

        // Run algorithm
        const result = await this.algorithm.findPath(true);

        if (result) {
            this.updateStats(result);
            this.showSuccessMessage();
        } else {
            this.showNoPathMessage();
        }

        this.isRunning = false;
        this.updateButtonStates();
    },

    /**
     * Stop the running algorithm
     */
    stopAlgorithm() {
        this.algorithm.stop();
        this.isRunning = false;
        this.updateButtonStates();
    },

    /**
     * Handle reset button
     */
    handleReset() {
        if (this.isRunning) {
            this.stopAlgorithm();
        }

        this.grid.resetGrid();
        this.updateStats({ pathLength: '-', nodesExplored: '-', timeTaken: '-' });
    },

    /**
     * Handle clear path button
     */
    handleClearPath() {
        if (this.isRunning) return;

        this.grid.resetPathfinding();
        this.updateStats({ pathLength: '-', nodesExplored: '-', timeTaken: '-' });
    },

    /**
     * Handle speed slider change
     */
    handleSpeedChange() {
        const speed = parseInt(this.elements.speedSlider.value);
        const actualSpeed = 101 - speed; // Invert for intuitive control
        this.algorithm.setSpeed(actualSpeed);
        this.updateSpeedDisplay();
    },

    /**
     * Update speed display
     */
    updateSpeedDisplay() {
        const speed = parseInt(this.elements.speedSlider.value);
        const actualSpeed = 101 - speed;
        this.elements.speedValue.textContent = `${actualSpeed}ms`;
    },

    /**
     * Handle grid resize
     */
    handleResize() {
        if (this.isRunning) return;

        const newSize = parseInt(this.elements.gridSize.value);

        // Validate size
        if (newSize < 5 || newSize > 20 || isNaN(newSize)) {
            this.elements.gridSize.value = this.grid.rows;
            this.showMessage('Grid size must be between 5 and 20!', 'error');
            return;
        }

        // Resize grid
        this.grid.resize(newSize, newSize);
        GridRenderer.render();
        this.showMessage(`Grid resized to ${newSize}x${newSize}`, 'success');
    },

    /**
     * Update button states based on algorithm state
     */
    updateButtonStates() {
        if (this.isRunning) {
            this.elements.startBtn.innerHTML = 'STOP';
            this.elements.startBtn.classList.add('btn-stop');
            this.elements.resetBtn.disabled = false;
            this.elements.clearPathBtn.disabled = true;
            this.elements.resizeBtn.disabled = true;
        } else {
            this.elements.startBtn.innerHTML = 'FIND PATH!';
            this.elements.startBtn.classList.remove('btn-stop');
            this.elements.resetBtn.disabled = false;
            this.elements.clearPathBtn.disabled = false;
            this.elements.resizeBtn.disabled = false;
        }
    },

    /**
     * Update statistics display
     */
    updateStats(stats) {
        if (stats.pathLength !== undefined) {
            this.elements.pathLength.textContent = stats.pathLength === '-' ? '-' : stats.pathLength - 1;
        }
        if (stats.nodesExplored !== undefined) {
            this.elements.nodesExplored.textContent = stats.nodesExplored;
        }
        if (stats.timeTaken !== undefined) {
            this.elements.timeTaken.textContent = stats.timeTaken === '-' ? '-' : Helpers.formatTime(stats.timeTaken);
        }
    },

    /**
     * Add preset patterns dropdown
     */
    addPresetPatterns() {
        const presetSelect = document.getElementById('preset-select');

        if (presetSelect) {
            presetSelect.addEventListener('change', (e) => {
                if (e.target.value) {
                    this.applyPreset(e.target.value);
                    e.target.value = ''; // Reset selection
                }
            });
        }
    },

    /**
     * Apply a preset pattern
     */
    applyPreset(preset) {
        if (this.isRunning) return;

        switch(preset) {
            case 'maze':
                Helpers.generateMaze(this.grid, 0.3);
                this.showMessage('RANDOM MAZE GENERATED!', 'success');
                break;
            case 'spiral':
                Helpers.patterns.spiral(this.grid);
                this.showMessage('SPIRAL PATTERN APPLIED!', 'success');
                break;
            case 'diagonal':
                Helpers.patterns.diagonal(this.grid);
                this.showMessage('DIAGONAL MAZE CREATED!', 'success');
                break;
            case 'simple':
                Helpers.patterns.simpleWalls(this.grid);
                this.showMessage('SIMPLE WALLS ADDED!', 'success');
                break;
        }

        // Clear any existing path
        this.handleClearPath();
    },

    /**
     * Show success message
     */
    showSuccessMessage() {
        this.showMessage('PATH FOUND! MISSION COMPLETE!', 'success');
    },

    /**
     * Show no path message
     */
    showNoPathMessage() {
        this.showMessage('NO PATH FOUND! GAME OVER!', 'error');
    },

    /**
     * Show a temporary message
     */
    showMessage(text, type = 'info') {
        const message = document.createElement('div');
        message.className = `message message-${type}`;
        message.textContent = text;

        document.body.appendChild(message);

        // Trigger animation
        setTimeout(() => message.classList.add('show'), 10);

        // Remove after delay
        setTimeout(() => {
            message.classList.remove('show');
            setTimeout(() => message.remove(), 300);
        }, 3000);
    }
};

// Add message styles
const messageStyle = document.createElement('style');
messageStyle.textContent = `
    .btn-stop {
        background: linear-gradient(135deg, #DC143C, #8B0000);
    }
    
    .message {
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%) translateY(-100px);
        padding: var(--spacing-md) var(--spacing-lg);
        border-radius: 8px;
        font-weight: bold;
        font-family: 'Press Start 2P', monospace;
        font-size: 0.8rem;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        transition: transform 0.3s ease-out;
        z-index: 1000;
        text-transform: uppercase;
        letter-spacing: 1px;
    }
    
    .message.show {
        transform: translateX(-50%) translateY(0);
    }
    
    .message-success {
        background: var(--leaf-green);
        color: white;
        border: 2px solid #fff;
        text-shadow: 2px 2px 0px rgba(0,0,0,0.5);
    }
    
    .message-error {
        background: var(--hokage-red);
        color: white;
        border: 2px solid #fff;
        text-shadow: 2px 2px 0px rgba(0,0,0,0.5);
    }
    
    .message-info {
        background: var(--chakra-blue);
        color: white;
        border: 2px solid #fff;
        text-shadow: 2px 2px 0px rgba(0,0,0,0.5);
    }
`;
document.head.appendChild(messageStyle);