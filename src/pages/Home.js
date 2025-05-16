import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import React from 'react';
import { Cloudinary } from '@cloudinary/url-gen';
import { auto } from '@cloudinary/url-gen/actions/resize';
import { autoGravity } from '@cloudinary/url-gen/qualifiers/gravity';
import { AdvancedImage } from '@cloudinary/react';
import { fill } from "@cloudinary/url-gen/actions/resize";

function Home() {
  const [surveys, setSurveys] = useState([]);
  const [copySuccess, setCopySuccess] = useState({});

  const eventTypes = {
    party: 'Parti/Kutlama',
    picnic: 'Piknik',
    dinner: 'Akşam Yemeği',
    movie: 'Film/Sinema',
    game: 'Oyun Gecesi',
    other: 'Diğer'
  };

  useEffect(() => {
    // Yerel depolamadan anketleri al ve aktif olanları filtrele
    const savedSurveys = JSON.parse(localStorage.getItem('surveys') || '[]');
    const activeSurveys = savedSurveys.filter(survey => 
      new Date(survey.endDate) > new Date()
    );
    setSurveys(activeSurveys);
  }, []);

  const copyLink = (surveyId) => {
    const link = `${window.location.origin}/survey/${surveyId}`;
    navigator.clipboard.writeText(link)
      .then(() => {
        setCopySuccess({ ...copySuccess, [surveyId]: true });
        setTimeout(() => {
          setCopySuccess({ ...copySuccess, [surveyId]: false });
        }, 2000);
      })
      .catch(() => alert('Link kopyalama başarısız'));
  };

  const deleteSurvey = (surveyId) => {
    if (window.confirm('Bu etkinliği silmek istediğinize emin misiniz?')) {
      const savedSurveys = JSON.parse(localStorage.getItem('surveys') || '[]');
      const updatedSurveys = savedSurveys.filter(s => s.id !== surveyId);
      localStorage.setItem('surveys', JSON.stringify(updatedSurveys));
      
      // Aktif anketleri güncelle
      const activeSurveys = updatedSurveys.filter(survey => 
        new Date(survey.endDate) > new Date()
      );
      setSurveys(activeSurveys);
    }
  };

  return (
    <div className="home">
      {surveys.length === 0 ? (
        <div className="no-surveys">
          <p>Henüz oluşturulmuş bir etkinlik anketi bulunmuyor.</p>
        </div>
      ) : (
        <div className="surveys-grid">
          {surveys.map(survey => (
            <div key={survey.id} className="survey-card">
              <button 
                className="delete-survey-button"
                onClick={() => deleteSurvey(survey.id)}
                title="Etkinliği Sil"
              >
                ×
              </button>
              <div className="survey-card-content">
                <div className="survey-card-header">
                  <h3>{survey.title}</h3>
                  <span className="event-type">{eventTypes[survey.eventType] || survey.eventType}</span>
                </div>

                {survey.description && (
                  <p className="survey-description">{survey.description}</p>
                )}

                <div className="event-info">
                  {survey.eventDate && (
                    <div className="event-date">
                      <i className="far fa-calendar"></i>
                      <span>Etkinlik Tarihi: {new Date(survey.eventDate).toLocaleDateString('tr-TR')}</span>
                    </div>
                  )}
                  
                  {survey.location && (
                    <div className="location-info">
                      <i className="fas fa-map-marker-alt"></i>
                      <span title={survey.location}>
                        Konum: {survey.location}
                      </span>
                      {survey.googleMapsLink && (
                        <a 
                          href={survey.googleMapsLink} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="maps-link"
                        >
                          <i className="fas fa-external-link-alt"></i>
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="survey-footer">
                <span className="deadline">
                  Son Katılım: {new Date(survey.endDate).toLocaleDateString('tr-TR')}
                </span>
                <div className="survey-actions">
                  <button 
                    className="copy-link-button"
                    onClick={() => copyLink(survey.id)}
                  >
                    {copySuccess[survey.id] ? (
                      <>
                        <i className="fas fa-check"></i>
                        Link Kopyalandı
                      </>
                    ) : (
                      <>
                        <i className="fas fa-link"></i>
                        Linki Kopyala
                      </>
                    )}
                  </button>
                  <Link to={`/survey/${survey.id}`} className="view-button">
                    Ankete Katıl
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Home; 