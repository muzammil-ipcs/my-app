import {
  Linking,
  Pressable,
  View,
  Text,
} from 'react-native';

import QRCode from 'react-native-qrcode-svg';
import { cardstyle, Qrcode_style } from '../Style';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useRef, useState } from 'react';
import { CARD_BASE_URL } from '../api/Config';
import { captureRef } from 'react-native-view-shot';
import { CameraRoll } from '@react-native-camera-roll/camera-roll';

export function Bcard_Qrcode({ bcard }: any) {
  const [subscription, setSubscription] = useState('');
  const [downloadLoading, setDownloadLoading] = useState(false);

  const [Qrmsg,setQrmsg] = useState("")

  const qrRef = useRef<View>(null);

  const bcard_url = bcard?.bcard_url
    ? `${CARD_BASE_URL}/card/${bcard.bcard_url}`
    : '';

  // Check subscription
  useEffect(() => {
    async function checksubscription() {
      try {
        const subscription_status =
          await AsyncStorage.getItem('subscription_status');

        if (
          subscription_status?.toLowerCase() === 'active' &&
          bcard_url !== ''
        ) {
          setSubscription('active');
        } else {
          setSubscription('');
        }
      } catch (error) {
        console.log('Subscription check error:', error);
        setSubscription('');
      }
    }

    checksubscription();
  }, [bcard_url]);

  // Open business card
  async function OpenCard() {
    try {
      await Linking.openURL(bcard_url);
    } catch (error) {
      console.log('Open card error:', error);
      setQrmsg('Unable to open your business card.');
    }
  }

  // Download QR code
  async function DownloadQR() {
    if (!qrRef.current || !bcard_url) {
      setQrmsg("'Unable to save your QR code. Please try again.")
      return;
    }

    try {
      setDownloadLoading(true);

      const uri = await captureRef(qrRef, {
        format: 'png',
        quality: 1,
        result: 'tmpfile',
      });

      await CameraRoll.saveAsset(uri, {
        type: 'photo',
        album: 'MakeMyCard',
      });

       setQrmsg("QR Code Downloaded ")
    } catch (error) {
      console.log('QR Download Error:', error);

      setQrmsg(
        'Unable to save your QR code. Please try again.',
      );
    } finally {
      setDownloadLoading(false);
    }
  }

  return (
    <View style={cardstyle.subview}>

      {subscription === 'active' ? (
        <>
          {/* QR Code Design - This entire view is downloaded */}
          <View
            ref={qrRef}
            collapsable={false}
            style={{
              width: 270,
              padding: 20,
              backgroundColor: '#FFFFFF',
              alignSelf: 'center',
              alignItems: 'center',
              borderRadius: 18,
              borderWidth: 1,
              borderColor: '#E5E0D3',
            }}
          >
            {/* User Details */}
            <Text
              style={{
                fontSize: 19,
                fontWeight: 'bold',
                color: '#222222',
                textAlign: 'center',
              }}
            >
              {[bcard?.firstName, bcard?.lastName]
                .filter(Boolean)
                .join(' ') || 'Your Name'}
            </Text>

            <Text
              style={{
                fontSize: 13,
                color: '#666666',
                marginTop: 5,
                textAlign: 'center',
              }}
            >
              {bcard?.organization || 'Your Organization'}
            </Text>

            {/* QR Code */}
            <View
              style={{
                marginVertical: 18,
                padding: 12,
                backgroundColor: '#FFFFFF',
                borderRadius: 12,
              }}
            >
              <QRCode
                value={bcard_url}
                size={190}
                backgroundColor="#FFFFFF"
                color="#000000"
              />
            </View>

            {/* Scan Instruction */}
            <Text
              style={{
                fontSize: 13,
                fontWeight: '600',
                color: '#333333',
                textAlign: 'center',
              }}
            >
              Scan to view my digital business card
            </Text>

            {/* Branding */}
            <View
              style={{
                width: '100%',
                borderTopWidth: 1,
                borderTopColor: '#EEEEEE',
                marginTop: 18,
                paddingTop: 12,
              }}
            >
              <Text
                style={{
                  fontSize: 12,
                  color: '#FE3D12',
                  fontWeight: 'bold',
                  textAlign: 'center',
                }}
              >
                MAKEMYCARD
              </Text>

              <Text
                style={{
                  fontSize: 10,
                  color: '#999999',
                  textAlign: 'center',
                  marginTop: 3,
                }}
              >
                Digital Business Card
              </Text>
            </View>
          </View>
          {Qrmsg && (
            <Text style={{alignSelf:"center" , fontSize:13 , color:Qrmsg.includes("Downloaded") ? "#1B7A34" : "red" ,margin:5}}>{Qrmsg}</Text>
          )}

          {/* Open Card Button */}
          <Pressable
            style={[
              Qrcode_style.qr_dwld_btn,
              { alignSelf: 'center', marginTop: 15,width:150},
            ]}
            onPress={OpenCard}
            onPressIn={()=>{
              setQrmsg("")}
          }
          >
            <Text style={[Qrcode_style.btntxt]}>
              Open Business Card
            </Text>
          </Pressable>
        

          {/* Download Button */}
          <Pressable
            style={[
              Qrcode_style.qr_dwld_btn,
              {
                alignSelf: 'center',
                marginTop: 10,
                opacity: downloadLoading ? 0.5 : 1,
                width:150
              },
            ]}
            disabled={downloadLoading}
            onPress={DownloadQR}
            onPressIn={()=>{
              setQrmsg("")
            }}
          >
            <Text style={Qrcode_style.btntxt}>
              {downloadLoading
                ? 'Preparing QR...'
                : 'Download QR Code'}
            </Text>
          </Pressable>
     
        </>
      ) : (
        <Text
          style={{
            margin: 8,
            alignSelf: 'center',
            textAlign: 'center',
          }}
        >
          Create an active card subscription to generate your QR code.
        </Text>
      )}
    </View>
  );
}