import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Button, Image } from 'react-native';
import { Camera, CameraView } from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';
import * as Permissions from 'expo-permissions';
import { CameraType } from 'expo-camera/build/legacy/Camera.types';

const CameraComponent: React.FC = () => {
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [type, setType] = useState(CameraType.back);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [isCameraEnabled, setIsCameraEnabled] = useState(true); // New state variable
  const cameraRef = useRef<any>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Permissions.askAsync(Permissions.CAMERA);
      setHasCameraPermission(status === 'granted');
    })();

    // Clean up camera resources when component is unmounted
    return () => {
      setIsCameraEnabled(false); // Disable camera
    };
  }, []);

  

  const takePicture = async () => {
    if (cameraRef.current && isCameraEnabled) { // Check if camera is enabled
      let photo = await cameraRef.current.takePictureAsync();
      setCapturedPhoto(photo.uri);
      savePhoto(photo.uri);
    }
  };

  const savePhoto = async (uri: string) => {
    const { status } = await Permissions.askAsync(Permissions.MEDIA_LIBRARY);
    if (status === 'granted') {
      await MediaLibrary.saveToLibraryAsync(uri);
    } else {
      console.log('Permission denied to save photo to device');
    }
  };

  if (hasCameraPermission === null) {
    return <View />;
  }
  if (hasCameraPermission === false) {
    return <Text>No access to camera</Text>;
  }
  return (
    <View style={{ flex: 1 }}>
      {isCameraEnabled && ( // Render CameraView only if camera is enabled
        <CameraView style={{ flex: 1 }} ref={cameraRef}>
          <View
            style={{
              flex: 1,
              backgroundColor: 'transparent',
              flexDirection: 'row',
              justifyContent: 'space-between',
              margin: 20,
            }}>
            <Button
              title="Flip"
              onPress={() => {
                setType(
                  type === CameraType.back
                    ? CameraType.front
                    : CameraType.back
                );
              }}>
            </Button>
            <Button title="Take Picture" onPress={takePicture} />
          </View>
        </CameraView>
      )}
      {capturedPhoto && (
        <Image
          source={{ uri: capturedPhoto }}
          style={{ flex: 1 }}
        />
      )}
    </View>
  );
};

export default CameraComponent;