import {
  View,
  Text,
  Pressable,
  TextInput,
  Modal,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useState, useEffect, useRef } from 'react';
import { Image } from 'react-native';

// import { LinearGradient } from "react-native-linear-gradient",
// import { Linking } from 'react-native';
import { cardstyle, Style, } from './Style';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Dashboard } from './dashboard/dashboard';
import { Creatcard } from './dashboard/CreateCard';
import { Createbg } from './dashboard/createbgimage';
import { Plans } from './dashboard/subscription';
import { API_BASE_URL } from './api/Config';

const Stack = createNativeStackNavigator<RootStackParamList>();
export type RootStackParamList = {
  splashscreen: undefined;
  Main: undefined;
  Home: undefined;
  features: undefined;
  Dashboard: undefined;
  Createcard:
    | {
        status?: 'success' | 'cancel';
        session_id?: string;
        isEditmode?: "edit" | "add" ;
        Card?:any;
      }
    | undefined;
  'How it work': undefined;
  FAQ: undefined;
  Createbg:undefined;
  subscription:
    | {
        status?: 'success' | 'cancel';
        session_id?: string;
      }
    | undefined;
};

type MainNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Main'>;

// Lets Stripe Checkout hand control back to the app (see
// makemycard-api's "create-card-mobile" success/cancel URLs) instead of
// stranding the user on a website page in the device browser.
const linking = {
  prefixes: ['makemycard://'],
  config: {
    screens: {
      subscription: 'subscription',
    },
  },
};

export const TEMPLATE_ID_PREMIUM = "63b3c94e23c17d10871b3312";

