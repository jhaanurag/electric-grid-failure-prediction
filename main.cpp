#include <iostream>
#include <vector>
#include <queue>
#include <string>
#include <limits>
#include <map>
#include <set>
#include <fstream>
#include <random>
#include <iomanip>

using namespace std;

// Structure to represent an edge (transmission line)
struct Edge {
    int to; // Destination node
    double capacity; // Max capacity in MW
    double currentLoad; // Current load in MW
    bool active; // Is the edge operational?
};

// Structure to represent a node (substation)
struct Node {
    string name; // Node identifier
    double load; // Current power demand in MW
    double maxCapacity; // Max capacity in MW
    bool active; // Is the node operational?
};

// Graph class to represent the electric grid
class Graph {
private:
    vector<Node> nodes; // List of nodes
    vector<vector<Edge>> adj; // Adjacency list for edges
    int numNodes;
    map<pair<int, int>, int> edgeIndex; // Map (u,v) to edge index in adj[u]
    default_random_engine rng; // For random load variations

    // DFS to check if grid is connected
    void DFS(int v, vector<bool>& visited) {
        visited[v] = true;
        for (const Edge& e : adj[v]) {
            if (e.active && nodes[e.to].active && !visited[e.to]) {
                DFS(e.to, visited);
            }
        }
    }

    // Find connected components
    vector<vector<int>> findComponents() {
        vector<bool> visited(numNodes, false);
        vector<vector<int>> components;
        for (int i = 0; i < numNodes; i++) {
            if (!visited[i] && nodes[i].active) {
                vector<int> component;
                DFS(i, visited, component);
                components.push_back(component);
            }
        }
        return components;
    }

    // Helper for DFS to collect component nodes
    void DFS(int v, vector<bool>& visited, vector<int>& component) {
        visited[v] = true;
        component.push_back(v);
        for (const Edge& e : adj[v]) {
            if (e.active && nodes[e.to].active && !visited[e.to]) {
                DFS(e.to, visited, component);
            }
        }
    }

public:
    Graph(int n) : numNodes(n), rng(random_device{}()) {
        nodes.resize(n, {"", 0.0, 0.0, true});
        adj.resize(n);
    }

    // Add a node (substation)
    bool addNode(int idx, string name, double load, double maxCapacity) {
        if (idx < 0 || idx >= numNodes) {
            cout << "Invalid node index: " << idx << ". Must be between 0 and " << (numNodes - 1) << ".\n";
            return false;
        }
        if (load < 0 || maxCapacity <= 0 || load > maxCapacity) {
            cout << "Invalid load or max capacity for node " << name << ". Load must be >= 0, max capacity > 0, and load <= max capacity.\n";
            return false;
        }
        nodes[idx] = {name, load, maxCapacity, true};
        return true;
    }

    // Add an edge (transmission line)
    bool addEdge(int from, int to, double capacity, double currentLoad) {
        if (from < 0 || from >= numNodes || to < 0 || to >= numNodes) {
            cout << "Invalid node index: " << from << " or " << to << ". Must be between 0 and " << (numNodes - 1) << ".\n";
            return false;
        }
        if (from == to) {
            cout << "Self-loops are not allowed: " << from << " to " << to << ".\n";
            return false;
        }
        if (capacity <= 0 || currentLoad < 0) {
            cout << "Invalid load or capacity for edge " << from << "-" << to 
                 << ". Capacity must be > 0, load >= 0.\n";
            return false;
        }
        // Check for duplicate edge
        if (edgeIndex.find({min(from, to), max(from, to)}) != edgeIndex.end()) {
            cout << "Duplicate edge between " << from << " and " << to << ".\n";
            return false;
        }
        adj[from].push_back({to, capacity, currentLoad, true});
        adj[to].push_back({from, capacity, currentLoad, true});
        edgeIndex[{min(from, to), max(from, to)}] = adj[from].size() - 1;
        return true;
    }

    // Check if the grid is connected
    bool isConnected() {
        vector<bool> visited(numNodes, false);
        int start = -1;
        for (int i = 0; i < numNodes; i++) {
            if (nodes[i].active) {
                start = i;
                break;
            }
        }
        if (start == -1) return true; // Empty grid is connected
        DFS(start, visited);
        for (int i = 0; i < numNodes; i++) {
            if (nodes[i].active && !visited[i]) return false;
        }
        return true;
    }

