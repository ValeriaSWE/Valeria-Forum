import UserInfo from "../Components/UserInfo";
import style from './StylingModules/UserInfo.module.css'


export default function UserInfoPage() {
  document.title = "Valeria Roleplay | Anvädare";
  return (
  <>
  <div class={style.userInfo}> 
    <UserInfo />
  </div>
  </>)
}