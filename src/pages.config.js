import Dashboard from './pages/Dashboard';
import Nurse from './pages/Nurse';
import Schedule from './pages/Schedule';
import Sites from './pages/Sites';
import Chatbots from './pages/Chatbots';
import Design from './pages/Design';
import Products from './pages/Products';
import Profile from './pages/Profile';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Dashboard": Dashboard,
    "Nurse": Nurse,
    "Schedule": Schedule,
    "Sites": Sites,
    "Chatbots": Chatbots,
    "Design": Design,
    "Products": Products,
    "Profile": Profile,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};