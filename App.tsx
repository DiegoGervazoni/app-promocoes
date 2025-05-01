// App.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { collection, getDocs } from "firebase/firestore";
import { db } from "./firebaseConfig";

interface Promocao {
  id: string;
  mercado: string;
  produto: string;
  preco: string;
}

export default function App() {
  const [promocoes, setPromocoes] = useState<Promocao[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function carregarPromocoes() {
      const querySnapshot = await getDocs(collection(db, "promocoes"));
      const lista: Promocao[] = [];
      querySnapshot.forEach((doc) => {
        const dados = doc.data();
        lista.push({
          id: doc.id,
          mercado: dados.mercado,
          produto: dados.produto,
          preco: dados.preco,
        });
      });
      setPromocoes(lista);
      setCarregando(false);
    }

    carregarPromocoes();
  }, []);

  if (carregando) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Carregando promoções...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Promoções</Text>
      <FlatList
        data={promocoes}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.produto}>{item.produto}</Text>
            <Text>Mercado: {item.mercado}</Text>
            <Text>Preço: R$ {item.preco}</Text>
          </View>
        )}
      />
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
    marginBottom: 20,
    textAlign: "center",
  },
  card: {
    backgroundColor: "#fff",
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
    elevation: 3,
  },
  produto: { fontSize: 18, fontWeight: "bold" },
});
