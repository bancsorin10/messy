import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationParamList } from '../types';

import CabinetsList from '../screens/CabinetsList';
import CabinetDetails from '../screens/CabinetDetails';
import AddCabinet from '../screens/AddCabinet';
import AddItem from '../screens/AddItem';
import BulkAddItems from '../screens/BulkAddItems';
import QRCodeDisplay from '../screens/QRCodeDisplay';
import QRScanner from '../screens/QRScanner';
import ItemDetails from '../screens/ItemDetails';

const Stack = createStackNavigator<NavigationParamList>();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="CabinetsList">
        <Stack.Screen 
          name="CabinetsList" 
          component={CabinetsList}
          options={{ title: 'Cabinets' }}
        />
        <Stack.Screen 
          name="CabinetDetails" 
          component={CabinetDetails}
          options={({ route }) => ({ title: `Cabinet ${route.params.cabinetId}` })}
        />
        <Stack.Screen 
          name="AddCabinet" 
          component={AddCabinet}
          options={{ title: 'Add Cabinet' }}
        />
        <Stack.Screen 
          name="AddItem" 
          component={AddItem}
          options={{ title: 'Add Item' }}
        />
        <Stack.Screen 
          name="BulkAddItems" 
          component={BulkAddItems}
          options={{ title: 'Scan QR Codes' }}
        />
        <Stack.Screen 
          name="QRCodeDisplay" 
          component={QRCodeDisplay}
          options={{ title: 'QR Code' }}
        />
        <Stack.Screen 
          name="QRScanner" 
          component={QRScanner}
          options={{ title: 'QR Scanner' }}
        />
        <Stack.Screen 
          name="ItemDetails" 
          component={ItemDetails}
          options={{ title: 'Item Details' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;