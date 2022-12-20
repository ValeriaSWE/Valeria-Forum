var serverData = null
import cfx from "cfx-api";

export const ValeriaServerHook = (req, res) => {
    const {data, auth} = req.body
    if (auth != 'Valeria Roleplay Auth') return res.status(400).send("Wrong Auth")
    if (data.shuttingDown) {
        serverData = null 
        return res.status(200).send()
    } else {
        serverData = data
    }
    return res.status(200).send()
}

export const GetValeriaServerData = async (req, res) => {
    const server = await cfx.fetchServer("3x4dk8") 

    // console.log(server)

    // if (serverData) {
    //     serverData.players = server.data.clients
    // }


    return res.status(200).send(serverData)
}
