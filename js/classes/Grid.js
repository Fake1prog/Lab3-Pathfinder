/**
 * Grid Class - Manages the entire pathfinding grid
 * Like the entire Hidden Leaf Village training ground
 */
class Grid {
    constructor(rows = 10, cols = 10) {
        this.rows = rows;
        this.cols = cols;
        this.nodes = [];
        this.startNode = null;
        this.endNode = null;
        this.mouseIsPressed = false;
        this.currentMode = 'wall'; // 'wall', 'start', 'end', 'weight'

        this.initializeGrid();
        this.setDefaultStartEnd();
    }

    /**
     * Initialize the grid with nodes
     * Like preparing the training ground
     */
    initializeGrid() {
        this.nodes = [];
        for (let row = 0; row < this.rows; row++) {
            this.nodes[row] = [];
            for (let col = 0; col < this.cols; col++) {
                this.nodes[row][col] = new Node(row, col);
            }
        }
    }

    /**
     * Set default start and end positions
     * Naruto starts at top-left, Hokage office at bottom-right
     */
    setDefaultStartEnd() {
        // Set start node (Naruto's position)
        const startRow = Math.floor(this.rows / 4);
        const startCol = Math.floor(this.cols / 4);
        this.setStartNode(startRow, startCol);

        // Set end node (Hokage's office)
        const endRow = Math.floor(3 * this.rows / 4);
        const endCol = Math.floor(3 * this.cols / 4);
        this.setEndNode(endRow, endCol);
    }

    /**
     * Set start node at specific position
     */
    setStartNode(row, col) {
        // Clear previous start node
        if (this.startNode) {
            this.startNode.isStart = false;
            this.startNode.updateVisualState();
        }

        // Set new start node
        this.startNode = this.nodes[row][col];
        this.startNode.setAsStart();
    }

    /**
     * Set end node at specific position
     */
    setEndNode(row, col) {
        // Clear previous end node
        if (this.endNode) {
            this.endNode.isEnd = false;
            this.endNode.updateVisualState();
        }

        // Set new end node
        this.endNode = this.nodes[row][col];
        this.endNode.setAsEnd();
    }

    /**
     * Get node at specific position
     */
    getNode(row, col) {
        if (row >= 0 && row < this.rows && col >= 0 && col < this.cols) {
            return this.nodes[row][col];
        }
        return null;
    }

    /**
     * Reset all nodes for new pathfinding
     * Clear the training ground for a new exercise
     */
    resetPathfinding() {
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                this.nodes[row][col].reset();
            }
        }
    }

    /**
     * Clear all walls from the grid
     * Remove all obstacles from the training ground
     */
    clearWalls() {
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                const node = this.nodes[row][col];
                if (node.isWall) {
                    node.isWall = false;
                    node.updateVisualState();
                }
            }
        }
    }

    /**
     * Reset entire grid to initial state
     * Complete training ground reset
     */
    resetGrid() {
        this.initializeGrid();
        this.setDefaultStartEnd();
        this.render();
    }

    /**
     * Handle mouse interactions with the grid
     */
    handleMouseDown(row, col) {
        const node = this.getNode(row, col);
        if (!node) return;

        this.mouseIsPressed = true;

        // Determine action based on what was clicked
        if (node.isStart) {
            this.currentMode = 'start';
        } else if (node.isEnd) {
            this.currentMode = 'end';
        } else {
            this.currentMode = 'wall';
            node.toggleWall();
        }
    }

    handleMouseEnter(row, col) {
        if (!this.mouseIsPressed) return;

        const node = this.getNode(row, col);
        if (!node) return;

        switch (this.currentMode) {
            case 'start':
                if (!node.isEnd && !node.isWall) {
                    this.setStartNode(row, col);
                }
                break;
            case 'end':
                if (!node.isStart && !node.isWall) {
                    this.setEndNode(row, col);
                }
                break;
            case 'wall':
                if (!node.isStart && !node.isEnd && !node.isWall) {
                    node.toggleWall();
                }
                break;
        }
    }

    handleMouseUp() {
        this.mouseIsPressed = false;
        this.currentMode = 'wall';
    }

    /**
     * Render the grid to the DOM
     * Create the visual representation of the training ground
     */
    render() {
        const gridElement = document.getElementById('game-grid');
        gridElement.innerHTML = '';

        // Set CSS Grid properties
        gridElement.style.gridTemplateColumns = `repeat(${this.cols}, 1fr)`;
        gridElement.style.gridTemplateRows = `repeat(${this.rows}, 1fr)`;

        // Create and append node elements
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                const node = this.nodes[row][col];
                const element = node.createElement();

                // Add event listeners
                element.addEventListener('mousedown', () => this.handleMouseDown(row, col));
                element.addEventListener('mouseenter', () => this.handleMouseEnter(row, col));
                element.addEventListener('mouseup', () => this.handleMouseUp());

                gridElement.appendChild(element);
            }
        }

        // Global mouse up listener
        document.addEventListener('mouseup', () => this.handleMouseUp());
    }

    /**
     * Resize the grid to new dimensions
     * Like expanding the training ground
     */
    resize(newRows, newCols) {
        this.rows = newRows;
        this.cols = newCols;
        this.resetGrid();
    }

    /**
     * Save grid state to localStorage
     * Save the training ground configuration
     */
    saveToStorage(name = 'default') {
        const gridData = {
            rows: this.rows,
            cols: this.cols,
            walls: [],
            startNode: null,
            endNode: null
        };

        // Save wall positions
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                const node = this.nodes[row][col];
                if (node.isWall) {
                    gridData.walls.push({ row, col });
                }
                if (node.isStart) {
                    gridData.startNode = { row, col };
                }
                if (node.isEnd) {
                    gridData.endNode = { row, col };
                }
            }
        }

        localStorage.setItem(`naruto-grid-${name}`, JSON.stringify(gridData));
    }

    /**
     * Load grid state from localStorage
     * Load a saved training ground configuration
     */
    loadFromStorage(name = 'default') {
        const savedData = localStorage.getItem(`naruto-grid-${name}`);
        if (!savedData) return false;

        try {
            const gridData = JSON.parse(savedData);

            // Resize grid if necessary
            if (gridData.rows !== this.rows || gridData.cols !== this.cols) {
                this.resize(gridData.rows, gridData.cols);
            }

            // Clear current grid
            this.clearWalls();

            // Restore walls
            gridData.walls.forEach(({ row, col }) => {
                const node = this.getNode(row, col);
                if (node) {
                    node.isWall = true;
                    node.updateVisualState();
                }
            });

            // Restore start and end nodes
            if (gridData.startNode) {
                this.setStartNode(gridData.startNode.row, gridData.startNode.col);
            }
            if (gridData.endNode) {
                this.setEndNode(gridData.endNode.row, gridData.endNode.col);
            }

            return true;
        } catch (error) {
            console.error('Failed to load grid:', error);
            return false;
        }
    }
}