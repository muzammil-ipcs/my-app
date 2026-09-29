import { View, Text, Pressable } from 'react-native';
import { analytics_style, cardstyle } from '../Style';
import { useEffect, useState } from 'react';
import { Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ScrollView } from 'react-native';

interface Activity {
  _id: string;
  cardUrl: string;
  source: string;
  deviceInfo: string;
  ipAddress?: string;
  scanDate: string;
}

export function Analytics() {
  const [filter, setFilter] = useState('all');
  const [totalvist, setTotalvist] = useState(' ');
  const [qrscan, setQrscan] = useState(' ');
  const [pagevisit, setPagevisti] = useState(' ');

  const [page, setpage] = useState(1);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [totalcount, setTotalcount] = useState(0);
  const [limit] = useState(10);

  useEffect(() => {
    async function user_stats() {
      try {
        const user_id = await AsyncStorage.getItem('user_id');
        const token = await AsyncStorage.getItem('token');
        const response = await fetch(
          'http://10.0.2.2:5004/api/analytics/user-stats',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              userId: user_id,
            }),
          },
        );

        const data = await response.json();
        if (data.code === 200) {
          setTotalvist(data.data.totalVisits);
          setQrscan(data.data.qrScans);
          setPagevisti(data.data.pageVisits);
          console.log(data);
        }
      } catch (error) {
        console.log('something went wrong ', error);
      }
    }
    user_stats();

    async function list() {
      try {
        const user_id = await AsyncStorage.getItem('user_id');
        const token = await AsyncStorage.getItem('token');
        const body: any = {
          limit: limit,
          page: page,
          userId: user_id,
        };

        if (filter !== 'all') {
          body.source = filter;
        }

        const response = await fetch(
          'http://10.0.2.2:5004/api/analytics/list',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(body),
          },
        );
        const data = await response.json();
        if (data.code === 200) {
          setActivities(data.data || []);
          setTotalcount(data.count || 0);
          console.log('Activities:', activities);
          console.log('total count:', totalcount);
          console.log(data);
        }
      } catch (error) {
        console.log(error);
      }
    }

    list();
  }, [page, limit, filter]);

  const getDeviceName = (deviceInfo: string) => {
    if (!deviceInfo) return 'Unknown';

    if (/Windows/i.test(deviceInfo)) {
      return 'Windows';
    }

    if (/Android/i.test(deviceInfo)) {
      return 'Android';
    }

    if (/iPhone|iPad|iPod/i.test(deviceInfo)) {
      return 'iOS';
    }

    if (/Macintosh|Mac OS/i.test(deviceInfo)) {
      return 'macOS';
    }

    if (/Linux/i.test(deviceInfo)) {
      return 'Linux';
    }

    return 'Unknown';
  };

  const formatDate = (date: string) => {
    if (!date) return 'Unknown';

    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const totalPages = Math.ceil(totalcount / limit);

  return (
    <View style={cardstyle.mainview}>
      <Text style={cardstyle.title}>Analytics</Text>
      <Text style={cardstyle.minitxt}>
        Track how people are finding and viewing your card.
      </Text>

      <View style={cardstyle.subview}>
        <View style={{ flexDirection: 'row', marginRight:0 }}>
          <View style={cardstyle.icon}>
            <Image
              source={require('../assets/total_visit.png')}
              style={cardstyle.iconsize}
            />
          </View>

          <View>
            <Text style={{ margin: 5, fontWeight: 'bold' }}>Total vist</Text>
            <Text style={{ alignSelf: 'center' }}>{totalvist}</Text>
          </View>
        </View>
      </View>

      <View style={cardstyle.subview}>
        <View style={{ flexDirection: 'row', marginRight: 130 }}>
          <View style={cardstyle.icon}>
            <Image
              source={require('../assets/Qr_scan.png')}
              style={cardstyle.iconsize}
            />
          </View>
          <View>
            <Text style={{ margin: 5, fontWeight: 'bold' }}>QR Scans</Text>
            <Text style={{ alignSelf: 'center' }}>{qrscan}</Text>
          </View>
        </View>
      </View>

      <View style={cardstyle.subview}>
        <View style={{ flexDirection: 'row', marginRight: 130 }}>
          <View style={cardstyle.icon}>
            <Image
              source={require('../assets/page_visits.png')}
              style={cardstyle.iconsize}
            />
          </View>
          <View>
            <Text style={{ margin: 5, fontWeight: 'bold' }}>Page vists</Text>
            <Text style={{ alignSelf: 'center' }}>{pagevisit}</Text>
          </View>
        </View>
      </View>

      <View style={[cardstyle.subview, { flexDirection: 'row' }]}>
        <Text style={{ fontWeight: 'bold', margin: 10 }}>Filter: </Text>

        <View
          style={filter !== 'all' ? cardstyle.filters : cardstyle.filterhover}
        >
          <Pressable
            onPress={() => {
              setFilter('all');
              setpage(1);
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
          style={
            filter !== 'page_visit' ? cardstyle.filters : cardstyle.filterhover
          }
        >
          <Pressable
            onPress={() => {
              setFilter('page_visit');
              setpage(1);
            }}
          >
            <Text
              style={
                filter !== 'page_visit'
                  ? cardstyle.filltertxt
                  : cardstyle.filterhovertxt
              }
            >
              Page Vists
            </Text>
          </Pressable>
        </View>

        <View
          style={
            filter !== 'qr_scan' ? cardstyle.filters : cardstyle.filterhover
          }
        >
          <Pressable
            onPress={() => {
              setFilter('qr_scan');
              setpage(1);
            }}
          >
            <Text
              style={
                filter !== 'qr_scan'
                  ? cardstyle.filltertxt
                  : cardstyle.filterhovertxt
              }
            >
              Qr Scans
            </Text>
          </Pressable>
        </View>
      </View>
      <View style={{ height: 250, overflow: 'hidden',width:"100%",marginLeft:3}}>
        <View style={analytics_style.table}>
          {/* Body: vertical scrolling only */}
          <ScrollView showsVerticalScrollIndicator={true}>
            {activities.map((item, index) => (
              <View
                key={item._id || `activity-${index}`}
                style={analytics_style.table_body}
              >
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                  }}
                >
                  <Text
                    style={[
                      analytics_style.table_body_txt,
                      analytics_style.number_column,
                    ]}
                  >
                    <Text style={analytics_style.body_title}> #:</Text>{' '}
                    {(page - 1) * limit + index + 1}
                  </Text>

                  <View style={analytics_style.source_bg}>
                    <Text
                      style={[
                        analytics_style.source_column,
                        {
                          color:
                            item.source === 'qr_scan' ? '#1B7A34' : '#222222',
                        },
                      ]}
                    >
                      {item.source}
                    </Text>
                  </View>
                </View>

                <Text
                  style={[
                    analytics_style.table_body_txt,
                    analytics_style.card_column,
                  ]}
                >
                  <Text style={analytics_style.body_title}> Card:</Text>{' '}
                  {item.cardUrl}
                </Text>

                <Text
                  style={[
                    analytics_style.table_body_txt,
                    analytics_style.device_column,
                  ]}
                >
                  <Text style={analytics_style.body_title}>Device:</Text>{' '}
                  {getDeviceName(item.deviceInfo)}
                </Text>

                <Text
                  style={[
                    analytics_style.table_body_txt,
                    analytics_style.date_column,
                  ]}
                >
                  <Text style={analytics_style.body_title}>Date:</Text>{' '}
                  {formatDate(item.scanDate)}
                </Text>
              </View>
            ))}

            <View style={analytics_style.pagination_container}>
              <Pressable
                disabled={page === 1}
                onPress={() => setpage(page - 1)}
                style={[
                  analytics_style.pagination_button,
                  page === 1 && analytics_style.disabled_button,
                ]}
              >
                <Text style={analytics_style.pagination_button_text}>
                  Previous
                </Text>
              </Pressable>

              <Text style={analytics_style.page_text}>
                Page {page} of {totalPages}
              </Text>

              <Pressable
                disabled={page >= totalPages}
                onPress={() => setpage(page + 1)}
                style={[
                  analytics_style.pagination_button,
                  page >= totalPages && analytics_style.disabled_button,
                ]}
              >
                <Text style={analytics_style.pagination_button_text}>Next</Text>
              </Pressable>
            </View>
          </ScrollView>
        </View>
      </View>
    </View>
  );
}
