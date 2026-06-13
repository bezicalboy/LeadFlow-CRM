import { Routes, Route } from 'react-router'
import { AppLayout } from './components/layout/AppLayout'
import Dashboard from './pages/Dashboard'
import Leads from './pages/Leads'
import LeadDetail from './pages/LeadDetail'
import Pipeline from './pages/Pipeline'
import Tasks from './pages/Tasks'
import Settings from './pages/Settings'
import Login from './pages/Login'
import SignUp from './pages/SignUp'
import NotFound from './pages/NotFound'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="*" element={<NotFound />} />
      <Route
        path="/"
        element={
          <AppLayout>
            <Dashboard />
          </AppLayout>
        }
      />
      <Route
        path="/leads"
        element={
          <AppLayout>
            <Leads />
          </AppLayout>
        }
      />
      <Route
        path="/leads/new"
        element={
          <AppLayout>
            <Leads />
          </AppLayout>
        }
      />
      <Route
        path="/leads/:id"
        element={
          <AppLayout>
            <LeadDetail />
          </AppLayout>
        }
      />
      <Route
        path="/pipeline"
        element={
          <AppLayout>
            <Pipeline />
          </AppLayout>
        }
      />
      <Route
        path="/tasks"
        element={
          <AppLayout>
            <Tasks />
          </AppLayout>
        }
      />
      <Route
        path="/settings"
        element={
          <AppLayout>
            <Settings />
          </AppLayout>
        }
      />
    </Routes>
  )
}
