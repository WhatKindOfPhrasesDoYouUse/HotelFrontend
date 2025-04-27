import { Link } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
    const [userName, setUserName] = useState("");
    const [userRole, setUserRole] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const getUserNameFromToken = async () => {
            const token = localStorage.getItem("token");

            if (token) {
                try {
                    const decodedToken = jwtDecode(token);
                    setUserName(decodedToken.client_name);
                    setUserRole(decodedToken.role || []);
                } catch (error) {
                    console.error(`Ошибка декодирования токена ${error}`);
                    setUserName("");
                    setUserRole(null);
                }
            } else {
                setUserName("");
                setUserRole(null);
            }
        };
        getUserNameFromToken();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("token");
        setUserName("");
        navigate('/hotels');
    };

    console.log(userRole)

    return (
        <nav style={styles.navbar}>
            <div style={styles.navContainer}>
                <div style={styles.navItems}>
                    {userName ? (
                        <>
                            <span style={styles.greeting}>{`Здравствуйте, ${userName}`}</span>
                            <button onClick={handleLogout} style={styles.logoutButton}>
                                Выйти
                            </button>
                        </>
                    ) : (
                        <Link to="/login" style={styles.navLinks}>Авторизуйтесь</Link>
                    )}

                    <Link to="/guest-profile" style={styles.navLinks}>Личный кабинет</Link>
                    <Link to="/hotels" style={styles.navLinks}>Отель</Link>
                    <Link to="/hotels/1/rooms" style={styles.navLinks}>Комнаты</Link>
                    <Link to="/mybookings" style={styles.navLinks}>Мои бронирования</Link>

                    {userRole?.includes('Administrator') && (
                        <Link to="/admin-panel" style={styles.navLinks}>Панель администратора</Link>
                    )}

                    {userRole?.includes('employee') && (
                        <Link to="/employee-panel" style={styles.navLinks}>Панель сотрудника</Link>
                    )}

                </div>
            </div>
        </nav>
    );
};

const styles = {
    navbar: {
        width: "100%",
        position: "fixed",
        top: 0,
        left: 0,
        backgroundColor: '#4a6bff',
        padding: '10px 20px',
        color: '#fff',
        zIndex: 1000,
    },
    navContainer: {
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        justifyContent: 'flex-start',
    },
    navItems: {
        display: 'flex',
        alignItems: 'center',
        gap: '20px',
    },
    navLinks: {
        color: '#fff',
        textDecoration: 'none',
        fontSize: '16px',
        padding: '8px 12px',
        borderRadius: '4px',
        transition: 'background-color 0.2s',
        ':hover': {
            backgroundColor: 'rgba(255,255,255,0.2)',
        }
    },
    greeting: {
        color: '#fff',
        fontSize: '16px',
    },
    logoutButton: {
        backgroundColor: 'transparent',
        color: '#fff',
        border: '1px solid #fff',
        borderRadius: '4px',
        padding: '8px 16px',
        fontSize: '16px',
        cursor: 'pointer',
        transition: 'all 0.2s',
        ':hover': {
            backgroundColor: 'rgba(255,255,255,0.1)',
        }
    }
};

export default Navbar;