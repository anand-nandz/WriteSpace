import React from 'react'
import './index.css'
import { Routes, Route, useLocation } from 'react-router-dom'
import Loader from './components/Loader'
import LandingPage from './pages/LandingPage'
import Login from './pages/Login'
import { WritSpaceNavbar } from './components/common/Navbar'
import SignUp from './pages/SignUp'
import { USER } from './utils/constants/constants'
import Home from './pages/Home'
import VerifyOtp from './pages/VerifyOtp'
import { useAuthCheck } from './hooks/useAuthCheck'
import { NextUIProvider } from '@nextui-org/react'
import ErrorBoundary from './utils/ErrorBoundary'
import PublicRoute from './utils/PublicRouteProps'
import UnifiedPrivateRoute from './utils/PrivateRouteProps'
import CreateBlog from './components/blog/CreateBlog'
import UserProfile from './pages/UserProfile'
import Blogs from './pages/blogs'
import AllBlogsv from './pages/AllBlogsv'
import AboutPage from './pages/AboutPage'
import ResetPassword from './pages/ResetPassword'
// 

const App: React.FC = () => {
  const noNavbarRoutes = ['/login', '/signup', '/verifyOtp'];
  useAuthCheck()
  const location = useLocation();
  const shouldHideNavbar = noNavbarRoutes.includes(location.pathname);
  return (
      <NextUIProvider>

        <React.Suspense fallback={<Loader />}>
          {!shouldHideNavbar && <WritSpaceNavbar />}
          <Routes>
            <Route element={<PublicRoute routeType='user' />}>
              <Route path="/*" element={<ErrorBoundary><LandingPage /></ErrorBoundary>} />
              <Route path={USER.LOGIN} element={<ErrorBoundary><Login /></ErrorBoundary>} />
              <Route path={USER.SIGNUP} element={<ErrorBoundary><SignUp /></ErrorBoundary>} />
              <Route path={USER.VERIFY} element={<ErrorBoundary><VerifyOtp /></ErrorBoundary>} />
              <Route path={USER.ALL_BLOG} element={<ErrorBoundary><AllBlogsv /></ErrorBoundary>} />
              <Route path={USER.FORGOT_PWDMAIL} element={<ResetPassword />} />


            </Route>

            <Route element={<UnifiedPrivateRoute routeType='user' />}>
              <Route path={USER.HOME} element={<ErrorBoundary><Home /></ErrorBoundary>} />
              <Route path={USER.PROFILE} element={<ErrorBoundary><UserProfile /></ErrorBoundary>} />
              <Route path={USER.BLOGS} element={<ErrorBoundary><Blogs /></ErrorBoundary>} />
              <Route path={USER.CREATE_BLOG} element={<ErrorBoundary><CreateBlog /></ErrorBoundary>} />
              <Route path={USER.ABOUT_US} element={<ErrorBoundary><AboutPage /></ErrorBoundary>} />

            </Route>

          </Routes>
        </React.Suspense>
      </NextUIProvider>
  )
}

export default App