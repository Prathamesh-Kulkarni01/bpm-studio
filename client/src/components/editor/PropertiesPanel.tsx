import { useState, useEffect, useRef } from "react";
import { XIcon, ChevronLeft, ChevronRight, Cog } from "lucide-react";
import { PropertyPanel } from "./properties/PropertyPanel";
import ConfigurablePropertyPanel from "./properties/ConfigurablePropertyPanel";
import { defaultPanelConfig } from "@/lib/propertyPanelConfig";
import { bpmnPropertyPanelConfig } from "@/lib/bpmnPropertyConfig";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

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
  // Use the JSON-based configurable panel by default
  const [useJSONConfig, setUseJSONConfig] = useState(true);
  // State for panel collapse
  const [isCollapsed, setIsCollapsed] = useState(false);
  // Panel settings
  const [showGroups, setShowGroups] = useState(true);
  const [autoExpandGroups, setAutoExpandGroups] = useState(false);
  const [showAdvancedProperties, setShowAdvancedProperties] = useState(true);

  // Resize handling
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

  // When collapsed, we show a thin panel that can be expanded
  if (isCollapsed) {
    return (
      <>
        <div 
          ref={resizeRef}
          className="w-1 bg-gray-200 hover:bg-primary cursor-col-resize"
          onMouseDown={() => setIsResizing(true)}
        />
        <div className="bg-white border-l border-gray-200 flex flex-col" style={{ width: 48 }}>
          <Button
            variant="ghost"
            className="w-full h-10 flex items-center justify-center"
            onClick={() => setIsCollapsed(false)}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Separator />
          {selectedElement && (
            <div className="p-3">
              <Cog className="h-5 w-5 mx-auto text-gray-500" />
            </div>
          )}
        </div>
      </>
    );
  }

  // If no element is selected, show empty state
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
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setIsCollapsed(true)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
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
          <div className="flex items-center gap-3">
            <button 
              className="text-xs text-blue-600 hover:text-blue-800"
              onClick={() => setUseJSONConfig(!useJSONConfig)}
            >
              {useJSONConfig ? 'Use Class-based' : 'Use JSON-based'}
            </button>
            
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7">
                  <Cog className="h-4 w-4 text-gray-500" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Properties Panel Settings</DialogTitle>
                  <DialogDescription>
                    Configure how the properties panel displays information.
                  </DialogDescription>
                </DialogHeader>
                
                <div className="py-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="show-groups">Group properties</Label>
                    <Switch 
                      id="show-groups" 
                      checked={showGroups}
                      onCheckedChange={setShowGroups}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="auto-expand">Auto-expand all groups</Label>
                    <Switch 
                      id="auto-expand" 
                      checked={autoExpandGroups}
                      onCheckedChange={setAutoExpandGroups}
                      disabled={!showGroups}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="show-advanced">Show advanced properties</Label>
                    <Switch 
                      id="show-advanced" 
                      checked={showAdvancedProperties}
                      onCheckedChange={setShowAdvancedProperties}
                    />
                  </div>
                </div>
                
                <DialogFooter>
                  <DialogClose asChild>
                    <Button>Save Settings</Button>
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setIsCollapsed(true)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <ScrollArea className="flex-1 overflow-auto">
          {/* Toggle between the two implementations */}
          {useJSONConfig ? (
            <ConfigurablePropertyPanel
              schema={bpmnPropertyPanelConfig}
              element={selectedElement}
              modeler={modeler}
            />
          ) : (
            <PropertyPanel
              selectedElement={selectedElement}
              modeler={modeler}
              customConfig={defaultPanelConfig}
            />
          )}
        </ScrollArea>
      </div>
    </>
  );
}