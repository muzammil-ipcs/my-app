import { View, Text, Pressable } from 'react-native';
import { cardstyle, Style } from '../Style';
import { Pressanimation } from './pressanimation';
import { Animated } from 'react-native';
import {useNavigation} from '@react-navigation/native';




export function Bgimage() {

    const navigation = useNavigation<any>();

  const { animationbtn, onpressin, onpressout } = Pressanimation();

  return (
    <View style={{ flex: 1, backgroundColor: '#F5F2E9', marginLeft: 70 }}>

        <Text style={cardstyle.title}>Virtual Background</Text>
      <Animated.View
        style={{
          marginTop: '75%',
          transform: [{ scale: animationbtn }],
        }}
      >
        <Pressable
          style={[Style.mainbtn, { alignSelf: 'center' }]}
          onPressIn={onpressin}
          onPressOut={onpressout}
          onPress={()=>{navigation.navigate("Createbg")}}
        >
          <Text style={Style.btntxt}>+ Create Background</Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}
