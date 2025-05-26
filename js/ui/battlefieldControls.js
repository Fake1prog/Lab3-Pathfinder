/**
 * Battlefield Controls - Handle pre-made map selection
 * Command center for loading epic ninja battlefields
 */

class BattlefieldControls {
    constructor(grid) {
        this.grid = grid;
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        // Battlefield map loader
        const loadBattlefieldBtn = document.getElementById('load-battlefield-btn');
        const battlefieldSelect = document.getElementById('battlefield-select');

        if (loadBattlefieldBtn && battlefieldSelect) {
            loadBattlefieldBtn.addEventListener('click', () => {
                this.loadBattlefield();
            });

            // Also load on Enter key in select
            battlefieldSelect.addEventListener('change', () => {
                if (battlefieldSelect.value) {
                    this.loadBattlefield();
                }
            });
        }

        // Pattern generator
        const generatePatternBtn = document.getElementById('generate-pattern-btn');
        const patternSelect = document.getElementById('pattern-select');

        if (generatePatternBtn && patternSelect) {
            generatePatternBtn.addEventListener('click', () => {
                this.generatePattern();
            });

            patternSelect.addEventListener('change', () => {
                if (patternSelect.value) {
                    this.generatePattern();
                }
            });
        }
    }

    loadBattlefield() {
        const battlefieldSelect = document.getElementById('battlefield-select');
        const selectedMap = battlefieldSelect.value;

        if (!selectedMap) {
            this.showNotification('Please select a battlefield map first!', 'warning');
            return;
        }

        // Clear any existing pathfinding results
        this.grid.resetPathfinding();

        // Load the selected battlefield
        switch (selectedMap) {
            case 'forestOfDeath':
                Helpers.battlefieldMaps.forestOfDeath(this.grid);
                this.showNotification('🌲 Forest of Death loaded! Navigate through the deadly trees.', 'success');
                break;
            case 'valleyOfTheEnd':
                Helpers.battlefieldMaps.valleyOfTheEnd(this.grid);
                this.showNotification('⚔️ Valley of the End loaded! Cross the divided battlefield.', 'success');
                break;
            case 'hiddenLeafVillage':
                Helpers.battlefieldMaps.hiddenLeafVillage(this.grid);
                this.showNotification('🏘️ Hidden Leaf Village loaded! Navigate through the village streets.', 'success');
                break;
            default:
                this.showNotification('Unknown battlefield map selected.', 'error');
                return;
        }

        // Update the visual grid
        this.updateGridVisuals();

        // Reset the dropdown to default
        setTimeout(() => {
            battlefieldSelect.selectedIndex = 0;
        }, 100);
    }

    generatePattern() {
        const patternSelect = document.getElementById('pattern-select');
        const selectedPattern = patternSelect.value;

        if (!selectedPattern) {
            this.showNotification('Please select a pattern first!', 'warning');
            return;
        }

        // Clear any existing pathfinding results
        this.grid.resetPathfinding();

        // Generate the selected pattern
        switch (selectedPattern) {
            case 'random':
                Helpers.generateMaze(this.grid, 0.3);
                this.showNotification('🎲 Random maze generated!', 'success');
                break;
            case 'spiral':
                Helpers.patterns.spiral(this.grid);
                this.showNotification('🌀 Spiral pattern created!', 'success');
                break;
            case 'diagonal':
                Helpers.patterns.diagonal(this.grid);
                this.showNotification('📐 Diagonal maze generated!', 'success');
                break;
            case 'simple':
                Helpers.patterns.simpleWalls(this.grid);
                this.showNotification('🧱 Simple walls pattern created!', 'success');
                break;
            default:
                this.showNotification('Unknown pattern selected.', 'error');
                return;
        }

        // Update the visual grid
        this.updateGridVisuals();

        // Reset the dropdown to default
        setTimeout(() => {
            patternSelect.selectedIndex = 0;
        }, 100);
    }

    updateGridVisuals() {
        // Re-render the grid to ensure all visual updates are applied
        for (let row = 0; row < this.grid.rows; row++) {
            for (let col = 0; col < this.grid.cols; col++) {
                const node = this.grid.nodes[row][col];
                if (node.element) {
                    node.updateVisualState();
                }
            }
        }
    }

    showNotification(message, type = 'info') {
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

    // Get map descriptions for tooltips or help
    getMapDescription(mapName) {
        const descriptions = {
            forestOfDeath: "A treacherous forest with dense obstacles and winding paths. Navigate carefully through the deadly terrain!",
            valleyOfTheEnd: "The legendary battlefield where epic confrontations took place. Two sides separated by a central barrier with strategic gaps.",
            hiddenLeafVillage: "Navigate through the village streets, avoiding buildings and structures. Find the path from the village entrance to the Hokage building."
        };
        return descriptions[mapName] || "An epic ninja battlefield awaits!";
    }
}