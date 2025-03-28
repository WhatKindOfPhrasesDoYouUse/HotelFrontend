import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Navbar from "./Navbar.jsx";

const RoomList = () => {
    const { hotelId } = useParams();
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [sortByPrice, setSortByPrice] = useState(null);
    const [sortByCapacity, setSortByCapacity] = useState(null);

    useEffect(() => {
        const fetchRooms = async () => {
            try {
                const queryParams = new URLSearchParams();
                if (sortByPrice !== null) queryParams.append("sortingDirectionByPrice", sortByPrice);
                if (sortByCapacity !== null) queryParams.append("sortingDirectionByCapacity", sortByCapacity);

                const response = await fetch(`http://localhost:5221/api/rooms/sort/${hotelId}?${queryParams}`);
                if (!response.ok) {
                    throw Error('Ошибка при загрузке данных о номерах')
                }
                const data = await response.json();
                console.log("Полученные данные:", data);
                setRooms(data);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };
        fetchRooms();
    }, [hotelId, sortByPrice, sortByCapacity]);

    const handleSortByPriceChange = (e) => {
        setSortByPrice(e.target.value === "" ? null : e.target.value === "true");
    };

    const handleSortByCapacityChange = (e) => {
        setSortByCapacity(e.target.value === "" ? null : e.target.value === "true");
    };

    const handleResetFilters = () => {
        setSortByPrice(null);
        setSortByCapacity(null);
    };

    if (loading) return <p>Загрузка...</p>;
    if (error) return <div className="error">Ошибка: {error}</div>;

    return (
        <div className="room-container">
            <Navbar />
            <h1 className="title">Доступные комнаты</h1>
            <div className="filter-container" style={styles.filterContainer}>
                <select name="sortByPrice" onChange={handleSortByPriceChange}
                        value={sortByPrice === null ? "" : sortByPrice ? "true" : "false"}>
                    <option value="true">Цена: по возрастанию</option>
                    <option value="false">Цена: по убыванию</option>
                </select>
                <select name="sortByCapacity" onChange={handleSortByCapacityChange}
                        value={sortByCapacity === null ? "" : sortByCapacity ? "true" : "false"}>
                    <option value="true">Вместимость: по возрастанию</option>
                    <option value="false">Вместимость: по убыванию</option>
                </select>
                <button onClick={handleResetFilters} style={styles.resetButton}>Сбросить фильтры</button>
            </div>
            <div style={styles.roomList}>
                {rooms.map(room => (
                    <div key={room.id} style={styles.roomCard} className="room-card">
                        <h3>Комната {room.roomNumber}</h3>
                        <p><strong>Описание:</strong> {room.description}</p>
                        <p><strong>Вместимость:</strong> {room.capacity} человек</p>
                        <p><strong>Цена за ночь:</strong> {room.unitPrice} руб.</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

const styles = {
    filterBox: {
        border: "1px solid #ccc",
        borderRadius: "10px",
        padding: "15px",
        margin: "20px auto",
        width: "50%",
        backgroundColor: "#f9f9f9"
    },
    filterContainer: {
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        alignItems: "center"
    },
    label: {
        fontSize: "16px",
        fontWeight: "bold"
    },
    select: {
        padding: "8px",
        borderRadius: "5px",
        border: "1px solid #ccc",
        cursor: "pointer",
        fontSize: "16px",
        width: "80%"
    },
    resetButton: {
        padding: "10px 15px",
        backgroundColor: "#f44336",
        color: "white",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer",
        fontSize: "16px",
        fontWeight: "bold",
        marginTop: "10px"
    },
    roomList: {
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: "20px",
        padding: "20px"
    },
    roomCard: {
        border: "1px solid #ddd",
        borderRadius: "8px",
        padding: "15px",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
    }
};

export default RoomList;
