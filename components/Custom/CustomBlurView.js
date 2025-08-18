// components/CustomBlurView.js
import React from 'react';
import { BlurView } from 'expo-blur';
import { Canvas, Rect, useBlurMask, Paint } from '@shopify/react-native-skia';
import { Platform, View } from 'react-native';

export const CustomBlurView = ({ 
  children, 
  style, 
  intensity = 50, 
  tint = "light", 
  method = "expo" // "expo" | "skia"
}) => {
  if (method === "expo") {
    return (
      <BlurView intensity={intensity} tint={tint} style={style}>
        {children}
      </BlurView>
    );
  }

  if (method === "skia") {
    return (
      <View style={style}>
        <Canvas style={{ flex: 1 }}>
          <Rect x={0} y={0} width={400} height={400}>
            <Paint mask={useBlurMask(intensity)} />
          </Rect>
        </Canvas>
        <View style={[{ ...StyleSheet.absoluteFillObject }, { overflow: "hidden" }]}>
          {children}
        </View>
      </View>
    );
  }

  return <View style={style}>{children}</View>;
};
