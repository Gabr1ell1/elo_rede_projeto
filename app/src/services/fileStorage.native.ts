import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';

// Estes atalhos concentram as escolhas de arquivo e mantêm as telas mais simples.
export async function pickImage() { const permission = await ImagePicker.requestMediaLibraryPermissionsAsync(); if (!permission.granted) throw new Error('Permita o acesso às fotos para escolher uma imagem.'); const r = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 0.85 }); return r.canceled ? null : r.assets[0]; }
export async function takePhoto() { const permission = await ImagePicker.requestCameraPermissionsAsync(); if (!permission.granted) throw new Error('Permita o acesso à câmera para tirar uma foto.'); const r = await ImagePicker.launchCameraAsync({ allowsEditing: true, aspect: [1, 1], quality: 0.85 }); return r.canceled ? null : r.assets[0]; }
export async function pickDocument() { const r = await DocumentPicker.getDocumentAsync({ type: ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'application/pdf'], copyToCacheDirectory: true }); return r.canceled ? null : r.assets[0]; }
export async function save(uri: string, name: string) { const dir = `${FileSystem.documentDirectory}elo/`; await FileSystem.makeDirectoryAsync(dir, { intermediates: true }); const target = `${dir}${Date.now()}-${name.replace(/[^\w.-]/g, '_')}`; await FileSystem.copyAsync({ from: uri, to: target }); return target; }
export async function remove(uri: string) { await FileSystem.deleteAsync(uri, { idempotent: true }); }
