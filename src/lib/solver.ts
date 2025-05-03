
import { Circuit, Component, Node, Wire } from '@/types/circuit';

export function solveCircuit(circuit: Circuit): Circuit {
  // Create copy of circuit to work with
  const updatedCircuit = structuredClone(circuit);
  
  // Skip if no components
  if (updatedCircuit.components.length === 0) {
    return updatedCircuit;
  }
  
  // Build and solve circuit equations
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

// Enhanced solver that better handles complex circuits
function calculateNodeVoltages(circuit: Circuit): number[] {
  const nodes = circuit.nodes;
  const nodeCount = nodes.length;
  
  if (nodeCount === 0) return [];
  
  // Create voltage array with initial values
  const voltages = new Array(nodeCount).fill(0);
  const conductanceMatrix: number[][] = Array.from({ length: nodeCount }, 
    () => Array(nodeCount).fill(0));
  const currentVector = new Array(nodeCount).fill(0);
  
  // Step 1: Build conductance matrix and current vector based on components
  circuit.components.forEach(component => {
    const pins = component.pins;
    
    switch (component.type) {
      case 'battery': {
        // For voltage sources, we'll apply a simplified version of the Modified Nodal Analysis
        const posPin = pins.find(p => p.id.includes('positive'));
        const negPin = pins.find(p => p.id.includes('negative'));
        
        if (posPin?.nodeId && negPin?.nodeId) {
          const posNodeIndex = nodes.findIndex(n => n.id === posPin.nodeId);
          const negNodeIndex = nodes.findIndex(n => n.id === negPin.nodeId);
          
          if (posNodeIndex >= 0 && negNodeIndex >= 0) {
            const voltage = component.properties.voltage || 5;
            
            // Set up the constraint: V(pos) - V(neg) = voltage
            // For simplicity, we'll just set fixed values rather than fully applying MNA
            voltages[posNodeIndex] = voltage;
            voltages[negNodeIndex] = 0; // Ground reference
            
            // Mark these nodes as having known voltages
            conductanceMatrix[posNodeIndex][posNodeIndex] = 1;
            conductanceMatrix[negNodeIndex][negNodeIndex] = 1;
            currentVector[posNodeIndex] = voltage;
            currentVector[negNodeIndex] = 0;
          }
        }
        break;
      }
      
      case 'resistor': {
        const terminal1 = pins.find(p => p.id.includes('terminal1'));
        const terminal2 = pins.find(p => p.id.includes('terminal2'));
        
        if (terminal1?.nodeId && terminal2?.nodeId) {
          const node1Index = nodes.findIndex(n => n.id === terminal1.nodeId);
          const node2Index = nodes.findIndex(n => n.id === terminal2.nodeId);
          
          if (node1Index >= 0 && node2Index >= 0) {
            const resistance = component.properties.resistance || 1000;
            const conductance = 1 / resistance;
            
            // Add conductance to diagonal elements
            conductanceMatrix[node1Index][node1Index] += conductance;
            conductanceMatrix[node2Index][node2Index] += conductance;
            
            // Add negative conductance to off-diagonal elements
            conductanceMatrix[node1Index][node2Index] -= conductance;
            conductanceMatrix[node2Index][node1Index] -= conductance;
          }
        }
        break;
      }
      
      case 'led': {
        // Model LED as a diode with exponential I-V characteristic
        // For simplicity, we'll use a piecewise linear model here
        const anodePin = pins.find(p => p.id.includes('anode'));
        const cathodePin = pins.find(p => p.id.includes('cathode'));
        
        if (anodePin?.nodeId && cathodePin?.nodeId) {
          const anodeIndex = nodes.findIndex(n => n.id === anodePin.nodeId);
          const cathodeIndex = nodes.findIndex(n => n.id === cathodePin.nodeId);
          
          if (anodeIndex >= 0 && cathodeIndex >= 0) {
            const forwardVoltage = component.properties.forwardVoltage || 1.7;
            // First iteration: treat like resistor with very high resistance when off
            // and low resistance when on
            const highResistance = 1000000; // 1MΩ when off
            const lowResistance = 100;      // 100Ω when on
            const vAnode = voltages[anodeIndex];
            const vCathode = voltages[cathodeIndex];
            const vDiff = vAnode - vCathode;
            
            let effectiveResistance = highResistance;
            if (vDiff > forwardVoltage) {
              effectiveResistance = lowResistance;
            }
            
            const conductance = 1 / effectiveResistance;
            
            conductanceMatrix[anodeIndex][anodeIndex] += conductance;
            conductanceMatrix[cathodeIndex][cathodeIndex] += conductance;
            conductanceMatrix[anodeIndex][cathodeIndex] -= conductance;
            conductanceMatrix[cathodeIndex][anodeIndex] -= conductance;
          }
        }
        break;
      }
      
      case 'switch': {
        const pin1 = pins[0];
        const pin2 = pins[1];
        
        if (pin1?.nodeId && pin2?.nodeId) {
          const node1Index = nodes.findIndex(n => n.id === pin1.nodeId);
          const node2Index = nodes.findIndex(n => n.id === pin2.nodeId);
          
          if (node1Index >= 0 && node2Index >= 0) {
            // Switch behavior depends on its state
            const isClosed = component.properties.closed || false;
            
            if (isClosed) {
              // When closed, model as a low resistance
              const conductance = 1 / 0.1; // 0.1Ω resistance when closed
              
              conductanceMatrix[node1Index][node1Index] += conductance;
              conductanceMatrix[node2Index][node2Index] += conductance;
              conductanceMatrix[node1Index][node2Index] -= conductance;
              conductanceMatrix[node2Index][node1Index] -= conductance;
            }
            // When open, no conductance is added (infinite resistance)
          }
        }
        break;
      }
    }
  });
  
  // Step 2: Solve the system using Gaussian elimination
  solveLinearSystem(conductanceMatrix, currentVector, voltages, nodeCount);
  
  return voltages;
}

// Gaussian elimination solver for the system Ax = b
function solveLinearSystem(A: number[][], b: number[], x: number[], n: number): void {
  // Special case: for very small circuits, just use the existing solution
  if (n <= 2) return;
  
  // Make copies to avoid modifying originals
  const matrix = A.map(row => [...row]);
  const vector = [...b];
  
  // Forward elimination
  for (let i = 0; i < n; i++) {
    // Find pivot (skip if node already has a known voltage)
    if (Math.abs(matrix[i][i]) < 1e-10) {
      // Look for a better pivot
      let maxRow = i;
      let maxVal = Math.abs(matrix[i][i]);
      
      for (let j = i + 1; j < n; j++) {
        if (Math.abs(matrix[j][i]) > maxVal) {
          maxRow = j;
          maxVal = Math.abs(matrix[j][i]);
        }
      }
      
      if (maxVal < 1e-10) {
        // Singular matrix, but let's proceed anyway
        continue;
      }
      
      // Swap rows
      [matrix[i], matrix[maxRow]] = [matrix[maxRow], matrix[i]];
      [vector[i], vector[maxRow]] = [vector[maxRow], vector[i]];
    }
    
    // Eliminate below
    for (let j = i + 1; j < n; j++) {
      if (Math.abs(matrix[j][i]) < 1e-10) continue;
      
      const factor = matrix[j][i] / matrix[i][i];
      vector[j] -= factor * vector[i];
      
      for (let k = i; k < n; k++) {
        matrix[j][k] -= factor * matrix[i][k];
      }
    }
  }
  
  // Back substitution to find voltages
  for (let i = n - 1; i >= 0; i--) {
    let sum = 0;
    for (let j = i + 1; j < n; j++) {
      sum += matrix[i][j] * x[j];
    }
    
    if (Math.abs(matrix[i][i]) > 1e-10) {
      x[i] = (vector[i] - sum) / matrix[i][i];
    }
  }
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
              // Enhanced LED model: improved calculation of brightness based on current
              // I = Is * (exp(Vd/Vt) - 1) where:
              // Is = saturation current, Vt = thermal voltage (~0.026V at room temp)
              const Is = 1e-12; // Typical saturation current
              const Vt = 0.026; // Thermal voltage
              
              // Calculate current (with limiting to avoid overflow)
              const limitedVoltage = Math.min(voltageDrop, forwardVoltage + 1);
              const exponent = Math.min(35, (limitedVoltage - forwardVoltage) / Vt);
              const current = Is * (Math.exp(exponent) - 1);
              
              // Normalize brightness: typical LED is at full brightness around 20mA
              const brightness = Math.min(Math.max(current / 0.02, 0), 1);
              
              return {
                ...component,
                properties: {
                  ...component.properties,
                  current,
                  brightness,
                  // Add temperature increase due to power dissipation
                  temperature: 25 + current * voltageDrop * 100, // Simple thermal model
                  active: true
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
            brightness: 0,
            temperature: 25, // Room temperature
            active: false
          }
        };
      }
      
      case 'resistor': {
        // Calculate current through resistor with more accurate power dissipation
        const pin1 = component.pins[0];
        const pin2 = component.pins[1];
        
        if (pin1.nodeId && pin2.nodeId) {
          const node1 = circuit.nodes.find(n => n.id === pin1.nodeId);
          const node2 = circuit.nodes.find(n => n.id === pin2.nodeId);
          
          if (node1 && node2) {
            const voltageDrop = Math.abs(node1.voltage - node2.voltage);
            const resistance = component.properties.resistance || 1000;
            const current = voltageDrop / resistance;
            const power = voltageDrop * current;
            
            // Add temperature calculation based on power (simplified thermal model)
            // Power in W, temperature rise in °C
            const tempRiseCoefficient = 50; // °C/W for a typical resistor
            const tempRise = power * tempRiseCoefficient;
            const temperature = 25 + tempRise; // 25°C is room temperature
            
            return {
              ...component,
              properties: {
                ...component.properties,
                current,
                power,
                temperature,
                // Direction of current flow (useful for visualization)
                currentDirection: node1.voltage > node2.voltage ? 1 : -1
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
              const voltageDrop = Math.abs(node1.voltage - node2.voltage);
              const switchResistance = 0.1; // Low resistance when closed
              const current = voltageDrop / switchResistance;
              
              // Add power and temperature calculations
              const power = voltageDrop * current;
              const temperature = 25 + power * 10; // Simple thermal model
              
              return {
                ...component,
                properties: {
                  ...component.properties,
                  current,
                  power,
                  temperature
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
            current: 0,
            power: 0,
            temperature: 25 // Room temperature
          }
        };
      }
      
      case 'battery': {
        // Calculate total current drawn from battery
        let totalCurrent = 0;
        const posPin = component.pins.find(p => p.id.includes('positive'));
        const negPin = component.pins.find(p => p.id.includes('negative'));
        
        if (posPin?.nodeId && negPin?.nodeId) {
          // Sum currents from all components connected to battery's positive terminal
          circuit.components.forEach(otherComp => {
            if (otherComp.id !== component.id) {
              otherComp.pins.forEach(pin => {
                if (pin.nodeId === posPin.nodeId) {
                  totalCurrent += otherComp.properties.current || 0;
                }
              });
            }
          });
          
          // Calculate internal power dissipation (P = I²R)
          const internalResistance = component.properties.internalResistance || 0.1;
          const power = totalCurrent * totalCurrent * internalResistance;
          
          return {
            ...component,
            properties: {
              ...component.properties,
              current: totalCurrent,
              power,
              // Add state of charge simulation
              stateOfCharge: Math.max(0, (component.properties.stateOfCharge || 100) - (0.001 * totalCurrent))
            }
          };
        }
        
        return component;
      }
      
      default:
        return component;
    }
  });
}

// Calculate currents in wires with enhanced visualization data
function calculateWireCurrents(circuit: Circuit): Wire[] {
  return circuit.wires.map(wire => {
    const [nodeId1, nodeId2] = wire.nodeIds;
    const node1 = circuit.nodes.find(n => n.id === nodeId1);
    const node2 = circuit.nodes.find(n => n.id === nodeId2);
    
    if (!node1 || !node2) return wire;
    
    // Find components connected to these nodes
    let wireCurrent = 0;
    let voltageGradient: [number, number] = [0, 0];
    
    if (node1 && node2) {
      // Calculate voltage gradient for visualization
      voltageGradient = [node1.voltage, node2.voltage];
      
      // For current calculation, we need to sum all the currents flowing into the wire
      // For each connected component, if it has a calculated current, add it to the wire
      circuit.components.forEach(component => {
        // For each pin connected to one of our wire's nodes
        component.pins.forEach(pin => {
          if (pin.nodeId === nodeId1) {
            // Get the internal component current if available
            const pinCurrent = component.properties.current || 0;
            
            // Determine direction based on component type and pin
            let direction = 1;
            if (component.type === 'battery' && pin.id.includes('positive')) direction = -1;
            if (component.type === 'led' && pin.id.includes('cathode')) direction = -1;
            
            wireCurrent += pinCurrent * direction;
          }
        });
      });
    }
    
    // Calculate power dissipation in wire (P = I²R)
    // Assume a small resistance for the wire
    const wireResistance = 0.01; // 10 mΩ
    const powerDissipation = wireCurrent * wireCurrent * wireResistance;
    
    return {
      ...wire,
      current: wireCurrent,
      // Add additional properties for visualization
      voltageGradient,
      powerDissipation,
      // For current flow animation
      flowDirection: Math.sign(wireCurrent),
      flowSpeed: Math.min(5, Math.abs(wireCurrent) * 0.5) // Cap max speed
    };
  });
}
