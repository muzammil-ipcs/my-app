import { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  Animated,
  Linking,
} from 'react-native';
import { stylehome } from '../Style';
import AsyncStorage from '@react-native-async-storage/async-storage';

export function Plans({ navigation, route }: any) {
  const [yearly, setYearly] = useState(false);

  const [plan1, setPlan1] = useState<any>('');
  const [plan2, setPlan2] = useState<any>('');
  const [plan3, setPlan3] = useState<any>('');

  useEffect(() => {
    const status = route?.params?.status;
    if (status === 'success') {
      navigation.replace('Createcard', {
        status,
        session_id: route?.params?.session_id,
      });
    } else if (status === 'cancel') {
      navigation.setParams({ status: undefined });
    }
  }, [route?.params?.session_id, route?.params?.status, navigation]);

  useEffect(() => {
    async function GetPlan() {
      try {
        const response = await fetch('http://10.0.2.2:5004/api/plan/public', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        const data = await response.json();
        if (data.code === 200) {
          console.log('plan data', data.result);
          await setPlan1(data.result[0]._id);
          await setPlan2(data.result[1]._id);
          await setPlan3(data.result[2]._id);
          console.log('plan1', plan1);
          console.log('plan2', plan2);
          console.log('plan3', plan3);
        }
      } catch (error) {
        console.log('error', error);
      }
    }
    GetPlan();
  }, [plan1, plan2, plan3]);
  async function Freeplan() {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(
        'http://10.0.2.2:5004/api/subscription/create-checkout-session',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            planId: plan1,
            billingCycle: yearly ? 'yearly' : 'monthly',
            returnTo: 'create-card-mobile',
          }),
        },
      );


      const data = await response.json();
      if (!response.ok || data.code !== 200 || !data.url) {
        throw new Error(data.message ?? 'Unable to start Stripe Checkout');
      }
      if (data.code === 200) {
        console.log('checkout session url:', data);
        await Linking.openURL(data.url);
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
    }
  }

  async function Proplan() {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(
        'http://10.0.2.2:5004/api/subscription/create-checkout-session',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            planId: plan2,
            billingCycle: yearly ? 'yearly' : 'monthly',
            returnTo: 'create-card-mobile',
          }),
        },
      );
      const data = await response.json();
      if (!response.ok || data.code !== 200 || !data.url) {
        throw new Error(data.message ?? 'Unable to start Stripe Checkout');
      }
      if (data.code === 200) {
        console.log('checkout session url:', data);
        await Linking.openURL(data.url);
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
    }
  }

  async function Businessplan() {
    try {
      const token = await AsyncStorage.getItem('token');
      console.log(token);

      const response = await fetch(
        'http://10.0.2.2:5004/api/subscription/create-checkout-session',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            planId: plan3,
            billingCycle: yearly ? 'yearly' : 'monthly',
            returnTo: 'create-card-mobile',
          }),
        },
      );

      const data = await response.json();
      if (!response.ok || data.code !== 200 || !data.url) {
        throw new Error(data.message ?? 'Unable to start Stripe Checkout');
      }
      await Linking.openURL(data.url);
      
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <ScrollView>
      <View>
        <View>
          <Text style={{ textAlign: 'center', fontWeight: 'bold', margin: 20 }}>
            Start free, upgrade when you’re ready.
          </Text>
        </View>

        <Probtn yearly={yearly} setYearly={setYearly} />

        <View style={stylehome.pricevew}>
          <Text style={{ margin: 10, alignSelf: 'flex-start' }}>FREE</Text>
          <Text
            style={{
              marginLeft: 10,
              fontWeight: 'bold',
              fontSize: 22,
              alignSelf: 'flex-start',
            }}
          >
            Free
          </Text>
          <Text style={{ fontWeight: 'bold', fontSize: 22, margin: 10 }}>
            $0 <Text>{yearly ? '/Yearly' : '/Monthly'}</Text>
          </Text>
          <Text style={{ marginLeft: 30 }}>1 Bussiness Card</Text>
          <Pressable style={stylehome.pricebtn} onPress={Freeplan}>
            <Text style={stylehome.btntxt}>Create for Free</Text>
          </Pressable>
        </View>

        <View style={stylehome.priceprovew}>
          <View style={{ flexDirection: 'row' }}>
            <Text style={{ margin: 10, alignSelf: 'flex-start' }}>PRO</Text>
            <Text style={[stylehome.buldbtn, stylehome.btntxt]}>
              Most Popular
            </Text>
          </View>
          <Text
            style={{
              marginLeft: 10,
              fontWeight: 'bold',
              fontSize: 22,
              alignSelf: 'flex-start',
            }}
          >
            Pro
          </Text>
          <Text style={{ fontWeight: 'bold', fontSize: 22, margin: 10 }}>
            {yearly ? '$220' : '$20'}{' '}
            <Text>{yearly ? '/Yearly' : '/month'}</Text>
          </Text>
          <Text style={{ marginLeft: 30 }}>1 Bussiness Card</Text>
          <Text style={{ marginLeft: 30, marginTop: 5 }}>
            Apple & Google Wallet Passes
          </Text>
          <Text style={{ marginLeft: 30, marginTop: 5 }}>Custom URL</Text>
          <Text style={{ marginLeft: 30, marginTop: 5 }}>
            Advanced Analytics
          </Text>
          <Text style={{ marginLeft: 30, marginTop: 5 }}>
            No MakeMyCard Branding
          </Text>

          <Pressable style={stylehome.pricebtn} onPress={Proplan}>
            <Text style={stylehome.btntxt}>Start Pro</Text>
          </Pressable>
        </View>

        <View style={stylehome.pricevew}>
          <Text style={{ margin: 10, alignSelf: 'flex-start' }}>Business</Text>
          <Text
            style={{
              marginLeft: 10,
              fontWeight: 'bold',
              fontSize: 22,
              alignSelf: 'flex-start',
            }}
          >
            Business
          </Text>
          <Text style={{ fontWeight: 'bold', fontSize: 22, margin: 10 }}>
            {yearly ? '$440' : '$40'}{' '}
            <Text>{yearly ? '/Yearly' : '/month'}</Text>
          </Text>
          <Text style={{ marginLeft: 30 }}>1 Bussiness Card</Text>
          <Text style={{ marginLeft: 30, marginTop: 5 }}>
            Apple & Google Wallet Passes
          </Text>
          <Text style={{ marginLeft: 30, marginTop: 5 }}>Custom URL</Text>
          <Text style={{ marginLeft: 30, marginTop: 5 }}>
            Advanced Analytics
          </Text>
          <Text style={{ marginLeft: 30, marginTop: 5 }}>
            No MakeMyCard Branding
          </Text>
          <Text style={{ marginLeft: 30, marginTop: 5 }}>Team Management </Text>

          <Pressable style={stylehome.pricebtn} onPress={Businessplan}>
            <Text style={stylehome.btntxt}>Start Business</Text>
          </Pressable>
        </View>
        <Text style={{ alignSelf: 'center' }}>Need something custom?</Text>
      </View>
    </ScrollView>
  );
}

function Probtn({ yearly, setYearly }: any) {
  const movx2 = useRef(new Animated.Value(yearly ? 100 : 0)).current;

  useEffect(() => {
    Animated.timing(movx2, {
      toValue: yearly ? 100 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [yearly, movx2]);

  return (
    <View style={stylehome.provew}>
      <Animated.View
        style={[
          stylehome.probtn,
          {
            transform: [{ translateX: movx2 }],
          },
        ]}
      />

      {/* Monthly */}
      <Pressable onPress={() => setYearly(false)} style={stylehome.option}>
        <Text style={[stylehome.protxt, !yearly && stylehome.btntxt]}>
          Monthly
        </Text>
      </Pressable>

      {/* Yearly */}
      <Pressable onPress={() => setYearly(true)} style={stylehome.option}>
        <Text style={[stylehome.protxt, yearly && stylehome.btntxt]}>
          Yearly
        </Text>
      </Pressable>
    </View>
  );
}
