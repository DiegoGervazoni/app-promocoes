import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "./firebaseConfig";

interface Promocao {
  id: string;
  supermercado: string;
  produto: string;
  preco: number;
}

export default function App() {
  const [promocoes, setPromocoes] = useState<Promocao[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [mercadoSelecionado, setMercadoSelecionado] = useState<string>("Todos");
  const [mercadosUnicos, setMercadosUnicos] = useState<string[]>([]);
  const [busca, setBusca] = useState<string>(""); // estado da busca

  // Busca e ordena promoções
  async function carregarPromocoes() {
    setCarregando(true);
    try {
      const promocoesRef = collection(db, "promocoes");
      const q = query(promocoesRef, orderBy("preco"));
      const snapshot = await getDocs(q);

      const lista: Promocao[] = [];
      const setMercs = new Set<string>();

      snapshot.forEach((doc) => {
        const d = doc.data();
        lista.push({
          id: doc.id,
          supermercado: d.supermercado,
          produto: d.produto,
          preco: d.preco,
        });
        setMercs.add(d.mercado);
      });

      setPromocoes(lista);
      setMercadosUnicos(["Todos", ...Array.from(setMercs)]);
    } catch (err) {
      console.error(err);
    }
    setCarregando(false);
  }

  useEffect(() => {
    carregarPromocoes();
  }, []);

  // Aplica filtros de mercado e busca por produto (case-insensitive)
  const promocoesFiltradas = promocoes
    .filter(
      (p) =>
        mercadoSelecionado === "Todos" || p.supermercado === mercadoSelecionado
    )
    .filter((p) => p.produto.toLowerCase().includes(busca.toLowerCase()));

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Promoções</Text>

      <TouchableOpacity style={styles.botao} onPress={carregarPromocoes}>
        <Text style={styles.textoBotao}>🔄 Atualizar</Text>
      </TouchableOpacity>

      <Text style={styles.label}>Filtrar por mercado:</Text>
      <Picker
        selectedValue={mercadoSelecionado}
        onValueChange={setMercadoSelecionado}
        style={styles.picker}
      >
        {mercadosUnicos.map((m) => (
          <Picker.Item key={m} label={m} value={m} />
        ))}
      </Picker>

      <TextInput
        style={styles.input}
        placeholder="Buscar produto..."
        value={busca}
        onChangeText={setBusca}
      />

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
              <Text>Mercado: {item.supermercado}</Text>
              <Text>Preço: R$ {item.preco.toFixed(2)}</Text>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 50,
    backgroundColor: "#f5f5f5",
  },
  titulo: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  botao: {
    backgroundColor: "#007bff",
    padding: 10,
    borderRadius: 6,
    alignItems: "center",
    marginBottom: 10,
    alignSelf: "center",
  },
  textoBotao: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  label: { fontSize: 16, marginBottom: 5 },
  picker: {
    height: 50,
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 8,
    marginBottom: 15,
  },
  input: {
    height: 40,
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 15,
  },
  carregando: { alignItems: "center", marginTop: 30 },
  card: {
    backgroundColor: "#fff",
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
    elevation: 3,
  },
  produto: { fontSize: 18, fontWeight: "bold" },
});
