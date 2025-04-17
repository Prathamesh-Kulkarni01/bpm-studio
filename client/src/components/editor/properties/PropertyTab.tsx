import React, { useState } from 'react';
import { TabConfig } from '@/lib/propertyPanelConfig';
import { PropertyField } from './PropertyField';
import { isPropertyVisible, evaluateConditions } from '@/lib/propertyPanelConfig';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface PropertyTabProps {
  tab: TabConfig;
  values: Record<string, any>;
  onChange: (id: string, value: any) => void;
  disabled?: boolean;
  element?: any;
  modeler?: any;
}

/**
 * Component to render a tab of properties in the properties panel
 */
export function PropertyTab({ 
  tab, 
  values, 
  onChange, 
  disabled = false, 
  element,
  modeler
}: PropertyTabProps) {
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filter properties based on conditions and search
  const visibleProperties = tab.properties
    .filter(property => isPropertyVisible(property, values, element, modeler))
    .filter(property => {
      if (!searchQuery) return true;
      
      const label = typeof property.label === 'function' 
        ? property.label(element, values) 
        : property.label;
        
      const description = typeof property.description === 'function'
        ? property.description(element, values)
        : property.description || '';
        
      return label.toLowerCase().includes(searchQuery.toLowerCase()) || 
        description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        property.id.toLowerCase().includes(searchQuery.toLowerCase());
    });

  // Group properties by section if specified
  const groupedProperties: Record<string, typeof visibleProperties> = {};
  
  // Add default group
  groupedProperties['__default__'] = [];
  
  // Group properties by section
  visibleProperties.forEach(property => {
    const section = property.layout?.section || '__default__';
    if (!groupedProperties[section]) {
      groupedProperties[section] = [];
    }
    groupedProperties[section].push(property);
  });
  
  // Sort properties by order within each section if provided
  Object.keys(groupedProperties).forEach(section => {
    groupedProperties[section].sort((a, b) => {
      const orderA = a.layout?.order || 0;
      const orderB = b.layout?.order || 0;
      return orderA - orderB;
    });
  });
  
  // Get all sections in order (default first, then sorted alphabetically)
  const orderedSections = Object.keys(groupedProperties)
    .filter(section => groupedProperties[section].length > 0)
    .sort((a, b) => {
      if (a === '__default__') return -1;
      if (b === '__default__') return 1;
      return a.localeCompare(b);
    });

  if (visibleProperties.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        No properties available for this element
      </div>
    );
  }

  return (
    <>
      {/* Search for properties - only show if we have enough properties */}
      {tab.properties.length > 5 && (
        <div className="px-4 py-2 sticky top-0 bg-white z-10 border-b">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search properties..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>
      )}
      
      <ScrollArea className="flex-1 px-4 py-2">
        {orderedSections.map(section => (
          <div key={section}>
            {/* Section header if not default */}
            {section !== '__default__' && (
              <>
                <h3 className="text-xs font-semibold uppercase text-gray-500 mt-4 mb-2">
                  {section}
                </h3>
                <Separator className="mb-3" />
              </>
            )}
            
            {/* Properties in this section */}
            {groupedProperties[section].map(property => (
              <PropertyField 
                key={property.id}
                property={property}
                value={values[property.id]}
                onChange={onChange}
                disabled={disabled}
                element={element}
                values={values}
                modeler={modeler}
              />
            ))}
          </div>
        ))}
      </ScrollArea>
    </>
  );
}