import React from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, addDoc, collection, getAuth} from '../Firebase/config';
import { doc, updateDoc, increment } from 'firebase/firestore';
import axios from "axios";



function CreateSurvey() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [questions, setQuestions] = useState([]);
  const [endDate, setEndDate] = useState('');
  const [error, setError] = useState(''); 
  const [description, setDescription] = useState('');
  const [eventType, setEventType] = useState('other');
  const [location, setLocation] = useState('');
  const [googleMapsLink, setGoogleMapsLink] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [copySuccess, setCopySuccess] = useState('');
  const [emails, setEmails] = useState([]);

  const auth = getAuth();

  const tryAddEmail = async (email) => {
    // 1️⃣ Boşsa zaten hata
    if (!email) {
      setError('Lütfen bir e‑posta giriniz');
      return false;
    }
    try {
      await fetchSignInMethodsForEmail(auth, email);
    } catch (err) {
      if (err.code === 'auth/invalid-email') {
        setError('Geçersiz e‑posta formatı');
        return false;
      }
      // Diğer hatalara dilerseniz farklı mesaj verebilirsiniz
      setError('E‑posta doğrulaması sırasında hata oluştu');
      return false;
    }

    // 3️⃣ Kopya kontrolü
    if (emails.includes(email)) {
      setError('Bu e‑posta zaten listede');
      return false;
    }

    // Geçtiyse ekle ve hata mesajını temizle
    setEmails([...emails, email]);
    setError('');
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


  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('Lütfen etkinlik başlığı girin');
      return;
    }

    if (emails.length === 0) {
    setError('Lütfen en az bir e‑posta ekleyin');
    return;
  }

    if (questions.length < 2) {
      setError('En az iki seçenek eklemelisiniz.');
      return;
    }

    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) {
      setError('Lütfen giriş yapın');
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
      setError('Anket kaydedilirken bir hata oluştu');
    }
  };

  const addQuestion = () => {
    if (questions.length < 2) {
      let newQuestion;
      
      if (!eventDate) {
        newQuestion = {
          id: Date.now(),
          type: 'datetime',
          options: [],
          allowMultiple: false
        };
      } else {
        newQuestion = {
          id: Date.now(),
          type: 'time',
          options: [],
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
          <label>Google Maps HTML:</label>
          <textarea
            value={googleMapsLink}
            onChange={(e) => setGoogleMapsLink(e.target.value)}
            className="form-input"
            placeholder="Google Maps'ten aldığınız iframe kodunu buraya yapıştırın"
            rows="4"
          />
        </div>

        <div className="form-group">
          <label>Son Katılım Tarihi:</label>
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
        onClick={async (e) => {
          const input = e.currentTarget.previousElementSibling;
          const email = input.value.trim();
          const ok = await tryAddEmail(email);
          if (ok) input.value = '';
        }}
        className="custom-file-button text-center"
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
          {questions.map((question, qIndex) => (
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
                  <button
                    type="button"
                    className="delete-button"
                    onClick={() => {
                      const newQuestions = questions.filter((_, i) => i !== qIndex);
                      setQuestions(newQuestions);
                    }}
                  >
                    Sil
                  </button>
                </div>
              </div>
              
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
                {question.options.length < 5 && (
                  <button
                    type="button"
                    className="add-option-button"
                    onClick={() => addOption(qIndex)}
                  >
                    + Seçenek Ekle ({5 - question.options.length} kaldı)
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="buttons-container">
          {questions.length === 0 && (
            <button type="button" onClick={addQuestion} className="add-button">
              {!eventDate ? 'Tarih ve Saat Seçenekleri Ekle' : 'Saat Seçenekleri Ekle'}
            </button>
          )}

          <button type="submit" className="submit-button">
            Etkinliği Oluştur
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreateSurvey; 