import { createSignal, Show } from "solid-js";
import { splitProps, JSX } from 'solid-js';
import Login from "./Login";
import Register from "./Register";
import styles from './StylingModules/Navbar.module.css';

export default function Navbar() {
  const [toggleResponsNav, setToggleResponsNav] = createSignal(false);
  const [open, setOpen] = createSignal(false);
  const [showRegister, setShowRegister] = createSignal(false);
  const [showLogin, setShowLogin] = createSignal(false);

  let userData = {}
  let loggedIn = false
  let profilePicture = ''
  if (localStorage.getItem('profile')) {
    userData = JSON.parse(localStorage.getItem('profile')).result
    profilePicture = `data:image/png;base64,${btoa(new Uint8Array(userData.profilePicture.data.data).reduce(function (data, byte) {
      return data + String.fromCharCode(byte);
    }, ''))}`
    loggedIn = true
  }

  // const tmp = String.fromCharCode( ... new Uint8Array(userData.profilePicture.data))


  // console.log(profilePicture)

  function logout() {
    localStorage.removeItem('profile')
    window.location.reload();
  }

  window.onclick = function(e) {
    if(open()) {
      if(e.target.id == "dropdown" || e.target.id ==  "menu-item"|| e.target.id == "nav-item" || e.target.id == "profile") {
      } else {
        setOpen(!open())
      }
    }
  }

  document.onkeydown = function(evt) {
    evt = evt || window.event;
    var isEscape = false;
    if ("key" in evt) {
        isEscape = (evt.key === "Escape" || evt.key === "Esc");
    } else {
        isEscape = (evt.keyCode === 27);
    }
    if (isEscape && open()) {
        setOpen(!open);
    } 
  };

  function Nav(props: { 
    children: JSX.Element; 
  }){
    return (
      <>
        <nav class={styles.navbar}>
          <ul class={styles.navbarNav}>{ props.children}</ul>
        </nav>
      </>
    );
  };

  function NavBarLogo() {
    interface ImageProps{
      imgSrc: string;
    }

    const ImageLogo = (props: ImageProps) => {
      return(
        <>
          <img class={styles.navbarLogo} src={props.imgSrc} alt="Logo" />
        </>
      );
    };

    return(
      <>
      <a class={styles.logo} href="/">
        <ImageLogo imgSrc="../../images/valeria.png" />
      </a>
      </>
    );
  };


  function NavBarLinks() {
    interface NavLinkProps {
      icon: JSX.Element;
    }

    const NavLink = (props: NavLinkProps) => {
      return(
        <>
        <li class={styles.navlink}>
          <a href="#" class={styles.linkbutton}>
            {props.icon}
          </a>
        </li>
        </>
      );
    };

    return(
      <>
        <ul class={styles.navbarlinks}>
          <NavLink icon="Ansökningar"></NavLink>
          <NavLink icon="Medlemmar"></NavLink>
          <NavLink icon="Trådar"></NavLink>
          <NavLink icon="Tickets"></NavLink>
        </ul>
      </>
    );
  };

  function NavBarIcons() {
    
    const NavItem = (props: {
      children: JSX.Element; icon: JSX.Element; action: any;
    }) => {
      return(
        <>
        <li class={styles.navitem} >
          <a href="#" class={styles.iconbutton + " material-icons"}  id={props.action} onclick={() => {
            setOpen(!open())}}>
            {/* {props.icon} */}
            {
              props.icon === "profilePicture" ?
                loggedIn ?
                  <img src={profilePicture} class={styles.profilePicture}></img>
                :
                  "person"
              :
                props.icon
            }
          </a>
          {open() && props.children}  
        </li>
        </>
      );
    };
    
    function DropdwonMenu() {
      const [mainDrop, SetMainDrop] = createSignal(true);


      function DropdownItem(props: { 
        leftIcon: string;
        rightIcon: string | null;
        action: any;
        label: string;
      }){
        return(
          <a href="#" class={styles.menuitem} id="menu-item" onclick={() => {
           try{
            props.action;
           } catch (err) {
            throw err;
           };
          }}>
            <span class={styles.iconbutton + " material-icons"} id="nav-item">
              {
                props.leftIcon === "profilePicture" ?
                  <img src={profilePicture} class={styles.profilePicture}></img>
                :
                  props.leftIcon
              }
            </span>
            {props.label}
            <span class={styles.iconright  + " material-icons"}  id="nav-item">
              {props.rightIcon}
            </span>
          </a>
        );
      };


      const DropDownMain = () => {
        // console.log(JSON.parse(localStorage.getItem('profile')).result.username)
        if (loggedIn) {
          return(
            <>          
              <DropdownItem label={userData.username || "Profil"} leftIcon={"profilePicture"} rightIcon={null} action={null} />
              <DropdownItem label={"Inställningar"} leftIcon={"settings"} rightIcon={"arrow_forward_ios"} action={SetMainDrop(!mainDrop())} />
              <DropdownItem label={"Logga ut"} leftIcon={"logout"} rightIcon={null} action={logout()} />
            </>
          );
        } else {
          return(
            <>
              <DropdownItem label={"Registrera Konto"} leftIcon={"person_add"} rightIcon={null} action={setShowRegister(true)} />
              <DropdownItem label={"Logga in"} leftIcon={"login"} rightIcon={null} action={setShowLogin(true)} />
            </>
          );
        }
      }

      const DropDownSettings = () => {
        return(
          <>
          <DropdownItem label={"Gå Tillbaka"} leftIcon={"arrow_back"} rightIcon={null} action={SetMainDrop(!mainDrop())} />
          <DropdownItem label={"Inställning 1 "} leftIcon={"light_mode"} rightIcon={null} action={null} />
          <DropdownItem label={"Inställning 2 "} leftIcon={"light_mode"} rightIcon={null} action={null} />
          <DropdownItem label={"Inställning 3... "} leftIcon={"light_mode"} rightIcon={null} action={null} />
          </>
        )
      }
    
      return(
        <> 
        <div class={styles.dropdown} id="dropdown">
         <Show 
         when={mainDrop()}
         fallback={<DropDownSettings />}
         >
          <DropDownMain />
         </Show>
        </div>
        </>
      );
    };

    return(
      <>
        <ul class={styles.navbaricons}>
          <NavItem action={null} icon={"chat"} children={null} />
          <NavItem action={null} icon={"notifications"} children={null}/>
          <NavItem action={"profile"} icon={"profilePicture"}>
            <DropdwonMenu></DropdwonMenu>
          </NavItem>
        </ul>
      </>
    );
  };

  function HamburgerIcon() {
    // class={styles.menuicon + styles.checkbox3}
    return(
      <> 
      <div class={styles.menuicon} >
      <input type="checkbox" id="checkbox3" class={styles.checkbox3 + " " + styles.visuallyHidden} onclick={() => {
        clearInterval(toggleNavbar)
        if(toggleResponsNav()) {

          var x:HTMLElement | any = document.getElementById("responsivenavmenu");
          var toggleNavbar:any = setTimeout(() => {
            setToggleResponsNav(!toggleResponsNav())
          }, 450);
          x.style.height = "0";
          x.style.opacity = "0";
        } else {
          setToggleResponsNav(!toggleResponsNav())
        }
       }
      } />
       <label for="checkbox3">
           <div class={styles.hamburger + " " + styles.hamburger3}>
               <span class={styles.bar + " "  + styles.bar1}></span>
               <span class={styles.bar + " " + styles.bar4}></span>
           </div>
       </label>
       </div>
       </>
    )
  }

  function NavbarResponsive() {
    return(
      <>
      <div class={styles.responsiveDropDown} id="responsivenavmenu">
        <ul class={styles.resposniveListItems}>
            <li><a href="#">Hem</a></li>
            <li><a href="#">Om oss</a></li>
            <li><a href="#">Produkter</a></li>
            <li><a href="#">Kontakt</a></li>
            <li><a href="#">UF</a></li>
        </ul>
    </div>
      </>
    );
  };

  var [changeToMobile, setchangeToMobile] = createSignal(false);
  function checkWidth() {
    var newWidth = window.innerWidth;
    if(newWidth <= 1100) { 
      setchangeToMobile(true); 
   
    } 
    else { setchangeToMobile(false);
    
    }
  }

  window.addEventListener('load', () => {
    checkWidth()
  })

  window.addEventListener('resize', () => {
    checkWidth()
  });

  return(
    <>
      <Nav>
        <NavBarLogo />
        <NavBarLinks />
        <NavBarIcons />
        <Show when={toggleResponsNav() && changeToMobile()}>
          <NavbarResponsive />
        </Show>
        <HamburgerIcon />
      </Nav>
      <Show when={showRegister()}>
        <Register cancel={() => setShowRegister(false)} />
      </Show>
      <Show when={showLogin()}>
        <Login cancel={() => setShowLogin(false)} />
      </Show>
    </>
  )
}
