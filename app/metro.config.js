// Para que serve este arquivo: configura como o Metro encontra e empacota os arquivos do Elo.
// Onde ele e usado: o Expo carrega esta configuracao ao iniciar o app em web ou Android.
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

module.exports = config;
