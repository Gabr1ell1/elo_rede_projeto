// Para que serve este arquivo: Oferece hooks reutilizáveis para aparência e configuração da interface.
// Onde ele é usado: src/hooks/use-theme-color.ts é importado pelas telas ou componentes correspondentes.

/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import { COLORS } from '@/src/constants/cores';
import { useColorScheme } from '@/src/hooks/use-color-scheme';

// Esta funcao executa uma acao deste arquivo e mantem a logica desta parte da aplicacao em um so lugar.
export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof typeof COLORS
) {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? 'dark' : 'light';
  const colorFromProps = props[theme];

  if (colorFromProps) {
    return colorFromProps;
  } else {
    return COLORS[colorName];
  }
}
