import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Navbar from "./Navbar.jsx";

const HotelDetail = () => {
    const { hotelId } = useParams();
    const [hotel, setHotel] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchHotel = async () => {
            try {
                const response = await fetch(`http://localhost:5221/api/hotels`);
                if (!response.ok) throw new Error("Ошибка загрузки данных отеля");
                const data = await response.json();
                setHotel(data[0]);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };
        fetchHotel();
    }, [hotelId]);

    if (loading) return <p style={styles.loading}>Загрузка...</p>;
    if (error) return <p style={styles.error}>Ошибка: {error}</p>;
    if (!hotel) return <p style={styles.error}>Отель не найден</p>;

    return (
        <div>
            <Navbar />

            <div style={styles.header}>
                <img src="src/images/hotels/hotel-image-1.jpg" alt="Hotel" style={styles.headerImage} />
                <div style={styles.headerOverlay}>
                    <h1 style={styles.headerTitle}>{hotel.name}</h1>
                    <p style={styles.headerSubtitle}>{hotel.city} — {hotel.address}</p>
                </div>
            </div>

            <div style={styles.content}>
                <section style={styles.section}>
                    <h2 style={styles.sectionTitle}>Об отеле</h2>
                    <p style={styles.description}>{hotel.description}</p>
                </section>

                <section style={styles.section}>
                    <h2 style={styles.sectionTitle}>Информация</h2>
                    <ul style={styles.infoList}>
                        <li><strong>Год постройки:</strong> {hotel.yearOfConstruction}</li>
                        <li><strong>Рейтинг:</strong> {hotel.rating} ⭐</li>
                        <li><strong>Телефон:</strong> {hotel.phoneNumber}</li>
                        <li><strong>Email:</strong> {hotel.email}</li>
                    </ul>
                </section>

{/*                <section style={styles.section}>
                    <Link to={`/hotels/${hotel.id}/rooms`} style={styles.button}>
                        Просмотр комнат
                    </Link>
                </section>*/}

                <section style={styles.gallerySection}>
                    <h2 style={styles.sectionTitle}>Галерея</h2>
                    <div style={styles.gallery}>
                        <img src="src/images/hotels/hotel-image-1.jpg" alt="Фото 1" style={styles.galleryImage} />
                        <img src="src/images/hotels/hotel-image-2.jpg" alt="Фото 2" style={styles.galleryImage} />
                    </div>
                </section>
            </div>
        </div>
    );
};

const styles = {
    loading: {
        textAlign: "center",
        fontSize: "18px",
        marginTop: "20px",
    },
    error: {
        color: "red",
        textAlign: "center",
    },
    header: {
        position: "relative",
        height: "400px",
        width: "100%",
        overflow: "hidden",
        marginTop: "64px"
    },
    headerImage: {
        width: "100%",
        height: "100%",
        objectFit: "cover",
        filter: "brightness(60%)",
    },
    headerOverlay: {
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        color: "#fff",
        textAlign: "center",
    },
    headerTitle: {
        fontSize: "48px",
        fontWeight: "bold",
        margin: 0,
    },
    headerSubtitle: {
        fontSize: "20px",
        marginTop: "10px",
    },
    content: {
        maxWidth: "900px",
        margin: "0 auto",
        padding: "40px 20px",
    },
    section: {
        marginBottom: "40px",
    },
    sectionTitle: {
        fontSize: "24px",
        marginBottom: "10px",
        borderBottom: "2px solid #ccc",
        paddingBottom: "5px",
    },
    description: {
        fontSize: "16px",
        lineHeight: "1.6",
    },
    infoList: {
        listStyle: "none",
        paddingLeft: 0,
        fontSize: "16px",
        lineHeight: "1.8",
    },
    button: {
        display: "inline-block",
        padding: "12px 24px",
        backgroundColor: "#4CAF50",
        color: "white",
        textDecoration: "none",
        borderRadius: "8px",
        fontSize: "16px",
    },
    gallerySection: {
        marginTop: "20px",
    },
    gallery: {
        display: "flex",
        gap: "20px",
    },
    galleryImage: {
        width: "100%",
        maxWidth: "400px",
        height: "250px",
        borderRadius: "10px",
        objectFit: "cover",
        boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)",
    }
};

export default HotelDetail;
