import { Camera, MapView, setAccessToken } from '@maplibre/maplibre-react-native';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

setAccessToken(null);

const OSM_STYLE = {
  version: 8,
  sources: {
    osm: {
      type: 'raster',
      tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
      tileSize: 256,
    },
  },
  layers: [
    {
      id: 'osm-tiles',
      type: 'raster',
      source: 'osm',
      minzoom: 0,
      maxzoom: 19,
    },
  ],
};

export default function MapScreen() {
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
    position: 'absolute',
    bottom: 90,
    left: 8,
    fontSize: 10,
    color: '#333',
    backgroundColor: 'rgba(255,255,255,0.75)',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 3,
  },
});
