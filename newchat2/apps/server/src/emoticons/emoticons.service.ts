import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class EmoticonsService {
  private manifestPath = path.resolve(process.cwd(), '../../packages/emoticons/manifest.json');

  getPacks() {
    try {
      const data = fs.readFileSync(this.manifestPath, 'utf-8');
      return JSON.parse(data);
    } catch {
      return { packs: [] };
    }
  }
}
