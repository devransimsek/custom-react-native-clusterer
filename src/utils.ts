import type { Feature, Point } from 'geojson';
import type { BBox, LatLng, Region } from './types';
import GeoViewport from '@mapbox/geo-viewport';

const calculateDelta = (x: number, y: number): number =>
  x > y ? x - y : y - x;

const calculateAverage = (...args: number[]): number => {
  const argList = [...args];
  if (!argList.length) {
    return 0;
  }
  return argList.reduce((sum, num: number) => sum + num, 0) / argList.length;
};

export const regionToBBox = (region: Region): BBox => {
  const lngD =
    region.longitudeDelta < 0
      ? region.longitudeDelta + 360
      : region.longitudeDelta;

  return [
    region.longitude - lngD, // westLng - min lng
    region.latitude - region.latitudeDelta, // southLat - min lat
    region.longitude + lngD, // eastLng - max lng
    region.latitude + region.latitudeDelta, // northLat - max lat
  ];
};

export const getMarkersRegion = (points: LatLng[]): Region => {
  const coordinates = {
    minX: points[0]!.latitude,
    maxX: points[0]!.latitude,
    maxY: points[0]!.longitude,
    minY: points[0]!.longitude,
  };

  const { maxX, minX, maxY, minY } = points.reduce(
    (acc, point) => ({
      minX: Math.min(acc.minX, point.latitude),
      maxX: Math.max(acc.maxX, point.latitude),
      minY: Math.min(acc.minY, point.longitude),
      maxY: Math.max(acc.maxY, point.longitude),
    }),
    { ...coordinates }
  );

  const deltaX = calculateDelta(maxX, minX);
  const deltaY = calculateDelta(maxY, minY);

  return {
    latitude: calculateAverage(minX, maxX),
    longitude: calculateAverage(minY, maxY),
    latitudeDelta: deltaX * 0.5,
    longitudeDelta: deltaY * 0.5,
  };
};

export const getMarkersCoordinates = (markers: Feature<Point>) => {
  const [longitude, latitude] = markers.geometry.coordinates;
  return { longitude, latitude };
};

export const returnMapZoom = (
  region: Region,
  bBox: BBox,
  minZoom: number,
  mapDimensions: { width: number; height: number }
) => {
  const viewport =
    region.longitudeDelta >= 40
      ? { zoom: minZoom }
      : GeoViewport.viewport(bBox, [mapDimensions.width, mapDimensions.height]);

  return viewport.zoom;
};

export const generateSpiral = (
  marker: any,
  clusterChildren: any[],
  markers: any[], // cluster
  index: number
) => {
  const { properties, geometry } = marker;
  const count = properties.point_count;
  const centerLocation = geometry.coordinates;

  console.log(marker, 'LALA 1');
  console.log(clusterChildren, 'LALA 2');
  console.log(markers, 'LALA 3');
  console.log(index, 'LALA 4');

  const res = [];
  let angle = 0;
  let start = 0;

  for (let i = 0; i < index; i += 1) {
    start += markers[i].properties.point_count || 0;
  }

  for (let i = 0; i < count; i += 1) {
    angle = 0.25 * (i * 0.8);
    const latitude = centerLocation[1] + 0.0008 * angle * Math.cos(angle);
    const longitude = centerLocation[0] + 0.0008 * angle * Math.sin(angle);

    if (clusterChildren[i + start]) {
      res.push({
        index: clusterChildren[i + start].properties.index,
        clusterId: marker?.properties?.cluster_id || null,
        longitude,
        latitude,
        centerPoint: {
          latitude: centerLocation[1],
          longitude: centerLocation[0],
        },
      });
    }
  }

  return res;
};
