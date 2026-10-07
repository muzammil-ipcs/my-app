import { View, Text, Pressable } from 'react-native';
import { bgimage, cardstyle, Style } from '../Style';
import { usePressanimation } from './pressanimation';
import { Animated } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
// import QRCode from 'react-native-qrcode-svg';
import { Image } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import RNFS from "react-native-fs"
import { Alert } from 'react-native';
import { API_BASE_URL } from '../api/Config';

export function Bgimage() {
  const navigation = useNavigation<any>();

  const { animationbtn, onpressin, onpressout } = usePressanimation();


  const [background, setBackground] = useState<any[]>([]);
  const [limit , setLimit] = useState("")
  useFocusEffect(
    useCallback(() => {
      List();
    }, []),
  );

  async function List() {
    try {
      const token = await AsyncStorage.getItem('token');
      const user_id = await AsyncStorage.getItem('user_Id');
      const response = await fetch(
        `${API_BASE_URL}/api/wallpaper/mylist`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            user_id: user_id,
          }),
        },
      );

      const data = await response.json();

      if (data.code === 200) {
        setBackground(data.result);

        console.log('result of list:', data.result);
      }
    } catch (error) {
      console.log('something went wrong :', error);
    }
  }

  function formatDate(dateString: string) {
    const date = new Date(dateString);

    return (
      date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }) +
      ', ' +
      date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
      })
    );
  }

  // function getQRPosition(position: string) {
  //   switch (position) {
  //     case 'top-left':
  //       return {
  //         position: 'absolute' as const,
  //         top: 10,
  //         left: 10,
  //       };

  //     case 'top-right':
  //       return {
  //         position: 'absolute' as const,
  //         top: 10,
  //         right: 10,
  //       };

  //     case 'bottom-left':
  //       return {
  //         position: 'absolute' as const,
  //         bottom: 10,
  //         left: 10,
  //       };

  //     case 'bottom-right':
  //       return {
  //         position: 'absolute' as const,
  //         bottom: 10,
  //         right: 10,
  //       };

  //     default:
  //       return {
  //         position: 'absolute' as const,
  //         top: 10,
  //         left: 10,
  //       };
  //   }
  // }
async function downloadBackground(wallpaperImage: string) {
  try {
    if (!wallpaperImage) {
      Alert.alert('Error', 'Background image is not available.');
      return;
    }

    const fileName = `background_${Date.now()}.png`;

    const downloadPath = `${RNFS.DownloadDirectoryPath}/${fileName}`;

    const imageUrl =
      `${API_BASE_URL}/public/` + wallpaperImage;

    console.log('Downloading image from:', imageUrl);
    console.log('Saving image to:', downloadPath);

    const result = await RNFS.downloadFile({
      fromUrl: imageUrl,
      toFile: downloadPath,
    }).promise;

    console.log('Download result:', result);

    if (result.statusCode === 200) {
      Alert.alert(
        'Download Successful',
      );
    } else {
      Alert.alert(
        'Download Failed',
        'Unable to download the background image.',
      );
    }
  } catch (error) {
    console.log('Background download error:', error);

    Alert.alert(
      'Download Failed',
      'Unable to download the background image.',
    );
  }
}
 async function deletebg(item_id: string) {
  try {
    const token = await AsyncStorage.getItem('token');

    const response = await fetch(
      `${API_BASE_URL}/api/wallpaper/delete`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          _id: item_id,
        }),
      },
    );

    const data = await response.json();

    console.log('delete request id:', item_id);
    console.log('delete status:', response.status);
    console.log('delete response:', data);

    if (response.ok && data.code === 200) {
      await List();
      setLimit("")
    }
  } catch (error) {
    console.log('background not delete:', error);
  }
}

  return (
    <View style={{ flex: 1, backgroundColor: '#F5F2E9', marginLeft: 70 }}>
      <Text style={cardstyle.title}>Virtual Background</Text>
      <Animated.View
        style={{
          transform: [{ scale: animationbtn }],
        }}
      >
        <Pressable
          style={[Style.mainbtn, { alignSelf: 'center' }]}
          onPressIn={onpressin}
          onPressOut={onpressout}
          onPress={() => {
            if(background.length >= 2){
              setLimit("You can create a maximum of 2 backgrounds. Please delete one background before creating a new one.")

            }else{
              navigation.navigate("Createbg")
            }
           
          }}
        >
          <Text style={Style.btntxt}>+ Create Background</Text>
        </Pressable>
      </Animated.View>
      {background && (
        
        <View>
          <Text style={{fontSize:12,color:"red",textAlign:"center",padding:2}}>{limit}</Text>
          {background.map(item => {
            // const cardurl = `https://10.0.2.2:5173/card/${item.bcard_url}`;
            console.log('background items :', item);
            console.log('wallpaper', item.wallpaper_image);

            return (
              <View key={item._id}>
                <View style={bgimage.viewbackground}>
                  <View style={{ height: '50%', position: 'relative' }}>
                    {item && (
                      <Image
                        source={{
                          uri:
                            `${API_BASE_URL}/public/` +
                            item.wallpaper_image,
                        }}
                        style={{ width: '100%', height: '100%' }}
                      />
                    )}
                    {/* <View style={[getQRPosition(item.qr_position),{backgroundColor:"#FFFFFF",padding:5,borderRadius:10,alignItems:"center"}]}>
                      <QRCode
                        value={cardurl}
                        size={30}
                        
                      />
                      <Text style={{fontSize:8,}}>{item.heading}</Text>
                    </View> */}
                  </View>
                  <View
                    style={{
                      backgroundColor: '#E8E2D3',
                      height: '50%',
                      borderRadius: 20,
                      padding: 10,
                    }}
                  >
                    <Text style={{ fontWeight: 'bold', marginVertical: 2 }}>
                      {item.title}
                    </Text>
                    <Text style={{ color: '#1e1e1e', fontSize: 12 }}>
                      Card :
                      <Text style={{ fontSize: 13, fontWeight: 'bold' }}>
                        {item.title}
                      </Text>
                    </Text>
                    <Text
                      style={{
                        color: '#1e1e1e',
                        fontSize: 12,
                        marginVertical: 2,
                      }}
                    >
                      Created on :
                      <Text style={{ fontSize: 13, fontWeight: 'bold' }}>
                        {formatDate(item.created_at)}
                      </Text>
                    </Text>

                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <Pressable
                        style={[
                          bgimage.detailsbtn,
                          { padding: 2, width: '70%' },
                        ]}
                        onPress={()=>{
                          downloadBackground(item.wallpaper_image)
                        }}
                      >
                        <Text
                          style={[
                            bgimage.detailsbtntxt,
                            { margin: 2, fontSize: 10 },
                          ]}
                        >
                          Download
                        </Text>
                      </Pressable>
                      <Pressable
                        onPress={() => {
                          deletebg(item._id);
                          
                        }}
                        style={{ margin: 2 }}
                      >
                        <Image source={require('../assets/delete_icon.png')} />
                      </Pressable>
                    </View>
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}
