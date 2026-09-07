import AsyncStorage from "@react-native-async-storage/async-storage"






export async function logout(navigation:any){
    try{

        await AsyncStorage.removeItem("name")
        await AsyncStorage.removeItem("token")
        await AsyncStorage.removeItem("email")
        await AsyncStorage.removeItem("islogin")
        navigation.navigate("Main")
        console.log("logout successful")
    }catch(error){
        console.log(error);
        
    }



}