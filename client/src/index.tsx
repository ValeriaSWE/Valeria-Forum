/* Importing the necessary modules from the SolidJS library. */
import { Show } from "solid-js";
import { render } from "solid-js/web";
import {Router,Routes, Route, Outlet, useParams, Navigate, useIsRouting} from "solid-app-router";
import './index.css';

// Importing pages
import Home from './Pages/Home';
import Forum from "./Pages/Forum";
import Feed from "./Components/Feed";
import Dev from "./Pages/Dev";
import LoginPage from "./Pages/Login";
import RegisterPage from "./Pages/Register";
import NotFound from "./Pages/404";
import { CheckAuthLevel } from "./functions/user";
import NotAuthed from "./Pages/NotAuthed";
import Admin from "./Pages/Admin";
import Post from "./Components/Post";
import $ from "jquery";
import UserInfoPage from "./Pages/UserInfo";
import NewPost from "./Components/NewPost";

function Loader() {
  const isRouting = useIsRouting();
  return <div data-component="loader" class="loader" classList={{ active: isRouting() }} />;
}

/* Sets a permisson rank for certain routes */
const ProtectedRoute = (authLevel: number) => {
  return () => {
    
    return (
      <Show when={localStorage.getItem('profile') && CheckAuthLevel(JSON.parse(localStorage.getItem('profile'))?.token, authLevel)} fallback={<NotAuthed />}>
        <Outlet />
      </Show>
    );
  }
}

function OnePost() {
  const params = useParams()

  return (
    <>
      <Post post={params.id} />
    </>
  )
}

/* Create the Routes */
const Root = () => {
  return (
    <><Loader /><Routes>
      <Route path="/forum" component={Forum}>
        <Route path="/" element={<Navigate href="feed" />} />
        <Route path="/post/:id" element={OnePost} />
        <Route path="/user/:id" element={UserInfoPage} />
        <Route path="/feed" element={Feed} />
        <Route path="/newpost" component={ProtectedRoute(0)}>
          <Route path="" element={NewPost} />
        </Route>
        {/* <Route path=":id" component={SubTab} /> */}
      </Route>
      <Route path="/login" component={LoginPage} />
      <Route path="/register" component={RegisterPage} />
      <Route path="/dev" component={ProtectedRoute(10)}>
        <Route path="" component={Dev} />
      </Route>
      <Route path="/admin" component={ProtectedRoute(10)}>
        <Route path="" component={Admin} />
      </Route>
      <Route path="/" component={Home} />
      <Route path="*" component={NotFound} />
    </Routes></> 
  )
};

const App = () => {
  return (
    <Router>
        <Root />
    </Router>
  );
};

$(function () {
  const lightModeOn = localStorage.getItem('lightmode') || "on"

  if (lightModeOn == "off") {
    $(':root').attr('data-dark-mode', 'true')
    $('#dark-code-styling').removeAttr('disabled')
    $('#light-code-styling').attr('disabled', true)
  }
})

/* Rendering the App component to the root element. */
render(() => <App></App>, document.getElementById('root') as HTMLElement);