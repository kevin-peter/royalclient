  // import { useState } from 'react'
  // import reactLogo from './assets/react.svg'
  // import viteLogo from '/vite.svg'
import "bootstrap/dist/css/bootstrap.min.css";
import './css/style.scss'
import './css/app.scss'
// import './app.css'
import Routers from "./router";
import { useRoutes } from 'react-router-dom';
import "./css/variable.css";


function App() {
  //const [count, setCount] = useState(0)
   const routing = useRoutes(Routers); // ✅ This only works inside <BrowserRouter>
   return routing;

  
 }

export default App
