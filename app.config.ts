// app.config.ts — complète app.json ; la version vient de package.json (seul endroit à modifier).
import type { ConfigContext, ExpoConfig } from 'expo/config';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const pkg = require('./package.json') as { version: string };

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...(config as ExpoConfig), // name, slug, icônes… viennent de app.json
  version: pkg.version,
});
