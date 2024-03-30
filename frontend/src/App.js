import './App.css';
import {BrowserRouter, Routes ,Route,Navigate} from 'react-router-dom';
import Home from './pages/Home/Home';
import Navigation from './components/shared/Navigation/Navigation';
import Activate from './pages/Activate/Activate';
import Authenticate from './pages/Authenticate/Authenticate';
import Rooms from './pages/Rooms/Rooms';
import { useSelector } from 'react-redux';

// const isAuth = false;
// const user = {
//   activated: false,
// }
function App() {
  return <BrowserRouter>
        <Navigation/>
      <Routes>
     
      </Routes>
      <GuestRoute path="/"> <Home/> </GuestRoute>
      <GuestRoute path="/authenticate">
        <Authenticate/>
      </GuestRoute>
      <SemiProtectedRoute path="/activate">
        <Activate/>
      </SemiProtectedRoute>
      <ProtectedRoute path="/rooms">
        <Rooms/>
      </ProtectedRoute>
  </BrowserRouter>
}
const GuestRoute = ({ children, ...rest }) => {
  const {user,isAuth} = useSelector((state)=> state.auth);
  return (
    <Routes>
      <Route
        {...rest}
        element={
          isAuth ? (
            <Navigate
              to="/rooms"
              state={{ from: rest.location }}
            />
          ) : (
            children
          )
        }
      />
    </Routes>
  );
};
const SemiProtectedRoute = ({ children, ...rest }) => {
  const {user,isAuth} = useSelector((state)=> state.auth);
  // Assuming isAuth is defined somewhere
   // Example: Change this with your authentication logic
  return (
    <Routes>
      <Route
        {...rest}
        element={
          !isAuth ? (
            <Navigate
              to="/"
              state={{ from: rest.location }}
            />
          ) : isAuth && !user.activated? (
            children
          ) :(
            <Navigate
              to="/rooms"
              state={{ from: rest.location }}
            />
          )
        }
      />
    </Routes>
  );
};

const ProtectedRoute = ({ children, ...rest }) => {
  const {user,isAuth} = useSelector((state)=> state.auth);
  // Assuming isAuth is defined somewhere
   // Example: Change this with your authentication logic
  return (
    <Routes>
      <Route
        {...rest}
        element={
          !isAuth ? (
            <Navigate
              to="/"
              state={{ from: rest.location }}
            />
          ) : isAuth && !user.activated? (
            (
              <Navigate
                to="/activate"
                state={{ from: rest.location }}
              />
            )
          ) : (
            children
          )
        }
      />
    </Routes>
  );
};

export default App;

