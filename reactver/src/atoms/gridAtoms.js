import { atom } from 'jotai'

export const nodesAtom = atom([])

export const edgesAtom = atom([])

export const simulationResultsAtom = atom(null)

export const overloadedComponentsAtom = atom({ nodes: [], edges: [] })

export const gridConnectedAtom = atom((get) => {
  const nodes = get(nodesAtom)
  const edges = get(edgesAtom)
  
  if (nodes.length === 0) return true
  
  const activeNodes = nodes.filter(node => node.active)
  const activeEdges = edges.filter(edge => edge.active)
  
  if (activeNodes.length <= 1) return true
  
  const graph = new Map()
  activeNodes.forEach(node => graph.set(node.id, []))
  
  activeEdges.forEach(edge => {
    if (graph.has(edge.from) && graph.has(edge.to)) {
      graph.get(edge.from).push(edge.to)
      graph.get(edge.to).push(edge.from)
    }
  })
  
  const visited = new Set()
  const start = activeNodes[0].id
  const stack = [start]
  
  while (stack.length > 0) {
    const node = stack.pop()
    if (!visited.has(node)) {
      visited.add(node)
      const neighbors = graph.get(node) || []
      neighbors.forEach(neighbor => {
        if (!visited.has(neighbor)) {
          stack.push(neighbor)
        }
      })
    }
  }
  
  return visited.size === activeNodes.length
})

export const presetGridsAtom = atom([
  {
    name: "Simple 4-Node Grid",
    nodes: [
      { id: 0, name: "A", load: 50, maxCapacity: 100, active: true },
      { id: 1, name: "B", load: 75, maxCapacity: 120, active: true },
      { id: 2, name: "C", load: 60, maxCapacity: 110, active: true },
      { id: 3, name: "D", load: 40, maxCapacity: 90, active: true }
    ],
    edges: [
      { id: 0, from: 0, to: 1, currentLoad: 30, capacity: 80, active: true },
      { id: 1, from: 1, to: 2, currentLoad: 45, capacity: 100, active: true },
      { id: 2, from: 2, to: 3, currentLoad: 25, capacity: 70, active: true },
      { id: 3, from: 0, to: 3, currentLoad: 35, capacity: 90, active: true }
    ]
  },
  {
    name: "High Load Grid",
    nodes: [
      { id: 0, name: "Gen1", load: 95, maxCapacity: 100, active: true },
      { id: 1, name: "Sub1", load: 110, maxCapacity: 120, active: true },
      { id: 2, name: "Sub2", load: 85, maxCapacity: 90, active: true },
      { id: 3, name: "Load1", load: 70, maxCapacity: 80, active: true }
    ],
    edges: [
      { id: 0, from: 0, to: 1, currentLoad: 75, capacity: 80, active: true },
      { id: 1, from: 1, to: 2, currentLoad: 85, capacity: 90, active: true },
      { id: 2, from: 2, to: 3, currentLoad: 70, capacity: 75, active: true }
    ]
  },
  {
    name: "Ring Network",
    nodes: [
      { id: 0, name: "North", load: 60, maxCapacity: 100, active: true },
      { id: 1, name: "East", load: 70, maxCapacity: 110, active: true },
      { id: 2, name: "South", load: 55, maxCapacity: 95, active: true },
      { id: 3, name: "West", load: 65, maxCapacity: 105, active: true },
      { id: 4, name: "Center", load: 80, maxCapacity: 120, active: true }
    ],
    edges: [
      { id: 0, from: 0, to: 1, currentLoad: 40, capacity: 80, active: true },
      { id: 1, from: 1, to: 2, currentLoad: 35, capacity: 75, active: true },
      { id: 2, from: 2, to: 3, currentLoad: 30, capacity: 70, active: true },
      { id: 3, from: 3, to: 0, currentLoad: 45, capacity: 85, active: true },
      { id: 4, from: 4, to: 0, currentLoad: 25, capacity: 60, active: true },
      { id: 5, from: 4, to: 1, currentLoad: 30, capacity: 65, active: true },
      { id: 6, from: 4, to: 2, currentLoad: 35, capacity: 70, active: true },
      { id: 7, from: 4, to: 3, currentLoad: 40, capacity: 75, active: true }
    ]
  }
])
