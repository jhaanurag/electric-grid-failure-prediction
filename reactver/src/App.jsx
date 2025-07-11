import { useState } from 'react'
import './App.css'

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
    const newNodes = nodes.map(node => ({
      ...node,
      load: node.load * factor
    }))
    
    const newEdges = edges.map(edge => ({
      ...edge,
      load: edge.load * factor
    }))

    const failures = []
    const overloadedNodes = newNodes.filter(node => node.load >= node.maxCapacity)
    const overloadedEdges = newEdges.filter(edge => edge.load >= edge.capacity)
    
    overloadedNodes.forEach(node => {
      failures.push(`Node ${node.name} failed: ${node.load.toFixed(1)}MW > ${node.maxCapacity}MW`)
    })
    
    overloadedEdges.forEach(edge => {
      const fromNode = nodes.find(n => n.id === edge.from)
      const toNode = nodes.find(n => n.id === edge.to)
      failures.push(`Edge ${fromNode.name}-${toNode.name} failed: ${edge.load.toFixed(1)}MW > ${edge.capacity}MW`)
    })

    setNodes(newNodes)
    setEdges(newEdges)
    setSimulationResults({
      totalFailures: failures.length,
      nodeFailures: overloadedNodes.length,
      edgeFailures: overloadedEdges.length,
      failures: failures
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
          </div>
          <button onClick={resetGrid} style={{marginTop: '12px', width: '100%'}}>
            Reset Grid
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
            Simulate Load Increase
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
              <h4>Overloaded Nodes</h4>
              <p>{nodes.filter(n => n.load >= n.maxCapacity).length}</p>
            </div>
            <div className="status-item">
              <h4>Overloaded Edges</h4>
              <p>{edges.filter(e => e.load >= e.capacity).length}</p>
            </div>
          </div>
        </div>

        {simulationResults && (
          <div className="control-section">
            <h2>Simulation Results</h2>
            <div className="simulation-results">
              <h3>Results Summary</h3>
              <ul className="results-list">
                <li>Total Failures: {simulationResults.totalFailures}</li>
                <li>Node Failures: {simulationResults.nodeFailures}</li>
                <li>Edge Failures: {simulationResults.edgeFailures}</li>
              </ul>
              {simulationResults.failures.length > 0 && (
                <div>
                  <h4>Failure Details:</h4>
                  <ul className="results-list">
                    {simulationResults.failures.map((failure, index) => (
                      <li key={index}>{failure}</li>
                    ))}
                  </ul>
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
