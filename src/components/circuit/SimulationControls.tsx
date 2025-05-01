
import React from 'react';
import { Play, Pause, RefreshCw } from 'lucide-react';

interface SimulationControlsProps {
  isRunning: boolean;
  onStart: () => void;
  onStop: () => void;
  onReset: () => void;
  showVoltages: boolean;
  onToggleVoltages: () => void;
  showCurrents: boolean;
  onToggleCurrents: () => void;
}

export function SimulationControls({
  isRunning,
  onStart,
  onStop,
  onReset,
  showVoltages,
  onToggleVoltages,
  showCurrents,
  onToggleCurrents
}: SimulationControlsProps) {
  return (
    <div className="flex items-center justify-between gap-4 p-3 bg-gray-100 border-t border-gray-200">
      <div className="flex gap-2">
        {!isRunning ? (
          <button
            onClick={onStart}
            className="flex items-center gap-1 px-3 py-1.5 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
            aria-label="Start simulation"
          >
            <Play className="h-4 w-4" />
            <span>Start</span>
          </button>
        ) : (
          <button
            onClick={onStop}
            className="flex items-center gap-1 px-3 py-1.5 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
            aria-label="Stop simulation"
          >
            <Pause className="h-4 w-4" />
            <span>Stop</span>
          </button>
        )}
        <button
          onClick={onReset}
          className="flex items-center gap-1 px-3 py-1.5 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
          aria-label="Reset simulation"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Reset</span>
        </button>
      </div>
      
      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={showVoltages}
            onChange={onToggleVoltages}
            className="w-4 h-4"
          />
          <span className="text-sm">Show Voltages</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={showCurrents}
            onChange={onToggleCurrents}
            className="w-4 h-4"
          />
          <span className="text-sm">Show Currents</span>
        </label>
      </div>
    </div>
  );
}
