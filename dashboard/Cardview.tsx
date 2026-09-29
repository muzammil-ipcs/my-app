import { Text, View, Pressable, Image } from 'react-native';
import { usePressanimation } from './pressanimation';
import { Animated } from 'react-native';
import { cardstyle, Style } from '../Style';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Createcardstyle } from '../Style';
import { Bcard_Qrcode } from './qrcode';

function Checkcard({
  navigation,
  animationbtn,
  onpressin,
  onpressout,
  bcard,
}: any) {
  const fullName = [bcard?.namePrefix, bcard?.firstName, bcard?.lastName]
    .filter(Boolean)
    .join(' ');

  const companyImage = bcard?.comapny_logo
    ? bcard.comapny_logo.startsWith('http')
      ? bcard.comapny_logo
      : `http://10.0.2.2:5004/public/${bcard.comapny_logo}`
    : null;

  const profileImage = bcard?.profile_photo
    ? bcard.profile_photo.startsWith('http')
      ? bcard.profile_photo
      : `http://10.0.2.2:5004/public/${bcard.profile_photo}`
    : null;

  return (
    <View>
      {bcard ? (
        <View>
          <Animated.View
            style={{
              margin: 10,
              alignSelf: 'flex-start',
              transform: [{ scale: animationbtn }],
              alignItems: 'center',
            }}
          >
            <Pressable
              style={[Style.mainbtn, { width: 120 }]}
              onPressIn={onpressin}
              onPressOut={onpressout}
              onPress={() =>
                navigation.navigate(
                  'Createcard',
                  {
                    isEditmode: 'edit',
                    Card: bcard,
                  },
                  console.log('carddata navigate for edit', bcard),
                )
              }
            >
              <Text style={Style.btntxt}>Edit card</Text>
            </Pressable>
          </Animated.View>

          <View style={cardstyle.getcardview}>
            <View style={cardstyle.frame1}>
              {companyImage ? (
                <Image
                  source={{ uri: companyImage }}
                  style={Createcardstyle.companylogo}
                  resizeMode="contain"
                />
              ) : (
                <Image
                  source={require('../assets/company_logo.png')}
                  style={Createcardstyle.companylogo}
                />
              )}
              {profileImage ? (
                <Image
                  source={{ uri: profileImage }}
                  style={Createcardstyle.profileimg}
                  resizeMode="cover"
                />
              ) : (
                <Image
                  source={require('../assets/camera_icon.png')}
                  style={Createcardstyle.cameraicon}
                />
              )}
            </View>
            <View style={cardstyle.frame2}>
              <Text style={Createcardstyle.name}>{fullName}</Text>
              <Text style={Createcardstyle.role}>{bcard.role || '--'}</Text>
              <View style={Createcardstyle.userinput}>
                <Image
                  source={require('../assets/call_icon.png')}
                  style={Createcardstyle.callicon}
                />
                <Text style={Createcardstyle.call}>{bcard.cellPhone}</Text>
              </View>
              <View style={Createcardstyle.userinput}>
                <Image
                  source={require('../assets/email_icon.png')}
                  style={Createcardstyle.callicon}
                />
                <Text style={Createcardstyle.call}>
                  {bcard.email || 'demo@gmail.com'}
                </Text>
              </View>

              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginTop: 10,
                }}
              >
                <Pressable style={[Createcardstyle.savecontact, { flex: 1 }]}>
                  <Text style={Createcardstyle.btntxt}>Save Contack</Text>
                </Pressable>
              </View>
            </View>
          </View>
          <Image
            source={require('../assets/iphone (1).png')}
            style={cardstyle.iphone}
            resizeMode="stretch"
          />
        </View>
      ) : (
        <View>
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
              onPress={() =>
                navigation.navigate('Createcard', {
                  isEditmode: 'add',
                  Card: bcard,
                })
              }
            >
              <Text style={Style.btntxt}>Add Card</Text>
            </Pressable>
          </Animated.View>
        </View>
      )}
    </View>
  );
}

export function Cardview({ navigation }: any) {
  const { animationbtn, onpressin, onpressout } = usePressanimation();
  const [showview, setShowview] = useState('cardview');
  const [bcard, setBcard] = useState<any>(null);

  useEffect(() => {
    async function getprofile() {
      AsyncStorage.setItem('templte_id', '63b3c94e23c17d10871b3312');
      try {
        console.log('get profile ......... ');
        const user_Id = await AsyncStorage.getItem('user_Id');
        const token = await AsyncStorage.getItem('token');
        console.log('user Id:', user_Id);
        console.log('login token:', token);
        const response = await fetch(
          'http://10.0.2.2:5004/api/users/getuserprofile',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              user: user_Id,
            }),
          },
        );
        const data = await response.json();
        console.log('user profile :', data);

        if (data.code === 200 || data.status === 'success') {
          const response1 = await fetch(
            'http://10.0.2.2:5004/api/businesscard/getBcardWithUserId',
            {
              method: 'POST',
              headers: {
                'Content-type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                user_id: user_Id,
              }),
            },
          );
          const getcard = await response1.json();
          if (
            getcard.code === '200' ||
            getcard.result[0]?.cardStatus === 'active'
          ) {
            console.log('user bcard find successfully', getcard.result[0]);
            await AsyncStorage.setItem('cardadded', 'true');
            setBcard(getcard.result[0]);
            await AsyncStorage.setItem(
              'getcard',
              JSON.stringify(getcard.result[0]),
            );
            await AsyncStorage.setItem('bcard_id', getcard.result[0]._id);

            const subscription_response = await fetch(
              'http://10.0.2.2:5004/api/subscription/me',
              {
                method: 'GET',
                headers: {
                  'Content-type': 'application/json',
                  Authorization: `Bearer ${token}`,
                },
              },
            );

            const Subscription = await subscription_response.json();
            if (subscription_response.ok || Subscription.code === 200) {
              console.log('subscription status', Subscription.result?.status);
              await AsyncStorage.setItem(
                'subscription_status',
                Subscription.result?.status,
              );
            } else {
              await AsyncStorage.removeItem('subscription_status');
              console.log('subsciption not found');
            }
          } else {
            await AsyncStorage.setItem('cardadded', 'false');
          }
        }
      } catch (error) {
        console.log('profile not find', error);
        await AsyncStorage.setItem('cardadded', 'false');
      }
    }
    getprofile();
  }, []);

  return (
    <View style={cardstyle.mainview}>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-around',
          marginTop: 20,
          width: '100%',
        }}
      >
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
        <View>
          <Checkcard
            navigation={navigation}
            animationbtn={animationbtn}
            onpressin={onpressin}
            onpressout={onpressout}
            bcard={bcard}
          />
        </View>
      )}

      {showview === 'qr' && <Bcard_Qrcode bcard={bcard} />}
    </View>
  );
}
