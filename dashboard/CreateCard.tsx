import { View, Image, Pressable, Animated } from 'react-native';
import { cardstyle, Createcardstyle, Style } from '../Style';
import { Text, Easing } from 'react-native';
import { ScrollView } from 'react-native';
import { useEffect, useRef, useState } from 'react';
import { launchImageLibrary } from 'react-native-image-picker';
import { Modal } from 'react-native';
import { TextInput } from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import Countrypicker, {
  Country,
  CountryCode,
  FlagType,
  getAllCountries,
} from 'react-native-country-picker-modal';
import Website from '../assets/website.svg';
import Facebook from '../assets/facebook.svg';
import Insta from '../assets/instagram.svg';
import Linkedin from '../assets/linkedin.svg';
import Twitter from '../assets/X.svg';
import { Linking } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { RootStackParamList } from '../App';
import { TEMPLATE_ID_PREMIUM } from '../App';
import { API_BASE_URL } from '../api/Config';
import { parsePhoneNumberFromString } from 'libphonenumber-js';

function normalizeImageUrl(value?: string | null): string | null {
  if (!value) {
    return null;
  }

  if (
    value.startsWith('http://') ||
    value.startsWith('https://') ||
    value.startsWith('data:')
  ) {
    return value;
  }

  return `${API_BASE_URL}/public/${value}`;
}

export function Creatcard() {
  const route = useRoute<RouteProp<RootStackParamList, 'Createcard'>>();
  const [step, setStep] = useState<any>('1');
  const [componylogo, setComponylogo] = useState<any>();
  const [profilelogo, setProfilelogo] = useState<any>();
  const [name, setName] = useState({
    prefix: '',
    firstname: '',
    lastname: '',
  });
  const [role, setRole] = useState('');
  const [open, setopen] = useState('');
  const [email, setEmail] = useState('');
  const [candly, setCandly] = useState('');
  const [website, setWebsite] = useState('');
  const [facebook, setFacebook] = useState('');
  const [insta, setInsta] = useState('');
  const [linkedin, setLinedin] = useState('');
  const [x, setX] = useState('');

  const [msg, setMsg] = useState('');
  const emailtest = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const [mobile, setMobile] = useState('');
  const [countrycode, setCountrycode] = useState<CountryCode>('US');
  const [callcode, setCallcode] = useState('1');
  const fullnnumber = '+ ' + callcode + ' ' + mobile;

  const naviagtion = useNavigation<any>();

  const [cardreqdata, setCardreqdata] = useState('');
  const [publishedCard, setPublishedCard] = useState<any>(null);
  const isEditmode = route?.params?.isEditmode;
  const editbcard = route?.params?.Card;

  const [profilefilename, setProfilename] = useState('');
  const [companyfilename, setCompanyfilename] = useState('');

  useEffect(() => {
    if (isEditmode === 'edit' && editbcard) {
      console.log(editbcard);
      setName({
        prefix: editbcard.namePrefix || '',
        firstname: editbcard.firstName || '',
        lastname: editbcard.lastName || '',
      });

      setRole(editbcard.role);
      setEmail(editbcard.email);
      setCandly(editbcard.calendly);
      setWebsite(editbcard.url);
      setComponylogo(normalizeImageUrl(editbcard.comapny_logo));
      setProfilelogo(normalizeImageUrl(editbcard.profile_photo));
      setFacebook(editbcard.sociallink_facebook);
      setInsta(editbcard.sociallink_instagram);
      setLinedin(editbcard.sociallink_linkedIn);
      setX(editbcard.sociallink_twitter);

      const phone = editbcard.cellPhone || '';
      const parsedPhone = parsePhoneNumberFromString(phone);

      if (!parsedPhone) {
        setMobile(phone);
        return;
      }

      const initializePhoneFields = async () => {
        try {
          const countries = await getAllCountries(FlagType.EMOJI);
          const phoneCountry = parsedPhone.country
            ? countries.find(country => country.cca2 === parsedPhone.country)
            : undefined;
          const pickerCallingCode =
            phoneCountry?.callingCode[0] || parsedPhone.countryCallingCode;
          const phoneDigits = phone.replace(/\D/g, '');

          setCallcode(pickerCallingCode);
          setMobile(
            phoneDigits.startsWith(pickerCallingCode)
              ? phoneDigits.slice(pickerCallingCode.length)
              : parsedPhone.nationalNumber,
          );

          if (phoneCountry) {
            setCountrycode(phoneCountry.cca2);
          }
        } catch (error) {
          console.error('Unable to initialize saved phone number:', error);
          setCallcode(parsedPhone.countryCallingCode);
          setMobile(parsedPhone.nationalNumber);
        }
      };

      initializePhoneFields();
    }
  }, [editbcard, isEditmode]);

  async function Draft_data() {
    const user_id = await AsyncStorage.getItem('user_Id');
    console.log('user_id', user_id);
    const card_data = {
      user: user_id,
      firstName: name.firstname,
      lastName: name.lastname,
      namePrefix: name.prefix,
      role: role,
      title: role,
      cellPhone: `+${callcode}${mobile}`,
      email: email,
      url: website,
      calendly: candly,
      sociallink_facebook: facebook,
      sociallink_instagram: insta,
      sociallink_linkedIn: linkedin,
      sociallink_twitter: x,
      profile_photo: profilefilename,
      comapny_logo: companyfilename,
      template_id: TEMPLATE_ID_PREMIUM,
    };

    await AsyncStorage.setItem('card_drafter', JSON.stringify(card_data));
    console.log('card data', card_data);
    naviagtion.navigate('subscription');
  }

  useEffect(() => {
    async function confirmpayment() {
      const status = route?.params?.status;
      const sessionId = route?.params?.session_id;

      if (status !== 'success' || !sessionId) {
        console.log('payment not complete');
        return;
      }

      try {
        const token = await AsyncStorage.getItem('token');

        console.log(token);
        await AsyncStorage.setItem('stripe_session_id', sessionId);
        const save_draft = await AsyncStorage.getItem('card_drafter');

        if (!save_draft) {
          console.log('data not save', save_draft);
          return;
        }

        const draft = JSON.parse(save_draft);
        console.log('user card data: ', draft);

        const response = await fetch(
          `${API_BASE_URL}/api/subscription/confirm-checkout-session`,
          {
            method: 'POST',

            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              sessionId: sessionId,
            }),
          },
        );
        const data = await response.json();
        console.log('confirm checkout resuly', data);
        if (data.code === 200 || data.result?.status === 'Active') {
          console.log('payment conformation successfull');
          const card_data = {
            user: draft.user,
            firstName: draft.firstName,
            lastName: draft.lastName ?? draft.lastname,
            namePrefix: draft.namePrefix,
            role: draft.role,
            title: draft.role,

            cellPhone: draft.cellPhone,
            email: draft.email,

            url: draft.url,
            calendly: draft.candly,

            sociallink_facebook: draft.sociallink_facebook,
            sociallink_instagram: draft.sociallink_instagram,
            sociallink_linkedIn: draft.sociallink_linkedIn,
            sociallink_twitter: draft.sociallink_twitter,

            profile_photo: draft.profile_photo,
            comapny_logo: draft.comapny_logo,
            template_id: draft.template_id || TEMPLATE_ID_PREMIUM,
          };

          const cardResponse = await fetch(
            `${API_BASE_URL}/api/businesscard/addbusinesscard`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify(card_data),
            },
          );

          const Data = await cardResponse.json();
          console.log('response of add business card', Data);
          if (cardResponse.ok && Data.result) {
            const publishedCardData = { ...draft, ...Data.result };
            console.log('published card data:', publishedCardData);
            setPublishedCard(publishedCardData);
            setStep('3');
            await AsyncStorage.removeItem('card_drafter');
          }
          console.log('check userdata:', card_data);
        }
      } catch (error) {
        console.log('Error confirming payment:', error);
      }
    }
    confirmpayment();
  }, [route?.params?.session_id, route?.params?.status]);

  function Checkinput() {
    if (open === '1') {
      if (name.firstname === '') {
        setMsg(' First name is required!');
        return;
      }
    }

    if (open === '4') {
      if (email === '') {
        setMsg('Email is required!');
        return;
      }
      if (!emailtest.test(email)) {
        setMsg('Invalid Email');
        return;
      }
    }

    setopen('');
    setMsg('');
  }

  const scrollX = useRef(new Animated.Value(0)).current;
  const socialIcons = [
  website !== '' ? 'website' : null,
  facebook !== '' ? 'facebook' : null,
  insta !== '' ? 'insta' : null,
  linkedin !== '' ? 'linkedin' : null,
  x !== '' ? 'x' : null,
].filter(Boolean) as string[];


