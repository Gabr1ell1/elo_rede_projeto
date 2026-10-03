// Para que serve este arquivo: Agrupa chamadas à API ou operações de arquivos usadas pelas telas.
// Onde ele é usado: src/services/fileStorage.web.ts é importado pelas telas ou componentes correspondentes.

import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';

// O seletor web fornece URLs blob mantidas pelo navegador só na sessão atual.
const sessionFiles = new Set<string>();
// Esta funcao executa uma acao deste arquivo e mantem a logica desta parte da aplicacao em um so lugar.
export async function pickImage() { const r = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 0.85 }); return r.canceled ? null : r.assets[0]; }
// Esta funcao executa uma acao deste arquivo e mantem a logica desta parte da aplicacao em um so lugar.
export async function takePhoto() { const r = await ImagePicker.launchCameraAsync({ allowsEditing: true, aspect: [1, 1], quality: 0.85 }); return r.canceled ? await pickDocument() : r.assets[0]; }
// Esta funcao executa uma acao deste arquivo e mantem a logica desta parte da aplicacao em um so lugar.
export async function pickDocument() { const r = await DocumentPicker.getDocumentAsync({ type: ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'application/pdf'] }); return r.canceled ? null : r.assets[0]; }
// Esta funcao executa uma acao deste arquivo e mantem a logica desta parte da aplicacao em um so lugar.
export async function save(uri: string, _name: string) { sessionFiles.add(uri); return uri; }
// Esta funcao executa uma acao deste arquivo e mantem a logica desta parte da aplicacao em um so lugar.
export async function remove(uri: string) { sessionFiles.delete(uri); }
