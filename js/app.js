/**
 * Main Application - Naruto Pathfinder
 * The heart of the ninja pathfinding mission!
 */

// Global variables - The main ninja squad
let gameGrid;
let pathfinder;
let isPathfinding = false;
let animationSpeed = 50;
let backgroundMusic;
let isMusicEnabled = true;
let stats = {
    pathLength: 0,
    nodesExplored: 0,
    timeTaken: 0
};

// Show loading screen immediately
showLoadingScreen();

initializeBackgroundMusic();

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    console.log('🍥 Naruto Pathfinder initializing...');

    // Simulate realistic loading time for better UX
    setTimeout(() => {
        try {
            // Create the main grid (10x10 default)
            gameGrid = new Grid(10, 10);
            console.log('✅ Grid created successfully');
            updateLoadingProgress('Grid system initialized...', 25);

            setTimeout(() => {
                // Initialize the pathfinding algorithm
                pathfinder = new AStar(gameGrid);
                console.log('✅ A* Pathfinder ready');
                updateLoadingProgress('Pathfinding algorithm loaded...', 50);

                setTimeout(() => {
                    // Initialize all controls and event handlers
                    initializeControls();
                    initializeBattlefieldControls();
                    initializeKeyboardShortcuts();
                    console.log('✅ Controls initialized');
                    updateLoadingProgress('Control systems ready...', 75);

                    setTimeout(() => {
                        // Render the initial grid
                        gameGrid.render();
                        updateStats();
                        console.log('✅ Initial grid rendered');
                        updateLoadingProgress('Battlefield ready!', 100);

                        setTimeout(() => {
                            // Hide loading screen and show welcome
                            hideLoadingScreen();
                            showWelcomeMessage();
                            console.log('🚀 Naruto Pathfinder fully loaded! Ready for ninja missions!');
                        }, 500);
                    }, 300);
                }, 400);
            }, 300);

        } catch (error) {
            console.error('❌ Failed to initialize Naruto Pathfinder:', error);
            hideLoadingScreen();
            showErrorMessage('Failed to initialize the application. Please refresh the page.');
        }
    }, 800);
});

/**
 * Initialize main control handlers
 */
function initializeControls() {
    // Start pathfinding button
    const startBtn = document.getElementById('start-btn');
    if (startBtn) {
        startBtn.addEventListener('click', startPathfinding);
    }

    // Reset grid button
    const resetBtn = document.getElementById('reset-btn');
    if (resetBtn) {
        resetBtn.addEventListener('click', resetGrid);
    }

    // Clear path button
    const clearPathBtn = document.getElementById('clear-path-btn');
    if (clearPathBtn) {
        clearPathBtn.addEventListener('click', clearPath);
    }

    // Speed slider
    const speedSlider = document.getElementById('speed-slider');
    const speedValue = document.getElementById('speed-value');
    if (speedSlider && speedValue) {
        speedSlider.addEventListener('input', function() {
            animationSpeed = parseInt(this.value);
            speedValue.textContent = `${animationSpeed}ms`;
        });
        // Initialize display
        speedValue.textContent = `${animationSpeed}ms`;
    }

    // Grid size controls
    const gridSizeInput = document.getElementById('grid-size');
    const resizeBtn = document.getElementById('resize-btn');
    if (gridSizeInput && resizeBtn) {
        resizeBtn.addEventListener('click', function() {
            const newSize = parseInt(gridSizeInput.value);
            if (newSize >= 5 && newSize <= 25) {
                resizeGrid(newSize);
            } else {
                showNotification('Grid size must be between 5 and 25!', 'warning');
            }
        });

        // Allow resize on Enter key
        gridSizeInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                resizeBtn.click();
            }
        });
    }
}

/**
 * Initialize background music system
 */
