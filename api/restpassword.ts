import  AsyncStorage from "@react-native-async-storage/async-storage"
import { API_BASE_URL } from "./Config";





export async function Restpassword(currentpass:string,newpassword:string){

    try{
        console.log("start api")
        const token = await AsyncStorage.getItem("token");
        console.log(token)
        console.log("current password : ",currentpass)
        console.log("new password : ",newpassword)
        const response = await fetch(`${API_BASE_URL}/api/users/changepassword`,{
            method:"POST",
            headers:{
                "Content-type":"application/json",
                Authorization:`Bearer ${token}`
            },
            body:JSON.stringify({
                currentPassword:currentpass,
                newPassword:newpassword,
            })
        })


        const result = await response.json();
        if(response.ok){
            console.log(result.message)
            return result

        }else{
            console.log(result.message)
        }


    }catch(error){
        console.log("something went wrong ",{error})
    }


} 



