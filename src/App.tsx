import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './auth/AuthProvider'
import ProtectedRoute from './components/auth/ProtectedRoute'
import Layout from './components/layout/Layout'
import AboutPage from './pages/AboutPage'
import AuthPage from './pages/AuthPage'
import GuestListPage from './pages/GuestListPage'
import HomePage from './pages/HomePage'
import ListDetailPage from './pages/ListDetailPage'
import ListPage from './pages/ListPage'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/login" element={<AuthPage />} />
            <Route
              path="/list"
              element={
                <ProtectedRoute>
                  <ListPage />
                </ProtectedRoute>
              }
            />
            <Route path="/g/:publicSlug" element={<GuestListPage />} />
            <Route path="/list/:listId/guest" element={<GuestListPage />} />
            <Route
              path="/list/:listId"
              element={
                <ProtectedRoute>
                  <ListDetailPage />
                </ProtectedRoute>
              }
            />
          </Routes>
        </Layout>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
