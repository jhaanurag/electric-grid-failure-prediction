# Electric Grid Failure Prediction - Pygame Version

This is a visual, interactive version of the electric grid failure prediction system built with Pygame.

## Quick Demo Tests

The program includes three predefined demo scenarios to help you verify functionality:

### 🟢 Demo 1: Stable Grid Test
- **Purpose**: Verify basic functionality with a stable grid
- **How to test**: 
  1. Click "Demo: Stable Grid" (green button)
  2. Click "Simulate Failures" 
  3. **Expected Result**: Grid should remain stable (all nodes green)
- **What it tests**: Basic grid visualization, load distribution, stability analysis

### 🟡 Demo 2: Overload Test  
- **Purpose**: Test overload detection and visualization
- **How to test**:
  1. Click "Demo: Overload" (orange button)
  2. Click "Simulate Failures"
  3. **Expected Result**: Some nodes/edges should turn orange (overloaded)
- **What it tests**: Overload detection, color-coding, threshold calculations

### 🔴 Demo 3: Cascade Failure Test
- **Purpose**: Test cascading failure simulation
- **How to test**:
  1. Click "Demo: Cascade" (red button) 
  2. Click "Simulate Failures"
  3. **Expected Result**: Multiple failures should occur (red nodes/edges), grid may disconnect
- **What it tests**: Cascading failures, load redistribution, connectivity analysis

### Quick Verification Checklist ✅
- [ ] Window opens with grid visualization
- [ ] Can click and drag nodes to move them
- [ ] Control panel shows grid statistics
- [ ] All three demo scenarios load different grids
- [ ] Simulation produces expected color changes
- [ ] "Reset Grid" button restores original state
- [ ] "Toggle Info" shows/hides load numbers

## Features

- **Interactive Grid Visualization**: Visual representation of the electric grid with nodes (substations) and edges (transmission lines)
- **Real-time Simulation**: Simulate cascading failures with visual feedback
- **Drag-and-Drop Interface**: Move nodes around to reorganize the grid layout
- **Load Increase Simulation**: Test grid stability under increased load conditions
- **Color-coded Status**: 
  - Green nodes: Normal operation
  - Orange nodes: Overloaded
  - Red nodes: Failed
  - Blue edges: Normal operation
  - Orange edges: Overloaded
  - Red edges: Failed
- **Interactive Controls**: Easy-to-use control panel with buttons and input fields
- **Grid Statistics**: Real-time display of grid health metrics

## Requirements

- Python 3.7+
- Pygame 2.5.2+

## Installation

1. Install the required dependencies:
```bash
pip install -r requirements.txt
```

Or install pygame directly:
```bash
pip install pygame
```

## Usage

Run the pygame version:
```bash
python3 grid_pygame.py
```

## Controls

### Mouse Controls:
- **Left Click on Node**: Select a node to view its details
- **Drag Node**: Click and drag to move nodes around the grid
- **Left Click on Empty Space**: Deselect current node

### Control Panel Buttons:
- **Reset Grid**: Restore the grid to its original state
- **Simulate Failures**: Run cascading failure simulation with current load increase percentage
- **Increase Load**: Increase all loads by the specified percentage
- **Critical Analysis**: Analyze critical components (coming soon)
- **Add Node**: Add a new random node to the grid
- **Add Edge**: Add a new edge between nodes (coming soon)
- **Save Grid**: Save current grid configuration (coming soon)
- **Load Grid**: Load a grid configuration from file (coming soon)
- **Toggle Info**: Toggle display of node and edge information

### Input Fields:
- **Load Increase**: Set the percentage by which to increase loads (default: 10%)

## Grid Information Display

The control panel shows:
- Number of nodes and edges
- Active vs. failed components
- Grid connectivity status
- Overload statistics
- Selected node details (when a node is selected)

## Sample Grid

The program starts with a sample 6-node grid arranged in a hexagonal pattern with cross-connections, providing a good demonstration of grid behavior under various conditions.

## Visual Indicators

- **Node Size**: All nodes are the same size (representing substations)
- **Edge Width**: Thicker edges indicate higher load ratios
- **Node Colors**: Green (normal), Orange (overloaded), Red (failed)
- **Edge Colors**: Blue (normal), Orange (overloaded), Red (failed)
- **Selected Node**: Purple outline indicates the currently selected node
- **Load Information**: Shows current load / maximum capacity for nodes and edges

## Future Enhancements

- Critical path analysis with visual highlighting
- Load flow animation
- Grid editing capabilities (add/remove nodes and edges)
- Save/load grid configurations
- Advanced simulation parameters
- Performance metrics and reporting
- Network topology analysis tools
