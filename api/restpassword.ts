import  AsyncStorage from "@react-native-async-storage/async-storage"





export async function Restpassword(currentpass:string){

    try{
        console.log("start api")
        const token = await AsyncStorage.getItem("token");
        console.log(token)
        const response = await fetch("http://10.0.2.2:5004/api/users/resetpassword",{
            method:"POST",
            headers:{
                "Content-type":"application/json"
            },
            body:JSON.stringify({
                token:token,
                password:currentpass

            })
        })

        const result = await response.json();

        if(result.code=== 200){
            console.log(result.message)

        }else{
            console.log(result.message)
        }


    }catch(error){
        console.log("something went wrong ",{error})
    }


} 



