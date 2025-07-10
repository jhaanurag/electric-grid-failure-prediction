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
#include <ctime>
#include <sstream>

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

// Union-Find for connectivity
class UnionFind {
private:
    vector<int> parent, rank;
public:
    UnionFind(int n) : parent(n), rank(n, 0) {
        for (int i = 0; i < n; i++) parent[i] = i;
    }
    int find(int x) {
        if (x < 0 || x >= static_cast<int>(parent.size())) return -1;
        if (parent[x] != x) parent[x] = find(parent[x]);
        return parent[x];
    }
    int find(int x) const {
        if (x < 0 || x >= static_cast<int>(parent.size())) return -1;
        if (parent[x] == x) return x;
        return find(parent[x]);
    }
    void unite(int x, int y) {
        int px = find(x), py = find(y);
        if (px == py || px == -1 || py == -1) return;
        if (rank[px] < rank[py]) parent[px] = py;
        else if (rank[px] > rank[py]) parent[py] = px;
        else {
            parent[py] = px;
            rank[px]++;
        }
    }
    bool connected(int x, int y) const {
        return find(x) == find(y);
    }
};

// Structure to store grid state for backup
struct GridState {
    vector<bool> nodeActive;
    vector<double> nodeLoads;
    vector<vector<bool>> edgeActive;
    vector<vector<double>> edgeLoads;
};

// Graph class to represent the electric grid
class Graph {
private:
    vector<Node> nodes; // List of nodes
    vector<vector<Edge>> adj; // Adjacency list for edges
    int numNodes;
    map<pair<int, int>, pair<int, int>> edgeIndex; // Map (u,v) to (index in adj[u], index in adj[v])
    default_random_engine rng; // For random load variations

    // DFS to collect component nodes
    void DFS(int v, vector<bool>& visited, vector<int>& component) const {
        if (v < 0 || v >= numNodes) return; // Ensure valid node index
        visited[v] = true;
        component.push_back(v);
        for (const Edge& e : adj[v]) {
            if (e.active && nodes[e.to].active && !visited[e.to]) {
                DFS(e.to, visited, component);
            }
        }
    }

    // Save current grid state
    GridState saveState() const {
        GridState state;
        state.nodeActive.resize(numNodes);
        state.nodeLoads.resize(numNodes);
        state.edgeActive.resize(numNodes);
        state.edgeLoads.resize(numNodes);
        for (int i = 0; i < numNodes; i++) {
            state.nodeActive[i] = nodes[i].active;
            state.nodeLoads[i] = nodes[i].load;
            state.edgeActive[i].resize(adj[i].size());
            state.edgeLoads[i].resize(adj[i].size());
            for (size_t j = 0; j < adj[i].size(); j++) {
                state.edgeActive[i][j] = adj[i][j].active;
                state.edgeLoads[i][j] = adj[i][j].currentLoad;
            }
        }
        return state;
    }

    // Restore grid state
    void restoreState(const GridState& state) {
        for (int i = 0; i < numNodes && i < static_cast<int>(state.nodeActive.size()); i++) {
            nodes[i].active = state.nodeActive[i];
            nodes[i].load = state.nodeLoads[i];
            if (i < static_cast<int>(state.edgeActive.size()) && adj[i].size() == state.edgeActive[i].size()) {
                for (size_t j = 0; j < adj[i].size(); j++) {
                    adj[i][j].active = state.edgeActive[i][j];
                    adj[i][j].currentLoad = state.edgeLoads[i][j];
                }
            }
        }
    }

public:
    Graph(int n) : numNodes(n), rng() {
        nodes.resize(n, {"", 0.0, 0.0, true});
        adj.resize(n);
        // Explicitly seed rng for reproducibility
        rng.seed(static_cast<unsigned>(time(nullptr)));
    }

