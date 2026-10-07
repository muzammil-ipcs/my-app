import { View, Pressable, ScrollView, Alert } from 'react-native';
import { Text, Switch } from 'react-native';
import { TextInput } from 'react-native';
import { bgimage } from '../Style';
import { useEffect, useRef, useState } from 'react';
import { Animated } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Image } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import LinearGradient from 'react-native-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import QRCode from 'react-native-qrcode-svg';
import { captureRef } from 'react-native-view-shot';
import RNFS from 'react-native-fs';
import { API_BASE_URL, CARD_BASE_URL } from '../api/Config';

export function Createbg() {
  const navigation = useNavigation<any>();
  const [select, setSelect] = useState('1');

  const translatX = useRef(new Animated.Value(0)).current;
  const linewidth = useRef(new Animated.Value(130)).current;
  const [selectimg, setSelectimg] = useState<any>(null);

  const [selectBg, setSelectBg] = useState<string | null>('gradient1');
  const [gradient, setGradient] = useState<string[]>(['#FF9966', '#FF5E62']);

  const [customImg, setCustomImg] = useState<any>([]);
  const [bgname, setBgname] = useState('');

  const [showlogo, setShowlogo] = useState(false);

  const [position, setPosition] = useState<any>({
    top: 10,
    left: 10,
  });
  const [selectposition, setSelectposition] = useState(1);
  const [selectsiza, setSelectsize] = useState(2);

  const [size, setSize] = useState(40);

  const [username, setUsername] = useState('');
  const [bcard_url, setBcard_url] = useState('');
  const [bcard_id, setBcard_id] = useState('');

  const DEFAULT_GRADIENT = 'linear-gradient(160deg, #FF9966 0%, #FF5E62 100%)';

  const [backgroundvalue, setBackgroundvalue] =
    useState<string>(DEFAULT_GRADIENT);

  useEffect(() => {
    async function getBcard() {
      try {
        const token = await AsyncStorage.getItem('token');
        const user_Id = await AsyncStorage.getItem('user_Id');
        const response = await fetch(
          `${API_BASE_URL}/api/businesscard/getBcardWithUserId`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              user_id: user_Id,
            }),
          },
        );

        const data = await response.json();
        if (data.code === 200 || data.result[0]?.bcard_url) {
          await setBcard_url(data.result[0]?.bcard_url);
          console.log('Bcard_url:', bcard_url);
          await setUsername(data.result[0]?.firstName);
          console.log('username:', username);
          await setBcard_id(data.result[0]?._id);
          console.log('Bcard_id: ', bcard_id);
        } else {
          console.log('bacr_url Not found');
        }
      } catch (error) {
        console.log('something went wrong', error);
      }
    }

    getBcard();
  }, []);
  // ...existing code...
  function Selectimg() {
    launchImageLibrary(
      {
        mediaType: 'photo',
        selectionLimit: 1,
        includeBase64: true,
        quality: 0.8,
        maxWidth: 1600,
        maxHeight: 1600,
      },
      response => {
        const asset = response.assets?.[0];

        if (!asset?.uri || !asset.base64) {
          return;
        }

        const imageData = `data:${asset.type || 'image/jpeg'};base64,${
          asset.base64
        }`;

        const newImg = {
          uri: asset.uri,
          imageData,
        };
        setBgname('');
        setSelectimg(newImg);

        // The API stores wallpaper_image on disk and saves its path in MongoDB.
        // Keep the base64 value out of background_value to avoid storing it twice.
        setBackgroundvalue(asset.uri);

        setCustomImg((prevImg: any[]) => {
          const newIndex = prevImg.length;
          setSelectBg('custom' + (newIndex + 1));
          return [newImg, ...prevImg];
        });
      },
    );
  }

  // ...existing code...

  function selecttab(tab: string) {
    setSelect(tab);

    Animated.parallel([
      Animated.spring(translatX, {
        toValue: tab === '1' ? 0 : 130,
        useNativeDriver: false,
      }),

      Animated.spring(linewidth, {
        toValue: tab === '1' ? 110 : 60,
        useNativeDriver: false,
      }),
    ]).start();
  }
  // ADD THIS FUNCTION HERE
  function getBackgroundType() {
    if (!selectBg) {
      return '';
    }

    if (selectBg.startsWith('gradient')) {
      return 'gradient';
    }

    if (selectBg.startsWith('image') || selectBg.startsWith('custom')) {
      return 'image';
    }

    return '';
  }
  async function screenshotToBase64(uri: string) {
    try {
      const filePath = uri.replace('file://', '');

      const base64 = await RNFS.readFile(filePath, 'base64');

      return `data:image/png;base64,${base64}`;
    } catch (error) {
      console.log('Base64 conversion error:', error);
      return '';
    }
  }

  const qrcode_url = bcard_url ? `${CARD_BASE_URL}/card/${bcard_url}` : '';
  console.log('qr code url:', qrcode_url);

  async function downloadPng(screenshotUri: string) {
    try {
      console.log('download start...');
      const fileName = `background_${Date.now()}.png`;

      const downloadPath = `${RNFS.DownloadDirectoryPath}/${fileName}`;

      const sourcePath = screenshotUri.replace('file://', '');

      await RNFS.copyFile(sourcePath, downloadPath);

      console.log('PNG saved:', downloadPath);

      return true;
    } catch (error) {
      console.log('Download error:', error);

      Alert.alert('Error', 'Failed to download image.');

      return false;
    }
  }

  async function Createbg(shoulddownload = false) {
    try {
      const token = await AsyncStorage.getItem('token');
      const userId = await AsyncStorage.getItem('user_Id');

      if (!previewRef.current) {
        Alert.alert('Error', 'Preview is not available.');
        return;
      }

      // Capture the preview
      const screenshotUri = await captureRef(previewRef, {
        format: 'png',
        quality: 1,
      });

      console.log('Screenshot Created:', screenshotUri);

      // Convert screenshot to Base64
      const screenshotBase64 = await screenshotToBase64(screenshotUri);

      if (!screenshotBase64) {
        Alert.alert('Error', 'Screenshot conversion failed.');
        return;
      }
      if (shoulddownload) {
        const download = await downloadPng(screenshotUri);

        Alert.alert('Success', 'Image downloaded successfully.');
        if (!download) {
          return;
        }
      }

      console.log('Screenshot Base64 length:', screenshotBase64.length);

      const payload = {
        user: userId,

        bcard_id: bcard_id,

        bcard_url: bcard_url,

        background_type: getBackgroundType(),

        background_value: backgroundvalue,

        heading: username,

        qr_position:
          selectposition === 1
            ? 'top-left'
            : selectposition === 2
            ? 'top-right'
            : selectposition === 3
            ? 'bottom-left'
            : 'bottom-right',

        qr_size: size === 30 ? 'small' : size === 40 ? 'medium' : 'large',

        screen_type: 'mobile',

        show_logo: showlogo,

        show_scan_instructions: true,

        title: bgname,

        wallpaper_image: screenshotBase64,
      };

      const response = await fetch(`${API_BASE_URL}/api/wallpaper/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.code === 200) {
        console.log(data);
        navigation.goBack();
      }
      if (data.code === 400) {
        Alert.alert('Background Limit Reached!');
        navigation.goBack();
      }
    } catch (error) {
      console.log('Api is not working :', error);
    }
  }

  const previewRef = useRef<View>(null);

  return (
    <View style={{ backgroundColor: '#F5F2E9', flex: 1, padding: 20 }}>
      <View style={bgimage.Header}>
        <Pressable
          onPress={() => {
            navigation.goBack();
          }}
        >
          <Text style={{ fontWeight: 'bold' }}>
            <Text
              style={{ fontSize: 20, alignSelf: 'center', fontWeight: 'bold' }}
            >
              ←
            </Text>{' '}
            Go back
          </Text>
        </Pressable>
      </View>
      <Text style={{ fontWeight: 'bold', marginTop: 20 }}>Title</Text>
      <TextInput
        placeholder="Enter background Image name"
        value={bgname}
        onChangeText={text => {
          setBgname(text);
        }}
      />
      <View style={{ borderColor: 'black', borderWidth: 0.9 }} />

      <View ref={previewRef} collapsable={false} style={bgimage.custmbg}>
        {qrcode_url ? (
          <View
            style={{
              position: 'absolute',
              zIndex: 2,
              alignItems: 'center',
              backgroundColor: '#FFFFFF',
              borderRadius: 10,
              padding: 8,
              top: position.top,
              right: position.right,
              bottom: position.bottom,
              left: position.left,
            }}
          >
            <QRCode value={qrcode_url} size={size} />
            {showlogo && (
              <View
                style={{
                  position: 'absolute',
                  top: size / 2 - size * 0.125,
                  left: size / 2 - size * 0.125,
                  width: size * 0.25,
                  height: size * 0.25,
                  backgroundColor: '#FFFFFF',
                  borderRadius: 6,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Text
                  style={{
                    fontSize: size * 0.12,
                    fontWeight: 'bold',
                    color: '#000000',
                  }}
                >
                  {username?.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
            <Text style={{ fontSize: 10, fontWeight: 'bold' }}>{username}</Text>
          </View>
        ) : (
          <View></View>
        )}
        {selectimg ? (
          <Image
            source={selectimg}
            style={{
              width: '102%',
              height: '102%',
              left: '-1%',
              top: '-1%',
              borderRadius: 20,
              backgroundColor: '#E5E0D3',
            }}
            resizeMode="cover"
          />
        ) : selectBg ? (
          <LinearGradient
            colors={gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              width: '100%',
              height: '100%',
              borderRadius: 20,
            }}
          />
        ) : null}
      </View>
      <View style={{ flexDirection: 'row' }}>
        <Pressable
          onPress={() => {
            selecttab('1');
          }}
        >
          <Text style={select === '1' ? bgimage.selecttxt : bgimage.txt}>
            Background Image
          </Text>
        </Pressable>
        <Pressable
          onPress={() => {
            selecttab('2');
          }}
        >
          <Text style={select === '2' ? bgimage.selecttxt : bgimage.txt}>
            Details
          </Text>
        </Pressable>
        <Animated.View
          style={[
            {
              transform: [{ translateX: translatX }],
              width: linewidth,
            },
            bgimage.moveview,
          ]}
        />
      </View>
      {select === '1' ? (
        <ScrollView
          contentContainerStyle={{
            width: '100%',
          }}
        >
          <View
            style={{
              width: '100%',
              flexDirection: 'row',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
            }}
          >
            <Pressable onPress={Selectimg} style={{ width: '48%' }}>
              <View style={bgimage.addimgview}>
                <Image source={require('../assets/add_image_icon.png')} />
                <Text style={{ color: 'white' }}>Upload Image</Text>
              </View>
            </Pressable>

            {customImg.map((image: any, index: number) => (
              <Pressable
                key={index}
                onPress={() => {
                  setSelectimg(image);
                  setSelectBg('custom' + (index + 1));
                  setBackgroundvalue('');
                }}
                style={{ width: '48%' }}
              >
                <View style={bgimage.defaultimage}>
                  <Image
                    source={image}
                    style={{
                      width: '99%',
                      height: '100%',
                      borderRadius: 20,
                      borderColor:
                        selectBg === 'custom' + (index + 1)
                          ? '#FE3D12'
                          : '#E5E0D3',
                      borderWidth: 1,
                    }}
                    resizeMode="cover"
                  />
                </View>
              </Pressable>
            ))}

            <Pressable
              onPress={() => {
                setSelectBg('gradient1');
                setGradient(['#FF9966', '#FF5E62']);
                setSelectimg(null);
                setBackgroundvalue(
                  'linear-gradient(160deg, #FF9966 0%, #FF5E62 100%)',
                );
                setBgname('Sunset Glow');
              }}
              style={{ width: '48%' }}
            >
              <View>
                <LinearGradient
                  colors={['#FF9966', '#FF5E62']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={[
                    bgimage.defaultimage,
                    {
                      borderColor:
                        selectBg === 'gradient1' ? '#FE3D12' : '#E5E0D3',
                      borderWidth: 1,
                    },
                  ]}
                />
              </View>
            </Pressable>

            <Pressable
              onPress={() => {
                setSelectBg('gradient2');
                setGradient(['#141E30', '#243B55']);
                setSelectimg(null);
                setBackgroundvalue(
                  'linear-gradient(160deg, #141E30 0%, #243B55 100%)',
                );
                setBgname('Midnight Blue');
              }}
              style={{ width: '48%' }}
            >
              <View>
                <LinearGradient
                  colors={['#141E30', '#243B55']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={[
                    bgimage.defaultimage,
                    {
                      borderColor:
                        selectBg === 'gradient2' ? '#FE3D12' : '#E5E0D3',
                      borderWidth: 1,
                    },
                  ]}
                />
              </View>
            </Pressable>

            <Pressable
              onPress={() => {
                setSelectBg('gradient3');
                setGradient(['#667EEA', '#764BA2', '#F093FB']);
                setSelectimg(null);
                setBackgroundvalue(
                  'linear-gradient(160deg, #667EEA 0%, #764BA2 50%, #F093FB 100%)',
                );
                setBgname('Purple Dream');
              }}
              style={{ width: '48%' }}
            >
              <View>
                <LinearGradient
                  colors={['#667EEA', '#764BA2', '#F093FB']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={[
                    bgimage.defaultimage,
                    {
                      borderColor:
                        selectBg === 'gradient3' ? '#FE3D12' : '#E5E0D3',
                      borderWidth: 1,
                    },
                  ]}
                />
              </View>
            </Pressable>

            <Pressable
              onPress={() => {
                const image = require('../assets/business.webp');
                setSelectBg('image1');
                setSelectimg(image);
                setBackgroundvalue('business.webp');
                setBgname('Business ');
              }}
              style={{ width: '48%' }}
            >
              <View style={bgimage.defaultimage}>
                <Image
                  source={require('../assets/business.webp')}
                  style={{
                    width: '100%',
                    height: '100%',
                    backgroundColor: '#E5E0D3',
                    borderRadius: 20,
                    borderColor: selectBg === 'image1' ? '#FE3D12' : '#E5E0D3',
                    borderWidth: 1,
                  }}
                />
              </View>
            </Pressable>

            <Pressable
              onPress={() => {
                const image = require('../assets/card.webp');
                setSelectBg('image2');
                setSelectimg(image);
                setBackgroundvalue('Card.webp');
                setBgname('Card');
              }}
              style={{ width: '48%' }}
            >
              <View style={bgimage.defaultimage}>
                <Image
                  source={require('../assets/card.webp')}
                  style={{
                    width: '100%',
                    height: '100%',
                    backgroundColor: '#E5E0D3',
                    borderRadius: 20,
                    borderColor: selectBg === 'image2' ? '#FE3D12' : '#E5E0D3',
                    borderWidth: 1,
                  }}
                />
              </View>
            </Pressable>

            <Pressable
              onPress={() => {
                const image = require('../assets/card3.webp');
                setSelectBg('image3');
                setSelectimg(image);
                setBackgroundvalue('Card3.webp');
                setBgname('Card double');
              }}
              style={{ width: '48%' }}
            >
              <View style={bgimage.defaultimage}>
                <Image
                  source={require('../assets/card3.webp')}
                  style={{
                    width: '100%',
                    height: '100%',
                    backgroundColor: '#E5E0D3',
                    borderRadius: 20,
                    borderColor: selectBg === 'image3' ? '#FE3D12' : '#E5E0D3',
                    borderWidth: 1,
                  }}
                />
              </View>
            </Pressable>

            <Pressable
              onPress={async () => {
                const image = require('../assets/mobile.webp');
                setSelectBg('image4');
                setSelectimg(image);
                setBackgroundvalue('mobile.webp');
                setBgname('B-Card');
              }}
              style={{ width: '48%' }}
            >
              <View style={bgimage.defaultimage}>
                <Image
                  source={require('../assets/mobile.webp')}
                  style={{
                    width: '100%',
                    height: '100%',
                    backgroundColor: '#E5E0D3',
                    borderRadius: 20,
                    borderColor: selectBg === 'image4' ? '#FE3D12' : '#E5E0D3',
                    borderWidth: 1,
                  }}
                />
              </View>
            </Pressable>

            <Pressable
              onPress={() => {
                const image = require('../assets/smartwatch.webp');
                setSelectBg('image5');
                setSelectimg(image);
                setBackgroundvalue('smartwatch.webp');
                setBgname('Smart way');
              }}
              style={{ width: '48%' }}
            >
              <View style={bgimage.defaultimage}>
                <Image
                  source={require('../assets/smartwatch.webp')}
                  style={{
                    width: '100%',
                    height: '100%',
                    backgroundColor: '#E5E0D3',
                    borderRadius: 20,
                    borderColor: selectBg === 'image5' ? '#FE3D12' : '#E5E0D3',
                    borderWidth: 1,
                  }}
                />
              </View>
            </Pressable>
          </View>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
            }}
          >
            <Pressable
              style={[bgimage.detailsbtn, { width: '48%' }]}
              onPress={() => {
                Createbg(true);
              }}
            >
              <Text style={bgimage.detailsbtntxt}>Create & Download</Text>
            </Pressable>

            <Pressable
              style={[bgimage.detailsbtn, { width: '45%' }]}
              onPress={() => {
                Createbg();
              }}
            >
              <Text style={bgimage.detailsbtntxt}>Create</Text>
            </Pressable>
          </View>
        </ScrollView>
      ) : (
        <ScrollView
          contentContainerStyle={{ width: '100%' }}
          style={{ marginLeft: 8 }}
        >
          <Text style={[bgimage.detailstitle, { alignSelf: 'flex-start' }]}>
            Personal Details
          </Text>
          <Text style={bgimage.detailssubtitle}>Heading</Text>
          <View
            style={{
              borderWidth: 1,
              borderRadius: 10,
              padding: 10,
              alignItems: 'flex-start',
              margin: 5,
              borderColor: '#222',
            }}
          >
            <Text>{username}</Text>
          </View>
          <Text style={[bgimage.detailstitle, { alignSelf: 'flex-start' }]}>
            Details Section
          </Text>
          <Text style={bgimage.detailssubtitle}>Position</Text>

          <View
            style={{
              width: '100%',
              flexDirection: 'row',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
            }}
          >
            <Pressable
              style={{ width: '48%' }}
              onPress={() => {
                setPosition({ top: 10, left: 10 });
                setSelectposition(1);
              }}
            >
              <View
                style={[
                  bgimage.position,
                  { borderColor: selectposition === 1 ? '#FE3D12' : '#222' },
                ]}
              >
                <View
                  style={[bgimage.positionsubview, { alignSelf: 'flex-start' }]}
                />
              </View>
            </Pressable>

            <Pressable
              style={{ width: '48%' }}
              onPress={() => {
                setPosition({ top: 10, right: 10 });
                setSelectposition(2);
              }}
            >
              <View
                style={[
                  bgimage.position,
                  { borderColor: selectposition === 2 ? '#FE3D12' : '#222' },
                ]}
              >
                <View
                  style={[bgimage.positionsubview, { alignSelf: 'flex-end' }]}
                />
              </View>
            </Pressable>
            <Pressable
              style={{ width: '48%' }}
              onPress={() => {
                setPosition({ bottom: 10, left: 10 });
                setSelectposition(3);
              }}
            >
              <View
                style={[
                  bgimage.position,
                  { borderColor: selectposition === 3 ? '#FE3D12' : '#222' },
                ]}
              >
                <View
                  style={[
                    bgimage.positionsubview,
                    { alignSelf: 'flex-start', marginTop: 60 },
                  ]}
                />
              </View>
            </Pressable>

            <Pressable
              style={{ width: '48%' }}
              onPress={() => {
                setPosition({ bottom: 10, right: 10 });
                setSelectposition(4);
              }}
            >
              <View
                style={[
                  bgimage.position,
                  { borderColor: selectposition === 4 ? '#FE3D12' : '#222' },
                ]}
              >
                <View
                  style={[
                    bgimage.positionsubview,
                    { alignSelf: 'flex-end', marginTop: 60 },
                  ]}
                />
              </View>
            </Pressable>
          </View>

          <Text style={bgimage.detailssubtitle}>Size</Text>
          <View
            style={{
              flexDirection: 'row',
              width: '100%',
              justifyContent: 'space-between',
            }}
          >
            <Pressable
              style={[
                bgimage.qrsize,
                { borderColor: selectsiza === 1 ? '#FE3D12' : '#222' },
              ]}
              onPress={() => {
                setSize(30);
                setSelectsize(1);
              }}
            >
              <View>
                <Text style={bgimage.detailstitle}>Small</Text>
              </View>
            </Pressable>

            <Pressable
              style={[
                bgimage.qrsize,
                { borderColor: selectsiza === 2 ? '#FE3D12' : '#222' },
              ]}
              onPress={() => {
                setSize(40);
                setSelectsize(2);
              }}
            >
              <View>
                <Text style={bgimage.detailstitle}>Medium</Text>
              </View>
            </Pressable>

            <Pressable
              style={[
                bgimage.qrsize,
                { borderColor: selectsiza === 3 ? '#FE3D12' : '#222' },
              ]}
              onPress={() => {
                setSize(50);
                setSelectsize(3);
              }}
            >
              <View>
                <Text style={bgimage.detailstitle}>Large</Text>
              </View>
            </Pressable>
          </View>

          {/* after add company logo the qr not scan  */}

          <Text style={[bgimage.detailstitle, { alignSelf: 'flex-start' }]}>
            Company logo
          </Text>
          <View
            style={{ flexDirection: 'row', justifyContent: 'space-between' }}
          >
            <Text style={bgimage.detailssubtitle}>
              Display a logo in the Qr code
            </Text>
            <Switch
              value={showlogo}
              onValueChange={value => {
                setShowlogo(value);
              }}
              trackColor={{
                false: '#D1D7E0',
                true: '#FF3B1F',
              }}
              thumbColor="#FFFFFF"
              style={{ marginRight: 10 }}
            />
          </View>

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
            }}
          >
            <Pressable
              style={[bgimage.detailsbtn, { width: '45%' }]}
              onPress={() => {
                Createbg(true);
              }}
            >
              <Text style={bgimage.detailsbtntxt}>Create & Download</Text>
            </Pressable>

            <Pressable
              style={[bgimage.detailsbtn, { width: '45%' }]}
              onPress={() => {
                Createbg();
              }}
            >
              <Text style={bgimage.detailsbtntxt}>Create</Text>
            </Pressable>
          </View>
        </ScrollView>
      )}
    </View>
  );
}
