import { createSignal, Show } from "solid-js"
import { GetValeriaData } from "../api/valeria"

export default function ValeriaServerInfo() {

    const [serverData, setServerData] = createSignal(null)
    GetValeriaData().then(res => {
        setServerData(res.data)
    })

    return (
        <div>
            <h1>Valeria Server Status:</h1>
            <Show when={serverData()} fallback={
                <p>Servern är offline! : (</p>
            }>
                <p>Servern är online! : )</p>
                <p>Spelare: {serverData().players}</p>
                <p>Poliser: {serverData().cops}</p>
            </Show>
        </div>
    )
}