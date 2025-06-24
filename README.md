# Electric Grid Failure Prediction

This project simulates an electric grid's response to load increases, predicting cascading failures due to overloaded nodes (substations) and edges (transmission lines). Written in C++, the program uses a graph-based model with an interactive menu for managing and analyzing the grid.

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
- Apply uniform or random load increases to simulate demand spikes.
- Detect and simulate cascading failures when loads exceed capacities.
- Check grid connectivity and identify disconnected components.
- Save and load grid configurations from files.
- Display current grid status, including loads, capacities, and failure states.

## Requirements
- **Compiler:** g++ (GCC) with C++11 support.
- **Operating System:** Windows, macOS, or Linux.
- **Tools:** 
  - Visual Studio Code (recommended) with the C/C++ extension.
  - MinGW (Windows) or GCC (Linux/macOS) installed and added to PATH.

## Installation
1. **Clone or Download the Repository:**
   - Download the `main.cpp` file or clone the repository (if hosted) to your local machine:
     ```bash
     git clone <repository-url>
     cd electric-grid-failure-prediction
     ```

2. **Install Dependencies:**
   - **Windows:** Install MinGW via the MinGW Installation Manager and add it to your system PATH (e.g., `C:\MinGW\bin`).
   - **Mac:** Install Xcode command line tools (`xcode-select --install`) or GCC via Homebrew (`brew install gcc`).
   - **Linux:** Install GCC and g++ (e.g., `sudo apt install g++` on Ubuntu).

3. **Compile the Code:**
   - Open a terminal in the project directory (e.g., `D:\electric-grid-failure-prediction`).
   - Compile with:
     ```bash
     g++ -std=c++11 main.cpp -o main
     ```

4. **Run the Program:**
   - Execute the compiled binary:
     ```bash
     ./main  # Linux/macOS
     main.exe  # Windows
     ```

## Usage
1. **Start the Program:**
   - Run the compiled executable as shown above.

2. **Input Grid Configuration:**
   - Enter the number of nodes (substations).
   - For each node, input a name, current load (MW), and maximum capacity (MW).
   - Enter the number of edges (transmission lines).
   - For each edge, input the from-node index, to-node index, current load (MW), and capacity (MW).

3. **Interactive Menu:**
   - Select from the following options by entering a number (1-7):
     - **1. Display Grid Status:** Shows current loads, capacities, and statuses of all nodes and edges.
     - **2. Check Initial Overloads and Connectivity:** Reports overloaded nodes/edges and grid connectivity.
     - **3. Simulate Uniform Load Increase:** Applies a uniform percentage increase to all loads.
     - **4. Simulate Random Load Increase:** Applies a random percentage increase (50%-150% of the base) to all loads.
     - **5. Save Grid to File:** Saves the current grid to a specified file.
     - **6. Load Grid from File:** Loads a grid from a previously saved file.
     - **7. Exit:** Terminates the program.

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
   - Select option 4, enter `100` for a 100% load increase, and observe cascading failures if loads exceed capacities.

## Testing
- **Sample Test Case:**
  - Use the example input above and a 100% random load increase to trigger failures (e.g., Node A and edges B-A, B-C, C-D may fail).
- **Verify Output:**
  - Ensure failures are reported with loads exceeding capacities.
  - Check that the final state reflects active nodes/edges and connectivity status.
- **Edge Cases:**
  - Test with zero loads, maximum initial loads, or a disconnected initial grid.

## File Format
- **Save File Format:**
  - First line: Number of nodes.
  - Next `n` lines: Node name, load (MW), max capacity (MW).
  - Next line: Number of edges.
  - Next `m` lines: From-node index, to-node index, load (MW), capacity (MW).
- **Example `grid.txt`:**
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
- Feel free to fork the repository, submit issues, or create pull requests.
- Suggestions for improvements (e.g., visualization, optimization) are welcome.

## License
- This project is open-source under the MIT License.

## Future Enhancements
- **Improved Load Redistribution:** Make it proportional to capacity or neighbor loads.
- **Graphical Visualization:** Add a simple GUI or file output for plotting.
- **Predictive Analytics:** Suggest capacity upgrades to prevent failures.
- **Real-World Data Integration:** Support importing actual grid data.

---