useEffect(() => {
  scrollX.stopAnimation();
  scrollX.setValue(0);

  if (socialIcons.length > 1) {
    const iconstep = 34;
    const animations = [];

    // Stop on every icon for 2.5 seconds
    for (let i = 0; i < socialIcons.length; i++) {
      animations.push(
        Animated.delay(2500)
      );

      animations.push(
        Animated.timing(scrollX, {
          toValue: -(iconstep * (i + 1)),
          duration: 700,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        })
      );
    }

    // Stop on the first icon of the second set
    animations.push(
      Animated.delay(2500)
    );

    // Reset to the first icon
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
  async function uploadImage(assest: any, endpoint: string): Promise<string> {
    const formData = new FormData();

    formData.append('file', {
      uri: assest.uri,
      name: assest.fileName || 'image.jpg',
      type: assest.type || 'image/jpeg',
    } as any);
    console.log('upload Image');

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();
    console.log(data);

    if (!response.ok || !data.result) {
      throw new Error(data.message || 'image upload failed');
    }

    return data.result;
  }

  function Addimages(type: 'company' | 'profile') {
    console.log('call lunchimagelabrary');
    launchImageLibrary(
      {
        mediaType: 'photo',
        selectionLimit: 1,
      },
      async response => {
        if (response.assets) {
          const asset = response.assets?.[0];
          console.log(asset);
          if (!asset?.uri) {
            console.log('no uri of image', asset.uri);
            return;
          }

          try {
            if (type === 'company') {
              const filename = await uploadImage(asset, '/api/home/addimage');

              setCompanyfilename(filename);
              setComponylogo(normalizeImageUrl(filename));
            }

            if (type === 'profile') {
              const filename = await uploadImage(
                asset,
                '/api/home/addprofileimage',
              );

              setProfilename(filename);
              setProfilelogo(normalizeImageUrl(filename));
            }
          } catch (error) {
            console.log('image upload faild:', error);
          }
        }
      },
    );
  }

  async function Update_card() {
    try {
      const user_id = await AsyncStorage.getItem('user_Id');
      console.log('usert Id ', user_id);
      const token = await AsyncStorage.getItem('token');
      const bcard_id = await AsyncStorage.getItem('bcard_id');
      console.log('business card id', bcard_id);

      const nextProfilePhoto =
        profilefilename || editbcard?.profile_photo || '';
      const nextCompanyLogo = companyfilename || editbcard?.comapny_logo || '';

      const response = await fetch(
        `${API_BASE_URL}/api/businesscard/editBusinesscarddata?id=${bcard_id}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            user: user_id,
            firstName: name.firstname,
            lastName: name.lastname,
            namePrefix: name.prefix,
            role: role,
            title: role,
            cellPhone: `+${callcode}${mobile}`,
            email: email,
            url: website,
            calendly: candly,
            sociallink_facebook: facebook,
            sociallink_instagram: insta,
            sociallink_linkedIn: linkedin,
            sociallink_twitter: x,
            profile_photo: nextProfilePhoto,
            comapny_logo: nextCompanyLogo,
          }),
        },
      );

      const data = await response.json();

      if (data.code === 200) {
        naviagtion.replace('Dashboard');
      }
    } catch (error) {
      console.log(error);
    }
  }

  const capitalizeFirstLetter = (value: string) => {
    if (!value) return '';
    return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#F5F2E9' }}>
      <View style={{ flex: 2, alignItems: 'center', justifyContent: 'center' }}>
        <View style={[Createcardstyle.frame1, { pointerEvents: 'none' }]}>
          {componylogo || publishedCard ? (
            <Image
              source={{ uri: componylogo || publishedCard.comapny_logo }}
              style={Createcardstyle.companylogo}
              resizeMode="contain"
            />
          ) : (
            <Image
              source={require('../assets/company_logo.png')}
              style={Createcardstyle.companylogo}
            />
          )}

          {profilelogo ? (
            <Image
              source={{ uri: profilelogo }}
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
        <View style={Createcardstyle.frame2}>
          {isEditmode === 'edit' ? (
            <Text numberOfLines={2} style={Createcardstyle.name}>
              {name.prefix || name.firstname || name.lastname
                ? (name.prefix
                    ? capitalizeFirstLetter(name.prefix) + '. '
                    : '') +
                  (name.firstname
                    ? capitalizeFirstLetter(name.firstname)
                    : '') +
                  (name.lastname
                    ? ' ' + capitalizeFirstLetter(name.lastname)
                    : '')
                : (editbcard.namePrefix
                    ? capitalizeFirstLetter(editbcard.namePrefix) + '. '
                    : '') +
                  (editbcard.firstName
                    ? capitalizeFirstLetter(editbcard.firstName)
                    : '') +
                  (editbcard.lastName
                    ? ' ' + capitalizeFirstLetter(editbcard.lastName)
                    : '')}
            </Text>
          ) : (
            <Text style={Createcardstyle.name}>
              {name.prefix || name.firstname || name.lastname
                ? (name.prefix
                    ? capitalizeFirstLetter(name.prefix) + '. '
                    : '') +
                  (name.firstname
                    ? capitalizeFirstLetter(name.firstname)
                    : '') +
                  (name.lastname
                    ? ' ' + capitalizeFirstLetter(name.lastname)
                    : '')
                : 'Jhon'}
            </Text>
          )}
          <Text style={Createcardstyle.role}>
            {isEditmode === 'edit'
              ? role
                ? role
                : editbcard.role
              : publishedCard
              ? publishedCard?.role
              : role || 'Co-Founder & Creative Director'}
          </Text>
          <View style={Createcardstyle.userinput}>
            <Image
              source={require('../assets/call_icon.png')}
              style={Createcardstyle.callicon}
            />
            <Text style={Createcardstyle.call}>
              {isEditmode === 'edit'
                ? fullnnumber || editbcard?.cellPhone || '+1 1234567890'
                : fullnnumber.length < 2
                ? fullnnumber
                : '+1 1234567890'}
            </Text>
          </View>
          <View style={Createcardstyle.userinput}>
            <Image
              source={require('../assets/email_icon.png')}
              style={Createcardstyle.callicon}
            />
            <Text style={Createcardstyle.call}>
              {isEditmode === 'edit'
                ? email
                  ? email
                  : editbcard?.email
                : email || 'demo@gmail.com'}
            </Text>
          </View>

          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Pressable style={[Createcardstyle.savecontact, { flex: 1 }]}>
              <Text style={Createcardstyle.btntxt}>Save Contacts</Text>
            </Pressable>

            <View
              style={{ width: 34, height:34, overflow: 'hidden', }}
            >
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
                      <Website width={24} height={24} style={{ margin: 5 }} />
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
                    <Facebook width={24} height={24} style={{ margin: 5 }} />
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
                    <Linkedin width={24} height={24} style={{ margin: 5 }} />
                  </Pressable>
                )}

                {x !== '' && (
                  <Pressable
                  style={{
                      width: 34,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                    onPress={() => {
                      Linking.openURL(x);
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
                      <Website width={24} height={24} style={{ margin: 5 }} />
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
                    <Facebook width={24} height={24} style={{ margin: 5 }} />
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
                    <Linkedin width={24} height={24} style={{ margin: 5 }} />
                  </Pressable>
                )}

                {x !== '' && (
                  <Pressable
                  style={{
                      width: 34,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                    onPress={() => {
                      Linking.openURL(x);
                    }}
                  >
                    <Twitter width={24} height={24} style={{ margin: 5 }} />
                  </Pressable>
                )}
              </Animated.View>
            </View>
          </View>
        </View>

        <Image
          source={require('../assets/iphone (1).png')}
          style={Createcardstyle.iphone}
          resizeMode="stretch"
        />

        <View style={{ height: 67 }}>
          {isEditmode === 'add' && (
            <View style={{ flexDirection: 'row', alignSelf: 'center' }}>
              <View
                style={
                  step === '1'
                    ? Createcardstyle.selectsteps
                    : Createcardstyle.steps
                }
              >
                <Text
                  style={{ margin: 5, color: step === '1' ? 'white' : 'black' }}
                >
                  1
                </Text>
              </View>

              <View
                style={
                  step === '2'
                    ? Createcardstyle.selectsteps
                    : Createcardstyle.steps
                }
              >
                <Text
                  style={{ margin: 5, color: step === '2' ? 'white' : 'black' }}
                >
                  2
                </Text>
              </View>

              <View
                style={
                  step === '3'
                    ? Createcardstyle.selectsteps
                    : Createcardstyle.steps
                }
              >
                <Text
                  style={{ margin: 5, color: step === '3' ? 'white' : 'black' }}
                >
                  3
                </Text>
              </View>
            </View>
          )}
        </View>
      </View>

      {(step === '1' || step === '2') && (
        <View style={{ flex: 1, padding: 20 }}>
          <ScrollView>
            <Text style={Createcardstyle.customcardtxt}>
              {isEditmode === 'edit'
                ? 'Edit your card '
                : ' Create your first card'}
            </Text>
            <Text style={cardstyle.minitxt}>
              {isEditmode === 'edit'
                ? 'Update the fields below, then click Save changes.'
                : 'Ready to design your card? Pick a field below to get started!'}
            </Text>

            <View style={Createcardstyle.customcardview}>
              <Text style={{ margin: 10, fontWeight: 'bold' }}>Add Images</Text>

              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  width: '100%',
                  paddingHorizontal: 10,
                }}
              >
                <Pressable
                  onPress={() => {
                    Addimages('company');
                  }}
                  style={{ width: '45%' }}
                >
                  <View style={Createcardstyle.addimageview}>
                    {componylogo ? (
                      <Image
                        source={{ uri: componylogo }}
                        style={[Createcardstyle.gallaryimg]}
                        resizeMode="cover"
                      />
                    ) : (
                      <Image source={require('../assets/add_image_icon.png')} />
                    )}
                    <Text
                      style={{
                        textAlign: 'center',
                        flexShrink: 0,
                      }}
                    >
                      Company Logo
                    </Text>
                  </View>
                </Pressable>

                <Pressable
                  onPress={() => {
                    Addimages('profile');
                  }}
                  style={{ alignItems: 'center', width: '45%' }}
                >
                  <View style={Createcardstyle.addimageview}>
                    {profilelogo ? (
                      <Image
                        source={{ uri: profilelogo }}
                        style={Createcardstyle.gallaryimg}
                        resizeMode="cover"
                      />
                    ) : (
                      <Image source={require('../assets/add_image_icon.png')} />
                    )}
                    <Text>Profile Image</Text>
                  </View>
                </Pressable>
              </View>

              <Text style={{ marginLeft: 20, margin: 5, fontWeight: 500 }}>
                Add your Details
              </Text>

              <Text style={{ marginLeft: 20, margin: 5, fontWeight: 500 }}>
                PERSIONAL DETAILS{' '}
                <View
                  style={{
                    borderColor: 'black',
                    borderWidth: 0.9,
                    opacity: 0.95,
                    width: '100%',
                  }}
                />
              </Text>

              <View style={{ flexDirection: 'row', alignSelf: 'center' }}>
                <View
                  style={[
                    Createcardstyle.adddetailsview,
                    {
                      backgroundColor:
                        name.firstname.trim() === '' ? '#E5E0D3' : 'white',
                    },
                  ]}
                >
                  <Pressable
                    style={{ alignItems: 'center' }}
                    onPress={() => {
                      setopen('1');
                      setCardreqdata('');
                    }}
                  >
                    <Image source={require('../assets/user_icon.png')} />
                    <Text>Name</Text>
                  </Pressable>
                </View>

                <View
                  style={[
                    Createcardstyle.adddetailsview,
                    { backgroundColor: role === '' ? '#E5E0D3' : 'white' },
                  ]}
                >
                  <Pressable
                    style={{ alignItems: 'center' }}
                    onPress={() => {
                      setopen('2');
                    }}
                  >
                    <Image source={require('../assets/role_icon.png')} />
                    <Text>Role</Text>
                  </Pressable>
                </View>
              </View>

              <Text style={{ marginLeft: 20, margin: 5, fontWeight: 500 }}>
                CONTACT DETAILS{' '}
                <View
                  style={{
                    borderColor: 'black',
                    borderWidth: 0.9,
                    opacity: 0.95,
                    width: '100%',
                  }}
                />
              </Text>

              <View style={{ flexDirection: 'row', alignSelf: 'center' }}>
                <View
                  style={[
                    Createcardstyle.adddetailsview,
                    { backgroundColor: mobile === '' ? '#E5E0D3' : 'white' },
                  ]}
                >
                  <Pressable
                    style={{ alignItems: 'center' }}
                    onPress={() => {
                      setopen('3');
                    }}
                  >
                    <Image source={require('../assets/phone_icon.png')} />
                    <Text>Mobile</Text>
                  </Pressable>
                </View>

                <View
                  style={[
                    Createcardstyle.adddetailsview,
                    { backgroundColor: email === '' ? '#E5E0D3' : 'white' },
                  ]}
                >
                  <Pressable
                    style={{ alignItems: 'center' }}
                    onPress={() => {
                      setopen('4');
                      setCardreqdata('');
                    }}
                  >
                    <Image source={require('../assets/email_icon.png')} />
                    <Text>Email</Text>
                  </Pressable>
                </View>
              </View>

              <View style={{ flexDirection: 'row', alignSelf: 'center' }}>
                <View
                  style={[
                    Createcardstyle.adddetailsview,
                    {
                      backgroundColor:
                        (candly || editbcard?.calendly || '').trim() === ''
                          ? '#E5E0D3'
                          : 'white',
                    },
                  ]}
                >
                  <Pressable
                    style={{ alignItems: 'center' }}
                    onPress={() => {
                      setopen('5');
                    }}
                  >
                    <Image source={require('../assets/calender_icon.png')} />
                    <Text>Calendly</Text>
                  </Pressable>
                </View>
              </View>

              <Text style={{ marginLeft: 20, margin: 5, fontWeight: 500 }}>
                WEBSITE
                <View
                  style={{
                    borderColor: 'black',
                    borderWidth: 0.9,
                    opacity: 0.95,
                    width: '100%',
                  }}
                />
              </Text>

              <View style={{ flexDirection: 'row', alignSelf: 'center' }}>
                <View
                  style={[
                    Createcardstyle.adddetailsview,
                    {
                      backgroundColor:
                        (website || editbcard?.website || '').trim() === ''
                          ? '#E5E0D3'
                          : 'white',
                    },
                  ]}
                >
                  <Pressable
                    style={{ alignItems: 'center' }}
                    onPress={() => {
                      setopen('6');
                      console.log('Model open');
                    }}
                  >
                    <Image source={require('../assets/website_icon.png')} />
                    <Text>Website</Text>
                  </Pressable>
                </View>
              </View>

              <Text style={{ marginLeft: 20, margin: 5, fontWeight: 500 }}>
                SOCIAL MEDIA LINKS{' '}
                <View
                  style={{
                    borderColor: 'black',
                    borderWidth: 0.9,
                    opacity: 0.95,
                    width: '100%',
                  }}
                />
              </Text>

              <View style={{ flexDirection: 'row', alignSelf: 'center' }}>
                <View
                  style={[
                    Createcardstyle.adddetailsview,
                    { backgroundColor: facebook === '' ? '#E5E0D3' : 'white' },
                  ]}
                >
                  <Pressable
                    style={{ alignItems: 'center' }}
                    onPress={() => {
                      setopen('7');
                    }}
                  >
                    <Image source={require('../assets/facebook_icon.png')} />
                    <Text>Facebook</Text>
                  </Pressable>
                </View>

                <View
                  style={[
                    Createcardstyle.adddetailsview,
                    { backgroundColor: insta === '' ? '#E5E0D3' : 'white' },
                  ]}
                >
                  <Pressable
                    style={{ alignItems: 'center' }}
                    onPress={() => {
                      setopen('8');
                    }}
                  >
                    <Image source={require('../assets/instagram_icon.png')} />
                    <Text>Instagram</Text>
                  </Pressable>
                </View>
              </View>
              <View style={{ flexDirection: 'row', alignSelf: 'center' }}>
                <View
                  style={[
                    Createcardstyle.adddetailsview,
                    { backgroundColor: linkedin === '' ? '#E5E0D3' : 'white' },
                  ]}
                >
                  <Pressable
                    style={{ alignItems: 'center' }}
                    onPress={() => {
                      setopen('9');
                    }}
                  >
                    <Image source={require('../assets/linkedin_icon.png')} />
                    <Text>LinkedIn</Text>
                  </Pressable>
                </View>

                <View
                  style={[
                    Createcardstyle.adddetailsview,
                    { backgroundColor: x === '' ? '#E5E0D3' : 'white' },
                  ]}
                >
                  <Pressable
                    style={{ alignItems: 'center' }}
                    onPress={() => {
                      setopen('10');
                    }}
                  >
                    <Image source={require('../assets/x_icon.png')} />
                    <Text>Twetter/X</Text>
                  </Pressable>
                </View>
              </View>

              <View
                style={{
                  borderColor: 'black',
                  borderWidth: 1,
                  margin: 20,
                  opacity: 0.5,
                }}
              />
              {cardreqdata && (
                <Text style={{ alignSelf: 'center', color: '#FE3D12' }}>
                  {cardreqdata}
                </Text>
              )}

              <Pressable
                style={Style.mainbtn}
                onPress={() => {
                  if (isEditmode === 'edit') {
                    Update_card();
                    return;
                  }

                  if (!name.firstname || !email) {
                    setCardreqdata('Name & Email is required!');
                    return;
                  }
                  setStep('2');
                  Draft_data();
                  setCardreqdata('');
                }}
              >
                <Text style={Style.btntxt}>
                  {isEditmode === 'edit' ? 'Save Chanages' : 'Next Step'}
                </Text>
              </Pressable>
            </View>
          </ScrollView>
        </View>
      )}

      {step === '3' && publishedCard && (
        <View
          style={[{ flex: 1, padding: 20 }, Createcardstyle.customcardview]}
        >
          <View
            style={{
              backgroundColor: 'white',
              borderRadius: 20,
              padding: 10,
              alignItems: 'center',
              justifyContent: 'center',
              flex: 1,
            }}
          >
            <View style={{ alignItems: 'center' }}>
              <View style={{ backgroundColor: '#FE3D12', borderRadius: 50 }}>
                <Image
                  source={require('../assets/done.png')}
                  style={Createcardstyle.doneicon}
                />
              </View>
              <Text style={{ fontSize: 24 }}>Card Published!</Text>
              <Text
                style={{
                  color: 'gray',
                  textAlign: 'center',
                  margin: 10,
                  fontSize: 12,
                }}
              >
                Thank you for creating your business card.{'\n'}
                Your business card has been created successfully.
              </Text>
              <Pressable
                style={cardstyle.mainbtn}
                onPress={() => {
                  naviagtion.replace('Dashboard');
                }}
              >
                <Text style={Createcardstyle.btntxt}>View Card</Text>
              </Pressable>
            </View>
          </View>
        </View>
      )}

      {/* user input Modals */}

      <Modal visible={open === '1'} transparent={true} animationType="fade">
        <View style={Createcardstyle.modelview}>
          <View style={Createcardstyle.modelsubview}>
            <Text style={{ fontWeight: 'bold', fontSize: 16 }}>
              Personal Details
            </Text>
            <Text style={{ fontSize: 10 }}>
              Set the name that appears on the digital card.
            </Text>

            <Text style={Createcardstyle.modeltxt}>Prifix</Text>
            <TextInput
              placeholder="Mr / Mrs"
              value={name.prefix}
              onChangeText={text => {
                setName({ ...name, prefix: text });
              }}
              style={Createcardstyle.modelinput}
            />

            <Text style={Createcardstyle.modeltxt}>First Name</Text>
            <TextInput
              placeholder="First Name"
              value={name.firstname}
              onChangeText={text => {
                setName({ ...name, firstname: text });
              }}
              style={Createcardstyle.modelinput}
            />
            {msg && <Text style={Createcardstyle.requiredmsg}>{msg}</Text>}

            <Text style={Createcardstyle.modeltxt}>Last Name</Text>
            <TextInput
              placeholder="Last Name"
              value={name.lastname}
              onChangeText={text => {
                setName({ ...name, lastname: text });
              }}
              style={Createcardstyle.modelinput}
            />

            <View style={Createcardstyle.modelviewbtn}>
              <Pressable
                style={Createcardstyle.modelbtn}
                onPress={() => {
                  Checkinput();
                }}
              >
                <Text style={Createcardstyle.btntxt}>Done</Text>
              </Pressable>
              <Pressable
                style={Createcardstyle.modelbtn}
                onPress={() => {
                  setMsg('');
                  setopen('');
                }}
              >
                <Text style={Createcardstyle.btntxt}>Cancel</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={open === '2'} transparent={true} animationType="fade">
        <View style={Createcardstyle.modelview}>
          <View style={Createcardstyle.modelsubview}>
            <Text style={{ fontWeight: 'bold', fontSize: 16 }}>Role</Text>
            <Text style={{ fontSize: 10 }}>
              Describe what you do in a few words.
            </Text>

            <Text style={Createcardstyle.modeltxt}>Role</Text>
            <TextInput
              placeholder="Developer"
              value={role}
              onChangeText={setRole}
              style={Createcardstyle.modelinput}
            />

            <View style={Createcardstyle.modelviewbtn}>
              <Pressable
                style={Createcardstyle.modelbtn}
                onPress={() => {
                  setopen('');
                }}
              >
                <Text style={Createcardstyle.btntxt}>Done</Text>
              </Pressable>
              <Pressable
                style={Createcardstyle.modelbtn}
                onPress={() => {
                  setopen('');
                }}
              >
                <Text style={Createcardstyle.btntxt}>Cancel</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={open === '3'} transparent={true} animationType="fade">
        <View style={Createcardstyle.modelview}>
          <View style={Createcardstyle.modelsubview}>
            <Text style={{ fontWeight: 'bold', fontSize: 16 }}>
              Mobile Number
            </Text>
            <Text style={{ fontSize: 10 }}>
              This becomes the tap-to-call contact action.
            </Text>

            <Text style={[Createcardstyle.modeltxt, { opacity: 0.5 }]}>
              Mobile Number
            </Text>
            <View style={{ flexDirection: 'row' }}>
              <View
                style={[Createcardstyle.modelinput, { flexDirection: 'row' }]}
              >
                <Countrypicker
                  countryCode={countrycode}
                  withFlag={true}
                  withFilter={true}
                  withCallingCode={true}
                  onSelect={(country: Country) => {
                    setCountrycode(country.cca2);
                    setCallcode(country.callingCode[0]);
                  }}
                />
                <Text>+{callcode}</Text>
              </View>
              <TextInput
                placeholder="Mobile Number"
                value={mobile}
                keyboardType="number-pad"
                onChangeText={setMobile}
                style={Createcardstyle.modelinput}
              />
            </View>

            <View style={Createcardstyle.modelviewbtn}>
              <Pressable
                style={Createcardstyle.modelbtn}
                onPress={() => {
                  setopen('');
                }}
              >
                <Text style={Createcardstyle.btntxt}>Done</Text>
              </Pressable>
              <Pressable
                style={Createcardstyle.modelbtn}
                onPress={() => {
                  setopen('');
                }}
              >
                <Text style={Createcardstyle.btntxt}>Cancel</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={open === '4'} transparent={true} animationType="fade">
        <View style={Createcardstyle.modelview}>
          <View style={Createcardstyle.modelsubview}>
            <Text style={{ fontWeight: 'bold', fontSize: 16 }}>Email</Text>
            <Text style={{ fontSize: 10 }}>
              Use the address you want people to contact and sign in with.
            </Text>

            <Text style={[Createcardstyle.modeltxt, { opacity: 0.5 }]}>
              Email Address
            </Text>

            <TextInput
              placeholder="Example@gmail.com"
              value={email}
              keyboardType="email-address"
              onChangeText={setEmail}
              style={Createcardstyle.modelinput}
            />
            <Text style={Createcardstyle.requiredmsg}>{msg}</Text>

            <View style={Createcardstyle.modelviewbtn}>
              <Pressable
                style={Createcardstyle.modelbtn}
                onPress={() => {
                  Checkinput();
                }}
              >
                <Text style={Createcardstyle.btntxt}>Done</Text>
              </Pressable>
              <Pressable
                style={Createcardstyle.modelbtn}
                onPress={() => {
                  setopen('');
                  setMsg('');
                }}
              >
                <Text style={Createcardstyle.btntxt}>Cancel</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={open === '5'} transparent={true} animationType="fade">
        <View style={Createcardstyle.modelview}>
          <View style={Createcardstyle.modelsubview}>
            <Text style={{ fontWeight: 'bold', fontSize: 16 }}>
              Calendly link
            </Text>
            <Text style={{ fontSize: 10 }}>
              Let people book time with you right from the card.
            </Text>

            <Text style={[Createcardstyle.modeltxt, { opacity: 0.5 }]}>
              Calendly link
            </Text>

            <TextInput
              placeholder="https://calendly.com/your-name"
              value={candly}
              onChangeText={setCandly}
              style={Createcardstyle.modelinput}
            />

            <View style={Createcardstyle.modelviewbtn}>
              <Pressable
                style={Createcardstyle.modelbtn}
                onPress={() => {
                  Checkinput();
                }}
              >
                <Text style={Createcardstyle.btntxt}>Done</Text>
              </Pressable>
              <Pressable
                style={Createcardstyle.modelbtn}
                onPress={() => {
                  setopen('');
                  setMsg('');
                }}
              >
                <Text style={Createcardstyle.btntxt}>Cancel</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={open === '6'} transparent={true} animationType="fade">
        <View style={Createcardstyle.modelview}>
          <View style={Createcardstyle.modelsubview}>
            <Text style={{ fontWeight: 'bold', fontSize: 16 }}>
              Website links
            </Text>
            <Text style={{ fontSize: 10 }}>
              Add your website and a work-specific link if needed.
            </Text>

            <Text style={[Createcardstyle.modeltxt, { opacity: 0.5 }]}>
              Website links
            </Text>

            <TextInput
              placeholder="https://example.com"
              value={website}
              onChangeText={setWebsite}
              style={Createcardstyle.modelinput}
            />

            <View style={Createcardstyle.modelviewbtn}>
              <Pressable
                style={Createcardstyle.modelbtn}
                onPress={() => {
                  Checkinput();
                }}
              >
                <Text style={Createcardstyle.btntxt}>Done</Text>
              </Pressable>
              <Pressable
                style={Createcardstyle.modelbtn}
                onPress={() => {
                  setopen('');
                  setMsg('');
                }}
              >
                <Text style={Createcardstyle.btntxt}>Cancel</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={open === '7'} transparent={true} animationType="fade">
        <View style={Createcardstyle.modelview}>
          <View style={Createcardstyle.modelsubview}>
            <Text style={{ fontWeight: 'bold', fontSize: 16 }}>Facebook</Text>
            <Text style={{ fontSize: 10 }}>
              Add your public Facebook page URL.
            </Text>

            <Text style={[Createcardstyle.modeltxt, { opacity: 0.5 }]}>
              Facebook URL
            </Text>

            <TextInput
              placeholder="https://facebook.com/your-page"
              value={facebook}
              onChangeText={setFacebook}
              style={Createcardstyle.modelinput}
            />

            <View style={Createcardstyle.modelviewbtn}>
              <Pressable
                style={Createcardstyle.modelbtn}
                onPress={() => {
                  Checkinput();
                }}
              >
                <Text style={Createcardstyle.btntxt}>Done</Text>
              </Pressable>
              <Pressable
                style={Createcardstyle.modelbtn}
                onPress={() => {
                  setopen('');
                  setMsg('');
                }}
              >
                <Text style={Createcardstyle.btntxt}>Cancel</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={open === '8'} transparent={true} animationType="fade">
        <View style={Createcardstyle.modelview}>
          <View style={Createcardstyle.modelsubview}>
            <Text style={{ fontWeight: 'bold', fontSize: 16 }}>Instagram</Text>
            <Text style={{ fontSize: 10 }}>
              Add the Instagram profile you want to highlight.
            </Text>

            <Text style={[Createcardstyle.modeltxt, { opacity: 0.5 }]}>
              Instagram URL
            </Text>

            <TextInput
              placeholder="https://instagram.com/your-handle"
              value={insta}
              onChangeText={setInsta}
              style={Createcardstyle.modelinput}
            />

            <View style={Createcardstyle.modelviewbtn}>
              <Pressable
                style={Createcardstyle.modelbtn}
                onPress={() => {
                  Checkinput();
                }}
              >
                <Text style={Createcardstyle.btntxt}>Done</Text>
              </Pressable>
              <Pressable
                style={Createcardstyle.modelbtn}
                onPress={() => {
                  setopen('');
                  setMsg('');
                }}
              >
                <Text style={Createcardstyle.btntxt}>Cancel</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={open === '9'} transparent={true} animationType="fade">
        <View style={Createcardstyle.modelview}>
          <View style={Createcardstyle.modelsubview}>
            <Text style={{ fontWeight: 'bold', fontSize: 16 }}>LinkedIn</Text>
            <Text style={{ fontSize: 10 }}>
              Add the LinkedIn profile for professional networking.
            </Text>

            <Text style={[Createcardstyle.modeltxt, { opacity: 0.5 }]}>
              LinkedIn URL
            </Text>

            <TextInput
              placeholder="https://linkedin.com/in/your-name"
              value={linkedin}
              onChangeText={setLinedin}
              style={Createcardstyle.modelinput}
            />

            <View style={Createcardstyle.modelviewbtn}>
              <Pressable
                style={Createcardstyle.modelbtn}
                onPress={() => {
                  Checkinput();
                }}
              >
                <Text style={Createcardstyle.btntxt}>Done</Text>
              </Pressable>
              <Pressable
                style={Createcardstyle.modelbtn}
                onPress={() => {
                  setopen('');
                  setMsg('');
                }}
              >
                <Text style={Createcardstyle.btntxt}>Cancel</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={open === '10'} transparent={true} animationType="fade">
        <View style={Createcardstyle.modelview}>
          <View style={Createcardstyle.modelsubview}>
            <Text style={{ fontWeight: 'bold', fontSize: 16 }}>Twitter/X</Text>
            <Text style={{ fontSize: 10 }}>
              Add the short link for your Twitter or X profile.
            </Text>

            <Text style={[Createcardstyle.modeltxt, { opacity: 0.5 }]}>
              Twitter / X URL
            </Text>

            <TextInput
              placeholder="https://x.com/your-handle"
              value={x}
              onChangeText={setX}
              style={Createcardstyle.modelinput}
            />

            <View style={Createcardstyle.modelviewbtn}>
              <Pressable
                style={Createcardstyle.modelbtn}
                onPress={() => {
                  Checkinput();
                }}
              >
                <Text style={Createcardstyle.btntxt}>Done</Text>
              </Pressable>
              <Pressable
                style={Createcardstyle.modelbtn}
                onPress={() => {
                  setopen('');
                  setMsg('');
                }}
              >
                <Text style={Createcardstyle.btntxt}>Cancel</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
