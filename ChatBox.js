import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Easing,
} from 'react-native';
import axios from 'axios';
import Constants from 'expo-constants';

const API_URL = 'http://192.168.56.1:1234/api/v1/chat';
const AUTH_TOKEN =
  Constants?.expoConfig?.extra?.authToken ??
  Constants?.manifest?.extra?.authToken ??
  '';

const CONTACT = {
  name: 'Poncho',
  subtitle: 'FaceTime',
  initials: 'P',
};

function TypingDots() {
  const dots = [
    useRef(new Animated.Value(0.35)).current,
    useRef(new Animated.Value(0.35)).current,
    useRef(new Animated.Value(0.35)).current,
  ];

  useEffect(() => {
    const loops = dots.map((value, index) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(index * 160),
          Animated.timing(value, {
            toValue: 1,
            duration: 280,
            useNativeDriver: true,
            easing: Easing.out(Easing.ease),
          }),
          Animated.timing(value, {
            toValue: 0.35,
            duration: 280,
            useNativeDriver: true,
            easing: Easing.in(Easing.ease),
          }),
        ])
      )
    );
    loops.forEach((loop) => loop.start());
    return () => loops.forEach((loop) => loop.stop());
  }, []);

  return (
    <View style={styles.typingBubble}>
      {dots.map((opacity, index) => (
        <Animated.View key={index} style={[styles.typingDot, { opacity }]} />
      ))}
    </View>
  );
}

