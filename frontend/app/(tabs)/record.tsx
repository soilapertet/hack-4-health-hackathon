import { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Animated, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import BreathingWave from '../../components/BreathingWave';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';

//'npx expo install expo-audio'
import { useAudioRecorder, AudioModule, RecordingPresets, setAudioModeAsync } from 'expo-audio';

export async function uploadAudio(uri: string) {
    if (!uri) return;
    
    try {
        // Fetch the file as a blob
        const response = await fetch(uri);
        const blob = await response.blob();
        
        // Create FormData with the actual file blob
        const form = new FormData();
        form.append("audio", blob, "breathing.wav");
        
        const apiResponse = await fetch("http://127.0.0.1:8000/api/", {
            method: "POST",
            body: form
        });
        
        if (!apiResponse.ok) {
            throw new Error(`HTTP error! status: ${apiResponse.status}`);
        }
        
        const result = await apiResponse.json();
        return result;
    } catch (error) {
        console.error("Upload failed: ", error);
    }
}

export default function Record() {
    const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
    const [recordedUri, setRecordedUri] = useState<string | null>(null);

    // Record State variables
    const [isRecording, setIsRecording] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [dataReceived, setDataReceived] = useState(false);

    const progress = useRef(new Animated.Value(0)).current;
    const pauseOpacity = useRef(new Animated.Value(0)).current;

    // Reset states when user switches to a different tab
    useFocusEffect(
        React.useCallback(() => {
            // start recording when this screen is focused
            setIsRecording(true);
            return () => {
                setIsRecording(false);
                setIsPaused(false);
                setIsAnalyzing(false);
                setDataReceived(false);
                progress.setValue(0);

                //startNewRecording();

                return () => {
                    progress.stopAnimation();
                }
            };
        }, [])
    );

    // Runs once when the component mounts
    useEffect(() => {
        (async () => {
            await AudioModule.requestRecordingPermissionsAsync();
            await setAudioModeAsync({ playsInSilentMode: true, allowsRecording: true });
        })();
    }, []);


    // Simulate actual recording of breathing
    // Duration = 15 seconds (dummy data)
    useEffect(() => {
        if (!isRecording) return;
        startNewRecording();
    }, [isRecording]);

    // Once recording is done, send audio recording to backend
    // Program will wait from response from backend before updating the state variable -> isWaitingForData
    useEffect(() => {
        const listener = progress.addListener(({ value }) => {
            if (value >= 100) {
                setTimeout(() => {
                    setIsRecording(false);
                    setIsAnalyzing(true);
                }, 500);
            }
        })

        return () => progress.removeListener(listener);
    }, [isRecording]);

    useEffect(() => {
        if (isPaused) {
            Animated.timing(pauseOpacity, {
                toValue: 1,
                duration: 300,
                useNativeDriver: false
            }).start();
        } else {
            Animated.timing(pauseOpacity, {
                toValue: 0,
                duration: 200,
                useNativeDriver: false
            }).start();
        }
    }, [isPaused]);

    useEffect(() => {
        if (!isAnalyzing) return;

        const timer = setTimeout(() => {
            setIsAnalyzing(false);
            setDataReceived(true);
        }, 10000);

        return () => clearTimeout(timer)
    }, [isAnalyzing])

    const startNewRecording = async () => {
        setIsPaused(false);
        setIsRecording(true);
        progress.setValue(0);
        setRecordedUri(null);

        await audioRecorder.prepareToRecordAsync();
        audioRecorder.record();

        Animated.timing(progress, {
            toValue: 100,
            duration: 15000,
            useNativeDriver: false,
        }).start(async ({ finished }) => {
            if (finished && !isPaused) {
                await audioRecorder.stop();
                handleEndSession();
            }
        });
    }

    // Function to handle when the stop button is first clicked
    const handlePause = async () => {
        setIsPaused(true);
        setIsRecording(false);
        progress.stopAnimation();           // stop the progress bar animation
        await audioRecorder.stop();
    }

    // Function to restart a new recording session
    const handleRestart = async () => {
        startNewRecording();
    }

    const handleEndSession = async () => {
        // Update states when recording finishes naturally
        setIsPaused(false);
        setIsRecording(false);
        setIsAnalyzing(true);

        progress.stopAnimation();

        setRecordedUri(audioRecorder.uri);
        if (audioRecorder.uri) await uploadAudio(audioRecorder.uri);


        // Insert logic for stopping the actual microphone session
        // API Call to send the recorded audio to the backend
    }

    return (
        <>
            {/* RECORDING SEESION */}
            {(isRecording || isPaused) && (
                <>
                    <View style={styles.container}>
                        <View style={{ marginBottom: 10 }}>
                            {isRecording && (
                                <>
                                    <Text style={styles.heading}>Recording in progress...</Text>
                                    <Text style={styles.text}>Monitoring your current breathing condition.</Text>
                                </>
                            )}
                            {isPaused && (
                                <>
                                    <Text style={styles.heading}>Recording stop</Text>
                                    <Text style={styles.text}>Session paused. You can restart or end the session.</Text>

                                </>
                            )}
                        </View>
                        <BreathingWave progress={progress} />
                        {isRecording && (
                            <TouchableOpacity
                                style={[styles.controlButton, { backgroundColor: "#EF4444" }]}
                                onPress={handlePause}>
                                <Ionicons name="pause" size={24} color="#F8FAFC" />
                            </TouchableOpacity>
                        )}
                        {isPaused && (
                            <Animated.View style={{ opacity: pauseOpacity }}>
                                <View style={styles.controlContainer}>

                                    {/* Restart button to restart recording session */}
                                    <TouchableOpacity
                                        style={[styles.controlButton, { backgroundColor: "#3B82F6" }]}
                                        onPress={handleRestart}>
                                        <Ionicons name="refresh" size={24} color="#F8FAFC" />
                                    </TouchableOpacity>

                                    {/* Stop button to end session */}
                                    <TouchableOpacity
                                        style={[styles.controlButton, { backgroundColor: "#EF4444" }]}
                                        onPress={handleEndSession}>
                                        <Ionicons name="stop" size={24} color="#F8FAFC" />
                                    </TouchableOpacity>
                                </View>
                            </Animated.View>
                        )}
                    </View>
                </>
            )}

            {/* Display loading animation when in 'isWaitingForData' state */}
            {isAnalyzing && (
                <View style={styles.container}>
                    <View style={styles.center}>

                        <Text style={styles.heading}>Analyzing breathing patterns...</Text>
                        <ActivityIndicator size="large" color="#3B82F6" />
                        <Text style={[styles.text, { marginTop: 10 }]}>
                            Checking for abnormal breathing events.
                        </Text>
                    </View>
                </View>
            )}

            {dataReceived && (
                <View style={styles.container}>
                    <View style={styles.center}>
                        <Text style={styles.heading}>Analysis Complete</Text>
                        <Ionicons name="checkmark-circle" size={60} color="#22C55E" />
                        <Text style={[styles.text, { marginTop: 10 }]}>
                            Generating results...
                        </Text>
                    </View>
                </View>
            )}

            {/* ONLY FOR TESTING RECORDING: Download button for audio in .wav format after recording finishes */}
            {recordedUri && (
                <View style={{ marginTop: 20 }}>
                    <Text>Recording completed!</Text>
                    <a href={recordedUri} download="breathing.wav">
                        <Text style={{ color: "blue" }}>Download Recording</Text>
                    </a>
                </View>
            )}
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F8FAFC'
    },
    heading: {
        fontSize: 28,
        fontWeight: '800',
        color: '#272635',
        textAlign: 'center',
        marginBottom: 10
    },
    text: {
        color: '#272635',
        textAlign: 'center',
        fontWeight: '600'
    },
    button: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        fontWeight: '700',
        backgroundColor: '#93C5FD'
    },
    outerCircle: {
        width: 220,
        height: 220,
        borderRadius: 110,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#93C5FD", // subtle glow tint
        shadowColor: "#3B82F6",     // deeper blue shadow color
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.6,
        shadowRadius: 30,
        elevation: 25,
    },
    percentText: {
        color: "#272635",
        position: 'absolute',
        bottom: 57,
        fontSize: 14,
        fontWeight: "700",
        textAlign: "center",
    },
    center: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    controlContainer: {
        flexDirection: "row",
        gap: 8
    },
    controlButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 10,
        paddingVertical: 8,
        borderRadius: 16,
        marginTop: 20,
        shadowColor: "#000",
        shadowOpacity: 0.2,
        shadowRadius: 6,
        elevation: 5,
    },
})