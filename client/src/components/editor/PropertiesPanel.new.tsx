import { useState, useEffect, useRef } from "react";
import { XIcon } from "lucide-react";
import { PropertyPanel } from "./properties/PropertyPanel";
import { defaultPanelConfig } from "@/lib/propertyPanelConfig";

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
  modeler,
}: PropertiesPanelProps) {
  const [isResizing, setIsResizing] = useState(false);
  const resizeRef = useRef<HTMLDivElement>(null);

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
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing, onWidthChange]);

  // If no element is selected, show empty state
  if (!selectedElement) {
    return (
      <>
        <div
          ref={resizeRef}
          className="w-1 bg-gray-200 hover:bg-primary cursor-col-resize scrollbar"
          onMouseDown={() => setIsResizing(true)}
        />
        <div
          className="bg-white border-l border-gray-200 flex flex-col"
          style={{ width }}
        >
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
      <div
        className="bg-white border-l border-gray-200 flex flex-col"
        style={{ width }}
      >
        <div className="p-3 border-b border-gray-200 flex justify-between items-center">
          <h2 className="font-medium text-sm">Properties</h2>
          <button className="text-gray-500 hover:text-gray-700 p-1">
            <XIcon className="h-4 w-4" />
          </button>
        </div>

        {/* New configurable property panel */}
        <PropertyPanel
          selectedElement={selectedElement}
          modeler={modeler}
          customConfig={defaultPanelConfig}
        />
      </div>
    </>
  );
}
