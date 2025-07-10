# Electric Grid Failure Prediction

This project simulates an electric grid's response to load increases, predicting cascading failures due to overloaded nodes (substations) and edges (transmission lines). Written in C++, the program uses a graph-based model with an interactive menu for managing and analyzing the grid. Last updated: 10:31 PM IST, Thursday, July 10, 2025.

## Table of Contents
- [Features](#features)
- [Requirements](#requirements)
- [Installation](#installation)
- [Usage](#usage)
- [Testing](#testing)
- [File Format](#file-format)
- [Contributing](#contributing)
- [License](#license)
- [Future Enhancements](#future-enhancements)

## Features
- Create and manage a grid with nodes (substations) and edges (transmission lines).
- Apply uniform or random load increases to simulate demand spikes (up to 150% of base increase).
- Detect and simulate cascading failures when loads exceed capacities.
- Check grid connectivity and identify disconnected components using Depth-First Search (DFS).
- Save and load grid configurations from text files.
- Display current grid status, including loads, capacities, and failure states, with DOT file visualization support.

## Requirements
- **Compiler:** g++ (GCC) with C++11 support.
- **Operating System:** Windows, macOS, or Linux.
- **Tools:**
  - Visual Studio Code (recommended) with the C/C++ extension.
  - MinGW (Windows) or GCC (Linux/macOS) installed and added to PATH.
  - Graphviz (optional) for visualizing the generated `grid.dot` file.

## Installation
1. **Clone or Download the Repository:**
   - Download the `electric_grid.cpp` file or clone the repository (if hosted) to your local machine:
     ```bash
     git clone <repository-url>
     cd electric-grid-failure-prediction
     ```
2. **Install Dependencies:**
   - **Windows:** Install MinGW via the MinGW Installation Manager and add it to your system PATH (e.g., `C:\MinGW\bin`).
   - **Mac:** Install Xcode command line tools (`xcode-select --install`) or GCC via Homebrew (`brew install gcc`).
   - **Linux:** Install GCC and g++ (e.g., `sudo apt install g++` on Ubuntu).
   - **Graphviz (Optional):** Install via `brew install graphviz` (Mac), `sudo apt install graphviz` (Linux), or the official installer (Windows).
3. **Compile the Code:**
   - Open a terminal in the project directory (e.g., `D:\electric-grid-failure-prediction`).
   - Compile with:
     ```bash
     g++ -std=c++11 electric_grid.cpp -o electric_grid
     ```
4. **Run the Program:**
   - Execute the compiled binary:
     ```bash
     ./electric_grid  # Linux/macOS
     electric_grid.exe  # Windows
     ```

## Usage
1. **Start the Program:**
   - Run the compiled executable as shown above.
2. **Input Grid Configuration:**
   - Enter the number of nodes (substations).
   - For each node, input a name, current load (MW), and maximum capacity (MW) (load must be ≤ max capacity).
   - Enter the number of edges (transmission lines).
   - For each edge, input the from-node index, to-node index, current load (MW), and capacity (MW) (indices must be valid, load ≤ capacity).
3. **Interactive Menu:**
   - Select from the following options by entering a number (1-8):
     - **1. Display Grid Status:** Shows current loads, capacities, and statuses, generating a `grid.dot` file for visualization.
     - **2. Check Initial Overloads and Connectivity:** Reports overloaded nodes/edges and grid connectivity.
     - **3. Simulate Uniform Load Increase:** Applies a uniform percentage increase to all loads.
     - **4. Simulate Random Load Increase:** Applies a random percentage increase (50%-150% of the base) to all loads.
     - **5. Identify Critical Components:** Highlights nodes/edges whose failure disconnects or overloads the grid.
     - **6. Save Grid to File:** Saves the current grid to a specified file.
     - **7. Load Grid from File:** Loads a grid from a previously saved file.
     - **8. Exit:** Terminates the program.
4. **Example Input:**
   ```
   Enter number of nodes (substations): 4
   Enter name, load (MW), and max capacity (MW) for node 0: A 50 100
   Enter name, load (MW), and max capacity (MW) for node 1: B 60 120
   Enter name, load (MW), and max capacity (MW) for node 2: C 70 140
   Enter name, load (MW), and max capacity (MW) for node 3: D 80 160
   Enter number of edges (transmission lines): 3
   Enter edge 0: from node index, to node index, load (MW), capacity (MW): 0 1 40 80
   Enter edge 1: from node index, to node index, load (MW), capacity (MW): 1 2 50 100
   Enter edge 2: from node index, to node index, load (MW), capacity (MW): 2 3 60 120
   ```
5. **Example Simulation:**
   - Select option 4, enter `50` for a 50% base load increase, and observe cascading failures if loads exceed capacities (e.g., Edge A-B may fail if random factor pushes load > 80 MW).

## Testing
1. **Sample Test Case:**
   - Use the example input above and a 50% random load increase to trigger failures (e.g., Node A or edges may fail if loads exceed capacities).
2. **Verify Output:**
   - Ensure failures are reported with loads exceeding capacities (e.g., "Edge A-B failed (load = 90.00 MW, capacity = 80.00 MW)").
   - Check that the final state reflects active nodes/edges and connectivity status (e.g., "Grid remains connected" or "Grid is disconnected").
3. **Edge Cases:**
   - Test with zero loads, maximum initial loads (e.g., load = capacity), or a disconnected initial grid (e.g., no edges).
   - Validate file I/O with the sample `grid.txt` format.

## File Format
1. **Save File Format:**
   - First line: Number of nodes.
   - Next `n` lines: Node name, load (MW), max capacity (MW).
   - Next line: Number of edges.
   - Next `m` lines: From-node index, to-node index, load (MW), capacity (MW).
2. **Example `grid.txt`:**
   ```
   4
   A 50 100
   B 60 120
   C 70 140
   D 80 160
   3
   0 1 40 80
   1 2 50 100
   2 3 60 120
   ```

## Contributing
1. Fork the repository, submit issues, or create pull requests.
2. Suggestions for improvements (e.g., GUI integration, optimization) are welcome.
3. Contact the developer at [adityaprakashiu] for collaboration.

## License
- This project is open-source under the MIT License.

## Future Enhancements
1. **Improved Load Redistribution:** Implement proportional redistribution based on capacity or neighbor loads.
2. **Graphical Visualization:** Integrate a GUI (e.g., using SFML) or enhance DOT file output with interactive features.
3. **Predictive Analytics:** Use historical data to suggest capacity upgrades or predict critical failure points.
4. **Real-World Data Integration:** Support importing actual grid datasets (e.g., IEEE test systems).
</DOCUMENT>
```