function initializeBackgroundMusic() {
    try {
        // Load the background music file
        backgroundMusic = new Audio('assets/song.mp3'); // Path relative to index.html
        backgroundMusic.loop = true;
        backgroundMusic.volume = 0.3; // Set to 30% volume by default

        // Add event listeners for audio loading
        backgroundMusic.addEventListener('loadeddata', function() {
            console.log('🎵 Audio file loaded successfully from assets/song.mp3');
        });

        backgroundMusic.addEventListener('error', function(e) {
            console.warn('🎵 Audio file failed to load from assets/song.mp3', e);
            console.warn('🎵 Make sure song.mp3 exists in the assets folder');
        });

        // Setup music control event listeners
        setupMusicControls();

        // Auto-play music (browsers may block this, so we handle it gracefully)
        setTimeout(() => {
            playBackgroundMusic();
        }, 1000); // Delay to ensure everything is loaded

        console.log('🎵 Background music system initialized with assets/song.mp3');
    } catch (error) {
        console.warn('🎵 Could not initialize background music:', error);
    }
}

/**
 * Setup music control event listeners
 */
function setupMusicControls() {
    const musicToggleBtn = document.getElementById('music-toggle-btn');
    const volumeSlider = document.getElementById('volume-slider');
    const volumeDisplay = document.getElementById('volume-display');

    if (musicToggleBtn) {
        musicToggleBtn.addEventListener('click', toggleBackgroundMusic);
    }

    if (volumeSlider && volumeDisplay) {
        volumeSlider.addEventListener('input', function() {
            const volume = parseInt(this.value) / 100;
            if (backgroundMusic) {
                backgroundMusic.volume = volume;
            }
            volumeDisplay.textContent = this.value + '%';
        });
    }
}

/**
 * Play background music
 */
function playBackgroundMusic() {
    if (!backgroundMusic || !isMusicEnabled) return;

    console.log('🎵 Attempting to play background music...');

    // Modern browsers require user interaction before playing audio
    const playPromise = backgroundMusic.play();

    if (playPromise !== undefined) {
        playPromise
            .then(() => {
                console.log('🎵 Background music started successfully');
                updateMusicButton(true);
            })
            .catch(error => {
                console.log('🎵 Autoplay blocked by browser. Music will start on first user interaction.');
                console.log('🎵 Click anywhere to start the music!');
                // Add a one-time click listener to start music
                document.addEventListener('click', startMusicOnInteraction, { once: true });
                document.addEventListener('keydown', startMusicOnInteraction, { once: true });
            });
    }
}

/**
 * Start music on first user interaction (for browsers that block autoplay)
 */
function startMusicOnInteraction() {
    if (backgroundMusic && isMusicEnabled) {
        console.log('🎵 Starting music after user interaction...');
        backgroundMusic.play()
            .then(() => {
                console.log('🎵 Background music started after user interaction');
                showNotification('🎵 Background music enabled!', 'success');
                updateMusicButton(true);
            })
            .catch(error => {
                console.warn('🎵 Could not start background music:', error);
                showNotification('🎵 Music file not found or corrupted', 'error');
                updateMusicButton(false);
            });
    }
}

/**
 * Update music button appearance
 */
function updateMusicButton(isPlaying) {
    const musicToggleBtn = document.getElementById('music-toggle-btn');
    if (musicToggleBtn) {
        if (isPlaying && isMusicEnabled) {
            musicToggleBtn.innerHTML = '🔊 Music ON';
            musicToggleBtn.classList.remove('music-off');
        } else {
            musicToggleBtn.innerHTML = '🔇 Music OFF';
            musicToggleBtn.classList.add('music-off');
        }
    }
}

/**
 * Toggle background music on/off
 */
