
import { Component, Node as CircuitNode, MatrixContribution } from '../types';

/**
 * CircuitBuilder handles the construction of circuit matrices for simulation
 */
export class CircuitBuilder {
  /**
   * Builds the circuit matrices for solving
   */
  buildMatrix(
    components: Component[], 
    nodes: Map<string, CircuitNode>, 
    timeStep: number
  ): MatrixContribution {
    // Create node mapping (excluding ground node)
    const nodeIds = Array.from(nodes.keys());
    if (nodeIds.length === 0) {
      return { conductanceMatrix: [], currentVector: [], nodeMap: {} };
    }
    
    // Choose a ground node (reference)
    const groundNodeId = nodeIds[0];
    const matrixSize = nodeIds.length - 1;
    
    // Create node mapping excluding ground node
    const nodeMap: Record<string, number> = {};
    let idx = 0;
    for (const nodeId of nodeIds) {
      if (nodeId !== groundNodeId) {
        nodeMap[nodeId] = idx++;
      }
    }
    
    // Initialize matrices
    const conductanceMatrix = Array(matrixSize).fill(0).map(() => Array(matrixSize).fill(0));
    const currentVector = Array(matrixSize).fill(0);
    
    // Get contributions from each component
    for (const component of components) {
      const contribution = component.getMatrixContribution(timeStep);
      
      // Apply contribution to our matrices
      for (const [sourceNodeId, sourceIdx] of Object.entries(contribution.nodeMap)) {
        // Skip ground node
        if (sourceNodeId === groundNodeId) continue;
        
        const i = nodeMap[sourceNodeId];
        
        // Add current contributions
        currentVector[i] += contribution.currentVector[Number(sourceIdx)];
        
        for (const [targetNodeId, targetIdx] of Object.entries(contribution.nodeMap)) {
          // Skip ground node
          if (targetNodeId === groundNodeId) continue;
          
          const j = nodeMap[targetNodeId];
          conductanceMatrix[i][j] += contribution.conductanceMatrix[Number(sourceIdx)][Number(targetIdx)];
        }
      }
    }
    
    return { conductanceMatrix, currentVector, nodeMap };
  }
}