    // Check for overloaded nodes or edges
    void checkOverloads(vector<string>& overloadedNodes, vector<pair<int, int>>& overloadedEdges) {
        overloadedNodes.clear();
        overloadedEdges.clear();
        // Check nodes
        for (int i = 0; i < numNodes; i++) {
            if (nodes[i].active && nodes[i].load >= nodes[i].maxCapacity) { // Include equality
                overloadedNodes.push_back(nodes[i].name);
            }
        }
        // Check edges
        set<pair<int, int>> seenEdges;
        for (int u = 0; u < numNodes; u++) {
            for (const Edge& e : adj[u]) {
                pair<int, int> edge = {min(u, e.to), max(u, e.to)};
                if (e.active && e.currentLoad >= e.capacity && seenEdges.find(edge) == seenEdges.end()) {
                    overloadedEdges.push_back({u, e.to});
                    seenEdges.insert(edge);
                }
            }
        }
    }

    // Simulate cascading failures
    void simulateCascadingFailures(double loadIncreasePercent, bool randomLoad) {
        if (loadIncreasePercent < 0) {
            cout << "Load increase percentage must be >= 0.\n";
            return;
        }
        cout << "\nSimulating load increase by " << loadIncreasePercent << "% "
             << (randomLoad ? "with random variations" : "uniformly") << "\n";

        // Backup original state
        vector<Node> originalNodes = nodes;
        vector<vector<Edge>> originalAdj = adj;

        // Apply load increase
        uniform_real_distribution<double> dist(1.0, 1.5); // Random factor 50%-150%
        for (int i = 0; i < numNodes; i++) {
            if (nodes[i].active) {
                double factor = randomLoad ? dist(rng) : 1.0;
                double oldLoad = nodes[i].load;
                nodes[i].load *= (1 + loadIncreasePercent / 100.0 * factor);
                cout << "Node " << nodes[i].name << ": Load increased from " << oldLoad << " to " << nodes[i].load << " (factor = " << factor << ")\n";
            }
        }
        for (int u = 0; u < numNodes; u++) {
            for (Edge& e : adj[u]) {
                if (e.active) {
                    double factor = randomLoad ? dist(rng) : 1.0;
                    double oldLoad = e.currentLoad;
                    e.currentLoad *= (1 + loadIncreasePercent / 100.0 * factor);
                    cout << "Edge " << nodes[u].name << "-" << nodes[e.to].name << ": Load increased from " << oldLoad << " to " << e.currentLoad << " (factor = " << factor << ")\n";
                }
            }
        }

        // Simulate cascading failures
        priority_queue<pair<double, pair<int, int>>, vector<pair<double, pair<int, int>>>, greater<>> pq;
        // Add initial overloads to priority queue (severity = load/capacity)
        vector<string> overloadedNodes;
        vector<pair<int, int>> overloadedEdges;
        checkOverloads(overloadedNodes, overloadedEdges);
        cout << "Overloaded Nodes: " << overloadedNodes.size() << ", Overloaded Edges: " << overloadedEdges.size() << "\n";
        for (const string& name : overloadedNodes) {
            for (int i = 0; i < numNodes; i++) {
                if (nodes[i].name == name && nodes[i].active) {
                    pq.push({nodes[i].load / nodes[i].maxCapacity, {i, -1}});
                    break;
                }
            }
        }
        for (const auto& e : overloadedEdges) {
            for (const Edge& edge : adj[e.first]) {
                if (edge.to == e.second && edge.active) {
                    pq.push({edge.currentLoad / edge.capacity, {e.first, e.second}});
                    break;
                }
            }
        }

        // Process failures
        while (!pq.empty()) {
            pair<double, pair<int, int>> topElement = pq.top();
            pq.pop();
            double severity = topElement.first;
            int u = topElement.second.first;
            int v = topElement.second.second;

            if (v == -1) { // Node failure
                if (!nodes[u].active) continue; // Skip if already failed
                nodes[u].active = false;
                cout << "Node " << nodes[u].name << " failed (load = " << fixed << setprecision(2)
                     << nodes[u].load << " MW, capacity = " << nodes[u].maxCapacity << " MW)\n";
            } else { // Edge failure
                pair<int, int> edge = {min(u, v), max(u, v)};
                if (!adj[u][edgeIndex[edge]].active) continue; // Skip if already failed
                for (Edge& e : adj[u]) {
                    if (e.to == v) e.active = false;
                }
                for (Edge& e : adj[v]) {
                    if (e.to == u) e.active = false;
                }
                cout << "Edge " << nodes[u].name << "-" << nodes[v].name << " failed (load = "
                     << adj[u][edgeIndex[edge]].currentLoad << " MW, capacity = "
                     << adj[u][edgeIndex[edge]].capacity << " MW)\n";

                // Redistribute load to neighboring edges
                redistributeLoad(u, v);
            }

            // Recheck overloads
            checkOverloads(overloadedNodes, overloadedEdges);
            cout << "Rechecked Overloaded Nodes: " << overloadedNodes.size() << ", Overloaded Edges: " << overloadedEdges.size() << "\n";
            for (const string& name : overloadedNodes) {
                for (int i = 0; i < numNodes; i++) {
                    if (nodes[i].name == name && nodes[i].active) {
                        pq.push({nodes[i].load / nodes[i].maxCapacity, {i, -1}});
                        break;
                    }
                }
            }
            for (const auto& e : overloadedEdges) {
                for (const Edge& edge : adj[e.first]) {
                    if (edge.to == e.second && edge.active) {
                        pq.push({edge.currentLoad / edge.capacity, {e.first, e.second}});
                        break;
                    }
                }
            }
        }

        // Report final state
        reportGridState();

        // Restore original state
        nodes = originalNodes;
        adj = originalAdj;
    }

