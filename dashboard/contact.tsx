import { View,Text} from "react-native";
import { cardstyle } from "../Style";



export function Contact(){




    return(
        <View style={cardstyle.mainview}>
            <Text style={cardstyle.title}>My Contacts</Text>
            <Text style={cardstyle.minitxt}>People who saved your card and shared their contact details.</Text>

            <View style={cardstyle.subview}>
                <Text style={{fontSize:12,margin:20,textAlign:"center",padding:8,lineHeight:20}}>No contacts yet. Share your card to start collecting contacts.</Text>
            </View>
        </View>



    )

}