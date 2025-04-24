
import React, { useState, useEffect } from 'react';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger
} from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Zap, CircuitBoard, Battery } from 'lucide-react';

interface OhmsLawCalculatorProps {
  onCalculate?: (values: {voltage: number, current: number, resistance: number}) => void;
}

const OhmsLawCalculator: React.FC<OhmsLawCalculatorProps> = ({ onCalculate }) => {
  const [mode, setMode] = useState<'voltage' | 'current' | 'resistance'>('voltage');
  const [voltage, setVoltage] = useState<string>('');
  const [current, setCurrent] = useState<string>('');
  const [resistance, setResistance] = useState<string>('');
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Reset fields when mode changes
    setResult(null);
    setError(null);
  }, [mode]);

  const parseInput = (value: string): number | null => {
    if (value.trim() === '') return null;
    
    const parsedValue = parseFloat(value);
    if (isNaN(parsedValue) || parsedValue <= 0) return null;
    
    return parsedValue;
  };

  const calculate = () => {
    setError(null);
    
    const v = parseInput(voltage);
    const i = parseInput(current);
    const r = parseInput(resistance);
    
    try {
      switch (mode) {
        case 'voltage':
          if (i === null || r === null) {
            setError("Please enter valid current and resistance values");
            return;
          }
          const calculatedV = i * r;
          setResult(`${calculatedV.toFixed(2)} volts`);
          if (onCalculate) onCalculate({ voltage: calculatedV, current: i, resistance: r });
          break;
          
        case 'current':
          if (v === null || r === null) {
            setError("Please enter valid voltage and resistance values");
            return;
          }
          if (r === 0) {
            setError("Resistance cannot be zero (would cause infinite current)");
            return;
          }
          const calculatedI = v / r;
          setResult(`${calculatedI.toFixed(3)} amps`);
          if (onCalculate) onCalculate({ voltage: v, current: calculatedI, resistance: r });
          break;
          
        case 'resistance':
          if (v === null || i === null) {
            setError("Please enter valid voltage and current values");
            return;
          }
          if (i === 0) {
            setError("Current cannot be zero (would result in infinite resistance)");
            return;
          }
          const calculatedR = v / i;
          setResult(`${calculatedR.toFixed(2)} ohms`);
          if (onCalculate) onCalculate({ voltage: v, current: i, resistance: calculatedR });
          break;
      }
    } catch (e) {
      setError("Calculation error. Please check your inputs.");
    }
  };

  const renderInputs = () => {
    return (
      <div className="space-y-4 mt-4">
        {mode !== 'voltage' && (
          <div>
            <Label htmlFor="voltage" className="flex items-center gap-1">
              <Zap className="w-4 h-4" />
              Voltage (V)
            </Label>
            <Input
              id="voltage"
              type="number"
              min="0"
              step="0.1"
              placeholder="Enter voltage in volts"
              value={voltage}
              onChange={(e) => setVoltage(e.target.value)}
              className="mt-1"
            />
          </div>
        )}
        
        {mode !== 'current' && (
          <div>
            <Label htmlFor="current" className="flex items-center gap-1">
              <Battery className="w-4 h-4" />
              Current (I)
            </Label>
            <Input
              id="current"
              type="number"
              min="0"
              step="0.001"
              placeholder="Enter current in amps"
              value={current}
              onChange={(e) => setCurrent(e.target.value)}
              className="mt-1"
            />
          </div>
        )}
        
        {mode !== 'resistance' && (
          <div>
            <Label htmlFor="resistance" className="flex items-center gap-1">
              <CircuitBoard className="w-4 h-4" />
              Resistance (Ω)
            </Label>
            <Input
              id="resistance"
              type="number"
              min="0"
              step="1"
              placeholder="Enter resistance in ohms"
              value={resistance}
              onChange={(e) => setResistance(e.target.value)}
              className="mt-1"
            />
          </div>
        )}
        
        <Button onClick={calculate} className="w-full">Calculate</Button>
        
        {error && (
          <div className="text-sm text-red-600 p-2 bg-red-50 rounded-md">
            {error}
          </div>
        )}
        
        {result && !error && (
          <div className="p-3 bg-green-50 border border-green-100 rounded-md">
            <p className="text-sm font-medium">Result:</p>
            <p className="text-lg font-bold">{result}</p>
            
            <div className="text-xs text-muted-foreground mt-2 border-t border-green-100 pt-2">
              <p>Formula: {getFormula()}</p>
            </div>
          </div>
        )}
      </div>
    );
  };
  
  const getFormula = () => {
    switch (mode) {
      case 'voltage':
        return 'V = I × R';
      case 'current':
        return 'I = V ÷ R';
      case 'resistance':
        return 'R = V ÷ I';
    }
  };

  return (
    <div className="border rounded-lg overflow-hidden bg-white">
      <div className="p-4 border-b bg-slate-50">
        <h3 className="font-medium">Ohm's Law Calculator</h3>
        <p className="text-sm text-muted-foreground">Calculate voltage, current, or resistance</p>
      </div>
      
      <div className="p-4">
        <Tabs defaultValue="voltage" onValueChange={(v) => setMode(v as any)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="voltage" className="text-xs">
              <Zap className="w-4 h-4 mr-1" />
              Find Voltage
            </TabsTrigger>
            <TabsTrigger value="current" className="text-xs">
              <Battery className="w-4 h-4 mr-1" />
              Find Current
            </TabsTrigger>
            <TabsTrigger value="resistance" className="text-xs">
              <CircuitBoard className="w-4 h-4 mr-1" />
              Find Resistance
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="voltage">
            <div className="p-2 bg-blue-50 rounded-md mb-4">
              <p className="text-sm">V = I × R</p>
              <p className="text-xs text-muted-foreground mt-1">
                Calculate voltage when you know current and resistance
              </p>
            </div>
            {renderInputs()}
          </TabsContent>
          
          <TabsContent value="current">
            <div className="p-2 bg-blue-50 rounded-md mb-4">
              <p className="text-sm">I = V ÷ R</p>
              <p className="text-xs text-muted-foreground mt-1">
                Calculate current when you know voltage and resistance
              </p>
            </div>
            {renderInputs()}
          </TabsContent>
          
          <TabsContent value="resistance">
            <div className="p-2 bg-blue-50 rounded-md mb-4">
              <p className="text-sm">R = V ÷ I</p>
              <p className="text-xs text-muted-foreground mt-1">
                Calculate resistance when you know voltage and current
              </p>
            </div>
            {renderInputs()}
          </TabsContent>
        </Tabs>
      </div>
      
      <div className="bg-slate-50 p-3 border-t text-xs text-muted-foreground">
        <p>V = Voltage in volts (V)</p>
        <p>I = Current in amperes (A)</p>
        <p>R = Resistance in ohms (Ω)</p>
      </div>
    </div>
  );
};

export default OhmsLawCalculator;
