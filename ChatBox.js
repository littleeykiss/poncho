import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform, Animated, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import axios from 'axios';
import Constants from 'expo-constants';

const API_URL = 'http://192.168.56.1:1234/api/v1/chat';
// Token is read from app configuration (app.json extra field) to avoid hard‑coding secrets.
const AUTH_TOKEN = Constants?.manifest?.extra?.authToken ?? '';

// Single chat bubble with simple entry animation
const ChatBubble = ({ item, index }) => {
  const translateY = useRef(new Animated.Value(20)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(translateY, {
      toValue: 0,
      duration: 300,
      delay: index * 100,
      useNativeDriver: true,
      easing: Easing.out(Easing.ease),
    }).start();
    Animated.timing(opacity, {
      toValue: 1,
      duration: 300,
      delay: index * 100,
      useNativeDriver: true,
    }).start();
  }, []);

  const bubbleStyle = item.isUser ? styles.userBubble : styles.botBubble;

  return (
    <Animated.View style={{
      transform: [{ translateY }],
      opacity,
      marginVertical: 4,
    }}>
      <View style={bubbleStyle}>
        <Text style={styles.messageText}>{item.text}</Text>
      </View>
    </Animated.View>
  );
};

export default function ChatBox() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const flatListRef = useRef(null);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg = { id: Date.now().toString(), text: input, isUser: true };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    try {
      const response = await axios.post(API_URL, {
        model: 'qwen2.5-coder-7b-instruct',
        input: input,
      }, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${AUTH_TOKEN}`,
        },
      });
      const botMsg = {
        id: (Date.now() + 1).toString(),
        text: response.data?.output?.trim() ?? 'Sin respuesta',
        isUser: false,
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (e) {
      const errMsg = {
        id: (Date.now() + 2).toString(),
        text: 'Error al conectar con la IA',
        isUser: false,
      };
      setMessages(prev => [...prev, errMsg]);
      console.warn(e);
    }
  };

  // Scroll to bottom when new message arrives
  useEffect(() => {
    if (flatListRef.current) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <LinearGradient colors={['#4a90e2', '#357ABD']} style={styles.header}>
        <Text style={styles.headerText}>🤖 Poncho AI Chat</Text>
      </LinearGradient>
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={item => item.id}
        renderItem={({ item, index }) => <ChatBubble item={item} index={index} />}
        contentContainerStyle={styles.chatContainer}
      />
      <View style={styles.inputBar}>
        <TextInput
          style={styles.input}
          placeholder="Escribe tu mensaje..."
          value={input}
          onChangeText={setInput}
          onSubmitEditing={sendMessage}
          returnKeyType="send"
        />
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
          <Text style={styles.sendText}>Enviar</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    paddingTop: 40,
    paddingBottom: 10,
    backgroundColor: '#4a90e2',
    alignItems: 'center',
  },
  headerText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  chatContainer: {
    padding: 10,
    flexGrow: 1,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#4a90e2',
    borderRadius: 15,
    padding: 10,
    maxWidth: '80%',
  },
  botBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    maxWidth: '80%',
  },
  messageText: {
    color: '#333',
  },
  inputBar: {
    flexDirection: 'row',
    padding: 5,
    borderTopWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
  },
  input: {
    flex: 1,
    paddingHorizontal: 10,
    fontSize: 16,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
  },
  sendButton: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 12,
    marginLeft: 5,
    backgroundColor: '#4a90e2',
    borderRadius: 20,
  },
  sendText: {
    color: '#fff',
    fontWeight: '600',
  },
});
