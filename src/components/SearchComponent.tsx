import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Item, NavigationParamList } from '../types';
import { apiService, parseAPIResponse, getImageUrl } from '../services/api';

type NavigationProp = StackNavigationProp<NavigationParamList>;

interface SearchComponentProps {
  visible: boolean;
  onClose: () => void;
}

const SearchComponent: React.FC<SearchComponentProps> = ({ visible, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Item[]>([]);
  const navigation = useNavigation<NavigationProp>();

  // Debounce function to limit API calls
  const debounce = useCallback((func: Function, delay: number) => {
    let timeoutId: NodeJS.Timeout;
    return (...args: any[]) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(null, args), delay);
    };
  }, []);

  // Search function with debouncing
  const performSearch = useCallback(
    debounce(async (query: string) => {
      if (query.trim().length < 2) {
        setSearchResults([]);
        return;
      }

      try {
        const response = await apiService.searchItems(query.trim());
        const parsedResults = parseAPIResponse<Item>(response);
        setSearchResults(parsedResults);
      } catch (error) {
        console.error('Search error:', error);
        setSearchResults([]);
      }
    }, 300),
    []
  );

  // Update search when query changes
  useEffect(() => {
    if (visible) {
      performSearch(searchQuery);
    }
  }, [searchQuery, visible, performSearch]);

  const handleItemPress = (item: Item) => {
    navigation.navigate('ItemDetails', { itemId: item.id, item });
    onClose();
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleClose = () => {
    onClose();
    setSearchQuery('');
    setSearchResults([]);
  };

  const renderItem = ({ item }: { item: Item }) => (
    <TouchableOpacity
      style={styles.resultItem}
      onPress={() => handleItemPress(item)}
    >
      <View style={styles.itemContent}>
        {/* Item image or avatar */}
        <View style={styles.itemAvatar}>
          {item.photo ? (
            <Image
              source={{ uri: getImageUrl(item.photo) }}
              style={styles.itemImage}
            />
          ) : (
            <Text style={styles.itemAvatarText}>
              {item.name.charAt(0).toUpperCase()}
            </Text>
          )}
        </View>

        {/* Item details */}
        <View style={styles.itemDetails}>
          <Text style={styles.itemName}>{item.name}</Text>
          {item.description && (
            <Text style={styles.itemDescription}>{item.description}</Text>
          )}
          <Text style={styles.cabinetInfo}>Cabinet ID: {item.cabinet_id}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header with search input and close button */}
        <View style={styles.header}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search items..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus
            returnKeyType="search"
          />
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* Search results */}
        <View style={styles.resultsContainer}>
          {searchQuery.trim().length >= 2 && (
            <Text style={styles.resultsCount}>
              {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} found
            </Text>
          )}
          
          <FlatList
            data={searchResults}
            renderItem={renderItem}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.listContainer}
            ListEmptyComponent={
              searchQuery.trim().length >= 2 ? (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>No items found</Text>
                </View>
              ) : null
            }
          />
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    height: 44,
    backgroundColor: '#f0f0f0',
    borderRadius: 22,
    paddingHorizontal: 20,
    fontSize: 16,
    marginRight: 10,
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  resultsContainer: {
    flex: 1,
  },
  resultsCount: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    color: '#666',
    fontSize: 14,
  },
  listContainer: {
    flexGrow: 1,
  },
  resultItem: {
    backgroundColor: 'white',
    marginHorizontal: 10,
    marginVertical: 5,
    borderRadius: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  itemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
  },
  itemAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  itemImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  itemAvatarText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  itemDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  cabinetInfo: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
});

export default SearchComponent;