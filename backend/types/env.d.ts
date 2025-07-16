import { DataSourceOptions } from 'typeorm';
export {};

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      DATABASE_URL: string;
      TYPE: DataSourceOptions;
      HOST: string;
      PORT: number;
      USERNAME: string;
      PASSWORD: string;
      DATABASE: string;
    }
  }
}
