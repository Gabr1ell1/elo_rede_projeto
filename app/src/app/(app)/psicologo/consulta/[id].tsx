// Para que serve este arquivo: Apresenta uma tela ou layout; o Expo Router usa a pasta para organizar as rotas.
// Onde ele é usado: src/app/(app)/psicologo/consulta/[id].tsx é importado pelas telas ou componentes correspondentes.

// Esta página mostra os dados da consulta e os anexos para o psicólogo responsável.
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useAuth } from '../../../../context/AuthContext';
import { getAppointmentById, listAttachments } from '../../../../services/api';
import { Appointment, Attachment } from '../../../../types/clinic';
import { Avatar } from '../../../../components/avatar';

// Esta funcao executa uma acao deste arquivo e mantem a logica desta parte da aplicacao em um so lugar.
// Estes estados guardam valores que mudam durante o uso da tela ou do componente.
export default function PsychologistAppointmentDetail() { const { id } = useLocalSearchParams<{id:string}>(); const {user}=useAuth(); const [item,setItem]=useState<Appointment|null>(null); const [files,setFiles]=useState<Attachment[]>([]); const [loading,setLoading]=useState(true); const [error,setError]=useState('');
// Este efeito sincroniza a tela com dados, autenticacao ou ciclo de vida do componente.
 useEffect(()=>{ if(!id||!user)return; (async()=>{try{const result=await getAppointmentById(id,user.userId,'PSYCHOLOGIST');setItem(result);setFiles(await listAttachments(id,user.userId,'PSYCHOLOGIST'));}catch(e){setError(e instanceof Error?e.message:'Acesso negado.')}finally{setLoading(false)}})();},[id,user]);
 if(loading)return <View style={styles.center}><ActivityIndicator/></View>; if(!item)return <View style={styles.center}><Text>{error.includes('403')?'Acesso negado':error}</Text><Pressable onPress={()=>router.replace('/psicologo')}><Text>Voltar para agenda</Text></Pressable></View>;
 return <View style={styles.container}><Pressable onPress={()=>router.back()}><Text style={styles.link}>‹ Voltar</Text></Pressable><Text style={styles.title}>Detalhe da consulta</Text><View style={{flexDirection:'row',alignItems:'center',gap:10}}><Avatar userId={item.patientId} size={52}/><Text>Paciente: {item.patientName}</Text></View><Text>Data: {new Date(item.date).toLocaleString('pt-BR')}</Text><Text>Status: {item.status}</Text><Text style={styles.title}>Anexos</Text><FlatList data={files} keyExtractor={f=>f.id} ListEmptyComponent={<Text>Nenhum anexo enviado.</Text>} renderItem={({item:f})=><Pressable style={styles.file} onPress={()=>Linking.openURL(f.uri)}><Text style={styles.link}>{f.name} · {f.category} · {new Date(f.createdAt).toLocaleDateString('pt-BR')}</Text></Pressable>}/></View>;
}
// Este bloco concentra os estilos para manter o visual desta tela ou componente organizado.
const styles=StyleSheet.create({container:{flex:1,padding:20,gap:12,backgroundColor:'#F4F7F6'},center:{flex:1,alignItems:'center',justifyContent:'center'},title:{fontSize:20,fontWeight:'700',marginTop:10},link:{color:'#36736F'},file:{paddingVertical:12,borderBottomWidth:1,borderColor:'#D9E3E1'}});
