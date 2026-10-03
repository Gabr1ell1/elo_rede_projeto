import { Redirect, Slot, usePathname } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { useAuth } from "../../../context/AuthContext";

export default function PsychologistLayout() {
    const { isAuthenticated, isLoading, user, statusCrp, isStatusCrpLoading } = useAuth();
    const pathname = usePathname();
    const verificacaoPath = "/psicologo/verificacao";

    if (isLoading) return <Loading />;
    if (!isAuthenticated) return pathname === "/" ? <Slot /> : <Redirect href="/(auth)" />;
    if (user?.role !== "PSYCHOLOGIST") {
        return pathname === "/paciente/consultas" ? <Slot /> : <Redirect href="/paciente/consultas" />;
    }
    if (isStatusCrpLoading) return <Loading />;
    if (statusCrp !== "VERIFICADO" && pathname !== verificacaoPath) {
        return <Redirect href={verificacaoPath} />;
    }
    return <Slot />;
}

function Loading() {
    return <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}><ActivityIndicator /></View>;
}
