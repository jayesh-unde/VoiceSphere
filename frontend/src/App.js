// import './App.css';
// import {BrowserRouter, Routes ,Route,Navigate} from 'react-router-dom';
// import {useState} from 'react';
// import Home from './pages/Home/Home';
// import Navigation from './components/shared/Navigation/Navigation';
// import Activate from './pages/Activate/Activate';
// import Authenticate from './pages/Authenticate/Authenticate';
// import Rooms from './pages/Rooms/Rooms';
// import { useSelector } from 'react-redux';
// import React from 'react';
// import { useLoadingWithRefresh } from './hooks/useLoadingWithRefresh';
// import Loader from './components/shared/Loader/Loader';
// import Room from './pages/Room.js/Room';
// import { ToastContainer } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';
// import Profile from './pages/Profile/Profile';
// // const isAuth = false;
// // const user = {
// //   activated: false,
// // }
// function App() {
//   const {loading} = useLoadingWithRefresh();
//   return loading?(
//     <Loader message="wait for some time"/>
//   ):(
//   <BrowserRouter>
//         <Navigation/>
//       <Routes>
     
//       </Routes>
//       <GuestRoute path="/"> <Home/> </GuestRoute>
//       <GuestRoute path="/authenticate">
//     <ToastContainer />

//         <Authenticate/>
//       </GuestRoute>
//       <SemiProtectedRoute path="/activate">
//         <Activate/>
//       </SemiProtectedRoute>
//       <ProtectedRoute path="/rooms">
//         <Rooms/>
//       </ProtectedRoute>
//       <ProtectedRoute path="/room/:id">
//         <Room/>
//       </ProtectedRoute>
//       <ProtectedRoute path="/profile/:username">
//         <Profile/>
//       </ProtectedRoute>
//   </BrowserRouter>
//   )
// }
// const GuestRoute = ({ children, ...rest }) => {
//   const {user,isAuth} = useSelector((state)=> state.auth);
//   return (
//     <Routes>
//       <Route
//         {...rest}
//         element={
//           isAuth ? (
//             <Navigate
//               to="/rooms"
//               state={{ from: rest.location }}
//             />
//           ) : (
//             children
//           )
//         }
//       />
//     </Routes>
//   );
// };
// const SemiProtectedRoute = ({ children, ...rest }) => {
//   const {user,isAuth} = useSelector((state)=> state.auth);
//   // Assuming isAuth is defined somewhere
//    // Example: Change this with your authentication logic
//   return (
//     <Routes>
//       <Route
//         {...rest}
//         element={
//           !isAuth ? (
//             <Navigate
//               to="/"
//               state={{ from: rest.location }}
//             />
//           ) : isAuth && !user.activated? (
//             children
//           ) :(
//             <Navigate
//               to="/rooms"
//               state={{ from: rest.location }}
//             />
//           )
//         }
//       />
//     </Routes>
//   );
// };

// const ProtectedRoute = ({ children, ...rest }) => {
//   const {user,isAuth} = useSelector((state)=> state.auth);
//   // Assuming isAuth is defined somewhere
//    // Example: Change this with your authentication logic
//   return (
//     <Routes>
//       <Route
//         {...rest}
//         element={
//           !isAuth ? (
//             <Navigate
//               to="/"
//               state={{ from: rest.location }}
//             />
//           ) : isAuth && !user.activated? (
//             (
//               <Navigate
//                 to="/activate"
//                 state={{ from: rest.location }}
//               />
//             )
//           ) : (
//             children
//           )
//         }
//       />
//     </Routes>
//   );

import './App.css';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import React from 'react';
import Home from './pages/Home/Home';
import Navigation from './components/shared/Navigation/Navigation';
import Activate from './pages/Activate/Activate';
import Authenticate from './pages/Authenticate/Authenticate';
import Rooms from './pages/Rooms/Rooms';
import Room from './pages/Room.js/Room';
import Profile from './pages/Profile/Profile';
import { useLoadingWithRefresh } from './hooks/useLoadingWithRefresh';
import Loader from './components/shared/Loader/Loader';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  const { loading } = useLoadingWithRefresh();

  if (loading) {
    return <Loader message="Please wait..." />;
  }

  return (
    <BrowserRouter>
      <Navigation />
      <ToastContainer />
      <Routes>
        <Route path="/" element={<GuestRoute><Home /></GuestRoute>} />
        <Route path="/authenticate" element={<GuestRoute><Authenticate /></GuestRoute>} />
        <Route path="/activate" element={<SemiProtectedRoute><Activate /></SemiProtectedRoute>} />
        <Route path="/rooms" element={<ProtectedRoute><Rooms /></ProtectedRoute>} />
        <Route path="/room/:id" element={<ProtectedRoute><Room /></ProtectedRoute>} />
        <Route path="/profile/:username" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
}

const GuestRoute = ({ children }) => {
  const { user, isAuth } = useSelector((state) => state.auth);
  return !isAuth ? children : <Navigate to="/rooms" />;
};

const SemiProtectedRoute = ({ children }) => {
  const { user, isAuth } = useSelector((state) => state.auth);
  if (!isAuth) {
    return <Navigate to="/" />;
  } else if (isAuth && !user.activated) {
    return children;
  } else {
    return <Navigate to="/rooms" />;
  }
};

const ProtectedRoute = ({ children }) => {
  const { user, isAuth } = useSelector((state) => state.auth);
  if (!isAuth) {
    return <Navigate to="/" />;
  } else if (isAuth && !user.activated) {
    return <Navigate to="/activate" />;
  } else {
    return children;
  }
};

export default App;

// };

// export default App;

