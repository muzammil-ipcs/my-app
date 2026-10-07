import { View, Text, Pressable, Animated } from 'react-native';
import { cardstyle, Style } from '../Style';
import { useRef, useState } from 'react';
import { Image } from 'react-native';
import Mycard from '../assets/My-card.svg';
import Mycontacts from '../assets/My-contacts.svg';
import Anylatics from '../assets/analytics.svg';
import Background from '../assets/virtual-BG.svg';
import Billing from '../assets/Billing.svg';
import Setting from '../assets/settings.svg';
import { Cardview } from './Cardview';
import { Contact } from './contact';
import { Analytics } from './Analytics';
import { Cardsetting } from './Setting';
import { Bill } from './Billing';
import { logout } from './logout';
import { Bgimage } from './Bgimage';


export function Dashboard({navigation}:{navigation:any}) {
  const [sidebaropen, setSidebaropen] = useState(false);
  const sidebarwidth = useRef(new Animated.Value(70)).current;
  const [select, setSelect] = useState('card');

  function Toggle() {
    Animated.timing(sidebarwidth, {
      toValue: sidebaropen ? 70 : 160,
      duration: 200,
      useNativeDriver: false,
    }).start(() => {});
  }

  return (
    <View style={Style.mainvew}>
      <Animated.View
        style={[
          cardstyle.sidebar,
          {
            width: sidebarwidth,
          },
        ]}
      >
        <View>
          <Pressable
            onPress={() => {
              Toggle();
              setSidebaropen(!sidebaropen);
            }}
          >
            {sidebaropen ? (
              <Image
                source={require('../assets/c.png')}
                style={cardstyle.sideimg2}
                resizeMode="contain"
              />
            ) : (
              <Image
                source={require('../assets/c (1).png')}
                style={cardstyle.sideimg}
                resizeMode="contain"
              />
            )}
          </Pressable>
        </View>

        <Pressable
          onPress={() => {
            setSelect('card');
          }}
        >
          <View
            style={[select === 'card' ? [cardstyle.logoview] : cardstyle.notselect,]}
          >
            <Mycard width={22} height={22} />

            {sidebaropen && (
              <Text style={{ marginLeft: 3, overflow: 'hidden' }}>My Card</Text>
            )}
          </View>
        </Pressable>

        <Pressable
          onPress={() => {
            setSelect('contacts');
          }}
        >
          <View
            style={
              select === 'contacts' ? cardstyle.logoview : cardstyle.notselect
            }
          >
            <Mycontacts width={22} height={22} />
            {sidebaropen && (
              <Text style={{ marginLeft: 3, overflow: 'hidden' }}>
                My contacts
              </Text>
            )}
          </View>
        </Pressable>

        <Pressable
          onPress={() => {
            setSelect('analytics');
          }}
        >
          <View
            style={
              select === 'analytics' ? cardstyle.logoview : cardstyle.notselect
            }
          >
            <Anylatics width={22} height={22} />
            {sidebaropen && (
              <Text style={{ marginLeft: 3, overflow: 'hidden' }}>
                Anylatics
              </Text>
            )}
          </View>
        </Pressable>

        <Pressable
          onPress={() => {
            setSelect('virtual');
          }}
        >
          <View
            style={
              select === 'virtual' ? cardstyle.logoview : cardstyle.notselect
            }
          >
            <Background width={22} height={22} />

            {sidebaropen && (
              <Text style={{ marginLeft: 3, overflow: 'hidden' }}>
                Virtual Bg
              </Text>
            )}
          </View>
        </Pressable>

        <Pressable
          onPress={() => {
            setSelect('setting');
          }}
        >
          <View
            style={
              select === 'setting' ? cardstyle.logoview : cardstyle.notselect
            }
          >
            <Setting width={22} height={22} />
            {sidebaropen && (
              <Text style={{ marginLeft: 3, overflow: 'hidden' }}>
                Settings
              </Text>
            )}
          </View>
        </Pressable>

        <Pressable
          onPress={() => {
            setSelect('billing');
          }}
        >
          <View
            style={
              select === 'billing' ? cardstyle.logoview : cardstyle.notselect
            }
          >
            <Billing width={22} height={22} />

            {sidebaropen && (
              <Text style={{ marginLeft: 3, overflow: 'hidden' }}>
                {' '}
                Billing
              </Text>
            )}
          </View>
        </Pressable>

        <Pressable
          onPress={() => {
            setSelect('logout');
            logout(navigation);
          }}
        >
          <View
            style={
              select === 'logout' ? cardstyle.logoview : cardstyle.notselect
            }
          >
            <Text
              style={{ marginLeft: 3, overflow: 'hidden', fontWeight: 'bold' }}
            >
              ←
            </Text>
            {sidebaropen && (
              <Text style={{ marginLeft: 3, overflow: 'hidden' }}> Logout</Text>
            )}
          </View>
        </Pressable>
      </Animated.View>
      {select === 'card' && <Cardview navigation={navigation}/>}
      {select === 'contacts' && <Contact />}

      {select === 'analytics' && <Analytics />}

      {select === 'setting' && <Cardsetting />}

      {select === "billing" && <Bill/> }

      {select === "virtual" && <Bgimage/>}


    </View>
  );
}
