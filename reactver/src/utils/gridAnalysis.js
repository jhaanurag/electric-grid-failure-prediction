export const checkOverloads = (nodes, edges) => {
  const overloadedNodes = nodes.filter(node => 
    node.active && node.load >= node.maxCapacity
  )
  
  const overloadedEdges = edges.filter(edge => 
    edge.active && edge.currentLoad >= edge.capacity
  )
  
  return { nodes: overloadedNodes, edges: overloadedEdges }
}

export const findConnectedComponents = (nodes, edges) => {
  const activeNodes = nodes.filter(node => node.active)
  const activeEdges = edges.filter(edge => edge.active)
  
  if (activeNodes.length === 0) return []
  
  const graph = new Map()
  activeNodes.forEach(node => graph.set(node.id, []))
  
  activeEdges.forEach(edge => {
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
      
      components.push(component)
    }
  })
  
  return components
}

export const redistributeLoad = (nodes, edges, failedEdge) => {
  const { from, to, currentLoad: failedLoad } = failedEdge
  
  const newEdges = [...edges]
  
  ;[from, to].forEach(nodeId => {
    const nodeEdges = newEdges.filter(edge => 
      edge.active && 
      (edge.from === nodeId || edge.to === nodeId) && 
      edge.id !== failedEdge.id &&
      edge.currentLoad < edge.capacity
    )
    
    const totalAvailableCapacity = nodeEdges.reduce((sum, edge) => 
      sum + (edge.capacity - edge.currentLoad), 0
    )
    
    if (totalAvailableCapacity > 0) {
      const redistributionRatio = Math.min(1, failedLoad / totalAvailableCapacity)
      
      nodeEdges.forEach(edge => {
        const availableCapacity = edge.capacity - edge.currentLoad
        const additionalLoad = redistributionRatio * availableCapacity
        edge.currentLoad += additionalLoad
      })
    }
  })
  
  return newEdges
}

export const simulateCascadingFailures = (nodes, edges, loadIncreasePercent, randomLoad = false) => {
  let currentNodes = nodes.map(node => ({ ...node }))
  let currentEdges = edges.map(edge => ({ ...edge }))
  const failureLog = []
  
  const loadFactor = 1 + (loadIncreasePercent / 100)
  
  currentNodes.forEach(node => {
    if (node.active) {
      const randomFactor = randomLoad ? 0.5 + Math.random() : 1
      node.load *= loadFactor * randomFactor
    }
  })
  
  currentEdges.forEach(edge => {
    if (edge.active) {
      const randomFactor = randomLoad ? 0.5 + Math.random() : 1
      edge.currentLoad *= loadFactor * randomFactor
    }
  })
  
  let iterationCount = 0
  const maxIterations = 20
  
  while (iterationCount < maxIterations) {
    iterationCount++
    const overloads = checkOverloads(currentNodes, currentEdges)
    
    if (overloads.nodes.length === 0 && overloads.edges.length === 0) {
      break
    }
    
    const allFailures = [
      ...overloads.nodes.map(node => ({ type: 'node', component: node, severity: node.load / node.maxCapacity })),
      ...overloads.edges.map(edge => ({ type: 'edge', component: edge, severity: edge.currentLoad / edge.capacity }))
    ]
    
    allFailures.sort((a, b) => b.severity - a.severity)
    
    if (allFailures.length === 0) break
    
    const failure = allFailures[0]
    
    if (failure.type === 'node') {
      const nodeIndex = currentNodes.findIndex(n => n.id === failure.component.id)
      if (nodeIndex !== -1) {
        currentNodes[nodeIndex].active = false
        failureLog.push({
          type: 'node',
          name: failure.component.name,
          load: failure.component.load,
          capacity: failure.component.maxCapacity,
          severity: failure.severity
        })
      }
    } else {
      const edgeIndex = currentEdges.findIndex(e => e.id === failure.component.id)
      if (edgeIndex !== -1) {
        currentEdges[edgeIndex].active = false
        failureLog.push({
          type: 'edge',
          from: currentNodes.find(n => n.id === failure.component.from)?.name || 'Unknown',
          to: currentNodes.find(n => n.id === failure.component.to)?.name || 'Unknown',
          load: failure.component.currentLoad,
          capacity: failure.component.capacity,
          severity: failure.severity
        })
        
        currentEdges = redistributeLoad(currentNodes, currentEdges, failure.component)
      }
    }
  }
  
  const components = findConnectedComponents(currentNodes, currentEdges)
  const activeNodes = currentNodes.filter(node => node.active).length
  const activeEdges = currentEdges.filter(edge => edge.active).length
  
  return {
    nodes: currentNodes,
    edges: currentEdges,
    failureLog,
    components,
    activeNodes,
    activeEdges,
    iterations: iterationCount,
    connected: components.length <= 1
  }
}

export const identifyCriticalComponents = (nodes, edges) => {
  const criticalNodes = []
  const criticalEdges = []
  
  nodes.forEach(node => {
    if (!node.active) return
    
    const testNodes = nodes.map(n => ({ ...n }))
    const nodeIndex = testNodes.findIndex(n => n.id === node.id)
    testNodes[nodeIndex].active = false
    
    const components = findConnectedComponents(testNodes, edges)
    if (components.length > 1) {
      criticalNodes.push(node)
    }
  })
  
  edges.forEach(edge => {
    if (!edge.active) return
    
    const testEdges = edges.map(e => ({ ...e }))
    const edgeIndex = testEdges.findIndex(e => e.id === edge.id)
    testEdges[edgeIndex].active = false
    
    const components = findConnectedComponents(nodes, testEdges)
    const redistributedEdges = redistributeLoad(nodes, testEdges, edge)
    const overloads = checkOverloads(nodes, redistributedEdges)
    
    if (components.length > 1 || overloads.nodes.length > 0 || overloads.edges.length > 0) {
      criticalEdges.push(edge)
    }
  })
  
  return { nodes: criticalNodes, edges: criticalEdges }
}
