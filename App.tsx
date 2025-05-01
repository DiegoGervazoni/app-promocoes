import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from './firebaseConfig';

interface Promocao {
  id: string;
  mercado: string;
  produto: string;
  preco: string;
}

export default function App() {
  const [promocoes, setPromocoes] = useState<Promocao[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [mercadoSelecionado, setMercadoSelecionado] = useState<string>('Todos');
  const [mercadosUnicos, setMercadosUnicos] = useState<string[]>([]);

  async function carregarPromocoes() {
    setCarregando(true);
    try {
      const promocoesRef = collection(db, "promocoes");
      const q = query(promocoesRef, orderBy("preco"));
      const querySnapshot = await getDocs(q);

      const lista: Promocao[] = [];
      const mercadosSet = new Set<string>();

      querySnapshot.forEach((doc) => {
        const dados = doc.data();
        lista.push({
          id: doc.id,
          mercado: dados.mercado,
          produto: dados.produto,
          preco: dados.preco,
        });
        mercadosSet.add(dados.mercado);
      });

      setPromocoes(lista);
      setMercadosUnicos(['Todos', ...Array.from(mercadosSet)]);
    } catch (error) {
      console.error("Erro ao carregar promoções:", error);
    }
    setCarregando(false);
  }

  useEffect(() => {
    carregarPromocoes();
  }, []);

  // Aplica o filtro por mercado
  const promocoesFiltradas = mercadoSelecionado === 'Todos'
    ? promocoes
    : promocoes.filter(p => p.mercado === mercadoSelecionado);

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Promoções</Text>

      <TouchableOpacity style={styles.botao} onPress={carregarPromocoes}>
        <Text style={styles.textoBotao}>🔄 Atualizar</Text>
      </TouchableOpacity>

      <Text style={styles.label}>Filtrar por mercado:</Text>
      <Picker
        selectedValue={mercadoSelecionado}
        onValueChange={(itemValue) => setMercadoSelecionado(itemValue)}
        style={styles.picker}
      >
        {mercadosUnicos.map((mercado) => (
          <Picker.Item key={mercado} label={mercado} value={mercado} />
        ))}
      </Picker>

      {carregando ? (
        <View style={styles.carregando}>
          <ActivityIndicator size="large" color="#0000ff" />
          <Text>Carregando promoções...</Text>
        </View>
      ) : (
        <FlatList
          data={promocoesFiltradas}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.produto}>{item.produto}</Text>
              <Text>Mercado: {item.mercado}</Text>
              <Text>Preço: R$ {item.preco}</Text>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 50, backgroundColor: '#f5f5f5' },
  titulo: { fontSize: 24, fontWeight: 'bold', marginBottom: 10, textAlign: 'center' },
  botao: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 6,
    alignItems: 'center',
    marginBottom: 10,
    alignSelf: 'center',
  },
  textoBotao: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  label: { fontSize: 16, marginBottom: 5 },
  picker: { height: 50, width: '100%', backgroundColor: '#fff', borderRadius: 8, marginBottom: 15 },
  carregando: { alignItems: 'center', marginTop: 30 },
  card: { backgroundColor: '#fff', padding: 15, marginBottom: 10, borderRadius: 8, elevation: 3 },
  produto: { fontSize: 18, fontWeight: 'bold' },
});
