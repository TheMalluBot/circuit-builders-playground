
import { Component, Wire, Node as CircuitNode } from '../types';

/**
 * WireManager handles the management and updating of wires in the circuit
 */
export class WireManager {
  /**
   * Updates currents in all wires based on component currents
   */
  updateWireCurrents(wires: Wire[], components: Component[]): void {
    // Clear previous currents
    for (const wire of wires) {
      wire.current = 0;
    }
    
    // Get current values from components
    for (const component of components) {
      const currents = component.getCurrents();
      
      for (const [pinId, current] of Object.entries(currents)) {
        // Find pin
        const pin = component.pins.find(p => p.id === pinId);
        if (!pin || !pin.nodeId) continue;
        
        // Find wires connected to this pin's node
        for (const wire of wires) {
          if (wire.nodes.includes(pin.nodeId)) {
            // Determine current direction relative to wire direction
            if (wire.nodes[0] === pin.nodeId) {
              wire.current += current; // Flowing away from first node
            } else {
              wire.current -= current; // Flowing into second node
            }
          }
        }
      }
    }
  }

  /**
   * Rebuilds all wires based on node connections
   */
  rebuildWires(nodes: Map<string, CircuitNode>): Wire[] {
    const wires: Wire[] = [];
    const processedConnections = new Set<string>();
    
    // For each node
    for (const [nodeId, node] of nodes.entries()) {
      // For each pair of connections in this node
      for (let i = 0; i < node.connections.length; i++) {
        for (let j = i + 1; j < node.connections.length; j++) {
          const conn1 = node.connections[i];
          const conn2 = node.connections[j];
          
          // Create a unique connection identifier
          const connPair = [
            `${conn1.componentId}-${conn1.pinId}`,
            `${conn2.componentId}-${conn2.pinId}`
          ].sort().join('_');
          
          // Skip if we've already processed this connection
          if (processedConnections.has(connPair)) continue;
          processedConnections.add(connPair);
          
          // Create a wire between these two pins
          wires.push({
            id: `wire_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
            nodes: [nodeId, nodeId], // Same node for both ends
            current: 0
          });
        }
      }
    }
    
    return wires;
  }
}