    // Redistribute load after edge failure
    void redistributeLoad(int u, int v) {
        // Simple redistribution: Increase load on remaining active edges
        for (int i = 0; i < numNodes; i++) {
            if (!nodes[i].active) continue;
            double totalCapacity = 0.0;
            for (const Edge& e : adj[i]) {
                if (e.active && nodes[e.to].active) {
                    totalCapacity += e.capacity;
                }
            }
            if (totalCapacity == 0) continue;
            for (Edge& e : adj[i]) {
                if (e.active && nodes[e.to].active) {
                    e.currentLoad += e.currentLoad * 0.1; // 10% increase
                }
            }
        }
    }

    // Report grid state
    void reportGridState() {
        cout << "\nFinal Grid State:\n";
        int activeNodes = 0, activeEdges = 0;
        for (const auto& node : nodes) {
            if (node.active) activeNodes++;
        }
        set<pair<int, int>> seenEdges;
        for (int u = 0; u < numNodes; u++) {
            for (const Edge& e : adj[u]) {
                pair<int, int> edge = {min(u, e.to), max(u, e.to)};
                if (e.active && seenEdges.find(edge) == seenEdges.end()) {
                    activeEdges++;
                    seenEdges.insert(edge);
                }
            }
        }
        cout << "Active Nodes: " << activeNodes << "/" << numNodes << "\n";
        cout << "Active Edges: " << activeEdges << "\n";
        if (!isConnected()) {
            auto components = findComponents();
            cout << "Grid is disconnected! Number of components: " << components.size() << "\n";
            for (int i = 0; i < components.size(); i++) {
                cout << "Component " << i + 1 << ": ";
                for (int v : components[i]) {
                    cout << nodes[v].name << " ";
                }
                cout << "\n";
            }
        } else {
            cout << "Grid remains connected.\n";
        }
    }

    // Display grid status
    void displayGrid() {
        cout << "\nGrid Status:\n";
        cout << "Nodes (Substations):\n";
        for (int i = 0; i < numNodes; i++) {
            cout << "Node " << nodes[i].name << ": Load = " << fixed << setprecision(2) 
                 << nodes[i].load << " MW, Max Capacity = " << nodes[i].maxCapacity 
                 << " MW, Status = " << (nodes[i].active ? "Active" : "Failed") << "\n";
        }
        cout << "Edges (Transmission Lines):\n";
        set<pair<int, int>> seenEdges;
        for (int u = 0; u < numNodes; u++) {
            for (const Edge& e : adj[u]) {
                pair<int, int> edge = {min(u, e.to), max(u, e.to)};
                if (u < e.to && seenEdges.find(edge) == seenEdges.end()) {
                    cout << "Between " << nodes[u].name << " and " << nodes[e.to].name 
                         << ": Load = " << e.currentLoad << " MW, Capacity = " << e.capacity 
                         << " MW, Status = " << (e.active ? "Active" : "Failed") << "\n";
                    seenEdges.insert(edge);
                }
            }
        }
    }

