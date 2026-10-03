// Para que serve este arquivo: Oferece hooks reutilizáveis para aparência e configuração da interface.
// Onde ele é usado: src/hooks/use-color-scheme.web.ts é importado pelas telas ou componentes correspondentes.

import { useEffect, useState } from 'react';
import { useColorScheme as useRNColorScheme } from 'react-native';

/**
 * To support static rendering, this value needs to be re-calculated on the client side for web
 */
// Esta funcao executa uma acao deste arquivo e mantem a logica desta parte da aplicacao em um so lugar.
export function useColorScheme() {
// Estes estados guardam valores que mudam durante o uso da tela ou do componente.
  const [hasHydrated, setHasHydrated] = useState(false);

// Este efeito sincroniza a tela com dados, autenticacao ou ciclo de vida do componente.
  useEffect(() => {
    setHasHydrated(true);
  }, []);

  const colorScheme = useRNColorScheme();

  if (hasHydrated) {
    return colorScheme;
  }

  return 'light';
}
