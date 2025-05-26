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
                        node.wallType = grid.getRandomWallType(); // Use random wall type
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
                node.wallType = null;
                node.updateVisualState();
            }
        }

        // Create vertical path
        const col = end.col;
        for (let r = Math.min(start.row, end.row); r <= Math.max(start.row, end.row); r++) {
            const node = grid.getNode(r, col);
            if (node && node.isWall) {
                node.isWall = false;
                node.wallType = null;
                node.updateVisualState();
            }
        }
    },

    /**
     * Pre-made battlefield maps
     * Epic ninja battlefields ready for action!
     */
    battlefieldMaps: {
        // Forest of Death - Dense obstacles with guaranteed winding paths
        forestOfDeath(grid) {
            grid.clearWalls();

            // Set themed start/end positions first
            grid.setStartNode(0, 0); // Top-left corner
            grid.setEndNode(grid.rows - 1, grid.cols - 1); // Bottom-right corner

            // Create forest obstacles that maintain pathways
            const obstacles = [];

            // Create vertical tree clusters with gaps
            if (grid.cols > 3) {
                // Left forest cluster
                obstacles.push(
                    {rows: [1,2,3], col: 2},
                    {rows: [5,6], col: 2}, // Leave gap at row 4 and 7+
                );

                // Middle forest cluster
                if (grid.cols > 6) {
                    obstacles.push(
                        {rows: [1,2], col: Math.floor(grid.cols / 2)}, // Top part
                        {rows: [grid.rows - 3, grid.rows - 2], col: Math.floor(grid.cols / 2)}, // Bottom part
                        // Intentional gap in middle for passage
                    );
                }

                // Right forest cluster
                if (grid.cols > 8) {
                    obstacles.push(
                        {rows: [2,3,4], col: grid.cols - 3},
                        {rows: [6,7], col: grid.cols - 3}, // Gap at row 5
                    );
                }
            }

            // Add horizontal barriers with strategic gaps
            if (grid.rows > 5) {
                const midRow = Math.floor(grid.rows / 2);
                obstacles.push(
                    {row: midRow, cols: [1]}, // Small barrier left
                    {row: midRow, cols: [grid.cols - 2]}, // Small barrier right
                    // Keep middle clear for main passage
                );
            }

            // Add scattered tree obstacles (avoiding critical path areas)
            if (grid.rows > 7 && grid.cols > 7) {
                obstacles.push(
                    {row: 1, cols: [Math.floor(grid.cols * 0.6)]},
                    {row: grid.rows - 2, cols: [Math.floor(grid.cols * 0.4)]},
                    {row: Math.floor(grid.rows * 0.3), cols: [grid.cols - 2]},
                    {row: Math.floor(grid.rows * 0.7), cols: [1]},
                );
            }

            this.createObstacles(grid, obstacles);

            // Ensure path exists by clearing critical diagonal if needed
            this.ensureForestPath(grid);
        },

        // Valley of the End - Two sides separated by obstacles
        valleyOfTheEnd(grid) {
            grid.clearWalls();

            const midCol = Math.floor(grid.cols / 2);
            const obstacles = [];

            // Central valley walls
            for (let row = 1; row < grid.rows - 1; row++) {
                obstacles.push({row, cols: [midCol - 1, midCol, midCol + 1]});
            }

            // Add gaps for passage
            const gapRows = [Math.floor(grid.rows * 0.3), Math.floor(grid.rows * 0.7)];
            gapRows.forEach(gapRow => {
                obstacles.push({row: gapRow, cols: [midCol]}); // Remove middle obstacle for gap
            });

            // Side obstacles - left side
            obstacles.push(
                {row: 2, cols: [1, 2]},
                {row: 4, cols: [0, 1]},
                {row: 6, cols: [1, 2]},
                {row: 8, cols: [0, 1]}
            );

            // Side obstacles - right side
            const rightSide = grid.cols - 1;
            obstacles.push(
                {row: 1, cols: [rightSide - 1, rightSide - 2]},
                {row: 3, cols: [rightSide, rightSide - 1]},
                {row: 5, cols: [rightSide - 1, rightSide - 2]},
                {row: 7, cols: [rightSide, rightSide - 1]}
            );

            this.createObstacles(grid, obstacles);

            // Set positions on opposite sides
            grid.setStartNode(0, 0); // Left side
            grid.setEndNode(grid.rows - 1, grid.cols - 1); // Right side
        },

        // Hidden Leaf Village - Strategic building layout with clear streets
        hiddenLeafVillage(grid) {
            grid.clearWalls();

            // Set start at village entrance, end at Hokage building (center-ish)
            grid.setStartNode(0, 0);
            grid.setEndNode(Math.floor(grid.rows * 0.7), Math.floor(grid.cols * 0.6));

            const obstacles = [];

            // Create building blocks that form street patterns
            const buildings = [];

            // Only add buildings if grid is large enough
            if (grid.rows >= 8 && grid.cols >= 8) {
                // Top row buildings (with street gaps)
                buildings.push(
                    {topRow: 1, topCol: 2, width: 2, height: 2}, // Building 1
                    {topRow: 1, topCol: 5, width: 2, height: 2}, // Building 2 (gap at col 4)
                );

                if (grid.cols >= 10) {
                    buildings.push({topRow: 1, topCol: grid.cols - 3, width: 2, height: 2}); // Building 3
                }

                // Middle row buildings (creating main street)
                const midRow = Math.floor(grid.rows / 2);
                if (midRow >= 4) {
                    buildings.push(
                        {topRow: midRow, topCol: 1, width: 2, height: 2}, // Left building
                        {topRow: midRow, topCol: grid.cols - 3, width: 2, height: 2}, // Right building
                        // Keep middle clear for main street
                    );
                }

                // Bottom area buildings (avoiding end point area)
                const endRow = Math.floor(grid.rows * 0.7);
                const endCol = Math.floor(grid.cols * 0.6);
                if (grid.rows >= 9) {
                    // Only add if not blocking end point
                    if (endCol > 3) {
                        buildings.push({topRow: grid.rows - 3, topCol: 1, width: 2, height: 2});
                    }
                    if (endCol < grid.cols - 4) {
                        buildings.push({topRow: grid.rows - 3, topCol: grid.cols - 3, width: 2, height: 2});
                    }
                }
            }

            // Convert buildings to obstacle coordinates
            buildings.forEach(building => {
                for (let r = building.topRow; r < building.topRow + building.height && r < grid.rows; r++) {
                    const cols = [];
                    for (let c = building.topCol; c < building.topCol + building.width && c < grid.cols; c++) {
                        cols.push(c);
                    }
                    if (cols.length > 0) {
                        obstacles.push({row: r, cols});
                    }
                }
            });

            // Add minimal scattered debris (avoiding main paths)
            if (grid.rows >= 6 && grid.cols >= 6) {
                const endRow = Math.floor(grid.rows * 0.7);
                const endCol = Math.floor(grid.cols * 0.6);

                // Only add debris that won't block critical paths
                if (3 < endCol - 2) obstacles.push({row: Math.floor(grid.rows * 0.3), cols: [3]});
                if (endCol + 2 < grid.cols - 1) obstacles.push({row: Math.floor(grid.rows * 0.5), cols: [endCol + 2]});
            }

            this.createObstacles(grid, obstacles);

            // Ensure clear path through village streets
            this.ensureVillagePath(grid);
        },

        // Helper method to ensure Forest of Death always has a path
        ensureForestPath(grid) {
            // Create a simple path along the edges if needed
            const pathfinder = new AStar(grid);

            // Test path without any visual effects
            pathfinder.animationSpeed = 1; // Fastest possible
            const result = pathfinder.findPath(false); // No animation

            if (!result) {
                // No path exists, create one along the border
                console.log('🌲 Forest of Death: Creating emergency path...');

                // Clear top row path (except start point obstacles)
                for (let col = 1; col < grid.cols - 1; col++) {
                    const node = grid.getNode(0, col);
                    if (node && node.isWall) {
                        node.isWall = false;
                        node.wallType = null;
                        node.updateVisualState();
                    }
                }

                // Clear right column path (except end point obstacles)
                for (let row = 1; row < grid.rows - 1; row++) {
                    const node = grid.getNode(row, grid.cols - 1);
                    if (node && node.isWall) {
                        node.isWall = false;
                        node.wallType = null;
                        node.updateVisualState();
                    }
                }
            }

            // CRITICAL: Reset all pathfinding visualization after testing
            grid.resetPathfinding();
        },

        // Helper method to ensure Village always has a path
        ensureVillagePath(grid) {
            const pathfinder = new AStar(grid);

            // Test path without any visual effects
            pathfinder.animationSpeed = 1; // Fastest possible
            const result = pathfinder.findPath(false); // No animation

            if (!result) {
                console.log('🏘️ Hidden Leaf Village: Creating street path...');

                // Create a main street (vertical path down middle)
                const streetCol = Math.floor(grid.cols / 2);
                for (let row = 0; row < grid.rows; row++) {
                    const node = grid.getNode(row, streetCol);
                    if (node && node.isWall && !node.isStart && !node.isEnd) {
                        node.isWall = false;
                        node.wallType = null;
                        node.updateVisualState();
                    }
                }

                // Create connecting horizontal street to end point
                const endNode = grid.endNode;
                if (endNode) {
                    const endRow = endNode.row;
                    const startCol = Math.min(streetCol, endNode.col);
                    const endCol = Math.max(streetCol, endNode.col);

                    for (let col = startCol; col <= endCol; col++) {
                        const node = grid.getNode(endRow, col);
                        if (node && node.isWall && !node.isStart && !node.isEnd) {
                            node.isWall = false;
                            node.wallType = null;
                            node.updateVisualState();
                        }
                    }
                }
            }

            // CRITICAL: Reset all pathfinding visualization after testing
            grid.resetPathfinding();
        },

        // Helper method to create obstacles from coordinate data
        createObstacles(grid, obstacles) {
            obstacles.forEach(obstacle => {
                if (obstacle.rows && obstacle.col !== undefined) {
                    // Multiple rows, single column
                    obstacle.rows.forEach(row => {
                        if (row >= 0 && row < grid.rows && obstacle.col >= 0 && obstacle.col < grid.cols) {
                            const node = grid.getNode(row, obstacle.col);
                            if (node && !node.isStart && !node.isEnd) {
                                node.isWall = true;
                                node.wallType = grid.getRandomWallType();
                                node.updateVisualState();
                            }
                        }
                    });
                } else if (obstacle.row !== undefined && obstacle.cols) {
                    // Single row, multiple columns
                    obstacle.cols.forEach(col => {
                        if (obstacle.row >= 0 && obstacle.row < grid.rows && col >= 0 && col < grid.cols) {
                            const node = grid.getNode(obstacle.row, col);
                            if (node && !node.isStart && !node.isEnd) {
                                node.isWall = true;
                                node.wallType = grid.getRandomWallType();
                                node.updateVisualState();
                            }
                        }
                    });
                }
            });
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
                    node.wallType = grid.getRandomWallType(); // Random wall type
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
                        node.wallType = grid.getRandomWallType(); // Random wall type
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
                        node.wallType = grid.getRandomWallType(); // Random wall type
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
                            node.wallType = grid.getRandomWallType(); // Random wall type
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
                    data.walls.push({
                        row,
                        col,
                        type: node.wallType || 1 // Include wall type in export
                    });
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

            // Set walls with their types
            if (data.walls) {
                data.walls.forEach(({ row, col, type }) => {
                    const node = grid.getNode(row, col);
                    if (node) {
                        node.isWall = true;
                        node.wallType = type || grid.getRandomWallType(); // Use saved type or random
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