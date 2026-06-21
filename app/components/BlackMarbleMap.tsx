"use client";

/**
 * BlackMarbleMap.tsx
 *
 * Inner Leaflet component — always imported with { ssr: false }.
 * Renders NASA GIBS Black Marble (VIIRS Day/Night Band, ENCC) tiles
 * via EPSG:3857 WMTS served at gibs.earthdata.nasa.gov.
 *
 * Tile URL pattern (confirmed from NASA GIBS documentation):
 *   https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/
 *   VIIRS_SNPP_DayNightBand_ENCC/default/{date}/GoogleMapsCompatible/{z}/{y}/{x}.png
 *
 * The ENCC (Enhanced Near-Constant Contrast) product is the standard
 * Black Marble night-lights imagery served by GIBS for web mapping.
 */

import { useEffect, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
  useMap,
  ZoomControl,
  AttributionControl,
} from "react-leaflet";
import type { Map as LeafletMap, CircleMarkerOptions } from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
import "leaflet-defaulticon-compatibility";

/* ── Types ──────────────────────────────────────────────────── */
export type Region = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  videos: number;
  creators: number;
  topics: string[];
  intensity: "low" | "medium" | "high";
};

type Props = {
  regions: Region[];
  filteredIds: Set<string>;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  tileDate: string; // "YYYY-MM-DD"
  showPopup?: boolean; // default true — set false on mobile
};

/* ── Intensity → base visual style ─────────────────────────── */
const INTENSITY: Record<
  "low" | "medium" | "high",
  { color: string; fillColor: string; weight: number; fillOpacity: number }
> = {
  low: {
    color: "rgba(200,16,46,0.5)",
    fillColor: "rgba(200,16,46,0.25)",
    weight: 1.5,
    fillOpacity: 0.7,
  },
  medium: {
    color: "rgba(200,16,46,0.75)",
    fillColor: "rgba(200,16,46,0.4)",
    weight: 2,
    fillOpacity: 0.8,
  },
  high: {
    color: "rgba(200,16,46,1)",
    fillColor: "rgba(200,16,46,0.55)",
    weight: 2.5,
    fillOpacity: 0.9,
  },
};

/**
 * Compute marker radius from video count.
 * Minimum 6px, grows with sqrt(count) so large counts don't dominate.
 */
function videoCountToRadius(count: number): number {
  const MIN = 6;
  const SCALE = 4;
  return Math.max(MIN, MIN + SCALE * Math.sqrt(count));
}

/* ── Component that flies to selected region ────────────────── */
function FlyTo({ regions, selectedId }: { regions: Region[]; selectedId: string | null }) {
  const map = useMap();
  useEffect(() => {
    if (!selectedId) return;
    const r = regions.find(r => r.id === selectedId);
    if (r) map.flyTo([r.lat, r.lng], 6, { duration: 1.4, easeLinearity: 0.3 });
  }, [selectedId, map, regions]);
  return null;
}

/* ── Main component ─────────────────────────────────────────── */
export default function BlackMarbleMap({
  regions,
  filteredIds,
  selectedId,
  onSelect,
  tileDate,
  showPopup = true,
}: Props) {
  const mapRef = useRef<LeafletMap | null>(null);

  // Build the GIBS tile URL.
  // Layer: VIIRS_Black_Marble — the static night-lights composite GIBS serves
  // (valid composite dates are 2012-01-01 and 2016-01-01).
  // TileMatrixSet is GoogleMapsCompatible_Level8 (max zoom 8).
  // Format MUST be PNG — this layer is not served as JPG (jpg requests 400).
  // Subdomain rotation (a/b/c) improves parallel tile loading.
  const tileUrl =
    `https://gibs-{s}.earthdata.nasa.gov/wmts/epsg3857/best/` +
    `VIIRS_Black_Marble/default/${tileDate}/` +
    `GoogleMapsCompatible_Level8/{z}/{y}/{x}.png`;

  const visibleRegions = regions.filter(r => filteredIds.has(r.id));

  return (
    <MapContainer
      center={[35.5, 104]}
      zoom={4}
      minZoom={2}
      maxZoom={8}
      style={{ width: "100%", height: "100%", background: "#000" }}
      zoomControl={false}
      attributionControl={false}
      ref={mapRef}
    >
      {/* ── NASA GIBS Black Marble tile layer ── */}
      <TileLayer
        url={tileUrl}
        subdomains={["a", "b", "c"]}
        tileSize={256}
        minZoom={2}
        maxNativeZoom={8}
        maxZoom={8}
        attribution='Imagery: <a href="https://blackmarble.gsfc.nasa.gov" target="_blank" rel="noopener">NASA Black Marble</a> · <a href="https://earthdata.nasa.gov/eosdis/science-system-description/eosdis-components/gibs" target="_blank" rel="noopener">NASA GIBS</a>'
        keepBuffer={4}
        updateWhenIdle={false}
        crossOrigin="anonymous"
      />

      {/* ── Region markers ── */}
      {visibleRegions.map(region => {
        const style     = INTENSITY[region.intensity];
        const isSelected = selectedId === region.id;
        const baseRadius = videoCountToRadius(region.videos);

        const markerOpts: CircleMarkerOptions = {
          radius:      isSelected ? baseRadius * 1.5 : baseRadius,
          color:       isSelected ? "#ffffff" : style.color,
          fillColor:   isSelected ? "rgba(200,16,46,0.7)" : style.fillColor,
          weight:      isSelected ? 3 : style.weight,
          fillOpacity: style.fillOpacity,
          interactive: true,
          bubblingMouseEvents: false,
        };

        return (
          <CircleMarker
            key={region.id}
            center={[region.lat, region.lng]}
            {...markerOpts}
            eventHandlers={{
              click: () => onSelect(isSelected ? null : region.id),
            }}
          >
            {showPopup && (
              <Popup
                closeButton={false}
                className="bm-popup"
                offset={[0, -6]}
              >
                <div
                  style={{
                    background: "#111",
                    border: "1px solid rgba(255,255,255,0.12)",
                    borderRadius: "8px",
                    padding: "12px 14px",
                    minWidth: "180px",
                    fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
                  }}
                >
                  <div
                    style={{
                      fontSize: "13px",
                      fontWeight: 700,
                      color: "#fff",
                      marginBottom: "4px",
                      letterSpacing: "-0.01em",
                    }}
                  >
                    {region.name}
                  </div>
                  <div
                    style={{
                      fontSize: "11px",
                      color: "rgba(255,255,255,0.5)",
                      marginBottom: "10px",
                    }}
                  >
                    {region.videos.toLocaleString()} videos &middot; {region.creators} creators
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                    {region.topics.slice(0, 3).map(t => (
                      <span
                        key={t}
                        style={{
                          fontSize: "9px",
                          padding: "2px 7px",
                          background: "rgba(200,16,46,0.12)",
                          border: "1px solid rgba(200,16,46,0.25)",
                          borderRadius: "4px",
                          color: "#C8102E",
                          fontWeight: 600,
                          letterSpacing: "0.04em",
                          textTransform: "uppercase",
                        }}
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </Popup>
            )}
          </CircleMarker>
        );
      })}

      {/* Fly to selected region */}
      <FlyTo regions={regions} selectedId={selectedId} />

      {/* Attribution + zoom in custom positions */}
      <AttributionControl prefix={false} position="bottomright" />
      <ZoomControl position="bottomright" />
    </MapContainer>
  );
}
