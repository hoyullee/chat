export type Platform = 'mobile' | 'desktop' | 'server' | 'all';
export type GeneratorType = 'screen' | 'api' | 'socket' | 'emoticon';

export interface ProjectFeatures {
  auth: boolean;
  friends: boolean;
  chat: boolean;
  emoticons: boolean;
}

export interface ProjectConfig {
  name: string;
  version: string;
  platforms: Exclude<Platform, 'all'>[];
  packageManager: 'pnpm';
  features: ProjectFeatures;
}

export interface InitOptions {
  template?: string;
  platform?: string;
  lang?: string;
  nonInteractive?: boolean;
  preset?: string;
}

export interface DevOptions {
  port?: number;
}

export interface BuildOptions {
  analyze?: boolean;
  env?: string;
}
