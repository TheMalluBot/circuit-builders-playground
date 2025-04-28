
/**
 * Format resistance value with appropriate units
 */
export const formatResistance = (ohms: number): string => {
  if (ohms >= 1000000) {
    return `${(ohms / 1000000).toFixed(1)}MΩ`;
  } else if (ohms >= 1000) {
    return `${(ohms / 1000).toFixed(1)}kΩ`;
  } else {
    return `${ohms.toFixed(0)}Ω`;
  }
};

/**
 * Format current value with appropriate units
 */
export const formatCurrent = (amps: number): string => {
  const current = Math.abs(amps);
  if (current < 0.001) {
    return `${(current * 1000000).toFixed(1)}μA`;
  } else if (current < 1) {
    return `${(current * 1000).toFixed(1)}mA`;
  } else {
    return `${current.toFixed(2)}A`;
  }
};

/**
 * Format voltage value with appropriate units
 */
export const formatVoltage = (volts: number): string => {
  if (Math.abs(volts) < 0.1) {
    return `${(volts * 1000).toFixed(1)}mV`;
  } else {
    return `${volts.toFixed(2)}V`;
  }
};
