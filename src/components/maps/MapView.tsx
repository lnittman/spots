'use client';

import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { cn } from '@/lib/utils';

// Set a public token that can be used for demo purposes
// In production, this should be an environment variable
mapboxgl.accessToken = 'pk.eyJ1IjoibHVrZW5pdHRtYW5uIiwiYSI6ImNtN3U1d2piYjAwdTQya29tYXdhNmt2ZDIifQ.WvzSjHYbZB1v3aFaLAbo0Q';

interface MapViewProps {
  center: [number, number];
  zoom?: number;
  markers?: Array<{
    id: string;
    coordinates: [number, number];
    title: string;
    type?: string;
  }>;
  className?: string;
  onMarkerClick?: (id: string) => void;
  interactive?: boolean;
}

export function MapView({
  center,
  zoom = 13,
  markers = [],
  className,
  onMarkerClick,
  interactive = true,
}: MapViewProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<mapboxgl.Map | null>(null);
  const markerRefs = useRef<{ [id: string]: mapboxgl.Marker }>({});
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    try {
      const mapInstance = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: 'mapbox://styles/mapbox/navigation-day-v1', // Use a lighter, navigation-focused style
        center,
        zoom,
        interactive,
        attributionControl: false, // Hide default attribution
      });

      // Add custom attribution
      mapInstance.addControl(new mapboxgl.AttributionControl({
        compact: true
      }), 'bottom-right');

      if (interactive) {
        // Custom styled navigation control
        mapInstance.addControl(new mapboxgl.NavigationControl({
          showCompass: false,
          visualizePitch: false
        }), 'top-right');
        
        // Add geolocation control
        mapInstance.addControl(new mapboxgl.GeolocateControl({
          positionOptions: {
            enableHighAccuracy: true
          },
          trackUserLocation: true,
          showAccuracyCircle: false
        }));
      }

      // Add custom styling to ensure map is visible
      mapContainerRef.current.style.backgroundColor = '#e0e0e0';

      // Ensure map loaded properly
      mapInstance.on('load', () => {
        console.log('Map loaded successfully');
        // Force resize to ensure proper rendering
        mapInstance.resize();
        setIsLoaded(true);
      });

      // Handle map load error
      mapInstance.on('error', (e) => {
        console.error('Map load error:', e);
      });

      setMap(mapInstance);

      return () => {
        mapInstance.remove();
      };
    } catch (error) {
      console.error('Error initializing map:', error);
    }
  }, []);

  // Update map center and zoom when props change with smooth animation
  useEffect(() => {
    if (!map || !isLoaded) return;
    
    map.flyTo({
      center: center,
      zoom: zoom,
      essential: true,
      duration: 1000, // Animation duration in milliseconds
      easing: (t) => t * (2 - t) // Easing function for smooth animation
    });
    
  }, [map, center, zoom, isLoaded]);

  // Add markers to map
  useEffect(() => {
    if (!map || !isLoaded) return;

    // Clear existing markers
    Object.values(markerRefs.current).forEach(marker => marker.remove());
    markerRefs.current = {};

    // Add new markers
    markers.forEach(marker => {
      const el = document.createElement('div');
      el.className = 'marker';
      el.style.backgroundColor = getMarkerColor(marker.type);
      el.style.width = '22px';
      el.style.height = '22px';
      el.style.borderRadius = '50%';
      el.style.cursor = 'pointer';
      el.style.border = '2px solid white';
      el.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
      el.style.transition = 'transform 0.2s ease';
      el.setAttribute('aria-label', marker.title);
      el.setAttribute('role', 'button');
      el.setAttribute('tabindex', '0');

      // Add hover effect
      el.addEventListener('mouseenter', () => {
        el.style.transform = 'scale(1.1)';
      });
      
      el.addEventListener('mouseleave', () => {
        el.style.transform = 'scale(1)';
      });

      try {
        const mapboxMarker = new mapboxgl.Marker(el)
          .setLngLat(marker.coordinates)
          .setPopup(new mapboxgl.Popup({
            closeButton: false,
            className: 'custom-popup',
            offset: 15,
            maxWidth: '250px'
          }).setHTML(`
            <div style="padding: 5px; font-family: 'IosevkaTerm', monospace;">
              <h3 style="font-size: 14px; font-weight: bold; margin-bottom: 4px;">${marker.title}</h3>
              <div style="font-size: 12px; opacity: 0.7;">Click to explore</div>
            </div>
          `))
          .addTo(map);

        if (onMarkerClick) {
          el.addEventListener('click', () => onMarkerClick(marker.id));
          el.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              onMarkerClick(marker.id);
            }
          });
        }

        markerRefs.current[marker.id] = mapboxMarker;
      } catch (error) {
        console.error('Error adding marker:', error);
      }
    });
  }, [map, markers, onMarkerClick, isLoaded]);

  return (
    <div className="relative">
      <div 
        ref={mapContainerRef} 
        className={cn('w-full h-80 rounded-lg overflow-hidden', className)}
        aria-label="Interactive map"
        style={{ backgroundColor: '#e0e0e0' }} // Fallback color in case map doesn't load
      />
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/10 backdrop-blur-sm rounded-lg">
          <div className="animate-pulse text-white/70 text-sm">Loading map...</div>
        </div>
      )}
    </div>
  );
}

function getMarkerColor(type?: string): string {
  switch (type) {
    case 'restaurant':
      return '#FF6B6B';
    case 'cafe':
      return '#f59e0b';
    case 'museum':
      return '#4ECDC4';
    case 'park':
      return '#AAC789';
    case 'shopping':
      return '#FFD166';
    case 'city':
      return '#1A535C';
    default:
      return '#4ECDC4';
  }
} 