import { useState, useEffect } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import { configApi } from "../utils/Api";
import CurrentUserContext from "../contexts/CurrentUserContext";
import Header from "./Header";
import Main from "./Main";
import Footer from "./Footer";
import ImagePopup from "./ImagePopup";
import EditProfilePopup from "./EditProfilePopup";
import PopupWithConfirmation from "./PopupWithConfirmation";
import EditAvatarPopup from "./EditAvatarPopup";
import AddPlacePopup from "./AddPlacePopup";
import Login from "./Login";
import Register from "./Register";
import ProtectedRoute from "./ProtectedRoute";
import InfoTooltip from "./InfoTooltip";
import { register, login, checkToken } from "../utils/Auth";

function App() {
  const navigate = useNavigate();
  const [cards, setCards] = useState([]);
  const [userEmail, setUserEmail] = useState("");
  const [popupMessageStatus, setPopupMessageStatus] = useState({
    message: "",
  });
  const [currentUser, setCurrentUser] = useState({});
  const [selectedCard, setSelectedCard] = useState({});
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAuthStatus, setIsAuthStatus] = useState(false);
  const [isProcessStatus, setIsProcessStatus] = useState(false);
  const [isImagePopupOpen, setIsImagePopupOpen] = useState(false);
  const [isInfoTooltipOpen, setIsInfoTooltipOpen] = useState(false);
  const [isAddPlacePopupOpen, setIsAddPlacePopupOpen] = useState(false);
  const [isEditAvatarPopupOpen, setIsEditAvatarPopupOpen] = useState(false);
  const [isEditProfilePopupOpen, setIsEditProfilePopupOpen] = useState(false);
  const [isConfirmPlacePopupOpen, setIsConfirmPlacePopupOpen] = useState(false);

  useEffect(() => {
    if (isLoggedIn) {
      Promise.all([configApi.getUserData(), configApi.getInitialCards()])
        .then(([userData, cardsData]) => {
          setCurrentUser(userData);
          setCards(cardsData);
        })
        .catch((err) => console.log(err));
    }
  }, [isLoggedIn]);

  useEffect(() => {
    function handleClosePopup(e) {
      if (e.target.classList.contains("popup_opened") || e.key === "Escape") {
        closeAllPopups();
      }
    }

    document.addEventListener("keydown", handleClosePopup);
    document.addEventListener("mousedown", handleClosePopup);

    return () => {
      document.removeEventListener("keydown", handleClosePopup);
      document.removeEventListener("mousedown", handleClosePopup);
    };
  }, []);

  useEffect(() => {
    const jwt = localStorage.getItem("jwt");
    if (jwt) {
      checkToken(jwt)
        .then((res) => {
          setUserEmail(res.data.email);
          setIsLoggedIn(true);
          navigate("/");
        })
        .catch((err) => console.log(err));
    }
  }, [navigate]);

  function handleSignOut() {
    localStorage.removeItem("jwt");
    setUserEmail("");
    setIsLoggedIn(false);
  }

  function handleEditAvatarClick() {
    setIsEditAvatarPopupOpen(true);
  }

  function handleEditProfileClick() {
    setIsEditProfilePopupOpen(true);
  }

  function handleAddPlaceClick() {
    setIsAddPlacePopupOpen(true);
  }

  function handleDeleteCardClick(card) {
    setIsConfirmPlacePopupOpen(true);
    setSelectedCard(card);
  }

  function handleCardClick(card) {
    setSelectedCard(card);
    setIsImagePopupOpen(true);
  }

  function closeAllPopups() {
    setIsEditAvatarPopupOpen(false);
    setIsEditProfilePopupOpen(false);
    setIsAddPlacePopupOpen(false);
    setIsImagePopupOpen(false);
    setIsConfirmPlacePopupOpen(false);
    setIsInfoTooltipOpen(false);
  }

  function handleCardLike(card) {
    const isLiked = card.likes.some((i) => i._id === currentUser._id);

    configApi
      .changeLikeCardStatus(card._id, !isLiked)
      .then((newCard) => {
        setCards((state) =>
          state.map((c) => (c._id === card._id ? newCard : c))
        );
      })
      .catch((err) => console.log(err));
  }

  function handleUpdateUser(userData) {
    setIsProcessStatus(true);
    configApi
      .setUserData(userData)
      .then((res) => {
        setCurrentUser(res);
        closeAllPopups();
      })
      .catch((err) => console.log(err))
      .finally(() => setIsProcessStatus(false));
  }

  function handleCardDelete(card) {
    setIsProcessStatus(true);
    configApi
      .deleteCard(card._id)
      .then(() => {
        setCards((arr) => arr.filter((item) => card._id !== item._id));
        closeAllPopups();
      })
      .catch((err) => console.log(err))
      .finally(() => setIsProcessStatus(false));
  }

  function handleUpdateAvatar(data) {
    setIsProcessStatus(true);
    configApi
      .changeAvatar(data)
      .then((res) => {
        setCurrentUser(res);
        closeAllPopups();
      })
      .catch((err) => console.log(err))
      .finally(() => setIsProcessStatus(false));
  }

  function handleAddPlaceSubmit(cardData) {
    configApi
      .addNewCard(cardData)
      .then((newCard) => {
        setCards([newCard, ...cards]);
        closeAllPopups();
      })
      .catch((err) => console.log(err))
      .finally(() => setIsProcessStatus(false));
  }

  function handleRegister(password, email) {
    setIsProcessStatus(true);
    register(password, email)
      .then(() => {
        setIsAuthStatus(true);
        setPopupMessageStatus({
          text: "Вы успешно зарегистрировались!",
        });
        navigate("/sign-in");
      })
      .catch((err) => {
        console.log(err);
        setPopupMessageStatus({
          text: "Что-то пошло не так! Попробуйте ещё раз.",
        });
        setIsAuthStatus(false);
      })
      .finally(() => {
        setIsInfoTooltipOpen(true);
        setIsProcessStatus(false);
      });
  }

  function handleLogin(password, email) {
    setIsProcessStatus(true);
    login(password, email)
      .then((res) => {
        setIsLoggedIn(true);
        setUserEmail(email);
        navigate("/");
        localStorage.setItem("jwt", res.token);
      })
      .catch((err) => {
        console.log(err);
        setIsAuthStatus(false);
        setPopupMessageStatus({
          text: "Что-то пошло не так! Попробуйте ещё раз.",
        });
        setIsInfoTooltipOpen(true);
      })
      .finally(() => setIsProcessStatus(false));
  }

  return (
    <CurrentUserContext.Provider value={currentUser}>
      <div className="page">
        <div className="page__content">
          <Header email={userEmail} logout={handleSignOut} />
          <Routes>
            <Route
              path="/"
              element={
                <ProtectedRoute
                  isLoggedIn={isLoggedIn}
                  Component={Main}
                  onEditAvatar={handleEditAvatarClick}
                  onEditProfile={handleEditProfileClick}
                  onAddPlace={handleAddPlaceClick}
                  onCardClick={handleCardClick}
                  onDeleteClick={handleDeleteCardClick}
                  onCardLike={handleCardLike}
                  cards={cards}
                />
              }
            />
            <Route
              path="/sign-up"
              element={
                <Register
                  register={handleRegister}
                  isLoggedIn={isLoggedIn}
                  isLoading={isProcessStatus}
                />
              }
            />
            <Route
              path="/sign-in"
              element={
                <Login
                  login={handleLogin}
                  isLoggedIn={isLoggedIn}
                  isLoading={isProcessStatus}
                />
              }
            />
          </Routes>
          <Footer />
          <EditAvatarPopup
            isOpen={isEditAvatarPopupOpen}
            onClose={closeAllPopups}
            onUpdateAvatar={handleUpdateAvatar}
            isLoading={isProcessStatus}
          />
          <EditProfilePopup
            isOpen={isEditProfilePopupOpen}
            onClose={closeAllPopups}
            onUpdateUser={handleUpdateUser}
            isLoading={isProcessStatus}
          />
          <AddPlacePopup
            isOpen={isAddPlacePopupOpen}
            onClose={closeAllPopups}
            onAddPlace={handleAddPlaceSubmit}
            isLoading={isProcessStatus}
          />
          <PopupWithConfirmation
            isOpen={isConfirmPlacePopupOpen}
            onClose={closeAllPopups}
            onSubmit={handleCardDelete}
            card={selectedCard}
            isLoading={isProcessStatus}
          />
          <ImagePopup
            card={selectedCard}
            onClose={closeAllPopups}
            isOpen={isImagePopupOpen}
          />
          <InfoTooltip
            onClose={closeAllPopups}
            isOpen={isInfoTooltipOpen}
            isAuthStatus={isAuthStatus}
            message={popupMessageStatus}
          />
        </div>
      </div>
    </CurrentUserContext.Provider>
  );
}

export default App;
