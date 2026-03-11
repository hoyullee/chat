export interface TemplateContext {
  projectName: string;
  projectNamePascal: string;
  projectNameKebab: string;
  projectNameCamel: string;
  createdAt: string;
  platforms: string[];
  features: {
    auth: boolean;
    friends: boolean;
    chat: boolean;
    emoticons: boolean;
  };
  [key: string]: unknown;
}

export interface GeneratorContext {
  name: string;
  namePascal: string;
  nameKebab: string;
  nameCamel: string;
  [key: string]: unknown;
}

export interface TemplateFile {
  sourcePath: string;
  destPath: string;
  isEjs: boolean;
}
