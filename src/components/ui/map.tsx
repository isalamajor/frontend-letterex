"use client";

import { MapContainer, TileLayer, GeoJSON, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useMemo } from "react";
import { feature } from "topojson-client";
import { Topology } from "topojson-specification";
import worldData from "world-atlas/countries-110m.json";
import L, { geoJSON } from "leaflet";
import { Combobox } from "@/components/ui/combobox";


interface CountryFeature {
  type: "Feature";
  properties: { name: string; [key: string]: any };
  geometry: any;
}

interface MapProps {
    selectedCountry: string;
    editing: boolean;
    onCountryChange: (country: string) => void;
  }

// Componente que centra el mapa en un GeoJSON
function FitBounds({ geoJson }: { geoJson: GeoJSON.FeatureCollection }) {
  const map = useMap();

  useEffect(() => {
    if (!map) return;
    // Solo manipula el mapa si está definido
    const pane = map.getPane("overlayPane");
    if (pane) {
      // Tu lógica aquí
    }
  }, [map]);

  useMemo(() => {
    if (geoJson.features.length === 0) return;

    const layer = L.geoJSON(geoJson as any);
    map.fitBounds(layer.getBounds(), { padding: [20, 20] });
  }, [geoJson, map]);

  return null;
}

export default function Mapa({ selectedCountry, editing, onCountryChange }: MapProps) {
  
  // Convertir TopoJSON → GeoJSON
  const countries = useMemo(() => {
    const topo: Topology = worldData as any;
    return feature(topo, topo.objects.countries) as GeoJSON.FeatureCollection;
  }, []);

  // Manejar cambio de país
  const handleCountryChange = (country: string) => {
    if (editing) {
      // Si estamos en modo de edición, actualizamos el país seleccionado
      onCountryChange?.(country);
    }
  };

  // País seleccionado
  const highlighted = useMemo(() => {
    return {
      type: "FeatureCollection" as const, 
      features: (countries.features as CountryFeature[]).filter(
        (f) => f.properties.name === selectedCountry
      ),
    };
  }, [countries, selectedCountry]);
  
  
    if (typeof window === "undefined") {
    return null;
    }
  return (
    <div className="relative h-[500px] w-full rounded-xl overflow-hidden shadow-lg z-0">
      <MapContainer
        center={[20, 0]} // inicial, se ajustará automáticamente
        zoom={2}
        minZoom={2}
        maxZoom={18}
        className="h-full w-full"
        attributionControl={false}
        maxBounds={[
          [-85, -180],
          [85, 180],
        ]}
        maxBoundsViscosity={1.0}
      >
        {/* Fondo gris */}
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png"
          subdomains={["a", "b", "c", "d"]}
          maxZoom={20}
        />
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png"
          subdomains={["a", "b", "c", "d"]}
          maxZoom={20}
        />

        {/* País resaltado */}
        <GeoJSON
        key={selectedCountry}
          data={highlighted as any}
          style={{
            fillColor: "#8EBA03",
            color: "#8EBA03",
            weight: 2,
          }}
        />

        {/* Centrar mapa automáticamente en el país */}
        <FitBounds geoJson={highlighted} />
      </MapContainer>
        {editing ? 
        <div className="absolute top-4 right-4 bg-white text-black p-1 rounded shadow-md z-500">
          <Combobox placeholder="Select a country" width={256} onChange={(value) => onCountryChange(value)}>
            <Combobox.Input />
           <Combobox.List >
            {countries.features.map((country) =>
              country.properties && country.properties.name ? (
                <Combobox.Option key={country.properties.name} value={country.properties.name}>
                  {country.properties.name}
                </Combobox.Option>
              ) : null
            )}
          </Combobox.List>
          </Combobox>
        </div>
        : 
        <div className="absolute top-4 right-4 bg-white text-black px-3 py-1 rounded shadow-md z-500">
        📍 {selectedCountry} </div>
        }
        
    </div>
  );
}
