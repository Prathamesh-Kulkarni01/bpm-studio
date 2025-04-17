import { useEffect, useRef, useState } from "react";
import BpmnModeler from "bpmn-js/lib/Modeler";
import "bpmn-js/dist/assets/diagram-js.css";
import "bpmn-js/dist/assets/bpmn-font/css/bpmn.css";
import Toolbar from "./Toolbar";
import Minimap from "./Minimap";

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
  propertiesPanelWidth,
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
        bindTo: document,
      },
    });

    // Set up basic modules
    const eventBus = bpmnModeler.get("eventBus");
    const canvas = bpmnModeler.get("canvas");

    // Set canvas color
    // canvas.setColor('shape', '#22A699');

    // Listen for zoom events
    // eventBus.on('canvas.viewbox.changed', (event: any) => {
    //   setZoomLevel(Math.round(event.viewbox.scale * 100) / 100);
    // });

    // Handle drag and drop
    const onContainerDragOver = (event: DragEvent) => {
      event.preventDefault();
      event.dataTransfer!.dropEffect = "move";
    };

    const onContainerDrop = (event: DragEvent) => {
      event.preventDefault();

      const elementType = event.dataTransfer!.getData("type");
      if (!elementType) return;

      const position = {
        x: event.offsetX,
        y: event.offsetY,
      };

      const canvas = bpmnModeler.get("canvas");
      const viewbox = canvas.viewbox();

      const adjustedPosition = {
        x: position.x / viewbox.scale + viewbox.x,
        y: position.y / viewbox.scale + viewbox.y,
      };

      const elementFactory = bpmnModeler.get("elementFactory");
      const create = bpmnModeler.get("create");
      const elementRegistry = bpmnModeler.get("elementRegistry");
      const modeling = bpmnModeler.get("modeling");

      // Create element based on type
      let shape;

      if (elementType.includes("Task")) {
        shape = elementFactory.createShape({ type: elementType });
      } else if (elementType.includes("Gateway")) {
        shape = elementFactory.createShape({ type: elementType });
      } else if (elementType.includes("Event")) {
        shape = elementFactory.createShape({ type: elementType });
      } else if (elementType.includes("Flow")) {
        // For connections, we need source and target
        return;
      } else {
        // Default shape
        shape = elementFactory.createShape({ type: elementType });
      }

      create.start(event, shape, {
        x: adjustedPosition.x,
        y: adjustedPosition.y,
      });
    };

    containerRef.current.addEventListener("dragover", onContainerDragOver);
    containerRef.current.addEventListener("drop", onContainerDrop);

    setModeler(bpmnModeler);
    onModelerInit(bpmnModeler);

    return () => {
      bpmnModeler.destroy();
      containerRef.current?.removeEventListener(
        "dragover",
        onContainerDragOver,
      );
      containerRef.current?.removeEventListener("drop", onContainerDrop);
    };
  }, [onModelerInit]);

  // Import XML when available
  useEffect(() => {
    if (modeler && xml) {
      modeler.importXML(xml).catch((err: Error) => {
        console.error("Error importing XML", err);
      });
    }
  }, [modeler, xml]);

  // Zoom controls
  const handleZoomIn = () => {
    if (!modeler) return;
    modeler.get("zoomScroll").stepZoom(1);
    // Update zoom level after changing zoom
    const canvas = modeler.get("canvas");
    setZoomLevel(canvas.zoom());
  };

  const handleZoomOut = () => {
    if (!modeler) return;
    modeler.get("zoomScroll").stepZoom(-1);
    // Update zoom level after changing zoom
    const canvas = modeler.get("canvas");
    setZoomLevel(canvas.zoom());
  };

  const handleZoomReset = () => {
    if (!modeler) return;
    modeler.get("canvas").zoom("fit-viewport", "auto");
    // Update zoom level after changing zoom
    const canvas = modeler.get("canvas");
    setZoomLevel(canvas.zoom());
  };

  // Import BPMN XML
  const handleImportXml = (xml: string) => {
    if (!modeler) return;
    
    modeler.importXML(xml)
      .then(() => {
        console.log("BPMN diagram imported successfully");
        // Fit the diagram to the viewport
        modeler.get("canvas").zoom("fit-viewport", "auto");
      })
      .catch((err: Error) => {
        console.error("Error importing BPMN diagram", err);
      });
  };

  const handleSave = () => {
    if (!modeler) return;
    
    modeler.saveXML({ format: true })
      .then(({ xml }: { xml: string }) => {
        console.log("BPMN diagram saved", xml);
        // Here you would typically save to server or localStorage
        // For now, just log to console
      })
      .catch((err: Error) => {
        console.error("Error saving BPMN diagram", err);
      });
  };

  const handleSaveAs = () => {
    if (!modeler) return;
    
    modeler.saveXML({ format: true })
      .then(({ xml }: { xml: string }) => {
        console.log("BPMN diagram saved as", xml);
        // Here you would typically provide a save dialog
        // For now, just download the file
        const blob = new Blob([xml], { type: "application/xml" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "diagram.bpmn";
        a.click();
        URL.revokeObjectURL(url);
      })
      .catch((err: Error) => {
        console.error("Error saving BPMN diagram", err);
      });
  };

  const handleDeploy = () => {
    if (!modeler) return;
    
    modeler.saveXML({ format: true })
      .then(({ xml }: { xml: string }) => {
        console.log("BPMN diagram ready for deployment", xml);
        // Here you would typically send to a deployment endpoint
        // For now, just log to console
        
        // Example of how to validate and deploy
        fetch("/api/xml/validate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ xml }),
        })
        .then(response => response.json())
        .then(data => {
          if (data.valid) {
            console.log("Diagram is valid and ready for deployment");
          } else {
            console.error("Diagram validation failed", data.errors);
          }
        })
        .catch(err => {
          console.error("Error validating diagram", err);
        });
      })
      .catch((err: Error) => {
        console.error("Error preparing BPMN diagram for deployment", err);
      });
  };

  const canvasStyles: React.CSSProperties = {
    width: `calc(100% - ${elementsPanelWidth + propertiesPanelWidth + 2}px)`,
    height: "100%",
    position: "relative",
    backgroundColor: "#F8F9FA",
  };

  return (
    <div style={canvasStyles}>
      <Toolbar
        modeler={modeler}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onZoomReset={handleZoomReset}
        zoomLevel={zoomLevel}
        onSave={handleSave}
        onSaveAs={handleSaveAs}
        onImport={handleImportXml}
        onDeploy={handleDeploy}
      />

      <div
        ref={containerRef}
        className="bpmn-container"
        style={{
          width: "100%",
          height: "calc(100% - 40px)",
          overflow: "hidden",
          background: "radial-gradient(circle, #e2e8f0 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
      />

      <Minimap modeler={modeler} />
    </div>
  );
}
