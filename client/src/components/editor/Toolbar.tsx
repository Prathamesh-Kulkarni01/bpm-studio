import { 
  MousePointer, 
  Play, 
  Square, 
  Copy, 
  Clipboard, 
  Wand2, 
  UserPlus, 
  Filter, 
  ArrowLeft, 
  ArrowRight, 
  Search, 
  Minus, 
  Plus,
  Save,
  Upload,
  Download,
  Rocket,
  Settings
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { exportSvg, exportPng } from "@/lib/bpmnUtils";
import { useRef, useState } from "react";

interface ToolbarProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomReset: () => void;
  zoomLevel: number;
  modeler?: any;
  onSave?: () => void;
  onSaveAs?: () => void;
  onImport?: (xml: string) => void;
  onExport?: (format: "xml" | "svg" | "png") => void;
  onDeploy?: () => void;
}

export default function Toolbar({ 
  onZoomIn, 
  onZoomOut, 
  onZoomReset, 
  zoomLevel,
  modeler,
  onSave,
  onSaveAs,
  onImport,
  onExport,
  onDeploy
}: ToolbarProps) {
  const [importXml, setImportXml] = useState<string>("");
  const [exportFormat, setExportFormat] = useState<"xml" | "svg" | "png">("xml");
  const [exportData, setExportData] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setImportXml(content);
      };
      reader.readAsText(file);
    }
  };

  const handleImportXml = () => {
    if (importXml && onImport) {
      onImport(importXml);
      setImportXml("");
    }
  };

  const handleExport = async (format: "xml" | "svg" | "png") => {
    if (!modeler) return;
    
    let exportedData = "";
    try {
      if (format === "svg") {
        exportedData = await exportSvg(modeler);
      } else if (format === "png") {
        exportedData = await exportPng(modeler);
      } else {
        // XML export
        modeler.saveXML({ format: true }, (err: Error, xml: string) => {
          if (err) {
            console.error("Error exporting XML", err);
            return;
          }
          setExportData(xml);
          setExportFormat("xml");
        });
        return;
      }
      
      setExportData(exportedData);
      setExportFormat(format);
    } catch (error) {
      console.error(`Error exporting as ${format}`, error);
    }
  };

  const downloadExport = () => {
    if (!exportData) return;
    
    const element = document.createElement("a");
    let mimeType = "application/xml";
    let fileExtension = "bpmn";
    let dataUrl = `data:${mimeType};charset=UTF-8,${encodeURIComponent(exportData)}`;
    
    if (exportFormat === "svg") {
      mimeType = "image/svg+xml";
      fileExtension = "svg";
      dataUrl = `data:${mimeType};charset=UTF-8,${encodeURIComponent(exportData)}`;
    } else if (exportFormat === "png") {
      mimeType = "image/png";
      fileExtension = "png";
      dataUrl = exportData; // For PNG, we already have a data URL
    }
    
    element.setAttribute("href", dataUrl);
    element.setAttribute("download", `diagram.${fileExtension}`);
    element.style.display = "none";
    
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };
  return (
    <div className="bg-white border-b border-gray-200 py-1 px-4 flex items-center justify-between">
      <div className="flex items-center space-x-3">
        {/* File Menu */}
        <div className="flex space-x-1">
          <Dialog>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center gap-1 h-8 px-2">
                  <span>File</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem onClick={onSave} disabled={!onSave}>
                  <Save className="mr-2 h-4 w-4" />
                  <span>Save</span>
                </DropdownMenuItem>
                
                <DropdownMenuItem onClick={onSaveAs} disabled={!onSaveAs}>
                  <Save className="mr-2 h-4 w-4" />
                  <span>Save As...</span>
                </DropdownMenuItem>
                
                <DropdownMenuSeparator />
                
                <DialogTrigger asChild>
                  <DropdownMenuItem>
                    <Upload className="mr-2 h-4 w-4" />
                    <span>Import BPMN</span>
                  </DropdownMenuItem>
                </DialogTrigger>
                
                <DropdownMenuSeparator />
                
                <DropdownMenuItem onClick={() => handleExport("xml")} disabled={!modeler}>
                  <Download className="mr-2 h-4 w-4" />
                  <span>Export as BPMN</span>
                </DropdownMenuItem>
                
                <DropdownMenuItem onClick={() => handleExport("svg")} disabled={!modeler}>
                  <Download className="mr-2 h-4 w-4" />
                  <span>Export as SVG</span>
                </DropdownMenuItem>
                
                <DropdownMenuItem onClick={() => handleExport("png")} disabled={!modeler}>
                  <Download className="mr-2 h-4 w-4" />
                  <span>Export as PNG</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            {/* Import Dialog */}
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Import BPMN</DialogTitle>
                <DialogDescription>
                  Import a BPMN 2.0 XML file to load into the editor.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="flex flex-col space-y-2">
                  <Label>Select File</Label>
                  <Input
                    type="file"
                    accept=".bpmn,.xml"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="mb-3"
                  />
                  <Label>Or paste XML</Label>
                  <Textarea
                    value={importXml}
                    onChange={(e) => setImportXml(e.target.value)}
                    placeholder="Paste BPMN XML here..."
                    className="min-h-[200px] font-mono text-sm"
                  />
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline" className="mr-2">Cancel</Button>
                </DialogClose>
                <Button onClick={handleImportXml} disabled={!importXml}>
                  Import
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          {/* Export Dialog */}
          <Dialog open={!!exportData} onOpenChange={(open) => !open && setExportData("")}>
            <DialogContent className="sm:max-w-xl">
              <DialogHeader>
                <DialogTitle>Export Diagram</DialogTitle>
                <DialogDescription>
                  {exportFormat === 'xml' ? 'BPMN 2.0 XML definition' : 
                  exportFormat === 'svg' ? 'SVG Vector Image' : 'PNG Image'}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                {exportFormat === 'xml' && (
                  <Textarea
                    value={exportData}
                    readOnly
                    className="min-h-[300px] font-mono text-sm"
                  />
                )}
                
                {exportFormat === 'svg' && (
                  <div className="border border-gray-200 p-2 rounded">
                    <div className="max-h-[300px] overflow-auto" dangerouslySetInnerHTML={{ __html: exportData }} />
                  </div>
                )}
                
                {exportFormat === 'png' && (
                  <div className="border border-gray-200 p-2 rounded">
                    <img src={exportData} alt="Exported Diagram" className="max-h-[300px] mx-auto" />
                  </div>
                )}
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline" className="mr-2">Close</Button>
                </DialogClose>
                <Button onClick={downloadExport}>
                  Download
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          {/* Quick Save Button */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8" 
                  onClick={onSave}
                  disabled={!onSave}
                >
                  <Save className="h-4 w-4 text-gray-600" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Save (Ctrl+S)</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          {/* Deploy Button */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8" 
                  onClick={onDeploy}
                  disabled={!onDeploy}
                >
                  <Rocket className="h-4 w-4 text-gray-600" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Deploy Process</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          {/* Settings Button */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Settings className="h-4 w-4 text-gray-600" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Process Settings</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <Separator orientation="vertical" className="h-5" />

        <div className="flex space-x-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MousePointer className="h-4 w-4 text-gray-600" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Select Tool (S)</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Play className="h-4 w-4 text-gray-600" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Hand Tool (H)</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Square className="h-4 w-4 text-gray-600" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Lasso Tool (L)</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <Separator orientation="vertical" className="h-5" />

        <div className="flex space-x-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Copy className="h-4 w-4 text-gray-600" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Copy (Ctrl+C)</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Clipboard className="h-4 w-4 text-gray-600" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Paste (Ctrl+V)</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <ArrowLeft className="h-4 w-4 text-gray-600" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Undo (Ctrl+Z)</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <ArrowRight className="h-4 w-4 text-gray-600" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Redo (Ctrl+Y)</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <Separator orientation="vertical" className="h-5" />

        <div className="flex items-center space-x-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onZoomReset}>
                  <Search className="h-4 w-4 text-gray-600" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Reset Zoom</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <div className="flex items-center bg-gray-100 rounded">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-r-none" onClick={onZoomOut}>
                    <Minus className="h-4 w-4 text-gray-600" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Zoom Out</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <span className="px-2 text-sm">{Math.round(zoomLevel * 100)}%</span>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-l-none" onClick={onZoomIn}>
                    <Plus className="h-4 w-4 text-gray-600" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Zoom In</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </div>
    </div>
  );
}
