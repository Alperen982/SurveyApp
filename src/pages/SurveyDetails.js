import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db, doc, getDoc, updateDoc, deleteDoc, getAuth } from '../Firebase/config';
import { onAuthStateChanged } from 'firebase/auth';

function SurveyDetails() {
    const [survey, setSurvey] = useState(null);
    const [error, setError] = useState('');
    const [userAnswers, setUserAnswers] = useState({});
    const [isSurveyClosed, setIsSurveyClosed] = useState(false);
    const [isCreator, setIsCreator] = useState(false);
    const [hasAnswered, setHasAnswered] = useState(false);
    const [multipleAnswerError, setMultipleAnswerError] = useState(false);
    const { userId, surveyId } = useParams();
    const navigate = useNavigate();

    const auth = getAuth();
    const [currentUserId, setCurrentUserId] = useState(undefined);
    const [authLoading, setAuthLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setCurrentUserId(user ? user.uid : null);
            setAuthLoading(false);
        });
        return () => unsubscribe();
    }, [auth]);

    function formatDate(dateStr, eventDate) {
        let date;
        
        if (!dateStr.includes("-")) {
            
            if (eventDate) {
                const [hour, minute] = dateStr.split(":"); 
                const eventDateParts = eventDate.split("-"); 
                date = new Date(eventDateParts[0], eventDateParts[1] - 1, eventDateParts[2], hour, minute); 
            } else {
                const today = new Date();
                const [hour, minute] = dateStr.split(":");
                date = new Date(today.getFullYear(), today.getMonth(), today.getDate(), hour, minute);
            }
        } else {
            date = new Date(dateStr);
        }
    
        if (isNaN(date)) {
            return "Geçersiz Tarih";
        }
    
        return date.toLocaleString("tr-TR", { 
            weekday: 'short', 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric', 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    }

    useEffect(() => {
        if (authLoading) return;

        if (currentUserId === null) {
            setError('Etkinliği Görüntülemek İçin Önce Giriş Yapmalısınız!');
            const next = encodeURIComponent(window.location.pathname);
            navigate(`/login?next=${next}`);
            return;
        }

        const fetchSurveyDetails = async () => {
            if (!userId || !surveyId) {
                setError('Etkinlik ID veya kullanıcı ID eksik');
                return;
            }

            try {
                const surveyDocRef = doc(db, `users/${userId}/surveys/${surveyId}`);
                const surveyDoc = await getDoc(surveyDocRef);

                if (!surveyDoc.exists()) {
                    setError('Etkinlik bulunamadı');
                    return;
                }

                const surveyData = surveyDoc.data();
                surveyData.allowMultiple = surveyData.questions?.[0]?.allowMultiple ?? false;
                setSurvey(surveyData);

                if (surveyData.userAnswers?.[currentUserId]) {
                    setHasAnswered(true);
                    setUserAnswers(surveyData.userAnswers[currentUserId]);
                }

                if (surveyData.endDate && new Date(surveyData.endDate) < new Date()) {
                    setIsSurveyClosed(true);
                }

                if (surveyData.userId === currentUserId) {
                    setIsCreator(true);
                }
            } catch (err) {
                console.error('Veri çekme hatası:', err);
                setError('Etkinlik verisi alınırken bir hata oluştu');
            }
        };

        fetchSurveyDetails();
    }, [userId, surveyId, currentUserId, authLoading, navigate]);

    const handleAnswerChange = (qIndex, oIndex) => {
        if (hasAnswered) {
            setError('Zaten oy kullandınız');
            return;
        }

        const newValue = userAnswers[`Q${qIndex}Option${oIndex}`] === 1 ? 0 : 1;
        setUserAnswers((prevAnswers) => ({
            ...prevAnswers,
            [`Q${qIndex}Option${oIndex}`]: newValue,
        }));

        console.log(`Q${qIndex + 1} Option ${oIndex} value: ${newValue}`);
    };

    const handleSubmit = async () => {

        if (!userId) {
            console.error("Kullanıcı giriş yapmamış.");
            return;
        }

        const isAnyOptionSelected = Object.values(userAnswers).some((value) => value === 1);

        if (!isAnyOptionSelected) {
            setError('En az bir seçenek seçmelisiniz!');
            return;
        }

        const selectedOptionsCount = Object.values(userAnswers).filter(value => value === 1).length;


        if (survey.allowMultiple === false && selectedOptionsCount > 1) {
            console.log('Birden fazla cevap seçildi, hata gösterilecek');
            setMultipleAnswerError(true);
            return;
        } else {
            console.log('Hata durumu sıfırlandı');
            setMultipleAnswerError(false);
        }

        console.log("Tüm Seçilen Cevaplar:", userAnswers);

        try {
            const updatedSurveyData = { ...survey };

            Object.entries(userAnswers).forEach(([key, value]) => {
                const match = key.match(/^Q(\d+)Option(\d+)$/);

                if (match) {
                    const questionIndex = match[1];
                    const optionIndex = match[2];
                    const answerKey = `cevap${parseInt(optionIndex) + 1}`; 

                    if (value === 1) {
                        if (updatedSurveyData[answerKey]) {
                            updatedSurveyData[answerKey] += 1;
                        } else {
                            updatedSurveyData[answerKey] = 1;
                        }
                    }
                }
            });

            
            const updatedUserAnswers = {
                ...(survey.userAnswers || {}),
                [currentUserId]: userAnswers, 
            };

            const surveyDocRef = doc(db, `users/${userId}/surveys/${surveyId}`);
            await updateDoc(surveyDocRef, {
                ...updatedSurveyData, 
                userAnswers: updatedUserAnswers, 
            });

            setSurvey(updatedSurveyData);
            setHasAnswered(true);
            setError('Cevaplarınız kaydedildi!');
        } catch (error) {
            console.error('Cevap kaydetme hatası:', error);
            setError('Cevaplarınız kaydedilirken bir hata oluştu');
        }
    };

    const deleteSurvey = async () => {
        try {
            const surveyDocRef = doc(db, `users/${userId}/surveys/${surveyId}`);
            await deleteDoc(surveyDocRef);
            navigate('/surveys');
        } catch (error) {
            console.error('Etkinlik silme hatası:', error);
            setError('Etkinlik silinirken bir hata oluştu');
        }
    };

    if (error) {
        return <div>{error}</div>;
    }

    if (!survey) {
        return <div>Yükleniyor...</div>;
    }

    return (
        <div className="survey-container-inside">
            <div className="survey-box">
                <h2 className="survey-title">{survey.title}</h2>
                <p style={{ color: '#fff' }}>{survey.description || 'Açıklama mevcut değil'}</p>

                {survey.questions && Array.isArray(survey.questions) && survey.questions.length > 0 ? (
    <div>
        {survey.location && (
            <p className="centered-text">
                Konum: {survey.location}
            </p>
        )}
        {survey.eventType && (
            <p className="centered-text">
                Etkinlik Türü: {survey.eventType.charAt(0).toUpperCase() + survey.eventType.slice(1)}
            </p>
        )}
        {survey.googleMapsLink && (
            <p className="centered-text">
                Haritayı Görüntüle:{" "}
                <a
                    href={survey.googleMapsLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="google-maps-link"
                >
                    Google Maps Link
                </a>
            </p>
        )}

        {survey.questions.map((question, qIndex) => (
            <div key={qIndex} className="survey-question">
                <h4 className="question-text">{question.text}</h4>
                <div className="options-container">
                    {question.options.map((option, oIndex) => {
                        const count = survey[`cevap${oIndex + 1}`] || 0;
                        const formattedDate = formatDate(option);

                        return (
                            <label key={oIndex} className="survey-option-label">
                                <input
                                    type="checkbox"
                                    name={`question-${qIndex}`}
                                    value={oIndex}
                                    onChange={() => handleAnswerChange(qIndex, oIndex)}
                                    className="option-input"
                                    disabled={hasAnswered}
                                />
                                <span className="survey-option-text">{formattedDate}</span> 
                                <span className="survey-option-count">({count} kez seçildi)</span> 
                            </label>
                            );
                            })}
                            </div>
                        </div>
                    ))}
                        </div>
                    ) : (
                        <div>Henüz soru bulunmamaktadır.</div>
                    )}
                {multipleAnswerError && (
                    <div style={{ color: 'red' }}>
                        Sadece bir cevap seçmelisiniz!
                    </div>
                )}

                {!isSurveyClosed && !hasAnswered && (
                    <div>
                        <button
                            className="survey-button"
                            onClick={handleSubmit}
                        >
                            Cevapları Kaydet
                        </button>
                    </div>
                )}

                {isCreator && (
                    <div>
                        <button className="survey-button delete-button" onClick={deleteSurvey}>
                            Etkinliği Sil
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default SurveyDetails;
