import { View,Text} from "react-native";
import { cardstyle } from "../Style";


export function Bill(){


    return(
        <View style={cardstyle.mainview}>
            <Text style={cardstyle.title}>Billing & Plans</Text>
            <Text style={cardstyle.minitxt}>Manage your subscription, payment method and invoices.</Text>


            <View style={cardstyle.subview}>
                <View>
                <Text style={{marginLeft:10}}>CURRENT PLAN</Text>
                <Text style={{marginLeft:10,margin:10,fontSize:14,fontWeight:"bold"}}>Free</Text>
                <Text style={{fontSize:12,marginLeft:10}}>1 Digital Card · QR sharing · Basic template.</Text>
                
                <Text style={{fontSize:12,marginLeft:11,margin:2,opacity:0.60}}>Business Card Expires: Not available</Text>
                </View>
            </View>

            <View style={cardstyle.subview}>
                <Text style={{marginLeft:10,margin:10,fontSize:14,fontWeight:"bold"}}>INVOICES</Text>
                <View style={cardstyle.plan}>
                    <Text style={{color:"grey",margin:10,}}>No invoices yet.</Text>

                </View>

            </View>
        
        </View>
    )
}