    // Save grid to file
    void saveGrid(const string& filename) {
        ofstream out(filename);
        if (!out) {
            cout << "Error opening file: " << filename << "\n";
            return;
        }
        out << numNodes << "\n";
        for (int i = 0; i < numNodes; i++) {
            out << nodes[i].name << " " << nodes[i].load << " " << nodes[i].maxCapacity << "\n";
        }
        int edgeCount = 0;
        set<pair<int, int>> seenEdges;
        for (int u = 0; u < numNodes; u++) {
            for (const Edge& e : adj[u]) {
                pair<int, int> edge = {min(u, e.to), max(u, e.to)};
                if (u < e.to && seenEdges.find(edge) == seenEdges.end()) {
                    edgeCount++;
                    seenEdges.insert(edge);
                }
            }
        }
        out << edgeCount << "\n";
        seenEdges.clear();
        for (int u = 0; u < numNodes; u++) {
            for (const Edge& e : adj[u]) {
                pair<int, int> edge = {min(u, e.to), max(u, e.to)};
                if (u < e.to && seenEdges.find(edge) == seenEdges.end()) {
                    out << u << " " << e.to << " " << e.currentLoad << " " << e.capacity << "\n";
                    seenEdges.insert(edge);
                }
            }
        }
        out.close();
        cout << "Grid saved to " << filename << "\n";
    }

    // Load grid from file
    bool loadGrid(const string& filename) {
        ifstream in(filename);
        if (!in) {
            cout << "Error opening file: " << filename << "\n";
            return false;
        }
        int n;
        in >> n;
        if (n <= 0) {
            cout << "Invalid number of nodes in file.\n";
            return false;
        }
        Graph newGraph(n);
        map<string, int> nameToIndex;
        for (int i = 0; i < n; i++) {
            string name;
            double load, maxCapacity;
            if (!(in >> name >> load >> maxCapacity)) {
                cout << "Invalid node data in file.\n";
                return false;
            }
            if (!newGraph.addNode(i, name, load, maxCapacity)) {
                return false;
            }
            nameToIndex[name] = i;
        }
        int m;
        in >> m;
        if (m < 0) {
            cout << "Invalid number of edges in file.\n";
            return false;
        }
        for (int i = 0; i < m; i++) {
            int u, v;
            double load, capacity;
            if (!(in >> u >> v >> load >> capacity)) {
                cout << "Invalid edge data in file.\n";
                return false;
            }
            if (!newGraph.addEdge(u, v, capacity, load)) {
                return false;
            }
        }
        in.close();
        *this = newGraph;
        cout << "Grid loaded from " << filename << "\n";
        return true;
    }

    // Getter for node name
    string getNodeName(int idx) const {
        if (idx >= 0 && idx < numNodes) {
            return nodes[idx].name;
        }
        return "Unknown";
    }
};

