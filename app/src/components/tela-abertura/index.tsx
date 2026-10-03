// Para que serve este arquivo: Cria um componente visual que as telas podem reutilizar.
// Onde ele é usado: src/components/tela-abertura/index.tsx é importado pelas telas ou componentes correspondentes.

// Mostra a identidade do Elo enquanto o AuthContext restaura a sessão salva.
import { useEffect, useRef } from 'react';
import { ActivityIndicator, Animated, Image, StyleSheet, View } from 'react-native';
import { COLORS } from '../../constants/cores';

const LOGO = require('../../../assets/images/elo-logo-branca.png');

// Esta funcao executa uma acao deste arquivo e mantem a logica desta parte da aplicacao em um so lugar.
export function TelaAbertura() {
    const fade = useRef(new Animated.Value(0)).current;
    const scale = useRef(new Animated.Value(0.94)).current;

// Este efeito sincroniza a tela com dados, autenticacao ou ciclo de vida do componente.
    useEffect(() => {
        Animated.parallel([
            Animated.timing(fade, { toValue: 1, duration: 550, useNativeDriver: true }),
            Animated.spring(scale, { toValue: 1, useNativeDriver: true, tension: 55, friction: 7 }),
        ]).start();
    }, [fade, scale]);

    return (
        <View style={styles.container}>
            <Animated.View style={{ opacity: fade, transform: [{ scale }] }}>
                <Image source={LOGO} resizeMode="contain" style={styles.logo} accessibilityLabel="Elo" />
            </Animated.View>
            <ActivityIndicator color={COLORS.card} size="small" />
        </View>
    );
}

// Este bloco concentra os estilos para manter o visual desta tela ou componente organizado.
const styles = StyleSheet.create({
    container: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 28, backgroundColor: COLORS.primary },
    logo: { width: 200, height: 100 },
});
