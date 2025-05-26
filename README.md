# 🍥 Naruto's Pathfinder

**Help Naruto find the fastest path to defeat Madara!**

An interactive A* pathfinding algorithm visualizer with an epic Naruto theme. Watch as Naruto navigates through various ninja battlefields using the power of algorithms!

## ✨ Features

- **🎮 Interactive Grid**: Click to create/remove obstacles, drag to move start/end points
- **⚡ Real-time Visualization**: Watch the A* algorithm explore nodes in real-time
- **🗺️ Epic Battlefields**: Pre-made maps including Forest of Death, Valley of the End, and Hidden Leaf Village
- **🎛️ Speed Control**: Adjust animation speed from lightning-fast to detailed slow-motion
- **🎵 Ninja Soundtrack**: Background music to enhance the experience
- **📱 Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **🎨 Arcade Aesthetics**: Retro gaming vibes with modern ninja flair

## 🎯 How to Play

1. **Set Your Mission**: Naruto (start) and Madara (end) are automatically placed
2. **Create Obstacles**: Click cells to place/remove ninja obstacles
3. **Choose Battlefield**: Select from pre-made epic battle maps
4. **Adjust Speed**: Use the speed slider to control animation pace
5. **Find Path**: Hit "FIND PATH!" and watch Naruto's journey unfold!

## 🛠️ Tech Stack

- **Frontend**: Pure HTML5, CSS3, JavaScript (ES6+)
- **Algorithm**: A* pathfinding with Manhattan heuristic
- **Styling**: Custom CSS with arcade/retro theme
- **Backend**: Node.js + Express (for deployment)
- **Deployment**: Render.com

## 🚀 Local Development

```bash
# Clone the repository
git clone <copy this repo url>
cd naruto-pathfinder

# Install dependencies
npm install

# Start the server
npm start

# Open your browser to http://localhost:3000
```

## 🎮 Controls

### Mouse/Touch
- **Click**: Create/remove obstacles
- **Drag**: Move start/end points
- **Click & Drag**: Paint multiple obstacles

### Keyboard Shortcuts
- **Space**: Start pathfinding
- **R**: Reset grid
- **C**: Clear path
- **1-3**: Load battlefield maps
- **M**: Generate random maze
- **P**: Toggle background music

## 🌟 Battlefields

- **🌲 Forest of Death**: Navigate through dense tree obstacles
- **⚔️ Valley of the End**: Cross the legendary divided battlefield  
- **🏘️ Hidden Leaf Village**: Find your way through village streets

## 📊 Algorithm Details

This visualizer implements the **A* (A-Star) pathfinding algorithm**:

- **Heuristic**: Manhattan distance
- **Cost Function**: G(n) + H(n) where G is path cost, H is heuristic
- **Guaranteed**: Finds the shortest path if one exists
- **Time Complexity**: O(b^d) where b is branching factor, d is depth
- **Space Complexity**: O(b^d) for storing open/closed sets

## 🎨 Visual Legend

- **🧿 Naruto**: Starting position (orange glow)
- **👤 Madara**: Target destination (red glow)  
- **🪨 Obstacles**: Walls that block the path
- **🟠 Explored**: Nodes visited by the algorithm
- **⚔️ Attack Path**: The optimal path found

## 🚀 Deployment

This app is optimized for deployment on [Render.com](https://render.com):
You can access it live here: (https://naruto-pathfinder.onrender.com)
1. Connect your GitHub repository
2. Choose "Web Service"
3. Use these settings:
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Environment**: Node.js

## 🤝 Contributing

Feel free to contribute to this project! Whether it's:
- 🐛 Bug fixes
- ✨ New features  
- 🎨 UI improvements
- 📚 Documentation
- 🗺️ New battlefield maps

## 📝 License

MIT License - Feel free to use this for educational purposes!

## 🙏 Acknowledgments

- Inspired by the epic world of Naruto
- A* algorithm visualization concept
- Retro arcade gaming aesthetics
- I have used AI to help me build this project
---

**Believe it! The path to becoming Hokage starts with good algorithms! 🍥**

## 🔧 Technical Architecture

```
📁 Project Structure
├── 📄 index.html          # Main HTML file
├── 📁 css/
│   ├── main.css           # Main styling & layout
│   ├── grid.css           # Grid visualization styles  
│   └── controls.css       # UI controls styling
├── 📁 js/
│   ├── 📁 classes/
│   │   ├── Node.js        # Grid node representation
│   │   ├── Grid.js        # Grid management
│   │   └── Astar.js       # A* algorithm implementation
│   ├── 📁 ui/
│   │   ├── controls.js    # UI control handlers
│   │   ├── gridRenderer.js # Grid rendering logic
│   │   └── battlefieldControls.js # Map controls
│   ├── 📁 utils/
│   │   └── helpers.js     # Utility functions & maps
│   └── app.js            # Main application logic
├── 📁 assets/            # Images and audio files
├── 📄 server.js          # Express server for deployment
├── 📄 package.json       # Node.js dependencies
```
