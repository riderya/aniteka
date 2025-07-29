import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, ActivityIndicator, StyleSheet, ScrollView } from 'react-native';
import axios from 'axios';
import { useRoute } from '@react-navigation/native';
import Markdown from 'react-native-markdown-display';

const CollectionDetailScreen = () => {
  const route = useRoute();
  const { reference } = route.params; // очікується передача reference в навігацію

  const [collection, setCollection] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchCollection = async () => {
    try {
      const response = await axios.get(`https://api.hikka.io/collections/${reference}`, {
        headers: {
          // Замініть це на свій спосіб передачі токена
          'auth': 'ВАШ_ТОКЕН',
        },
      });
      setCollection(response.data);
    } catch (error) {
      console.error('Помилка завантаження колекції:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCollection();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!collection) {
    return (
      <View style={styles.center}>
        <Text>Не вдалося завантажити колекцію.</Text>
      </View>
    );
  }

  const {
    title,
    description,
    nsfw,
    author,
    collection: items
  } = collection;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {description ? (
  <Markdown style={markdownStyles}>
    {description}
  </Markdown>
) : null}

      {nsfw ? <Text style={styles.nsfw}>🔞 NSFW</Text> : null}

      <View style={styles.authorBlock}>
        <Text style={styles.authorTitle}>Автор:</Text>
        <Text style={styles.authorName}>{author.username}</Text>
      </View>

      <Text style={styles.sectionTitle}>Контент:</Text>
      <FlatList
        data={items}
        keyExtractor={(item, index) => index.toString()}
        scrollEnabled={false}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Image
              source={{ uri: item.content.image }}
              style={styles.image}
            />
            <View style={styles.textContainer}>
              <Text style={styles.animeTitle}>{item.content.title_ua || item.content.title_en}</Text>
              <Text style={styles.subInfo}>
                {item.content.episodes_released}/{item.content.episodes_total} епізодів | {item.content.score}★
              </Text>
            </View>
          </View>
        )}
      />
    </ScrollView>
  );
};

export default CollectionDetailScreen;

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  description: {
    fontSize: 16,
    color: '#444',
    marginBottom: 8,
  },
  nsfw: {
    color: 'red',
    fontWeight: 'bold',
    marginBottom: 12,
  },
  authorBlock: {
    marginBottom: 16,
  },
  authorTitle: {
    fontWeight: 'bold',
  },
  authorName: {
    color: '#555',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 8,
  },
  card: {
    flexDirection: 'row',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderColor: '#eee',
    paddingBottom: 8,
  },
  image: {
    width: 80,
    height: 110,
    borderRadius: 8,
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  animeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  subInfo: {
    color: '#777',
    fontSize: 14,
    marginTop: 4,
  },
});
