import { useState } from 'react'
import './App.css'

const isGridConnected = (nodes, edges) => {
  const activeNodes = nodes.filter(n => n.active)
  if (activeNodes.length <= 1) return true
  
  const graph = new Map()
  activeNodes.forEach(node => graph.set(node.id, []))
  
  edges.filter(e => e.active).forEach(edge => {
    if (graph.has(edge.from) && graph.has(edge.to)) {
      graph.get(edge.from).push(edge.to)
      graph.get(edge.to).push(edge.from)
    }
  })
  
  const visited = new Set()
  const stack = [activeNodes[0].id]
  
  while (stack.length > 0) {
    const nodeId = stack.pop()
    if (!visited.has(nodeId)) {
      visited.add(nodeId)
      const neighbors = graph.get(nodeId) || []
      neighbors.forEach(neighbor => {
        if (!visited.has(neighbor)) {
          stack.push(neighbor)
        }
      })
    }
  }
  
  return visited.size === activeNodes.length
}

const findConnectedComponents = (nodes, edges) => {
  const activeNodes = nodes.filter(n => n.active)
  if (activeNodes.length === 0) return []
  
  const graph = new Map()
  activeNodes.forEach(node => graph.set(node.id, []))
  
  edges.filter(e => e.active).forEach(edge => {
    if (graph.has(edge.from) && graph.has(edge.to)) {
      graph.get(edge.from).push(edge.to)
      graph.get(edge.to).push(edge.from)
    }
  })
  
  const visited = new Set()
  const components = []
  
  activeNodes.forEach(node => {
    if (!visited.has(node.id)) {
      const component = []
      const stack = [node.id]
      
      while (stack.length > 0) {
        const nodeId = stack.pop()
        if (!visited.has(nodeId)) {
          visited.add(nodeId)
          component.push(nodeId)
          const neighbors = graph.get(nodeId) || []
          neighbors.forEach(neighbor => {
            if (!visited.has(neighbor)) {
              stack.push(neighbor)
            }
          })
        }
      }
      
      if (component.length > 0) {
        components.push(component)
      }
    }
  })
  
  return components
}

const findCriticalComponents = (nodes, edges) => {
  const criticalNodes = []
  const criticalEdges = []
  
  nodes.filter(n => n.active).forEach(node => {
    const testNodes = nodes.map(n => ({ ...n, active: n.id === node.id ? false : n.active }))
    const testEdges = edges.filter(e => e.from !== node.id && e.to !== node.id)
    
    if (!isGridConnected(testNodes, testEdges)) {
      criticalNodes.push(node)
    }
  })
  
  edges.filter(e => e.active).forEach(edge => {
    const testEdges = edges.map(e => ({ 
      ...e, 
      active: (e.from === edge.from && e.to === edge.to) ? false : e.active 
    }))
    
    if (!isGridConnected(nodes, testEdges)) {
      criticalEdges.push(edge)
    }
  })
  
  return { nodes: criticalNodes, edges: criticalEdges }
}

