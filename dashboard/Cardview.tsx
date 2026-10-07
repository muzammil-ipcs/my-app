import { Text, View, Pressable, Image } from 'react-native';
import { usePressanimation } from './pressanimation';
import { Animated } from 'react-native';
import { cardstyle, Style } from '../Style';
import { useEffect, useState, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Createcardstyle } from '../Style';
import { Bcard_Qrcode } from './qrcode';
import { API_BASE_URL } from '../api/Config';
import { Wallet } from './Wallet';
import RNFS from 'react-native-fs';
import Share from 'react-native-share';
import ImageResizer from 'react-native-image-resizer';
import Website from '../assets/website.svg';
import Facebook from '../assets/facebook.svg';
import Insta from '../assets/instagram.svg';
import Linkedin from '../assets/linkedin.svg';
import Twitter from '../assets/X.svg';
import { Linking, Easing } from 'react-native';

async function SaveContact(bcard: any) {
  try {
    console.log('bcard data for save contact', bcard);

    const firstname = bcard?.firstName || '';
    const lastname = bcard?.lastName || '';
    const phone = bcard?.cellPhone || '';
    const email = bcard?.email || '';
    const title = bcard?.role || '';

    const website = bcard?.url || '';
    const facebook = bcard?.sociallink_facebook || '';
    const Instagram = bcard?.sociallink_instagram || '';
    const linkidin = bcard?.sociallink_linkedIn || '';
    const twitter = bcard?.sociallink_twitter || '';
    const profile = bcard?.profile_photo;

    if (!firstname && !lastname && !phone && !email) {
      console.log('No contact information available');
      return;
    }

    const fullname = `${firstname} ${lastname}`.trim();

    // --------------------------------------------------
    // PROFILE IMAGE
    // --------------------------------------------------

    let photoLine = '';

    if (profile) {
      const profileUrl = profile.startsWith('http')
        ? profile
        : `${API_BASE_URL}/public/${profile}`;

      console.log('Profile image URL:', profileUrl);

      const originalPath = `${
        RNFS.CachesDirectoryPath
      }/vcf_original_${Date.now()}.png`;

      // Download original image
      const downloadResult = await RNFS.downloadFile({
        fromUrl: profileUrl,
        toFile: originalPath,
      }).promise;

      console.log('Image download status:', downloadResult.statusCode);

      if (downloadResult.statusCode === 200) {
        console.log('Original image:', originalPath);

        // --------------------------------------------------
        // CROP IMAGE TO SQUARE
        // --------------------------------------------------

        const squareImage = await ImageResizer.createResizedImage(
          originalPath,
          600,
          600,
          'JPEG',
          90,
          0,
          RNFS.CachesDirectoryPath,
          false,
          {
            mode: 'stretch',
            onlyScaleDown: false,
          },
        );

        console.log('Square image path:', squareImage.uri);
        console.log('Square image width:', squareImage.width);
        console.log('Square image height:', squareImage.height);

        // --------------------------------------------------
        // CONVERT SQUARE IMAGE TO BASE64
        // --------------------------------------------------

        const resizedPath = squareImage.path;

        const base64 = await RNFS.readFile(resizedPath, 'base64');

        console.log('Square Base64 length:', base64.length);

        // JPEG because ImageResizer created a JPEG
        photoLine = `PHOTO;ENCODING=b;TYPE=JPEG:${base64}`;

        console.log('Square VCF PHOTO created');

        // Remove temporary images
        try {
          await RNFS.unlink(originalPath);
          await RNFS.unlink(resizedPath);
        } catch (cleanupError) {
          console.log('Temporary image cleanup error:', cleanupError);
        }
      } else {
        console.log(
          'Profile image download failed:',
          downloadResult.statusCode,
        );
      }
    }

    // --------------------------------------------------
    // VCF
    // --------------------------------------------------

    const vCard = [
      'BEGIN:VCARD',
      'VERSION:3.0',
      `N:${lastname};${firstname};;;`,
      `FN:${fullname}`,
      phone ? `TEL;TYPE=CELL:${phone}` : '',
      email ? `EMAIL:${email}` : '',
      title ? `TITLE:${title}` : '',
      website ? `URL:${website}` : '',
      facebook ? `URL;TYPE=facebook:${facebook}` : '',
      Instagram ? `URL;TYPE=instagram:${Instagram}` : '',
      linkidin ? `URL;TYPE=linkedin:${linkidin}` : '',
      twitter ? `URL;TYPE=twitter:${twitter}` : '',
      photoLine,
      'END:VCARD',
    ]
      .filter(Boolean)
      .join('\r\n');

    // --------------------------------------------------
    // FILE NAME
    // --------------------------------------------------

    const safeName = fullname
      .trim()
      .replace(/[^a-zA-Z0-9-_ ]/g, '')
      .replace(/\s+/g, '_');

    const fileName = `${safeName || 'Contact'}.vcf`;

    const filepath = `${RNFS.CachesDirectoryPath}/${fileName}`;

    // --------------------------------------------------
    // WRITE VCF FILE
    // --------------------------------------------------

    await RNFS.writeFile(filepath, vCard, 'utf8');

    console.log('VCF file Created:', filepath);

    const fileExists = await RNFS.exists(filepath);

    console.log('VCF file exists:', fileExists);

    console.log('VCF path:', filepath);

    // --------------------------------------------------
    // SHARE / SAVE CONTACT
    // --------------------------------------------------

    await Share.open({
      title: 'Save Contact',
      url: `file://${filepath}`,
      type: 'text/x-vcard',
      failOnCancel: false,
    });
  } catch (error) {
    console.log('Save Contact error:', error);
  }
}

