import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { Json } from "@/integrations/supabase/types";
import { getCoords, getOperationMeta } from "@/lib/publications";

interface MapPub {
  id: string;
  operation_type: string;
  data: Json;
}

interface PublicationsMapProps {
  publications: MapPub[];
  onSelect: (id: string) => void;
}

/** Leaflet map plotting every publication's origin as a tappable pin. */
const PublicationsMap = ({ publications, onSelect }: PublicationsMapProps) => {
  const mapEl = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const layer = useRef<L.LayerGroup>(L.layerGroup());
  const selectRef = useRef(onSelect);
  selectRef.current = onSelect;

  useEffect(() => {
    if (!mapEl.current || map.current) return;
    map.current = L.map(mapEl.current, { center: [-31.4, -64.2], zoom: 7, zoomControl: false });
    L.control.zoom({ position: "bottomright" }).addTo(map.current);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map.current);
    layer.current.addTo(map.current);
    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []);

  useEffect(() => {
    if (!map.current) return;
    layer.current.clearLayers();
    const pts: [number, number][] = [];

    publications.forEach((pub) => {
      const { origin } = getCoords(pub.data, pub.operation_type);
      if (!origin) return;
      const label = getOperationMeta(pub.operation_type).label;
      const icon = L.divIcon({
        className: "",
        html: `<div style="display:flex;align-items:center;justify-content:center;width:30px;height:30px;border-radius:50% 50% 50% 0;background:hsl(0 0% 9%);transform:rotate(-45deg);box-shadow:0 2px 6px rgba(0,0,0,.35);border:2px solid white"><div style="width:8px;height:8px;border-radius:50%;background:white;transform:rotate(45deg)"></div></div>`,
        iconSize: [30, 30],
        iconAnchor: [15, 30],
      });
      const marker = L.marker([origin.lat, origin.lon], { icon })
        .bindTooltip(label, { direction: "top", offset: [0, -28] })
        .on("click", () => selectRef.current(pub.id));
      layer.current.addLayer(marker);
      pts.push([origin.lat, origin.lon]);
    });

    if (pts.length === 1) {
      map.current.setView(pts[0], 11);
    } else if (pts.length > 1) {
      map.current.fitBounds(L.latLngBounds(pts), { padding: [40, 40] });
    }
  }, [publications]);

  return <div ref={mapEl} className="h-full w-full" />;
};

export default PublicationsMap;
