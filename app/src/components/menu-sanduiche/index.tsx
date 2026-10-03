// Para que serve este arquivo: mostra as rotas principais em um menu compacto para celulares.
// Onde ele é usado: aparece na barra superior das telas de paciente e psicólogo.
import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { COLORS } from '../../constants/cores';

export function MenuSanduiche() {
    // Guarda se as opções de navegação estão visíveis.
    const [aberto, setAberto] = useState(false);
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { user, signOut } = useAuth();
    const psicologo = user?.role === 'PSYCHOLOGIST';

    // Cada papel recebe somente os atalhos das telas que pode abrir.
    const links = psicologo
        ? [
            { label: 'Minha agenda', icon: 'calendar-outline' as const, rota: '/psicologo' as const },
            { label: 'Meu perfil', icon: 'person-outline' as const, rota: '/psicologo/perfil' as const },
            { label: 'Rede de psicólogos', icon: 'globe-outline' as const, rota: '/psicologo/rede' as const },
        ]
        : [
            { label: 'Início', icon: 'home-outline' as const, rota: '/paciente' as const },
            { label: 'Minhas consultas', icon: 'calendar-outline' as const, rota: '/paciente/consultas' as const },
            { label: 'Meu perfil', icon: 'person-outline' as const, rota: '/paciente/perfil' as const },
        ];

    return (
        <>
            <Pressable
                accessibilityRole="button"
                accessibilityLabel="Abrir menu de navegação"
                hitSlop={8}
                onPress={() => setAberto(true)}
                style={({ pressed }) => [styles.trigger, pressed && styles.pressed]}
            >
                <Ionicons name="menu" size={27} color={COLORS.card} />
            </Pressable>

            <Modal visible={aberto} transparent animationType="fade" onRequestClose={() => setAberto(false)}>
                <View style={styles.overlay}>
                    <Pressable accessibilityLabel="Fechar menu" style={StyleSheet.absoluteFill} onPress={() => setAberto(false)} />
                    <View style={[styles.sheet, { marginTop: insets.top + 12 }]}>
                        <View style={styles.titleRow}>
                            <Text style={styles.title}>Navegação</Text>
                            <Pressable accessibilityLabel="Fechar menu" hitSlop={8} onPress={() => setAberto(false)} style={styles.close}>
                                <Ionicons name="close" size={23} color={COLORS.text} />
                            </Pressable>
                        </View>
                        {links.map((link) => (
                            <Pressable
                                key={link.rota}
                                accessibilityRole="button"
                                style={({ pressed }) => [styles.item, pressed && styles.pressed]}
                                onPress={() => { /* Fecha o menu antes de navegar para a rota. */ setAberto(false); router.push(link.rota as never); }}
                            >
                                <Ionicons name={link.icon} size={22} color={COLORS.primary} />
                                <Text style={styles.label}>{link.label}</Text>
                                <Ionicons name="chevron-forward" size={18} color={COLORS.textSecondary} />
                            </Pressable>
                        ))}
                        <Pressable
                            accessibilityRole="button"
                            style={({ pressed }) => [styles.item, styles.signOut, pressed && styles.pressed]}
                            onPress={() => { /* Encerra a sessão antes de sair do painel. */ setAberto(false); void signOut(); }}
                        >
                            <Ionicons name="log-out-outline" size={22} color={COLORS.error} />
                            <Text style={[styles.label, styles.signOutLabel]}>Sair</Text>
                        </Pressable>
                    </View>
                </View>
            </Modal>
        </>
    );
}

// Mantém o botão compacto e o painel fácil de tocar em telas pequenas.
const styles = StyleSheet.create({
    trigger: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.18)' },
    overlay: { flex: 1, alignItems: 'flex-end', paddingHorizontal: 16, backgroundColor: 'rgba(20,35,33,0.32)' },
    sheet: { width: '100%', maxWidth: 360, padding: 18, borderRadius: 22, backgroundColor: COLORS.card, elevation: 12, shadowColor: '#000', shadowOpacity: 0.18, shadowRadius: 16, shadowOffset: { width: 0, height: 8 } },
    titleRow: { minHeight: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
    title: { color: COLORS.text, fontSize: 19, fontWeight: '700' },
    close: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
    item: { minHeight: 52, flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 12, borderRadius: 14 },
    label: { flex: 1, flexShrink: 1, color: COLORS.text, fontSize: 16, fontWeight: '600' },
    signOut: { marginTop: 8, borderTopWidth: 1, borderTopColor: COLORS.border, borderRadius: 0 },
    signOutLabel: { color: COLORS.error },
    pressed: { opacity: 0.72, backgroundColor: COLORS.primaryLight },
});
