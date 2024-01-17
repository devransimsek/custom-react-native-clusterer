import { useMemo } from 'react';
import type Supercluster from './types';
import type { MapDimensions, Region } from './types';
import SuperclusterClass from './Supercluster';
import type * as GeoJSON from 'geojson';
import { generateSpiral, regionToBBox, returnMapZoom } from './utils';

export function useClusterer<
  P extends GeoJSON.GeoJsonProperties = Supercluster.AnyProps,
  C extends GeoJSON.GeoJsonProperties = Supercluster.AnyProps
>(
  data: Array<Supercluster.PointFeature<P>>,
  mapDimensions: MapDimensions,
  region: Region,
  options?: Supercluster.Options<P, C>
): [
  (Supercluster.PointFeature<P> | Supercluster.ClusterFeatureClusterer<C>)[],
  SuperclusterClass<P, C>,
  any[]
] {
  const supercluster = useMemo(
    () => new SuperclusterClass(options).load(data),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      data,
      options?.extent,
      options?.maxZoom,
      options?.minZoom,
      options?.minPoints,
      options?.radius,
    ]
  );

  const points = useMemo(
    () =>
      supercluster
        .getClustersFromRegion(region, mapDimensions)
        .map((c: { properties: { cluster_id: any } }) => {
          const cid = c?.properties?.cluster_id;
          if (!cid) return c;

          return {
            ...c,
            properties: {
              ...c.properties,
              getClusterExpansionRegion: () => supercluster.expandCluster(cid),
            },
          };
        }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      supercluster,
      region.latitude,
      region.longitude,
      region.latitudeDelta,
      region.longitudeDelta,
      mapDimensions.width,
      mapDimensions.height,
    ]
  );

  const spiderMarkers = useMemo(() => {
    const bBox = regionToBBox(region);
    const zoom = returnMapZoom(
      region,
      bBox,
      options?.minZoom || 0,
      mapDimensions
    );
    console.log(bBox, 'bBox');
    console.log(zoom, 'zoom');

    const markers = supercluster.getClustersFromRegion(region, mapDimensions);
    console.log(markers, 'AHAHAHHA');
    if (zoom >= 18 && markers.length > 0) {
      const allSpiderMarkers: any[] = [];
      let spiralChildren: any[] = [];

      markers.map((marker: any, index: number) => {
        if (marker.properties.cluster) {
          spiralChildren = supercluster.getLeaves(
            marker.properties.cluster_id,
            Infinity
          );
          console.log(marker.properties.cluster_id, spiralChildren, 'ZAZA');
        }
        let positions = generateSpiral(marker, spiralChildren, markers, index);
        console.log(positions, 'ZAZA positions');
        allSpiderMarkers.push(...positions);
      });
      return allSpiderMarkers;
    }
    return [];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    supercluster,
    region.latitude,
    region.longitude,
    region.latitudeDelta,
    region.longitudeDelta,
    mapDimensions.width,
    mapDimensions.height,
  ]);

  // @ts-ignore FIXME: Type
  return [points, supercluster, spiderMarkers];
}
