import { useCallback } from 'react';
import { useRosBridge } from './useRosBridge';
import { parsePointCloud2 } from '../lib/pointcloud2';
import type { PointCloud2Message } from '../lib/pointcloud2';
import { ROSBRIDGE_URL, POINTCLOUD_TOPIC } from '../lib/pitchConstants';

export function usePointCloud(onPoints: (points: Float32Array) => void) {
  const handleMessage = useCallback(
    (msg: any) => {
      const points = parsePointCloud2(msg as PointCloud2Message);
      onPoints(points);
    },
    [onPoints],
  );

  useRosBridge(ROSBRIDGE_URL, POINTCLOUD_TOPIC, 'sensor_msgs/PointCloud2', handleMessage);
}
