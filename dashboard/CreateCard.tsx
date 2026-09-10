import { View, Image, Pressable, Animated } from 'react-native';
import { cardstyle, Createcardstyle, Style } from '../Style';
import { Text } from 'react-native';
import { ScrollView } from 'react-native';
import { useEffect, useRef, useState } from 'react';
import { launchImageLibrary } from 'react-native-image-picker';
import { Modal } from 'react-native';
import { TextInput } from 'react-native';
import Countrypicker, {
  Country,
  CountryCode,
} from 'react-native-country-picker-modal';
import Website from '../assets/website.svg';
import Facebook from '../assets/facebook.svg';
import Insta from '../assets/instagram.svg';
import Linkedin from '../assets/linkedin.svg';
import Twitter from '../assets/X.svg';
import { Linking } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export function Creatcard() {
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

  

  async function Createbcard() {
    try {
      const token = await AsyncStorage.getItem('token');
      console.log('token:', token);
      const user_id = await AsyncStorage.getItem('user_Id');
      console.log('user_id:', user_id); 

      const Carddata = {
        user_id: user_id,
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

        profile_photo: profilelogo,
        comapny_logo: componylogo,
      };
      console.log("Detailsfilled",Carddata)
      console.log("Adding data.....")

      const response = await fetch(
        'http://10.0.2.2:5004/api/businesscard/createBcard',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(Carddata),
        },
      );

      const Data = await response.json();
      console.log("Full api response",Data);
    } catch(error){
      console.log('something went wrong ', error);
    }
  }

  

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
  const scroll =
    (website !== '' ? 1 : 0) +
    (facebook !== '' ? 1 : 0) +
    (insta !== '' ? 1 : 0) +
    (linkedin !== '' ? 1 : 0) +
    (x !== '' ? 1 : 0);

  useEffect(() => {
    if (scroll === 3) {
      Animated.timing(scrollX, {
        toValue: -30,
        duration: 2000,
        useNativeDriver: true,
      }).start();
    } else if (scroll > 3) {
      Animated.timing(scrollX, {
        toValue: -70,
        duration: 2000,
        useNativeDriver: true,
      }).start();
    } else {
      scrollX.setValue(0);
    }
  });

  function Addimages(Type: string) {
    console.log('call lunchimagelabrary');
    launchImageLibrary(
      {
        mediaType: 'photo',
        selectionLimit: 1,
      },
      Response => {
        if (Response.assets) {
          const Imageuri = Response.assets[0].uri;
          console.log(Imageuri);

          if (Type === 'company') {
            setComponylogo(Imageuri);
          }
          if (Type === 'profile') {
            setProfilelogo(Imageuri);
          }
        }
      },
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#F5F2E9' }}>
      <View style={{ flex: 2, alignItems: 'center', justifyContent: 'center' }}>
        <View style={[Createcardstyle.frame1, { pointerEvents: 'none' }]}>
          {componylogo ? (
            <Image
              source={{ uri: componylogo }}
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
          <Text style={Createcardstyle.name}>
            {name.prefix || name.firstname || name.lastname
              ? (name.prefix ? name.prefix + '.' : '') +
                name.firstname +
                ' ' +
                name.lastname
              : 'JHON'}
          </Text>
          <Text style={Createcardstyle.role}>
            {role || 'Co-Founder & Creative Director'}
          </Text>
          <View style={Createcardstyle.userinput}>
            <Image
              source={require('../assets/call_icon.png')}
              style={Createcardstyle.callicon}
            />
            <Text style={Createcardstyle.call}>
              {mobile ? fullnnumber : '+1 1234567890'}
            </Text>
          </View>
          <View style={Createcardstyle.userinput}>
            <Image
              source={require('../assets/email_icon.png')}
              style={Createcardstyle.callicon}
            />
            <Text style={Createcardstyle.call}>
              {email || 'demo@gmail.com'}
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
              <Text style={Createcardstyle.btntxt}>Save Contack</Text>
            </Pressable>

            <View
              style={{ maxWidth: 70, overflow: 'hidden', flexDirection: 'row' }}
            >
              <Animated.View
                style={{
                  flexDirection: 'row',
                  transform: [{ translateX: scrollX }],
                }}
              >
                {website !== '' && (
                  <Pressable
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
                    onPress={() => {
                      Linking.openURL(facebook);
                    }}
                  >
                    <Facebook width={24} height={24} style={{ margin: 5 }} />
                  </Pressable>
                )}

                {insta !== '' && (
                  <Pressable
                    onPress={() => {
                      Linking.openURL(insta);
                    }}
                  >
                    <Insta width={24} height={24} style={{ margin: 5 }} />
                  </Pressable>
                )}

                {linkedin !== '' && (
                  <Pressable
                    onPress={() => {
                      Linking.openURL(linkedin);
                    }}
                  >
                    <Linkedin width={24} height={24} style={{ margin: 5 }} />
                  </Pressable>
                )}

                {x !== '' && (
                  <Pressable
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

        <View style={{ flexDirection: 'row', alignSelf: 'center' }}>
          <View
            style={
              step === '1' ? Createcardstyle.selectsteps : Createcardstyle.steps
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
              step === '2' ? Createcardstyle.selectsteps : Createcardstyle.steps
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
              step === '3' ? Createcardstyle.selectsteps : Createcardstyle.steps
            }
          >
            <Text
              style={{ margin: 5, color: step === '3' ? 'white' : 'black' }}
            >
              3
            </Text>
          </View>
        </View>
      </View>

      <View style={{ flex: 1, padding: 20 }}>
        <ScrollView>
          <Text style={Createcardstyle.customcardtxt}>
            Create your first card
          </Text>
          <Text style={cardstyle.minitxt}>
            Ready to design your card? Pick a field below to get started!
          </Text>

          <View style={Createcardstyle.customcardview}>
            <Text style={{ margin: 10, fontWeight: 'bold' }}>Add Images</Text>

            <View style={{ flexDirection: 'row', alignSelf: 'center' }}>
              <Pressable
                onPress={() => {
                  Addimages('company');
                }}
              >
                <View style={Createcardstyle.addimageview}>
                  {componylogo ? (
                    <Image
                      source={{ uri: componylogo }}
                      style={Createcardstyle.gallaryimg}
                      resizeMode="cover"
                    />
                  ) : (
                    <Image source={require('../assets/add_image_icon.png')} />
                  )}
                  <Text>Company Logo</Text>
                </View>
              </Pressable>

              <Pressable
                onPress={() => {
                  Addimages('profile');
                }}
                style={{ alignItems: 'center' }}
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
                  { backgroundColor: candly === '' ? '#E5E0D3' : 'white' },
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
                  { backgroundColor: website === '' ? '#E5E0D3' : 'white' },
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

            <Pressable
              style={[
                Style.mainbtn,
                { opacity: !name.firstname || !email ? 0.7 : 1 },
              ]}
              onPress={() => {
                setStep('2');
                naviagtion.navigate('subscription');
    
              }}
            >
              <Text style={Style.btntxt}>Next Step</Text>
            </Pressable>
          </View>
        </ScrollView>
      </View>

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
