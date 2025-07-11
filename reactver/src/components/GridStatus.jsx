import { useAtom } from 'jotai'
import { nodesAtom, edgesAtom, gridConnectedAtom } from '../atoms/gridAtoms'
import { checkOverloads, findConnectedComponents } from '../utils/gridAnalysis'

const GridStatus = () => {
  const [nodes] = useAtom(nodesAtom)
  const [edges] = useAtom(edgesAtom)
  const [isConnected] = useAtom(gridConnectedAtom)

  const overloads = checkOverloads(nodes, edges)
  const components = findConnectedComponents(nodes, edges)
  const activeNodes = nodes.filter(node => node.active).length
  const activeEdges = edges.filter(edge => edge.active).length

  return (
    <div className="grid-status">
      <h3>Grid Status</h3>
      
      <div className="status-grid">
        <div className="status-item">
          <span className="status-label">Active Nodes:</span>
          <span className="status-value">{activeNodes}/{nodes.length}</span>
        </div>
        
        <div className="status-item">
          <span className="status-label">Active Edges:</span>
          <span className="status-value">{activeEdges}/{edges.length}</span>
        </div>
        
        <div className="status-item">
          <span className="status-label">Connectivity:</span>
          <span className={`status-value ${isConnected ? 'connected' : 'disconnected'}`}>
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
        
        <div className="status-item">
          <span className="status-label">Components:</span>
          <span className="status-value">{components.length}</span>
        </div>
      </div>

      {overloads.nodes.length > 0 && (
        <div className="overloads-section">
          <h4>Overloaded Nodes</h4>
          <ul className="overload-list">
            {overloads.nodes.map(node => (
              <li key={node.id} className="overload-item node-overload">
                <strong>{node.name}</strong>: {node.load.toFixed(1)} MW / {node.maxCapacity.toFixed(1)} MW 
                ({((node.load / node.maxCapacity) * 100).toFixed(1)}%)
              </li>
            ))}
          </ul>
        </div>
      )}

      {overloads.edges.length > 0 && (
        <div className="overloads-section">
          <h4>Overloaded Transmission Lines</h4>
          <ul className="overload-list">
            {overloads.edges.map(edge => {
              const fromNode = nodes.find(n => n.id === edge.from)
              const toNode = nodes.find(n => n.id === edge.to)
              return (
                <li key={edge.id} className="overload-item edge-overload">
                  <strong>{fromNode?.name || 'Unknown'} - {toNode?.name || 'Unknown'}</strong>: 
                  {edge.currentLoad.toFixed(1)} MW / {edge.capacity.toFixed(1)} MW 
                  ({((edge.currentLoad / edge.capacity) * 100).toFixed(1)}%)
                </li>
              )
            })}
          </ul>
        </div>
      )}

      {!isConnected && components.length > 1 && (
        <div className="components-section">
          <h4>Disconnected Components</h4>
          {components.map((component, index) => (
            <div key={index} className="component">
              <strong>Component {index + 1}:</strong> {' '}
              {component.map(nodeId => {
                const node = nodes.find(n => n.id === nodeId)
                return node?.name || 'Unknown'
              }).join(', ')}
            </div>
          ))}
        </div>
      )}

      {overloads.nodes.length === 0 && overloads.edges.length === 0 && isConnected && (
        <div className="all-clear">
          <p className="success-message">✅ Grid is operating normally - no overloads detected</p>
        </div>
      )}
    </div>
  )
}

export default GridStatus
