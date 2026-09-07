import { useRef } from "react";
import { Animated } from "react-native";



export function Pressanimation(){
  const animationbtn = useRef(new Animated.Value(1)).current;

  function onpressin() {
    Animated.spring(animationbtn, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  }

 function onpressout() {
    Animated.spring(animationbtn, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  }

  return{
    animationbtn,
    onpressin,
    onpressout
  }
}