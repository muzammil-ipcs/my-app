import { Text, View, Pressable } from 'react-native';
import { Pressanimation } from './pressanimation';
import { Animated } from 'react-native';
import { cardstyle, Style } from '../Style';
import { useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';





export  function Cardview({ navigation }: any) {
  const { animationbtn, onpressin, onpressout } = Pressanimation();
  const [showview, setShowview] = useState('cardview');
  AsyncStorage.setItem("templte_id","63b3c94e23c17d10871b3312");
  

  return (
    <View style={cardstyle.mainview}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-evenly' }}>
        <Pressable
          onPress={() => {
            setShowview('cardview');
          }}
        >
          <Text
            style={
              showview === 'cardview' ? cardstyle.selecttitle : cardstyle.title
            }
          >
            Card View
          </Text>
        </Pressable>
        <Pressable
          onPress={() => {
            setShowview('qr');
          }}
        >
          <Text
            style={showview === 'qr' ? cardstyle.selecttitle : cardstyle.title}
          >
            QR code
          </Text>
        </Pressable>
        <Pressable
          onPress={() => {
            setShowview('wallet');
          }}
        >
          <Text
            style={
              showview === 'wallet' ? cardstyle.selecttitle : cardstyle.title
            }
          >
            Wallet
          </Text>
        </Pressable>
      </View>

      {showview === 'cardview' && (
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
            onPress={() => {
              navigation.navigate('Createcard');
            }}
          >
            <Text style={Style.btntxt}>Add Card</Text>
          </Pressable>
        </Animated.View>
      )}
      
    </View>
  );
}
