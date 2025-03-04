"use client";

import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import { Icon, LatLngExpression } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Skeleton } from '@/components/ui/skeleton';

// Map component specifically for the dashboard
export function DashboardMap({ 
  userLocation = [-122.4194, 37.7749] as LatLngExpression, // Default to SF
  userInterests = [],
  spots = []
}: { 
  userLocation?: LatLngExpression,
  userInterests?: string[],
  spots?: any[]
}) {
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    // Set map as loaded after component mounts
    setMapLoaded(true);
  }, []);

  if (!mapLoaded) {
    return <Skeleton className="h-[400px] w-full rounded-lg" />;
  }

  return (
    <div className="w-full h-[400px] rounded-lg overflow-hidden border">
      <MapContainer 
        center={userLocation} 
        zoom={13} 
        style={{ height: '100%', width: '100%' }} 
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* User location marker */}
        <Circle 
          center={userLocation}
          radius={300}
          pathOptions={{ fillColor: '#3b82f6', color: '#2563eb', weight: 2, fillOpacity: 0.6 }}
        >
          <Popup>
            <div className="p-2">
              <h3 className="font-medium">Your Location</h3>
            </div>
          </Popup>
        </Circle>

        {/* Spot markers */}
        {spots.map((spot, index) => (
          <Circle
            key={spot.id || index}
            center={spot.coordinates || [
              (userLocation as [number, number])[0] + (Math.random() * 0.02 - 0.01), 
              (userLocation as [number, number])[1] + (Math.random() * 0.02 - 0.01)
            ]}
            radius={200}
            pathOptions={{ 
              fillColor: spot.color || '#f97316', 
              color: '#fdba74', 
              weight: 2, 
              fillOpacity: 0.7 
            }}
          >
            <Popup>
              <div className="p-2">
                <h3 className="font-medium">{spot.name}</h3>
                <p className="text-sm text-gray-600">{spot.description || spot.type}</p>
                {spot.tags && (
                  <div className="flex gap-1 mt-1 flex-wrap">
                    {spot.tags.map((tag: string, i: number) => (
                      <span key={i} className="text-xs px-2 py-1 bg-gray-100 rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </Popup>
          </Circle>
        ))}
      </MapContainer>
    </div>
  );
} 