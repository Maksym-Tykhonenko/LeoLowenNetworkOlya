import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, Easing, StyleProp, ViewStyle } from 'react-native';
import { useIsFocused } from '@react-navigation/native';

type Dir = 'none' | 'bottom' | 'top' | 'left' | 'right' | 'scale';

type Props = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  initialPlay?: boolean;
  replayOnFocus?: boolean;
  from?: Dir;
  distance?: number;
  duration?: number;
  delay?: number;
  play?: boolean;
  resetOnBlur?: boolean;
};

export default function Appear({
  children,
  style,
  initialPlay = true,
  replayOnFocus = true,
  from = 'bottom',
  distance = 16,
  duration = 320,
  delay = 0,
  play,
  resetOnBlur = true,
}: Props) {
  const isFocused = useIsFocused();
  const opacity = useRef(new Animated.Value(0)).current;
  const trans = useRef(new Animated.Value(1)).current;

  const startTransform = useMemo(() => {
    switch (from) {
      case 'bottom': return [{ translateY: trans.interpolate({ inputRange: [0, 1], outputRange: [0, distance] }) }];
      case 'top':    return [{ translateY: trans.interpolate({ inputRange: [0, 1], outputRange: [0, -distance] }) }];
      case 'left':   return [{ translateX: trans.interpolate({ inputRange: [0, 1], outputRange: [0, -distance] }) }];
      case 'right':  return [{ translateX: trans.interpolate({ inputRange: [0, 1], outputRange: [0, distance] }) }];
      case 'scale':  return [{ scale: trans.interpolate({ inputRange: [0, 1], outputRange: [1, 0.98] }) }];
      default:       return [];
    }
  }, [trans, distance, from]);

  const runIn = (d = delay) => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration, delay: d, useNativeDriver: true, easing: Easing.out(Easing.cubic) }),
      Animated.timing(trans,   { toValue: 0, duration, delay: d, useNativeDriver: true, easing: Easing.out(Easing.cubic) }),
    ]).start();
  };

  const reset = () => {
    opacity.setValue(0);
    trans.setValue(1);
  };

  useEffect(() => {
    if (initialPlay && (play === undefined)) runIn();
  }, []);

  useEffect(() => {
    if (play === undefined) return;
    if (play) runIn(0);
    else if (resetOnBlur) reset();
  }, [play]);

  useEffect(() => {
    if (!replayOnFocus) return;
    if (isFocused) runIn(0);
    else if (resetOnBlur) reset();
  }, [isFocused]);

  return (
    <Animated.View style={[style, { opacity, transform: startTransform }]}>
      {children}
    </Animated.View>
  );
}