function toggleBackgroundMusic() {
    console.log('🎵 Music toggle clicked, current state:', isMusicEnabled);

    if (!backgroundMusic) {
        showNotification('🎵 Music file not available', 'error');
        return;
    }

    isMusicEnabled = !isMusicEnabled;

    if (isMusicEnabled) {
        console.log('🎵 Trying to play music...');
        backgroundMusic.play()
            .then(() => {
                console.log('🎵 Music play successful');
                updateMusicButton(true);
                showNotification('🎵 Music enabled!', 'success');
            })
            .catch(error => {
                console.warn('🎵 Music play failed:', error);
                showNotification('🎵 Could not play music - check file path', 'error');
                updateMusicButton(false);
                isMusicEnabled = false;
            });
    } else {
        console.log('🎵 Pausing music...');
        backgroundMusic.pause();
        updateMusicButton(false);
        showNotification('🎵 Music disabled', 'info');
    }
}

/**
 * Initialize battlefield controls for pre-made maps
 */
function initializeBattlefieldControls() {
    // Battlefield map loader
    const loadBattlefieldBtn = document.getElementById('load-battlefield-btn');
    const battlefieldSelect = document.getElementById('battlefield-select');

    if (loadBattlefieldBtn && battlefieldSelect) {
        loadBattlefieldBtn.addEventListener('click', loadBattlefield);

        // Also load on selection change
        battlefieldSelect.addEventListener('change', function() {
            if (this.value) {
                loadBattlefield();
            }
        });
    }

    // Pattern generator
    const generatePatternBtn = document.getElementById('generate-pattern-btn');
    const patternSelect = document.getElementById('pattern-select');

    if (generatePatternBtn && patternSelect) {
        generatePatternBtn.addEventListener('click', generatePattern);

        patternSelect.addEventListener('change', function() {
            if (this.value) {
                generatePattern();
            }
        });
    }
}


/**
 * Load selected battlefield map
 */
function loadBattlefield() {
    if (isPathfinding) {
        showNotification('Cannot change map while pathfinding is running!', 'warning');
        return;
    }

    const battlefieldSelect = document.getElementById('battlefield-select');
    const selectedMap = battlefieldSelect.value;

    if (!selectedMap) {
        showNotification('Please select a battlefield map first!', 'warning');
        return;
    }

    // Clear any existing pathfinding results first
    gameGrid.resetPathfinding();

    // Load the selected battlefield
    switch (selectedMap) {
        case 'forestOfDeath':
            Helpers.battlefieldMaps.forestOfDeath(gameGrid);
            showNotification('🌲 Forest of Death loaded! Navigate through the deadly trees.', 'success');
            break;
        case 'valleyOfTheEnd':
            Helpers.battlefieldMaps.valleyOfTheEnd(gameGrid);
            showNotification('⚔️ Valley of the End loaded! Cross the divided battlefield.', 'success');
            break;
        case 'hiddenLeafVillage':
            Helpers.battlefieldMaps.hiddenLeafVillage(gameGrid);
            showNotification('🏘️ Hidden Leaf Village loaded! Navigate through the village streets.', 'success');
            break;
        default:
            showNotification('Unknown battlefield map selected.', 'error');
            return;
    }

    // CRITICAL: Ensure no pathfinding visualization remains after map load
    gameGrid.resetPathfinding();

    // Update stats and visuals
    stats = { pathLength: 0, nodesExplored: 0, timeTaken: 0 };
    updateStats();
    updateGridVisuals();

    // Reset the dropdown to default
    setTimeout(() => {
        battlefieldSelect.selectedIndex = 0;
    }, 100);
}

/**
 * Generate selected pattern
 */
