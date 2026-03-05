import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface Coords {
  lat: number;
  lon: number;
}

interface RouteMapProps {
  origin?: Coords;
  destination?: Coords;
  className?: string;
}

const RouteMap = ({ origin, destination, className }: RouteMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const routeLayer = useRef<L.LayerGroup>(L.layerGroup());
  const [distance, setDistance] = useState<string>("");
  const [duration, setDuration] = useState<string>("");

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    mapInstance.current = L.map(mapRef.current, {
      center: [-34.6, -58.4],
      zoom: 5,
      zoomControl: true,
      attributionControl: true,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(mapInstance.current);

    routeLayer.current.addTo(mapInstance.current);

    return () => {
      mapInstance.current?.remove();
      mapInstance.current = null;
    };
  }, []);

  // Update markers and route
  useEffect(() => {
    if (!mapInstance.current) return;
    routeLayer.current.clearLayers();
    setDistance("");
    setDuration("");

    const markerIcon = (color: string) =>
      L.divIcon({
        html: `<div style="background:${color};width:14px;height:14px;border-radius:50%;border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,.3)"></div>`,
        className: "",
        iconSize: [14, 14],
        iconAnchor: [7, 7],
      });

    if (origin) {
      L.marker([origin.lat, origin.lon], { icon: markerIcon("hsl(142, 71%, 45%)") })
        .bindPopup("Origen")
        .addTo(routeLayer.current);
    }

    if (destination) {
      L.marker([destination.lat, destination.lon], { icon: markerIcon("hsl(0, 84%, 60%)") })
        .bindPopup("Destino")
        .addTo(routeLayer.current);
    }

    if (origin && destination) {
      const bounds = L.latLngBounds([origin.lat, origin.lon], [destination.lat, destination.lon]);
      mapInstance.current.fitBounds(bounds, { padding: [40, 40] });

      // Fetch route from OSRM
      fetch(
        `https://router.project-osrm.org/route/v1/driving/${origin.lon},${origin.lat};${destination.lon},${destination.lat}?overview=full&geometries=geojson`
      )
        .then((r) => r.json())
        .then((data) => {
          if (data.routes && data.routes[0]) {
            const route = data.routes[0];
            const coords = route.geometry.coordinates.map((c: number[]) => [c[1], c[0]] as [number, number]);
            L.polyline(coords, { color: "hsl(217, 91%, 60%)", weight: 4, opacity: 0.8 }).addTo(routeLayer.current);

            const km = (route.distance / 1000).toFixed(0);
            const hrs = Math.floor(route.duration / 3600);
            const mins = Math.round((route.duration % 3600) / 60);
            setDistance(`${km} km`);
            setDuration(hrs > 0 ? `${hrs}h ${mins}min` : `${mins} min`);
          }
        })
        .catch(() => {});
    } else if (origin) {
      mapInstance.current.setView([origin.lat, origin.lon], 12);
    } else if (destination) {
      mapInstance.current.setView([destination.lat, destination.lon], 12);
    }
  }, [origin, destination]);

  return (
    <div className={className}>
      <div ref={mapRef} className="w-full h-[250px] rounded-lg border border-border overflow-hidden" />
      {distance && duration && (
        <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
          <span>📍 {distance}</span>
          <span>🕐 {duration}</span>
        </div>
      )}
    </div>
  );
};

export default RouteMap;
