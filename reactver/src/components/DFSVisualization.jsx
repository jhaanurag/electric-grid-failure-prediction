import { useState, useEffect } from 'react'

const DFSVisualization = ({ nodes, edges, onClose }) => {
  const [dfsState, setDfsState] = useState({
    visited: new Set(),
    stack: [],
    current: null,
    finished: false,
    step: 0,
    path: [],
    adjacencyList: new Map(),
    lastAction: '',
    currentAction: '',
    actionHistory: []
  })
  
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(1000)

  useEffect(() => {
    initializeDFS()
  }, [nodes, edges])

  const initializeDFS = () => {
    const activeNodes = nodes.filter(n => n.active)
    if (activeNodes.length === 0) return

    const graph = new Map()
    activeNodes.forEach(node => graph.set(node.id, []))
    
    edges.filter(e => e.active).forEach(edge => {
      if (graph.has(edge.from) && graph.has(edge.to)) {
        graph.get(edge.from).push(edge.to)
        graph.get(edge.to).push(edge.from)
      }
    })

    const startNode = activeNodes[0].id
    const startNodeName = activeNodes[0].name
    setDfsState({
      visited: new Set(),
      stack: [startNode],
      current: null,
      finished: false,
      step: 0,
      path: [],
      adjacencyList: graph,
      lastAction: '',
      currentAction: `Step 0: Initialize - Push ${startNodeName} to stack`,
      actionHistory: [`Initialize: Push node ${startNodeName} to stack`]
    })
  }

  const stepDFS = () => {
    setDfsState(prevState => {
      const { visited, stack, adjacencyList, step, path, actionHistory } = prevState
      
      if (stack.length === 0) {
        return { 
          ...prevState, 
          finished: true, 
          current: null,
          currentAction: 'DFS Complete - Stack is empty',
          lastAction: prevState.currentAction
        }
      }

      const currentNode = stack[stack.length - 1]
      const currentNodeName = nodes.find(n => n.id === currentNode)?.name || 'Unknown'
      const newStack = [...stack]
      newStack.pop()
      
      const newVisited = new Set(visited)
      const newPath = [...path]
      const newActionHistory = [...actionHistory]
      let currentAction = ''
      
      if (!newVisited.has(currentNode)) {
        newVisited.add(currentNode)
        newPath.push(currentNode)
        
        const neighbors = adjacencyList.get(currentNode) || []
        const unvisitedNeighbors = neighbors.filter(neighbor => 
          !newVisited.has(neighbor) && !newStack.includes(neighbor)
        )
        
        currentAction = `Step ${step + 1}: Pop ${currentNodeName} from stack → Visit it`
        
        if (unvisitedNeighbors.length > 0) {
          unvisitedNeighbors.reverse().forEach(neighbor => {
            newStack.push(neighbor)
            const neighborName = nodes.find(n => n.id === neighbor)?.name || 'Unknown'
            currentAction += ` → Push ${neighborName}`
          })
        } else {
          currentAction += ' (no new neighbors to push)'
        }
        
        newActionHistory.push(currentAction)
        
        return {
          ...prevState,
          visited: newVisited,
          stack: newStack,
          current: currentNode,
          step: step + 1,
          path: newPath,
          lastAction: prevState.currentAction,
          currentAction: currentAction,
          actionHistory: newActionHistory
        }
      } else {
        currentAction = `Step ${step + 1}: Pop ${currentNodeName} from stack → Already visited, skip`
        newActionHistory.push(currentAction)
        
        return {
          ...prevState,
          stack: newStack,
          current: currentNode,
          step: step + 1,
          lastAction: prevState.currentAction,
          currentAction: currentAction,
          actionHistory: newActionHistory
        }
      }
    })
  }

  const autoPlay = () => {
    if (!isPlaying) return
    
    const timer = setTimeout(() => {
      if (!dfsState.finished) {
        stepDFS()
      } else {
        setIsPlaying(false)
      }
    }, speed)
    
    return () => clearTimeout(timer)
  }

  useEffect(() => {
    if (isPlaying) {
      const cleanup = autoPlay()
      return cleanup
    }
  }, [isPlaying, dfsState.step, speed])

  const resetDFS = () => {
    setIsPlaying(false)
    initializeDFS()
  }

  const getNodeVisualizationColor = (nodeId) => {
    if (dfsState.current === nodeId) return '#ff6b35'
    if (dfsState.visited.has(nodeId)) return '#4a90e2'
    if (dfsState.stack.includes(nodeId)) return '#ffa500'
    return '#e0e0e0'
  }

  const getNodeVisualizationStroke = (nodeId) => {
    if (dfsState.current === nodeId) return '#ff4444'
    if (dfsState.stack.includes(nodeId)) return '#ff8800'
    return '#666'
  }

  const generateTreeLayout = () => {
    const activeNodes = nodes.filter(n => n.active)
    const nodePositions = new Map()
    const treeEdges = []
    
    if (activeNodes.length === 0) return { nodePositions, treeEdges }
    
    const visited = new Set()
    const startNode = activeNodes[0].id
    const childrenByParent = new Map()
    const nodeOrder = []
    
    const buildDFSTree = (nodeId, parent = null) => {
      if (visited.has(nodeId)) return
      visited.add(nodeId)
      nodeOrder.push(nodeId)
      
      if (parent !== null) {
        treeEdges.push({ from: parent, to: nodeId })
        if (!childrenByParent.has(parent)) {
          childrenByParent.set(parent, [])
        }
        childrenByParent.get(parent).push(nodeId)
      }
      
      const neighbors = dfsState.adjacencyList.get(nodeId) || []
      const unvisitedNeighbors = neighbors.filter(neighbor => 
        !visited.has(neighbor) && activeNodes.some(n => n.id === neighbor)
      )
      
      unvisitedNeighbors.forEach(neighbor => {
        buildDFSTree(neighbor, nodeId)
      })
    }
    
    buildDFSTree(startNode)
    
    const calculatePositions = (nodeId, x, y, width) => {
      nodePositions.set(nodeId, { x, y })
      
      const children = childrenByParent.get(nodeId) || []
      if (children.length === 0) return
      
      const childWidth = width / children.length
      children.forEach((child, index) => {
        const childX = x - width/2 + childWidth/2 + index * childWidth
        const childY = y + 120
        calculatePositions(child, childX, childY, childWidth * 0.8)
      })
    }
    
    calculatePositions(startNode, 400, 80, 600)
    
    const unvisitedNodes = activeNodes.filter(node => !visited.has(node.id))
    if (unvisitedNodes.length > 0) {
      const isolatedY = 500
      const spacing = 700 / (unvisitedNodes.length + 1)
      unvisitedNodes.forEach((node, index) => {
        const x = spacing * (index + 1) + 50
        nodePositions.set(node.id, { x: x, y: isolatedY })
      })
    }
    
    return { nodePositions, treeEdges }
  }

  const { nodePositions: treePositions, treeEdges } = generateTreeLayout()

  return (
    <div className="dfs-visualization-overlay">
      <div className="dfs-visualization-modal">
        <div className="dfs-header">
          <h2>🌳 Depth-First Search Tree Visualization</h2>
          <button onClick={onClose} className="close-btn">×</button>
        </div>
        
        <div className="dfs-content">
          <div className="dfs-graph">
            <svg width="800" height="600" viewBox="0 0 800 600">
              {treeEdges.map((edge, index) => {
                const fromPos = treePositions.get(edge.from)
                const toPos = treePositions.get(edge.to)
                if (!fromPos || !toPos) return null
                
                const isInPath = dfsState.path.includes(edge.from) && dfsState.path.includes(edge.to)
                
                return (
                  <line
                    key={index}
                    x1={fromPos.x}
                    y1={fromPos.y}
                    x2={toPos.x}
                    y2={toPos.y}
                    stroke={isInPath ? '#4a90e2' : '#ccc'}
                    strokeWidth={isInPath ? 3 : 2}
                    opacity={isInPath ? 1 : 0.5}
                  />
                )
              })}
              
              {nodes.filter(n => n.active).map(node => {
                const pos = treePositions.get(node.id)
                if (!pos) return null
                
                return (
                  <g key={node.id}>
                    <circle
                      cx={pos.x}
                      cy={pos.y}
                      r={25}
                      fill={getNodeVisualizationColor(node.id)}
                      stroke={getNodeVisualizationStroke(node.id)}
                      strokeWidth={4}
                    />
                    <text
                      x={pos.x}
                      y={pos.y + 6}
                      fill="white"
                      fontSize="16"
                      fontWeight="bold"
                      textAnchor="middle"
                    >
                      {node.name}
                    </text>
                  </g>
                )
              })}
            </svg>
          </div>
          
          <div className="dfs-side-panel">
            <div className="dfs-controls-section">
              <div className="dfs-buttons">
                <button 
                  onClick={stepDFS} 
                  disabled={dfsState.finished || isPlaying}
                  className="step-btn"
                >
                  Step Forward
                </button>
                <button 
                  onClick={() => setIsPlaying(!isPlaying)} 
                  disabled={dfsState.finished}
                  className="play-btn"
                >
                  {isPlaying ? 'Pause' : 'Auto Play'}
                </button>
                <button onClick={resetDFS} className="reset-btn">
                  Reset
                </button>
              </div>
              
              <div className="speed-control">
                <label>Speed: </label>
                <input
                  type="range"
                  min="200"
                  max="2000"
                  value={speed}
                  onChange={(e) => setSpeed(Number(e.target.value))}
                  className="speed-slider"
                />
                <span>{(2200 - speed) / 200}x</span>
              </div>
            </div>

            <div className="dfs-current-action">
              <h3>🎯 Current Action</h3>
              <div className="current-action-box">
                {dfsState.currentAction || 'Ready to start...'}
              </div>
            </div>

            <div className="dfs-status">
              <div className="status-row">
                <span className="status-label">Step:</span>
                <span className="status-value">{dfsState.step}</span>
              </div>
              <div className="status-row">
                <span className="status-label">Current Node:</span>
                <span className="status-value current-node">
                  {dfsState.current ? nodes.find(n => n.id === dfsState.current)?.name || 'Unknown' : 'None'}
                </span>
              </div>
            </div>

            <div className="dfs-stack-display">
              <h3>📚 Stack (Next to Visit)</h3>
              <div className="stack-container">
                {dfsState.stack.length === 0 ? (
                  <div className="empty-indicator">Empty</div>
                ) : (
                  dfsState.stack.slice().reverse().map((nodeId, index) => (
                    <div 
                      key={`${nodeId}-${index}`} 
                      className={`stack-item ${index === dfsState.stack.length - 1 ? 'stack-top' : ''}`}
                    >
                      <span className="stack-position">
                        {index === dfsState.stack.length - 1 ? '👆 TOP' : `${dfsState.stack.length - index - 1}`}
                      </span>
                      <span className="stack-node">
                        {nodes.find(n => n.id === nodeId)?.name || 'Unknown'}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="dfs-visited-display">
              <h3>✅ Visited Nodes ({dfsState.visited.size}/{nodes.filter(n => n.active).length})</h3>
              <div className="visited-container">
                {dfsState.visited.size === 0 ? (
                  <div className="empty-indicator">None yet</div>
                ) : (
                  <div className="visited-grid">
                    {Array.from(dfsState.visited).map(nodeId => (
                      <div key={nodeId} className="visited-item">
                        {nodes.find(n => n.id === nodeId)?.name || 'Unknown'}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="dfs-action-history">
              <h3>📜 Action History</h3>
              <div className="action-history-container">
                {dfsState.actionHistory.length === 0 ? (
                  <div className="empty-indicator">No actions yet</div>
                ) : (
                  <div className="action-list">
                    {dfsState.actionHistory.slice(-5).map((action, index) => (
                      <div key={index} className={`action-item ${index === dfsState.actionHistory.slice(-5).length - 1 ? 'latest-action' : ''}`}>
                        {action}
                      </div>
                    ))}
                    {dfsState.actionHistory.length > 5 && (
                      <div className="action-item older-actions">
                        ... and {dfsState.actionHistory.length - 5} earlier actions
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="dfs-path-display">
              <h3>🛤️ Traversal Path</h3>
              <div className="path-container">
                {dfsState.path.length === 0 ? (
                  <div className="empty-indicator">Not started</div>
                ) : (
                  <div className="path-sequence">
                    {dfsState.path.map((nodeId, index) => (
                      <span key={nodeId} className="path-item">
                        {nodes.find(n => n.id === nodeId)?.name || 'Unknown'}
                        {index < dfsState.path.length - 1 && <span className="path-arrow">→</span>}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="dfs-legend">
              <h4>Legend:</h4>
              <div className="legend-items">
                <div className="legend-item">
                  <div className="legend-color" style={{backgroundColor: '#e0e0e0'}}></div>
                  <span>Unvisited</span>
                </div>
                <div className="legend-item">
                  <div className="legend-color" style={{backgroundColor: '#ffa500'}}></div>
                  <span>In Stack</span>
                </div>
                <div className="legend-item">
                  <div className="legend-color" style={{backgroundColor: '#ff6b35'}}></div>
                  <span>Current</span>
                </div>
                <div className="legend-item">
                  <div className="legend-color" style={{backgroundColor: '#4a90e2'}}></div>
                  <span>Visited</span>
                </div>
              </div>
              <p style={{fontSize: '12px', color: '#666', marginTop: '8px'}}>
                💡 <strong>Tree Layout:</strong> Nodes are arranged in levels based on DFS discovery order. 
                Isolated nodes appear at the bottom.
              </p>
            </div>
            
            {!dfsState.finished && dfsState.step > 0 && (
              <div className="next-action">
                <strong>Next Action:</strong> {
                  dfsState.stack.length > 0 
                    ? `Process node ${nodes.find(n => n.id === dfsState.stack[dfsState.stack.length - 1])?.name}`
                    : 'Search complete'
                }
              </div>
            )}

            {dfsState.finished && (
              <div className="completion-message">
                <h4>🎉 DFS Complete!</h4>
                <p><strong>Search Summary:</strong></p>
                <ul>
                  <li>Visited {dfsState.visited.size} out of {nodes.filter(n => n.active).length} nodes</li>
                  <li>Completed in {dfsState.step} algorithm steps</li>
                </ul>
                <p><strong>Connectivity Result:</strong></p>
                <p style={{color: dfsState.visited.size === nodes.filter(n => n.active).length ? '#22543d' : '#e53e3e'}}>
                  {dfsState.visited.size === nodes.filter(n => n.active).length 
                    ? '✅ All nodes reachable - Grid is CONNECTED' 
                    : `❌ Only ${dfsState.visited.size}/${nodes.filter(n => n.active).length} nodes reachable - Grid is DISCONNECTED`
                  }
                </p>
                {dfsState.visited.size < nodes.filter(n => n.active).length && (
                  <p>
                    <strong>Unreachable nodes:</strong> {' '}
                    {nodes.filter(n => n.active && !dfsState.visited.has(n.id))
                      .map(n => n.name).join(', ')}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
        
        <div className="dfs-explanation">
          <h4>🌳 DFS Spanning Tree:</h4>
          <p><strong>Tree Structure:</strong> This shows the DFS spanning tree - only the edges traversed during DFS are displayed as a tree.</p>
          <h4>How DFS Works:</h4>
          <ol>
            <li><strong>Initialize:</strong> Start with first node in stack</li>
            <li><strong>Pop:</strong> Remove node from top of stack</li>
            <li><strong>Visit:</strong> Mark current node as visited</li>
            <li><strong>Explore:</strong> Add unvisited neighbors to stack</li>
            <li><strong>Repeat:</strong> Until stack is empty</li>
          </ol>
          <p><strong>Purpose:</strong> This algorithm checks if all nodes are reachable (grid connectivity)</p>
        </div>
      </div>
    </div>
  )
}

export default DFSVisualization
