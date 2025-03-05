import React, { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';

export type LocationItem = {
  id: string;
  title: string;
  coordinates: [number, number];
  emoji: string;
  trending?: boolean;
  type?: string;
};

interface LocationDropdownProps {
  locations: LocationItem[];
  selectedLocation: LocationItem;
  onChange: (location: LocationItem) => void;
  className?: string;
}

export function LocationDropdown({
  locations,
  selectedLocation,
  onChange,
  className = '',
}: LocationDropdownProps) {
  const [searchQuery, setSearchQuery] = useState(selectedLocation.title);
  const [activeSearchQuery, setActiveSearchQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Filter locations based on search input, but only when actively typing
  const filteredLocations = isTyping && activeSearchQuery.trim() !== '' 
    ? locations.filter(loc => 
        loc.title.toLowerCase().includes(activeSearchQuery.toLowerCase()))
    : locations;

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
        setIsTyping(false);
        setActiveSearchQuery("");
        setSearchQuery(selectedLocation.title); // Reset to selected location if clicked outside
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [selectedLocation]);

  // Select a location
  const selectLocation = (location: LocationItem) => {
    onChange(location);
    setSearchQuery(location.title);
    setActiveSearchQuery("");
    setIsTyping(false);
    setShowDropdown(false);
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <div className="relative">
        <Input
          type="text"
          placeholder="Search for a city..."
          className="bg-white/90 backdrop-blur-sm shadow-md text-[#050A14] border-0 pl-9"
          value={isTyping ? activeSearchQuery : searchQuery}
          onChange={(e) => {
            setActiveSearchQuery(e.target.value);
            setIsTyping(true);
            setShowDropdown(true);
          }}
          onFocus={() => {
            setShowDropdown(true);
            setIsTyping(true);
            setActiveSearchQuery(""); // Clear the input when focused for new search
          }}
        />
        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#050A14]/70">
          {selectedLocation.emoji || '🔍'}
        </span>
        
        {showDropdown && (
          <div className="absolute top-full left-0 w-full mt-1 bg-white/95 backdrop-blur-md shadow-lg rounded-md overflow-hidden z-20 border border-[#4ECDC4]/20 max-h-64 overflow-y-auto">
            {filteredLocations.length > 0 ? (
              <>
                {/* Trending Cities Section */}
                {(!isTyping || activeSearchQuery.trim() === '') && (
                  <div className="px-3 py-2">
                    <div className="text-xs font-semibold text-[#050A14]/60 uppercase tracking-wider mb-1">
                      Trending Cities
                    </div>
                    <div className="grid grid-cols-2 gap-1">
                      {filteredLocations.filter(loc => loc.trending).map((location) => (
                        <div 
                          key={location.id} 
                          className={`px-2 py-1.5 rounded cursor-pointer text-[#050A14] hover:bg-[#4ECDC4]/10 flex items-center gap-1.5 ${
                            location.id === selectedLocation.id ? 'bg-[#4ECDC4]/20 font-medium' : ''
                          }`}
                          onClick={() => selectLocation(location)}
                        >
                          <span className="text-lg">{location.emoji}</span>
                          <span className="truncate">{location.title}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* All Cities Section */}
                <div className="px-3 py-2">
                  {(!isTyping || activeSearchQuery.trim() === '') && (
                    <div className="text-xs font-semibold text-[#050A14]/60 uppercase tracking-wider mb-1">
                      All Cities ({locations.length})
                    </div>
                  )}
                  
                  {filteredLocations.map((location) => (
                    <div 
                      key={location.id} 
                      className={`px-3 py-2 cursor-pointer text-[#050A14] hover:bg-[#4ECDC4]/10 flex items-center gap-2 rounded ${
                        location.id === selectedLocation.id ? 'bg-[#4ECDC4]/20 font-medium' : ''
                      }`}
                      onClick={() => selectLocation(location)}
                    >
                      <span className="text-lg">{location.emoji}</span>
                      <span>{location.title}</span>
                      {location.trending && (
                        <span className="ml-auto text-xs px-1.5 py-0.5 bg-[#4ECDC4]/10 text-[#4ECDC4]/90 rounded-full">trending</span>
                      )}
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="px-3 py-2 text-[#050A14]/60 flex items-center gap-2">
                <span>🔍</span>
                <span>No locations found</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 