import React, { useState, useCallback, useRef } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import { Clusterer } from 'react-native-clusterer';
import MapView, { Region, Polyline } from 'react-native-maps';
import { initialRegion, parsedPlacesData } from './places';
import { Point } from './Point';

import type * as GeoJSON from 'geojson';
import type { supercluster } from 'react-native-clusterer';

const MAP_WIDTH = Dimensions.get('window').width;
const MAP_HEIGHT = Dimensions.get('window').height - 80;
const MAP_DIMENSIONS = { width: MAP_WIDTH, height: MAP_HEIGHT };

export const Map = () => {
  const [region, setRegion] = useState<Region>(initialRegion);
  const mapRef = useRef<MapView>(null);

  const _handlePointPress = useCallback(
    (
      point:
        | supercluster.PointFeature<GeoJSON.GeoJsonProperties>
        | supercluster.ClusterFeatureClusterer<GeoJSON.GeoJsonProperties>
    ) => {
      if (point.properties?.getClusterExpansionRegion) {
        const toRegion = point.properties?.getClusterExpansionRegion();
        mapRef.current?.animateToRegion(toRegion, 500);
      }
    },
    [mapRef]
  );

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        initialRegion={initialRegion}
        onRegionChangeComplete={setRegion}
        region={region}
        style={MAP_DIMENSIONS}
        // mapType="satellite"
      >
        <Clusterer
          data={parsedPlacesData}
          region={region}
          options={{
            radius: Dimensions.get('window').width * 0.06,
            minZoom: 0,
            maxZoom: 20,
            minPoints: 2,
          }}
          mapDimensions={MAP_DIMENSIONS}
          renderItem={(item) => {
            return (
              <Point
                key={
                  item.properties?.cluster_id ?? `point-${item.properties?.id}`
                }
                item={item}
                onPress={_handlePointPress}
              />
            );
          }}
          renderSpider={(marker, index) => {
            return (
              <Polyline
                key={`spider-polyline-${index}`}
                coordinates={[marker.centerPoint, marker, marker.centerPoint]}
                strokeColor={'white'}
                strokeWidth={1}
              />
            );
          }}
        />
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
