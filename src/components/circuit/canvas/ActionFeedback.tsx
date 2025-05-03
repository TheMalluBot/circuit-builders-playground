
import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, AlertCircle, Info } from 'lucide-react';

interface ActionFeedbackProps {
  message: string;
  type: 'success' | 'error' | 'info';
  duration?: number;
  position?: { x: number; y: number };
  show: boolean;
}

export function ActionFeedback({ 
  message, 
  type, 
  duration = 2000,
  position,
  show
}: ActionFeedbackProps) {
  const [visible, setVisible] = useState(show);
  
  useEffect(() => {
    setVisible(show);
    
    if (show) {
      const timer = setTimeout(() => {
        setVisible(false);
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [show, duration]);
  
  // Define colors and icons based on feedback type
  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return {
          bgColor: 'bg-green-100',
          textColor: 'text-green-800',
          borderColor: 'border-green-300',
          icon: <Check className="w-4 h-4 text-green-500" />
        };
      case 'error':
        return {
          bgColor: 'bg-red-100',
          textColor: 'text-red-800',
          borderColor: 'border-red-300',
          icon: <AlertCircle className="w-4 h-4 text-red-500" />
        };
      case 'info':
      default:
        return {
          bgColor: 'bg-blue-100',
          textColor: 'text-blue-800',
          borderColor: 'border-blue-300',
          icon: <Info className="w-4 h-4 text-blue-500" />
        };
    }
  };
  
  const { bgColor, textColor, borderColor, icon } = getTypeStyles();
  
  // Use position if provided, otherwise position in the middle-bottom
  const positionStyle = position 
    ? { left: `${position.x}px`, top: `${position.y}px` } 
    : { bottom: '20px', left: '50%', transform: 'translateX(-50%)' };
    
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className={`absolute z-50 rounded-md px-3 py-2 ${bgColor} ${textColor} ${borderColor} border shadow-sm flex items-center space-x-2 text-sm`}
          style={positionStyle}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {icon}
          <span>{message}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
