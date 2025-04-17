import { useEffect, useRef, useState } from 'react';
import BpmnModeler from 'bpmn-js/lib/Modeler';
import 'bpmn-js/dist/assets/diagram-js.css';
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn.css';
import Toolbar from './Toolbar';
import Minimap from './Minimap';

// Import additional bpmn-js modules
// Note: CSS for properties panel will be loaded by our custom styles

interface CanvasProps {
  xml: string;
  onModelerInit: (modeler: any) => void;
  elementsPanelWidth: number;
  propertiesPanelWidth: number;
}

export default function Canvas({ 
  xml, 
  onModelerInit, 
  elementsPanelWidth, 
  propertiesPanelWidth 
}: CanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [modeler, setModeler] = useState<any>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  
  // Initialize modeler
  useEffect(() => {
    if (!containerRef.current) return;
    
    // Create new modeler instance
    const bpmnModeler = new BpmnModeler({
      container: containerRef.current,
      keyboard: {
        bindTo: document
      }
    });
    
    // Set up basic modules
    const eventBus = bpmnModeler.get('eventBus');
    const canvas = bpmnModeler.get('canvas');
    
    // Set canvas color
    canvas.setColor('shape', '#22A699');
    
    // Listen for zoom events
    eventBus.on('canvas.viewbox.changed', (event: any) => {
      setZoomLevel(Math.round(event.viewbox.scale * 100) / 100);
    });
    
    // Handle drag and drop
    const onContainerDragOver = (event: DragEvent) => {
      event.preventDefault();
      event.dataTransfer!.dropEffect = 'move';
    };
    
    const onContainerDrop = (event: DragEvent) => {
      event.preventDefault();
      
      const elementType = event.dataTransfer!.getData('type');
      if (!elementType) return;
      
      const position = {
        x: event.offsetX,
        y: event.offsetY
      };
      
      const canvas = bpmnModeler.get('canvas');
      const viewbox = canvas.viewbox();
      
      const adjustedPosition = {
        x: position.x / viewbox.scale + viewbox.x,
        y: position.y / viewbox.scale + viewbox.y
      };
      
      const elementFactory = bpmnModeler.get('elementFactory');
      const create = bpmnModeler.get('create');
      const elementRegistry = bpmnModeler.get('elementRegistry');
      const modeling = bpmnModeler.get('modeling');
      
      // Create element based on type
      let shape;
      
      if (elementType.includes('Task')) {
        shape = elementFactory.createShape({ type: elementType });
      } else if (elementType.includes('Gateway')) {
        shape = elementFactory.createShape({ type: elementType });
      } else if (elementType.includes('Event')) {
        shape = elementFactory.createShape({ type: elementType });
      } else if (elementType.includes('Flow')) {
        // For connections, we need source and target
        return;
      } else {
        // Default shape
        shape = elementFactory.createShape({ type: elementType });
      }
      
      create.start(event, shape, {
        x: adjustedPosition.x,
        y: adjustedPosition.y
      });
    };
    
    containerRef.current.addEventListener('dragover', onContainerDragOver);
    containerRef.current.addEventListener('drop', onContainerDrop);
    
    setModeler(bpmnModeler);
    onModelerInit(bpmnModeler);
    
    return () => {
      bpmnModeler.destroy();
      containerRef.current?.removeEventListener('dragover', onContainerDragOver);
      containerRef.current?.removeEventListener('drop', onContainerDrop);
    };
  }, [onModelerInit]);
  
  // Import XML when available
  useEffect(() => {
    if (modeler && xml) {
      modeler.importXML(xml).catch((err: Error) => {
        console.error('Error importing XML', err);
      });
    }
  }, [modeler, xml]);
  
  const handleZoomIn = () => {
    if (!modeler) return;
    modeler.get('zoomScroll').stepZoom(1);
  };
  
  const handleZoomOut = () => {
    if (!modeler) return;
    modeler.get('zoomScroll').stepZoom(-1);
  };
  
  const handleZoomReset = () => {
    if (!modeler) return;
    modeler.get('canvas').zoom('fit-viewport', 'auto');
  };
  
  const canvasStyles: React.CSSProperties = {
    width: `calc(100% - ${elementsPanelWidth + propertiesPanelWidth + 2}px)`,
    height: '100%',
    position: 'relative',
    backgroundColor: '#F8F9FA'
  };
  
  return (
    <div style={canvasStyles}>
      <Toolbar 
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onZoomReset={handleZoomReset}
        zoomLevel={zoomLevel}
      />
      
      <div 
        ref={containerRef} 
        className="bpmn-container" 
        style={{ 
          width: '100%', 
          height: 'calc(100% - 40px)', 
          overflow: 'hidden',
          background: 'radial-gradient(circle, #e2e8f0 1px, transparent 1px)',
          backgroundSize: '20px 20px'
        }}
      />
      
      <Minimap modeler={modeler} />
    </div>
  );
}
