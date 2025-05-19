import React,  { useState, useEffect }  from 'react';
import { useNavigate } from 'react-router-dom';
import { db, addDoc, collection, getAuth} from '../Firebase/config';
import { doc, updateDoc, increment } from 'firebase/firestore';
import { fetchSignInMethodsForEmail } from 'firebase/auth';
import axios from "axios";



function CreateSurvey() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [questions, setQuestions] = useState([]);
  const [endDate, setEndDate] = useState('');
  const [error, setError] = useState(''); 
  const [errorCount, setErrorCount] = useState(0);
  const [description, setDescription] = useState('');
  const [eventType, setEventType] = useState('other');
  const [location, setLocation] = useState('');
  const [googleMapsLink, setGoogleMapsLink] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [copySuccess, setCopySuccess] = useState('');
  const [emails, setEmails] = useState([]);

  const auth = getAuth();

  useEffect(() => {
    if (error) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [errorCount]);

  const reportError = (msg) => {
    setError(msg);
    setErrorCount((c) => c + 1);
  };

  const tryAddEmail = async (email) => {
    if (!email) {
      reportError('Lütfen bir e‑posta giriniz');
      return false;
    }
    try {
      await fetchSignInMethodsForEmail(auth, email);
    } catch (err) {
      if (err.code === 'auth/invalid-email') {
        reportError('Geçersiz e‑posta formatı');
        return false;
      }
    }

    if (emails.includes(email)) {
      reportError('Bu e‑posta zaten listede');
      return false;
    }

    setEmails([...emails, email]);
    reportError('');
    return true;
  };


  const eventTypes = [
    { value: 'Parti/Kutlama', label: 'Parti/Kutlama' },
    { value: 'Piknik', label: 'Piknik' },
    { value: 'Akşam Yemeği', label: 'Akşam Yemeği' },
    { value: 'Film/Sinema', label: 'Film/Sinema' },
    { value: 'Oyun Gecesi', label: 'Oyun Gecesi' },
    { value: 'Diğer', label: 'Diğer' }
  ];

  function isValidGoogleMaps(input) {
    const iframeMatch = input.match(/<iframe[^>]+src=["']([^"']+)["']/i);
    const urlString = iframeMatch ? iframeMatch[1] : input.trim();

    try {
      const url = new URL(urlString);
      return (
        url.hostname.endsWith('google.com') &&
        url.pathname.startsWith('/maps')
      );
    } catch {
      return false;
    }
  }
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    reportError('');
    

    if (!title.trim()) {
      reportError('Lütfen etkinlik başlığı girin');
      return;
    }

    if (emails.length === 0) {
    reportError('Lütfen en az bir e‑posta ekleyin');
    return;
  }
  if (!googleMapsLink.trim()) {
      reportError('Lütfen bir Google Maps linki veya iframe kodu girin');
      return;
    }

  if (!isValidGoogleMaps(googleMapsLink)) {
      reportError('Lütfen geçerli bir Google Maps linki veya iframe kodu girin');
      return;
    }

const totalOptionsCount = questions.reduce((acc, question) => acc + question.options.length, 0);

if (totalOptionsCount < 2) {
  reportError('Etkinlik için en 2 zaman dilimi seçmelisiniz.');
  return;
}
const areDatesValid = questions.every(question =>
  question.options.every(option => {
    if (!option) return false;
    const optionDate = new Date(option);
    if (isNaN(optionDate.getTime())) return false;
    
    if (endDate) {
      const minDate = new Date(endDate);
      if (optionDate < minDate) return false;
    }
    
    return true;
  })
)
  && questions.every(question => {
  const opts = question.options;
  const timestamps = opts.map(opt => new Date(opt).getTime());
  return new Set(timestamps).size === timestamps.length;
  });
  ;

if (!areDatesValid) {
  reportError('Lütfen geçerli tüm tarih ve saatleri giriniz. Tekrar eden ve Oy kullanma tarihinden önceki seçenekler geçersizdir.');
  return;
}

    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) {
      reportError('Lütfen giriş yapın');
      return;
    }

    const surveyData = {
  id: Date.now().toString(),
  title,
  description,
  eventType,
  eventDate,
  location,
  questions,
  endDate,
  googleMapsLink,
  createdAt: new Date().toISOString(),
  userId: user.uid,
  emails,
  cevap1: 0,
  cevap2: 0,
  cevap3: 0,
  cevap4: 0,
  cevap5: 0,
};


    try {
      const docRef = await addDoc(collection(db, `users/${user.uid}/surveys`), surveyData);
      console.log("Anket başarıyla kaydedildi:", docRef.id);

      const userDocRef = doc(db, "users", user.uid);
      await updateDoc(userDocRef, {surveyCount: increment(1)});

      const Link = `${window.location.origin}/users/${user.uid}/surveys/${docRef.id}`;
      console.log("ZORTTİRİ ZORT:", Link)
      const sendSurveyEmails = async () => {
        const placeholderLink = Link;
      
        try {
          const response = await axios.post("/api/send-email", {
            recipients: emails,
            subject: "Yeni Anket Linkiniz",
            message: `Merhaba, anketinize şu link üzerinden erişebilirsiniz: ${placeholderLink}`,
          });
          console.log(response.data.message);
        } catch (error) {
          console.error("E-posta gönderimi başarısız:", error.response?.data || error.message);
        }
      };
      const handleSendEmails = () => {
        sendSurveyEmails();
      };
      handleSendEmails(Link);

      alert('Etkinlik başarıyla oluşturuldu!');
      navigate('/surveys');
    } catch (error) {
      console.error("Hata oluştu:", error);
      reportError('Anket kaydedilirken bir hata oluştu');
    }
  };

  const addQuestion = () => {
    if (questions.length < 2) {
      let newQuestion;

      const initialOption = "";
      
      if (!eventDate) {
        newQuestion = {
          id: Date.now(),
          type: 'datetime',
          options: [initialOption],
          allowMultiple: false
        };
      } else {
        newQuestion = {
          id: Date.now(),
          type: 'time',
          options: [initialOption],
          allowMultiple: false
        };
      }
      
      setQuestions([...questions, newQuestion]);
    }
  };

  const addOption = (questionIndex) => {
    const newQuestions = [...questions];
    if (newQuestions[questionIndex].options.length < 5) {
      newQuestions[questionIndex].options.push('');
      setQuestions(newQuestions);
    }
  };

  const removeOption = (questionIndex, optionIndex) => {
    const newQuestions = [...questions];
    newQuestions[questionIndex].options.splice(optionIndex, 1);

     if (newQuestions[questionIndex].options.length === 0) {
    newQuestions.splice(questionIndex, 1);
  }

    setQuestions(newQuestions);
  };

  const copyLink = (surveyId) => {
    const link = `${window.location.origin}/survey/${surveyId}`;
    navigator.clipboard.writeText(link)
      .then(() => {
        setCopySuccess('Link kopyalandı!');
        setTimeout(() => setCopySuccess(''), 2000);
      })
      .catch(() => setCopySuccess('Kopyalama başarısız'));
  };

  return (
    <div className="create-survey">
      <h2>Yeni Etkinlik Oluştur</h2>
      {error && <div className="error-message">{error}</div>}
      {copySuccess && <div className="copy-success">{copySuccess}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="event-header-group">
          <div className="form-group">
            <label>Etkinlik Başlığı:</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label>Etkinlik Açıklaması:</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="form-input"
              placeholder="Etkinlik hakkında detaylı bilgi verin..."
              rows="4"
            />
          </div>
        </div>

        <div className="form-group">
          <label>Etkinlik Türü:</label>
          <select 
            value={eventType}
            onChange={(e) => setEventType(e.target.value)}
            className="form-input"
          >
            {eventTypes.map(type => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Etkinlik Konumu:</label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="form-input"
            placeholder="Etkinlik nerede gerçekleşecek?"
            required
          />
        </div>

        <div className="form-group">
          <label>Google Maps Link:</label>
          <textarea
            value={googleMapsLink}
            onChange={(e) => setGoogleMapsLink(e.target.value)}
            className="form-input"
            placeholder="Google Maps'ten aldığınız iframe kodunu buraya yapıştırın"
            rows="4"
          />
        </div>

        <div className="form-group">
          <label>Oy Kullanmak İçin Son Tarih:</label>
          <input
            type="datetime-local"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            min={new Date().toISOString().slice(0, 16)}
            className="form-input"
            required
          />
        </div>
        <div className="form-group">
  <label>E-posta Listesi:</label>
  <div className="email-input-container">
      <input
        type="email"
        placeholder="E-posta adresi girin"
        className="form-input"
        onKeyDown={async (e) => {
          if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            const email = e.target.value.trim().replace(/,$/, '');
            const ok = await tryAddEmail(email);
            if (ok) e.target.value = '';
          }
        }}
      />
        <button
    type="button"
    className="add-email-button"
    style={{ marginTop: '4px' }}
    onClick={async (e) => {
      const emailInput = e.target.closest('.email-input-container').querySelector('input');
      const email = emailInput.value.trim();
      if (email) {
        const ok = await tryAddEmail(email);
        if (ok) {
          emailInput.value = '';
        }
      }
    }}
  >
   Ekle
  </button>
    </div>
  {emails.length > 0 && (
    <ul className="email-list">
      {emails.map((email, index) => (
        <li key={index}>
          {email}
          <button
            type="button"
            onClick={() => {
              setEmails(emails.filter((_, i) => i !== index));
            }}
          >
            ×
          </button>
        </li>
      ))}
    </ul>
  )}
</div>

        <div className="questions-section">
  <h3>Seçenekler</h3>
  
  {questions.length === 0 ? (
    <div className="empty-question-message">
      Henüz seçenek eklenmedi. Aşağıdan seçenek ekleyerek başlayabilirsiniz.
    </div>
  ) : (
    questions.map((question, qIndex) => (
      <div key={question.id} className="question-card">
        <div className="question-header">
          <h4>{question.text}</h4>
          <div className="question-actions">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={question.allowMultiple}
                onChange={(e) => {
                  const newQuestions = [...questions];
                  newQuestions[qIndex].allowMultiple = e.target.checked;
                  setQuestions(newQuestions);
                }}
              />
              Birden fazla seçim yapılabilsin
            </label>
          </div>
        </div>

        {question.options.length > 0 && (
          <div className="options-container">
            {question.options.map((option, oIndex) => (
              <div key={oIndex} className="option-item">
                {question.type === 'datetime' ? (
                  <div className="datetime-inputs">
                    <input
                      type="date"
                      value={option.split('T')[0] || ''}
                      onChange={(e) => {
                        const newQuestions = [...questions];
                        const time = option.split('T')[1] || '00:00';
                        newQuestions[qIndex].options[oIndex] = `${e.target.value}T${time}`;
                        setQuestions(newQuestions);
                      }}
                      className="form-input"
                      min={new Date().toISOString().split('T')[0]}
                    />
                    <input
                      type="time"
                      value={option.split('T')[1] || ''}
                      onChange={(e) => {
                        const newQuestions = [...questions];
                        const date = option.split('T')[0] || new Date().toISOString().split('T')[0];
                        newQuestions[qIndex].options[oIndex] = `${date}T${e.target.value}`;
                        setQuestions(newQuestions);
                      }}
                      className="form-input"
                    />
                  </div>
                ) : (
                  <input
                    type="time"
                    value={option}
                    onChange={(e) => {
                      const newQuestions = [...questions];
                      newQuestions[qIndex].options[oIndex] = e.target.value;
                      setQuestions(newQuestions);
                    }}
                    className="form-input"
                  />
                )}
                <button
                  type="button"
                  className="delete-option-button"
                  onClick={() => removeOption(qIndex, oIndex)}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    ))
  )}
</div>
        <div className="buttons-container">
        <button
        type="button"
        className="add-option-button"
        onClick={() => {if (questions.length === 0) {
                addQuestion();
                setTimeout(() => addOption(0), 0);} 
                else {
                addOption(0);
              }
            }}>Etkinlik İçin Uygun Zaman Seçenekleri Ekle. (En fazla 5 tane ekleyebilirsiniz.)
          </button>
          <button type="submit" className="submit-button">
            Etkinliği Oluştur
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreateSurvey; 