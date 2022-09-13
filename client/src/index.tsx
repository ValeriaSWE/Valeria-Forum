/* Importing the necessary modules from the SolidJS library. */
import { Show, createContext, createSignal, useContext, children, createResource } from "solid-js";
import { render } from "solid-js/web";
import {Router,Routes, Route, Link, useRoutes, Outlet, RouteDefinition, useParams, Navigate, useIsRouting} from "solid-app-router";
import './index.css';

// Importing pages
import Home from './Pages/Home';
import Forum from "./Pages/Forum";
import Feed from "./Components/Feed";

const routes: RouteDefinition[] = [
  /*{
    path: "",
    component: Protected,
    children: [
      {
        path: "forum",
        component: Forum
      } 
    ]
  }, */
  {
    path: "*",
    component: Home
  },
  {
    path: "/forum",
    component: Forum,
  }
];

function delay(ms: number) {
  return new Promise<void>((res) => {
    setTimeout(() => res(), ms);
  });
}

async function fetchSubTabData(id: string) {
  await delay(1000);

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
      <p>async</p>
    </Show>
  );
}

function Loader() {
  const isRouting = useIsRouting();
  return <div data-component="loader" class="loader" classList={{ active: isRouting() }} />;
}

const Root = () => {
  return (
    <>
     <Router>
      <Loader /><Routes>
        <Route path="*" component={Home}></Route>
        <Route path="/forum" component={Forum}>
          <Route path="/" element={<Navigate href="feed" />} />
          <Route path=":id" component={SubTab} />
        </Route>
      </Routes>
    </Router>
    </> 
  )
};

/* Rendering the App component to the root element. */
render(() => <Root></Root>, document.getElementById('root') as HTMLElement);