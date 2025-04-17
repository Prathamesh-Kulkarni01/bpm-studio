// Utility functions for the BPMN editor

/**
 * Export diagram as SVG
 */
export async function exportSvg(modeler: any): Promise<string> {
  return new Promise((resolve, reject) => {
    modeler.saveSVG((err: Error, svg: string) => {
      if (err) {
        reject(err);
      } else {
        resolve(svg);
      }
    });
  });
}

/**
 * Export diagram as PNG
 */
export async function exportPng(modeler: any): Promise<string> {
  const svg = await exportSvg(modeler);
  
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    
    if (!context) {
      reject(new Error('Could not create canvas context'));
      return;
    }
    
    const image = new Image();
    
    image.onload = () => {
      // Set canvas dimensions to image dimensions
      canvas.width = image.width;
      canvas.height = image.height;
      
      // Draw white background first
      context.fillStyle = '#FFFFFF';
      context.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw the image on the canvas
      context.drawImage(image, 0, 0);
      
      // Convert canvas to data URL
      const dataUrl = canvas.toDataURL('image/png');
      resolve(dataUrl);
    };
    
    image.onerror = () => {
      reject(new Error('Failed to load SVG into Image'));
    };
    
    // Convert SVG to data URL and set as image source
    const svgBlob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);
    image.src = url;
  });
}

/**
 * Import BPMN XML
 */
export async function importBpmnXml(modeler: any, xml: string): Promise<void> {
  return new Promise((resolve, reject) => {
    modeler.importXML(xml, (err: Error) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

/**
 * Get element type description
 */
export function getElementTypeDescription(type: string): string {
  const types: Record<string, string> = {
    'bpmn:Task': 'Task',
    'bpmn:UserTask': 'User Task',
    'bpmn:ServiceTask': 'Service Task',
    'bpmn:SendTask': 'Send Task',
    'bpmn:ReceiveTask': 'Receive Task',
    'bpmn:ManualTask': 'Manual Task',
    'bpmn:BusinessRuleTask': 'Business Rule Task',
    'bpmn:ScriptTask': 'Script Task',
    'bpmn:StartEvent': 'Start Event',
    'bpmn:EndEvent': 'End Event',
    'bpmn:IntermediateThrowEvent': 'Intermediate Throw Event',
    'bpmn:IntermediateCatchEvent': 'Intermediate Catch Event',
    'bpmn:ExclusiveGateway': 'Exclusive Gateway',
    'bpmn:ParallelGateway': 'Parallel Gateway',
    'bpmn:InclusiveGateway': 'Inclusive Gateway',
    'bpmn:SubProcess': 'Subprocess',
    'bpmn:BoundaryEvent': 'Boundary Event',
  };
  
  return types[type] || type;
}
