"use client";

import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { cn } from '@/lib/utils';

// Default San Francisco coordinates
const DEFAULT_CENTER: [number, number] = [-122.4194, 37.7749];

interface MapViewProps {
  center?: [number, number];
  zoom?: number;
  markers?: Array<{
    id: string;
    name: string;
    description?: string;
    coordinates: [number, number];
    category?: string;
    color?: string;
  }>;
  onMarkerClick?: (markerId: string) => void;
  className?: string;
  interactive?: boolean;
  controls?: boolean;
  style?: 'light' | 'dark' | 'streets' | 'outdoors' | 'satellite';
}

export function MapView({
  center = DEFAULT_CENTER,
  zoom = 12,
  markers = [],
  onMarkerClick,
  className,
  interactive = true,
  controls = true,
  style = 'light',
}: MapViewProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<{ [id: string]: mapboxgl.Marker }>({});
  const [loaded, setLoaded] = useState(false);

  // Style options to choose from
  const mapStyles = {
    light: 'mapbox://styles/mapbox/light-v11',
    dark: 'mapbox://styles/mapbox/dark-v11',
    streets: 'mapbox://styles/mapbox/streets-v12',
    outdoors: 'mapbox://styles/mapbox/outdoors-v12',
    satellite: 'mapbox://styles/mapbox/satellite-streets-v12',
  };

  // Initialize map on first render
  useEffect(() => {
    if (map.current || !mapContainer.current) return;
    
    // Set the access token from environment variable
    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';
    
    // Create a new map
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: mapStyles[style],
      center,
      zoom,
      interactive,
      attributionControl: false,
    });
    
    // Add controls if requested
    if (controls) {
      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
      map.current.addControl(
        new mapboxgl.GeolocateControl({
          positionOptions: { enableHighAccuracy: true },
          trackUserLocation: true,
        }),
        'top-right'
      );
    }
    
    // Add a scale control
    map.current.addControl(new mapboxgl.ScaleControl(), 'bottom-left');
    
    // Set loaded state when map is ready
    map.current.on('load', () => {
      setLoaded(true);
    });
    
    // Clean up on unmount
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [center, zoom, interactive, controls, style]);
  
  // Update markers when they change
  useEffect(() => {
    if (!map.current || !loaded) return;
    
    // Clear existing markers
    Object.values(markersRef.current).forEach(marker => marker.remove());
    markersRef.current = {};
    
    // Add new markers
    markers.forEach(marker => {
      // Create a marker element
      const el = document.createElement('div');
      el.className = 'map-marker';
      el.style.backgroundColor = marker.color || '#4ECDC4';
      
      // Add the marker to the map
      const markerObj = new mapboxgl.Marker(el)
        .setLngLat(marker.coordinates)
        .addTo(map.current!);
      
      // Add popup with information
      if (marker.name) {
        const popup = new mapboxgl.Popup({ offset: 25, closeButton: false })
          .setHTML(`
            <div class="marker-popup">
              <strong>${marker.name}</strong>
              ${marker.description ? `<p>${marker.description}</p>` : ''}
            </div>
          `);
        
        markerObj.setPopup(popup);
      }
      
      // Add click handler
      if (onMarkerClick) {
        el.addEventListener('click', () => {
          onMarkerClick(marker.id);
        });
      }
      
      // Store the marker reference
      markersRef.current[marker.id] = markerObj;
    });
  }, [markers, loaded, onMarkerClick]);
  
  // Update map center and zoom when props change
  useEffect(() => {
    if (!map.current || !loaded) return;
    
    map.current.flyTo({
      center,
      zoom,
      essential: true, // This ensures the animation is considered essential (not skippable)
    });
  }, [center, zoom, loaded]);
  
  // Update map style when it changes
  useEffect(() => {
    if (!map.current || !loaded) return;
    
    map.current.setStyle(mapStyles[style]);
  }, [style, loaded]);

  return (
    <div 
      ref={mapContainer} 
      className={cn("min-h-[300px] w-full rounded-md overflow-hidden", className)}
    />
  );
}

// Add CSS for map-related components
export function mapStyles() {
  return `
    .map-marker {
      width: 20px;
      height: 20px;
      border-radius: 50%;
      cursor: pointer;
      box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.5);
      transition: transform 0.2s ease;
    }
    
    .map-marker:hover {
      transform: scale(1.2);
    }
    
    .marker-popup {
      padding: 8px;
      font-family: system-ui, -apple-system, sans-serif;
    }
    
    .marker-popup strong {
      display: block;
      margin-bottom: 4px;
    }
    
    .marker-popup p {
      margin: 0;
      font-size: 0.875rem;
      opacity: 0.8;
    }
    
    .mapboxgl-popup {
      max-width: 200px;
    }
    
    .mapboxgl-popup-content {
      padding: 10px;
      border-radius: 8px;
    }
    
    .mapboxgl-popup-close-button {
      font-size: 16px;
      color: #666;
    }
  `;
} 