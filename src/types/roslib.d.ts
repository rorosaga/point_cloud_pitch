declare module 'roslib' {
  export class Ros {
    constructor(options: { url: string });
    on(event: string, callback: (...args: any[]) => void): void;
    close(): void;
  }
  export class Topic {
    constructor(options: {
      ros: Ros;
      name: string;
      messageType: string;
      throttle_rate?: number;
    });
    subscribe(callback: (msg: any) => void): void;
    unsubscribe(): void;
  }
}
