import React from 'react'
import {Routes,Route, Navigate} from 'react-router-dom'
import LoginPage from './pages/auth/login/LoginPage'
import SignUpPage from './pages/auth/signup/SignUpPage'
import HomePage from './pages/home/HomePage'
import Sidebar from './components/common/Sidebar'
import RightPanel from './components/common/RightPanel'
import NotificationPage from './pages/notification/NotificationPage'
import ProfilePage from './pages/profile/ProfilePage'
import {Toaster} from 'react-hot-toast'
import { useQuery } from '@tanstack/react-query'
import { baseUrl } from './constant/url'
import LoadingSpinner from './components/common/LoadingSpinner'

const App = () => {
 
  {/* checking whether the user is present  */}
  const {data:authUser,isLoading} = useQuery({
    queryKey : ["authUser"],
    queryFn : async ()=>{
      try {
        const res = await fetch(`${baseUrl}/api/auth/me`,{
          method : "GET",
          credentials: "include",
          headers:{
            "Content-Type":"application/json"
          }
        })

        const data = await res.json();

        if(data.error){ //if we  click logout button the cookie will be deleted , so the
          return null;  // authuser func will be called again but there will be no data
        }              // if no data is there it will result in error so if error is there
                    // we are setting authuser to null , so if authuser is null it will
                     // redirect you to login page

        if(!res.ok){
          throw new Error(data.error||"something went wrong")
        }
        
        console.log("Auth user:",data)
        return data;
      } catch (error) {
        throw error;
      }
    },
    retry : false
  })

  /* fetching the data may take some time so in that time we can show the loading
        spinner component */
  if(isLoading){
    return(
      <div className='flex justify-center items-center h-screen'>
        <LoadingSpinner size='lg' /> {/* large size */}
      </div>
    )
  }

  return (
    <div className='flex max-w-6xl mx-auto'>
     {authUser && <Sidebar />}                        
     <Routes>
      {/* if authuser data is present we direct them to the desired page or else
            we redirect them to the login page*/} 

      <Route path='/' element={authUser ? <HomePage />:<Navigate to="/login/"/>} />
      <Route path='/notifications' element={authUser ? < NotificationPage/>:<Navigate to="/login/"/>}/>
      <Route path='/profile/:username' element={authUser ? <ProfilePage/>:<Navigate to="/login/"/>}/>
      
      {/* if he is auth user then we no need to show the login or signup page 
            we directly show him the homepage */}

      <Route path='/login' element={!authUser ? <LoginPage /> : <Navigate to="/"/>} />
      <Route path='/signup' element={!authUser ?<SignUpPage /> : <Navigate to="/"/>} />
     
     </Routes>
     {authUser && <RightPanel />} {/* rightpanel is out side the routes bcoz it will be there permanently
                              irrelevant to the routes */}
     <Toaster />                         
    </div>
  )
}

export default App
