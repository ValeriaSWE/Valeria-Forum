import axios from "axios";
import { createSignal, Show } from "solid-js";
import { splitProps, JSX } from 'solid-js';
import { CheckAuthLevel } from "../functions/user";
import Login from "./Login";
import Register from "./Register";
import styles from './StylingModules/Navbar.module.css';
import $ from 'jquery';
import { GetValeriaData } from "../api/valeria";

export default function Navbar() {
  const [toggleResponsNav, setToggleResponsNav] = createSignal(false);
  const [open, setOpen] = createSignal("none");
  const [showRegister, setShowRegister] = createSignal(false);
  const [showLogin, setShowLogin] = createSignal(false);

  // const checkToken = CheckAuthLevel(JSON.parse(localStorage.getItem('profile'))?.token, 0)

  let userData = {}
  let loggedIn = false
  let profilePicture = ''
  if (localStorage.getItem('profile') && CheckAuthLevel(JSON.parse(localStorage.getItem('profile'))?.token, 0)) {
    userData = JSON.parse(localStorage.getItem('profile'))?.result
    profilePicture = `data:image/png;base64,${btoa(new Uint8Array(userData.profilePicture?.data?.data).reduce(function (data, byte) {
      return data + String.fromCharCode(byte);
    }, ''))}`
    loggedIn = true
  }

  function logout() {
    localStorage.removeItem('profile')
    window.location.reload();
  }


  // JavaScript Functionality 
  var lastScrollTop = 0;
  window.addEventListener('scroll', function() {
    var scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    if(scrollTop > lastScrollTop) {
      $(".navbar").css("top", "-65px");
    } else {
      $(".navbar").css("top", "0");
    }

    
    lastScrollTop = scrollTop;
  })



  // window.onclick = function(e) {
  //   if(open()) {
  //     if(e.target.id == "dropdown" || e.target.id ==  "menu-item"|| e.target.id == "nav-item" || e.target.id == "profile") {
  //     } else {
  //       setOpen(!open())
  //     }
  //   }
  // }

  document.onkeydown = function(evt) {
    evt = evt || window.event;
    var isEscape = false;
    if ("key" in evt) {
        isEscape = (evt.key === "Escape" || evt.key === "Esc" || evt.keyCode === 27);
    }
    if (isEscape && open()) {
        setOpen("none");
    } 
  };

  function Nav(props: { 
    children: JSX.Element; 
  }){
    return (
      <>
        <nav class={styles.navbar + " " + "navbar"}>
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
      icon: JSX.Element,
      href: string
    }

    const NavLink = (props: NavLinkProps) => {
      return(
        <>
        <li class={styles.navlink}>
          <a href={props.href || "#"} class={styles.linkbutton}>
            {props.icon}
          </a>
        </li>
        </>
      );
    };

    return(
      <>
        <ul class={styles.navbarlinks}>
          <NavLink icon="Flöde" href="/forum/feed"></NavLink>
          <NavLink icon="Ansökningar" href="#"></NavLink>
          <NavLink icon="Medlemmar" href="#"></NavLink>
          <NavLink icon="Trådar" href="#"></NavLink>
          <NavLink icon="Tickets" href="#"></NavLink>
        </ul>
      </>
    );
  };

  function NavBarIcons() {
    
    const NavItem = (props: {
      children: JSX.Element; icon: JSX.Element; action: string; color?: "string";
    }) => {
      return(
        <>
        <li class={styles.navitem} >
          <a href="#" class={styles.iconbutton + " material-icons"} style={props.color ? "background-color: " + props.color : ""} id={props.action} onclick={() => {
            setOpen(open() == props.action ? "none" : props.action)}}>
            {/* {props.icon} */}
            {
              props.icon === "profilePicture" ?
                loggedIn ?
                  <img src={profilePicture} class={styles.profilePicture}></img>
                :
                  "person"
              :
                props.icon?.toString().endsWith(".png") ?
                  <img src={"../../images/" + props.icon} class={styles.profilePicture}></img>
                :
                  props.icon
            }
          </a>
          {open() == props.action && props.children}
        </li>
        </>
      );
    };
    
    function ProfileDropdownMenu() {
      const [mainDrop, SetMainDrop] = createSignal(true);

      function DropdownItem(props: { 
        leftIcon: string;
        rightIcon: [string, number] | null;
        action: any;
        label: string;
        href: string;
      }){
        return(
          <a href={props.href || "#"} class={styles.menuitem} id="menu-item" onclick={() => {
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
            <span class={styles.iconright + " material-icons"}  id="nav-item" style={"font-size: " + (props.rightIcon ? props.rightIcon[1] : null) + "rem; color: white;"}>
              {props.rightIcon ? props.rightIcon[0] : null }
            </span>
          </a>
        );
      };


      const DropDownMain = () => {
        return(
          <>          
            <DropdownItem label={userData?.username || "Profil"} leftIcon={"profilePicture"} rightIcon={null} action={setOpen("none")} href={"/forum/user/" + userData?._id}/>
            <DropdownItem label={"Inställningar"} leftIcon={"settings"} rightIcon={["arrow_forward_ios", 1.5]} action={SetMainDrop(!mainDrop())}/>
            <Show when={userData?.roleRank >= 10}>
              <DropdownItem label={"Admin Panel"} leftIcon={"admin_panel_settings"} rightIcon={null} action={setOpen("none")}href={"/admin"}/>
              <DropdownItem label={"DEV Panel"} leftIcon={"terminal"} rightIcon={null} action={setOpen("none")} href={"/dev"}/>
            </Show>
            <DropdownItem label={"Logga ut"} leftIcon={"logout"} rightIcon={null} action={logout()}/>
          </>
        );
      }

      const [darkModeToggleIcon, setDarkToggleModeIcon] = createSignal("toggle_off");
      const [darkModeIcon, setDarkModeIcon] = createSignal("light_mode");
      const [darkModeLabel, setdarkModeLabel] = createSignal("Ljust läge");

  

      function toggleDarkmode() {
        let lightModeOn = localStorage.getItem('lightmode') == "off" ? "on" : "off" || "on"
        
        localStorage.setItem('lightmode', lightModeOn)
        // UpdateIcon 
        

        $(':root').attr('data-dark-mode', (lightModeOn == "off" ? "true": "false") )
        $('#dark-code-styling').attr('disabled', (lightModeOn == "on"))
        $('#light-code-styling').attr('disabled', (lightModeOn == "off"))

        setDarkToggleModeIcon((lightModeOn == "off" ? "toggle_on": "toggle_off"))
        setDarkModeIcon((lightModeOn == "off" ? "dark_mode": "light_mode"))
        setdarkModeLabel((lightModeOn == "off" ? "Mörkt läge": "Ljust läge"))
        // location.reload()
      }

      const DropDownSettings = () => {

        // Set to darkmode if darkmode is toggled in localstorage
        if(localStorage.getItem('lightmode') == "off") {
          setDarkToggleModeIcon("toggle_on");
          setDarkModeIcon("dark_mode");
          setdarkModeLabel("Mörkt läge");
        }

        return(
          <>
          <DropdownItem label={"Gå Tillbaka"} leftIcon={"arrow_back"} rightIcon={null} action={SetMainDrop(!mainDrop())} />
          <DropdownItem label={darkModeLabel()} leftIcon={darkModeIcon()} rightIcon={[darkModeToggleIcon(), 3]} action={toggleDarkmode()}/>
          <DropdownItem label={"Inställning 2 "} leftIcon={"settings"} rightIcon={null} action={null} />
          <DropdownItem label={"Inställning 3... "} leftIcon={"settings"} rightIcon={null} action={null} />
          </>
        )
      }
      
      const DropDownLoggedOut = () => {
        return(
          <>          
            <DropdownItem label={"Inställningar"} leftIcon={"settings"} rightIcon={["arrow_forward_ios", 1.5]} action={SetMainDrop(!mainDrop())}/>
            <DropdownItem label={"Logga in"} leftIcon={"login"} rightIcon={null} action={setShowLogin(!showLogin())} />
            <DropdownItem label={"Registrera Konto"} leftIcon={"person_add"} rightIcon={null} action={setShowRegister(!showRegister())} />
          </>
        );
      }
    
      return(
        <> 
        <div class={styles.dropdown} id="dropdown">
          <Show 
          when={mainDrop()}
          fallback={<DropDownSettings />}
          >
            <Show when={loggedIn} fallback={<DropDownLoggedOut />}>
              <DropDownMain />
            </Show>
         </Show>
        </div>
        </>
      );
    };

    const NavItemLoggedOut = (props: {
      leftIcon: string,
      label: string,
      action: any
    }) => {
      return(
        <div class={styles.navbariconsLoggedOut + " " + "NavAccountBtn"} onClick={() => {
          try{
            props.action;
           } catch (err) {
            throw err;
           };
        }}>
          <i class="material-icons">{props.leftIcon}</i>
          <p>{props.label}</p>
        </div>
      )
    }

    return(
      <>
      <ul class={styles.navbaricons}>
        <div>
          {/* <Show when={loggedIn} fallback={
            <> 
              <NavItemLoggedOut leftIcon={"login"} label={"Logga in"} action={setShowLogin(!showLogin())} />
              <NavItemLoggedOut leftIcon={"person_add"} label={"Registera konto"} action={setShowRegister(!showRegister())} />
            </>
          }> */}
            {/* <NavItem action={null} icon={"chat"} children={null} /> 
            <NavItem action={null} icon={"notifications"} children={null}/> */}
            <NavItem action={"status"} icon={"valeria.png"} color={serverData() ? "green" : "red"}>
              <div class={styles.dropdown} id="dropdown">
                <ValeriaServerInfo/>
              </div>
            </NavItem>
            <NavItem action={"profile"} icon={"profilePicture"}>
              <ProfileDropdownMenu></ProfileDropdownMenu>
            </NavItem>
          {/* </Show> */}
        </div>
      </ul>
      </>
    )
  };

  const [serverData, setServerData] = createSignal(null)
  GetValeriaData().then(res => {
      setServerData(res.data)
  })
  function ValeriaServerInfo() {


    return (
        <div style="color: white">
            <h1 style="color: white">Valeria Server Status:</h1>
            <Show when={serverData()} fallback={
                <p style="color: white">Servern är offline! : (</p>
            }>
                <p style="color: white">Servern är online! : )</p>
                <p style="color: white">Spelare: {serverData().players}</p>
                <p style="color: white">Poliser: {serverData().cops}</p>
            </Show>
        </div>
    )
}

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
            <li><a href="#">....</a></li>
            <li><a href="#">...s</a></li>
            <li><a href="#">...</a></li>
            <li><a href="#">...</a></li>
            <li><a href="#">...</a></li>
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


  // close modal on esc
  $(document).ready(function() {
    $("body").keydown(function(event) {
        if(event.which == 27) {
          if(showRegister()) { setShowRegister(!showRegister())}
          if(showLogin()) { setShowLogin(!showLogin())}
          document.querySelector("body").style.overflow = "auto";
        }
    });
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
        {setShowLogin(false)}
        <Register cancel={() => setShowRegister(false)} />
      </Show>
      <Show when={showLogin()}>
        {setShowRegister(false)}
        <Login cancel={() => setShowLogin(false)} />
      </Show>
    </>
  )
}