function App() {
  return (
    <NavigationContainer linking={linking}>
      <Stack.Navigator>
        <Stack.Screen
          name="splashscreen"
          component={Splashscreen}
          options={{
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="Main"
          component={Main}
          options={{
            headerShown: false,
          }}
        />

        {/* <Stack.Screen
          name="Home"
          component={Home}
          options={{
            headerShown: false,
          }}
        /> */}

        {/* <Stack.Screen name="features" component={Features} />

        <Stack.Screen name="How it work" component={Howitwork} />

        <Stack.Screen name="FAQ" component={Frequntly} /> */}

        <Stack.Screen
          name="Dashboard"
          component={Dashboard}
          options={{
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="Createcard"
          component={Creatcard}
          options={{
            headerShown: false,
          }}
        />

        <Stack.Screen 
        name="Createbg" 
        component={Createbg}
        options={{headerShown:false}}
        />

        <Stack.Screen
        name="subscription"
        component={Plans}
        options={{headerShown:false}}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// async function logout({ navigation }: any) {
//   try {
//     await AsyncStorage.removeItem('islogin');
//     await AsyncStorage.removeItem("token");
//     await AsyncStorage.removeItem("user_Id")
//     navigation.navigate('Main');
//   } catch {
//     console.log('logout fail!');
//   }
// }

function Splashscreen({ navigation }: any) {
  useEffect(() => {
    const time = setTimeout(() => {
      async function check() {
        try {
          const data = await AsyncStorage.getItem('islogin');

          if (data === null) {
            navigation.replace('Main');
          }
          if (data === 'true') {
            navigation.replace('Dashboard');
          }
        } catch (error) {
          console.log(error);
        }
      }

      check();
    }, 3000);

    return () => clearTimeout(time);
  }, [navigation]);

  return (
    <View style={Style.splashvew}>
      <Image
        source={require('./assets/c.png')}
        resizeMode="contain"
        style={Style.splashimg}
      />
    </View>
  );
}

function Main({ navigation }: { navigation: MainNavigationProp }) {
  const [press, setPress] = useState(false);
  const [press2, setPress2] = useState(false);
  const [press3, setPress3] = useState(false);
  const [press4, setPress4] = useState(false);
  const [press5, setPress5] = useState(false);
  const [press6, setPress6] = useState(false);

  const [model1, setModel1] = useState(false);
  const [model2, setModel2] = useState(false);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');

  const [logemail, setLogEmail] = useState('');
  const [logpass, setLogPass] = useState('');

  const [focused, setFocused] = useState('');
  const [msg, setMsg] = useState('');

  const allfilds = name.length > 0 && email.length > 0 && pass.length > 8;
  const allfilds2 = logemail.length > 0 && logpass.length > 8;
  const emailref = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const [errorfield, setErrorfield] = useState('');

  const [apimsg, setApimsg] = useState('');

  const [otp, setOtp] = useState(false);
  const [userotp, setUserotp] = useState<string[]>(['', '', '', '', '', '']);
  const otpinput = [1, 2, 3, 4, 5, 6];
  const [otpmsg, setOtpmsg] = useState('');

  const otpref = useRef<(TextInput | null)[]>([]);
  const [logapimsg, setLogapimsg] = useState('');

  // const allfilds2= ""
  async function savedata() {
    try {
      await AsyncStorage.setItem('islogin', 'true');
      await AsyncStorage.setItem('email', logemail);
    } catch {
      console.log('user not login');
    }
  }

  async function Data() {
    try {
      console.log('api fetch start');
      const response = await fetch(`${API_BASE_URL}/api/users/register`, {
        method: 'POST',

        headers: {
          'Content-type': 'application/json',
        },
        body: JSON.stringify({
          username: name,
          email: email,
          password: pass,
        }),
      });
      const result = await response.json();

      if (result.code === 200) {
        setLogEmail(email);
        setLogPass(pass);
        setOtp(true);
      } else {
        setApimsg(result.message);
      }
    } catch (error) {
      console.log(error);
    }
  }

  async function Verifyotp() {
    try {
      console.log('verify start');
      const response = await fetch(`${API_BASE_URL}/api/users/verifyotp`, {
        method: 'POST',
        headers: {
          'Content-type': 'Application/json',
        },
        body: JSON.stringify({
          email: email,
          otp: userotp.join(''),
        }),
      });
      const result = await response.json();

      if (result.code === 200) {
        console.log('otp verify successfull');
        setModel1(false);
        setModel2(true);
      } else {
        setOtpmsg('Invalid OTP');
      }
    } catch (error) {
      console.log(error);
    }
  }

  async function Resendotp() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/resendotp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'applicatipn/json',
        },
        body: JSON.stringify({
          email: email,
        }),
      });

      const result = await response.json();

      if (result.code === 200) {
        setOtpmsg(result.messege);
      } else {
        setOtpmsg(result.message);
      }
    } catch (error) {
      console.log(error);
    }
  }

  async function Login() {
    try {
      console.log('fetch start');

      const response = await fetch(`${API_BASE_URL}/api/users/login`, {
        method: 'POST',

        headers: {
          'Content-type': 'application/json',
        },

        body: JSON.stringify({
          email: logemail,
          password: logpass,
        }),
      });
      console.log('fetch successful');

      const data = await response.json();

      if (data.code === 200) {
        await AsyncStorage.setItem('token', data.token);
        await AsyncStorage.setItem("user_Id", data._id);
        await AsyncStorage.setItem("username",data.username);
        console.log("username",data.username )
        console.log(data.token);
        console.log(data._id);
        console.log(data.code);
        await savedata();
        navigation.navigate('Dashboard');
      } else {
        setLogapimsg(data.message);
      }
    } catch (error) {
      console.log('Login error:', error);
    }
  }

  function validation() {
    console.log('validation start');

    if (name === '') {
      setMsg('Name is Required');
      setErrorfield('name');
      return;
    }
    if (email === '') {
      setMsg('email is required');
      setErrorfield('email');
      return;
    } else if (!emailref.test(email)) {
      setMsg('invalid email');
      setErrorfield('email');
      return;
    }
    if (pass === '') {
      setMsg('password is requird!');
      setErrorfield('pass');
      return;
    } else if (pass.length < 8) {
      setMsg('min at least 8 characters required!');
      setErrorfield('pass');
      return;
    }

    console.log('validation complete');

    Data();
    setErrorfield('');
    setMsg('');
  }

  function checkPasswordStrength(password: string) {
    const hasLength = password.length >= 8;
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[^A-Za-z0-9]/.test(password);

    if (hasLength && hasUppercase && hasLowercase && hasNumber && hasSpecial) {
      return <Text style={{ color: 'green' }}>Strong</Text>;
    }

    if (
      password.length >= 6 &&
      ((hasUppercase && hasLowercase) || (hasNumber && hasSpecial))
    ) {
      return <Text style={{ color: 'yello' }}>Medium</Text>;
    }

    return 'Weak';
  }

  return (
    <View style={Style.mainvew}>
      <Image
        source={require('./assets/c.png')}
        style={Style.main2img}
        resizeMode="contain"
      />

      <View style={Style.mainsubvew}>
        <Pressable
          style={[Style.mainbtn, press && Style.btnhover]}
          onPressIn={() => setPress(true)}
          onPressOut={() => setPress(false)}
          onPress={() => {
            setModel1(true);
          }}
        >
          <Text style={Style.btntxt}>Sign-Up / إنشاء حساب</Text>
        </Pressable>

        <Pressable
          style={[Style.mainbtn, press2 && Style.btnhover]}
          onPressIn={() => [setPress2(true), setModel2(true)]}
          onPressOut={() => setPress2(false)}
        >
          <Text style={Style.btntxt}>Log-In / تسجيل الدخول</Text>
        </Pressable>
      </View>

      <View>
        <Modal visible={model1} transparent={true} animationType="fade">
          <View style={Style.model1vew}>
            <Image
              source={require('./assets/c (1).png')}
              style={Style.sidelogo}
            />

            <View style={Style.model2vew}>
              <Text
                style={{ alignSelf: 'center', fontWeight: 'bold', padding: 10 }}
              >
                Crete your free account
              </Text>

              <View style={Style.inputvew}>
                {(focused === 'fullname' || name.length > 0) && (
                  <Text style={Style.placeholder}>FullName</Text>
                )}

                <TextInput
                  placeholder={focused === 'fullname' ? '' : 'FullName'}
                  value={name}
                  onChangeText={text => {
                    setName(text);

                    if (errorfield === 'name' && text !== '') {
                      setErrorfield('');
                      setMsg('');
                    }
                  }}
                  onFocus={() => setFocused('fullname')}
                  onBlur={() => setFocused('')}
                />
              </View>
              {errorfield === 'name' && msg !== ' ' && (
                <Text style={{ color: 'red', margin: 5 }}>{msg}</Text>
              )}

              <View style={Style.inputvew}>
                {(focused === 'email' || email.length > 0) && (
                  <Text style={Style.placeholder}>Email</Text>
                )}

                <TextInput
                  placeholder={focused === 'email' ? '' : 'Email'}
                  value={email}
                  onChangeText={text => {
                    setEmail(text);

                    if (errorfield === 'email' && text !== '') {
                      setErrorfield('');
                      setMsg('');
                      setApimsg('');
                    }
                    if (text !== '') {
                      setApimsg('');
                    }
                  }}
                  onFocus={() => setFocused('email')}
                  onBlur={() => setFocused('')}
                />
              </View>
              {errorfield === 'email' && msg !== '' && (
                <Text style={{ color: 'red', margin: 5 }}>{msg}</Text>
              )}
              {apimsg !== '' && (
                <Text style={{ color: 'red', margin: 5 }}>{apimsg}</Text>
              )}

              <View style={Style.inputvew}>
                {(focused === 'password' || pass.length > 0) && (
                  <Text style={Style.placeholder}>Password</Text>
                )}

                <TextInput
                  placeholder={focused === 'password' ? '' : 'password'}
                  secureTextEntry={true}
                  value={pass}
                  onChangeText={text => {
                    setPass(text);

                    if (errorfield === 'pass' && text !== '') {
                      setErrorfield('');
                      setMsg('');
                    }
                  }}
                  onFocus={() => setFocused('password')}
                  onBlur={() => {
                    setFocused('');
                    checkPasswordStrength;
                  }}
                />
              </View>
              {pass.length > 0 && (
                <Text style={{ margin: 5 }}>
                  Password Strighnt:{' '}
                  <Text style={{ color: 'red' }}>
                    {checkPasswordStrength(pass)}
                  </Text>
                </Text>
              )}

              {otp && (
                <View>
                  <Text
                    style={{ margin: 20, alignSelf: 'center', marginBottom: 0 }}
                  >
                    Enter the OTP
                  </Text>

                  <View style={cardstyle.otpview}>
                    {otpinput.map((item, index) => (
                      <TextInput
                        style={cardstyle.otp}
                        key={item}
                        ref={ref => {
                          otpref.current[index] = ref;
                        }}
                        keyboardType="number-pad"
                        maxLength={1}
                        value={userotp[index]}
                        onChangeText={text => {
                          const newOtp = [...userotp];
                          newOtp[index] = text;
                          setUserotp(newOtp);

                          if (text !== ' ' && index < 5) {
                            otpref.current[index + 1]?.focus();
                          }
                        }}
                        onKeyPress={({ nativeEvent }) => {
                          if (
                            nativeEvent.key === 'Backspace' &&
                            userotp[index] === '' &&
                            index > 0
                          ) {
                            otpref.current[index - 1]?.focus();
                          }
                        }}
                      />
                    ))}
                  </View>
                </View>
              )}
              <View>
                {otp && (
                  <Pressable onPress={Resendotp}>
                    <Text
                      style={{
                        textDecorationLine: 'underline',
                        fontWeight: 'bold',
                      }}
                    >
                      Resend OTP
                    </Text>
                  </Pressable>
                )}
                {otpmsg !== '' && (
                  <Text style={{ margin: 5, color: 'red' }}>{otpmsg}</Text>
                )}
              </View>

              {otp ? (
                <Pressable
                  onPress={Verifyotp}
                  onPressIn={() => setPress6(true)}
                  onPressOut={() => setPress6(false)}
                  style={[
                    Style.mainbtn,
                    press6 && Style.btnhover,
                    { opacity: allfilds ? 1 : 0.5 },
                  ]}
                >
                  <Text style={Style.btntxt}>Verify</Text>
                </Pressable>
              ) : (
                <Pressable
                  disabled={!allfilds}
                  style={[
                    Style.mainbtn,
                    press3 && Style.btnhover,
                    { opacity: allfilds ? 1 : 0.5 },
                  ]}
                  onPressIn={() => setPress3(true)}
                  onPressOut={() => setPress3(false)}
                  onPress={() => {
                    validation();
                  }}
                >
                  <Text style={Style.btntxt}>Sign-Up</Text>
                </Pressable>
              )}

              <Pressable
                style={[Style.mainbtn, press4 && Style.btnhover]}
                onPress={() => [setModel1(false), setPress4(false)]}
                onPressIn={() => setPress4(true)}
              >
                <Text style={Style.btntxt}>Cancel</Text>
              </Pressable>
            </View>
            <Text>
              Already have an account?{' '}
              <Pressable
                onPress={() => {
                  setModel2(true);
                  setModel1(false);
                }}
              >
                <Text style={{ fontWeight: 'bold' }}>Log-IN</Text>
              </Pressable>
            </Text>
          </View>
        </Modal>

        <Modal visible={model2} transparent={true} animationType="fade">
          <View style={Style.model1vew}>
            <Image
              source={require('./assets/c (1).png')}
              style={Style.sidelogo}
            />
            <View style={Style.model2vew}>
              <Text
                style={{ alignSelf: 'center', fontWeight: 'bold', padding: 10 }}
              >
                Welcome Back
              </Text>

              <View style={Style.inputvew}>
                {(focused === 'logemail' || logemail.length > 0) && (
                  <Text style={Style.placeholder}>Email</Text>
                )}
                <TextInput
                  placeholder={focused === 'logemail' ? '' : 'Email'}
                  value={logemail}
                  onChangeText={text => {
                    setLogEmail(text);

                    if (errorfield === 'logemail' && text !== '') {
                      setErrorfield('');
                      setMsg('');
                    }
                    if (text !== '') {
                      setLogapimsg('');
                    }
                  }}
                  onFocus={() => setFocused('logemail')}
                  onBlur={() => setFocused('')}
                />
              </View>

              <View style={Style.inputvew}>
                {(focused === 'logpass' || logpass.length > 0) && (
                  <Text style={Style.placeholder}>Password</Text>
                )}
                <TextInput
                  placeholder={focused === 'logpass' ? '' : 'Password'}
                  secureTextEntry={true}
                  value={logpass}
                  onChangeText={text => {
                    setLogPass(text);

                    if (errorfield === 'logpass' && text !== '') {
                      setErrorfield('');
                      setMsg('');
                    }
                    if (text !== '') {
                      setLogapimsg('');
                    }
                  }}
                  onFocus={() => setFocused('logpass')}
                  onBlur={() => setFocused('')}
                />
              </View>
              {logapimsg !== '' && (
                <Text style={{ margin: 5, color: 'red' }}>{logapimsg}</Text>
              )}

              <Pressable
                style={[
                  Style.mainbtn,
                  press3 && Style.btnhover,
                  {
                    opacity: allfilds2 ? 1 : 0.5,
                  },
                ]}
                onPressIn={() => setPress3(true)}
                onPressOut={() => setPress3(false)}
                onPress={() => {
                  Login();
                }}
                disabled={!allfilds2}
              >
                <Text style={Style.btntxt}>Log-In</Text>
              </Pressable>
              <Pressable
                style={[Style.mainbtn, press5 && Style.btnhover]}
                onPressIn={() => setPress5(true)}
                onPress={() => {
                  setModel2(false);
                  setPress5(false);
                }}
              >
                <Text style={Style.btntxt}>Cancel</Text>
              </Pressable>
            </View>
            <Text>
              Don't have an account?{' '}
              <Pressable
                onPress={() => {
                  setModel1(true);
                  setModel2(false);
                }}
              >
                <Text style={{ fontWeight: 'bold' }}>Sign-up</Text>
              </Pressable>
            </Text>
          </View>
        </Modal>
      </View>
    </View>
  );
}

// function Faq() {
//   const [openfaq, setOpenfaq] = useState<any>(0);

//   return (
//     <View>
//       <View style={[stylehome.Faqvew, openfaq === 0 && stylehome.Faqvew2]}>
//         <Pressable
//           onPress={() => {
//             if (openfaq === 0) {
//               setOpenfaq(null);
//             } else {
//               setOpenfaq(0);
//             }
//           }}
//           style={{ flexDirection: 'row' }}
//         >
//           <Text
//             style={{
//               marginLeft: 10,
//               fontWeight: 'bold',
//               alignSelf: 'flex-start',
//             }}
//           >
//             What are the benefits of a digital business card?
//           </Text>
//           <Text>{openfaq === 0 ? '⌃' : '⌄'}</Text>
//         </Pressable>

//         {openfaq === 0 && (
//           <Text style={{ margin: 20 }}>
//             It's never out of date, because you're the one editing it, not a
//             print shop. It travels better than a paper card ever could: over
//             text, QR code, wallet, whatever the other person prefers. And
//             nobody's typing your number into their phone by hand; they just save
//             it straight from the scan.
//           </Text>
//         )}
//       </View>
//       <View style={[stylehome.Faqvew, openfaq === 1 && stylehome.Faqvew2]}>
//         <Pressable
//           onPress={() => {
//             if (openfaq === 1) {
//               setOpenfaq(null);
//             } else {
//               setOpenfaq(1);
//             }
//           }}
//           style={{ flexDirection: 'row' }}
//         >
//           <Text
//             style={{
//               marginLeft: 10,
//               fontWeight: 'bold',
//               alignSelf: 'flex-start',
//             }}
//           >
//             What is the top-rated QR code business card app?
//           </Text>
//           <Text>{openfaq === 1 ? '⌃' : '⌄'}</Text>
//         </Pressable>

//         {openfaq === 1 && (
//           <Text style={{ margin: 20 }}>
//             There isn't a single universal best app, but the highest-rated
//             platforms offer instant QR code scanning without requiring an app
//             download, simple profile updates and a seamless sharing experience.
//             makemycard is built around these principles, providing a fast,
//             reliable and professional digital business card solution.
//           </Text>
//         )}
//       </View>

//       <View style={[stylehome.Faqvew, openfaq === 2 && stylehome.Faqvew2]}>
//         <Pressable
//           onPress={() => {
//             if (openfaq === 2) {
//               setOpenfaq(null);
//             } else {
//               setOpenfaq(2);
//             }
//           }}
//           style={{ flexDirection: 'row' }}
//         >
//           <Text
//             style={{
//               marginLeft: 10,
//               fontWeight: 'bold',
//               alignSelf: 'flex-start',
//             }}
//           >
//             How much does a digital business card cost?{' '}
//           </Text>
//           <Text>{openfaq === 2 ? '⌃' : '⌄'}</Text>
//         </Pressable>

//         {openfaq === 2 && (
//           <Text style={{ margin: 20 }}>
//             makemycard offers paid plans only, with pricing based on your needs.
//             Whether you're an individual professional or managing an entire
//             team, you can choose from multiple plans that include different
//             features and capabilities. Refer to the pricing section above for
//             detailed plan comparisons.
//           </Text>
//         )}
//       </View>

//       <View style={[stylehome.Faqvew, openfaq === 3 && stylehome.Faqvew2]}>
//         <Pressable
//           onPress={() => {
//             if (openfaq === 3) {
//               setOpenfaq(null);
//             } else {
//               setOpenfaq(3);
//             }
//           }}
//           style={{ flexDirection: 'row' }}
//         >
//           <Text
//             style={{
//               marginLeft: 10,
//               fontWeight: 'bold',
//               alignSelf: 'flex-start',
//             }}
//           >
//             What is the difference between a digital business card, a virtual
//             business card and an electronic business card?
//           </Text>
//           <Text>{openfaq === 3 ? '⌃' : '⌄'}</Text>
//         </Pressable>

//         {openfaq === 3 && (
//           <Text style={{ margin: 20 }}>
//             There is no functional difference between these terms they all
//             describe a business card that exists digitally instead of on paper.
//             The real difference lies in how the card is shared. Here with
//             makemycard you can share your digital business card using a QR code,
//             direct link or mobile wallet, making it accessible in any networking
//             situation.{' '}
//           </Text>
//         )}
//       </View>
//     </View>
//   );
// }

// function Banner() {
//   const movx = useRef(new Animated.Value(0)).current;
//   // const [ispaused,setIspaused]=useState(false)
//   const animation = useRef<any>(null);

//   useEffect(() => {
//     animation.current = Animated.loop(
//       Animated.timing(movx, {
//         toValue: -500,
//         duration: 10000,
//         easing: Easing.linear,
//         useNativeDriver: true,
//       }),
//     );
//     animation.current.start();

//     return () => {
//       if (animation.current) {
//         animation.current.stop();
//       }
//     };
//   }, [movx]);

//   return (
//     <Animated.View
//       style={[
//         stylehome.Logorow,
//         {
//           transform: [{ translateX: movx }],
//         },
//       ]}
//     >
//       <Image
//         source={require('./assets/Repeat Grid 1.png')}
//         style={stylehome.brandlogs}
//         resizeMode="contain"
//       />
//       <Image
//         source={require('./assets/Repeat Grid 1.png')}
//         style={stylehome.brandlogs}
//         resizeMode="contain"
//       />
//     </Animated.View>
//   );
// }



// function Home({ navigation }: { navigation: any }) {
//   const [press, setPress] = useState(false);

//   const [menuopen, setMenuopen] = useState(false);

//   const Scrollref = useRef<any>(null);

//   return (
//     <ScrollView ref={Scrollref}>
//       <View style={{ backgroundColor: '#F5F2E9' }}>
//         <View style={stylehome.topview}>
//           <Image
//             source={require('./assets/c.png')}
//             resizeMode="contain"
//             style={stylehome.toplogo}
//           />
//           <View style={stylehome.menulogo}>
//             <Pressable
//               style={{ marginTop: 10 }}
//               onPress={() => {
//                 setMenuopen(!menuopen);
//               }}
//             >
//               <Text style={{ color: 'black' }}>{menuopen ? '×' : '☰'}</Text>
//             </Pressable>
//           </View>

//           {menuopen && (
//             <View style={stylehome.menuvew}>
//               <Pressable
//                 onPress={() => {
//                   setMenuopen(false);
//                   navigation.navigate('features');
//                 }}
//               >
//                 <Text style={stylehome.menutxt}>Features</Text>
//               </Pressable>

//               <Pressable
//                 onPress={() => {
//                   setMenuopen(false);
//                   navigation.navigate('How it work');
//                 }}
//               >
//                 <Text style={stylehome.menutxt}>How it works</Text>
//               </Pressable>

//               <Pressable
//                 onPress={() => {
//                   setMenuopen(false);
//                   navigation.navigate('FAQ');
//                 }}
//               >
//                 <Text style={stylehome.menutxt}>FAQs</Text>
//               </Pressable>

//               <Pressable
//                 style={stylehome.buldbtn}
//                 onPress={() => {
//                   logout({ navigation });
//                   setMenuopen(false);
//                 }}
//               >
//                 <Text style={stylehome.btntxt}>Logout</Text>
//               </Pressable>
//             </View>
//           )}
//         </View>
//         <View>
//           <Text style={[stylehome.titletxt, { marginTop: 110 }]}>
//             The Business Card {'\n'}That Actually Keeps {'\n'}Up With You
//           </Text>
//           <Text style={stylehome.semititle}>
//             Job changed? Number changed? Your printed cards didn’t get the memo.
//             Build one digital card, keep it accurate forever, and hand it over
//             with a tap, a scan or a link.
//           </Text>
//           <Pressable
//             style={[
//               stylehome.buldbtn,
//               press && stylehome.btnhover,
//               { alignSelf: 'center' },
//             ]}
//             onPressIn={() => setPress(true)}
//             onPressOut={() => setPress(false)}
//             onPress={() => {
//               navigation.navigate('Card');
//             }}
//           >
//             <Text style={stylehome.btntxt}>Bulid My Card</Text>
//           </Pressable>
//           <View
//             style={{
//               flexDirection: 'row',
//               alignSelf: 'center',
//               width: 321.57,
//               height: 48,
//             }}
//           >
//             <Image
//               source={require('./assets/image2.png')}
//               style={stylehome.revimg1}
//             />
//             <Image
//               source={require('./assets/image1.png')}
//               style={stylehome.revimg}
//             />
//             <Image
//               source={require('./assets/image3.png')}
//               style={stylehome.revimg}
//             />
//             <Image
//               source={require('./assets/image5.png')}
//               style={stylehome.revimg}
//             />
//             <Image
//               source={require('./assets/image4.png')}
//               style={stylehome.revimg}
//             />
//             <Text
//               style={{
//                 alignSelf: 'center',
//                 fontSize: 14,
//                 fontWeight: 'normal',
//               }}
//             >
//               +100
//             </Text>
//             <Image
//               source={require('./assets/star.png')}
//               style={stylehome.star}
//             />
//           </View>
//           <View style={stylehome.blackbord}>
//             <Text
//               style={{
//                 textAlign: 'center',
//                 color: 'white',
//                 padding: 10,
//                 fontSize: 18,
//                 margin: 10,
//               }}
//             >
//               Make My Card is trusted by people {'\n'}across every industry
//             </Text>

//             <Banner />
//           </View>
//         </View>
//       </View>
//     </ScrollView>
//   );
// }

// function Features() {
//   const [press2, setPress2] = useState(false);

//   return (
//     <ScrollView>
//       <View>
//         <Text
//           style={{ textAlign: 'center', marginTop: 10, fontWeight: 'bold' }}
//         >
//           Features
//         </Text>
//         <Text style={{ fontSize: 24, textAlign: 'center', fontWeight: 'bold' }}>
//           One Card. Every Way To {'\n'}Share It.
//         </Text>
//         <Text style={{ textAlign: 'center', marginTop: 8 }}>
//           Build your card once, it powers everything else {'\n'}on this list.
//         </Text>

//         <View style={stylehome.cardvew}>
//           <Text
//             style={{
//               textAlign: 'left',
//               padding: 10,
//               fontSize: 30,
//               color: '#1D1D1F',
//               fontWeight: 'bold',
//             }}
//           >
//             Custom Digital Card
//           </Text>
//           <Text
//             style={{
//               textAlign: 'left',
//               fontSize: 14,
//               color: '#1D1D1F',
//               margin: 10,
//             }}
//           >
//             This is the one you actually build — name, title, number, email,
//             socials, the works. Every other feature on this page runs off it, so
//             change something once and it updates everywhere it’s shared.
//           </Text>
//           <Pressable
//             style={[
//               stylehome.buldbtn,
//               press2 && stylehome.btnhover,
//               { alignSelf: 'flex-start' },
//             ]}
//             onPressIn={() => setPress2(true)}
//             onPressOut={() => setPress2(false)}
//           >
//             <Text style={stylehome.btntxt}>Create Now</Text>
//           </Pressable>
//           <Image
//             source={require('./assets/mobile.webp')}
//             style={stylehome.cardlogo}
//             resizeMode="cover"
//           />
//         </View>

//         <View style={stylehome.cardvew}>
//           <Image
//             source={require('./assets/smartwatch.webp')}
//             style={stylehome.cardlogo}
//           />

//           <View style={stylehome.overlay}>
//             <Text style={{ fontSize: 18, fontWeight: 'bold' }}>QR Code</Text>
//             <Text style={{ marginTop: 5, fontSize: 13, marginBottom: 15 }}>
//               Every card comes with its own{' '}
//               <Text style={{ fontWeight: 'bold' }}>QR code.</Text> One scan
//               opens it and saves your details instantly.
//             </Text>
//           </View>
//         </View>

//         <View style={stylehome.cardvew}>
//           <Image
//             source={require('./assets/card.webp')}
//             style={stylehome.cardlogo}
//           />

//           <View style={stylehome.overlay}>
//             <Text style={{ fontSize: 18, fontWeight: 'bold' }}>Wallet</Text>
//             <Text style={{ marginTop: 5, fontSize: 13, marginBottom: 15 }}>
//               Drop your card straight into{' '}
//               <Text style={{ fontWeight: 'bold' }}>Apple Wallet</Text> "or"{' '}
//               <Text style={{ fontWeight: 'bold' }}> Google Wallet</Text> "One
//               tap and it's ready to go.."
//             </Text>
//           </View>
//         </View>

//         <View style={stylehome.cardvew}>
//           <Image
//             source={require('./assets/feature3.webp')}
//             style={stylehome.cardlogo}
//           />

//           <View style={stylehome.overlay}>
//             <Text style={{ fontSize: 18, fontWeight: 'bold' }}>
//               Virtual Backgrounds
//             </Text>
//             <Text style={{ marginTop: 5, fontSize: 13, marginBottom: 15 }}>
//               Wear your card on your video calls. Anyone on the call can scan
//               and save your details.
//             </Text>
//           </View>
//         </View>
//       </View>
//     </ScrollView>
//   );
// }

// function Howitwork() {
//   return (
//     <ScrollView>
//       <View>
//         <Text
//           style={{
//             textAlign: 'center',
//             marginTop: 10,
//             marginBottom: 10,
//             fontWeight: 'bold',
//           }}
//         >
//           HOW IT WORKS
//         </Text>
//         <Text style={{ fontSize: 24, textAlign: 'center', fontWeight: 'bold' }}>
//           From Blank Card To {'\n'} Shareable Link In Three{'\n'} Steps
//         </Text>

//         <View style={stylehome.workvew}>
//           <View style={stylehome.dot}>
//             <Text style={{ color: 'white' }}>01</Text>
//           </View>
//           <Image
//             source={require('./assets/work1.png')}
//             style={stylehome.workimg}
//           />
//         </View>
//         <Text
//           style={{
//             textAlign: 'center',
//             fontWeight: 'bold',
//             fontSize: 18,
//             padding: 5,
//           }}
//         >
//           Customize Your Card
//         </Text>
//         <Text style={{ textAlign: 'center' }}>
//           Add whatever you want people to {'\n'}find name, title, phone, email,
//           social {'\n'}links. You decide what goes on the {'\n'}card.
//         </Text>

//         <View style={stylehome.workvew}>
//           <View style={stylehome.dot}>
//             <Text style={{ color: 'white' }}>02</Text>
//           </View>
//           <Image
//             source={require('./assets/work2.png')}
//             style={stylehome.workimg}
//           />
//         </View>
//         <Text
//           style={{
//             textAlign: 'center',
//             fontWeight: 'bold',
//             fontSize: 18,
//             padding: 5,
//           }}
//         >
//           Set Up Your Account
//         </Text>
//         <Text style={{ textAlign: 'center' }}>
//           One email, one account, one card. No {'\n'}juggling multiple logins or
//           wondering {'\n'}which version of your card is currently {'\n'}
//           live.
//         </Text>

//         <View style={stylehome.workvew}>
//           <View style={stylehome.dot}>
//             <Text style={{ color: 'white' }}>03</Text>
//           </View>
//           <Image
//             source={require('./assets/work3.png')}
//             style={stylehome.workimg}
//           />
//         </View>
//         <Text
//           style={{
//             textAlign: 'center',
//             fontWeight: 'bold',
//             fontSize: 18,
//             padding: 5,
//           }}
//         >
//           Pay And Go Live
//         </Text>
//         <Text style={{ textAlign: 'center' }}>
//           Complete your payment and your{'\n'}card goes live straight away,
//           ready to {'\n'}share within minutes.
//         </Text>
//       </View>
//     </ScrollView>
//   );
// }

// function Frequntly() {
//   return (
//     <View>
//       <View>
//         <Text
//           style={{
//             textAlign: 'center',
//             marginTop: 10,
//             marginBottom: 10,
//             fontWeight: 'bold',
//           }}
//         >
//           FAQ
//         </Text>
//         <Text style={{ fontSize: 24, textAlign: 'center', fontWeight: 'bold' }}>
//           Questions People Actually{'\n'} Ask Before Signing Up
//         </Text>
//       </View>

//       <View>
//         <Faq />
//       </View>
//     </View>
//   );
// }


// function create() {
//   return (
//     <View style={{ flex: 1, alignSelf: 'center', justifyContent: 'center' }}>
//       <Text style={{ fontWeight: 'bold', alignSelf: 'center' }}>
//         Cominig Soon!
//       </Text>
//     </View>
//   );
// }

// function Footer(){

//   return(
//       <View>
//           <View style={stylehome.footer} />
//           <Image
//             source={require('./assets/c.png')}
//             style={stylehome.footerimg}
//             resizeMode="contain"
//           />
//           <Text style={{ margin: 20, alignSelf: 'flex-start' }}>
//             Make it. Share it. One scan away.
//           </Text>
//           <View
//             style={{
//               flexDirection: 'row',
//               alignItems: 'center',
//               justifyContent: 'space-evenly',
//             }}
//           >
//             <View>
//               <Text style={{ fontWeight: 'bold', margin: 10 }}>Product</Text>
//               <Text style={{ margin: 10 }}>Features</Text>
//               <Text style={{ margin: 10 }}>How it work</Text>
//               <Text style={{ margin: 10 }}>FAQ</Text>
//             </View>
//             <View>
//               <Text style={{ fontWeight: 'bold' }}>Compony</Text>
//               <Text style={{ margin: 10 }}>privicy policy</Text>
//               <Text style={{ margin: 10 }}>Term and condition</Text>
//             </View>
//           </View>

//           <View style={stylehome.footer} />
//           <View
//             style={{ flexDirection: 'row', alignSelf: 'center', margin: 10 }}
//           >
//             <Text>© 2026</Text>
//             <Pressable
//               onPress={() => Linking.openURL('https://makemycard.online/')}
//             >
//               <Text>makemycard.online</Text>
//             </Pressable>
//             <Text>. All rights reserved.</Text>
//           </View>
//         </View>
//   )
// }

export default App;
