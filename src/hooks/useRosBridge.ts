import { useEffect, useRef } from 'react';
import * as ROSLIB from 'roslib';

export function useRosBridge(
  url: string,
  topic: string,
  messageType: string,
  onMessage: (msg: any) => void,
) {
  const callbackRef = useRef(onMessage);
  callbackRef.current = onMessage;

  useEffect(() => {
    const ros = new ROSLIB.Ros({ url });

    ros.on('connection', () => console.log('[rosbridge] Connected'));
    ros.on('error', (err: any) => console.warn('[rosbridge] Error:', err));
    ros.on('close', () => console.log('[rosbridge] Closed'));

    const listener = new ROSLIB.Topic({
      ros,
      name: topic,
      messageType,
      throttle_rate: 100,
    });

    listener.subscribe((msg: any) => callbackRef.current(msg));

    return () => {
      listener.unsubscribe();
      ros.close();
    };
  }, [url, topic, messageType]);
}
