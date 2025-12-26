import { Routes, Route } from 'react-router-dom';
import Login from './Pages/Login';
import Register from './Pages/Register';
import  Home  from "./Pages/Home.jsx";
function App() {
  return (
     <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/Login" element={<Login />} />
      <Route path="/Register" element={<Register />} />
      <Route path="/home" element={<Home />} />
    </Routes>

  )
}

export default App
