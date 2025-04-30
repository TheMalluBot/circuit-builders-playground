
/**
 * CircuitSolver handles the mathematical solution of circuit equations
 */
export class CircuitSolver {
  /**
   * Solves a system of linear equations using Gaussian elimination
   */
  solveMatrix(conductanceMatrix: number[][], currentVector: number[]): number[] {
    // For small matrices, use direct Gaussian elimination
    return this.gaussianElimination(conductanceMatrix, currentVector);
  }
  
  /**
   * Gaussian elimination algorithm for solving linear systems
   */
  private gaussianElimination(A: number[][], b: number[]): number[] {
    const n = A.length;
    if (n === 0) return [];
    
    // Create augmented matrix
    const augMatrix = A.map((row, i) => [...row, b[i]]);
    
    // Gaussian elimination
    for (let i = 0; i < n; i++) {
      // Find pivot
      let maxRow = i;
      for (let j = i + 1; j < n; j++) {
        if (Math.abs(augMatrix[j][i]) > Math.abs(augMatrix[maxRow][i])) {
          maxRow = j;
        }
      }
      
      // Swap rows
      if (maxRow !== i) {
        [augMatrix[i], augMatrix[maxRow]] = [augMatrix[maxRow], augMatrix[i]];
      }
      
      // Check for singular matrix
      if (Math.abs(augMatrix[i][i]) < 1e-10) {
        // Handle singular matrix (add small conductance to diagonal)
        augMatrix[i][i] += 1e-9;
      }
      
      // Eliminate below
      for (let j = i + 1; j < n; j++) {
        const factor = augMatrix[j][i] / augMatrix[i][i];
        for (let k = i; k <= n; k++) {
          augMatrix[j][k] -= factor * augMatrix[i][k];
        }
      }
    }
    
    // Back substitution
    const x = new Array(n).fill(0);
    for (let i = n - 1; i >= 0; i--) {
      let sum = 0;
      for (let j = i + 1; j < n; j++) {
        sum += augMatrix[i][j] * x[j];
      }
      x[i] = (augMatrix[i][n] - sum) / augMatrix[i][i];
    }
    
    return x;
  }
}
