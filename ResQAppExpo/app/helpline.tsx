import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';

const helplines = [
  { id: '1', name: 'Women Helpline', number: '1091' },
  { id: '2', name: 'Police Emergency', number: '100' },
  { id: '3', name: 'National Emergency Number', number: '112' },
  { id: '4', name: 'Child Helpline', number: '1098' },
  { id: '5', name: 'Mental Health Helpline', number: '08046110007' },
  { id: '6', name: 'Cyber Crime Helpline', number: '155260' },
  { id: '7', name: 'Senior Citizen Helpline', number: '1291' },
  { id: '8', name: 'Domestic Abuse (NGO)', number: '181' },
];

const Helpline = () => {
  const [search, setSearch] = useState('');

  const filteredHelplines = helplines.filter(item =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  const makeCall = async (number: string) => {
    const url = `tel:${number}`;
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    } else {
      Alert.alert('Error', 'Phone call not supported on this device.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>📞 Emergency Helplines</Text>

      <TextInput
        style={styles.searchBar}
        placeholder="Search helpline..."
        value={search}
        onChangeText={setSearch}
      />

      <FlatList
        data={filteredHelplines}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            activeOpacity={0.7}
            onPress={() => makeCall(item.number)}
          >
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.number}>{item.number}</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>No results found</Text>}
      />
    </View>
  );
};

export default Helpline;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 16,
    paddingTop: 30,
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  searchBar: {
    height: 45,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  card: {
    backgroundColor: '#ffffff',
    padding: 18,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
  },
  number: {
    fontSize: 14,
    color: '#555',
    marginTop: 4,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 40,
    color: '#999',
    fontSize: 16,
  },
});
