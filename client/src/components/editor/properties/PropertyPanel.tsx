import React, { useState, useEffect } from 'react';
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
  setPropertyValue 
} from '@/lib/propertyPanelConfig';
import { CircleIcon, XIcon } from 'lucide-react';

interface PropertyPanelProps {
  selectedElement: any;
  modeler: any;
  customConfig?: PropertyPanelConfig;
}

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
      
      // Set initial values for all properties
      allProperties.forEach(property => {
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
  
  // Handle property change
  const handlePropertyChange = (propertyId: string, value: any) => {
    // Update local state
    setPropertyValues(prev => ({
      ...prev,
      [propertyId]: value
    }));
    
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
      {/* Element Type Indicator */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center mr-3">
            <CircleIcon className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="text-sm font-medium">{elementTypeName}</div>
            <div className="text-xs text-gray-500">{elementType}</div>
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
            />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}