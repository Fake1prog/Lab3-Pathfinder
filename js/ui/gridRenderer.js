/**
 * Grid Renderer
 * Handles all grid rendering and visual updates
 * Like Sai painting the battlefield
 */

const GridRenderer = {
    /**
     * Initialize the renderer
     */
    init(grid) {
        this.grid = grid;
        this.gridElement = document.getElementById('game-grid');
        this.setupEventListeners();
    },

    /**
     * Setup global event listeners
     */
    setupEventListeners() {
        // Prevent context menu on grid
        this.gridElement.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });

        // Touch support for mobile
        this.setupTouchSupport();
    },

    /**
     * Setup touch support for mobile devices
     */
    setupTouchSupport() {
        let touchStartNode = null;

        this.gridElement.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const element = document.elementFromPoint(touch.clientX, touch.clientY);

            if (element && element.classList.contains('grid-cell')) {
                const row = parseInt(element.dataset.row);
                const col = parseInt(element.dataset.col);
                touchStartNode = { row, col };
                this.grid.handleMouseDown(row, col);
            }
        });

        this.gridElement.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const element = document.elementFromPoint(touch.clientX, touch.clientY);

            if (element && element.classList.contains('grid-cell')) {
                const row = parseInt(element.dataset.row);
                const col = parseInt(element.dataset.col);
                this.grid.handleMouseEnter(row, col);
            }
        });

        this.gridElement.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.grid.handleMouseUp();
        });
    },

    /**
     * Render the entire grid
     */
    render() {
        this.grid.render();
        this.addVisualEffects();
    },

    /**
     * Add visual effects to the grid
     */
    addVisualEffects() {
        // Add entrance animation to all cells
        const cells = this.gridElement.querySelectorAll('.grid-cell');
        cells.forEach((cell, index) => {
            cell.style.animationDelay = `${index * 10}ms`;
            cell.classList.add('cell-entrance');
        });

        // Remove animation class after completion
        setTimeout(() => {
            cells.forEach(cell => cell.classList.remove('cell-entrance'));
        }, cells.length * 10 + 500);
    },

    /**
     * Highlight path with enhanced effects
     */
    highlightPath(path, speed = 50) {
        return new Promise((resolve) => {
            let index = 0;

            const animateNext = () => {
                if (index >= path.length) {
                    resolve();
                    return;
                }

                const node = path[index];
                if (!node.isStart && !node.isEnd) {
                    node.isPath = true;
                    node.updateVisualState();

                    // Add ripple effect
                    this.addRippleEffect(node.element);
                }

                index++;
                setTimeout(animateNext, speed);
            };

            animateNext();
        });
    },

    /**
     * Add ripple effect to element
     */
    addRippleEffect(element) {
        const ripple = document.createElement('div');
        ripple.className = 'ripple-effect';
        element.appendChild(ripple);

        // Remove ripple after animation
        setTimeout(() => {
            ripple.remove();
        }, 600);
    },

    /**
     * Show algorithm visualization with stats
     */
    async visualizeAlgorithm(algorithm, onUpdate) {
        const startTime = performance.now();
        let nodesVisited = 0;

        // Subscribe to algorithm updates
        algorithm.onNodeVisited = (node) => {
            nodesVisited++;
            if (onUpdate) {
                onUpdate({
                    nodesVisited,
                    timeElapsed: performance.now() - startTime
                });
            }
        };

        const result = await algorithm.findPath(true);

        if (result) {
            // Success animation
            this.celebrateSuccess();
        } else {
            // No path found animation
            this.showNoPathAnimation();
        }

        return result;
    },

    /**
     * Celebration animation when path is found
     */
    celebrateSuccess() {
        // Add success class to grid
        this.gridElement.classList.add('success-animation');

        // Create particle effects
        for (let i = 0; i < 20; i++) {
            setTimeout(() => {
                this.createParticle();
            }, i * 50);
        }

        // Remove animation class
        setTimeout(() => {
            this.gridElement.classList.remove('success-animation');
        }, 2000);
    },

    /**
     * Create particle effect
     */
    createParticle() {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = `${Math.random() * 100}%`;
        particle.style.animationDuration = `${1 + Math.random() * 2}s`;
        particle.style.backgroundColor = ['var(--naruto-orange)', 'var(--chakra-blue)', 'var(--leaf-green)'][Math.floor(Math.random() * 3)];

        this.gridElement.appendChild(particle);

        // Remove particle after animation
        particle.addEventListener('animationend', () => {
            particle.remove();
        });
    },

    /**
     * Show animation when no path is found
     */
    showNoPathAnimation() {
        this.gridElement.classList.add('no-path-animation');

        // Shake animation
        setTimeout(() => {
            this.gridElement.classList.remove('no-path-animation');
        }, 500);
    },

    /**
     * Update grid size dynamically
     */
    updateGridSize(rows, cols) {
        this.gridElement.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
        this.gridElement.style.gridTemplateRows = `repeat(${rows}, 1fr)`;
    }
};

// Add required CSS for effects
const style = document.createElement('style');
style.textContent = `
    .cell-entrance {
        animation: cellEntrance 0.5s ease-out forwards;
        opacity: 0;
    }
    
    @keyframes cellEntrance {
        from {
            opacity: 0;
            transform: scale(0) rotate(180deg);
        }
        to {
            opacity: 1;
            transform: scale(1) rotate(0deg);
        }
    }
    
    .ripple-effect {
        position: absolute;
        top: 50%;
        left: 50%;
        width: 0;
        height: 0;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.5);
        transform: translate(-50%, -50%);
        animation: ripple 0.6s ease-out;
        pointer-events: none;
    }
    
    @keyframes ripple {
        to {
            width: 200%;
            height: 200%;
            opacity: 0;
        }
    }
    
    .success-animation {
        animation: successPulse 0.5s ease-out;
    }
    
    @keyframes successPulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.02); }
    }
    
    .no-path-animation {
        animation: shake 0.5s ease-out;
    }
    
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-5px); }
        75% { transform: translateX(5px); }
    }
    
    .particle {
        position: absolute;
        width: 10px;
        height: 10px;
        border-radius: 50%;
        bottom: 0;
        animation: particleFloat 2s ease-out forwards;
        pointer-events: none;
    }
    
    @keyframes particleFloat {
        to {
            transform: translateY(-300px) rotate(360deg);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);