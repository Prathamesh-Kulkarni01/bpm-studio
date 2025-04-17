import { useState, useEffect, useRef } from "react";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { CircleIcon, XIcon } from "lucide-react";

interface PropertiesPanelProps {
  width: number;
  onWidthChange: (width: number) => void;
  selectedElement: any;
  modeler: any;
}

export default function PropertiesPanel({ 
  width, 
  onWidthChange,
  selectedElement,
  modeler
}: PropertiesPanelProps) {
  const [isResizing, setIsResizing] = useState(false);
  const resizeRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState("general");
  
  const [elementProperties, setElementProperties] = useState({
    id: "",
    name: "",
    documentation: "",
    type: "",
    businessObject: null as any
  });
  
  const [conditionalProperties, setConditionalProperties] = useState<any>({
    eventDefinitionType: "",
    isInterrupting: false,
    implementation: "",
    sequenceFlowOrder: "0",
  });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      
      const newWidth = window.innerWidth - e.clientX;
      if (newWidth >= 250 && newWidth <= 500) {
        onWidthChange(newWidth);
      }
    };
    
    const handleMouseUp = () => {
      setIsResizing(false);
    };
    
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, onWidthChange]);

  // Update properties when selected element changes
  useEffect(() => {
    if (selectedElement && modeler) {
      const { id, type, businessObject } = selectedElement;
      
      // Set basic properties
      setElementProperties({
        id: id || "",
        name: businessObject.name || "",
        documentation: getDocumentation(businessObject) || "",
        type: getReadableType(type) || "",
        businessObject
      });
      
      // Set conditional properties based on element type
      if (isEventElement(type)) {
        setConditionalProperties({
          eventDefinitionType: getEventDefinitionType(businessObject) || "None",
          isInterrupting: businessObject.isInterrupting === undefined ? true : businessObject.isInterrupting,
          implementation: "",
          sequenceFlowOrder: "0"
        });
      } else if (isTaskElement(type)) {
        setConditionalProperties({
          eventDefinitionType: "",
          isInterrupting: false,
          implementation: businessObject.implementation || "Default",
          sequenceFlowOrder: "0"
        });
      } else {
        setConditionalProperties({
          eventDefinitionType: "",
          isInterrupting: false,
          implementation: "",
          sequenceFlowOrder: "0"
        });
      }
    }
  }, [selectedElement, modeler]);

  const handlePropertyChange = (property: string, value: string) => {
    if (!selectedElement || !modeler) return;
    
    const modeling = modeler.get('modeling');
    
    if (property === 'id') {
      // ID changes require special handling in BPMN.js
      // It's generally not recommended to change IDs directly
      return;
    } else if (property === 'name') {
      modeling.updateProperties(selectedElement, { name: value });
    } else if (property === 'documentation') {
      updateDocumentation(selectedElement, value, modeling);
    }
    
    // Update local state
    setElementProperties({
      ...elementProperties,
      [property]: value
    });
  };

  const handleConditionalPropertyChange = (property: string, value: any) => {
    if (!selectedElement || !modeler) return;
    
    const modeling = modeler.get('modeling');
    
    if (property === 'eventDefinitionType') {
      // This requires adding/removing event definitions - complex operation
      // Simplified version:
      setConditionalProperties({
        ...conditionalProperties,
        eventDefinitionType: value
      });
    } else if (property === 'isInterrupting') {
      modeling.updateProperties(selectedElement, { isInterrupting: value });
      setConditionalProperties({
        ...conditionalProperties,
        isInterrupting: value
      });
    } else if (property === 'implementation') {
      modeling.updateProperties(selectedElement, { implementation: value });
      setConditionalProperties({
        ...conditionalProperties,
        implementation: value
      });
    } else if (property === 'sequenceFlowOrder') {
      setConditionalProperties({
        ...conditionalProperties,
        sequenceFlowOrder: value
      });
    }
  };

  // Helper functions
  function getReadableType(type: string): string {
    const typeMappings: Record<string, string> = {
      'bpmn:Task': 'Task',
      'bpmn:UserTask': 'User Task',
      'bpmn:ServiceTask': 'Service Task',
      'bpmn:SendTask': 'Send Task',
      'bpmn:ReceiveTask': 'Receive Task',
      'bpmn:ManualTask': 'Manual Task',
      'bpmn:BusinessRuleTask': 'Business Rule Task',
      'bpmn:ScriptTask': 'Script Task',
      'bpmn:CallActivity': 'Call Activity',
      'bpmn:SubProcess': 'Sub Process',
      'bpmn:StartEvent': 'Start Event',
      'bpmn:EndEvent': 'End Event',
      'bpmn:IntermediateThrowEvent': 'Intermediate Throw Event',
      'bpmn:IntermediateCatchEvent': 'Intermediate Catch Event',
      'bpmn:BoundaryEvent': 'Boundary Event',
      'bpmn:ExclusiveGateway': 'Exclusive Gateway',
      'bpmn:ParallelGateway': 'Parallel Gateway',
      'bpmn:InclusiveGateway': 'Inclusive Gateway',
      'bpmn:EventBasedGateway': 'Event Based Gateway',
      'bpmn:ComplexGateway': 'Complex Gateway',
      'bpmn:SequenceFlow': 'Sequence Flow',
      'bpmn:MessageFlow': 'Message Flow',
      'bpmn:DataObjectReference': 'Data Object',
      'bpmn:DataStoreReference': 'Data Store',
      'bpmn:TextAnnotation': 'Text Annotation',
      'bpmn:Group': 'Group',
      'bpmn:Participant': 'Pool',
      'bpmn:Lane': 'Lane'
    };
    
    return typeMappings[type] || type;
  }
  
  function getDocumentation(businessObject: any): string {
    if (!businessObject.documentation || !businessObject.documentation.length) {
      return '';
    }
    
    return businessObject.documentation[0].text || '';
  }
  
  function updateDocumentation(element: any, text: string, modeling: any): void {
    const bo = element.businessObject;
    const documentation = bo.documentation && bo.documentation.length ? bo.documentation[0] : null;
    
    if (!documentation) {
      const bpmnFactory = modeler.get('bpmnFactory');
      const newDocumentation = bpmnFactory.create('bpmn:Documentation', { text });
      modeling.updateProperties(element, {
        documentation: [newDocumentation]
      });
    } else {
      modeling.updateProperties(element, {
        documentation: [{ ...documentation, text }]
      });
    }
  }
  
  function isEventElement(type: string): boolean {
    return type.includes('Event');
  }
  
  function isTaskElement(type: string): boolean {
    return type.includes('Task') || type === 'bpmn:SubProcess' || type === 'bpmn:CallActivity';
  }
  
  function getEventDefinitionType(businessObject: any): string {
    if (businessObject.eventDefinitions && businessObject.eventDefinitions.length > 0) {
      const eventDef = businessObject.eventDefinitions[0];
      if (eventDef.$type === 'bpmn:MessageEventDefinition') return 'Message';
      if (eventDef.$type === 'bpmn:TimerEventDefinition') return 'Timer';
      if (eventDef.$type === 'bpmn:ConditionalEventDefinition') return 'Conditional';
      if (eventDef.$type === 'bpmn:SignalEventDefinition') return 'Signal';
      if (eventDef.$type === 'bpmn:ErrorEventDefinition') return 'Error';
      if (eventDef.$type === 'bpmn:EscalationEventDefinition') return 'Escalation';
      if (eventDef.$type === 'bpmn:CompensateEventDefinition') return 'Compensate';
      if (eventDef.$type === 'bpmn:LinkEventDefinition') return 'Link';
      if (eventDef.$type === 'bpmn:CancelEventDefinition') return 'Cancel';
      if (eventDef.$type === 'bpmn:TerminateEventDefinition') return 'Terminate';
    }
    return 'None';
  }

  // Render nothing if no element is selected
  if (!selectedElement) {
    return (
      <>
        <div 
          ref={resizeRef}
          className="w-1 bg-gray-200 hover:bg-primary cursor-col-resize"
          onMouseDown={() => setIsResizing(true)}
        />
        <div className="bg-white border-l border-gray-200 flex flex-col" style={{ width }}>
          <div className="p-3 border-b border-gray-200 flex justify-between items-center">
            <h2 className="font-medium text-sm">Properties</h2>
          </div>
          <div className="flex-1 flex items-center justify-center text-gray-500">
            No element selected
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div 
        ref={resizeRef}
        className="w-1 bg-gray-200 hover:bg-primary cursor-col-resize"
        onMouseDown={() => setIsResizing(true)}
      />
      <div className="bg-white border-l border-gray-200 flex flex-col" style={{ width }}>
        <div className="p-3 border-b border-gray-200 flex justify-between items-center">
          <h2 className="font-medium text-sm">Properties</h2>
          <button className="text-gray-500 hover:text-gray-700 p-1">
            <XIcon className="h-4 w-4" />
          </button>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <TabsList className="px-2 justify-start border-b rounded-none">
            <TabsTrigger value="general" className="data-[state=active]:border-primary data-[state=active]:text-primary">
              General
            </TabsTrigger>
            <TabsTrigger value="advanced" className="data-[state=active]:border-primary data-[state=active]:text-primary">
              Advanced
            </TabsTrigger>
            <TabsTrigger value="forms" className="data-[state=active]:border-primary data-[state=active]:text-primary">
              Forms
            </TabsTrigger>
          </TabsList>
          
          <ScrollArea className="flex-1">
            <TabsContent value="general" className="p-4 mt-0">
              {/* Element type indicator */}
              <div className="mb-6 flex items-center">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center mr-3">
                  <CircleIcon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <div className="text-sm font-medium">{elementProperties.type}</div>
                  <div className="text-xs text-gray-500">{selectedElement.type}</div>
                </div>
              </div>
              
              {/* General properties */}
              <div className="mb-4">
                <h3 className="text-xs font-semibold uppercase text-gray-500 mb-3">General</h3>
                
                <div className="mb-3">
                  <Label className="mb-1">Id</Label>
                  <Input 
                    value={elementProperties.id} 
                    onChange={(e) => handlePropertyChange('id', e.target.value)}
                    disabled
                  />
                </div>
                
                <div className="mb-3">
                  <Label className="mb-1">Name</Label>
                  <Input 
                    value={elementProperties.name} 
                    onChange={(e) => handlePropertyChange('name', e.target.value)}
                  />
                </div>
                
                <div className="mb-3">
                  <Label className="mb-1">Documentation</Label>
                  <Textarea 
                    value={elementProperties.documentation} 
                    onChange={(e) => handlePropertyChange('documentation', e.target.value)}
                    rows={3} 
                    placeholder="Add documentation..."
                  />
                </div>
              </div>
              
              {/* Conditional properties based on element type */}
              {isEventElement(selectedElement.type) && (
                <div className="mb-4">
                  <h3 className="text-xs font-semibold uppercase text-gray-500 mb-3">Event Definition</h3>
                  
                  <div className="mb-3">
                    <Label className="mb-1">Event Type</Label>
                    <Select 
                      value={conditionalProperties.eventDefinitionType}
                      onValueChange={(value) => handleConditionalPropertyChange('eventDefinitionType', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select event type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="None">None</SelectItem>
                        <SelectItem value="Message">Message</SelectItem>
                        <SelectItem value="Timer">Timer</SelectItem>
                        <SelectItem value="Conditional">Conditional</SelectItem>
                        <SelectItem value="Signal">Signal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {(selectedElement.type === 'bpmn:StartEvent' || selectedElement.type === 'bpmn:BoundaryEvent') && (
                    <div className="mb-3 flex items-center space-x-2">
                      <Switch 
                        id="interrupting"
                        checked={conditionalProperties.isInterrupting}
                        onCheckedChange={(checked) => handleConditionalPropertyChange('isInterrupting', checked)}
                      />
                      <Label htmlFor="interrupting">Is Interrupting</Label>
                    </div>
                  )}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="advanced" className="p-4 mt-0">
              {/* Execution properties */}
              <div className="mb-4">
                <h3 className="text-xs font-semibold uppercase text-gray-500 mb-3">Execution</h3>
                
                <div className="mb-3">
                  <Label className="mb-1">Sequence Flow Order</Label>
                  <div className="flex">
                    <Input 
                      value={conditionalProperties.sequenceFlowOrder} 
                      onChange={(e) => handleConditionalPropertyChange('sequenceFlowOrder', e.target.value)}
                      className="rounded-r-none"
                    />
                    <Button variant="secondary" className="rounded-l-none border border-l-0 border-gray-300">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M10 3a1 1 0 01.707.293l3 3a1 1 0 01-1.414 1.414L10 5.414 7.707 7.707a1 1 0 01-1.414-1.414l3-3A1 1 0 0110 3zm-3.707 9.293a1 1 0 011.414 0L10 14.586l2.293-2.293a1 1 0 011.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" />
                      </svg>
                    </Button>
                  </div>
                </div>
                
                {isTaskElement(selectedElement.type) && (
                  <div className="mb-3">
                    <Label className="mb-1">Implementation</Label>
                    <Select 
                      value={conditionalProperties.implementation}
                      onValueChange={(value) => handleConditionalPropertyChange('implementation', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select implementation" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Default">Default</SelectItem>
                        <SelectItem value="Delegate Expression">Delegate Expression</SelectItem>
                        <SelectItem value="Expression">Expression</SelectItem>
                        <SelectItem value="Java Class">Java Class</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="forms" className="p-4 mt-0">
              <div className="text-center py-8 text-gray-500">
                <p className="text-sm">Form configuration is available for User Tasks only.</p>
              </div>
            </TabsContent>
          </ScrollArea>
          
          {/* Properties panel footer */}
          <div className="p-3 border-t border-gray-200 flex justify-between">
            <Button variant="outline" size="sm">Reset</Button>
            <Button className="bg-primary hover:bg-primary/90 text-white" size="sm">Apply</Button>
          </div>
        </Tabs>
      </div>
    </>
  );
}
