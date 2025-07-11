import { useAtom } from 'jotai'
import { simulationResultsAtom, nodesAtom } from '../atoms/gridAtoms'

const SimulationResults = () => {
  const [results] = useAtom(simulationResultsAtom)
  const [originalNodes] = useAtom(nodesAtom)

  if (!results) {
    return (
      <div className="simulation-results">
        <h3>Simulation Results</h3>
        <p className="no-results">Run a simulation to see results here.</p>
      </div>
    )
  }

  if (results.type === 'critical') {
    return (
      <div className="simulation-results">
        <h3>Critical Component Analysis</h3>
        
        <div className="critical-section">
          <h4>Critical Nodes ({results.criticalNodes.length})</h4>
          {results.criticalNodes.length > 0 ? (
            <ul className="critical-list">
              {results.criticalNodes.map(node => (
                <li key={node.id} className="critical-item critical-node">
                  <strong>{node.name}</strong> - Failure would disconnect the grid
                </li>
              ))}
            </ul>
          ) : (
            <p className="no-critical">No critical nodes identified</p>
          )}
        </div>

        <div className="critical-section">
          <h4>Critical Edges ({results.criticalEdges.length})</h4>
          {results.criticalEdges.length > 0 ? (
            <ul className="critical-list">
              {results.criticalEdges.map(edge => {
                const fromNode = originalNodes.find(n => n.id === edge.from)
                const toNode = originalNodes.find(n => n.id === edge.to)
                return (
                  <li key={edge.id} className="critical-item critical-edge">
                    <strong>{fromNode?.name || 'Unknown'} - {toNode?.name || 'Unknown'}</strong> - 
                    Failure would cause disconnection or overloads
                  </li>
                )
              })}
            </ul>
          ) : (
            <p className="no-critical">No critical edges identified</p>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="simulation-results">
      <h3>Cascading Failure Simulation Results</h3>
      
      <div className="results-summary">
        <div className="summary-grid">
          <div className="summary-item">
            <span className="summary-label">Final Active Nodes:</span>
            <span className="summary-value">{results.activeNodes}/{originalNodes.length}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Final Active Edges:</span>
            <span className="summary-value">{results.activeEdges}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Grid Connectivity:</span>
            <span className={`summary-value ${results.connected ? 'connected' : 'disconnected'}`}>
              {results.connected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Simulation Iterations:</span>
            <span className="summary-value">{results.iterations}</span>
          </div>
        </div>
      </div>

      {!results.connected && results.components.length > 1 && (
        <div className="components-section">
          <h4>Final Grid Components</h4>
          {results.components.map((component, index) => (
            <div key={index} className="component">
              <strong>Component {index + 1}:</strong> {' '}
              {component.map(nodeId => {
                const node = originalNodes.find(n => n.id === nodeId)
                return node?.name || 'Unknown'
              }).join(', ')}
            </div>
          ))}
        </div>
      )}

      {results.failureLog.length > 0 && (
        <div className="failure-log">
          <h4>Failure Sequence</h4>
          <div className="log-container">
            {results.failureLog.map((failure, index) => (
              <div key={index} className={`log-entry ${failure.type}-failure`}>
                <span className="failure-index">{index + 1}.</span>
                {failure.type === 'node' ? (
                  <span className="failure-text">
                    Node <strong>{failure.name}</strong> failed 
                    (Load: {failure.load.toFixed(1)} MW, Capacity: {failure.capacity.toFixed(1)} MW, 
                    Severity: {(failure.severity * 100).toFixed(1)}%)
                  </span>
                ) : (
                  <span className="failure-text">
                    Edge <strong>{failure.from} - {failure.to}</strong> failed 
                    (Load: {failure.load.toFixed(1)} MW, Capacity: {failure.capacity.toFixed(1)} MW,
                    Severity: {(failure.severity * 100).toFixed(1)}%)
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {results.failureLog.length === 0 && (
        <div className="no-failures">
          <p className="success-message">✅ No failures occurred during simulation</p>
        </div>
      )}
    </div>
  )
}

export default SimulationResults
