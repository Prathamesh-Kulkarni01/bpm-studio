import { useState, useEffect, useRef } from "react";
import { 
  CircleIcon, 
  SquareIcon, 
  DiamondIcon, 
  ArrowRightIcon,
  UserCircleIcon,
  CogIcon,
  TimerIcon,
  MessageCircleIcon,
  BoxesIcon
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ElementsPanelProps {
  width: number;
  onWidthChange: (width: number) => void;
}

interface BpmnElement {
  type: string;
  name: string;
  icon: React.ReactNode;
  category: string;
}

export default function ElementsPanel({ width, onWidthChange }: ElementsPanelProps) {
  const [isResizing, setIsResizing] = useState(false);
  const resizeRef = useRef<HTMLDivElement>(null);

  const elements: BpmnElement[] = [
    // Activities
    { type: "bpmn:Task", name: "Task", icon: <SquareIcon className="w-5 h-5" />, category: "Activities" },
    { type: "bpmn:UserTask", name: "User Task", icon: <UserCircleIcon className="w-5 h-5" />, category: "Activities" },
    { type: "bpmn:ServiceTask", name: "Service Task", icon: <CogIcon className="w-5 h-5" />, category: "Activities" },
    { type: "bpmn:SubProcess", name: "Subprocess", icon: <BoxesIcon className="w-5 h-5" />, category: "Activities" },
    
    // Gateways
    { type: "bpmn:ExclusiveGateway", name: "Exclusive", icon: <DiamondIcon className="w-5 h-5" />, category: "Gateways" },
    { type: "bpmn:ParallelGateway", name: "Parallel", icon: <DiamondIcon className="w-5 h-5" />, category: "Gateways" },
    { type: "bpmn:InclusiveGateway", name: "Inclusive", icon: <DiamondIcon className="w-5 h-5" />, category: "Gateways" },
    
    // Events
    { type: "bpmn:StartEvent", name: "Start", icon: <CircleIcon className="w-5 h-5" />, category: "Events" },
    { type: "bpmn:EndEvent", name: "End", icon: <CircleIcon className="w-5 h-5" />, category: "Events" },
    { type: "bpmn:IntermediateThrowEvent", name: "Intermediate", icon: <CircleIcon className="w-5 h-5" />, category: "Events" },
    { type: "bpmn:TimerEventDefinition", name: "Timer", icon: <TimerIcon className="w-5 h-5" />, category: "Events" },
    { type: "bpmn:MessageEventDefinition", name: "Message", icon: <MessageCircleIcon className="w-5 h-5" />, category: "Events" },
    
    // Connections
    { type: "bpmn:SequenceFlow", name: "Sequence Flow", icon: <ArrowRightIcon className="w-5 h-5" />, category: "Connections" },
    { type: "bpmn:MessageFlow", name: "Message Flow", icon: <ArrowRightIcon className="w-5 h-5" />, category: "Connections" },
  ];

  const groupedElements = elements.reduce((groups, element) => {
    if (!groups[element.category]) {
      groups[element.category] = [];
    }
    groups[element.category].push(element);
    return groups;
  }, {} as Record<string, BpmnElement[]>);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      
      const newWidth = e.clientX;
      if (newWidth >= 200 && newWidth <= 400) {
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

  const handleDragStart = (event: React.DragEvent, type: string) => {
    event.dataTransfer.setData('type', type);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <>
      <div className="bg-white border-r border-gray-200 flex flex-col" style={{ width }}>
        <div className="p-3 border-b border-gray-200">
          <h2 className="font-medium text-sm">Elements</h2>
        </div>
        
        <ScrollArea className="flex-1">
          <div className="p-3">
            {Object.entries(groupedElements).map(([category, items]) => (
              <div key={category} className="mb-4">
                <h3 className="text-xs font-semibold text-gray-500 mb-2 uppercase">{category}</h3>
                <div className="grid grid-cols-2 gap-2">
                  {items.map((element) => (
                    <div
                      key={element.type}
                      draggable
                      onDragStart={(e) => handleDragStart(e, element.type)}
                      className="bpmn-element bg-white border border-gray-300 rounded p-2 flex flex-col items-center cursor-grab hover:border-primary hover:shadow-sm transition-all"
                    >
                      <div className="w-10 h-10 flex items-center justify-center mb-1">
                        {element.icon}
                      </div>
                      <span className="text-xs">{element.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
      
      <div
        ref={resizeRef}
        className="w-1 bg-gray-200 hover:bg-primary cursor-col-resize"
        onMouseDown={() => setIsResizing(true)}
      />
    </>
  );
}
