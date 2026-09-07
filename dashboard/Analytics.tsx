import { View, Text, Pressable } from 'react-native';
import { cardstyle } from '../Style';
import { useState } from 'react';
import { Image } from 'react-native';

export function Analytics() {
  const [filter, setFilter] = useState('all');

  return (
    <View style={cardstyle.mainview}>
      <Text style={cardstyle.title}>Analytics</Text>
      <Text style={cardstyle.minitxt}>
        Track how people are finding and viewing your card.
      </Text>

      <View style={cardstyle.subview}>
        <View style={{ flexDirection: 'row', marginRight: 130 }}>
          <View style={cardstyle.icon}>
            <Image source={require('../assets/total_visit.png')} style={cardstyle.iconsize} />
          </View>

          <View>
            <Text style={{ margin: 5, fontWeight: 'bold' }}>Total vist</Text>
            <Text style={{ alignSelf: 'center' }}>0</Text>
          </View>
        </View>
      </View>

      <View style={cardstyle.subview}>
        <View style={{flexDirection:"row",marginRight:130,}}>
        <View style={cardstyle.icon}>
            <Image source={require("../assets/Qr_scan.png")} style={cardstyle.iconsize}/>

        </View>
        <View>
        <Text style={{ margin: 5, fontWeight: 'bold' }}>QR Scans</Text>
        <Text style={{alignSelf:"center"}}>0</Text>
      </View>
      </View>
      </View>


      <View style={cardstyle.subview}>
        
        <View style={{flexDirection:"row",marginRight:130}}>
        <View style={cardstyle.icon}>
            <Image source={require("../assets/page_visits.png")} style={cardstyle.iconsize}/>
        </View>
        <View>
        <Text style={{ margin: 5, fontWeight: 'bold' }}>Page vists</Text>
        <Text style={{alignSelf:"center"}}>0</Text>
        </View>
        </View>
      </View>

      <View style={[cardstyle.subview, { flexDirection: 'row' ,}]}>
        <Text style={{ fontWeight: 'bold', margin: 10 }}>Filter: </Text>

        <View
          style={filter !== 'all' ? cardstyle.filters : cardstyle.filterhover}
        >
          <Pressable
            onPress={() => {
              setFilter('all');
            }}
          >
            <Text
              style={
                filter !== 'all'
                  ? cardstyle.filltertxt
                  : cardstyle.filterhovertxt
              }
            >
              All
            </Text>
          </Pressable>
        </View>

        <View
          style={filter !== 'page' ? cardstyle.filters : cardstyle.filterhover}
        >
          <Pressable
            onPress={() => {
              setFilter('page');
            }}
          >
            <Text
              style={
                filter !== 'page'
                  ? cardstyle.filltertxt
                  : cardstyle.filterhovertxt
              }
            >
              Page Vists
            </Text>
          </Pressable>
        </View>

        <View
          style={filter !== 'Qr' ? cardstyle.filters : cardstyle.filterhover}
        >
          <Pressable
            onPress={() => {
              setFilter('Qr');
            }}
          >
            <Text
              style={
                filter !== 'Qr'
                  ? cardstyle.filltertxt
                  : cardstyle.filterhovertxt
              }
            >
              Qr Scans
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
