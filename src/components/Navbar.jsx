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

    return (
        <nav style={styles.navbar}>
            <div style={styles.navContainer}>
                <Link to="/" style={styles.logo}>HotelBooking</Link>
                <div style={styles.navItems}>
                    <Link to="/hotels" style={styles.navLink}>Отели</Link>
                    <Link to="/hotels/1/rooms" style={styles.navLink}>Комнаты</Link>

                    {userRole === 'guest' && (
                        <>
                            <Link to="/guest-profile" style={styles.navLink}>Личный кабинет</Link>
                            <Link to="/mybookings" style={styles.navLink}>Мои бронирования</Link>
                        </>
                    )}

                    {userRole?.includes('Administrator') && (
                        <Link to="/admin-panel" style={styles.navLink}>Панель администратора</Link>
                    )}

                    {userRole?.includes('employee') && !userRole?.includes('Administrator') && (
                        <Link to="/employee-panel" style={styles.navLink}>Панель сотрудника</Link>
                    )}
                </div>

                <div style={styles.userSection}>
                    {userName ? (
                        <>
                            <span style={styles.greeting}>{`Здравствуйте, ${userName}`}</span>
                            <button onClick={handleLogout} style={styles.logoutButton}>Выйти</button>
                        </>
                    ) : (
                        <Link to="/login" style={styles.loginButton}>Войти</Link>
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
        backgroundColor: '#ffffff',
        padding: '12px 32px',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
        zIndex: 1000,
    },
    navContainer: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        maxWidth: '1200px',
        margin: '0 auto',
    },
    logo: {
        fontSize: '22px',
        fontWeight: 'bold',
        color: '#4a6bff',
        textDecoration: 'none',
    },
    navItems: {
        display: 'flex',
        gap: '20px',
    },
    navLink: {
        color: '#333',
        textDecoration: 'none',
        fontSize: '16px',
        padding: '8px 12px',
        borderRadius: '6px',
        transition: 'background-color 0.3s ease',
        fontWeight: '500',
        ':hover': {
            backgroundColor: '#f0f0f0',
        }
    },
    userSection: {
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
    },
    greeting: {
        color: '#555',
        fontSize: '15px',
        fontWeight: '500',
    },
    logoutButton: {
        backgroundColor: '#ff4d4f',
        color: '#fff',
        border: 'none',
        borderRadius: '6px',
        padding: '8px 14px',
        fontSize: '14px',
        fontWeight: '500',
        cursor: 'pointer',
        transition: 'background-color 0.3s ease',
    },
    loginButton: {
        backgroundColor: '#4a6bff',
        color: '#fff',
        textDecoration: 'none',
        padding: '8px 14px',
        borderRadius: '6px',
        fontSize: '14px',
        fontWeight: '500',
        transition: 'background-color 0.3s ease',
    }
};

export default Navbar;
