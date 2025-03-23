import React, {useState} from "react";
import {Link, useNavigate} from "react-router-dom";
import axios from "axios";

function GuestRegistration() {
    const [name, setName] = useState("");
    const [surname, setSurname] = useState("");
    const [patronymic, setPatronymic] = useState("");
    const [email, setEmail] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [passwordHash, setPasswordHash] = useState("");
    const [cityOfResidence, setCityOfResidence] = useState("");
    const [dateOfBirth, setDateOfBirth] = useState("");
    const [passportSeriesHash, setPassportSeriesHash] = useState("");
    const [passportNumberHash, setPassportNumberHash] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [validationErrors, setValidationErrors] = useState({});
    const navigate = useNavigate();

    const validate = () => {
        let errors = {};

        if (!name) errors.name = "Имя обязательно";
        if (!surname) errors.surname = "Фамилия обязательна";
        if (!email) errors.email = "Email обязателен";
        if (!phoneNumber) errors.phoneNumber = "Номер телефона обязателен";
        if (!passwordHash) errors.passwordHash = "Пароль обязателен";
        if (!cityOfResidence) errors.cityOfResidence = "Город проживания обязателен";
        if (!dateOfBirth) errors.dateOfBirth = "Дата рождения обязательна";
        if (!passportSeriesHash) errors.passportSeriesHash = "Серия паспорта обязательна";
        if (!passportNumberHash) errors.passportNumberHash = "Номер паспорта обязателен";

        const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
        if (email && !emailPattern.test(email)) {
            errors.email = "Неверный формат email";
        }

        const phonePattern = /^\+?\d{10,12}$/;
        if (phoneNumber && !phonePattern.test(phoneNumber)) {
            errors.phoneNumber = "Неверный формат номера телефона";
        }

        const passportSeriesHashPattern = /^\d{4}$/;
        if (passportSeriesHash && !passportSeriesHashPattern.test(passportSeriesHash)) {
            errors.passportSeriesHash = "Неверный формат серии паспорта";
        }

        const passportNumberHashPattern = /^\d{6}$/;
        if (passportNumberHash && !passportNumberHashPattern.test(passportNumberHash)) {
            errors.passportNumberHash = "Неверный формат номера паспорта";
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    }

    const handleRegistration = async () => {

        const isValid = validate();

        if (!isValid) {
            return;
        }

        try {
            const formattedDateOfBirth = formatDateToISO(dateOfBirth)

            const requestData = {
                client: {
                    name,
                    surname,
                    patronymic,
                    email,
                    phoneNumber,
                    passwordHash
                },
                guest: {
                    cityOfResidence,
                    dateOfBirth: formattedDateOfBirth,
                    passportSeriesHash,
                    passportNumberHash
                }
            };

            console.log("Request Payload:", requestData);

            const response = await axios.post("http://localhost:5221/api/auths/registration", requestData);

            if (response.status === 200) {
                navigate("/login");
            }
        } catch (error) {
            if (error.response) {
                setErrorMessage(error.response.data.message || "Ошибка регистрации.");
            } else {
                setErrorMessage("Ошибка подключения к серверу.");
            }
            console.error("Ошибка при регистрации:", error);
        }
    };

    const formatDateToISO = (dateString) => {
        const parts = dateString.split('.'); // ['06', '01', '2003']
        return `${parts[2]}-${parts[1]}-${parts[0]}`; // "2003-01-06"
    }

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh'
        }}>
            <div style={{
                padding: '20px',
                maxWidth: '400px',
                width: '100%',
                border: '1px solid #ccc',
                borderRadius: '10px',
                boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
                textAlign: 'center'
            }}>
                <h2>Регистрация гостя</h2>

                <input type="text" placeholder="Фамилия" value={surname} onChange={(e) => setSurname(e.target.value)}
                       style={{
                           width: '90%',
                           padding: '10px',
                           margin: '10px 0',
                           borderRadius: '5px',
                           border: '1px solid #ccc',
                           backgroundColor: '#f9f9f9',
                           color: '#333'
                       }}
                />

                <input type="text" placeholder="Имя" value={name} onChange={(e) => setName(e.target.value)}
                       style={{
                           width: '90%',
                           padding: '10px',
                           margin: '10px 0',
                           borderRadius: '5px',
                           border: '1px solid #ccc',
                           backgroundColor: '#f9f9f9',
                           color: '#333'
                       }}
                />

                <input type="text" placeholder="Отчество" value={patronymic}
                       onChange={(e) => setPatronymic(e.target.value)}
                       style={{
                           width: '90%',
                           padding: '10px',
                           margin: '10px 0',
                           borderRadius: '5px',
                           border: '1px solid #ccc',
                           backgroundColor: '#f9f9f9',
                           color: '#333'
                       }}
                />

                <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)}
                       style={{
                           width: '90%',
                           padding: '10px',
                           margin: '10px 0',
                           borderRadius: '5px',
                           border: '1px solid #ccc',
                           backgroundColor: '#f9f9f9',
                           color: '#333'
                       }}
                />
                {validationErrors.email && <p style={{ color: 'red' }}>{validationErrors.email}</p>}


                <input type="text" placeholder="Номер телефона" value={phoneNumber}
                       onChange={(e) => setPhoneNumber(e.target.value)}
                       style={{
                           width: '90%',
                           padding: '10px',
                           margin: '10px 0',
                           borderRadius: '5px',
                           border: '1px solid #ccc',
                           backgroundColor: '#f9f9f9',
                           color: '#333'
                       }}
                />
                {validationErrors.phoneNumber && <p style={{ color: 'red' }}>{validationErrors.phoneNumber}</p>}

                <input type="password" placeholder="Пароль" value={passwordHash}
                       onChange={(e) => setPasswordHash(e.target.value)}
                       style={{
                           width: '90%',
                           padding: '10px',
                           margin: '10px 0',
                           borderRadius: '5px',
                           border: '1px solid #ccc',
                           backgroundColor: '#f9f9f9',
                           color: '#333'
                       }}
                />

                <input type="text" placeholder="Город проживания" value={cityOfResidence}
                       onChange={(e) => setCityOfResidence(e.target.value)}
                       style={{
                           width: '90%',
                           padding: '10px',
                           margin: '10px 0',
                           borderRadius: '5px',
                           border: '1px solid #ccc',
                           backgroundColor: '#f9f9f9',
                           color: '#333'
                       }}
                />

                <input type="text" placeholder="Дата рождения (ДД.ММ.ГГГГ)" value={dateOfBirth}
                       onChange={(e) => setDateOfBirth(e.target.value)}
                       style={{
                           width: '90%',
                           padding: '10px',
                           margin: '10px 0',
                           borderRadius: '5px',
                           border: '1px solid #ccc',
                           backgroundColor: '#f9f9f9',
                           color: '#333'
                       }}
                />


                <input type="text" placeholder="Серия паспорта" value={passportSeriesHash}
                       onChange={(e) => setPassportSeriesHash(e.target.value)}
                       style={{
                           width: '90%',
                           padding: '10px',
                           margin: '10px 0',
                           borderRadius: '5px',
                           border: '1px solid #ccc',
                           backgroundColor: '#f9f9f9',
                           color: '#333'
                       }}
                />
                {validationErrors.passportSeriesHash && <p style={{ color: 'red' }}>{validationErrors.passportSeriesHash}</p>}

                <input type="text" placeholder="Номер паспорта" value={passportNumberHash}
                       onChange={(e) => setPassportNumberHash(e.target.value)}
                       style={{
                           width: '90%',
                           padding: '10px',
                           margin: '10px 0',
                           borderRadius: '5px',
                           border: '1px solid #ccc',
                           backgroundColor: '#f9f9f9',
                           color: '#333'
                       }}
                />
                {validationErrors.passportNumberHash && <p style={{ color: 'red' }}>{validationErrors.passportNumberHash}</p>}

                <button onClick={handleRegistration} style={{
                    padding: '10px 20px',
                    margin: '10px 5px',
                    backgroundColor: '#007bff',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer'
                }}>
                    Зарегистрироваться
                </button>
                {errorMessage && <p style={{color: 'red'}}>{errorMessage}</p>}
                <div style={{marginTop: '20px'}}>
                    <Link to="/login">
                        <button style={{
                            padding: '10px 20px',
                            backgroundColor: '#28a745',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: 'pointer'
                        }}>
                            Уже есть аккаунт? Войти
                        </button>
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default GuestRegistration;