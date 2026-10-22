// App.js
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, StyleSheet } from 'react-native';
import ChatBox from './ChatBox';

export default function App() {
    return (
        <SafeAreaView style={styles.safeArea}>
            <ChatBox />
            <StatusBar style="auto" />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#f5f5f5', // coincide con el fondo usado en ChatBox
    },
});