function generatePattern() {
    if (isPathfinding) {
        showNotification('Cannot generate pattern while pathfinding is running!', 'warning');
        return;
    }

    const patternSelect = document.getElementById('pattern-select');
    const selectedPattern = patternSelect.value;

    if (!selectedPattern) {
        showNotification('Please select a pattern first!', 'warning');
        return;
    }

    // Clear any existing pathfinding results first
    gameGrid.resetPathfinding();

    // Generate the selected pattern
    switch (selectedPattern) {
        case 'random':
            Helpers.generateMaze(gameGrid, 0.3);
            showNotification('🎲 Random maze generated!', 'success');
            break;
        case 'spiral':
            Helpers.patterns.spiral(gameGrid);
            showNotification('🌀 Spiral pattern created!', 'success');
            break;
        case 'diagonal':
            Helpers.patterns.diagonal(gameGrid);
            showNotification('📐 Diagonal maze generated!', 'success');
            break;
        case 'simple':
            Helpers.patterns.simpleWalls(gameGrid);
            showNotification('🧱 Simple walls pattern created!', 'success');
            break;
        default:
            showNotification('Unknown pattern selected.', 'error');
            return;
    }

    // CRITICAL: Ensure no pathfinding visualization remains after pattern generation
    gameGrid.resetPathfinding();

    // Update stats and visuals
    stats = { pathLength: 0, nodesExplored: 0, timeTaken: 0 };
    updateStats();
    updateGridVisuals();

    // Reset the dropdown to default
    setTimeout(() => {
        patternSelect.selectedIndex = 0;
    }, 100);
}

/**
 * Start pathfinding algorithm
 */
async function startPathfinding() {
    if (isPathfinding) {
        showNotification('Pathfinding is already running!', 'warning');
        return;
    }

    if (!gameGrid.startNode || !gameGrid.endNode) {
        showNotification('Please set both start and end points!', 'warning');
        return;
    }

    // Reset previous pathfinding results
    gameGrid.resetPathfinding();
    updateStats();

    // Update button state
    const startBtn = document.getElementById('start-btn');
    if (startBtn) {
        startBtn.textContent = '🔄 Finding Path...';
        startBtn.disabled = true;
    }

    isPathfinding = true;
    const startTime = performance.now();

    try {
        // Run A* algorithm with animation
        const pathfinder = new AStar(gameGrid);
        const result = await pathfinder.findPath(true, animationSpeed);

        const endTime = performance.now();
        stats.timeTaken = Math.round(endTime - startTime);

        if (result) {
            stats.pathLength = Array.isArray(result.path) ? result.path.length : 0;
            stats.nodesExplored = Array.isArray(result.visitedNodes) ? result.visitedNodes.length : (typeof result.visitedNodes === 'number' ? result.visitedNodes : 0);
            showNotification(`🎉 Path found! Length: ${stats.pathLength}, Time: ${stats.timeTaken}ms`, 'success');
        } else {
            stats.pathLength = 0;
            stats.nodesExplored = 0;
            showNotification('❌ No path exists between start and end points!', 'error');
        }

    } catch (error) {
        console.error('Pathfinding error:', error);
        showNotification('❌ An error occurred during pathfinding!', 'error');
    } finally {
        isPathfinding = false;

        // Reset button state
        if (startBtn) {
            startBtn.textContent = '🏃 Find Path!';
            startBtn.disabled = false;
        }

        updateStats();
    }
}

/**
 * Reset the entire grid
 */
function resetGrid() {
    if (isPathfinding) {
        showNotification('Cannot reset while pathfinding is running!', 'warning');
        return;
    }

    gameGrid.resetGrid();
    stats = { pathLength: 0, nodesExplored: 0, timeTaken: 0 };
    updateStats();
    showNotification('🔄 Grid reset to initial state!', 'success');
}

/**
 * Clear only the pathfinding results
 */
function clearPath() {
    if (isPathfinding) {
        showNotification('Cannot clear path while pathfinding is running!', 'warning');
        return;
    }

    gameGrid.resetPathfinding();
    stats = { pathLength: 0, nodesExplored: 0, timeTaken: 0 };
    updateStats();
    showNotification('🧹 Pathfinding results cleared!', 'success');
}

/**
 * Resize the grid
 */
