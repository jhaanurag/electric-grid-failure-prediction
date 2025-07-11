import { useAtom } from 'jotai'
import { nodesAtom, edgesAtom } from '../atoms/gridAtoms'

const GridVisualization = () => {
  const [nodes] = useAtom(nodesAtom)
  const [edges] = useAtom(edgesAtom)

  const getNodeColor = (node) => {
    if (!node.active) return '#ff4444'
    const utilization = node.load / node.maxCapacity
    if (utilization >= 1) return '#ff6b35'
    if (utilization >= 0.8) return '#ffa500'
    return '#4a90e2'
  }

  const getEdgeColor = (edge) => {
    if (!edge.active) return '#ff4444'
    const utilization = edge.currentLoad / edge.capacity
    if (utilization >= 1) return '#ff6b35'
    if (utilization >= 0.8) return '#ffa500'
    return '#666'
  }

  const getNodePosition = (index, total) => {
    const angle = (2 * Math.PI * index) / total
    const radius = Math.min(150, 50 + total * 10)
    return {
      x: 200 + radius * Math.cos(angle),
      y: 200 + radius * Math.sin(angle)
    }
  }

  return (
    <div className="grid-visualization">
      <svg width="400" height="400" className="grid-svg">
        {edges.map((edge) => {
          const fromNode = nodes.find(n => n.id === edge.from)
          const toNode = nodes.find(n => n.id === edge.to)
          if (!fromNode || !toNode) return null

          const fromPos = getNodePosition(fromNode.id, nodes.length)
          const toPos = getNodePosition(toNode.id, nodes.length)
          
          return (
            <g key={edge.id}>
              <line
                x1={fromPos.x}
                y1={fromPos.y}
                x2={toPos.x}
                y2={toPos.y}
                stroke={getEdgeColor(edge)}
                strokeWidth={edge.active ? 3 : 1}
                strokeDasharray={edge.active ? 'none' : '5,5'}
              />
              <text
                x={(fromPos.x + toPos.x) / 2}
                y={(fromPos.y + toPos.y) / 2}
                fill="#333"
                fontSize="10"
                textAnchor="middle"
                className="edge-label"
              >
                {edge.currentLoad.toFixed(0)}/{edge.capacity.toFixed(0)}
              </text>
            </g>
          )
        })}

        {nodes.map((node, index) => {
          const pos = getNodePosition(index, nodes.length)
          return (
            <g key={node.id}>
              <circle
                cx={pos.x}
                cy={pos.y}
                r={20}
                fill={getNodeColor(node)}
                stroke="#333"
                strokeWidth={2}
                opacity={node.active ? 1 : 0.5}
              />
              <text
                x={pos.x}
                y={pos.y - 5}
                fill="white"
                fontSize="12"
                textAnchor="middle"
                fontWeight="bold"
              >
                {node.name}
              </text>
              <text
                x={pos.x}
                y={pos.y + 8}
                fill="white"
                fontSize="8"
                textAnchor="middle"
              >
                {node.load.toFixed(0)}/{node.maxCapacity.toFixed(0)}
              </text>
            </g>
          )
        })}
      </svg>

      <div className="legend">
        <div className="legend-item">
          <div className="legend-color" style={{ backgroundColor: '#4a90e2' }}></div>
          <span>Normal (&lt; 80%)</span>
        </div>
        <div className="legend-item">
          <div className="legend-color" style={{ backgroundColor: '#ffa500' }}></div>
          <span>High Load (80-99%)</span>
        </div>
        <div className="legend-item">
          <div className="legend-color" style={{ backgroundColor: '#ff6b35' }}></div>
          <span>Overloaded (≥100%)</span>
        </div>
        <div className="legend-item">
          <div className="legend-color" style={{ backgroundColor: '#ff4444' }}></div>
          <span>Failed</span>
        </div>
      </div>
    </div>
  )
}

export default GridVisualization
