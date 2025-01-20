import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import React, { useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Dimensions, Text } from 'react-native';
import { IconSymbol } from '@/components/ui/IconSymbol';

const SCREEN_WIDTH = Dimensions.get('window').width;
const CAMERA_SIZE = SCREEN_WIDTH;

export default function LogScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const cameraView = useRef<CameraView>(null);

  if (!permission) {
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <TouchableOpacity onPress={requestPermission}>
          <IconSymbol name="camera.fill" size={48} color="#666" />
        </TouchableOpacity>
      </View>
    );
  }

  const takePicture = async () => {
    try {
      const photo = await cameraView.current?.takePictureAsync({
        quality: 1,
        base64: true,
        exif: false,
      });
      if (photo) {
        router.push({ 
          pathname: "/review",
          params: { 
            photoUri: photo.uri
          }
        });
      }
    } catch (error) {
      console.error('Failed to take picture:', error);
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled && result.assets[0]) {
      router.push({ 
        pathname: "/review",
        params: { 
          photoUri: result.assets[0].uri
        }
      });
    }
  };

  const handleClose = () => {
    router.back();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Scan Food</Text>
        <TouchableOpacity 
          style={styles.closeButton} 
          onPress={handleClose}
        >
          <IconSymbol name="xmark" size={24} color="white" />
        </TouchableOpacity>
      </View>
      <View style={styles.cameraContainer}>
        <CameraView 
          ref={cameraView}
          style={styles.camera}
          facing="back"
        />
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.galleryButton}
          onPress={pickImage}
        >
          <IconSymbol name="photo.on.rectangle" size={24} color="white" />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.captureButton}
          onPress={takePicture}
        >
          <View style={styles.buttonInner} />
        </TouchableOpacity>
        <View style={styles.spacer} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  title: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraContainer: {
    width: CAMERA_SIZE,
    height: CAMERA_SIZE,
    overflow: 'hidden',
    borderRadius: 10,
  },
  camera: {
    width: CAMERA_SIZE,
    height: CAMERA_SIZE,
  },
  buttonContainer: {
    height: 120,
    backgroundColor: 'transparent',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  galleryButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'white',
  },
  spacer: {
    width: 50,
  },
}); 