function App() {
  const [nodes, setNodes] = useState([
    { id: 0, name: 'A', x: 100, y: 100, load: 50, maxCapacity: 100, active: true },
    { id: 1, name: 'B', x: 300, y: 100, load: 60, maxCapacity: 120, active: true },
    { id: 2, name: 'C', x: 200, y: 200, load: 40, maxCapacity: 80, active: true },
    { id: 3, name: 'D', x: 100, y: 300, load: 70, maxCapacity: 100, active: true },
    { id: 4, name: 'E', x: 300, y: 300, load: 30, maxCapacity: 90, active: true }
  ])

  const [edges, setEdges] = useState([
    { from: 0, to: 1, load: 30, capacity: 50, active: true },
    { from: 0, to: 2, load: 25, capacity: 40, active: true },
    { from: 1, to: 2, load: 35, capacity: 60, active: true },
    { from: 2, to: 3, load: 20, capacity: 45, active: true },
    { from: 2, to: 4, load: 40, capacity: 55, active: true },
    { from: 3, to: 4, load: 15, capacity: 35, active: true }
  ])

  const [loadIncrease, setLoadIncrease] = useState(10)
  const [simulationResults, setSimulationResults] = useState(null)

  const loadPreset = (presetName) => {
    const presets = {
      simple: {
        nodes: [
          { id: 0, name: 'A', x: 150, y: 100, load: 40, maxCapacity: 80, active: true },
          { id: 1, name: 'B', x: 250, y: 100, load: 50, maxCapacity: 100, active: true },
          { id: 2, name: 'C', x: 200, y: 200, load: 30, maxCapacity: 60, active: true }
        ],
        edges: [
          { from: 0, to: 1, load: 20, capacity: 40, active: true },
          { from: 1, to: 2, load: 25, capacity: 50, active: true },
          { from: 0, to: 2, load: 15, capacity: 30, active: true }
        ]
      },
      complex: {
        nodes: [
          { id: 0, name: 'A', x: 100, y: 100, load: 80, maxCapacity: 100, active: true },
          { id: 1, name: 'B', x: 300, y: 100, load: 90, maxCapacity: 120, active: true },
          { id: 2, name: 'C', x: 200, y: 200, load: 70, maxCapacity: 80, active: true },
          { id: 3, name: 'D', x: 100, y: 300, load: 85, maxCapacity: 100, active: true },
          { id: 4, name: 'E', x: 300, y: 300, load: 60, maxCapacity: 90, active: true },
          { id: 5, name: 'F', x: 400, y: 200, load: 45, maxCapacity: 70, active: true }
        ],
        edges: [
          { from: 0, to: 1, load: 45, capacity: 50, active: true },
          { from: 0, to: 2, load: 35, capacity: 40, active: true },
          { from: 1, to: 2, load: 55, capacity: 60, active: true },
          { from: 2, to: 3, load: 40, capacity: 45, active: true },
          { from: 2, to: 4, load: 50, capacity: 55, active: true },
          { from: 3, to: 4, load: 30, capacity: 35, active: true },
          { from: 1, to: 5, load: 25, capacity: 40, active: true },
          { from: 4, to: 5, load: 20, capacity: 30, active: true }
        ]
      },
      ring: {
        nodes: [
          { id: 0, name: 'N', x: 200, y: 50, load: 65, maxCapacity: 100, active: true },
          { id: 1, name: 'E', x: 350, y: 150, load: 70, maxCapacity: 110, active: true },
          { id: 2, name: 'S', x: 200, y: 250, load: 55, maxCapacity: 90, active: true },
          { id: 3, name: 'W', x: 50, y: 150, load: 60, maxCapacity: 95, active: true },
          { id: 4, name: 'C', x: 200, y: 150, load: 75, maxCapacity: 120, active: true }
        ],
        edges: [
          { from: 0, to: 1, load: 40, capacity: 80, active: true },
          { from: 1, to: 2, load: 35, capacity: 75, active: true },
          { from: 2, to: 3, load: 30, capacity: 70, active: true },
          { from: 3, to: 0, load: 45, capacity: 85, active: true },
          { from: 4, to: 0, load: 25, capacity: 60, active: true },
          { from: 4, to: 1, load: 30, capacity: 65, active: true },
          { from: 4, to: 2, load: 35, capacity: 70, active: true },
          { from: 4, to: 3, load: 40, capacity: 75, active: true }
        ]
      },
      critical: {
        nodes: [
          { id: 0, name: 'Gen', x: 50, y: 150, load: 95, maxCapacity: 100, active: true },
          { id: 1, name: 'T1', x: 150, y: 100, load: 88, maxCapacity: 90, active: true },
          { id: 2, name: 'T2', x: 150, y: 200, load: 85, maxCapacity: 90, active: true },
          { id: 3, name: 'Hub', x: 250, y: 150, load: 92, maxCapacity: 100, active: true },
          { id: 4, name: 'L1', x: 350, y: 100, load: 75, maxCapacity: 80, active: true },
          { id: 5, name: 'L2', x: 350, y: 200, load: 70, maxCapacity: 75, active: true }
        ],
        edges: [
          { from: 0, to: 1, load: 48, capacity: 50, active: true },
          { from: 0, to: 2, load: 47, capacity: 50, active: true },
          { from: 1, to: 3, load: 44, capacity: 45, active: true },
          { from: 2, to: 3, load: 43, capacity: 45, active: true },
          { from: 3, to: 4, load: 39, capacity: 40, active: true },
          { from: 3, to: 5, load: 37, capacity: 38, active: true }
        ]
      }
    }
    
    if (presets[presetName]) {
      setNodes(presets[presetName].nodes)
      setEdges(presets[presetName].edges)
      setSimulationResults(null)
    }
  }

  const simulateFailure = () => {
    const factor = 1 + loadIncrease / 100
    let currentNodes = nodes.map(node => ({
      ...node,
      load: node.load * factor
    }))
    
    let currentEdges = edges.map(edge => ({
      ...edge,
      load: edge.load * factor
    }))

    const failures = []
    const cascadeSteps = []
    let iteration = 0
    const maxIterations = 10

    while (iteration < maxIterations) {
      const overloadedNodes = currentNodes.filter(node => node.active && node.load >= node.maxCapacity)
      const overloadedEdges = currentEdges.filter(edge => edge.active && edge.load >= edge.capacity)
      
      if (overloadedNodes.length === 0 && overloadedEdges.length === 0) {
        break
      }
      
      const allOverloads = [
        ...overloadedNodes.map(node => ({
          type: 'node',
          component: node,
          severity: node.load / node.maxCapacity
        })),
        ...overloadedEdges.map(edge => ({
          type: 'edge',
          component: edge,
          severity: edge.load / edge.capacity
        }))
      ]
      
      allOverloads.sort((a, b) => b.severity - a.severity)
      
      if (allOverloads.length === 0) break
      
      const mostCritical = allOverloads[0]
      
      if (mostCritical.type === 'node') {
        const nodeIndex = currentNodes.findIndex(n => n.id === mostCritical.component.id)
        if (nodeIndex !== -1) {
          currentNodes[nodeIndex].active = false
          failures.push(`Step ${iteration + 1}: Node ${mostCritical.component.name} failed (${mostCritical.component.load.toFixed(1)}MW > ${mostCritical.component.maxCapacity}MW)`)
          
          currentEdges = currentEdges.map(edge => {
            if (edge.from === mostCritical.component.id || edge.to === mostCritical.component.id) {
              return { ...edge, active: false }
            }
            return edge
          })
        }
      } else {
        const edgeIndex = currentEdges.findIndex(e => 
          e.from === mostCritical.component.from && e.to === mostCritical.component.to
        )
        if (edgeIndex !== -1) {
          currentEdges[edgeIndex].active = false
          const fromNode = currentNodes.find(n => n.id === mostCritical.component.from)
          const toNode = currentNodes.find(n => n.id === mostCritical.component.to)
          failures.push(`Step ${iteration + 1}: Edge ${fromNode?.name}-${toNode?.name} failed (${mostCritical.component.load.toFixed(1)}MW > ${mostCritical.component.capacity}MW)`)
        }
      }
      
      const connected = isGridConnected(currentNodes, currentEdges)
      const components = findConnectedComponents(currentNodes, currentEdges)
      
      cascadeSteps.push({
        iteration: iteration + 1,
        connected,
        components: components.length,
        activeNodes: currentNodes.filter(n => n.active).length,
        activeEdges: currentEdges.filter(e => e.active).length
      })
      
      if (!connected && components.length > 1) {
        failures.push(`Step ${iteration + 1}: Grid disconnected! ${components.length} isolated components created`)
        break
      }
      
      iteration++
    }

    const finalConnected = isGridConnected(currentNodes, currentEdges)
    const finalComponents = findConnectedComponents(currentNodes, currentEdges)

    setNodes(currentNodes)
    setEdges(currentEdges)
    setSimulationResults({
      totalFailures: failures.length,
      nodeFailures: currentNodes.filter(n => !n.active).length,
      edgeFailures: currentEdges.filter(e => !e.active).length,
      failures: failures,
      cascadeSteps: cascadeSteps,
      finalConnected: finalConnected,
      finalComponents: finalComponents,
      iterations: iteration
    })
  }

  const analyzeCriticalComponents = () => {
    const critical = findCriticalComponents(nodes, edges)
    setSimulationResults({
      type: 'critical',
      criticalNodes: critical.nodes,
      criticalEdges: critical.edges,
      totalCritical: critical.nodes.length + critical.edges.length
    })
  }

  const resetGrid = () => {
    loadPreset('simple')
  }

  const getNodeColor = (node) => {
    if (!node.active) return '#ff4444'
    const loadRatio = node.load / node.maxCapacity
    if (loadRatio >= 1) return '#ff4444'
    if (loadRatio >= 0.8) return '#ff8800'
    return '#44aa44'
  }

  const getEdgeColor = (edge) => {
    if (!edge.active) return '#ff4444'
    const loadRatio = edge.load / edge.capacity
    if (loadRatio >= 1) return '#ff4444'
    if (loadRatio >= 0.8) return '#ff8800'
    return '#666666'
  }

  const gridConnected = isGridConnected(nodes, edges)
  const components = findConnectedComponents(nodes, edges)

  return (
    <div className="app">
      <div className="sidebar">
        <h1>Electric Grid Failure Prediction</h1>
        
        <div className="control-section">
          <h2>Grid Presets</h2>
          <div className="preset-buttons">
            <button onClick={() => loadPreset('simple')}>
              Simple Grid (3 nodes)
            </button>
            <button onClick={() => loadPreset('complex')}>
              Complex Grid (6 nodes)
            </button>
            <button onClick={() => loadPreset('ring')}>
              Ring Network (5 nodes)
            </button>
            <button onClick={() => loadPreset('critical')}>
              Critical Path (6 nodes)
            </button>
          </div>
          <button onClick={resetGrid} style={{marginTop: '12px', width: '100%'}}>
            Reset to Simple Grid
          </button>
        </div>

        <div className="control-section">
          <h2>Simulation Controls</h2>
          <div className="control-group">
            <label>Load Increase (%)</label>
            <input
              type="number"
              value={loadIncrease}
              onChange={(e) => setLoadIncrease(Number(e.target.value))}
              min="0"
              max="100"
            />
          </div>
          <button onClick={simulateFailure} style={{marginTop: '12px', width: '100%'}}>
            Simulate Cascading Failures
          </button>
          <button onClick={analyzeCriticalComponents} style={{marginTop: '8px', width: '100%', background: 'linear-gradient(135deg, #9f7aea 0%, #805ad5 100%)'}}>
            Analyze Critical Components
          </button>
        </div>

        <div className="control-section">
          <h2>Grid Status</h2>
          <div className="status-grid">
            <div className="status-item">
              <h4>Active Nodes</h4>
              <p>{nodes.filter(n => n.active).length}/{nodes.length}</p>
            </div>
            <div className="status-item">
              <h4>Active Edges</h4>
              <p>{edges.filter(e => e.active).length}/{edges.length}</p>
            </div>
            <div className="status-item">
              <h4>Connectivity</h4>
              <p style={{color: gridConnected ? '#44aa44' : '#ff4444'}}>
                {gridConnected ? 'Connected' : 'Disconnected'}
              </p>
            </div>
            <div className="status-item">
              <h4>Components</h4>
              <p>{components.length}</p>
            </div>
            <div className="status-item">
              <h4>Overloaded Nodes</h4>
              <p>{nodes.filter(n => n.active && n.load >= n.maxCapacity).length}</p>
            </div>
            <div className="status-item">
              <h4>Overloaded Edges</h4>
              <p>{edges.filter(e => e.active && e.load >= e.capacity).length}</p>
            </div>
          </div>
        </div>

        {simulationResults && simulationResults.type === 'critical' && (
          <div className="control-section">
            <h2>Critical Component Analysis</h2>
            <div className="simulation-results">
              <h3>Critical Infrastructure</h3>
              <ul className="results-list">
                <li>Total Critical Components: {simulationResults.totalCritical}</li>
                <li>Critical Nodes: {simulationResults.criticalNodes.length}</li>
                <li>Critical Edges: {simulationResults.criticalEdges.length}</li>
              </ul>
              
              {simulationResults.criticalNodes.length > 0 && (
                <div>
                  <h4>Critical Nodes (Single Points of Failure):</h4>
                  <ul className="results-list">
                    {simulationResults.criticalNodes.map((node, index) => (
                      <li key={index} style={{color: '#e53e3e'}}>
                        <strong>{node.name}</strong> - Failure would disconnect grid
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {simulationResults.criticalEdges.length > 0 && (
                <div>
                  <h4>Critical Edges (Single Points of Failure):</h4>
                  <ul className="results-list">
                    {simulationResults.criticalEdges.map((edge, index) => {
                      const fromNode = nodes.find(n => n.id === edge.from)
                      const toNode = nodes.find(n => n.id === edge.to)
                      return (
                        <li key={index} style={{color: '#e53e3e'}}>
                          <strong>{fromNode?.name}-{toNode?.name}</strong> - Failure would disconnect grid
                        </li>
                      )
                    })}
                  </ul>
                </div>
              )}
              
              {simulationResults.totalCritical === 0 && (
                <p style={{color: '#44aa44', fontWeight: 'bold'}}>
                  ✅ No single points of failure detected - Grid has good redundancy!
                </p>
              )}
            </div>
          </div>
        )}

        {simulationResults && simulationResults.type !== 'critical' && (
          <div className="control-section">
            <h2>Cascading Failure Results</h2>
            <div className="simulation-results">
              <h3>Final Grid State</h3>
              <ul className="results-list">
                <li>Total Failure Steps: {simulationResults.iterations}</li>
                <li>Failed Nodes: {simulationResults.nodeFailures}</li>
                <li>Failed Edges: {simulationResults.edgeFailures}</li>
                <li style={{color: simulationResults.finalConnected ? '#44aa44' : '#e53e3e'}}>
                  Final State: {simulationResults.finalConnected ? 'Connected' : 'Disconnected'}
                </li>
                {!simulationResults.finalConnected && (
                  <li style={{color: '#e53e3e'}}>
                    Isolated Components: {simulationResults.finalComponents.length}
                  </li>
                )}
              </ul>
              
              {simulationResults.failures.length > 0 && (
                <div>
                  <h4>Cascade Sequence:</h4>
                  <ul className="results-list">
                    {simulationResults.failures.map((failure, index) => (
                      <li key={index}>{failure}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {!simulationResults.finalConnected && simulationResults.finalComponents.length > 1 && (
                <div>
                  <h4>Isolated Grid Sections:</h4>
                  {simulationResults.finalComponents.map((component, index) => (
                    <div key={index} style={{margin: '8px 0', padding: '8px', backgroundColor: '#fed7aa', borderRadius: '4px'}}>
                      <strong>Component {index + 1}:</strong> {' '}
                      {component.map(nodeId => {
                        const node = nodes.find(n => n.id === nodeId)
                        return node?.name || 'Unknown'
                      }).join(', ')}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="main-content">
        <div className="grid-canvas">
          <svg width="100%" height="100%" viewBox="0 0 1400 900" style={{display: 'block'}}>
            {edges.map((edge, index) => {
              const fromNode = nodes.find(n => n.id === edge.from)
              const toNode = nodes.find(n => n.id === edge.to)
              const scaledFromX = fromNode.x * 2.5 + 150
              const scaledFromY = fromNode.y * 2 + 100
              const scaledToX = toNode.x * 2.5 + 150
              const scaledToY = toNode.y * 2 + 100
              return (
                <g key={index}>
                  <line
                    x1={scaledFromX}
                    y1={scaledFromY}
                    x2={scaledToX}
                    y2={scaledToY}
                    stroke={getEdgeColor(edge)}
                    strokeWidth="6"
                  />
                  <text
                    x={(scaledFromX + scaledToX) / 2}
                    y={(scaledFromY + scaledToY) / 2 - 10}
                    fontSize="20"
                    fill="#333"
                    textAnchor="middle"
                    fontWeight="600"
                  >
                    {edge.load.toFixed(0)}/{edge.capacity}MW
                  </text>
                </g>
              )
            })}
            
            {nodes.map(node => {
              const scaledX = node.x * 2.5 + 150
              const scaledY = node.y * 2 + 100
              return (
                <g key={node.id}>
                  <circle
                    cx={scaledX}
                    cy={scaledY}
                    r="45"
                    fill={getNodeColor(node)}
                    stroke="#333"
                    strokeWidth="4"
                  />
                  <text
                    x={scaledX}
                    y={scaledY + 8}
                    fontSize="28"
                    fill="white"
                    textAnchor="middle"
                    fontWeight="bold"
                  >
                    {node.name}
                  </text>
                  <text
                    x={scaledX}
                    y={scaledY + 70}
                    fontSize="22"
                    fill="#333"
                    textAnchor="middle"
                    fontWeight="600"
                  >
                    {node.load.toFixed(0)}/{node.maxCapacity}MW
                  </text>
                </g>
              )
            })}
          </svg>
        </div>
        
        <div className="legend" style={{
          marginTop: '24px', 
          display: 'flex', 
          justifyContent: 'center', 
          gap: '40px',
          padding: '20px',
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
          width: '100%',
          maxWidth: '1200px'
        }}>
          <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
            <div style={{width: '20px', height: '20px', backgroundColor: '#44aa44', borderRadius: '50%'}}></div>
            <span style={{fontSize: '16px', fontWeight: '500'}}>Normal (&lt;80%)</span>
          </div>
          <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
            <div style={{width: '20px', height: '20px', backgroundColor: '#ff8800', borderRadius: '50%'}}></div>
            <span style={{fontSize: '16px', fontWeight: '500'}}>Warning (80-99%)</span>
          </div>
          <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
            <div style={{width: '20px', height: '20px', backgroundColor: '#ff4444', borderRadius: '50%'}}></div>
            <span style={{fontSize: '16px', fontWeight: '500'}}>Failed (≥100%)</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
