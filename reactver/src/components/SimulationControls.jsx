import { useState } from 'react'
import { useAtom } from 'jotai'
import { nodesAtom, edgesAtom, simulationResultsAtom } from '../atoms/gridAtoms'
import { simulateCascadingFailures, identifyCriticalComponents } from '../utils/gridAnalysis'

const SimulationControls = () => {
  const [nodes] = useAtom(nodesAtom)
  const [edges] = useAtom(edgesAtom)
  const [, setSimulationResults] = useAtom(simulationResultsAtom)
  
  const [loadIncrease, setLoadIncrease] = useState(10)
  const [randomLoad, setRandomLoad] = useState(false)
  const [isSimulating, setIsSimulating] = useState(false)

  const runSimulation = async () => {
    if (nodes.length === 0 || edges.length === 0) {
      alert('Please load a grid preset first!')
      return
    }

    setIsSimulating(true)
    
    setTimeout(() => {
      const results = simulateCascadingFailures(nodes, edges, loadIncrease, randomLoad)
      setSimulationResults(results)
      setIsSimulating(false)
    }, 100)
  }

  const runCriticalAnalysis = async () => {
    if (nodes.length === 0 || edges.length === 0) {
      alert('Please load a grid preset first!')
      return
    }

    setIsSimulating(true)
    
    setTimeout(() => {
      const critical = identifyCriticalComponents(nodes, edges)
      setSimulationResults({
        type: 'critical',
        criticalNodes: critical.nodes,
        criticalEdges: critical.edges
      })
      setIsSimulating(false)
    }, 100)
  }

  return (
    <div className="simulation-controls">
      <h3>Simulation Controls</h3>
      
      <div className="control-group">
        <label htmlFor="load-increase">Load Increase (%)</label>
        <input
          id="load-increase"
          type="number"
          min="0"
          max="100"
          value={loadIncrease}
          onChange={(e) => setLoadIncrease(Number(e.target.value))}
          className="load-input"
        />
      </div>

      <div className="control-group">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={randomLoad}
            onChange={(e) => setRandomLoad(e.target.checked)}
          />
          Random Load Variation (50-150% factor)
        </label>
      </div>

      <div className="button-group">
        <button 
          onClick={runSimulation}
          disabled={isSimulating || nodes.length === 0}
          className="simulate-btn primary"
        >
          {isSimulating ? 'Simulating...' : 'Simulate Cascading Failures'}
        </button>

        <button 
          onClick={runCriticalAnalysis}
          disabled={isSimulating || nodes.length === 0}
          className="analyze-btn secondary"
        >
          {isSimulating ? 'Analyzing...' : 'Identify Critical Components'}
        </button>
      </div>

      <div className="simulation-help">
        <h4>How it works:</h4>
        <ul>
          <li><strong>Cascading Failures:</strong> Increases load and simulates component failures when overloaded</li>
          <li><strong>Critical Analysis:</strong> Identifies components whose failure would disconnect the grid or cause overloads</li>
          <li><strong>Random Variation:</strong> Applies random load factors (50-150%) to simulate real-world uncertainty</li>
        </ul>
      </div>
    </div>
  )
}

export default SimulationControls
