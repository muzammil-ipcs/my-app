import { View, Text, Pressable } from 'react-native';
import { cardstyle, Contactstyle } from '../Style';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import Editpencil from '../assets/editpencil.svg';
import Delete from '../assets/delete.svg';
import Email from '../assets/email_icno.svg';
import { Image } from 'react-native';
import { TextInput } from 'react-native';
import Cancel from '../assets/cancel.svg';
import Save from '../assets/save.svg';

export function Contact() {
  const [result, setResult] = useState<any[]>([]);

  const [edit, setEdit] = useState<string | null>(null);

  const [firstname, setFirstname] = useState('');
  const [lastname, setLastname] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');

  useEffect(() => {
    Reference();
  },[]);

  async function Reference() {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(
        'http://10.0.2.2:5004/api/reference/myreferences',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            limit: 10,
            page: 2,
          }),
        },
      );
      const data = await response.json();
      console.log(data);
      setResult(data.result);
    } catch (error) {
      console.log(error);
    }
  }

  async function DeleteRefrence(Id: String) {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(
        'http://10.0.2.2:5004/api/reference/delete',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            id: Id,
          }),
        },
      );
      const data = await response.json();
      console.log(data);
    } catch (error) {
      console.log(error);
    }
  }

  async function Update() {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(
        'http://10.0.2.2:5004/api/reference/update',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            id: edit,
            firstName: firstname,
            lastName: lastname,
            company: company,
            email: email,
            jobTitle: role,
            mobile: phone,
          }),
        },
      );
      const data = await response.json();

      if (data.code === 200) {
        setEdit(null);
      }
    } catch (error) {
      console.log(error);
    }
  }

  function Formatdate(date: string) {
    const data = new Date(date);
    const month = data.getMonth() + 1;
    const day = data.getDate();
    const year = data.getFullYear().toString();
    const format = `${day}/${month}/${year}`;
    return format;
  }
  function StartEdit(item: any) {
    setEdit(item._id);
    setFirstname(item.firstName || '');
    setLastname(item.lastName || '');
    setEmail(item.email || '');
    setRole(item.jobTitle || '');
    setPhone(item.mobile || '');
    setCompany(item.company || '');
  }

  return (
    <View style={cardstyle.mainview}>
      <Text style={cardstyle.title}>My Contacts</Text>
      <Text style={cardstyle.minitxt}>
        People who saved your card and shared their contact details.
      </Text>

      {result.length > 0 ? (
        result.map(item => {
          const isEdit = edit === item._id;
          return (
            <View style={[cardstyle.subview]} key={item._id}>
              {isEdit ? (
                <View>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                    }}
                  >
                    <View>
                      <Text style={{ padding: 2 }}>First Name</Text>
                      <TextInput
                        style={[
                          Contactstyle.modelInput,
                          { padding: 8, width: 130 },
                        ]}
                        value={firstname}
                        onChangeText={setFirstname}
                      />
                    </View>
                    <View>
                      <Text style={{ padding: 2 }}>Last Name</Text>
                      <TextInput
                        style={[
                          Contactstyle.modelInput,
                          { padding: 8, width: 130 },
                        ]}
                        value={lastname}
                        onChangeText={setLastname}
                      />
                    </View>
                  </View>

                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                    }}
                  >
                    <View>
                      <Text style={{ padding: 2 }}>Email</Text>
                      <TextInput
                        style={[
                          Contactstyle.modelInput,
                          { padding: 8, width: 130 },
                        ]}
                        value={email}
                        onChangeText={setEmail}
                      />
                    </View>
                    <View>
                      <Text style={{ padding: 2 }}>Phone </Text>
                      <TextInput
                        style={[
                          Contactstyle.modelInput,
                          { padding: 8, width: 130 },
                        ]}
                        value={phone}
                        onChangeText={setPhone}
                      />
                    </View>
                  </View>

                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                    }}
                  >
                    <View>
                      <Text style={{ padding: 2 }}>Company</Text>
                      <TextInput
                        style={[
                          Contactstyle.modelInput,
                          { padding: 8, width: 130 },
                        ]}
                        value={company}
                        onChangeText={setCompany}
                      />
                    </View>
                    <View>
                      <Text style={{ padding: 2 }}>Job Title</Text>
                      <TextInput
                        style={[
                          Contactstyle.modelInput,
                          { padding: 8, width: 130 },
                        ]}
                        value={role}
                        onChangeText={setRole}
                      />
                    </View>
                  </View>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignSelf: 'flex-end',
                      marginTop: 20,
                    }}
                  >
                    <Pressable
                      style={[
                        Contactstyle.modelbtn,
                        { flexDirection: 'row', alignItems: 'center' },
                      ]}
                      onPress={() => {
                        setEdit(null);
                      }}
                    >
                      <Cancel width={16} height={16} />
                      <Text style={{ margin: 4 }}>Cancel</Text>
                    </Pressable>
                    <Pressable
                      style={[
                        Contactstyle.modelbtn,
                        { flexDirection: 'row', alignItems: 'center' },
                      ]}
                      onPress={() => {
                        Update();
                      }}
                    >
                      <Save width={18} height={18} />
                      <Text style={{ margin: 4 }}>Save</Text>
                    </Pressable>
                  </View>
                </View>
              ) : (
                <View>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      paddingVertical: 10,
                      justifyContent: 'space-between',
                    }}
                  >
                    <View>
                      <Text
                        style={{
                          fontSize: 16,
                          fontWeight: 'bold',
                          paddingRight: 8,
                        }}
                      >
                        {item.firstName} {item.lastName}
                      </Text>
                    </View>
                    <View style={{ flexDirection: 'row' }}>
                      <Text style={{ paddingRight: 8 }}>
                        {Formatdate(item.created_at)}
                      </Text>
                      <Pressable
                        style={{ paddingRight: 8, alignItems: 'center' }}
                        onPress={() => {
                          StartEdit(item);
                        }}
                      >
                        <Editpencil width={20} height={20} />
                      </Pressable>
                      <Pressable
                        style={{ paddingRight: 8, alignItems: 'center' }}
                        onPress={() => {
                          DeleteRefrence(item._id);
                        }}
                      >
                        <Delete width={20} height={20} />
                      </Pressable>
                    </View>
                  </View>

                  <View
                    style={{
                      flexDirection: 'row',
                      paddingVertical: 10,
                      flexWrap: 'wrap',
                    }}
                  >
                    <Email width={20} height={20} />
                    <Text style={{ fontWeight: '600' }}>{item.email}</Text>
                  </View>

                  <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                    <View style={{ flexDirection: 'row', paddingVertical: 8 }}>
                      <Image
                        source={require('../assets/phone_icon.png')}
                        style={{ width: 20, height: 20 }}
                      />
                      <Text style={{ fontWeight: '600', paddingRight: 8 }}>
                        {item.mobile}
                      </Text>
                    </View>
                    <View style={{ flexDirection: 'row', paddingVertical: 8 }}>
                      <Image
                        source={require('../assets/company_logo.png')}
                        style={{ width: 20, height: 20 }}
                      />
                      <Text style={{ fontWeight: '600', paddingRight: 8 }}>
                        {item.company}
                      </Text>
                    </View>
                    <View style={{ flexDirection: 'row', paddingVertical: 8 }}>
                      <Image
                        source={require('../assets/role_icon.png')}
                        style={{ width: 20, height: 20 }}
                      />
                      <Text style={{ fontWeight: '600', paddingRight: 8 }}>
                        {item.jobTitle}
                      </Text>
                    </View>
                  </View>
                </View>
              )}
            </View>
          );
        })
      ) : (
        <View
          style={[cardstyle.subview, { alignItems: 'center', padding: 20 }]}
        >
          <Text style={{ textAlign: 'center' }}>
            No contacts yet. Share your card to start collecting contacts.
          </Text>
        </View>
      )}
    </View>
  );
}
