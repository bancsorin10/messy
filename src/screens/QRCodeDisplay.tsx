import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Alert,
  Share,
  ActivityIndicator
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import Svg, { Rect, Path } from 'react-native-svg';
import { NavigationParamList } from '../types';
import { apiService } from '../services/api';
import { isWeb } from '../utils/platform';
import QRCodeLib from 'qrcode';

const RenderSvgPaths = ({ svgString }: { svgString: string }) => {
  const paths = svgString.match(/<path[^>]*>/g) || [];
  
  return (
    <>
      {paths.map((path, i) => {
        const dMatch = path.match(/d="([^"]+)"/);
        const fillMatch = path.match(/fill="([^"]+)"/);
        const strokeMatch = path.match(/stroke="([^"]+)"/);
        if (!dMatch) return null;
        
        const color = fillMatch ? fillMatch[1] : (strokeMatch ? strokeMatch[1] : 'black');
        return <React.Fragment key={i}><Path d={dMatch[1]} fill={color} stroke={strokeMatch ? color : undefined} /></React.Fragment>;
      })}
    </>
  );
};

const QRCodeDisplay = () => {
  const [isPrinting, setIsPrinting] = useState(false);
  const [svgString, setSvgString] = useState<string>('');
  const [viewBox, setViewBox] = useState<string>('0 0 21 21');
  
  const route = useRoute();
  const { type, id, name } = route.params as NavigationParamList['QRCodeDisplay'];
  
  const qrValue = `${type}:${id}`;
  const displayTitle = `${name} (${type === 'cabinet' ? 'Cabinet' : 'Item'})`;

  useEffect(() => {
    const generateQR = async () => {
      try {
        const svg = await QRCodeLib.toString(qrValue, { type: 'svg', width: 200 });
        console.log('Generated SVG, length:', svg?.length);
        
        const vbMatch = svg.match(/viewBox="([^"]+)"/);
        if (vbMatch) {
          setViewBox(vbMatch[1]);
        }
        
        setSvgString(svg);
      } catch (err) {
        console.error('QR generation failed:', err);
      }
    };
    generateQR();
  }, [qrValue]);

  const captureQRCode = async (): Promise<string> => {
    if (!svgString) {
      console.log('SVG string is empty:', svgString);
      throw new Error('QR code not generated yet');
    }
    console.log('Sending SVG, length:', svgString.length);
    return btoa(svgString);
  };

  const handlePrint = async () => {
    try {
      setIsPrinting(true);
      const base64Image = await captureQRCode();
      await apiService.printQRCode(base64Image);
      Alert.alert('Success', 'QR code sent to printer successfully');
    } catch (error) {
      console.error('Print failed:', error);
      Alert.alert('Error', 'Failed to print QR code');
    } finally {
      setIsPrinting(false);
    }
  };

  const handleShare = async () => {
    try {
      const base64Image = await captureQRCode();
      
      const dataUrl = `data:image/svg+xml;base64,${base64Image}`;
      
      await Share.share({
        title: `QR Code for ${name}`,
        url: dataUrl,
        message: `${displayTitle}\nQR Code: ${qrValue}`
      });
    } catch (error) {
      console.error('Share failed:', error);
      Alert.alert('Error', 'Failed to share QR code');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{displayTitle}</Text>
        <Text style={styles.qrValue}>{qrValue}</Text>
      </View>

      <View style={styles.qrContainer}>
        {svgString ? (
          <View style={styles.qrWrapper}>
            {isWeb() ? (
              <div dangerouslySetInnerHTML={{ __html: svgString }} />
            ) : (
              <View style={{ width: 200, height: 200, backgroundColor: 'white' }}>
                <Svg width="100%" height="100%" viewBox={viewBox}>
                  <Rect x="0" y="0" width="100%" height="100%" fill="white" />
                  <RenderSvgPaths svgString={svgString} />
                </Svg>
              </View>
            )}
          </View>
        ) : (
          <ActivityIndicator size="large" />
        )}
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.printButton]}
          onPress={handlePrint}
          disabled={isPrinting}
        >
          {isPrinting ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <Text style={styles.buttonText}>
              {isPrinting ? 'Printing...' : 'Print QR'}
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.shareButton]}
          onPress={handleShare}
        >
          <Text style={styles.buttonText}>📤 Share QR</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.infoTitle}>QR Code Information</Text>
        <Text style={styles.infoText}>Type: {type}</Text>
        <Text style={styles.infoText}>ID: {id}</Text>
        <Text style={styles.infoText}>Name: {name}</Text>
        <Text style={styles.infoText}>QR Value: {qrValue}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { padding: 20, backgroundColor: 'white', alignItems: 'center' },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 8 },
  qrValue: { fontSize: 14, color: '#666', fontFamily: 'monospace' },
  qrContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  qrWrapper: { 
    padding: 20, 
    backgroundColor: 'white', 
    borderRadius: 12, 
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4
  },
  buttonContainer: { 
    flexDirection: 'row', 
    padding: 20, 
    gap: 10 
  },
  button: { 
    flex: 1, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    padding: 12, 
    borderRadius: 8,
    gap: 8
  },
  printButton: { backgroundColor: '#007AFF' },
  shareButton: { backgroundColor: '#34C759' },
  buttonText: { 
    color: 'white', 
    fontWeight: 'bold', 
    fontSize: 16 
  },
  infoContainer: { 
    padding: 20, 
    backgroundColor: 'white', 
    margin: 10, 
    borderRadius: 8,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0'
  },
  infoTitle: { 
    fontSize: 16, 
    fontWeight: 'bold', 
    marginBottom: 10 
  },
  infoText: { 
    fontSize: 14, 
    color: '#666', 
    marginBottom: 4 
  }
});

export default QRCodeDisplay;