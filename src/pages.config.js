import Dashboard from './pages/Dashboard';
import Schedule from './pages/Schedule';
import Sites from './pages/Sites';
import Chatbots from './pages/Chatbots';
import Design from './pages/Design';
import Products from './pages/Products';
import Profile from './pages/Profile';
import Plans from './pages/Plans';
import Onboarding from './pages/Onboarding';
import AdminControl from './pages/AdminControl';
import MyPlan from './pages/MyPlan';
import Nurse from './pages/Nurse';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Dashboard": Dashboard,
    "Schedule": Schedule,
    "Sites": Sites,
    "Chatbots": Chatbots,
    "Design": Design,
    "Products": Products,
    "Profile": Profile,
    "Plans": Plans,
    "Onboarding": Onboarding,
    "AdminControl": AdminControl,
    "MyPlan": MyPlan,
    "Nurse": Nurse,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};