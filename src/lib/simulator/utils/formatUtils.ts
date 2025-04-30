
/**
 * Format resistance value with appropriate units
 */
export const formatResistance = (ohms: number): string => {
  if (isNaN(ohms)) return "0Ω";
  
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
  if (isNaN(amps)) return "0A";
  
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
  if (isNaN(volts)) return "0V";
  
  if (Math.abs(volts) < 0.1) {
    return `${(volts * 1000).toFixed(1)}mV`;
  } else {
    return `${volts.toFixed(2)}V`;
  }
};

/**
 * Format power value with appropriate units
 */
export const formatPower = (watts: number): string => {
  if (isNaN(watts)) return "0W";
  
  const power = Math.abs(watts);
  if (power < 0.001) {
    return `${(power * 1000000).toFixed(1)}μW`;
  } else if (power < 1) {
    return `${(power * 1000).toFixed(1)}mW`;
  } else {
    return `${power.toFixed(2)}W`;
  }
};

/**
 * Format a numeric value with an appropriate SI prefix
 */
export const formatSI = (value: number, baseUnit: string): string => {
  if (isNaN(value)) return `0${baseUnit}`;
  
  const absValue = Math.abs(value);
  
  if (absValue >= 1e9) {
    return `${(value / 1e9).toFixed(2)}G${baseUnit}`;
  } else if (absValue >= 1e6) {
    return `${(value / 1e6).toFixed(2)}M${baseUnit}`;
  } else if (absValue >= 1e3) {
    return `${(value / 1e3).toFixed(2)}k${baseUnit}`;
  } else if (absValue < 1e-9) {
    return `${(value * 1e12).toFixed(2)}p${baseUnit}`;
  } else if (absValue < 1e-6) {
    return `${(value * 1e9).toFixed(2)}n${baseUnit}`;
  } else if (absValue < 1e-3) {
    return `${(value * 1e6).toFixed(2)}μ${baseUnit}`;
  } else if (absValue < 1) {
    return `${(value * 1e3).toFixed(2)}m${baseUnit}`;
  } else {
    return `${value.toFixed(2)}${baseUnit}`;
  }
};
