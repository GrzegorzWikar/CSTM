import { NavLink } from "react-router";

interface NavigationItem{
    label: string;
    path: string;
    icon: string;
    end?: boolean;
}

const NavigationItems: NavigationItem[] = [
    {
        label: 'Dashboard',
        path: '/dashboard',
        icon: 'DB',
    },
    {
        label: 'Tickets',
        path: '/tickets',
        icon: 'TK',
        end: true,
    },
    {
        label: 'New ticket',
        path: '/tickets/new',
        icon: 'NT',
    },
    {
        label: 'Profile',
        path: '/profile',
        icon: 'PR',
    },        

];

function Sidebar() {
    return(
        <aside className="sidebar" aria-label="Application navigation">
            <nav className="sidebar__navigation">
                <ul className="sidebar__list">
                    {NavigationItems.map((item) => (
                        <li className="sidebar__item" key={item.path}>
                            <NavLink className={({isActive}) => 
                            `sidebar_link${isActive ? ' sidebar__link--active' : ''}`
                        }
                        end={item.end}
                        to={item.path}
                        >
                            <span className="sidebar__icon" aria-hidden='true'>
                                {item.icon}
                            </span>
                            <span>{item.label}</span>
                        </NavLink>
                        </li>
                    ))}
                </ul>
            </nav>

            <p className="sidebar__footer">
                Portfolio MVP
            </p>
        </aside>
    );
}

export default Sidebar;