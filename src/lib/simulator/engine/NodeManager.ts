
import { Node, Connection, Pin, Component, Wire } from '../types';

/**
 * NodeManager handles the management of circuit nodes and their connections
 */
export class NodeManager {
  /**
   * Connects a pin to a specific node
   */
  connectPinToNode(
    pin: Pin, 
    nodeId: string, 
    nodes: Map<string, Node>, 
    disconnectFn: () => void
  ): void {
    // Disconnect pin from any existing node
    if (pin.nodeId) {
      disconnectFn();
    }
    
    // Connect to new node
    const node = nodes.get(nodeId);
    if (!node) return;
    
    node.connections.push({
      nodeId: nodeId,
      componentId: pin.componentId,
      pinId: pin.id
    });
    
    pin.nodeId = nodeId;
  }

  /**
   * Merges two nodes into one
   */
  mergeNodes(
    nodeId1: string, 
    nodeId2: string, 
    nodes: Map<string, Node>, 
    components: Component[], 
    wires: Wire[]
  ): void {
    const node1 = nodes.get(nodeId1);
    const node2 = nodes.get(nodeId2);
    
    if (!node1 || !node2 || nodeId1 === nodeId2) return;
    
    // Move all connections from node2 to node1
    for (const connection of node2.connections) {
      // Find the component and pin
      const component = components.find(c => c.id === connection.componentId);
      if (!component) continue;
      
      const pin = component.pins.find(p => p.id === connection.pinId);
      if (!pin) continue;
      
      // Update pin to point to node1
      pin.nodeId = node1.id;
      
      // Add connection to node1
      node1.connections.push({
        nodeId: node1.id,
        componentId: connection.componentId,
        pinId: connection.pinId
      });
    }
    
    // Update wires
    for (const wire of wires) {
      if (wire.nodes[0] === nodeId2) {
        wire.nodes[0] = nodeId1;
      }
      if (wire.nodes[1] === nodeId2) {
        wire.nodes[1] = nodeId1;
      }
    }
    
    // Delete node2
    nodes.delete(nodeId2);
  }
}
