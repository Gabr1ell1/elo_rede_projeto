// Para que serve este arquivo: Cria um componente visual que as telas podem reutilizar.
// Onde ele é usado: src/components/confirmar-dialogo/index.tsx é importado pelas telas ou componentes correspondentes.

// Este componente pede confirmação de uma ação em celular ou navegador.
import { Modal, View, Text, Pressable, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/cores';

// O Modal do React Native funciona nos celulares e também no navegador.
export function ConfirmDialog({ visible, title, message, onCancel, onConfirm, confirmLabel = 'Confirmar' }: { visible: boolean; title: string; message: string; onCancel: () => void; onConfirm: () => void; confirmLabel?: string }) {
    return <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}><View style={styles.overlay}><View style={styles.box}><Text style={styles.title}>{title}</Text><Text style={styles.message}>{message}</Text><View style={styles.actions}><Pressable onPress={onCancel} style={styles.button}><Text>Voltar</Text></Pressable><Pressable onPress={onConfirm} style={[styles.button, styles.primary]}><Text style={{ color: 'white' }}>{confirmLabel}</Text></Pressable></View></View></View></Modal>;
}
// Este bloco concentra os estilos para manter o visual desta tela ou componente organizado.
const styles = StyleSheet.create({ overlay: { flex: 1, backgroundColor: '#0008', justifyContent: 'center', alignItems: 'center', padding: 20 }, box: { width: '100%', maxWidth: 420, borderRadius: 16, padding: 22, backgroundColor: 'white', gap: 12 }, title: { fontSize: 20, fontWeight: '700', color: COLORS.text }, message: { color: COLORS.text }, actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginTop: 8 }, button: { padding: 12, borderRadius: 8, backgroundColor: '#eee' }, primary: { backgroundColor: COLORS.primary } });