function Checkcard({
  navigation,
  animationbtn,
  onpressin,
  onpressout,
  bcard,
}: any) {
  const capitalizeFirstLetter = (value: string) => {
    return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
  };
  const fullName = [bcard?.namePrefix, bcard?.firstName, bcard?.lastName]
    .filter(Boolean)
    .map(capitalizeFirstLetter)
    .join(' ');

  const companyImage = bcard?.comapny_logo
    ? bcard.comapny_logo.startsWith('http')
      ? bcard.comapny_logo
      : `${API_BASE_URL}/public/${bcard.comapny_logo}`
    : null;

  const profileImage = bcard?.profile_photo
    ? bcard.profile_photo.startsWith('http')
      ? bcard.profile_photo
      : `${API_BASE_URL}/public/${bcard.profile_photo}`
    : null;


    
    // -----------------------------------------------------
    //Animation of Social Icons
    //------------------------------------------------------
      const scrollX = useRef(new Animated.Value(0)).current;

  const website = bcard?.url || '';
  const facebook = bcard?.sociallink_facebook || '';
  const insta = bcard?.sociallink_instagram || '';
  const linkedin = bcard?.sociallink_linkedIn || '';
  const twitter = bcard?.sociallink_twitter || '';

  const socialIcons = [
    website !== '' ? 'website' : null,
    facebook !== '' ? 'facebook' : null,
    insta !== '' ? 'insta' : null,
    linkedin !== '' ? 'linkedin' : null,
    twitter !== '' ? 'x' : null,
  ].filter(Boolean) as string[];

  useEffect(() => {
    scrollX.stopAnimation();
    scrollX.setValue(0);

    if (socialIcons.length > 1) {
      const step = 34;
      const animations: Animated.CompositeAnimation[] = [];

      for (let i = 0; i < socialIcons.length; i++) {
        animations.push(
          Animated.delay(2500)
        );

        animations.push(
          Animated.timing(scrollX, {
            toValue: -(step * (i + 1)),
            duration: 700,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          })
        );
      }

      animations.push(
        Animated.delay(2500)
      );

      animations.push(
        Animated.timing(scrollX, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        })
      );

      Animated.loop(
        Animated.sequence(animations)
      ).start();
    }

    return () => {
      scrollX.stopAnimation();
    };
  }, [socialIcons.length,scrollX]);

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
              <View
                style={{
                  height: 35,
                  width: '100%',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Text
                  numberOfLines={2}
                  adjustsFontSizeToFit
                  minimumFontScale={0.7}
                  style={[Createcardstyle.name, { textAlign: 'center' }]}
                >
                  {fullName}
                </Text>
              </View>
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
                <Pressable
                  style={[Createcardstyle.savecontact, { flex: 1 }]}
                  onPress={() => {
                    SaveContact(bcard);
                  }}
                >
                  <Text style={Createcardstyle.btntxt}>Save Contact</Text>
                </Pressable>

                <View style={{ width: 34, height: 34, overflow: 'hidden' }}>
                  <Animated.View
                    style={{
                      flexDirection: 'row',
                      transform: [{ translateX: scrollX }],
                    }}
                  >
                    {website !== '' && (
                      <Pressable
                        style={{
                          width: 34,
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                        onPress={() => {
                          const url = website.startsWith('https://')
                            ? website
                            : 'https://' + website;
                          Linking.openURL(url);
                          console.log(website);
                        }}
                      >
                        <View>
                          <Website
                            width={24}
                            height={24}
                            style={{ margin: 5 }}
                          />
                        </View>
                      </Pressable>
                    )}
                    {facebook !== '' && (
                      <Pressable
                        style={{
                          width: 34,
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                        onPress={() => {
                          Linking.openURL(facebook);
                        }}
                      >
                        <Facebook
                          width={24}
                          height={24}
                          style={{ margin: 5 }}
                        />
                      </Pressable>
                    )}

                    {insta !== '' && (
                      <Pressable
                        style={{
                          width: 34,
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                        onPress={() => {
                          Linking.openURL(insta);
                        }}
                      >
                        <Insta width={24} height={24} style={{ margin: 5 }} />
                      </Pressable>
                    )}

                    {linkedin !== '' && (
                      <Pressable
                        style={{
                          width: 34,
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                        onPress={() => {
                          Linking.openURL(linkedin);
                        }}
                      >
                        <Linkedin
                          width={24}
                          height={24}
                          style={{ margin: 5 }}
                        />
                      </Pressable>
                    )}

                    {twitter !== '' && (
                      <Pressable
                        style={{
                          width: 34,
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                        onPress={() => {
                          Linking.openURL(twitter);
                        }}
                      >
                        <Twitter width={24} height={24} style={{ margin: 5 }} />
                      </Pressable>
                    )}

                    {/* Second Identical Set Of Icon */}

                    {website !== '' && (
                      <Pressable
                        style={{
                          width: 34,
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                        onPress={() => {
                          const url = website.startsWith('https://')
                            ? website
                            : 'https://' + website;
                          Linking.openURL(url);
                          console.log(website);
                        }}
                      >
                        <View>
                          <Website
                            width={24}
                            height={24}
                            style={{ margin: 5 }}
                          />
                        </View>
                      </Pressable>
                    )}
                    {facebook !== '' && (
                      <Pressable
                        style={{
                          width: 34,
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                        onPress={() => {
                          Linking.openURL(facebook);
                        }}
                      >
                        <Facebook
                          width={24}
                          height={24}
                          style={{ margin: 5 }}
                        />
                      </Pressable>
                    )}

                    {insta !== '' && (
                      <Pressable
                        style={{
                          width: 34,
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                        onPress={() => {
                          Linking.openURL(insta);
                        }}
                      >
                        <Insta width={24} height={24} style={{ margin: 5 }} />
                      </Pressable>
                    )}

                    {linkedin !== '' && (
                      <Pressable
                        style={{
                          width: 34,
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                        onPress={() => {
                          Linking.openURL(linkedin);
                        }}
                      >
                        <Linkedin
                          width={24}
                          height={24}
                          style={{ margin: 5 }}
                        />
                      </Pressable>
                    )}

                    {twitter !== '' && (
                      <Pressable
                        style={{
                          width: 34,
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                        onPress={() => {
                          Linking.openURL(twitter);
                        }}
                      >
                        <Twitter width={24} height={24} style={{ margin: 5 }} />
                      </Pressable>
                    )}
                  </Animated.View>
                </View>
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
          `${API_BASE_URL}/api/users/getuserprofile`,
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
            `${API_BASE_URL}/api/businesscard/getBcardWithUserId`,
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
              `${API_BASE_URL}/api/subscription/me`,
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

      {showview === 'wallet' && <Wallet bcard={bcard} />}
    </View>
  );
}