const ChatBubble = ({ item, grouped }) => {
  const translateY = useRef(new Animated.Value(10)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 0,
        duration: 220,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const bubbleStyle = [
    styles.bubble,
    item.isUser ? styles.userBubble : styles.botBubble,
    item.isUser
      ? {
          borderTopRightRadius: grouped.withPrev ? 6 : 18,
          borderBottomRightRadius: grouped.withNext ? 6 : 18,
        }
      : {
          borderTopLeftRadius: grouped.withPrev ? 6 : 18,
          borderBottomLeftRadius: grouped.withNext ? 6 : 18,
        },
  ];

  return (
    <Animated.View
      style={[
        styles.bubbleRow,
        item.isUser ? styles.userRow : styles.botRow,
        { transform: [{ translateY }], opacity, marginTop: grouped.withPrev ? 2 : 10 },
      ]}
    >
      <View style={bubbleStyle}>
        <Text style={styles.messageText}>{item.text}</Text>
      </View>
    </Animated.View>
  );
};

function EmptyState() {
  return (
    <View style={styles.empty}>
      <View style={styles.emptyAvatar}>
        <Text style={styles.emptyInitial}>{CONTACT.initials}</Text>
      </View>
      <Text style={styles.emptyName}>{CONTACT.name}</Text>
      <Text style={styles.emptyHint}>iMessage · FaceTime</Text>
    </View>
  );
}

export default function ChatBox() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const flatListRef = useRef(null);
  const canSend = input.trim().length > 0 && !isTyping;

  const listData = useMemo(() => {
    if (!isTyping) return messages;
    return [...messages, { id: 'typing', typing: true, isUser: false }];
  }, [messages, isTyping]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || isTyping) return;

    const userMsg = { id: Date.now().toString(), text, isUser: true };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await axios.post(
        API_URL,
        {
          model: 'qwen2.5-coder-7b-instruct',
          input: text,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${AUTH_TOKEN}`,
          },
        }
      );
      const botMsg = {
        id: (Date.now() + 1).toString(),
        text: response.data?.output?.[0]?.content ?? 'Sin respuesta',
        isUser: false,
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 2).toString(),
          text: 'No se pudo entregar este mensaje.',
          isUser: false,
        },
      ]);
      console.warn(e);
    } finally {
      setIsTyping(false);
    }
  };

  useEffect(() => {
    if (!flatListRef.current) return;
    requestAnimationFrame(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    });
  }, [listData]);

  const renderItem = ({ item, index }) => {
    if (item.typing) {
      return (
        <View style={[styles.bubbleRow, styles.botRow, { marginTop: 10 }]}>
          <TypingDots />
        </View>
      );
    }

    const prev = messages[index - 1];
    const next = messages[index + 1];
    const grouped = {
      withPrev: Boolean(prev && prev.isUser === item.isUser),
      withNext: Boolean(next && next.isUser === item.isUser),
    };

    return <ChatBubble item={item} grouped={grouped} />;
  };

  return (
    <KeyboardAvoidingView
      style={styles.shell}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerIdentity}>
          <View style={styles.headerAvatar}>
            <Text style={styles.headerInitial}>{CONTACT.initials}</Text>
          </View>
          <View>
            <Text style={styles.headerName}>{CONTACT.name}</Text>
            <Text style={styles.headerSubtitle}>{CONTACT.subtitle}</Text>
          </View>
        </View>
        <View style={styles.callButton}>
          <View style={styles.callDot} />
        </View>
      </View>

      <FlatList
        ref={flatListRef}
        data={listData}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={[
          styles.chatContainer,
          messages.length === 0 && !isTyping && styles.chatEmpty,
        ]}
        ListEmptyComponent={EmptyState}
        ListHeaderComponent={
          messages.length > 0 ? (
            <Text style={styles.timestamp}>Hoy</Text>
          ) : null
        }
        keyboardShouldPersistTaps="handled"
      />

      {messages.length > 0 && messages[messages.length - 1].isUser && !isTyping ? (
        <Text style={styles.delivered}>Entregado</Text>
      ) : null}

      <View style={styles.composerWrap}>
        <View style={styles.composer}>
          <TextInput
            style={styles.input}
            placeholder="iMessage"
            placeholderTextColor="#6E6E73"
            value={input}
            onChangeText={setInput}
            onSubmitEditing={sendMessage}
            returnKeyType="send"
            blurOnSubmit={false}
            multiline
          />
        </View>
        <TouchableOpacity
          style={[styles.sendButton, canSend ? styles.sendButtonActive : styles.sendButtonIdle]}
          onPress={sendMessage}
          disabled={!canSend}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Enviar"
        >
          <Text style={[styles.sendArrow, canSend && styles.sendArrowActive]}>↑</Text>
        </TouchableOpacity>
      </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  shell: {
    flex: 1,
    width: '100%',
    backgroundColor: '#000000',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#1C1C1E',
  },
  headerIdentity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1C1C1E',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#2C2C2E',
  },
  headerInitial: {
    color: '#F2F2F7',
    fontSize: 16,
    fontWeight: '600',
  },
  headerName: {
    color: '#F2F2F7',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  headerSubtitle: {
    color: '#8E8E93',
    fontSize: 12,
    marginTop: 1,
  },
  callButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#14261A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  callDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#30D158',
  },
  chatContainer: {
    paddingHorizontal: 12,
    paddingBottom: 8,
    flexGrow: 1,
  },
  chatEmpty: {
    justifyContent: 'center',
  },
  timestamp: {
    alignSelf: 'center',
    color: '#636366',
    fontSize: 12,
    fontWeight: '500',
    marginVertical: 18,
    letterSpacing: 0.2,
  },
  empty: {
    alignItems: 'center',
    paddingBottom: 48,
  },
  emptyAvatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#1C1C1E',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#2C2C2E',
  },
  emptyInitial: {
    color: '#F2F2F7',
    fontSize: 36,
    fontWeight: '500',
  },
  emptyName: {
    color: '#F2F2F7',
    fontSize: 22,
    fontWeight: '600',
    letterSpacing: -0.4,
  },
  emptyHint: {
    color: '#8E8E93',
    fontSize: 14,
    marginTop: 4,
  },
  bubbleRow: {
    maxWidth: '78%',
  },
  userRow: {
    alignSelf: 'flex-end',
  },
  botRow: {
    alignSelf: 'flex-start',
  },
  bubble: {
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  userBubble: {
    backgroundColor: '#30D158',
  },
  botBubble: {
    backgroundColor: '#1C1C1E',
  },
  messageText: {
    color: '#FFFFFF',
    fontSize: 17,
    lineHeight: 22,
    letterSpacing: -0.2,
  },
  typingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1C1C1E',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 5,
  },
  typingDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#8E8E93',
  },
  delivered: {
    alignSelf: 'flex-end',
    color: '#8E8E93',
    fontSize: 11,
    paddingHorizontal: 18,
    paddingBottom: 6,
  },
  composerWrap: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: Platform.OS === 'web' ? 16 : 10,
    gap: 8,
  },
  composer: {
    flex: 1,
    minHeight: 36,
    maxHeight: 120,
    borderRadius: 20,
    backgroundColor: '#000000',
    borderWidth: 1,
    borderColor: '#3A3A3C',
    justifyContent: 'center',
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'web' ? 8 : 4,
  },
  input: {
    color: '#F2F2F7',
    fontSize: 17,
    lineHeight: 22,
    paddingTop: Platform.OS === 'ios' ? 6 : 4,
    paddingBottom: Platform.OS === 'ios' ? 6 : 4,
    outlineStyle: 'none',
  },
  sendButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 1,
  },
  sendButtonIdle: {
    backgroundColor: '#2C2C2E',
  },
  sendButtonActive: {
    backgroundColor: '#30D158',
  },
  sendArrow: {
    color: '#636366',
    fontSize: 18,
    fontWeight: '700',
    marginTop: -1,
  },
  sendArrowActive: {
    color: '#000000',
  },
});
