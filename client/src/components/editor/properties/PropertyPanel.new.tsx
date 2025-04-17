import React, { useState, useEffect, useMemo } from 'react';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { PropertyTab } from './PropertyTab';
import { 
  PropertyPanelConfig, 
  defaultPanelConfig, 
  isTabVisible, 
  getPropertyValue, 
  setPropertyValue,
  PropertyChangeListener
} from '@/lib/propertyPanelConfig';
import { 
  CircleIcon, 
  SquareIcon, 
  DiamondIcon, 
  XIcon, 
  InfoIcon,
  ChevronRightIcon
} from 'lucide-react';
import {
  HoverCard,
  HoverCardContent, 
  HoverCardTrigger
} from '@/components/ui/hover-card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

interface PropertyPanelProps {
  selectedElement: any;
  modeler: any;
  customConfig?: PropertyPanelConfig;
}

// Get element icon based on type
function getElementIcon(elementType: string) {
  if (elementType.includes('Task') || elementType.includes('Activity')) {
    return <SquareIcon className="h-5 w-5 text-white" />;
  } else if (elementType.includes('Gateway')) {
    return <DiamondIcon className="h-5 w-5 text-white" />;
  } else {
    return <CircleIcon className="h-5 w-5 text-white" />;
  }
}

// Simple debounce function
const debounce = (fn: Function, ms = 300) => {
  let timeoutId: ReturnType<typeof setTimeout>;
  return function(this: any, ...args: any[]) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(this, args), ms);
  };
};

/**
 * Configurable property panel for BPMN elements
 */
