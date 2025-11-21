import Dashboard from './pages/Dashboard';
import Schedule from './pages/Schedule';
import Sites from './pages/Sites';
import Chatbots from './pages/Chatbots';
import Design from './pages/Design';
import Products from './pages/Products';
import Profile from './pages/Profile';
import Plans from './pages/Plans';
import AdminControl from './pages/AdminControl';
import MyPlan from './pages/MyPlan';
import Nurse from './pages/Nurse';
import Support from './pages/Support';
import About from './pages/About';
import News from './pages/News';
import Tools from './pages/Tools';
import OurMission from './pages/OurMission';
import BeautyTea from './pages/BeautyTea';
import SkinCaretakers from './pages/SkinCaretakers';
import SolidBeauty from './pages/SolidBeauty';
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
    "AdminControl": AdminControl,
    "MyPlan": MyPlan,
    "Nurse": Nurse,
    "Support": Support,
    "About": About,
    "News": News,
    "Tools": Tools,
    "OurMission": OurMission,
    "BeautyTea": BeautyTea,
    "SkinCaretakers": SkinCaretakers,
    "SolidBeauty": SolidBeauty,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};