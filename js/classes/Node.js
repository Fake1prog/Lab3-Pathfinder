/**
 * Node Class - Represents a single cell in the pathfinding grid
 * Like a single training ground tile in the Hidden Leaf Village
 */
class Node {
    constructor(row, col, weight = 1) {
        // Position in the grid
        this.row = row;
        this.col = col;

        // Node properties
        this.isWall = false;
        this.isStart = false;
        this.isEnd = false;
        this.isVisited = false;
        this.isPath = false;
        this.weight = weight; // For weighted pathfinding

        // A* algorithm properties
        this.g = Infinity; // Cost from start to this node
        this.h = 0; // Heuristic (estimated cost to end)
        this.f = Infinity; // Total cost (g + h)
        this.parent = null; // Previous node in the optimal path

        // DOM element reference
        this.element = null;
    }

    /**
     * Reset node for new pathfinding calculation
     * Like clearing the training ground for a new exercise
     */
    reset() {
        this.isVisited = false;
        this.isPath = false;
        this.g = Infinity;
        this.h = 0;
        this.f = Infinity;
        this.parent = null;

        // Update visual state if element exists
        if (this.element) {
            this.updateVisualState();
        }
    }

    /**
     * Calculate heuristic distance to target node
     * Using Manhattan distance (like counting city blocks in Konoha)
     */
    calculateHeuristic(endNode) {
        const dx = Math.abs(this.col - endNode.col);
        const dy = Math.abs(this.row - endNode.row);
        this.h = dx + dy;
        return this.h;
    }

    /**
     * Get all valid neighbors (up, right, down, left)
     * Like checking which paths Naruto can take from current position
     */
    getNeighbors(grid) {
        const neighbors = [];
        const directions = [
            [-1, 0], // Up
            [0, 1],  // Right
            [1, 0],  // Down
            [0, -1]  // Left
        ];

        // Optional: Add diagonal movement for more natural paths
        const diagonalDirections = [
            [-1, -1], // Up-Left
            [-1, 1],  // Up-Right
            [1, 1],   // Down-Right
            [1, -1]   // Down-Left
        ];

        // Check all cardinal directions
        for (const [dRow, dCol] of directions) {
            const newRow = this.row + dRow;
            const newCol = this.col + dCol;

            if (this.isValidPosition(newRow, newCol, grid)) {
                neighbors.push(grid[newRow][newCol]);
            }
        }

        return neighbors;
    }

    /**
     * Check if a position is valid and accessible
     */
    isValidPosition(row, col, grid) {
        return (
            row >= 0 &&
            row < grid.length &&
            col >= 0 &&
            col < grid[0].length &&
            !grid[row][col].isWall
        );
    }

    /**
     * Update the visual state of the node
     * Like changing the jutsu effect on the tile
     */
    updateVisualState() {
        if (!this.element) return;

        // Remove all state classes
        this.element.classList.remove(
            'start-node',
            'end-node',
            'wall-node',
            'visited-node',
            'path-node'
        );

        // Add appropriate class based on state
        if (this.isStart) {
            this.element.classList.add('start-node');
        } else if (this.isEnd) {
            this.element.classList.add('end-node');
        } else if (this.isWall) {
            this.element.classList.add('wall-node');
        } else if (this.isPath) {
            this.element.classList.add('path-node');
        } else if (this.isVisited) {
            this.element.classList.add('visited-node');
        }

        // Update weight data attribute if needed
        if (this.weight > 1) {
            this.element.setAttribute('data-weight', this.weight);
            this.element.classList.add('weighted-node');
        }
    }

    /**
     * Toggle wall state
     * Like Yamato creating a wood wall
     */
    toggleWall() {
        if (!this.isStart && !this.isEnd) {
            this.isWall = !this.isWall;
            this.updateVisualState();
        }
    }

    /**
     * Set as start node
     * Where Naruto begins his journey
     */
    setAsStart() {
        this.isStart = true;
        this.isEnd = false;
        this.isWall = false;
        this.updateVisualState();
    }

    /**
     * Set as end node
     * The Hokage's office - Naruto's goal!
     */
    setAsEnd() {
        this.isEnd = true;
        this.isStart = false;
        this.isWall = false;
        this.updateVisualState();
    }

    /**
     * Create DOM element for this node
     */
    createElement() {
        this.element = document.createElement('div');
        this.element.className = 'grid-cell';
        this.element.dataset.row = this.row;
        this.element.dataset.col = this.col;
        this.updateVisualState();
        return this.element;
    }
}