export function PropertyPanel({ 
  selectedElement, 
  modeler,
  customConfig
}: PropertyPanelProps) {
  const [activeTab, setActiveTab] = useState('general');
  const [propertyValues, setPropertyValues] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [debouncedUpdateFunctions] = useState<Record<string, Function>>({});
  
  // Use custom config if provided, otherwise use default
  const config = customConfig || defaultPanelConfig;
  
  // Extract element type and business object when selected element changes
  useEffect(() => {
    if (selectedElement && modeler) {
      setIsLoading(true);
      
      const { id, type, businessObject } = selectedElement;
      
      // Initialize properties with current values
      const initialValues: Record<string, any> = {
        id,
        type
      };
      
      // Gather all properties from all tabs
      const allProperties = config.tabs.flatMap(tab => tab.properties);
      
      // Recursively collect all properties, including nested ones
      const collectAllProperties = (properties: any[]): any[] => {
        return properties.flatMap(prop => {
          if (prop.properties) {
            return [prop, ...collectAllProperties(prop.properties)];
          }
          return prop;
        });
      };
      
      const allPropertiesFlattened = collectAllProperties(allProperties);
      
      // Set initial values for all properties
      allPropertiesFlattened.forEach(property => {
        initialValues[property.id] = getPropertyValue(businessObject, property.id);
      });
      
      setPropertyValues(initialValues);
      setIsLoading(false);
      
      // Set the first visible tab as active
      const firstVisibleTab = config.tabs.find(tab => 
        isTabVisible(tab, type, businessObject)
      );
      
      if (firstVisibleTab && firstVisibleTab.id !== activeTab) {
        setActiveTab(firstVisibleTab.id);
      }
    }
  }, [selectedElement, modeler, config]);
  
  // Setup listeners for debounced property changes
  const setupChangeListeners = useMemo(() => {
    // Gather all properties from all tabs, including nested ones
    const allTabs = config.tabs;
    
    // Recursively collect properties with change listeners
    const findPropertiesWithListeners = (properties: any[]): [string, PropertyChangeListener][] => {
      return properties.flatMap(prop => {
        const propListeners: [string, PropertyChangeListener][] = 
          prop.changeListeners?.map((listener: PropertyChangeListener) => [prop.id, listener]) || [];
        
        if (prop.properties) {
          return [...propListeners, ...findPropertiesWithListeners(prop.properties)];
        }
        
        return propListeners;
      });
    };
    
    const allListeners = allTabs.flatMap(tab => 
      findPropertiesWithListeners(tab.properties)
    );
    
    // Setup debounced handlers for each property with listeners
    allListeners.forEach(([propId, listener]) => {
      if (listener.trigger === 'debounced') {
        const debounceTime = listener.debounceTime || 300;
        
        debouncedUpdateFunctions[propId] = debounce((
          newValues: Record<string, any>,
          oldValues: Record<string, any>
        ) => {
          listener.handler(newValues, oldValues, selectedElement, modeler);
        }, debounceTime);
      }
    });
    
    return allListeners;
  }, [config, selectedElement, modeler]);
  
  // Handle property change
  const handlePropertyChange = (propertyId: string, value: any) => {
    const oldValues = { ...propertyValues };
    
    // Update local state
    setPropertyValues(prev => {
      const newValues = {
        ...prev,
        [propertyId]: value
      };
      
      // Process immediate change listeners 
      const allTabs = config.tabs;
      
      // Recursively find the property with this ID
      const findPropertyById = (properties: any[]): any => {
        for (const prop of properties) {
          if (prop.id === propertyId) {
            return prop;
          }
          
          if (prop.properties) {
            const found = findPropertyById(prop.properties);
            if (found) return found;
          }
        }
        return null;
      };
      
      const property = allTabs.flatMap(tab => tab.properties)
        .flatMap(prop => [prop, ...(prop.properties || [])])
        .find(p => p.id === propertyId);
      
      if (property?.changeListeners) {
        property.changeListeners.forEach(listener => {
          if (listener.trigger === 'immediate') {
            const watchedValues: Record<string, any> = {};
            
            listener.watch.forEach(field => {
              watchedValues[field] = field === propertyId ? value : prev[field];
            });
            
            listener.handler(watchedValues, oldValues, selectedElement, modeler);
          } else if (listener.trigger === 'debounced' && debouncedUpdateFunctions[propertyId]) {
            const watchedValues: Record<string, any> = {};
            
            listener.watch.forEach(field => {
              watchedValues[field] = field === propertyId ? value : prev[field];
            });
            
            debouncedUpdateFunctions[propertyId](watchedValues, oldValues);
          }
        });
      }
      
      return newValues;
    });
    
    // Update the model through the modeling module
    if (selectedElement && modeler) {
      setPropertyValue(selectedElement, propertyId, value, modeler);
    }
  };
  
  // If no element is selected, show empty state
  if (!selectedElement) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500">
        No element selected
      </div>
    );
  }
  
  // Get the readable type name
  const elementType = propertyValues.type || '';
  const elementTypeName = elementType.replace('bpmn:', '');
  
  // Filter tabs that should be visible for this element
  const visibleTabs = config.tabs.filter(tab => 
    isTabVisible(tab, elementType, selectedElement.businessObject)
  );
  
  if (visibleTabs.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500">
        No properties available for this element type
      </div>
    );
  }
  
  return (
    <div className="flex flex-col h-full">
      {/* Element Type Indicator with Quick Element Actions */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center mr-3">
              {getElementIcon(elementType)}
            </div>
            <div>
              <div className="text-sm font-medium flex items-center gap-2">
                {elementTypeName}
                {selectedElement.businessObject.name && (
                  <Badge variant="outline" className="ml-1">
                    {selectedElement.businessObject.name}
                  </Badge>
                )}
              </div>
              <div className="text-xs text-gray-500">{elementType}</div>
            </div>
          </div>
          
          <div className="flex space-x-1">
            <HoverCard>
              <HoverCardTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7">
                  <InfoIcon className="h-4 w-4" />
                </Button>
              </HoverCardTrigger>
              <HoverCardContent className="w-80 p-4">
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold">{elementTypeName} Information</h4>
                  <Separator />
                  <div className="text-xs space-y-1">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">ID:</span>
                      <span className="font-mono">{selectedElement.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Type:</span>
                      <span>{elementType}</span>
                    </div>
                    {selectedElement.businessObject.documentation && selectedElement.businessObject.documentation.length > 0 && (
                      <div className="pt-2">
                        <span className="text-muted-foreground block mb-1">Documentation:</span>
                        <p className="text-xs bg-muted p-2 rounded">
                          {selectedElement.businessObject.documentation[0].text}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </HoverCardContent>
            </HoverCard>
          </div>
        </div>
      </div>
      
      {/* Tabs for different property categories */}
      <Tabs 
        value={activeTab} 
        onValueChange={setActiveTab} 
        className="flex-1 flex flex-col"
      >
        <TabsList className="px-2 justify-start border-b rounded-none">
          {visibleTabs.map(tab => (
            <TabsTrigger 
              key={tab.id} 
              value={tab.id}
              className="data-[state=active]:border-primary data-[state=active]:text-primary"
            >
              {tab.icon && <span className="mr-2">{tab.icon}</span>}
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
        
        {visibleTabs.map(tab => (
          <TabsContent 
            key={tab.id} 
            value={tab.id} 
            className="flex-1 mt-0"
          >
            <PropertyTab 
              tab={tab}
              values={propertyValues}
              onChange={handlePropertyChange}
              disabled={isLoading}
              element={selectedElement}
              modeler={modeler}
            />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}