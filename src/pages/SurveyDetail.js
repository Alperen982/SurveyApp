import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import React from 'react';

function SurveyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [survey, setSurvey] = useState(null);
  const [userAnswers, setUserAnswers] = useState({});
  const [error, setError] = useState('');

  useEffect(() => {
    // localStorage'dan anketi al
    const savedSurveys = JSON.parse(localStorage.getItem('surveys') || '[]');
    const currentSurvey = savedSurveys.find(s => s.id === id);
    
    if (currentSurvey) {
      setSurvey(currentSurvey);
    } else {
      setError('Anket bulunamadı');
    }
  }, [id]);

  const handleAnswerSelect = (questionId, answer, allowMultiple) => {
    setUserAnswers(prev => {
      if (allowMultiple) {
        const currentAnswers = prev[questionId] || [];
        if (currentAnswers.includes(answer)) {
          // Eğer seçenek zaten seçiliyse kaldır
          return {
            ...prev,
            [questionId]: currentAnswers.filter(a => a !== answer)
          };
        } else {
          // Seçenek seçili değilse ekle
          return {
            ...prev,
            [questionId]: [...currentAnswers, answer]
          };
        }
      } else {
        // Tekli seçim için
        return {
          ...prev,
          [questionId]: answer
        };
      }
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Cevapları kaydet
    const savedResponses = JSON.parse(localStorage.getItem(`survey_responses_${id}`) || '[]');
    savedResponses.push({
      answers: userAnswers,
      submittedAt: new Date().toISOString()
    });
    localStorage.setItem(`survey_responses_${id}`, JSON.stringify(savedResponses));

    alert('Cevaplarınız kaydedildi!');
    navigate('/');
  };

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (!survey) {
    return <div className="loading">Yükleniyor...</div>;
  }

  const isExpired = new Date(survey.endDate) < new Date();

  return (
    <div className="survey-detail">
      <div className="survey-detail-content">
        <div className="survey-detail-header">
          <h2>{survey.title}</h2>
          <span className="event-type">{survey.eventType}</span>
        </div>

        {survey.description && (
          <p className="survey-detail-description">{survey.description}</p>
        )}

        <div className="survey-detail-info">
          {survey.location && (
            <div className="survey-detail-location">
              <div className="location-header">
                <i className="fas fa-map-marker-alt"></i>
                <span>{survey.location}</span>
              </div>
              {survey.googleMapsLink && (
                <div className="maps-container">
                  <div dangerouslySetInnerHTML={{ __html: survey.googleMapsLink }} />
                </div>
              )}
            </div>
          )}

          {survey.eventDate && (
            <div className="survey-detail-date">
              <i className="far fa-calendar"></i>
              <span>Belirlenen Etkinlik Tarihi: {new Date(survey.eventDate).toLocaleDateString('tr-TR')}</span>
            </div>
          )}
        </div>

        {!isExpired && (
          <form onSubmit={handleSubmit}>
            {survey.questions.map((question) => (
              <div 
                key={question.id} 
                className="question-box"
                data-type={question.type}
              >
                <h3>{question.text}</h3>
                <div className="time-options">
                  {question.options.map((option, index) => (
                    <label key={index} className="time-option">
                      <input
                        type={question.allowMultiple ? "checkbox" : "radio"}
                        name={`question-${question.id}`}
                        value={option}
                        checked={question.allowMultiple 
                          ? userAnswers[question.id]?.includes(option)
                          : userAnswers[question.id] === option}
                        onChange={() => handleAnswerSelect(question.id, option, question.allowMultiple)}
                        required={!question.allowMultiple}
                      />
                      <span className="time-option-label">
                        {question.type === 'datetime' 
                          ? new Date(option).toLocaleString('tr-TR')
                          : option}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </form>
        )}
      </div>

      <div className="survey-detail-footer">
        <div className="deadline-info">
          Son Katılım: {new Date(survey.endDate).toLocaleString('tr-TR')}
        </div>
        {!isExpired && (
          <button type="submit" className="submit-answers" onClick={handleSubmit}>
            Cevapları Gönder
          </button>
        )}
      </div>
    </div>
  );
}

export default SurveyDetail; 