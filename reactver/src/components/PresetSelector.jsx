import { useAtom } from 'jotai'
import { nodesAtom, edgesAtom, presetGridsAtom, simulationResultsAtom } from '../atoms/gridAtoms'

const PresetSelector = () => {
  const [presets] = useAtom(presetGridsAtom)
  const [, setNodes] = useAtom(nodesAtom)
  const [, setEdges] = useAtom(edgesAtom)
  const [, setSimulationResults] = useAtom(simulationResultsAtom)

  const loadPreset = (preset) => {
    setNodes(preset.nodes)
    setEdges(preset.edges)
    setSimulationResults(null)
  }

  const clearGrid = () => {
    setNodes([])
    setEdges([])
    setSimulationResults(null)
  }

  return (
    <div className="preset-selector">
      <h3>Demo Grid Presets</h3>
      <p className="preset-description">
        Choose a predefined grid configuration to explore different scenarios:
      </p>
      
      <div className="preset-buttons">
        {presets.map((preset, index) => (
          <button
            key={index}
            onClick={() => loadPreset(preset)}
            className="preset-btn"
          >
            <div className="preset-name">{preset.name}</div>
            <div className="preset-details">
              {preset.nodes.length} nodes, {preset.edges.length} edges
            </div>
          </button>
        ))}
      </div>

      <div className="preset-descriptions">
        <div className="preset-info">
          <h4>Preset Descriptions:</h4>
          <ul>
            <li><strong>Simple 4-Node Grid:</strong> Basic configuration with moderate loads, good for learning</li>
            <li><strong>High Load Grid:</strong> Several components near capacity, prone to cascading failures</li>
            <li><strong>Ring Network:</strong> Redundant ring topology with central hub, tests resilience</li>
          </ul>
        </div>
      </div>

      <button onClick={clearGrid} className="clear-btn">
        Clear Grid
      </button>
    </div>
  )
}

export default PresetSelector