function resizeGrid(newSize) {
    if (isPathfinding) {
        showNotification('Cannot resize while pathfinding is running!', 'warning');
        return;
    }

    gameGrid.resize(newSize, newSize);
    stats = { pathLength: 0, nodesExplored: 0, timeTaken: 0 };
    updateStats();
    showNotification(`📐 Grid resized to ${newSize}x${newSize}!`, 'success');
}

/**
 * Update statistics display
 */
function updateStats() {
    const pathLengthEl = document.getElementById('path-length');
    const nodesExploredEl = document.getElementById('nodes-explored');
    const timeTakenEl = document.getElementById('time-taken');

    if (pathLengthEl) pathLengthEl.textContent = typeof stats.pathLength === 'number' ? stats.pathLength : '-';
    if (nodesExploredEl) nodesExploredEl.textContent = typeof stats.nodesExplored === 'number' ? stats.nodesExplored : '-';
    if (timeTakenEl) timeTakenEl.textContent = stats.timeTaken ? `${stats.timeTaken}` : '-';
}

/**
 * Update all grid visuals
 */
function updateGridVisuals() {
    for (let row = 0; row < gameGrid.rows; row++) {
        for (let col = 0; col < gameGrid.cols; col++) {
            const node = gameGrid.nodes[row][col];
            if (node.element) {
                node.updateVisualState();
            }
        }
    }
}

/**
 * Initialize keyboard shortcuts
 */
function initializeKeyboardShortcuts() {
    document.addEventListener('keydown', function(event) {
        // Don't interfere with input fields
        if (event.target.tagName === 'INPUT' || event.target.tagName === 'SELECT') {
            return;
        }

        switch (event.key.toLowerCase()) {
            case ' ': // Spacebar - start pathfinding
                event.preventDefault();
                startPathfinding();
                break;
            case 'r': // R - reset grid
                event.preventDefault();
                resetGrid();
                break;
            case 'c': // C - clear path
                event.preventDefault();
                clearPath();
                break;
            case '1': // 1 - Load Forest of Death
                event.preventDefault();
                document.getElementById('battlefield-select').value = 'forestOfDeath';
                loadBattlefield();
                break;
            case '2': // 2 - Load Valley of the End
                event.preventDefault();
                document.getElementById('battlefield-select').value = 'valleyOfTheEnd';
                loadBattlefield();
                break;
            case '3': // 3 - Load Hidden Leaf Village
                event.preventDefault();
                document.getElementById('battlefield-select').value = 'hiddenLeafVillage';
                loadBattlefield();
                break;
            case 'm': // M - Generate random maze
                event.preventDefault();
                document.getElementById('pattern-select').value = 'random';
                generatePattern();
                break;
            case 'p': // P - Toggle music
                event.preventDefault();
                toggleBackgroundMusic();
                break;
        }
    });
}

/**
 * Show notification to user
 */
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;

    // Style the notification
    Object.assign(notification.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        padding: '12px 20px',
        borderRadius: '8px',
        fontFamily: 'Press Start 2P, monospace',
        fontSize: '10px',
        fontWeight: 'bold',
        zIndex: '1000',
        maxWidth: '300px',
        wordWrap: 'break-word',
        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
        transform: 'translateX(100%)',
        transition: 'transform 0.3s ease-out'
    });

    // Set colors based on type
    switch (type) {
        case 'success':
            notification.style.background = 'linear-gradient(135deg, #4CAF50, #45a049)';
            notification.style.color = 'white';
            notification.style.border = '2px solid #4CAF50';
            break;
        case 'warning':
            notification.style.background = 'linear-gradient(135deg, #ff9800, #f57c00)';
            notification.style.color = 'white';
            notification.style.border = '2px solid #ff9800';
            break;
        case 'error':
            notification.style.background = 'linear-gradient(135deg, #f44336, #d32f2f)';
            notification.style.color = 'white';
            notification.style.border = '2px solid #f44336';
            break;
        default:
            notification.style.background = 'linear-gradient(135deg, #2196F3, #1976D2)';
            notification.style.color = 'white';
            notification.style.border = '2px solid #2196F3';
    }

    // Add to body
    document.body.appendChild(notification);

    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);

    // Auto remove after 3 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

