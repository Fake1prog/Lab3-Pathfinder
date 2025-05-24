/**
 * Helper Utilities
 * Ninja tools for the pathfinding mission
 */

const Helpers = {
    /**
     * Generate random maze pattern
     * Like creating a complex training course
     */
    generateMaze(grid, density = 0.3) {
        // Clear existing walls
        grid.clearWalls();

        // Randomly place walls based on density
        for (let row = 0; row < grid.rows; row++) {
            for (let col = 0; col < grid.cols; col++) {
                const node = grid.getNode(row, col);

                // Don't place walls on start or end
                if (!node.isStart && !node.isEnd) {
                    if (Math.random() < density) {
                        node.isWall = true;
                        node.updateVisualState();
                    }
                }
            }
        }

        // Ensure there's always a path
        this.ensurePathExists(grid);
    },

    /**
     * Ensure at least one path exists between start and end
     * Remove walls if necessary
     */
    ensurePathExists(grid) {
        const pathfinder = new AStar(grid);
        const result = pathfinder.findPath(false); // No animation

        if (!result) {
            // No path exists, create a simple one
            this.createSimplePath(grid);
        }
    },

    /**
     * Create a simple path by removing walls
     */
    createSimplePath(grid) {
        const start = grid.startNode;
        const end = grid.endNode;

        // Create horizontal path
        const row = start.row;
        for (let col = Math.min(start.col, end.col); col <= Math.max(start.col, end.col); col++) {
            const node = grid.getNode(row, col);
            if (node && node.isWall) {
                node.isWall = false;
                node.updateVisualState();
            }
        }

        // Create vertical path
        const col = end.col;
        for (let r = Math.min(start.row, end.row); r <= Math.max(start.row, end.row); r++) {
            const node = grid.getNode(r, col);
            if (node && node.isWall) {
                node.isWall = false;
                node.updateVisualState();
            }
        }
    },

    /**
     * Create preset patterns
     */
    patterns: {
        // Spiral pattern
        spiral(grid) {
            grid.clearWalls();
            const centerRow = Math.floor(grid.rows / 2);
            const centerCol = Math.floor(grid.cols / 2);

            // Create spiral walls
            let row = centerRow;
            let col = centerCol;
            let direction = 0; // 0: right, 1: down, 2: left, 3: up
            let steps = 1;
            let stepCount = 0;
            let turnCount = 0;

            const directions = [[0, 1], [1, 0], [0, -1], [-1, 0]];

            while (row >= 0 && row < grid.rows && col >= 0 && col < grid.cols) {
                const node = grid.getNode(row, col);
                if (node && !node.isStart && !node.isEnd) {
                    node.isWall = true;
                    node.updateVisualState();
                }

                row += directions[direction][0];
                col += directions[direction][1];
                stepCount++;

                if (stepCount === steps) {
                    stepCount = 0;
                    direction = (direction + 1) % 4;
                    turnCount++;

                    if (turnCount === 2) {
                        turnCount = 0;
                        steps++;
                    }
                }

                if (steps > Math.max(grid.rows, grid.cols)) break;
            }
        },

        // Diagonal maze
        diagonal(grid) {
            grid.clearWalls();

            for (let i = 0; i < Math.max(grid.rows, grid.cols); i += 3) {
                // Diagonal from top-left
                for (let j = 0; j < Math.min(grid.rows, grid.cols); j++) {
                    const row = j;
                    const col = i + j;
                    const node = grid.getNode(row, col);
                    if (node && !node.isStart && !node.isEnd) {
                        node.isWall = true;
                        node.updateVisualState();
                    }
                }

                // Diagonal from top-right
                for (let j = 0; j < Math.min(grid.rows, grid.cols); j++) {
                    const row = j;
                    const col = grid.cols - 1 - i - j;
                    const node = grid.getNode(row, col);
                    if (node && !node.isStart && !node.isEnd) {
                        node.isWall = true;
                        node.updateVisualState();
                    }
                }
            }
        },

        // Simple walls
        simpleWalls(grid) {
            grid.clearWalls();

            // Vertical walls with gaps
            for (let col = 2; col < grid.cols; col += 4) {
                for (let row = 0; row < grid.rows; row++) {
                    if (row !== Math.floor(grid.rows / 2) && row !== Math.floor(grid.rows / 2) - 1) {
                        const node = grid.getNode(row, col);
                        if (node && !node.isStart && !node.isEnd) {
                            node.isWall = true;
                            node.updateVisualState();
                        }
                    }
                }
            }
        }
    },

    /**
     * Format time display
     */
    formatTime(ms) {
        if (ms < 1000) {
            return `${ms}ms`;
        } else {
            return `${(ms / 1000).toFixed(2)}s`;
        }
    },

    /**
     * Get saved grid names from localStorage
     */
    getSavedGrids() {
        const savedGrids = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith('naruto-grid-')) {
                savedGrids.push(key.replace('naruto-grid-', ''));
            }
        }
        return savedGrids;
    },

    /**
     * Export grid as JSON
     */
    exportGrid(grid) {
        const data = {
            rows: grid.rows,
            cols: grid.cols,
            walls: [],
            startNode: null,
            endNode: null
        };

        for (let row = 0; row < grid.rows; row++) {
            for (let col = 0; col < grid.cols; col++) {
                const node = grid.nodes[row][col];
                if (node.isWall) {
                    data.walls.push({ row, col });
                }
                if (node.isStart) {
                    data.startNode = { row, col };
                }
                if (node.isEnd) {
                    data.endNode = { row, col };
                }
            }
        }

        return JSON.stringify(data, null, 2);
    },

    /**
     * Import grid from JSON
     */
    importGrid(grid, jsonData) {
        try {
            const data = JSON.parse(jsonData);

            // Validate data
            if (!data.rows || !data.cols) {
                throw new Error('Invalid grid data');
            }

            // Resize grid if needed
            if (data.rows !== grid.rows || data.cols !== grid.cols) {
                grid.resize(data.rows, data.cols);
            }

            // Clear and rebuild
            grid.clearWalls();

            // Set walls
            if (data.walls) {
                data.walls.forEach(({ row, col }) => {
                    const node = grid.getNode(row, col);
                    if (node) {
                        node.isWall = true;
                        node.updateVisualState();
                    }
                });
            }

            // Set start and end
            if (data.startNode) {
                grid.setStartNode(data.startNode.row, data.startNode.col);
            }
            if (data.endNode) {
                grid.setEndNode(data.endNode.row, data.endNode.col);
            }

            return true;
        } catch (error) {
            console.error('Import failed:', error);
            return false;
        }
    }
};