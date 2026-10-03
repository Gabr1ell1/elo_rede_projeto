// Este componente mostra a foto e oferece opções para trocá-la.
import { useEffect, useState } from 'react';
import { Image, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getAvatar, uploadAvatar } from '../../services/api';
import { pickDocument, pickImage, takePhoto, save } from '../../services/fileStorage';

type Source = 'camera' | 'gallery' | 'file';

const OPTIONS: [Source, string, any][] = [
    ['camera', 'Câmera', 'camera-outline'],
    ['gallery', 'Galeria', 'images-outline'],
    ['file', 'Arquivo', 'document-outline']
];

export function Avatar({
    userId,
    editable = false,
    size = 72
}: {
    userId: string;
    editable?: boolean;
    size?: number;
}) {
    const [uri, setUri] = useState<string>();
    const [imageFailed, setImageFailed] = useState(false);
    const [error, setError] = useState('');
    const [menu, setMenu] = useState(false);

    useEffect(() => {
        if (!userId) return;
        setImageFailed(false);
        getAvatar(userId)
            .then((value) => setUri(value))
            .catch(() => {});
    }, [userId]);

    async function choose(kind: Source) {
        setMenu(false);
        try {
            setError('');
            const asset =
                kind === 'camera'
                    ? await takePhoto()
                    : kind === 'gallery'
                    ? await pickImage()
                    : await pickDocument();
            if (!asset) return;

            const file = asset as { uri: string; name?: string; mimeType?: string; file?: Blob };
            const name = file.name || 'avatar.jpg';
            const savedUri = await save(file.uri, name);
            const next = await uploadAvatar(userId, {
                uri: savedUri,
                name,
                mimeType: file.mimeType || 'image/jpeg',
                blob: file.file
            });

            setImageFailed(false);
            setUri(next);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Não foi possível trocar a foto.');
        }
    }

    const circle = { width: size, height: size, borderRadius: size / 2 };
    const showImage = !!uri && !imageFailed;
    const badge = Math.max(30, Math.round(size * 0.32));

    return (
        <View style={styles.wrap}>
            <View style={{ width: size, height: size }}>
                {showImage ? (
                    <Image source={{ uri }} style={circle} onError={() => setImageFailed(true)} />
                ) : (
                    <View style={[styles.placeholder, circle]}>
                        <Ionicons name="person" size={size * 0.55} color="#2F6B66" />
                    </View>
                )}

                {editable && (
                    <Pressable
                        onPress={() => setMenu(true)}
                        style={[styles.badge, { width: Math.max(44, badge), height: Math.max(44, badge), borderRadius: Math.max(44, badge) / 2 }]}
                    >
                        <Ionicons name="pencil" size={badge * 0.5} color="#FFFFFF" />
                    </Pressable>
                )}
            </View>

            {!!error && <Text style={styles.error}>{error}</Text>}

            {editable && (
                <Modal visible={menu} transparent animationType="fade" onRequestClose={() => setMenu(false)}>
                    <Pressable style={styles.overlay} onPress={() => setMenu(false)}>
                        <View style={styles.sheet}>
                            <Text style={styles.sheetTitle}>Alterar foto</Text>

                            {OPTIONS.map(([key, label, icon]) => (
                                <Pressable key={key} onPress={() => choose(key)} style={styles.option}>
                                    <Ionicons name={icon} size={22} color="#2F6B66" />
                                    <Text style={styles.optionText}>{label}</Text>
                                </Pressable>
                            ))}

                            <Pressable onPress={() => setMenu(false)} style={styles.cancel}>
                                <Text style={styles.cancelText}>Cancelar</Text>
                            </Pressable>
                        </View>
                    </Pressable>
                </Modal>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    wrap: { alignItems: 'center', gap: 8 },
    placeholder: { backgroundColor: '#DDEDEA', alignItems: 'center', justifyContent: 'center' },
    badge: {
        position: 'absolute',
        right: 0,
        bottom: 0,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#4F8F89',
        borderWidth: 3,
        borderColor: '#FFFFFF'
    },
    error: { color: '#C95C5C', textAlign: 'center' },
    overlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
        backgroundColor: 'rgba(20,35,33,0.45)'
    },
    sheet: { width: '100%', maxWidth: 360, padding: 20, gap: 10, borderRadius: 24, backgroundColor: '#FFFFFF' },
    sheetTitle: { color: '#29413F', fontSize: 18, fontWeight: '700', marginBottom: 6 },
    option: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        minHeight: 44,
        padding: 14,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#D9E3E1',
        backgroundColor: '#F4F7F6'
    },
    optionText: { color: '#29413F', fontSize: 15, fontWeight: '600' },
    cancel: { minHeight: 44, justifyContent: 'center', alignItems: 'center', paddingVertical: 12 },
    cancelText: { color: '#6B7F7C', fontSize: 14, fontWeight: '700' }
});
