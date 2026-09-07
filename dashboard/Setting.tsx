import { Pressable, Text, View } from 'react-native';
import { cardstyle, Style } from '../Style';
import Username_icon from '../assets/username_icon.svg';
import Email_icon from '../assets/email_icno.svg';
import Lock_icon from '../assets/lock_icon.svg';
import { useEffect, useState } from 'react';
import { TextInput } from 'react-native';
import { Pressanimation } from './pressanimation';
import { Animated } from 'react-native';
import { Restpassword } from '../api/restpassword';
import { KeyboardAvoidingView } from 'react-native';
import { ScrollView } from 'react-native';
import  AsyncStorage  from '@react-native-async-storage/async-storage';

export function Cardsetting() {
  const [restpass, setRestpass] = useState(false);

  const [currentpass, setCurrentpass] = useState('');
  const [newpass, setNewpass] = useState('');
  const [confirmpass, setConfirmpass] = useState('');

  const { animationbtn, onpressin, onpressout } = Pressanimation();

  const[username,setUsername]=useState<any>("")
  const[email,setEmail]=useState<any>("")



  async function Userdetails() {
    const Name=await AsyncStorage.getItem("username")
    const Email=await AsyncStorage.getItem("email")

    console.log("username",Name)
    console.log("email",Email)

    setUsername(Name)
    setEmail(Email)


  }

  useEffect(()=>{
    Userdetails();


  },[])


  return (
    <KeyboardAvoidingView 
    style={{flex:1}}
    behavior="height"

    >
      <ScrollView 
      contentContainerStyle={{
        flexGrow:1,
        paddingBottom:50,
      }}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}

      >
        <View style={cardstyle.mainview}>
          <Text style={cardstyle.title}>Settings</Text>
          <Text style={cardstyle.minitxt}>
            Manage your account details and security.
          </Text>

          <View style={cardstyle.subview}>
            <Text style={{ margin: 5, fontWeight: 'bold', marginRight: 160 }}>
              Account Details
            </Text>

            <View style={{ flexDirection: 'row' }}>
              <View style={cardstyle.icon}>
                <Username_icon width={22} height={22} />
              </View>
              <View style={{flex:1,}}>
                <Text style={{ color: 'grey'}}>
                  {' '}
                  Username{' '}
                </Text>
                <Text style={{flexShrink:1,marginLeft:10}}>{username}</Text>
              </View>
            </View>
            <View style={{ height: 1, backgroundColor: 'black', margin: 10 }} />
            <View style={{ flexDirection: 'row' }}>
              <View style={cardstyle.icon}>
                <Email_icon width={22} height={22} />
              </View>
              <View style={{flex:1,}}>
                <Text style={{ color: 'grey', marginLeft: 10 }}> Email </Text>
                <Text style={{flexShrink:1,marginLeft:10}}>{email}</Text>
              </View>
            </View>
          </View>

          <View style={cardstyle.subview}>
            <View style={{ flexDirection: 'row' }}>
              <View style={cardstyle.icon}>
                <Lock_icon width={22} height={22} />
              </View>
              <View>
                <Text
                  style={{ margin: 5, fontWeight: 'bold', marginRight: 150 }}
                >
                  Password
                </Text>
                <Text style={{ fontSize: 12, marginLeft: 10 }}>
                  Update your account password.
                </Text>
              </View>
            </View>

            <View style={cardstyle.restpass}>
              <Pressable
                onPress={() => {
                  setRestpass(!restpass);
                }}
              >
                {restpass ? (
                  <Text style={cardstyle.restpasstxt}>Cancel</Text>
                ) : (
                  <Text style={cardstyle.restpasstxt}>Reset Password</Text>
                )}
              </Pressable>
            </View>
            {restpass && (
              <View>
                <Text style={cardstyle.restinputtxt}>Current password</Text>
                <TextInput
                  placeholder="Enter your Current password"
                  value={currentpass}
                  onChangeText={setCurrentpass}
                  style={cardstyle.restinput}
                />

                <Text style={cardstyle.restinputtxt}>New password</Text>
                <TextInput
                  placeholder="Enter new password"
                  value={newpass}
                  onChangeText={setNewpass}
                  style={cardstyle.restinput}
                />

                <Text style={cardstyle.restinputtxt}>Confirm New password</Text>
                <TextInput
                  placeholder="re-enter new password"
                  value={confirmpass}
                  onChangeText={setConfirmpass}
                  style={cardstyle.restinput}
                />

                <Animated.View style={{ transform: [{ scale: animationbtn }] }}>
                  <Pressable
                    style={[
                      Style.mainbtn,
                      { width: 150 },
                      { alignSelf: 'flex-end' },
                    ]}
                    onPressIn={onpressin}
                    onPressOut={onpressout}
                    onPress={() => {
                      Restpassword(currentpass);
                    }}
                  >
                    <Text style={Style.btntxt}>Update Password</Text>
                  </Pressable>
                </Animated.View>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
