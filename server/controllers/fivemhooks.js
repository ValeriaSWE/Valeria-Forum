var serverData = null

export const ValeriaServerHook = (req, res) => {
    // const {body} = req
    const {data, auth} = req.body
    if (auth != 'Valeria Roleplay Auth') return res.status(400).send("Wrong Auth")
    console.log(data)
    if (data.shuttingDown) {
        serverData = null 
        return res.status(200).send()
    } else {
        serverData = data
    }
    return res.status(200).send()
}

export const GetValeriaServerData = (req, res) => {
    return res.status(200).send(serverData)
}