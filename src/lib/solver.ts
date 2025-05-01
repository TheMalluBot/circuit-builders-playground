
import { Circuit, Component } from '@/types/circuit';

export function solveCircuit(circuit: Circuit): Circuit {
  // Create copy of circuit to work with
  const updatedCircuit = structuredClone(circuit);
  
  // Skip if no components
  if (updatedCircuit.components.length === 0) {
    return updatedCircuit;
  }
  
  // Build and solve circuit equations (simplified version)
  const nodeVoltages = calculateNodeVoltages(updatedCircuit);
  
  // Update node voltages
  updatedCircuit.nodes = updatedCircuit.nodes.map((node, index) => ({
    ...node,
    voltage: nodeVoltages[index] ?? 0
  }));
  
  // Update component states based on node voltages
  updatedCircuit.components = updateComponentStates(updatedCircuit);
  
  // Calculate wire currents
  updatedCircuit.wires = calculateWireCurrents(updatedCircuit);
  
  return updatedCircuit;
}

// Simplified solver that uses a basic approach for demo purposes
function calculateNodeVoltages(circuit: Circuit): number[] {
  const nodes = circuit.nodes;
  const nodeCount = nodes.length;
  
  if (nodeCount === 0) return [];
  
  // Create voltage array with initial values
  const voltages = new Array(nodeCount).fill(0);
  
  // For simple demo purposes, we'll use a very simplified approach
  // Find battery components and set connected node voltages directly
  const batteries = circuit.components.filter(c => c.type === 'battery');
  
  batteries.forEach(battery => {
    const posPin = battery.pins.find(p => p.id.includes('positive'));
    const negPin = battery.pins.find(p => p.id.includes('negative'));
    
    if (posPin?.nodeId && negPin?.nodeId) {
      const posNodeIndex = nodes.findIndex(n => n.id === posPin.nodeId);
      const negNodeIndex = nodes.findIndex(n => n.id === negPin.nodeId);
      
      if (posNodeIndex >= 0 && negNodeIndex >= 0) {
        voltages[posNodeIndex] = battery.properties.voltage || 5;
        voltages[negNodeIndex] = 0; // Ground reference
      }
    }
  });
  
  // For a simple LED + resistor circuit, approximate the voltage division
  // This is very simplified - a real solver would use matrix methods
  circuit.components.forEach(component => {
    if (component.type === 'resistor') {
      // Find connected nodes
      const node1Index = nodes.findIndex(n => n.id === component.pins[0].nodeId);
      const node2Index = nodes.findIndex(n => n.id === component.pins[1].nodeId);
      
      // If one node has voltage and the other doesn't, compute simple division
      if (node1Index >= 0 && node2Index >= 0) {
        if (voltages[node1Index] > 0 && voltages[node2Index] === 0) {
          // Find if an LED is connected to node2
          const connectedLED = findConnectedLED(circuit, nodes[node2Index].id);
          
          if (connectedLED) {
            // Simple voltage division, accounting for LED forward voltage
            const totalVoltage = voltages[node1Index];
            const forwardVoltage = connectedLED.properties.forwardVoltage || 1.7;
            
            // Set node2 voltage to account for LED voltage drop
            if (totalVoltage > forwardVoltage) {
              voltages[node2Index] = forwardVoltage;
            }
          }
        }
      }
    }
  });
  
  return voltages;
}

// Find an LED connected to a specific node
function findConnectedLED(circuit: Circuit, nodeId: string): Component | null {
  return circuit.components.find(component => {
    if (component.type === 'led') {
      return component.pins.some(pin => pin.nodeId === nodeId);
    }
    return false;
  }) || null;
}

// Update component states based on node voltages
function updateComponentStates(circuit: Circuit): Component[] {
  return circuit.components.map(component => {
    switch (component.type) {
      case 'led': {
        // Get node voltages for anode and cathode
        const anodePin = component.pins.find(p => p.id.includes('anode'));
        const cathodePin = component.pins.find(p => p.id.includes('cathode'));
        
        if (anodePin?.nodeId && cathodePin?.nodeId) {
          const anodeNode = circuit.nodes.find(n => n.id === anodePin.nodeId);
          const cathodeNode = circuit.nodes.find(n => n.id === cathodePin.nodeId);
          
          if (anodeNode && cathodeNode) {
            const voltageDrop = anodeNode.voltage - cathodeNode.voltage;
            const forwardVoltage = component.properties.forwardVoltage || 1.7;
            
            if (voltageDrop >= forwardVoltage) {
              // LED is on - calculate brightness based on current
              const current = (voltageDrop - forwardVoltage) / 100; // Simplified
              const brightness = Math.min(current / 0.02, 1); // Normalize to 20mA
              
              return {
                ...component,
                properties: {
                  ...component.properties,
                  current,
                  brightness
                }
              };
            }
          }
        }
        
        // LED is off
        return {
          ...component,
          properties: {
            ...component.properties,
            current: 0,
            brightness: 0
          }
        };
      }
      
      case 'resistor': {
        // Calculate current through resistor
        const pin1 = component.pins[0];
        const pin2 = component.pins[1];
        
        if (pin1.nodeId && pin2.nodeId) {
          const node1 = circuit.nodes.find(n => n.id === pin1.nodeId);
          const node2 = circuit.nodes.find(n => n.id === pin2.nodeId);
          
          if (node1 && node2) {
            const voltageDrop = node1.voltage - node2.voltage;
            const resistance = component.properties.resistance || 1000;
            const current = voltageDrop / resistance;
            const power = voltageDrop * current;
            
            return {
              ...component,
              properties: {
                ...component.properties,
                current,
                power
              }
            };
          }
        }
        
        return component;
      }
      
      case 'switch': {
        // Calculate current through switch if closed
        if (component.properties.closed) {
          const pin1 = component.pins[0];
          const pin2 = component.pins[1];
          
          if (pin1.nodeId && pin2.nodeId) {
            const node1 = circuit.nodes.find(n => n.id === pin1.nodeId);
            const node2 = circuit.nodes.find(n => n.id === pin2.nodeId);
            
            if (node1 && node2) {
              const voltageDrop = node1.voltage - node2.voltage;
              const current = voltageDrop / 0.1; // Low resistance when closed
              
              return {
                ...component,
                properties: {
                  ...component.properties,
                  current
                }
              };
            }
          }
        }
        
        // Switch is open or not connected
        return {
          ...component,
          properties: {
            ...component.properties,
            current: 0
          }
        };
      }
      
      default:
        return component;
    }
  });
}

// Calculate currents in wires based on component currents
function calculateWireCurrents(circuit: Circuit): typeof circuit.wires {
  return circuit.wires.map(wire => {
    // Find components connected to the wire's nodes
    let wireCurrent = 0;
    
    circuit.components.forEach(component => {
      component.pins.forEach(pin => {
        if (pin.nodeId === wire.nodeIds[0]) {
          // Current flowing out of the first node
          const pinCurrent = component.properties.current || 0;
          wireCurrent += pinCurrent;
        } else if (pin.nodeId === wire.nodeIds[1]) {
          // Current flowing into the second node
          const pinCurrent = component.properties.current || 0;
          wireCurrent -= pinCurrent;
        }
      });
    });
    
    return {
      ...wire,
      current: wireCurrent
    };
  });
}
