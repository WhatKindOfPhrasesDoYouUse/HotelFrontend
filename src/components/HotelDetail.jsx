import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
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
                if (!response.ok) {
                    throw new Error("Ошибка загрузки данных отеля");
                }
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
        <div style={styles.container}>
            <Navbar />
            <div style={styles.card}>
                <h1 style={styles.title}>{hotel.name}</h1>
                <p><strong>Город:</strong> {hotel.city}</p>
                <p><strong>Адрес:</strong> {hotel.address}</p>
                <p><strong>Описание:</strong> {hotel.description}</p>
                <p><strong>Год постройки:</strong> {hotel.yearOfConstruction}</p>
                <p><strong>Рейтинг:</strong> {hotel.rating} ⭐</p>
                <p><strong>Контакты:</strong> {hotel.phoneNumber} | {hotel.email}</p>
            </div>
            <div style={styles.imageGallery}>
                <img src="src/images/hotels/hotel-image-1.jpg" alt="Фото отеля" style={styles.image} />
                <img src="src/images/hotels/hotel-image-2.jpg" alt="Фото отеля" style={styles.image} />
            </div>
        </div>
    );
};

const styles = {
    container: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "80vh", // Полное окно
        padding: "20px",
        backgroundColor: "#f8f8f8",
    },
    card: {
        backgroundColor: "#fff",
        padding: "20px",
        borderRadius: "12px",
        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
        textAlign: "center",
        width: "60%",
        maxWidth: "600px",
    },
    title: {
        fontSize: "28px",
        marginBottom: "10px",
    },
    imageGallery: {
        display: "flex",
        gap: "15px",
        marginTop: "20px",
    },
    image: {
        width: "200px",
        height: "130px",
        borderRadius: "8px",
        objectFit: "cover",
        boxShadow: "0 2px 6px rgba(0, 0, 0, 0.2)",
    },
    loading: {
        textAlign: "center",
        fontSize: "18px",
        marginTop: "20px",
    },
    error: {
        color: "red",
        textAlign: "center",
    },
};

export default HotelDetail;
