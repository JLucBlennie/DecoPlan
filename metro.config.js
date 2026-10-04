const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Metro ne doit pas surveiller le dossier Tauri/Rust (fichiers temporaires de Cargo)
const existing = config.resolver.blockList;
config.resolver.blockList = [
  ...(Array.isArray(existing) ? existing : existing ? [existing] : []),
  /[\/\\]src-tauri[\/\\].*/,
];

module.exports = config;