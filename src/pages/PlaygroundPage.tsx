
import React from 'react';
import { CircuitSimulator } from '@/components/circuit/CircuitSimulator';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { BrowserRouter } from 'react-router-dom';

const PlaygroundPage = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navigation />
      
      <main className="flex-1 py-6">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold mb-2">Circuit Playground</h1>
          <p className="text-gray-600 mb-6">
            Build and simulate electronic circuits. Select components from the palette,
            place them on the canvas, and connect them to create working circuits.
          </p>
          
          <div className="border border-gray-200 rounded-lg overflow-hidden h-[600px] mb-6">
            <CircuitSimulator />
          </div>
          
          <div className="bg-blue-50 p-4 rounded-lg mb-6">
            <h2 className="text-lg font-semibold mb-2">How to use:</h2>
            <ol className="list-decimal ml-5 space-y-1">
              <li>Select a component from the palette above or drag it onto the canvas</li>
              <li>Click on component pins to create smart-routed connections between components</li>
              <li>Press <kbd className="px-2 py-1 bg-gray-100 border rounded">R</kbd> when hovering over a component to rotate it</li>
              <li>Click on wires to modify their routing</li>
              <li>Use the simulation controls to run your circuit and see it in action</li>
              <li>Toggle switches on/off to control the flow of current in your circuit</li>
            </ol>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-4 rounded shadow">
              <h3 className="font-medium mb-2">Battery</h3>
              <p className="text-sm text-gray-600">Provides voltage to your circuit. The default is 5V.</p>
            </div>
            <div className="bg-white p-4 rounded shadow">
              <h3 className="font-medium mb-2">Resistor</h3>
              <p className="text-sm text-gray-600">Limits current flow. The default resistance is 1kΩ.</p>
            </div>
            <div className="bg-white p-4 rounded shadow">
              <h3 className="font-medium mb-2">LED</h3>
              <p className="text-sm text-gray-600">Light-emitting diode. It will light up when current flows through it.</p>
            </div>
          </div>
        </div>
      </main>
      
      {/* Properly wrap Footer in its own Router when used outside of App-level router */}
      <BrowserRouter>
        <Footer />
      </BrowserRouter>
    </div>
  );
}

export default PlaygroundPage;
