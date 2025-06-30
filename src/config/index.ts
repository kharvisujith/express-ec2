import config from 'config';

// Type definitions for config
export interface ServerConfig {
  port: number;
}

export interface CorsConfig {
  enabled: boolean;
}

export interface AppConfig {
  server: ServerConfig;
  cors: CorsConfig;
  environment: string;
}

// Export the entire config object
export default config;

// Export specific config sections for easier access with proper typing
export const serverConfig: ServerConfig = config.get('server');
export const corsConfig: CorsConfig = config.get('cors');
export const environment: string = config.get('environment'); 