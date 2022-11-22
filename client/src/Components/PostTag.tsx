import styles from './StylingModules/PostTag.module.css'

export default function PostTag(props: {
    isButton: boolean,
    icon: any,
    func: any,
    color: string,
    name: string
}) {

    if(props.isButton) {
        return(
        <>
            <button class={styles.tagButton} style={"background-color: " + props.color + ";"} 
            onclick={() => props.func}
            >
                {props.name}
                {
                    props.icon ? <i class='material-icons'>{props.icon}</i> : undefined
                }
            </button>
        </>)
    }

  return (
    <div class={styles.tag} style={"background-color: " + props.color + ";"}>
        {props.name}
    </div>
  )
}
