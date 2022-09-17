/* Importing the necessary modules from the SolidJS library. */
import { Show, createContext, createSignal, useContext, children, createResource } from "solid-js";
import { render } from "solid-js/web";
import {Router,Routes, Route, Link, useRoutes, Outlet, RouteDefinition, useParams, Navigate, useIsRouting} from "solid-app-router";
import './index.css';

// Importing pages
import Home from './Pages/Home';
import Forum from "./Pages/Forum";
import Feed from "./Components/Feed";
import Dev from "./Pages/Dev";
import LoginPage from "./Pages/Login";
import RegisterPage from "./Pages/Register";
import NotFound from "./Pages/404";

function delay(ms: number) {
  return new Promise<void>((res) => {
    setTimeout(() => res(), ms);
  });
}

async function fetchSubTabData(id: string) {
  return {
    id,
    name: `SubTab ${id.toUpperCase()}`
  };
}

function SubTab() {
  const params = useParams();
  const [data] = createResource(() => params.id, fetchSubTabData);
  if(params.id === "feed") {
    return  <Show when={data()}>
    <Feed></Feed>
  </Show>
  }
  return (
    <Show when={data()}>
      <h2>{data()!.name}</h2>
      <p>This content is loaded asynchronously</p>
    </Show>
  );
}

function Loader() {
  const isRouting = useIsRouting();
  return <div data-component="loader" class="loader" classList={{ active: isRouting() }} />;
}

/**
 * Create the Routes
 */
const Root = () => {
  return (
    <><Loader /><Routes>
      <Route path="/forum" component={Forum}>
        <Route path="/" element={<Navigate href="feed" />} />
        <Route path=":id" component={SubTab} />
      </Route>
      <Route path="/login" component={LoginPage} />
      <Route path="/register" component={RegisterPage} />
      <Route path="/dev" component={Dev} />
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

/* Rendering the App component to the root element. */
render(() => <App></App>, document.getElementById('root') as HTMLElement);