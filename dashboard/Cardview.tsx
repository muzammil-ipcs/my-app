import { Text, View, Pressable } from 'react-native';
import { Pressanimation } from './pressanimation';
import { Animated } from 'react-native';
import { cardstyle, Style } from '../Style';


export function Cardview({navigation}:any) {
  const { animationbtn, onpressin, onpressout } = Pressanimation();


  return (
    <View style={cardstyle.mainview}>
      <Text style={cardstyle.title}>Card View</Text>

      <Animated.View
        style={{
          marginTop: '75%',

          transform: [{ scale: animationbtn }],
          alignItems: 'center',
        }}
      >
        <Pressable
          style={[Style.mainbtn, { width: 140 }]}
          onPressIn={onpressin}
          onPressOut={onpressout}
          onPress={()=>{
            navigation.navigate("Createcard")
            
          }}
        >
          <Text style={Style.btntxt}>Add Card</Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}
