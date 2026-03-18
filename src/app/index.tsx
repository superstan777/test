import React from "react";
import { StyleSheet, Text, View } from "react-native";

// MapLibre requires a native build — it does not work in Expo Go.
// Run: npx expo run:ios
// See: docs/maps-decision.md
let MapView: React.ComponentType<any> | null = null;
let Camera: React.ComponentType<any> | null = null;
let setAccessToken: ((token: string | null) => void) | null = null;

try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const ML = require("@maplibre/maplibre-react-native");
  MapView = ML.MapView;
  Camera = ML.Camera;
  setAccessToken = ML.setAccessToken;
  setAccessToken?.(null);
} catch {
  // Running in Expo Go — native module unavailable
}

const OSM_STYLE = {
  version: 8,
  sources: {
    osm: {
      type: "raster",
      tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
      tileSize: 256,
    },
  },
  layers: [
    {
      id: "osm-tiles",
      type: "raster",
      source: "osm",
      minzoom: 0,
      maxzoom: 19,
    },
  ],
};

export default function MapScreen() {
  if (!MapView || !Camera) {
    return (
      <View style={styles.fallback}>
        <Text style={styles.fallbackIcon}>🗺️</Text>
        <Text style={styles.fallbackTitle}>Native build required</Text>
        <Text style={styles.fallbackBody}>Run {"\u2192"} npx expo run:ios</Text>
      </View>
    );
  }

  return (
    <View style={StyleSheet.absoluteFillObject}>
      <MapView
        style={StyleSheet.absoluteFillObject}
        mapStyle={OSM_STYLE}
        attributionEnabled={false}
        logoEnabled={false}
      >
        <Camera
          defaultSettings={{
            centerCoordinate: [21.0117, 52.2297], // Warsaw
            zoomLevel: 13,
          }}
        />
      </MapView>
      <Text style={styles.attribution}>© OpenStreetMap contributors</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  attribution: {
    position: "absolute",
    bottom: 90,
    left: 8,
    fontSize: 10,
    color: "#333",
    backgroundColor: "rgba(255,255,255,0.75)",
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 3,
  },
  fallback: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f5f5f5",
    gap: 8,
    padding: 32,
  },
  fallbackIcon: {
    fontSize: 48,
  },
  fallbackTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111",
  },
  fallbackBody: {
    fontSize: 13,
    color: "#666",
    fontFamily: "monospace",
    textAlign: "center",
  },
});
