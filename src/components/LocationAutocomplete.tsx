import { useState, useRef, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { MapPin, Loader2, Navigation } from "lucide-react";

interface NominatimResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
}

interface LocationAutocompleteProps {
  value: string;
  onChange: (value: string, coords?: { lat: number; lon: number }) => void;
  placeholder?: string;
  label?: string;
  enableCurrentLocation?: boolean;
}

const LocationAutocomplete = ({ value, onChange, placeholder, label, enableCurrentLocation }: LocationAutocompleteProps) => {
  const [suggestions, setSuggestions] = useState<NominatimResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const containerRef = useRef<HTMLDivElement>(null);

  const coordsRegex = /^(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)$/;

  const reverseGeocode = useCallback(async (lat: number, lon: number) => {
    setLoading(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`
      );
      const data = await res.json();
      if (data.display_name) {
        setSuggestions([{ place_id: data.place_id, display_name: data.display_name, lat: String(lat), lon: String(lon) }]);
        setOpen(true);
      }
    } catch {
      onChange(`${lat}, ${lon}`, { lat, lon });
    } finally {
      setLoading(false);
    }
  }, [onChange]);

  const search = useCallback(async (query: string) => {
    const match = query.trim().match(coordsRegex);
    if (match) {
      const lat = parseFloat(match[1]);
      const lon = parseFloat(match[2]);
      if (lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180) {
        reverseGeocode(lat, lon);
        return;
      }
    }

    if (query.length < 3) {
      setSuggestions([]);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=5&countrycodes=ar`
      );
      const data: NominatimResult[] = await res.json();
      setSuggestions(data);
      setOpen(data.length > 0);
    } catch {
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  }, [reverseGeocode]);

  const handleInput = (val: string) => {
    onChange(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(val), 400);
  };

  const handleSelect = (item: NominatimResult) => {
    onChange(item.display_name, { lat: parseFloat(item.lat), lon: parseFloat(item.lon) });
    setOpen(false);
    setSuggestions([]);
  };

  const useMyLocation = () => {
    if (!navigator.geolocation) {
      setGeoError("Tu navegador no soporta geolocalización");
      return;
    }
    setGeoError("");
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lon } = pos.coords;
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`
          );
          const data = await res.json();
          onChange(data.display_name || `${lat}, ${lon}`, { lat, lon });
        } catch {
          onChange(`${lat.toFixed(4)}, ${lon.toFixed(4)}`, { lat, lon });
        } finally {
          setGeoLoading(false);
        }
      },
      () => {
        setGeoError("No pudimos obtener tu ubicación. Revisá los permisos.");
        setGeoLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={containerRef} className="relative mb-4">
      {label && <label className="text-sm font-medium text-foreground mb-1 block">{label}</label>}
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={value}
          onChange={(e) => handleInput(e.target.value)}
          placeholder={placeholder || "Buscar ubicación o coordenadas (-31.4, -64.1)..."}
          className="pl-9 pr-9"
          onFocus={() => suggestions.length > 0 && setOpen(true)}
        />
        {loading && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />}
      </div>

      {enableCurrentLocation && (
        <>
          <button
            type="button"
            onClick={useMyLocation}
            disabled={geoLoading}
            className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-primary disabled:opacity-50 tap-scale"
          >
            {geoLoading
              ? <Loader2 className="h-3 w-3 animate-spin" />
              : <Navigation className="h-3 w-3" />}
            {geoLoading ? "Obteniendo ubicación..." : "Usar mi ubicación actual"}
          </button>
          {geoError && <p className="mt-1 text-xs text-destructive">{geoError}</p>}
        </>
      )}

      {open && suggestions.length > 0 && (
        <ul className="absolute z-[9999] mt-1 w-full bg-popover border border-border rounded-md shadow-xl max-h-48 overflow-y-auto">
          {suggestions.map((s) => (
            <li
              key={s.place_id}
              className="px-3 py-2.5 text-sm cursor-pointer hover:bg-accent hover:text-accent-foreground"
              onClick={() => handleSelect(s)}
            >
              <MapPin className="inline h-3 w-3 mr-1.5 text-muted-foreground flex-shrink-0" />
              <span className="line-clamp-2">{s.display_name}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default LocationAutocomplete;
