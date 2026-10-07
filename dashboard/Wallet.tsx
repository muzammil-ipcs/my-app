import { Linking, Pressable, Text, View, Modal } from 'react-native';
import { Walletstyle } from '../Style';
import { ScrollView } from 'react-native';
import { Image } from 'react-native';
import { useState, useRef } from 'react';
import { Dimensions } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { API_BASE_URL } from '../api/Config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Clipboard from '@react-native-clipboard/clipboard';
import ColorPicker, {
  Panel1,
  HueSlider,
  // OpacitySlider,
  // Preview,
  // Panel2,
  // Swatches,
} from 'reanimated-color-picker';

const getGoogleTextColor = (color: string) => {
  const hex = color.replace('#', '');

  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  const brightness = (r * 299 + g * 587 + b * 114) / 1000;

  return brightness < 128 ? '#ffffff' : '#000000';
};

export function Wallet({ bcard }: any) {
  const isApple_Pass_gen = bcard?.isApplePassGen;
  const isGoogle_pass_gen = bcard?.google_wallet_link ? true : false;

  const [appleCopied, setAppleCopied] = useState(false);
  const [googleCopied, setGoogleCopied] = useState(false);

  const [apple_wallet_loading, setApple_wallet_loading] = useState(false);
  const [google_wallet_loading, setGoogle_wallet_loading] = useState(false);

  const [GoogleWalletmsg, setGoogleWalletmsg] = useState('');
  const [AppleWalletmsg, setAppleWalletmsg] = useState('');

  const [applePassIcon, setApplePassIcon] = useState({
    preview: bcard?.apple_pass_icon
      ? `${API_BASE_URL}/public/${bcard.apple_pass_icon}`
      : '',
    filename: bcard?.apple_pass_icon || '',
  });

  const [applePassLogo, setApplePassLogo] = useState({
    preview: bcard?.apple_pass_logo
      ? `${API_BASE_URL}/public/${bcard.apple_pass_logo}`
      : '',
    filename: bcard?.apple_pass_logo || '',
  });

  const [applePassThumbnail, setApplePassThumbnail] = useState({
    preview: bcard?.apple_pass_tumbnail
      ? `${API_BASE_URL}/public/${bcard.apple_pass_tumbnail}`
      : '',
    filename: bcard?.apple_pass_tumbnail || '',
  });

  const [googlePassLogo, setGooglePassLogo] = useState({
    preview: bcard?.google_pass_logo
      ? `${API_BASE_URL}/public/${bcard.google_pass_logo}`
      : '',
    filename: bcard?.google_pass_logo || '',
  });

  const shortlogo = require('../assets/c (1).png');
  const longlogo = require('../assets/c.png');

  const [foregroundcolor, setForegroundcolor] = useState(
    bcard?.foregroundColor ? bcard?.foregroundColor : '#000000',
  );
  const [backgroundcolor, setBackgroundcolor] = useState(
    bcard?.backgroundColor ? bcard?.backgroundColor : '#ffffff',
  );
  const [labelcolor, setLabelcolor] = useState(
    bcard?.labelColor ? bcard?.labelColor : '#000000',
  );
  const googleTextColor = getGoogleTextColor(backgroundcolor);
  const [theme, setTheme] = useState('light');

  const [colorPickerVisible, setcolorPickerVisible] = useState(false);
  const [selectedColorType, setSelectedColorType] = useState<
    'foreground' | 'background' | 'label'
  >('foreground');

  const foregroundColorRef = useRef<View>(null);
  const backgroundColorRef = useRef<View>(null);
  const labelColorRef = useRef<View>(null);

  const [pickerPosition, setPickerPosition] = useState({
    x: 0,
    y: 0,
  });

  const OpenColorPicker = (type: 'foreground' | 'background' | 'label') => {
    setSelectedColorType(type);

    const ref =
      type === 'foreground'
        ? foregroundColorRef
        : type === 'background'
        ? backgroundColorRef
        : labelColorRef;

    ref.current?.measureInWindow((x, y, width, height) => {
      const { width: screenWidth, height: screenHeight } =
        Dimensions.get('window');

      // Color picker actual container size
      const pickerWidth = 240;
      const pickerHeight = 240;

      // Minimum distance between button and picker
      const gap = 0;

      // Distance from screen edges
      const padding = 10;

      const buttonTop = y;
      const buttonBottom = y + height;

      /*
       * -------------------------
       * Horizontal position
       * -------------------------
       */
      let pickerX = x;

      // If picker goes outside right side
      if (pickerX + pickerWidth > screenWidth - padding) {
        pickerX = screenWidth - pickerWidth - padding;
      }

      // If picker goes outside left side
      if (pickerX < padding) {
        pickerX = padding;
      }

      /*
       * -------------------------
       * Vertical position
       * -------------------------
       */

      const gapBelow = 50;
      const gapAbove = 2;

      const spaceBelow = screenHeight - buttonBottom - padding;

      const spaceAbove = buttonTop - padding;

      let pickerY: number;

      if (spaceBelow >= pickerHeight + gapBelow) {
        // Open below with larger gap
        pickerY = buttonBottom + gapBelow;
      } else if (spaceAbove >= pickerHeight + gapAbove) {
        // Open above with smaller gap
        pickerY = buttonTop - pickerHeight - gapAbove;
      } else if (spaceAbove > spaceBelow) {
        pickerY = buttonTop - pickerHeight - gapAbove;
        pickerY = Math.max(padding, pickerY);
      } else {
        pickerY = buttonBottom + gapBelow;

        pickerY = Math.min(pickerY, screenHeight - pickerHeight - padding);
      }

      /*
       * Final safety check:
       * Never allow picker to overlap the button.
       */
      if (pickerY < buttonBottom && pickerY + pickerHeight > buttonTop) {
        // Try above first
        const aboveY = buttonTop - pickerHeight - gap;

        if (aboveY >= padding) {
          pickerY = aboveY;
        } else {
          // Otherwise place below
          pickerY = buttonBottom + gap;
        }
      }

      setPickerPosition({
        x: pickerX,
        y: pickerY,
      });

      setcolorPickerVisible(true);
    });
  };
  const handleColorChange = ({ hex }: { hex: string }) => {
    if (selectedColorType === 'foreground') {
      setForegroundcolor(hex);
    }

    if (selectedColorType === 'background') {
      setBackgroundcolor(hex);
    }

    if (selectedColorType === 'label') {
      setLabelcolor(hex);
    }
  };

  if (!bcard?.firstName) {
    console.log('Business card data is missing or incomplete:', bcard);
    return;
  }

  const firstname = bcard?.firstName;
  const lastname = bcard?.lastName;
  const Organization = bcard?.organization;
  const Role = bcard?.title;
  const Email = bcard?.email;
  const mobile = bcard?.cellPhone;

  async function SelectImage(setImage: any) {
    launchImageLibrary(
      {
        mediaType: 'photo',
        selectionLimit: 1,
        quality: 0.8,
      },

      async response => {
        const asset = response.assets?.[0];

        if (!asset?.uri) {
          return;
        }

        setImage((prev: any) => ({
          ...prev,
          preview: asset.uri,
        }));

        const formData = new FormData();
        formData.append('file', {
          uri: asset.uri,
          name: asset.fileName ? asset.fileName : 'Wallet-logo.jpg',
          type: asset.type,
        } as any);

        const reponse = await fetch(`${API_BASE_URL}/api/home/addimage`, {
          method: 'POST',
          body: formData,
        });

        const data = await reponse.json();
        console.log(data);

        setImage((prev: any) => ({
          ...prev,
          filename: data.result,
        }));
      },
    );
  }

  function clear_wallet_msg() {
    setAppleWalletmsg('');
    setGoogleWalletmsg('');
  }
  async function Save_wallet_setting() {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(
        `${API_BASE_URL}/api/businesscard/editBusinesscarddata?id=${bcard._id}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            firstName: firstname,
            lastName: lastname,
            role: Role,
            Organization: Organization,
            cellPhone: mobile,
            labelColor: labelcolor,
            foregroundColor: foregroundcolor,
            backgroundColor: backgroundcolor,
            apple_pass_icon: applePassIcon.filename,
            apple_pass_logo: applePassLogo.filename,
            apple_pass_tumbnail: applePassThumbnail.filename,
            google_pass_logo: googlePassLogo.filename,
          }),
        },
      );

      const data = await response.json();
      console.log(data);
    } catch (error) {
      console.log('Api not Working', error);
    }
  }

  async function Google_wallet_Genrate() {
    try {
      setGoogle_wallet_loading(true);
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(
        `${API_BASE_URL}/api/businesscard/generategooglegenericpass`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            id: bcard._id,
          }),
        },
      );
      const data = await response.json();
      if (data.status === 'success') {
        setGoogleWalletmsg('');
        console.log(data);
        setGoogle_wallet_loading(false);
      } else {
        setGoogleWalletmsg(data.message || 'Google Wallet generation failed');
      }
    } catch (error) {
      console.log('Google Genrate wallet api not working', error);
      setGoogleWalletmsg('Something went wrong. Please try again.');
    } finally {
      setGoogle_wallet_loading(false);
    }
  }

  async function Apple_wallet_Genrate() {
    try {
      setApple_wallet_loading(true);
      const token = await AsyncStorage.getItem('token');
      const repsponse = await fetch(
        `${API_BASE_URL}/api/businesscard/generatepasskey`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            id: bcard._id,
          }),
        },
      );
      const data = await repsponse.json();
      if (data.status === 'success') {
        setAppleWalletmsg('');
        console.log(data);
        setApple_wallet_loading(false);
      }
      setAppleWalletmsg(data.message || 'Apple Wallet generation failed');
    } catch (error) {
      console.log('Apple Genrate wallet api not working', error);
      setAppleWalletmsg('Something went wrong. Please try again.');
    } finally {
      setApple_wallet_loading(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
      <View style={Walletstyle.genrateview}>
        <Text style={{ fontWeight: '600', padding: 10 }}>Apple Wallet</Text>
        <Pressable
          disabled={apple_wallet_loading}
          style={[
            Walletstyle.genratepassbtn,
            { opacity: apple_wallet_loading ? 0.5 : 1 },
          ]}
          onPress={() => {
            Apple_wallet_Genrate();
          }}
        >
          <Text style={{ fontWeight: '600' }}>
            {isApple_Pass_gen
              ? apple_wallet_loading
                ? 'Refreshing......'
                : ' Refresh Pass'
              : apple_wallet_loading
              ? 'Genrating....'
              : 'Genrate Pass'}
          </Text>
        </Pressable>
        {isApple_Pass_gen ? (
          <View>
            <View style={{ flexDirection: 'row' }}>
              <Pressable
                style={Walletstyle.wallet_open_btnniew}
                onPress={() => Linking.openURL(bcard.apple_pass_link)}
              >
                <Text style={{ fontSize: 12, fontWeight: '600' }}>Open</Text>
              </Pressable>

              <Pressable
                style={Walletstyle.wallet_open_btnniew}
                onPress={() => {
                  Clipboard.setString(bcard.apple_pass_link);
                  setAppleCopied(true);
                }}
              >
                <Text style={{ fontSize: 12, fontWeight: '600' }}>
                  {appleCopied ? 'Copied' : 'Copy Link'}
                </Text>
              </Pressable>
            </View>

            <Pressable
              style={{ margin: 5, padding: 5 }}
              onPress={() => Linking.openURL(bcard.apple_pass_link)}
            >
              <Text
                style={{
                  textDecorationLine: 'underline',
                  color: '#FE3D12',
                  fontSize: 12,
                }}
              >
                Open in Wallet
              </Text>
            </Pressable>
          </View>
        ) : (
          AppleWalletmsg !== '' && (
            <Text
              style={{
                color: 'red',
                fontSize: 10,
                margin: 5,
                textAlign: 'center',
              }}
            >
              {AppleWalletmsg}
            </Text>
          )
        )}
      </View>

      <View style={Walletstyle.genrateview}>
        <Text style={{ fontWeight: '600', padding: 10 }}>Google Wallet</Text>
        <Pressable
          disabled={google_wallet_loading}
          style={[
            Walletstyle.genratepassbtn,
            { opacity: google_wallet_loading ? 0.5 : 1 },
          ]}
          onPress={() => {
            Google_wallet_Genrate();
          }}
        >
          <Text style={{ fontWeight: '600' }}>
            {isGoogle_pass_gen
              ? google_wallet_loading
                ? 'Refreshing....'
                : 'Refresh Pass'
              : google_wallet_loading
              ? 'Genrating....'
              : 'Genrate Pass'}
          </Text>
        </Pressable>

        {isGoogle_pass_gen ? (
          <View>
            <View style={{ flexDirection: 'row' }}>
              <Pressable
                style={Walletstyle.wallet_open_btnniew}
                onPress={() => Linking.openURL(bcard.google_wallet_link)}
              >
                <Text style={{ fontSize: 12, fontWeight: '600' }}>Open</Text>
              </Pressable>

              <Pressable
                style={Walletstyle.wallet_open_btnniew}
                onPress={() => {
                  Clipboard.setString(bcard.google_wallet_link);
                  setGoogleCopied(true);
                }}
              >
                <Text style={{ fontSize: 12, fontWeight: '600' }}>
                  {googleCopied ? 'Copied' : 'Copy Link'}
                </Text>
              </Pressable>
            </View>

            <Pressable
              style={{ margin: 5, padding: 5 }}
              onPress={() => Linking.openURL(bcard.google_wallet_link)}
            >
              <Text
                style={{
                  textDecorationLine: 'underline',
                  color: '#FE3D12',
                  fontSize: 12,
                }}
              >
                Open in Wallet
              </Text>
            </Pressable>
          </View>
        ) : (
          GoogleWalletmsg !== '' && (
            <Text
              style={{
                color: 'red',
                fontSize: 10,
                margin: 5,
                textAlign: 'center',
              }}
            >
              {GoogleWalletmsg}
            </Text>
          )
        )}
      </View>

      {/* Apple wallet detials and view  */}
      <Text
        style={{
          fontWeight: 'bold',
          alignSelf: 'center',
          fontSize: 16,
          margin: 5,
        }}
      >
        Apple Wallet Preview
      </Text>
      <View style={[Walletstyle.preview, { backgroundColor: backgroundcolor }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={Walletstyle.image1}>
            <Image
              source={
                applePassLogo.preview
                  ? { uri: applePassLogo.preview }
                  : longlogo
              }
              style={{ width: '100%', height: '100%', borderRadius: 100 }}
              resizeMode="cover"
            />
          </View>
          <Text
            style={{
              fontWeight: 600,
              margin: 5,
              fontSize: 13,
              color: foregroundcolor,
            }}
          >
            {Organization ? Organization : 'Organization'}
          </Text>
          <View style={Walletstyle.image2}>
            <Image
              source={
                applePassThumbnail.preview
                  ? { uri: applePassThumbnail.preview }
                  : shortlogo
              }
              style={{ width: '100%', height: '100%', borderRadius: 20 }}
              resizeMode="contain"
            />
          </View>
        </View>

        <Text
          style={{
            fontSize: 13,
            fontWeight: 'bold',
            marginTop: 10,
            color: foregroundcolor,
          }}
        >
          {Role ? Role : 'Role'}
        </Text>
        <Text
          style={{ fontSize: 18, fontWeight: 'bold', color: foregroundcolor }}
        >
          {firstname} {lastname}
        </Text>

        <Text
          style={{
            fontSize: 16,
            fontWeight: 'bold',
            marginTop: 10,
            color: labelcolor,
          }}
        >
          EMAIL
        </Text>
        <Text
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.8}
          style={{ fontWeight: 500, fontSize: 16, color: foregroundcolor }}
        >
          {Email}
        </Text>

        <Text
          style={{
            fontSize: 16,
            fontWeight: 'bold',
            marginTop: 10,
            color: labelcolor,
          }}
        >
          PHONE
        </Text>
        <Text style={{ fontWeight: 500, fontSize: 16, color: foregroundcolor }}>
          {mobile ? mobile : '__'}
        </Text>
        <View style={Walletstyle.wallet_qr_view}>
          <Image
            source={require('../assets/qr.png')}
            style={{ width: 50, height: 50 }}
          />
        </View>
        <View style={Walletstyle.barnding_view}>
          <Text
            style={{
              fontSize: 12,
              color: googleTextColor,
              alignSelf: 'center',
            }}
          >
            makemycard.online
          </Text>
        </View>
      </View>

      {/* Google WAllet details and view */}
      <Text
        style={{
          fontWeight: 'bold',
          alignSelf: 'center',
          fontSize: 16,
          margin: 5,
        }}
      >
        Google Wallet Preview
      </Text>
      <View style={[Walletstyle.preview, { backgroundColor: backgroundcolor }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={Walletstyle.image1}>
            <Image
              source={
                googlePassLogo.preview
                  ? { uri: googlePassLogo.preview }
                  : shortlogo
              }
              style={{ width: '100%', height: '100%', borderRadius: 100 }}
              resizeMode="cover"
            />
          </View>
          <Text
            style={{
              fontWeight: 600,
              margin: 5,
              fontSize: 13,
              color: googleTextColor,
            }}
          >
            {Organization ? Organization : 'Organization'}
          </Text>
        </View>

        <Text
          style={{
            fontSize: 13,
            fontWeight: 'bold',
            marginTop: 20,
            color: googleTextColor,
          }}
        >
          {Role ? Role : 'Role'}
        </Text>
        <Text
          style={{ fontSize: 18, fontWeight: 'bold', color: googleTextColor }}
        >
          {firstname} {lastname}
        </Text>

        <Text
          style={{
            fontSize: 16,
            fontWeight: 'bold',
            marginTop: 10,
            color: googleTextColor,
            opacity: 0.7,
          }}
        >
          EMAIL
        </Text>
        <Text
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.8}
          style={{ fontWeight: 500, fontSize: 16, color: googleTextColor }}
        >
          {Email}
        </Text>

        <View
          style={{
            borderBottomColor: '#222',
            borderWidth: 0.5,
            marginTop: 10,
            marginBottom: 5,
          }}
        />

        <Text
          style={{
            fontSize: 16,
            fontWeight: 'bold',
            marginTop: 10,
            color: googleTextColor,
            opacity: 0.7,
          }}
        >
          PHONE NUMBER
        </Text>
        <Text style={{ fontWeight: 500, fontSize: 16, color: googleTextColor }}>
          {mobile ? mobile : '__'}
        </Text>
        <View style={Walletstyle.wallet_qr_view}>
          <Image
            source={require('../assets/qr.png')}
            style={{ width: 50, height: 50 }}
          />
        </View>
        <View style={Walletstyle.barnding_view}>
          <Text
            style={{
              fontSize: 10,
              fontWeight: 'bold',
              color: googleTextColor,
              alignSelf: 'center',
              fontStyle: 'italic',
            }}
          >
            makemycard
          </Text>
          <View style={{ backgroundColor: '#ffffff', borderRadius: 5 }}>
            <Image
              source={require('../assets/smartphone _icon.png')}
              style={{ width: 20, height: 20 }}
            />
          </View>
        </View>
      </View>

      {/* Wallet Details section */}
      <View style={Walletstyle.genrateview}>
        <Text style={{ fontSize: 16 }}>Wallet Settings</Text>
        <Text style={Walletstyle.detailstitletxt}>Your Details</Text>
        <Text style={{ fontSize: 10, margin: 5 }}>
          Edited via "Edit Your Card":
        </Text>

        <View style={{ flexDirection: 'row', gap: 15 }}>
          <View style={{ flex: 1 }}>
            <Text style={Walletstyle.detailstitletxt}>First Name</Text>
            <View style={Walletstyle.details_input}>
              <Text numberOfLines={1} ellipsizeMode="tail">
                {firstname}
              </Text>
            </View>
          </View>

          <View style={{ flex: 1 }}>
            <Text style={Walletstyle.detailstitletxt}>Last Name</Text>
            <View style={Walletstyle.details_input}>
              <Text numberOfLines={1} ellipsizeMode="tail">
                {lastname ? lastname : '__'}
              </Text>
            </View>
          </View>
        </View>

        <View style={{ flexDirection: 'row', gap: 15 }}>
          <View style={{ flex: 1 }}>
            <Text style={[Walletstyle.detailstitletxt]}>Organization</Text>
            <View style={Walletstyle.details_input}>
              <Text numberOfLines={1} ellipsizeMode="tail">
                {Organization ? Organization : '__'}
              </Text>
            </View>
          </View>

          <View style={{ flex: 1 }}>
            <Text style={Walletstyle.detailstitletxt}>Role/Designation</Text>
            <View style={Walletstyle.details_input}>
              <Text numberOfLines={1} ellipsizeMode="tail">
                {Role ? Role : '__'}
              </Text>
            </View>
          </View>
        </View>

        <View style={{ flexDirection: 'row', gap: 15 }}>
          <View style={{ flex: 1 }}>
            <Text style={Walletstyle.detailstitletxt}>Email</Text>
            <View style={Walletstyle.details_input}>
              <Text numberOfLines={1} ellipsizeMode="middle">
                {Email ? Email : '__'}
              </Text>
            </View>
          </View>

          <View style={{ flex: 1 }}>
            <Text style={Walletstyle.detailstitletxt}>Mobile Number</Text>
            <View style={Walletstyle.details_input}>
              <Text
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.75}
                style={Walletstyle.wallet_details_txt}
              >
                {mobile ? mobile : '__'}
              </Text>
            </View>
          </View>
        </View>

        <Text>Theme</Text>

        <View style={{ flexDirection: 'row' }}>
          <Pressable
            style={[
              Walletstyle.thembtn,
              {
                backgroundColor: theme === 'light' ? '#000000' : '#F5F2E9',
                borderColor: theme === 'light' ? '#0000' : '#ffff',
              },
            ]}
            onPress={() => {
              setTheme('light');
              setForegroundcolor('#000000');
              setBackgroundcolor('#ffffff');
              setLabelcolor('#000000');
              clear_wallet_msg();
            }}
          >
            <Text
              style={{
                fontWeight: 'bold',
                color: theme === 'light' ? '#ffffff' : '#000000',
              }}
            >
              Light
            </Text>
          </Pressable>

          <Pressable
            style={[
              Walletstyle.thembtn,
              {
                backgroundColor: theme === 'dark' ? '#000000' : '#F5F2E9',
                borderColor: theme === 'dark' ? '#0000' : '#ffff',
              },
            ]}
            onPress={() => {
              setTheme('dark');
              setForegroundcolor('#ffffff');
              setBackgroundcolor('#000000');
              setLabelcolor('#ffffff');
              clear_wallet_msg();
            }}
          >
            <Text
              style={{
                fontWeight: 'bold',
                color: theme === 'dark' ? '#ffffff' : '#000000',
              }}
            >
              Dark
            </Text>
          </Pressable>

          <Pressable
            style={[
              Walletstyle.thembtn,
              {
                backgroundColor: theme === 'custom' ? '#000000' : '#F5F2E9',
                borderColor: theme === 'custom' ? '#0000' : '#ffff',
              },
            ]}
            onPress={() => {
              setTheme('custom');
              clear_wallet_msg();
            }}
          >
            <Text
              style={{
                fontWeight: 'bold',
                color: theme === 'custom' ? '#ffffff' : '#000000',
              }}
            >
              Custom
            </Text>
          </Pressable>
        </View>

        <Text style={{ margin: 5, fontSize: 10 }}>
          Light/Dark auto-fill the colors below. Pick Custom to set them
          manually.
        </Text>

        <View style={{ flexDirection: 'row', gap: 40 }}>
          <View>
            <Text style={Walletstyle.detailstitletxt}>Foreground Color</Text>
            <View style={{ flexDirection: 'row' }}>
              <Pressable
                ref={foregroundColorRef}
                onPress={() => {
                  OpenColorPicker('foreground');
                }}
              >
                <View
                  style={{
                    backgroundColor: foregroundcolor,
                    width: 35,
                    height: 35,
                    margin: 5,
                    borderRadius: 10,
                    borderWidth: 1,
                  }}
                />
              </Pressable>
              <Text style={{ alignSelf: 'center' }}>{foregroundcolor}</Text>
            </View>
          </View>

          <View>
            <Text style={Walletstyle.detailstitletxt}>Backgound Color</Text>
            <View style={{ flexDirection: 'row' }}>
              <Pressable
                ref={backgroundColorRef}
                onPress={() => {
                  OpenColorPicker('background');
                }}
              >
                <View
                  style={{
                    backgroundColor: backgroundcolor,
                    width: 35,
                    height: 35,
                    margin: 5,
                    borderRadius: 10,
                    borderWidth: 1,
                  }}
                />
              </Pressable>
              <Text style={{ alignSelf: 'center' }}>{backgroundcolor}</Text>
            </View>
          </View>
        </View>

        <View>
          <Text style={Walletstyle.detailstitletxt}>Label Color</Text>
          <View style={{ flexDirection: 'row' }}>
            <Pressable
              ref={labelColorRef}
              onPress={() => {
                OpenColorPicker('label');
              }}
            >
              <View
                style={{
                  backgroundColor: labelcolor,
                  width: 35,
                  height: 35,
                  margin: 5,
                  borderRadius: 10,
                  borderWidth: 1,
                }}
              />
            </Pressable>

            <Text style={{ alignSelf: 'center' }}>{labelcolor}</Text>
          </View>
        </View>

        <View style={{ flexDirection: 'row', gap: 15 }}>
          <View>
            <Text style={Walletstyle.detailstitletxt}>
              Apple Pass Icon{'\n'}(29×29px)
            </Text>
            <Pressable
              onPress={() => {
                SelectImage(setApplePassIcon);
                clear_wallet_msg();
              }}
            >
              <View style={Walletstyle.uploadimage}>
                <View style={Walletstyle.upload_image_showview}>
                  {applePassIcon.preview ? (
                    <Image
                      source={{ uri: applePassIcon.preview }}
                      style={{
                        width: '100%',
                        height: '100%',
                        borderRadius: 15,
                      }}
                    />
                  ) : (
                    <Image
                      source={require('../assets/camera_icon.png')}
                      style={{
                        width: 15,
                        height: 15,
                        borderRadius: 15,
                        alignSelf: 'center',
                      }}
                    />
                  )}
                </View>

                <Text style={{ fontSize: 10, marginRight: 5 }}>
                  click to upload
                </Text>
              </View>
            </Pressable>
          </View>

          <View>
            <Text style={Walletstyle.detailstitletxt}>
              Apple Pass Logo{'\n'}(160×160px)
            </Text>
            <Pressable
              onPress={() => {
                SelectImage(setApplePassLogo);
                clear_wallet_msg();
              }}
            >
              <View style={Walletstyle.uploadimage}>
                <View style={Walletstyle.upload_image_showview}>
                  {applePassLogo.preview ? (
                    <Image
                      source={{ uri: applePassLogo.preview }}
                      style={{
                        width: '100%',
                        height: '100%',
                        borderRadius: 15,
                      }}
                    />
                  ) : (
                    <Image
                      source={require('../assets/camera_icon.png')}
                      style={{ width: 15, height: 15, alignSelf: 'center' }}
                    />
                  )}
                </View>
                <Text style={{ fontSize: 10, marginRight: 5 }}>
                  click to upload
                </Text>
              </View>
            </Pressable>
          </View>
        </View>

        <View style={{ flexDirection: 'row', gap: 15, marginTop: 5 }}>
          <View style={{ flex: 1 }}>
            <Text style={Walletstyle.detailstitletxt}>
              Apple Pass Thumbnail{'\n'}(29×29px)
            </Text>
            <Pressable
              onPress={() => {
                SelectImage(setApplePassThumbnail);
                clear_wallet_msg();
              }}
            >
              <View style={Walletstyle.uploadimage}>
                <View style={Walletstyle.upload_image_showview}>
                  {applePassThumbnail.preview ? (
                    <Image
                      source={{ uri: applePassThumbnail.preview }}
                      style={{
                        width: '100%',
                        height: '100%',
                        borderRadius: 15,
                      }}
                    />
                  ) : (
                    <Image
                      source={require('../assets/camera_icon.png')}
                      style={{
                        width: 15,
                        height: 15,
                        borderRadius: 15,
                        alignSelf: 'center',
                      }}
                    />
                  )}
                </View>
                <Text style={{ fontSize: 10, marginRight: 5 }}>
                  click to upload
                </Text>
              </View>
            </Pressable>
          </View>

          <View style={{ flex: 1 }}>
            <Text style={Walletstyle.detailstitletxt}>
              Google Pass Logo{'\n'}(max 680×680px , square)
            </Text>
            <Pressable
              onPress={() => {
                SelectImage(setGooglePassLogo);
                clear_wallet_msg();
              }}
            >
              <View style={Walletstyle.uploadimage}>
                <View style={Walletstyle.upload_image_showview}>
                  {googlePassLogo.preview ? (
                    <Image
                      source={{ uri: googlePassLogo.preview }}
                      style={{
                        width: '100%',
                        height: '100%',
                        borderRadius: 15,
                      }}
                    />
                  ) : (
                    <Image
                      source={require('../assets/camera_icon.png')}
                      style={{ width: 15, height: 15, alignSelf: 'center' }}
                    />
                  )}
                </View>
                <Text style={{ fontSize: 10, marginRight: 5 }}>
                  click to upload
                </Text>
              </View>
            </Pressable>
          </View>
        </View>

        <Pressable
          style={Walletstyle.save_wallet_btn}
          onPress={() => {
            clear_wallet_msg();
            Save_wallet_setting();
          }}
        >
          <Text style={{ fontWeight: '600' }}>Save wallet Settings</Text>
        </Pressable>
      </View>

      <Modal
        visible={colorPickerVisible}
        transparent={true}
        animationType="fade"
        statusBarTranslucent={true}
        onRequestClose={() => setcolorPickerVisible(false)}
      >
        <View style={{ flex: 1 }}>
          {/* Outside area - closes picker */}
          <Pressable
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
            }}
            onPress={() => setcolorPickerVisible(false)}
          />

          {/* Color Picker */}
          <View
            style={{
              position: 'absolute',
              left: pickerPosition.x,
              top: pickerPosition.y,
              width: 240,
              height: 270,
              backgroundColor: '#ffffff',
              borderRadius: 10,
              padding: 10,
              elevation: 10,
              shadowColor: '#000000',
              shadowOffset: { width: 0, height: 3 },
              shadowOpacity: 0.2,
              shadowRadius: 6,
            }}
          >
            <Text
              style={{
                fontSize: 14,
                fontWeight: '600',
                marginBottom: 10,
              }}
            >
              Select Color
            </Text>

            <ColorPicker
              value={
                selectedColorType === 'foreground'
                  ? foregroundcolor
                  : selectedColorType === 'background'
                  ? backgroundcolor
                  : labelcolor
              }
              onChangeJS={handleColorChange}
            >
              <Panel1
                style={{
                  width: '100%',
                  height: 150,
                }}
              />

              <HueSlider
                style={{
                  width: '100%',
                  height: 25,
                  marginTop: 10,
                }}
              />
            </ColorPicker>

            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginTop: 10,
              }}
            >
              <Text
                style={{
                  backgroundColor: '#000000',
                  paddingHorizontal: 14,
                  paddingVertical: 7,
                  borderRadius: 6,
                  color: '#ffffff',
                  fontSize: 12,
                  fontWeight: '600',
                }}
              >
                {selectedColorType === 'foreground'
                  ? foregroundcolor
                  : selectedColorType === 'background'
                  ? backgroundcolor
                  : labelcolor}
              </Text>

              <Pressable
                onPress={() => setcolorPickerVisible(false)}
                style={{
                  backgroundColor: '#000000',
                  paddingHorizontal: 14,
                  paddingVertical: 7,
                  borderRadius: 6,
                }}
              >
                <Text
                  style={{
                    color: '#ffffff',
                    fontSize: 12,
                    fontWeight: '600',
                  }}
                >
                  Apply
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}
