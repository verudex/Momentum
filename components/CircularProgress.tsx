import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import { heightPercentageToDP as hp } from 'react-native-responsive-screen';

type Props = {
  percentage: number;
  size: number; // optional, default fallback
  color: string; // progress bar color
  bgColor: string; // background circle color
};

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const CircularProgress = ({ percentage, size, color, bgColor }: Props) => {
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const progress = useSharedValue(0);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: interpolate(
      progress.value,
      [0, 100],
      [circumference, circumference - (percentage / 100) * circumference]
    ),
  }));

  useEffect(() => {
    progress.value = withTiming(percentage, {
      duration: 1200,
      easing: Easing.out(Easing.exp),
    });
  }, [percentage]);

  return (
    <View style={styles.wrapper}>
      <Svg width={size} height={size} fill={bgColor}>
        <Circle
          stroke={"rgb(146, 136, 136)"}
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
        />
        <AnimatedCircle
          stroke={color}
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          animatedProps={animatedProps}
          strokeLinecap="round"
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
      <View style={styles.label}>
        <Text style={styles.percent}>{Math.round(percentage)}%</Text>
        <Text style={styles.text}>Achieved</Text>
      </View>
    </View>
  );
};

export default CircularProgress;

const styles = StyleSheet.create({
  wrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: hp(2),
  },
  label: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  percent: {
    fontSize: hp(5),
    fontWeight: 'bold',
    color: 'white',
  },
  text: {
    fontSize: hp(2.5),
    color: 'white',
  },
});
