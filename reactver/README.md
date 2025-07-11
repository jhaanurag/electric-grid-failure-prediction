# Electric Grid Failure Prediction

An interactive React web application that simulates cascading failures in electrical power grids. This project converts a C++ grid analysis tool into a modern, user-friendly web interface with real-time visualization and analysis capabilities.

## Features

- **Interactive Grid Visualization**: Visual representation of electrical grid nodes and transmission lines
- **Cascading Failure Simulation**: Simulate how load increases can lead to component failures and grid instability  
- **Critical Component Analysis**: Identify nodes and edges whose failure would cause grid disconnection or overloads
- **Multiple Grid Presets**: Demo configurations including simple networks, high-load scenarios, and ring topologies
- **Real-time State Management**: Built with Jotai for efficient state management
- **Modern UI**: Clean, responsive design with real-time updates

## Getting Started

```bash
npm install
npm run dev
```

The application will be available at `http://localhost:5173`

## Usage

1. **Load a Grid Preset**: Choose from predefined grid configurations
2. **Analyze Current State**: View grid connectivity, overloads, and component status  
3. **Run Simulations**: Simulate cascading failures with customizable load increases
4. **Interpret Results**: Review failure sequences, final grid state, and connectivity analysis

## Technology Stack

- React 18 + Vite for fast development
- Jotai for atomic state management
- SVG visualization with real-time updates
- Modern CSS with responsive design
