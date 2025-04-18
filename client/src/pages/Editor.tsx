import { useEffect, useState } from "react";
import { useRoute } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/editor/Header";
import ElementsPanel from "@/components/editor/ElementsPanel";
import Canvas from "@/components/editor/Canvas";
import PropertiesPanel from "@/components/editor/PropertiesPanel";
import { exportSvg, exportPng } from "@/lib/bpmnUtils";

export default function Editor() {
  const [, params] = useRoute("/editor/:id");
  const diagramId = params?.id ? parseInt(params.id, 10) : undefined;

  const { toast } = useToast();
  const [modeler, setModeler] = useState<any>(null);
  const [selectedElement, setSelectedElement] = useState<any>(null);
  const [propertiesPanelWidth, setPropertiesPanelWidth] = useState(320);
  const [elementsPanelWidth, setElementsPanelWidth] = useState(0);
  const [xml, setXml] = useState<string>("");
  const [isDirty, setIsDirty] = useState(false);

  // Fetch diagram if id is provided
  const { data: diagram, isLoading } = useQuery({
    queryKey: diagramId ? [`/api/diagrams/${diagramId}`] : null,
    enabled: !!diagramId,
  });

  // Update diagram mutation
  const updateMutation = useMutation({
    mutationFn: async (data: { xml: string; svg: string }) => {
      if (!diagramId) return null;

      const response = await apiRequest("PUT", `/api/diagrams/${diagramId}`, {
        xml: data.xml,
        svg: data.svg,
      });

      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [`/api/diagrams/${diagramId}`],
      });
      toast({
        title: "Success",
        description: "Diagram has been saved successfully",
      });
      setIsDirty(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save diagram",
        variant: "destructive",
      });
    },
  });

  // Load diagram from backend if diagramId is provided
  useEffect(() => {
    if (diagram && diagram.xml) {
      setXml(diagram.xml);
    }
  }, [diagram]);

  // Set up selection change handler
  useEffect(() => {
    if (modeler) {
      const eventBus = modeler.get("eventBus");

      const onSelectionChanged = (e: any) => {
        const selection = e.newSelection;
        if (selection.length) {
          setSelectedElement(selection[0]);
        } else {
          setSelectedElement(null);
        }
      };

      const onContentChanged = () => {
        setIsDirty(true);
      };

      eventBus.on("selection.changed", onSelectionChanged);
      eventBus.on("elements.changed", contentChanged);
      eventBus.on("element.updateLabel", contentChanged);
      eventBus.on("shape.added", contentChanged);
      eventBus.on("shape.removed", contentChanged);
      eventBus.on("connection.added", contentChanged);
      eventBus.on("connection.removed", contentChanged);

      return () => {
        eventBus.off("selection.changed", onSelectionChanged);
        eventBus.off("elements.changed", contentChanged);
        eventBus.off("element.updateLabel", contentChanged);
        eventBus.off("shape.added", contentChanged);
        eventBus.off("shape.removed", contentChanged);
        eventBus.off("connection.added", contentChanged);
        eventBus.off("connection.removed", contentChanged);
      };
    }

    function contentChanged() {
      setIsDirty(true);
    }
  }, [modeler]);

  const handleSave = async () => {
    if (!modeler || !diagramId) return;

    try {
      // Get SVG
      const svgData = await exportSvg(modeler);

      // Get XML
      const { xml } = await modeler.saveXML({ format: true });

      // Save both to the backend
      updateMutation.mutate({
        xml,
        svg: svgData,
      });
    } catch (error) {
      console.error("Error saving diagram:", error);
      toast({
        title: "Error",
        description: "Failed to save diagram",
        variant: "destructive",
      });
    }
  };

  const handleExportSvg = async () => {
    if (!modeler) return;

    try {
      const svgData = await exportSvg(modeler);

      // Create download link
      const a = document.createElement("a");
      a.href =
        "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svgData);
      a.download = `${diagram?.name || "diagram"}.svg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error exporting SVG:", error);
      toast({
        title: "Error",
        description: "Failed to export SVG",
        variant: "destructive",
      });
    }
  };

  const handleExportPng = async () => {
    if (!modeler) return;

    try {
      const pngData = await exportPng(modeler);

      // Create download link
      const a = document.createElement("a");
      a.href = pngData;
      a.download = `${diagram?.name || "diagram"}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error exporting PNG:", error);
      toast({
        title: "Error",
        description: "Failed to export PNG",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background">
      <Header
        diagram={diagram}
        isDirty={isDirty}
        onSave={handleSave}
        onExportSvg={handleExportSvg}
        onExportPng={handleExportPng}
        isSaving={updateMutation.isPending}
      />

      <div className="flex flex-1 overflow-hidden">
        <Canvas
          xml={xml}
          onModelerInit={setModeler}
          elementsPanelWidth={elementsPanelWidth}
          propertiesPanelWidth={propertiesPanelWidth}
        />

        <PropertiesPanel
          width={propertiesPanelWidth}
          onWidthChange={setPropertiesPanelWidth}
          selectedElement={selectedElement}
          modeler={modeler}
        />
      </div>
    </div>
  );
}
