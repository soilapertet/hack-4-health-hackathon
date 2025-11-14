import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';

type InsightsProps = {
    breathingPattern: string;
    abnormalSubtype?: string;
    diagnosis?: string;
    image?: string;
    confidence?: string;
    timestamp?: string;
}

export default function Insights({
    breathingPattern,
    abnormalSubtype,
    diagnosis,
    image,
    confidence,
    timestamp
}: InsightsProps) {

    const router = useRouter();

    return (
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
            <View style={styles.container}>
                <View style={{ marginBottom: 30 }}>
                    <Text style={styles.heading}>Breathing Report</Text>
                </View>
                <View style={styles.statusContainer}>
                    <Text style={styles.status}>NORMAL</Text>
                </View>
                <View style={styles.reportContainer}>
                    <View style={styles.analysisContainer}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                            <MaterialIcons name="error-outline" size={24} color="#272635" />
                            <Text style={styles.subHeading}>Detected Issues</Text>
                        </View>
                        <Text style={styles.statusText}>None</Text>
                    </View>
                    <View style={styles.analysisContainer}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                            <MaterialIcons name="medical-information" size={24} color="#272635" />
                            <Text style={styles.subHeading}>Diagnosis</Text>
                        </View>
                        <Text style={styles.statusText}>None</Text>
                    </View>
                    <View style={styles.analysisContainer}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                            <MaterialIcons name="verified" size={24} color="#272635" />
                            <Text style={styles.subHeading}>Accuracy</Text>
                        </View>
                        <Text style={styles.statusText}>80%</Text>
                    </View>
                    <View style={styles.analysisContainer}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                            <MaterialIcons name="analytics" size={24} color="#272635" />
                            <Text style={styles.subHeading}>Extra</Text>
                        </View>
                        <Text style={styles.statusText}>None</Text>
                    </View>
                </View>
            </View>
        </ScrollView>

    );
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
        flex: 1,
        flexDirection: 'column',
        backgroundColor: '#F8FAFC'
    },
    heading: {
        fontSize: 28,
        fontWeight: '800',
        color: '#272635',
        textAlign: 'center'
    },
    subHeading: {
        fontSize: 20,
        fontWeight: '800',
        marginLeft: 5,
        color: '#272635',
        textAlign: 'center'
    },
    text: {
        color: '#272635',
        textAlign: 'center',
        fontWeight: '600'
    },
    statusText: {
        color: '#272635',
        textAlign: 'center',
        fontWeight: '800'
    },
    status: {
        fontSize: 50,
        fontWeight: 'bold',
        color: '#272635',
        textAlign: 'center'
    },
    statusContainer: {
        borderRadius: 20,
        backgroundColor: '#6EEB83',
        padding: 20,
        shadowColor: '#3AA76D',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.6,
        shadowRadius: 30,
        width: 350,
        alignSelf: 'center'
    },
    reportContainer: {
        marginTop: 40,
        flexDirection: 'row',
        justifyContent: 'center',
        flexWrap: 'wrap',
        gap: 20
    },
    analysisContainer: {
        width: 200,
        height: 150,
        overflow: "hidden",
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 16,
        backgroundColor: "#EEF5FD",
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 4,
    }


})