
import { useCallback } from 'react';
import { Circuit } from '@/types/circuit';
import { useToast } from '@/hooks/use-toast';

interface ConnectionHandlingProps {
  connectionPreview: {
    connectionStart: {
      nodeId: string;
      componentId: string;
      pinId: string;
    } | null;
    resetConnection: () => void;
    isConnecting: boolean;
  };
  onConnectNodes: (sourceId: string, targetId: string) => void;
}

/**
 * Hook to handle wire connection logic
 */
export function useConnectionHandling({
  connectionPreview,
  onConnectNodes
}: ConnectionHandlingProps) {
  const { toast } = useToast();

  /**
   * Complete a connection if valid
   */
  const completeConnection = useCallback((targetNodeId: string, targetComponentId: string) => {
    if (!connectionPreview.connectionStart || !connectionPreview.isConnecting) return false;
    
    // Don't connect to the same component
    if (connectionPreview.connectionStart.componentId === targetComponentId) return false;
    
    // Don't connect to the same node
    if (connectionPreview.connectionStart.nodeId === targetNodeId) return false;
    
    // Create the connection
    onConnectNodes(connectionPreview.connectionStart.nodeId, targetNodeId);
    
    // Show success toast
    toast({
      title: "Connection Created",
      description: "Components connected successfully"
    });
    
    return true;
  }, [connectionPreview, onConnectNodes, toast]);

  /**
   * Reset the current connection
   */
  const resetCurrentConnection = useCallback(() => {
    connectionPreview.resetConnection();
  }, [connectionPreview]);

  return {
    completeConnection,
    resetCurrentConnection
  };
}
