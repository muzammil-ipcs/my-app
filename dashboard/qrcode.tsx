import { Linking, Pressable, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { cardstyle, Qrcode_style } from '../Style';
import { Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';

export function Bcard_Qrcode({ bcard }: any) {
  const [subscription, setSubscription] = useState('');

  useEffect(() => {
    async function checksubscription() {

      const subscription_status = await AsyncStorage.getItem(
        'subscription_status',
      );
      console.log("subscription status :",subscription_status)
      if(subscription_status?.toLowerCase() === "active" && bcard_url !== " "){
        setSubscription("active")
      }
      else{
        setSubscription("")
        console.log("subscription not found")
      }
    }
    checksubscription();
  });

  const bcard_url = bcard?.bcard_url? `http://10.0.2.2:5173/card/${bcard?.bcard_url}` : "";
  console.log('user bcard url:', bcard_url);

  return (
    <View>
      <View style={Qrcode_style.qrview}>
        <View
          style={{
            padding: 10,
            backgroundColor: 'white',
            alignSelf: 'center',
            alignItems: 'center',
            borderRadius: 10,
          }}
        >
          {subscription === "active" ?
            <Pressable
              onPress={() => {
                Linking.openURL(bcard_url);
              }}
            >
              <QRCode value={bcard_url} size={150} />
            </Pressable>
            : 
            <Text>genrate the Qr code</Text>
            }
          
        </View>

        <Pressable style={cardstyle.mainbtn}>
          <Text style={cardstyle.btntxt}>Download Qr</Text>
        </Pressable>
      </View>
    </View>
  );
}
