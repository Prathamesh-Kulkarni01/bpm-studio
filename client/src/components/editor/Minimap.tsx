import { useEffect, useRef } from 'react';

interface MinimapProps {
  modeler: any;
}

export default function Minimap({ modeler }: MinimapProps) {
  const minimapRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!modeler || !minimapRef.current) return;
    
    // Minimap implementation
    const minimapOverlay = document.createElement('div');
    minimapRef.current.appendChild(minimapOverlay);
    
    // Get canvas and viewport
    const canvas = modeler.get('canvas');
    const eventBus = modeler.get('eventBus');
    
    // Render the minimap
    const renderMinimap = () => {
      if (!minimapRef.current) return;
      
      // Get all elements
      const elementRegistry = modeler.get('elementRegistry');
      const elements = elementRegistry.getAll();
      
      // Clear the minimap
      minimapRef.current.innerHTML = '';
      
      // Calculate the bounds of all elements
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      elements.forEach((element: any) => {
        if (element.waypoints) {
          // Handle connections
          element.waypoints.forEach((waypoint: any) => {
            minX = Math.min(minX, waypoint.x);
            minY = Math.min(minY, waypoint.y);
            maxX = Math.max(maxX, waypoint.x);
            maxY = Math.max(maxY, waypoint.y);
          });
        } else if (element.x && element.y && element.width && element.height) {
          // Handle shapes
          minX = Math.min(minX, element.x);
          minY = Math.min(minY, element.y);
          maxX = Math.max(maxX, element.x + element.width);
          maxY = Math.max(maxY, element.y + element.height);
        }
      });
      
      // Add some padding
      minX -= 50;
      minY -= 50;
      maxX += 50;
      maxY += 50;
      
      // Calculate the scale to fit the minimap
      const diagramWidth = maxX - minX;
      const diagramHeight = maxY - minY;
      const minimapWidth = minimapRef.current.clientWidth;
      const minimapHeight = minimapRef.current.clientHeight;
      const scale = Math.min(minimapWidth / diagramWidth, minimapHeight / diagramHeight) * 0.9;
      
      // Create an SVG element for the minimap
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('width', '100%');
      svg.setAttribute('height', '100%');
      svg.style.background = '#F8F9FA';
      svg.style.backgroundImage = 'radial-gradient(circle, #e2e8f0 0.5px, transparent 0.5px)';
      svg.style.backgroundSize = '5px 5px';
      minimapRef.current.appendChild(svg);
      
      // Draw elements on the minimap
      elements.forEach((element: any) => {
        if (element.waypoints) {
          // Draw connections
          const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
          let d = `M ${(element.waypoints[0].x - minX) * scale} ${(element.waypoints[0].y - minY) * scale}`;
          for (let i = 1; i < element.waypoints.length; i++) {
            d += ` L ${(element.waypoints[i].x - minX) * scale} ${(element.waypoints[i].y - minY) * scale}`;
          }
          path.setAttribute('d', d);
          path.setAttribute('stroke', '#333333');
          path.setAttribute('stroke-width', '1');
          path.setAttribute('fill', 'none');
          svg.appendChild(path);
        } else if (element.x && element.y && element.width && element.height) {
          // Draw shapes
          const x = (element.x - minX) * scale;
          const y = (element.y - minY) * scale;
          const width = element.width * scale;
          const height = element.height * scale;
          
          let shape;
          if (element.type === 'bpmn:StartEvent' || element.type === 'bpmn:EndEvent' || element.type === 'bpmn:IntermediateThrowEvent' || element.type === 'bpmn:IntermediateCatchEvent') {
            // Events are circles
            shape = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            shape.setAttribute('cx', (x + width / 2).toString());
            shape.setAttribute('cy', (y + height / 2).toString());
            shape.setAttribute('r', (width / 2).toString());
          } else if (element.type === 'bpmn:ExclusiveGateway' || element.type === 'bpmn:ParallelGateway' || element.type === 'bpmn:InclusiveGateway') {
            // Gateways are diamonds
            shape = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
            const cx = x + width / 2;
            const cy = y + height / 2;
            shape.setAttribute('points', `${cx},${y} ${x + width},${cy} ${cx},${y + height} ${x},${cy}`);
          } else {
            // Default to rectangles for tasks, etc.
            shape = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            shape.setAttribute('x', x.toString());
            shape.setAttribute('y', y.toString());
            shape.setAttribute('width', width.toString());
            shape.setAttribute('height', height.toString());
            if (element.type.includes('Task')) {
              shape.setAttribute('rx', '3');
              shape.setAttribute('ry', '3');
            }
          }
          
          shape.setAttribute('fill', 'white');
          shape.setAttribute('stroke', '#333333');
          shape.setAttribute('stroke-width', '1');
          svg.appendChild(shape);
        }
      });
      
      // Draw viewport indicator
      const viewport = canvas.viewbox();
      const viewportX = (viewport.x - minX) * scale;
      const viewportY = (viewport.y - minY) * scale;
      const viewportWidth = viewport.width * scale / viewport.scale;
      const viewportHeight = viewport.height * scale / viewport.scale;
      
      const viewportRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      viewportRect.setAttribute('x', viewportX.toString());
      viewportRect.setAttribute('y', viewportY.toString());
      viewportRect.setAttribute('width', viewportWidth.toString());
      viewportRect.setAttribute('height', viewportHeight.toString());
      viewportRect.setAttribute('fill', 'none');
      viewportRect.setAttribute('stroke', '#22A699');
      viewportRect.setAttribute('stroke-width', '1.5');
      viewportRect.setAttribute('stroke-dasharray', '2');
      svg.appendChild(viewportRect);
    };
    
    // Render initially and on changes
    renderMinimap();
    
    const updateHandler = () => renderMinimap();
    eventBus.on('canvas.viewbox.changed', updateHandler);
    eventBus.on('elements.changed', updateHandler);
    eventBus.on('shape.added', updateHandler);
    eventBus.on('shape.moved', updateHandler);
    eventBus.on('shape.removed', updateHandler);
    
    return () => {
      eventBus.off('canvas.viewbox.changed', updateHandler);
      eventBus.off('elements.changed', updateHandler);
      eventBus.off('shape.added', updateHandler);
      eventBus.off('shape.moved', updateHandler);
      eventBus.off('shape.removed', updateHandler);
    };
  }, [modeler]);
  
  return (
    <div 
      ref={minimapRef} 
      className="absolute bottom-4 right-4 w-48 h-32 bg-white border border-gray-300 rounded shadow-md overflow-hidden"
    ></div>
  );
}
