import React, { useState, useEffect } from 'react';
import { db, collection, getDocs, getAuth } from '../Firebase/config';
import { Link } from 'react-router-dom'; 

function Surveys() {
    const [surveys, setSurveys] = useState([]); 
    const [error, setError] = useState(''); 
    const auth = getAuth();
    const user = auth.currentUser;
    const currentUserId = user ? user.uid : null;

    useEffect(() => {
        const fetchSurveys = async () => {
            try {
                const surveysCollectionRef = collection(db, `users/${user.uid}/surveys`);
                const surveySnapshot = await getDocs(surveysCollectionRef);
                const surveysList = surveySnapshot.docs.map(doc => {
                    const documentKey = doc._key.path.segments;
                    const surveyId = documentKey[documentKey.length - 1];
                    return {
                        cid: surveyId,
                        ...doc.data()
                    };
                });

                const sorted = surveysList.sort((a, b) => {
        const da = a.endDate ? new Date(a.endDate) : new Date(a.createdAt);
        const db = b.endDate ? new Date(b.endDate) : new Date(b.createdAt);
        return da - db;
      });

                setSurveys(sorted);
            } catch (error) {
                console.error("Veri çekme hatası:", error);
                setError('Etkinlikler alınırken bir hata oluştu');
            }
        };

        fetchSurveys(); 
    }, [user]);

    if (error) {
        return <div>{error}</div>; 
    }

    return (
        <div className="surveys-page">
            <h2>Oluşturduğun Etkinlikler</h2>
            {surveys.length === 0 ? (
                <p>Henüz oluşturduğunuz etkinlik yok.</p> 
            ) : (
                <div className="survey-container">
                    {surveys.map(survey => (
                        <div key={survey.cid} className="survey-card">
                            <Link to={`/users/${user.uid}/surveys/${survey.cid}`} className="survey-link">
                                <h3 className="survey-title">{survey.title}</h3>
                                {survey.endDate && (
                                    <p className="survey-date">
                                        Bitiş Tarihi: {new Date(survey.endDate).toLocaleString('tr-TR', {
                                            weekday: 'short', 
                                            year: 'numeric', 
                                            month: 'long', 
                                            day: 'numeric',
                                            hour: '2-digit', 
                                            minute: '2-digit', 
                                        })}
                                    </p>
                                )}
                            </Link>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default Surveys;