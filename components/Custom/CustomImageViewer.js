import React, { useState, useEffect } from 'react';
import { View, Modal, StyleSheet, Dimensions, TouchableOpacity, Text } from 'react-native';
import { GestureHandlerRootView, PinchGestureHandler, PanGestureHandler, TapGestureHandler } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  useAnimatedGestureHandler,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { AntDesign } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const CustomImageViewer = ({ isVisible, imageUrl, images, initialIndex = 0, onClose }) => {
  const { theme } = useTheme();
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const scale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  // Determine which images to use - either the images array or single imageUrl
  const imageList = images && images.length > 0 ? images : (imageUrl ? [{ uri: imageUrl }] : []);
  const currentImage = imageList[currentIndex];

  // Reset current index when modal opens
  useEffect(() => {
    if (isVisible) {
      setCurrentIndex(initialIndex);
    }
  }, [isVisible, initialIndex]);

  const pinchHandler = useAnimatedGestureHandler({
    onStart: (_, ctx) => {
      ctx.scale = scale.value;
      ctx.translateX = translateX.value;
      ctx.translateY = translateY.value;
    },
    onActive: (event, ctx) => {
      const newScale = Math.min(Math.max(ctx.scale * event.scale, 0.3), 5);
      scale.value = newScale;
      
      // Adjust translation to keep zoom centered on focal point
      const focalX = event.focalX - SCREEN_WIDTH / 2;
      const focalY = event.focalY - SCREEN_HEIGHT / 2;
      
      translateX.value = ctx.translateX + focalX * (newScale - ctx.scale);
      translateY.value = ctx.translateY + focalY * (newScale - ctx.scale);
    },
    onEnd: () => {
      if (scale.value < 1) {
        scale.value = withSpring(1, { damping: 15, stiffness: 150 });
        translateX.value = withSpring(0, { damping: 15, stiffness: 150 });
        translateY.value = withSpring(0, { damping: 15, stiffness: 150 });
      } else {
        // Constrain translation within bounds
        const maxTranslateX = (SCREEN_WIDTH * (scale.value - 1)) / 2;
        const maxTranslateY = (SCREEN_HEIGHT * (scale.value - 1)) / 2;
        
        if (Math.abs(translateX.value) > maxTranslateX) {
          translateX.value = withSpring(Math.sign(translateX.value) * maxTranslateX);
        }
        if (Math.abs(translateY.value) > maxTranslateY) {
          translateY.value = withSpring(Math.sign(translateY.value) * maxTranslateY);
        }
      }
    },
  });

  const panHandler = useAnimatedGestureHandler({
    onStart: (_, ctx) => {
      ctx.translateX = translateX.value;
      ctx.translateY = translateY.value;
    },
    onActive: (event, ctx) => {
      if (scale.value > 1) {
        translateX.value = ctx.translateX + event.translationX;
        translateY.value = ctx.translateY + event.translationY;
      }
    },
    onEnd: () => {
      if (scale.value > 1) {
        const maxTranslateX = (SCREEN_WIDTH * (scale.value - 1)) / 2;
        const maxTranslateY = (SCREEN_HEIGHT * (scale.value - 1)) / 2;

        if (Math.abs(translateX.value) > maxTranslateX) {
          translateX.value = withSpring(Math.sign(translateX.value) * maxTranslateX, { damping: 15, stiffness: 150 });
        }
        if (Math.abs(translateY.value) > maxTranslateY) {
          translateY.value = withSpring(Math.sign(translateY.value) * maxTranslateY, { damping: 15, stiffness: 150 });
        }
      }
    },
  });

  // Double tap to zoom handler
  const doubleTapHandler = useAnimatedGestureHandler({
    onEnd: (event) => {
      const isZoomedIn = scale.value > 1;
      
      if (isZoomedIn) {
        // Reset to normal view
        scale.value = withSpring(1, { damping: 15, stiffness: 150 });
        translateX.value = withSpring(0, { damping: 15, stiffness: 150 });
        translateY.value = withSpring(0, { damping: 15, stiffness: 150 });
      } else {
        // Zoom in to 2x at tap location
        const targetScale = 2;
        const tapX = event.x - SCREEN_WIDTH / 2;
        const tapY = event.y - SCREEN_HEIGHT / 2;
        
        scale.value = withSpring(targetScale, { damping: 15, stiffness: 150 });
        translateX.value = withSpring(-tapX * (targetScale - 1), { damping: 15, stiffness: 150 });
        translateY.value = withSpring(-tapY * (targetScale - 1), { damping: 15, stiffness: 150 });
      }
    },
  });

  const resetValues = () => {
    scale.value = withSpring(1);
    translateX.value = withSpring(0);
    translateY.value = withSpring(0);
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  const handleClose = () => {
    resetValues();
    onClose();
  };

  const goToNext = () => {
    if (currentIndex < imageList.length - 1) {
      setCurrentIndex(currentIndex + 1);
      resetValues();
    }
  };

  const goToPrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      resetValues();
    }
  };

  if (!currentImage) {
    return null;
  }

  return (
    <Modal
      transparent={true}
      visible={isVisible}
      onRequestClose={handleClose}
      animationType="fade"
      statusBarTranslucent={true}
    >
      <GestureHandlerRootView style={styles.container}>
        <View style={[styles.backdrop, { backgroundColor: theme.colors.background }]}>
          <TouchableOpacity 
            style={styles.backgroundClose} 
            activeOpacity={1} 
            onPress={handleClose}
          />
          <View style={styles.content}>
            <TouchableOpacity 
              style={styles.closeButton} 
              onPress={handleClose}
              hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
            >
              <AntDesign name="close" size={24} color="white" />
            </TouchableOpacity>

            {/* Image counter */}
            {imageList.length > 1 && (
              <View style={styles.counter}>
                <Text style={styles.counterText}>
                  {currentIndex + 1} / {imageList.length}
                </Text>
              </View>
            )}

            {/* Navigation arrows */}
            {imageList.length > 1 && currentIndex > 0 && (
              <TouchableOpacity style={styles.leftArrow} onPress={goToPrevious}>
                <AntDesign name="left" size={24} color="white" />
              </TouchableOpacity>
            )}

            {imageList.length > 1 && currentIndex < imageList.length - 1 && (
              <TouchableOpacity style={styles.rightArrow} onPress={goToNext}>
                <AntDesign name="right" size={24} color="white" />
              </TouchableOpacity>
            )}
            
            <TapGestureHandler onGestureEvent={doubleTapHandler} numberOfTaps={2}>
              <Animated.View>
                <PanGestureHandler onGestureEvent={panHandler}>
                  <Animated.View>
                    <PinchGestureHandler onGestureEvent={pinchHandler}>
                      <Animated.Image
                        source={{ uri: currentImage.uri }}
                        style={[styles.image, animatedStyle]}
                        resizeMode="contain"
                      />
                    </PinchGestureHandler>
                  </Animated.View>
                </PanGestureHandler>
              </Animated.View>
            </TapGestureHandler>
          </View>
        </View>
      </GestureHandlerRootView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backdrop: {
    flex: 1,
  },
  backgroundClose: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 5,
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 10,
    padding: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
  },
  counter: {
    position: 'absolute',
    top: 40,
    left: 20,
    zIndex: 10,
    padding: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
  },
  counterText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  leftArrow: {
    position: 'absolute',
    left: 20,
    top: '50%',
    zIndex: 10,
    padding: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 25,
    transform: [{ translateY: -25 }],
  },
  rightArrow: {
    position: 'absolute',
    right: 20,
    top: '50%',
    zIndex: 10,
    padding: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 25,
    transform: [{ translateY: -25 }],
  },
  image: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    backgroundColor: 'transparent',
  },
});

export default CustomImageViewer;