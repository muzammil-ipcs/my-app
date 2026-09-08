import { View, Text } from 'react-native';
import { cardstyle } from '../Style';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { ScrollView } from 'react-native';

export function Bill() {
  const [listofinvoice, setListofnvoice] = useState<any>([]);

  useEffect(() => {
    async function Invoice() {
      try {
        const token = await AsyncStorage.getItem('token');
        console.log(token);
        console.log('fetching Invoice');
        const response = await fetch(
          'http://10.0.2.2:5004/api/subscription/invoices',
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          },
        );
        const data = await response.json();
        console.log(data);
        if (data.code === 200) {
          setListofnvoice(data.result);
        }
      } catch (error) {
        console.log(error);
      }
    }
    Invoice();
  }, []);

  return (
    <View style={cardstyle.mainview}>
      <Text style={cardstyle.title}>Billing & Plans</Text>
      <Text style={cardstyle.minitxt}>
        Manage your subscription, payment method and invoices.
      </Text>

      <View style={cardstyle.subview}>
        <View>
          <Text style={{ marginLeft: 10 }}>CURRENT PLAN</Text>
          <Text
            style={{
              marginLeft: 10,
              margin: 10,
              fontSize: 14,
              fontWeight: 'bold',
            }}
          >
            Free
          </Text>
          <Text style={{ fontSize: 12, marginLeft: 10 }}>
            1 Digital Card · QR sharing · Basic template.
          </Text>

          <Text
            style={{ fontSize: 12, marginLeft: 11, margin: 2, opacity: 0.6 }}
          >
            Business Card Expires: Not available
          </Text>
        </View>
      </View>

      <View style={cardstyle.subview}>
        <Text
          style={{
            marginLeft: 10,
            margin: 10,
            fontSize: 14,
            fontWeight: 'bold',
          }}
        >
          INVOICES
        </Text>

        <ScrollView style={{ maxHeight: 400 }}>
          {listofinvoice.length > 0 ? (
            listofinvoice.map((Invoice: any) => {
              const date = new Date(Invoice.created * 1000);

              const formattedDate = date.toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
              });

              const currency = Invoice.currency.toUpperCase();

              const formatprice = new Intl.NumberFormat('en-IN', {
                style: 'currency',
                currency: currency,
              }).format(Invoice.amountPaid / 100);

              return (
                <View key={Invoice.id} style={cardstyle.paid}>
                  <Text style={cardstyle.paidtxttitle}>Date</Text>
                  <Text style={cardstyle.paidtxt}>{formattedDate}</Text>

                  <Text style={cardstyle.paidtxttitle}>CURRENCY</Text>
                  <Text style={cardstyle.paidtxt}>
                    {Invoice.currency.toUpperCase()}
                  </Text>

                  <Text style={cardstyle.paidtxttitle}>PAYMENT STATUS</Text>
                  <Text style={cardstyle.paidtxt}>{Invoice.status}</Text>

                  <Text style={cardstyle.paidtxttitle}>PRICE</Text>
                  <Text style={cardstyle.paidtxt}>{formatprice}</Text>

                  <Text style={cardstyle.paidtxttitle}>STATUS</Text>
                  <View
                    style={{
                      backgroundColor:
                        Invoice.status === 'paid' ? '#EAF6EC' : '#FFF4D6',
                      padding: 5,
                      alignItems: 'center',
                      width: 80,
                      borderRadius: 10,
                    }}
                  >
                    <Text
                      style={{
                        fontWeight: '600',
                        color:
                          Invoice.status === 'paid' ? '#1B7A34' : '#8A5A00',
                        fontSize: 14,
                        padding: 5,
                      }}
                    >
                      {Invoice.status}
                    </Text>
                  </View>
                </View>
              );
            })
          ) : (
            <View style={cardstyle.plan}>
              <Text style={cardstyle.paidtxttitle}>No invoices yet.</Text>
            </View>
          )}
        </ScrollView>
      </View>
    </View>
  );
}