/**
 * Show loading screen with Naruto theme
 */
function showLoadingScreen() {
    const loadingScreen = document.createElement('div');
    loadingScreen.id = 'loading-screen';
    loadingScreen.innerHTML = `
        <div style="
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 50%, #1a1a1a 100%);
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            z-index: 10001;
            color: white;
            font-family: 'Press Start 2P', monospace;
        ">
            <!-- Naruto Logo -->
            <div style="
                font-size: clamp(24px, 5vw, 48px);
                margin-bottom: 30px;
                text-align: center;
                text-shadow: 0 0 20px #ff6b35;
                animation: logoGlow 2s ease-in-out infinite alternate;
            ">
                🍥 NARUTO PATHFINDER 🍥
            </div>
            
            <!-- Spinning Shuriken -->
            <div style="
                width: 60px;
                height: 60px;
                margin-bottom: 30px;
                font-size: 60px;
                animation: spin 2s linear infinite;
            ">
                ⭐
            </div>
            
            <!-- Loading Progress Bar -->
            <div style="
                width: 300px;
                height: 20px;
                background: #333;
                border: 2px solid #ff6b35;
                border-radius: 10px;
                overflow: hidden;
                margin-bottom: 20px;
                box-shadow: 0 0 10px rgba(255, 107, 53, 0.5);
            ">
                <div id="loading-progress" style="
                    width: 0%;
                    height: 100%;
                    background: linear-gradient(90deg, #ff6b35, #f7931e);
                    transition: width 0.5s ease;
                    border-radius: 8px;
                    box-shadow: 0 0 10px rgba(255, 107, 53, 0.7);
                "></div>
            </div>
            
            <!-- Loading Text -->
            <div id="loading-text" style="
                font-size: 12px;
                color: #ff6b35;
                text-align: center;
                margin-bottom: 20px;
                min-height: 20px;
            ">
                Preparing ninja tools...
            </div>
            
            <!-- Fun Loading Messages -->
            <div style="
                font-size: 10px;
                color: #ccc;
                text-align: center;
                line-height: 1.5;
                max-width: 400px;
            ">
                Loading the ultimate pathfinding experience...<br>
                Believe it! 🦊
            </div>
        </div>
        
        <style>
            @keyframes logoGlow {
                from { text-shadow: 0 0 20px #ff6b35; }
                to { text-shadow: 0 0 30px #ff6b35, 0 0 40px #f7931e; }
            }
            
            @keyframes spin {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
            }
        </style>
    `;

    document.body.appendChild(loadingScreen);
}

/**
 * Update loading progress
 */
function updateLoadingProgress(message, percentage) {
    const progressBar = document.getElementById('loading-progress');
    const loadingText = document.getElementById('loading-text');

    if (progressBar) {
        progressBar.style.width = percentage + '%';
    }

    if (loadingText) {
        loadingText.textContent = message;
    }
}

/**
 * Hide loading screen with smooth animation
 */
