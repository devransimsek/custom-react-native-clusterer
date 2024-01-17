import React, { FunctionComponent } from 'react';
import { useClusterer } from './useClusterer';

import type * as GeoJSON from 'geojson';
import type { ClustererProps } from './types';

export const Clusterer: FunctionComponent<
  ClustererProps<GeoJSON.GeoJsonProperties, GeoJSON.GeoJsonProperties>
> = ({ data, options, region, mapDimensions, renderItem, renderSpider }) => {
  const [points, _, spiderMarkers] = useClusterer(
    data,
    mapDimensions,
    region,
    options
  );
  console.log(spiderMarkers, 'spiderMarkers');
  console.log(points, 'points');

  return (
    <>
      {points.map((c) => {
        let item = c;
        const relatedSpider = spiderMarkers.filter(
          (x) => c.properties?.cluster_id === x.clusterId
        );
        console.log(relatedSpider, 'relatedSpider');
        // if (relatedSpider) {
        //   item = {
        //     ...item,
        //     geometry: {
        //       type: 'Point',
        //       coordinates: [relatedSpider.longitude, relatedSpider.latitude],
        //     },
        //   };
        // }
        return renderItem(item);
      })}

      {spiderMarkers.map((marker, index) => renderSpider(marker, index))}
    </>
  );
};
