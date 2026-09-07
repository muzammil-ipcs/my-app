import { View, Pressable, ScrollView } from 'react-native';
import { Text } from 'react-native';
import { TextInput } from 'react-native';
import { bgimage } from '../Style';
import { useRef, useState } from 'react';
import { Animated } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Image } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';

export function Createbg() {
  const navigation = useNavigation<any>();
  const [select, setSelect] = useState('1');

  const translatX = useRef(new Animated.Value(0)).current;
  const linewidth = useRef(new Animated.Value(130)).current;
  const [selectimg, setSelectimg] = useState<any>('');

  function Selectimg() {
    launchImageLibrary(
      {
        mediaType: 'photo',
        selectionLimit: 1,
      },
      response => {
        if (response.assets) {
          const uri = response.assets[0].uri;
          setSelectimg(uri);
        }
      },
    );
  }

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
      <TextInput placeholder="Enter background Image name" />
      <View style={{ borderColor: 'black', borderWidth: 0.9 }} />
      <View style={bgimage.custmbg}>
        {selectimg && <Image source={{ uri: selectimg }} style={{width:"100%",height:"100%",borderRadius:20,}} resizeMode="cover"/>}
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
      <ScrollView>
        <View style={{ flexDirection: 'row' }}>
          <Pressable onPress={Selectimg}>
            <View style={bgimage.addimgview}>
              {selectimg ? (
                <Image source={{ uri: selectimg }} style={{width:"100%",height:"80%"}} resizeMode='contain'/>
              ) : (
                <Image source={require('../assets/add_image_icon.png')} />
              )}
              <Text style={{ color: 'white' }}>Upload Image</Text>
            </View>
          </Pressable>
          <View style={bgimage.addimgview}>
            <Image source={require('../assets/add_image_icon.png')} />
            <Text style={{ color: 'white' }}>Upload Image</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