function hideLoadingScreen() {
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
        loadingScreen.style.opacity = '0';
        loadingScreen.style.transition = 'opacity 0.8s ease-out';

        setTimeout(() => {
            if (loadingScreen.parentNode) {
                loadingScreen.parentNode.removeChild(loadingScreen);
            }
        }, 800);
    }
}
function showWelcomeMessage() {
    const welcomeDiv = document.createElement('div');
    welcomeDiv.innerHTML = `
        <div style="
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(135deg, #ff6b35, #f7931e);
            color: white;
            padding: 30px;
            border-radius: 15px;
            text-align: center;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            border: 3px solid #fff;
            font-family: 'Press Start 2P', monospace;
            font-size: 12px;
            z-index: 10000;
            max-width: 400px;
        ">
            <h2 style="margin: 0 0 15px 0; color: #fff;">🍥 Welcome, Ninja! 🍥</h2>
            <p style="margin: 10px 0; line-height: 1.5;">
                Help Naruto find the fastest path to defeat Madara!
            </p>
            <p style="margin: 10px 0; font-size: 10px; line-height: 1.4;">
                • Click cells to create/remove obstacles<br>
                • Try the pre-made battlefield maps<br>
                • Drag start/end points to reposition them<br>
                • Use keyboard shortcuts: Space, R, C, 1-3, M, P<br>
                • Background music will start automatically
            </p>
            <button onclick="this.parentElement.parentElement.remove()" style="
                background: #fff;
                color: #ff6b35;
                border: none;
                padding: 10px 20px;
                border-radius: 8px;
                font-family: 'Press Start 2P', monospace;
                font-size: 10px;
                cursor: pointer;
                margin-top: 15px;
                font-weight: bold;
            ">
                Start Mission! 🚀
            </button>
        </div>
    `;

    document.body.appendChild(welcomeDiv);

    // Auto-remove after 8 seconds
    setTimeout(() => {
        if (welcomeDiv.parentNode) {
            welcomeDiv.style.opacity = '0';
            welcomeDiv.style.transition = 'opacity 0.5s';
            setTimeout(() => {
                if (welcomeDiv.parentNode) {
                    welcomeDiv.parentNode.removeChild(welcomeDiv);
                }
            }, 500);
        }
    }, 8000);
}

/**
 * Show error message
 */
function showErrorMessage(message) {
    const errorDiv = document.createElement('div');
    errorDiv.innerHTML = `
        <div style="
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #f44336, #d32f2f);
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            font-family: monospace;
            font-size: 14px;
            z-index: 10000;
            max-width: 300px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        ">
            <strong>❌ Error:</strong><br>
            ${message}
        </div>
    `;

    document.body.appendChild(errorDiv);

    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (errorDiv.parentNode) {
            errorDiv.parentNode.removeChild(errorDiv);
        }
    }, 5000);
}

/**
 * Handle window resize events
 */
window.addEventListener('resize', function() {
    // Adjust grid cell sizes if needed
    if (gameGrid) {
        // Force a re-render to adjust to new window size
        setTimeout(() => {
            gameGrid.render();
        }, 100);
    }
});

/**
 * Handle page visibility changes
 */
document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
        // Page is hidden, pause any ongoing animations
        if (isPathfinding) {
            console.log('⏸️ Pausing pathfinding due to page visibility change');
        }
    } else {
        // Page is visible again
        console.log('👁️ Page visible again, ready for ninja action!');
    }
});

/**
 * Export global references for debugging and console access
 */
window.narutoPathfinder = {
    grid: () => gameGrid,
    stats: () => stats,
    isRunning: () => isPathfinding,
    startPathfinding,
    resetGrid,
    clearPath,
    loadBattlefield,
    generatePattern,
    version: '2.0.0'
};

/**
 * Auto-save grid state periodically
 */
let autoSaveInterval;
function startAutoSave() {
    autoSaveInterval = setInterval(() => {
        if (gameGrid && !isPathfinding) {
            try {
                const gridData = gameGrid.getGridData();
                localStorage.setItem('naruto-pathfinder-autosave', JSON.stringify(gridData));
            } catch (error) {
                console.warn('Auto-save failed:', error);
            }
        }
    }, 30000); // Save every 30 seconds
}

function stopAutoSave() {
    if (autoSaveInterval) {
        clearInterval(autoSaveInterval);
        autoSaveInterval = null;
    }
}

// Start auto-save when page loads
setTimeout(startAutoSave, 5000);

// Stop auto-save when page unloads
window.addEventListener('beforeunload', function() {
    stopAutoSave();
    // Pause music when leaving page
    if (backgroundMusic) {
        backgroundMusic.pause();
    }
});