    // Add a node (substation)
    bool addNode(int idx, const string& name, double load, double maxCapacity) {
        if (idx < 0 || idx >= numNodes) {
            cout << "Invalid node index: " << idx << ". Must be between 0 and " << (numNodes - 1) << ".\n";
            return false;
        }
        if (load < 0) {
            cout << "Invalid load for node " << name << ". Load must be >= 0.\n";
            return false;
        }
        if (maxCapacity <= 0) {
            cout << "Invalid max capacity for node " << name << ". Max capacity must be > 0.\n";
            return false;
        }
        if (load > maxCapacity) {
            cout << "Invalid load for node " << name << ". Load must be <= max capacity (" << maxCapacity << ").\n";
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
        if (capacity <= 0) {
            cout << "Invalid capacity for edge " << from << "-" << to << ". Capacity must be > 0.\n";
            return false;
        }
        if (currentLoad < 0) {
            cout << "Invalid load for edge " << from << "-" << to << ". Load must be >= 0.\n";
            return false;
        }
        pair<int, int> edge = {min(from, to), max(from, to)};
        if (edgeIndex.find(edge) != edgeIndex.end()) {
            cout << "Duplicate edge between " << from << " and " << to << ".\n";
            return false;
        }
        adj[from].push_back({to, capacity, currentLoad, true});
        adj[to].push_back({from, capacity, currentLoad, true});
        edgeIndex[edge] = {static_cast<int>(adj[from].size()) - 1, static_cast<int>(adj[to].size()) - 1};
        return true;
    }

    // Check if the grid is connected using Union-Find
    bool isConnected() const {
        UnionFind uf(numNodes);
        for (int u = 0; u < numNodes; u++) {
            if (!nodes[u].active) continue;
            for (const Edge& e : adj[u]) {
                if (e.active && nodes[e.to].active) {
                    uf.unite(u, e.to);
                }
            }
        }
        int root = -1;
        for (int i = 0; i < numNodes; i++) {
            if (nodes[i].active) {
                root = uf.find(i);
                break;
            }
        }
        if (root == -1) return true; // Empty grid
        for (int i = 0; i < numNodes; i++) {
            if (nodes[i].active && uf.find(i) != root) return false;
        }
        return true;
    }

    // Find connected components
    vector<vector<int>> findComponents() const {
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

    // Check for overloaded nodes or edges
    void checkOverloads(vector<string>& overloadedNodes, vector<pair<int, int>>& overloadedEdges) const {
        overloadedNodes.clear();
        overloadedEdges.clear();
        for (int i = 0; i < numNodes; i++) {
            if (nodes[i].active && nodes[i].load >= nodes[i].maxCapacity) {
                overloadedNodes.push_back(nodes[i].name);
            }
        }
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

        // Backup state
        GridState originalState = saveState();

        // Apply load increase
        uniform_real_distribution<double> dist(0.5, 1.5); // Random factor 50%-150%
        for (int i = 0; i < numNodes; i++) {
            if (nodes[i].active) {
                double factor = randomLoad ? dist(rng) : 1.0;
                double oldLoad = nodes[i].load;
                nodes[i].load *= (1 + loadIncreasePercent / 100.0 * factor);
                cout << "Node " << nodes[i].name << ": Load increased from " << fixed << setprecision(2)
                     << oldLoad << " to " << nodes[i].load << " MW (factor = " << factor << ")\n";
            }
        }
        for (int u = 0; u < numNodes; u++) {
            for (Edge& e : adj[u]) {
                if (e.active) {
                    double factor = randomLoad ? dist(rng) : 1.0;
                    double oldLoad = e.currentLoad;
                    e.currentLoad *= (1 + loadIncreasePercent / 100.0 * factor);
                    cout << "Edge " << nodes[u].name << "-" << nodes[e.to].name << ": Load increased from "
                         << oldLoad << " to " << e.currentLoad << " MW (factor = " << factor << ")\n";
                }
            }
        }

        // Simulate cascading failures
        priority_queue<pair<double, pair<int, int>>, vector<pair<double, pair<int, int>>>, greater<>> pq;
        vector<string> overloadedNodes;
        vector<pair<int, int>> overloadedEdges;
        checkOverloads(overloadedNodes, overloadedEdges);
        cout << "Initial Overloaded Nodes: " << overloadedNodes.size() << ", Overloaded Edges: " << overloadedEdges.size() << "\n";
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
            double severity = pq.top().first;
            pair<int, int> p = pq.top().second;
            pq.pop();
            int u = p.first, v = p.second;

            if (v == -1) { // Node failure
                if (u < 0 || u >= numNodes || !nodes[u].active) continue; // Skip if already failed or invalid
                nodes[u].active = false;
                cout << "Node " << nodes[u].name << " failed (load = " << fixed << setprecision(2)
                     << nodes[u].load << " MW, capacity = " << nodes[u].maxCapacity << " MW)\n";
            } else { // Edge failure
                pair<int, int> edge = {min(u, v), max(u, v)};
                auto it = edgeIndex.find(edge);
                if (it == edgeIndex.end()) continue;
                int idx_u = it->second.first, idx_v = it->second.second;
                if (idx_u >= static_cast<int>(adj[u].size()) || !adj[u][idx_u].active) continue;
                double failedLoad = adj[u][idx_u].currentLoad;
                adj[u][idx_u].active = false;
                if (idx_v < static_cast<int>(adj[v].size())) {
                    adj[v][idx_v].active = false;
                }
                cout << "Edge " << nodes[u].name << "-" << nodes[v].name << " failed (load = "
                     << failedLoad << " MW, capacity = " << adj[u][idx_u].capacity << " MW)\n";
                redistributeLoad(u, v, failedLoad);
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
        saveGridVisualization("grid.dot");

        // Restore state
        restoreState(originalState);
    }

    // Redistribute load after edge failure
    void redistributeLoad(int u, int v, double failedLoad) {
        for (int i : {u, v}) {
            if (i < 0 || i >= numNodes) continue; // Ensure valid node index
            double totalCapacity = 0.0;
            vector<Edge*> activeEdges;
            for (Edge& e : adj[i]) {
                if (e.active && nodes[e.to].active && e.currentLoad < e.capacity) {
                    totalCapacity += e.capacity - e.currentLoad;
                    activeEdges.push_back(&e);
                }
            }
            if (totalCapacity <= 0 || activeEdges.empty()) {
                cout << "Warning: No available capacity to redistribute load from node " << nodes[i].name << "\n";
                continue;
            }
            double loadPerCapacity = failedLoad / totalCapacity;
            for (Edge* e : activeEdges) {
                double additionalLoad = loadPerCapacity * (e->capacity - e->currentLoad);
                e->currentLoad += additionalLoad;
                cout << "Redistributed " << fixed << setprecision(2) << additionalLoad << " MW to edge "
                     << nodes[i].name << "-" << nodes[e->to].name << "\n";
            }
        }
    }

    // Identify critical nodes and edges
    void identifyCriticalComponents() {
        cout << "\nCritical Component Analysis:\n";
        GridState originalState = saveState();

        // Test each node
        cout << "Critical Nodes (failure disconnects grid):\n";
        for (int i = 0; i < numNodes; i++) {
            if (!nodes[i].active) continue;
            nodes[i].active = false;
            if (!isConnected()) {
                cout << "- " << nodes[i].name << ": Failure disconnects grid\n";
            }
            nodes[i].active = true;
        }

        // Test each edge
        cout << "Critical Edges (failure causes overloads or disconnection):\n";
        set<pair<int, int>> seenEdges;
        for (int u = 0; u < numNodes; u++) {
            for (const Edge& e : adj[u]) {
                pair<int, int> edge = {min(u, e.to), max(u, e.to)};
                if (u < e.to && e.active && seenEdges.find(edge) == seenEdges.end()) {
                    seenEdges.insert(edge);
                    auto it = edgeIndex.find(edge);
                    if (it == edgeIndex.end()) continue;
                    int idx_u = it->second.first, idx_v = it->second.second;
                    if (idx_u >= static_cast<int>(adj[u].size()) || idx_v >= static_cast<int>(adj[e.to].size())) continue;
                    double failedLoad = adj[u][idx_u].currentLoad;
                    adj[u][idx_u].active = false;
                    adj[e.to][idx_v].active = false;
                    bool critical = !isConnected();
                    if (!critical) {
                        redistributeLoad(u, e.to, failedLoad);
                        vector<string> overloadedNodes;
                        vector<pair<int, int>> overloadedEdges;
                        checkOverloads(overloadedNodes, overloadedEdges);
                        if (!overloadedNodes.empty() || !overloadedEdges.empty()) {
                            critical = true;
                        }
                    }
                    if (critical) {
                        cout << "- Edge " << nodes[u].name << "-" << nodes[e.to].name << ": Failure causes "
                             << (!isConnected() ? "disconnection" : "overloads") << "\n";
                    }
                    adj[u][idx_u].active = true;
                    adj[e.to][idx_v].active = true;
                    restoreState(originalState);
                }
            }
        }
        restoreState(originalState);
    }

    // Report grid state
    void reportGridState() const {
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
            for (int i = 0; i < static_cast<int>(components.size()); i++) {
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
    void displayGrid() const {
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

    // Save grid visualization to DOT file
    void saveGridVisualization(const string& filename) const {
        ofstream out(filename);
        if (!out) {
            cout << "Error opening file: " << filename << "\n";
            return;
        }
        out << "graph G {\n";
        out << "    rankdir=LR;\n";
        for (int i = 0; i < numNodes; i++) {
            out << "    " << nodes[i].name << " [label=\"" << nodes[i].name << "\\nLoad: "
                << fixed << setprecision(2) << nodes[i].load << " MW\\nCap: " << nodes[i].maxCapacity
                << " MW\", color=" << (nodes[i].active ? "blue" : "red") << "];\n";
        }
        set<pair<int, int>> seenEdges;
        for (int u = 0; u < numNodes; u++) {
            for (const Edge& e : adj[u]) {
                pair<int, int> edge = {min(u, e.to), max(u, e.to)};
                if (u < e.to && seenEdges.find(edge) == seenEdges.end()) {
                    out << "    " << nodes[u].name << " -- " << nodes[e.to].name
                        << " [label=\"Load: " << e.currentLoad << " MW\\nCap: " << e.capacity
                        << " MW\", color=" << (e.active ? "black" : "red") << "];\n";
                    seenEdges.insert(edge);
                }
            }
        }
        out << "}\n";
        out.close();
        cout << "Grid visualization saved to " << filename << "\n";
    }

    // Save grid to file
    void saveGrid(const string& filename) const {
        ofstream out(filename);
        if (!out) {
            cout << "Error opening file: " << filename << "\n";
            return;
        }
        out << numNodes << "\n";
        for (int i = 0; i < numNodes; i++) {
            out << nodes[i].name << " " << fixed << setprecision(2) << nodes[i].load << " " << nodes[i].maxCapacity << "\n";
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
                    out << u << " " << e.to << " " << fixed << setprecision(2) << e.currentLoad << " " << e.capacity << "\n";
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
        if (!(in >> n) || n <= 0) {
            cout << "Invalid number of nodes in file. Must be > 0.\n";
            in.close();
            return false;
        }
        Graph newGraph(n);
        map<string, int> nameToIndex;
        string line;
        getline(in, line); // Clear newline after n
        for (int i = 0; i < n; i++) {
            getline(in, line);
            if (in.eof()) {
                cout << "Unexpected end of file at line " << i + 2 << ".\n";
                in.close();
                return false;
            }
            istringstream iss(line);
            string name;
            double load, maxCapacity;
            if (!(iss >> name >> load >> maxCapacity) || name.empty()) {
                cout << "Invalid node data at line " << i + 2 << ". Expected: name load maxCapacity.\n";
                in.close();
                return false;
            }
            if (load < 0) {
                cout << "Invalid load at line " << i + 2 << ". Load must be >= 0.\n";
                in.close();
                return false;
            }
            if (maxCapacity <= 0) {
                cout << "Invalid max capacity at line " << i + 2 << ". Max capacity must be > 0.\n";
                in.close();
                return false;
            }
            if (load > maxCapacity) {
                cout << "Invalid load at line " << i + 2 << ". Load must be <= max capacity.\n";
                in.close();
                return false;
            }
            if (!newGraph.addNode(i, name, load, maxCapacity)) {
                in.close();
                return false;
            }
            nameToIndex[name] = i;
        }
        int m;
        if (!(in >> m) || m < 0) {
            cout << "Invalid number of edges in file. Must be >= 0.\n";
            in.close();
            return false;
        }
        getline(in, line); // Clear newline after m
        for (int i = 0; i < m; i++) {
            getline(in, line);
            if (in.eof() && i < m) {
                cout << "Unexpected end of file at line " << i + n + 3 << ".\n";
                in.close();
                return false;
            }
            istringstream iss(line);
            int u, v;
            double load, capacity;
            if (!(iss >> u >> v >> load >> capacity)) {
                cout << "Invalid edge data at line " << i + n + 3 << ". Expected: u v load capacity.\n";
                in.close();
                return false;
            }
            if (u < 0 || u >= n || v < 0 || v >= n) {
                cout << "Invalid node indices at line " << i + n + 3 << ". Indices must be between 0 and " << n - 1 << ".\n";
                in.close();
                return false;
            }
            if (load < 0) {
                cout << "Invalid load at line " << i + n + 3 << ". Load must be >= 0.\n";
                in.close();
                return false;
            }
            if (capacity <= 0) {
                cout << "Invalid capacity at line " << i + n + 3 << ". Capacity must be > 0.\n";
                in.close();
                return false;
            }
            if (!newGraph.addEdge(u, v, capacity, load)) {
                in.close();
                return false;
            }
        }
        in.close();
        edgeIndex.clear(); // Clear edgeIndex before assigning new graph
        *this = move(newGraph); // Use move to avoid unnecessary copying
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
        cout << "5. Identify Critical Components\n";
        cout << "6. Save Grid to File\n";
        cout << "7. Load Grid from File\n";
        cout << "8. Exit\n";
        cout << "Enter choice: ";
        int choice;
        while (!(cin >> choice) || choice < 1 || choice > 8) {
            cout << "Invalid input. Please enter a number between 1 and 8.\n";
            cin.clear();
            cin.ignore(numeric_limits<streamsize>::max(), '\n');
            cout << "Enter choice: ";
        }
        cin.ignore(numeric_limits<streamsize>::max(), '\n'); // Clear newline
        switch (choice) {
            case 1:
                grid.displayGrid();
                grid.saveGridVisualization("grid.dot");
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
                while (!(cin >> loadIncrease) || loadIncrease < 0) {
                    cout << "Invalid input. Please enter a non-negative number.\n";
                    cin.clear();
                    cin.ignore(numeric_limits<streamsize>::max(), '\n');
                    cout << "Enter load increase percentage: ";
                }
                cin.ignore(numeric_limits<streamsize>::max(), '\n'); // Clear newline
                grid.simulateCascadingFailures(loadIncrease, false);
                break;
            }
            case 4: {
                double loadIncrease;
                cout << "Enter base load increase percentage (e.g., 10 for 10%): ";
                while (!(cin >> loadIncrease) || loadIncrease < 0) {
                    cout << "Invalid input. Please enter a non-negative number.\n";
                    cin.clear();
                    cin.ignore(numeric_limits<streamsize>::max(), '\n');
                    cout << "Enter base load increase percentage: ";
                }
                cin.ignore(numeric_limits<streamsize>::max(), '\n'); // Clear newline
                grid.simulateCascadingFailures(loadIncrease, true);
                break;
            }
            case 5:
                grid.identifyCriticalComponents();
                break;
            case 6: {
                string filename;
                cout << "Enter filename to save grid: ";
                getline(cin, filename);
                if (filename.empty()) {
                    cout << "Invalid filename.\n";
                    break;
                }
                grid.saveGrid(filename);
                break;
            }
            case 7: {
                string filename;
                cout << "Enter filename to load grid: ";
                getline(cin, filename);
                if (filename.empty()) {
                    cout << "Invalid filename.\n";
                    break;
                }
                grid.loadGrid(filename);
                break;
            }
            case 8:
                cout << "Exiting program.\n";
                return;
            default:
                break; // Unreachable due to input validation
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
    cin.ignore(numeric_limits<streamsize>::max(), '\n'); // Clear newline
    Graph grid(numNodes);

    // Input nodes
    for (int i = 0; i < numNodes; i++) {
        string name;
        double load, maxCapacity;
        cout << "Enter name, load (MW), and max capacity (MW) for node " << i << ": ";
        while (true) {
            string line;
            getline(cin, line);
            istringstream iss(line);
            if (!(iss >> name >> load >> maxCapacity)) {
                cout << "Invalid input. Expected: name load maxCapacity (load >= 0, maxCapacity > 0, load <= maxCapacity). Try again: ";
                continue;
            }
            if (grid.addNode(i, name, load, maxCapacity)) {
                break;
            }
            cout << "Try again: ";
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
    cin.ignore(numeric_limits<streamsize>::max(), '\n'); // Clear newline
    for (int i = 0; i < numEdges; i++) {
        int u, v;
        double capacity, currentLoad;
        cout << "Enter edge " << i << ": from node index, to node index, load (MW), capacity (MW): ";
        while (true) {
            string line;
            getline(cin, line);
            istringstream iss(line);
            if (!(iss >> u >> v >> currentLoad >> capacity)) {
                cout << "Invalid input. Expected: u v load capacity (0 <= u,v < " << numNodes << ", load >= 0, capacity > 0). Try again: ";
                continue;
            }
            if (grid.addEdge(u, v, capacity, currentLoad)) {
                break;
            }
            cout << "Try again: ";
        }
    }

    // Run interactive menu
    runInteractive(grid);

    return 0;
}