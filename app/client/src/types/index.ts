export type PRODUCERDATA = {
    id:string
    farm:string
    block:string
    lot:string
    timestamp:string
  };

  export type ERROR = {
    error:any
  }

  export type DELIVERERDATA = {
    id: string;
    position: string;
    process: string;
  };
  export interface RESPONSE {
    status:string
    txid:string
    error?:any
  };