import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert,
} from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';

// ✅ Define navigation type
type RootStackParamList = {
  sosdial: undefined;
  locationshare: undefined;
  filesave: undefined;
  chat: undefined;
  hiddenfeature: undefined;
  helpline: undefined;
  panicbutton: undefined;
};

// ✅ Define feature grid data
const features = [
  {
    key: 'sos',
    title: 'SOS (Dial Pad)',
    icon: 'call',
    route: 'sosdial',
    color: '#ff3b30',
  },
  {
    key: 'location',
    title: 'Location Share',
    icon: 'location',
    route: 'locationshare',
    color: '#007aff',
  },
  {
    key: 'filesave',
    title: 'File Save',
    icon: 'folder-open',
    route: 'filesave',
    color: '#ff9500',
  },
  {
    key: 'chat',
    title: 'Chat',
    icon: 'chatbubbles',
    route: 'chat',
    color: '#34c759',
  },
  {
    key: 'hide',
    title: 'App Hidden Feature',
    icon: 'eye-off',
    route: 'hiddenfeature',
    color: '#5856d6',
  },
  {
    key: 'helpline',
    title: 'Helpline Contacts',
    icon: 'help-circle',
    route: 'helpline',
    color: '#ff2d55',
  },
];

const HomeScreen = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  // ✅ Render each feature card
  const renderCard = ({ item }: any) => (
    <TouchableOpacity
      style={[styles.card, { shadowColor: item.color }]}
      onPress={() =>
        navigation.navigate(item.route as keyof RootStackParamList)
      }
      activeOpacity={0.8}>
      <Icon name={item.icon} size={40} color={item.color} />
      <Text style={styles.cardText}>{item.title}</Text>
    </TouchableOpacity>
  );

  // ✅ Panic button alert
  const handlePanicPress = () => {
    Alert.alert('🚨 Activate SOS?', 'Do you want to open the Panic Screen?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Open', onPress: () => navigation.navigate('panicbutton') },
    ]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Welcome to ResQ</Text>

      {/* PANIC BUTTON */}
      <TouchableOpacity
        style={styles.panicButton}
        onPress={handlePanicPress}
        activeOpacity={0.8}>
        <Text style={styles.panicButtonText}>🚨 PANIC</Text>
      </TouchableOpacity>

      {/* Feature Grid */}
      <FlatList
        data={features}
        renderItem={renderCard}
        keyExtractor={(item) => item.key}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={{ paddingBottom: 30 }}
      />
    </View>
  );
};

export default HomeScreen;

// ✅ Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
    paddingHorizontal: 20,
    backgroundColor: '#f7f7f7',
  },
  heading: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 25,
    textAlign: 'center',
    color: '#333',
  },
  panicButton: {
    backgroundColor: '#ff3b30',
    paddingVertical: 20,
    borderRadius: 20,
    marginBottom: 25,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  panicButtonText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 25,
    alignItems: 'center',
    justifyContent: 'center',
    width: '48%',
    elevation: 4,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  cardText: {
    marginTop: 12,
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    fontWeight: '600',
  },
});
