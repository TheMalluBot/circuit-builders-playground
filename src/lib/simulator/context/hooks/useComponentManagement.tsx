
import { useState, useCallback } from 'react';
import { Component } from '../../types';
import { ComponentFactory } from '../../ComponentFactory';

export const useComponentManagement = (engine: any, updateSimulationState: () => void) => {
  const [selectedComponent, setSelectedComponent] = useState<Component | null>(null);

  const addComponent = useCallback((type: string, position: { x: number; y: number }, properties: Record<string, any> = {}) => {
    if (!engine) return;
    
    const canonicalType = ComponentFactory.getCanonicalTypeName(type);
    
    const id = `comp_${canonicalType}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    
    console.log(`Adding component: ${canonicalType} at position (${position.x}, ${position.y})`);
    
    const component = ComponentFactory.createComponent(canonicalType, id, position, properties);
    
    if (component) {
      engine.addComponent(component);
      updateSimulationState();
      
      setSelectedComponent(component);
    } else {
      console.error(`Failed to create component of type ${canonicalType}`);
    }
  }, [engine, updateSimulationState]);
  
  const removeComponent = useCallback((componentId: string) => {
    if (!engine) return;
    
    engine.removeComponent(componentId);
    updateSimulationState();
    
    if (selectedComponent && selectedComponent.id === componentId) {
      setSelectedComponent(null);
    }
  }, [engine, selectedComponent, updateSimulationState]);
  
  const selectComponent = useCallback((componentId: string | null) => {
    if (!engine) return;
    
    if (componentId === null) {
      setSelectedComponent(null);
      return;
    }
    
    const component = engine.getComponents().find((c: any) => c.id === componentId);
    if (component) {
      setSelectedComponent(component);
    }
  }, [engine]);
  
  const deleteSelectedComponent = useCallback(() => {
    if (selectedComponent) {
      removeComponent(selectedComponent.id);
      setSelectedComponent(null);
    }
  }, [selectedComponent, removeComponent]);
  
  const rotateSelectedComponent = useCallback(() => {
    if (!selectedComponent || !engine) return;
    
    const rotationAmount = 90;
    const newRotation = (selectedComponent.rotation + rotationAmount) % 360;
    
    const component = engine.getComponents().find((c: any) => c.id === selectedComponent.id);
    if (component) {
      component.rotation = newRotation;
      updateSimulationState();
      
      setSelectedComponent({...selectedComponent, rotation: newRotation});
    }
  }, [selectedComponent, engine, updateSimulationState]);
  
  const moveComponent = useCallback((componentId: string, position: { x: number; y: number }) => {
    if (!engine) return;
    
    const component = engine.getComponents().find((c: any) => c.id === componentId);
    if (component) {
      component.position = {...position};
      updateSimulationState();
      
      if (selectedComponent && selectedComponent.id === componentId) {
        setSelectedComponent({...selectedComponent, position: {...position}});
      }
    }
  }, [engine, selectedComponent, updateSimulationState]);
  
  const updateComponentProperty = useCallback((componentId: string, property: string, value: any) => {
    if (!engine) return;
    
    const component = engine.getComponents().find((c: any) => c.id === componentId);
    if (component) {
      component.properties[property] = value;
      
      if (component.type === 'switch' && property === 'closed') {
        if (typeof component.properties.toggle === 'function') {
          component.properties.toggle();
        }
      }
      
      updateSimulationState();
      
      if (selectedComponent && selectedComponent.id === componentId) {
        setSelectedComponent({
          ...selectedComponent, 
          properties: {...selectedComponent.properties, [property]: value}
        });
      }
    }
  }, [engine, selectedComponent, updateSimulationState]);
  
  const toggleSwitch = useCallback((componentId: string) => {
    if (!engine) return;
    
    const component = engine.getComponents().find((c: any) => c.id === componentId && c.type === 'switch');
    if (component) {
      if (typeof component.properties.toggle === 'function') {
        component.properties.toggle();
        updateSimulationState();
        
        if (selectedComponent && selectedComponent.id === componentId) {
          setSelectedComponent({
            ...selectedComponent, 
            properties: {...selectedComponent.properties, closed: !selectedComponent.properties.closed}
          });
        }
      }
    }
  }, [engine, selectedComponent, updateSimulationState]);

  return {
    selectedComponent,
    addComponent,
    removeComponent,
    selectComponent,
    deleteSelectedComponent,
    rotateSelectedComponent,
    moveComponent,
    updateComponentProperty,
    toggleSwitch
  };
};
