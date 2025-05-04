import { useEffect, useState } from "react";
import {Link, useParams} from "react-router-dom";
import Navbar from "./Navbar.jsx";

const RoomList = () => {
    const { hotelId } = useParams();
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [sortByPrice, setSortByPrice] = useState(null);
    const [sortByCapacity, setSortByCapacity] = useState(null);

    const [capacity, setCapacity] = useState("");
    const [minPrice, setMinPrice] = useState("");
    const [maxPrice, setMaxPrice] = useState("");

    const [comforts, setComforts] = useState([]);
    const [roomComforts, setRoomComforts] = useState({});
    const [selectedComforts, setSelectedComforts] = useState([]);

    const fetchRoomComforts = async (roomId) => {
        try {
            const response = await fetch(`http://localhost:5221/api/rooms/${roomId}/comforts`);
            if (!response.ok) {
                throw Error('Ошибка при загрузке данных о комфортностях');
            }
            const data = await response.json();
            console.log(data);
            setRoomComforts(prev => ({
                ...prev,
                [roomId]: data
            }));
        } catch (error) {
            console.error("Ошибка при получении информации об удобствах для комнат: ", error);
        }
    }

    useEffect(() => {
        const fetchComforts = async () => {
            try {
                const response = await fetch("http://localhost:5221/api/comforts");
                if (!response.ok) {
                    throw new Error("Ошибка при загрузке комфортностей");
                }
                const data = await response.json();
                setComforts(data);
            } catch (error) {
                console.error("Ошибка загрузки комфортностей:", error);
            }
        };

        fetchComforts();
    }, []);

    useEffect(() => {
        const fetchFilteredRooms = async () => {
            try {
                const queryParams = new URLSearchParams();
                if (capacity) queryParams.append("capacity", capacity);
                if (minPrice) queryParams.append("minUnitPrice", minPrice);
                if (maxPrice) queryParams.append("maxUnitPrice", maxPrice);

                const response = await fetch(`http://localhost:5221/api/rooms/filter/${hotelId}?${queryParams}`);
                if (!response.ok) {
                    throw Error('Ошибка при загрузке данных о номерах');
                }
                const data = await response.json();
                setRooms(data);

                data.forEach((room) => {
                    fetchRoomComforts(room.id);
                })

            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };
        fetchFilteredRooms();
    }, [hotelId, capacity, minPrice, maxPrice]);

    useEffect(() => {
        const fetchSortedRooms = async () => {
            try {
                const queryParams = new URLSearchParams();
                if (sortByPrice !== null) queryParams.append("sortingDirectionByPrice", sortByPrice === "true");
                if (sortByCapacity !== null) queryParams.append("sortingDirectionByCapacity", sortByCapacity === "true");

                const response = await fetch(`http://localhost:5221/api/rooms/sort/${hotelId}?${queryParams}`);
                if (!response.ok) {
                    throw Error('Ошибка при загрузке данных о номерах');
                }
                const data = await response.json();

                data.forEach((room) => {
                    fetchRoomComforts(room.id);
                })

                setRooms(data);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };
        fetchSortedRooms();
    }, [hotelId, sortByPrice, sortByCapacity]);

    const fetchFilteredRoomsByComforts = async () => {
        try {
            if (selectedComforts.length === 0) {
                return;
            }

            const queryParams = new URLSearchParams();
            selectedComforts.forEach(id => queryParams.append("comfortIds", id));

            const response = await fetch(`http://localhost:5221/api/rooms/filter-by-comforts/${hotelId}?${queryParams}`);
            if (!response.ok) {
                throw new Error("Ошибка при загрузке номеров");
            }

            const data = await response.json();
            setRooms(data);

            data.forEach(room => {
                fetchRoomComforts(room.id);
            });

        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleResetFilters = () => {
        setCapacity("");
        setMinPrice("");
        setMaxPrice("");
    };

    const handleComfortChange = (event, comfortId) => {
        setSelectedComforts(prev =>
            event.target.checked
                ? [...prev, comfortId]
                : prev.filter(id => id !== comfortId)
        );
    };

    const handleResetSorting = () => {
        setSortByPrice(null);
        setSortByCapacity(null);
    };

    if (loading) return <p>Загрузка...</p>;
    if (error) return <div className="error">Ошибка: {error}</div>;

    return (
        <div className="room-container">
            <Navbar />
            <h1 className="title">Доступные комнаты</h1>
            <div className="filters" style={styles.filters}>
                <div className="filter-box" style={styles.filterBox}>
                    <h3>Фильтрация</h3>
                    <input type="number" placeholder="Вместимость" value={capacity}
                           onChange={e => setCapacity(e.target.value)} style={styles.input}/>
                    <input type="number" placeholder="Мин. цена" value={minPrice}
                           onChange={e => setMinPrice(e.target.value)} style={styles.input}/>
                    <input type="number" placeholder="Макс. цена" value={maxPrice}
                           onChange={e => setMaxPrice(e.target.value)} style={styles.input}/>
                    <button onClick={handleResetFilters} style={styles.resetButton}>Сбросить фильтры</button>
                </div>
                <div className="sort-box" style={styles.filterBox}>
                    <h3>Сортировка</h3>
                    <select onChange={e => setSortByPrice(e.target.value === "" ? null : e.target.value)}
                            style={styles.select}>
                        <option value="">Сортировать по цене</option>
                        <option value="true">По возрастанию</option>
                        <option value="false">По убыванию</option>
                    </select>
                    <select onChange={e => setSortByCapacity(e.target.value === "" ? null : e.target.value)}
                            style={styles.select}>
                        <option value="">Сортировать по вместимости</option>
                        <option value="true">По возрастанию</option>
                        <option value="false">По убыванию</option>
                    </select>
                    <button onClick={handleResetSorting} style={styles.resetButton}>Сбросить сортировку</button>
                </div>

                <div className="filter-box" style={styles.filterBox}>
                    <h3>Фильтр по комфорту</h3>
                    <div style={styles.comfortsContainer}>
                        {comforts.map(comfort => (
                            <label key={comfort.id} style={styles.comfortLabel}>
                                <input
                                    type="checkbox"
                                    value={comfort.id}
                                    checked={selectedComforts.includes(comfort.id)}
                                    onChange={e => handleComfortChange(e, comfort.id)}
                                    style={styles.checkbox}
                                />
                                {comfort.name}
                            </label>
                        ))}
                    </div>
                    <button onClick={fetchFilteredRoomsByComforts} style={styles.resetButton}>Применить</button>
                </div>

            </div>
            <div style={styles.roomList}>
                {rooms.map(room => (
                    <div key={room.id} style={styles.roomCard} className="room-card">
                        <h3>Комната {room.roomNumber}</h3>
                        <p><strong>Описание:</strong> {room.description}</p>
                        <p><strong>Вместимость:</strong> {room.capacity} человек</p>
                        <p><strong>Цена за ночь:</strong> {room.unitPrice} руб.</p>
                        <div>
                            <strong>Удобства:</strong>
                            {roomComforts[room.id] ? (
                                <ul style={styles.comfortsList}>
                                    {roomComforts[room.id].map(comfort => (
                                        <li key={comfort.id}>{comfort.name}</li>
                                    ))}
                                </ul>
                            ) : (
                                <p>Загрузка удобств...</p>
                            )}

                            <Link
                                to={`/amenity-review/${room.id}`}
                                style={{textDecoration: "none"}}
                            >
                                <button style={styles.navLinks}>
                                    Посмотреть отзывы на услуги
                                </button>
                            </Link>

                            <br/>
                            <br/>

                            {room.capacity === 1 ? (
                                <Link
                                    to={`/single-room-booking/${room.id}`}
                                    style={{textDecoration: "none"}}
                                >
                                    <button style={styles.navLinks}>
                                        Забронировать одиночную
                                    </button>
                                </Link>
                            ) : (
                                <Link
                                    to={`/group-room-booking/${room.id}`}
                                    style={{textDecoration: "none"}}
                                >
                                    <button style={styles.navLinks}>
                                        Забронировать для группы
                                    </button>
                                </Link>
                            )}

                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const styles = {
    filters: {
        display: "flex",
        justifyContent: "center",
        gap: "20px",
        marginBottom: "20px"
    },
    filterBox: {
        border: "1px solid #ccc",
        borderRadius: "10px",
        padding: "45px",
        width: "300px",
        textAlign: "center",
        backgroundColor: "#f5f5f5",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
    },
    input: {
        width: "100%",
        padding: "8px",
        marginBottom: "10px",
        borderRadius: "5px",
        backgroundColor: "#f5f5f5",
        color: "black",
        border: "1px solid #ccc"
    },
    select: {
        width: "100%",
        padding: "8px",
        marginBottom: "10px",
        borderRadius: "5px",
        backgroundColor: "#f5f5f5",
        color: "black",
        border: "1px solid #ccc"
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
        backgroundColor: "#f5f5f5",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
    },
    comfortLabel: {
        display: "flex",
        alignItems: "center",
        gap: "8px",
        fontSize: "16px",
        cursor: "pointer"
    },
    checkbox: {
        transform: "scale(1.2)"
    }
};

export default RoomList;