// Interactive menu
void runInteractive(Graph& grid) {
    while (true) {
        cout << "\nElectric Grid Failure Prediction Menu:\n";
        cout << "1. Display Grid Status\n";
        cout << "2. Check Initial Overloads and Connectivity\n";
        cout << "3. Simulate Uniform Load Increase\n";
        cout << "4. Simulate Random Load Increase\n";
        cout << "5. Save Grid to File\n";
        cout << "6. Load Grid from File\n";
        cout << "7. Exit\n";
        cout << "Enter choice: ";
        int choice;
        if (!(cin >> choice)) {
            cout << "Invalid input. Please enter a number.\n";
            cin.clear();
            cin.ignore(numeric_limits<streamsize>::max(), '\n');
            continue;
        }
        switch (choice) {
            case 1:
                grid.displayGrid();
                break;
            case 2: {
                vector<string> overloadedNodes;
                vector<pair<int, int>> overloadedEdges;
                grid.checkOverloads(overloadedNodes, overloadedEdges);
                if (!overloadedNodes.empty() || !overloadedEdges.empty()) {
                    cout << "\nOverloads Detected:\n";
                    if (!overloadedNodes.empty()) {
                        cout << "Overloaded Nodes:\n";
                        for (const string& name : overloadedNodes) {
                            cout << "- " << name << "\n";
                        }
                    }
                    if (!overloadedEdges.empty()) {
                        cout << "Overloaded Transmission Lines:\n";
                        for (const auto& e : overloadedEdges) {
                            cout << "- Between " << grid.getNodeName(e.first) << " and " 
                                 << grid.getNodeName(e.second) << "\n";
                        }
                    }
                } else {
                    cout << "\nNo overloads detected.\n";
                }
                cout << "Grid is " << (grid.isConnected() ? "connected" : "disconnected") << ".\n";
                break;
            }
            case 3: {
                double loadIncrease;
                cout << "Enter load increase percentage (e.g., 10 for 10%): ";
                if (!(cin >> loadIncrease)) {
                    cout << "Invalid input. Please enter a number.\n";
                    cin.clear();
                    cin.ignore(numeric_limits<streamsize>::max(), '\n');
                    continue;
                }
                grid.simulateCascadingFailures(loadIncrease, false);
                break;
            }
            case 4: {
                double loadIncrease;
                cout << "Enter base load increase percentage (e.g., 10 for 10%): ";
                if (!(cin >> loadIncrease)) {
                    cout << "Invalid input. Please enter a number.\n";
                    cin.clear();
                    cin.ignore(numeric_limits<streamsize>::max(), '\n');
                    continue;
                }
                grid.simulateCascadingFailures(loadIncrease, true);
                break;
            }
            case 5: {
                string filename;
                cout << "Enter filename to save grid: ";
                cin >> filename;
                grid.saveGrid(filename);
                break;
            }
            case 6: {
                string filename;
                cout << "Enter filename to load grid: ";
                cin >> filename;
                grid.loadGrid(filename);
                break;
            }
            case 7:
                cout << "Exiting program.\n";
                return;
            default:
                cout << "Invalid choice. Please select 1-7.\n";
        }
    }
}

// Main function
int main() {
    cout << "Electric Grid Failure Prediction\n";
    int numNodes;
    cout << "Enter number of nodes (substations): ";
    while (!(cin >> numNodes) || numNodes <= 0) {
        cout << "Invalid input. Number of nodes must be > 0.\n";
        cin.clear();
        cin.ignore(numeric_limits<streamsize>::max(), '\n');
        cout << "Enter number of nodes: ";
    }
    Graph grid(numNodes);

    // Input nodes
    for (int i = 0; i < numNodes; i++) {
        string name;
        double load, maxCapacity;
        cout << "Enter name, load (MW), and max capacity (MW) for node " << i << ": ";
        while (!(cin >> name >> load >> maxCapacity) || !grid.addNode(i, name, load, maxCapacity)) {
            cout << "Invalid input. Try again: ";
            cin.clear();
            cin.ignore(numeric_limits<streamsize>::max(), '\n');
        }
    }

    // Input edges
    int numEdges;
    cout << "Enter number of edges (transmission lines): ";
    while (!(cin >> numEdges) || numEdges < 0) {
        cout << "Invalid input. Number of edges must be >= 0.\n";
        cin.clear();
        cin.ignore(numeric_limits<streamsize>::max(), '\n');
        cout << "Enter number of edges: ";
    }
    for (int i = 0; i < numEdges; i++) {
        int u, v;
        double capacity, currentLoad;
        cout << "Enter edge " << i << ": from node index, to node index, load (MW), capacity (MW): ";
        while (!(cin >> u >> v >> currentLoad >> capacity) || !grid.addEdge(u, v, capacity, currentLoad)) {
            cout << "Invalid input. Try again: ";
            cin.clear();
            cin.ignore(numeric_limits<streamsize>::max(), '\n');
        }
    }

    // Run interactive menu
    runInteractive(grid);

    return 0;
}