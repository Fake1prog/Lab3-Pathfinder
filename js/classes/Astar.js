/**
 * A* Pathfinding Algorithm
 * Like Naruto finding the fastest way to become Hokage!
 */
class AStar {
    constructor(grid) {
        this.grid = grid;
        this.openSet = []; // Nodes to be evaluated
        this.closedSet = []; // Nodes already evaluated
        this.path = []; // Final path
        this.visitedNodes = []; // For visualization
        this.isRunning = false;
        this.animationSpeed = 50; // milliseconds between steps
        this.startTime = 0;
        this.nodesExplored = 0;
    }

    /**
     * Find the shortest path using A* algorithm
     * Returns a promise for async animation
     * @param {boolean} animate - Whether to show animation
     * @param {number} overrideSpeed - Optional speed override in milliseconds
     */
    async findPath(animate = true, overrideSpeed = null) {
        if (this.isRunning) return null;
        if (!this.grid.startNode || !this.grid.endNode) return null;

        this.isRunning = true;
        this.startTime = performance.now();
        this.reset();

        // Use override speed if provided, otherwise use instance speed
        const currentSpeed = overrideSpeed !== null ? overrideSpeed : this.animationSpeed;
        console.log(`🔍 A* Starting with speed: ${currentSpeed}ms, animate: ${animate}`);

        // Initialize start node
        const startNode = this.grid.startNode;
        const endNode = this.grid.endNode;

        startNode.g = 0;
        startNode.h = startNode.calculateHeuristic(endNode);
        startNode.f = startNode.h;

        this.openSet.push(startNode);

        while (this.openSet.length > 0 && this.isRunning) {
            // Get node with lowest f score
            const currentNode = this.getLowestFNode();

            // Check if we reached the goal
            if (currentNode === endNode) {
                const endTime = performance.now();
                this.path = this.reconstructPath(currentNode);

                if (animate) {
                    console.log(`🎯 Path found! Animating with speed: ${currentSpeed}ms`);
                    await this.animatePath(currentSpeed);
                }

                this.isRunning = false;
                return {
                    path: this.path,
                    visitedNodes: this.visitedNodes,
                    pathLength: this.path.length,
                    nodesExplored: this.nodesExplored,
                    timeTaken: Math.round(endTime - this.startTime)
                };
            }

            // Move current node from open to closed set
            this.removeFromArray(this.openSet, currentNode);
            this.closedSet.push(currentNode);

            // Mark as visited for visualization
            if (!currentNode.isStart && !currentNode.isEnd) {
                currentNode.isVisited = true;
                this.visitedNodes.push(currentNode);
                this.nodesExplored++;

                if (animate) {
                    currentNode.updateVisualState();
                    // Use the current speed for animation delay
                    await this.delay(currentSpeed);
                }
            }

            // Check all neighbors
            const neighbors = currentNode.getNeighbors(this.grid.nodes);

            for (const neighbor of neighbors) {
                // Skip if already evaluated or is a wall
                if (this.closedSet.includes(neighbor) || neighbor.isWall) {
                    continue;
                }

                // Calculate tentative g score
                const tentativeG = currentNode.g + neighbor.weight;

                // Check if this path to neighbor is better
                if (tentativeG < neighbor.g) {
                    // This is a better path, record it
                    neighbor.parent = currentNode;
                    neighbor.g = tentativeG;
                    neighbor.h = neighbor.calculateHeuristic(endNode);
                    neighbor.f = neighbor.g + neighbor.h;

                    // Add to open set if not already there
                    if (!this.openSet.includes(neighbor)) {
                        this.openSet.push(neighbor);
                    }
                }
            }
        }

        // No path found
        this.isRunning = false;
        return null;
    }

    /**
     * Find the node with the lowest f score in the open set
     * Like finding the most promising path
     */
    getLowestFNode() {
        let lowestNode = this.openSet[0];

        for (const node of this.openSet) {
            if (node.f < lowestNode.f ||
                (node.f === lowestNode.f && node.h < lowestNode.h)) {
                lowestNode = node;
            }
        }

        return lowestNode;
    }

    /**
     * Reconstruct the path from start to end
     * Like retracing Naruto's steps
     */
    reconstructPath(endNode) {
        const path = [];
        let currentNode = endNode;

        while (currentNode !== null) {
            path.unshift(currentNode);
            currentNode = currentNode.parent;
        }

        return path;
    }

    /**
     * Animate the final path
     * Show Naruto's journey with style!
     * @param {number} speed - Animation speed in milliseconds
     */
    async animatePath(speed = null) {
        const pathSpeed = speed !== null ? speed : this.animationSpeed;
        console.log(`🎬 Animating path with ${pathSpeed}ms delay between steps`);

        for (let i = 0; i < this.path.length; i++) {
            const node = this.path[i];
            if (!node.isStart && !node.isEnd) {
                node.isPath = true;
                node.updateVisualState();
                // Use slower speed for path animation (more dramatic)
                await this.delay(pathSpeed * 2);
            }
        }
    }

    /**
     * Reset the algorithm state
     */
    reset() {
        this.openSet = [];
        this.closedSet = [];
        this.path = [];
        this.visitedNodes = [];
        this.nodesExplored = 0;
        this.grid.resetPathfinding();
    }

    /**
     * Stop the algorithm
     */
    stop() {
        console.log('⏹️ A* algorithm stopped');
        this.isRunning = false;
    }

    /**
     * Set animation speed
     * @param {number} speed - Speed in milliseconds
     */
    setSpeed(speed) {
        const oldSpeed = this.animationSpeed;
        this.animationSpeed = Math.max(1, Math.min(1000, speed)); // Clamp between 1ms and 1000ms
        console.log(`⚡ Speed updated: ${oldSpeed}ms → ${this.animationSpeed}ms`);
    }

    /**
     * Get current animation speed
     */
    getSpeed() {
        return this.animationSpeed;
    }

    /**
     * Utility: Remove element from array
     */
    removeFromArray(array, element) {
        const index = array.indexOf(element);
        if (index > -1) {
            array.splice(index, 1);
        }
    }

    /**
     * Utility: Delay for animation
     * @param {number} ms - Milliseconds to delay
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Get algorithm statistics
     */
    getStats() {
        return {
            pathLength: this.path.length,
            nodesExplored: this.nodesExplored,
            openSetSize: this.openSet.length,
            closedSetSize: this.closedSet.length,
            currentSpeed: this.animationSpeed,
            isRunning: this.isRunning
        };
    }

    /**
     * Check if algorithm is currently running
     */
    isAlgorithmRunning() {
        return this.isRunning;
    }
}