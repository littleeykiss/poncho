import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, StyleSheet } from 'react-native';
import ChatBox from './ChatBox';

export default function App() {
    return (
        <SafeAreaView style={styles.safeArea}>
            <ChatBox />
            <StatusBar style="light" backgroundColor="#000000" />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#000000',
    },
});
