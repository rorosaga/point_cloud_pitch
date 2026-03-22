export interface PointCloud2Message {
  header: { stamp: { sec: number; nanosec: number }; frame_id: string };
  height: number;
  width: number;
  fields: Array<{ name: string; offset: number; datatype: number; count: number }>;
  is_bigendian: boolean;
  point_step: number;
  row_step: number;
  data: string; // base64 encoded
  is_dense: boolean;
}

export function parsePointCloud2(msg: PointCloud2Message): Float32Array {
  const binaryStr = atob(msg.data);
  const bytes = new Uint8Array(binaryStr.length);
  for (let i = 0; i < binaryStr.length; i++) {
    bytes[i] = binaryStr.charCodeAt(i);
  }

  const dataView = new DataView(bytes.buffer);
  const pointStep = msg.point_step;
  const numPoints = msg.width * msg.height;

  // Read field offsets from message metadata, fallback to Go2 defaults
  const fieldOffsets: Record<string, number> = {};
  for (const f of msg.fields) {
    fieldOffsets[f.name] = f.offset;
  }
  const xOff = fieldOffsets['x'] ?? 4;
  const yOff = fieldOffsets['y'] ?? 8;
  const zOff = fieldOffsets['z'] ?? 12;

  const xyzOut = new Float32Array(numPoints * 3);
  let validCount = 0;

  for (let i = 0; i < numPoints; i++) {
    const base = i * pointStep;
    if (base + zOff + 4 > bytes.length) break;

    const x = dataView.getFloat32(base + xOff, true);
    const y = dataView.getFloat32(base + yOff, true);
    const z = dataView.getFloat32(base + zOff, true);

    if (isFinite(x) && isFinite(y) && isFinite(z)) {
      xyzOut[validCount * 3 + 0] = x;
      xyzOut[validCount * 3 + 1] = y;
      xyzOut[validCount * 3 + 2] = z;
      validCount++;
    }
  }

  return xyzOut.slice(0, validCount * 3);
}
