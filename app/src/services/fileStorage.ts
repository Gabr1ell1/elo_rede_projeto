// Para que serve este arquivo: Agrupa chamadas à API ou operações de arquivos usadas pelas telas.
// Onde ele é usado: src/services/fileStorage.ts é importado pelas telas ou componentes correspondentes.

// Expo carrega o arquivo específico da plataforma; esta versão serve ao verificador TypeScript.
export { pickImage, takePhoto, pickDocument, save, remove } from './fileStorage.web';
