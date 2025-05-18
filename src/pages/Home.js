import React, { useEffect, useState } from 'react';
import { Cloudinary } from '@cloudinary/url-gen';
import { fill } from '@cloudinary/url-gen/actions/resize';
import { autoGravity } from '@cloudinary/url-gen/qualifiers/gravity';
import { AdvancedImage } from '@cloudinary/react';
import axios from 'axios';
import { auth, db } from '../Firebase/config';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { onAuthStateChanged, reauthenticateWithCredential, EmailAuthProvider, updatePassword } from 'firebase/auth';

function Home() {
  const [userData, setUserData] = useState(null);
  const [publicId, setPublicId] = useState('PlaceHolder');
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');

  useEffect(() => {
    // Auth state listener
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        try {
          const userDocRef = doc(db, 'users', currentUser.uid);
          const userSnap = await getDoc(userDocRef);
          if (userSnap.exists()) {
            const data = userSnap.data();
            setUserData(data);

            if (data.profilePicture) {
              const urlParts = data.profilePicture.split('/');
              const lastPart = urlParts[urlParts.length - 1];
              const idWithoutExt = lastPart.split('.')[0];
              setPublicId(idWithoutExt);
            }
          } else {
            console.log('Kullanıcı verisi bulunamadı.');
          }
        } catch (error) {
          console.error('Veri çekme hatası:', error);
        }
      } else {
        // Kullanıcı oturumu yoksa gerekirse yönlendirme ekleyebilirsin
        setUserData(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Cloudinary setup
  const cld = new Cloudinary({ cloud: { cloudName: 'dq4iweuoy' } });
  const cldImage = cld
    .image(publicId)
    .resize(fill().width(300).height(300).gravity(autoGravity()))
    .format('auto')
    .quality('auto');

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const data = new FormData();
    data.append('file', file);
    data.append('upload_preset', 'SurveyApp');

    try {
      const res = await axios.post(
        'https://api.cloudinary.com/v1_1/dq4iweuoy/image/upload',
        data
      );
      const uploadedPublicId = res.data.public_id;
      const imageUrl = res.data.secure_url;

      setPublicId(uploadedPublicId);

      const currentUser = auth.currentUser;
      if (currentUser) {
        const userDocRef = doc(db, 'users', currentUser.uid);
        await updateDoc(userDocRef, { profilePicture: imageUrl });
        console.log('Profil resmi Firestore\'da güncellendi.');
      }
    } catch (err) {
      console.error('Yükleme hatası:', err);
      alert('Yükleme başarısız oldu.');
    } finally {
      setUploading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (!currentPass || !newPass) {
      alert('Lütfen tüm alanları doldurun.');
      return;
    }
    const user = auth.currentUser;
    const cred = EmailAuthProvider.credential(user.email, currentPass);
    const userDocRef = doc(db, 'users', user.uid);
    try {
      await reauthenticateWithCredential(user, cred);
      await updatePassword(user, newPass);
      alert('Şifreniz başarıyla güncellendi.');
      setShowPasswordForm(false);
      setCurrentPass('');
      setNewPass('');
      updateDoc(userDocRef, { password: newPass });
    } catch (error) {
      console.error('Şifre güncelleme hatası:', error);
      alert('Şifre güncellenemedi: ' + error.message);
    }
  };

  if (loading) {
    return <div className="text-center mt-10">Yükleniyor...</div>;
  }

  return (
    <div className="w-full max-w-screen-md mx-auto px-4">
      <div className="upload-container flex flex-col items-center gap-4 mt-8">
        {/* Profil Fotoğrafı */}
        <div className="image-preview">
          <AdvancedImage
            cldImg={cldImage}
            className="uploaded-image"
            alt="Profil"
          />
        </div>

        {/* Yükleme Butonu */}
        <div className="controls">
          <input
            id="fileInput"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            style={{ display: 'none' }}
            disabled={uploading}
          />
          <label htmlFor="fileInput" className="custom-file-button text-center">
            {uploading ? 'Yükleniyor…' : 'Profil resmini güncelle'}
          </label>
        </div>

        {/* Kullanıcı Bilgileri */}
        {userData && (
  <div className="controls">
    <p><strong>Oluşturulan Etkinlik Sayısı:</strong> {userData.surveyCount ?? 0}</p>
    <p><strong>Mail adresi:</strong> {userData.email}</p>
    
    <div className="controls">
      <button
        onClick={() => setShowPasswordForm(!showPasswordForm)}
        className="custom-file-button text-center inline-block px-4 py-2"
      >
        Şifre Değiştir
      </button>
    </div>
  </div>
)}

        {showPasswordForm && (
          <div className="password-inputs">
             <input
             type="password"
             placeholder="Mevcut Şifre"
             value={currentPass}
             onChange={(e) => setCurrentPass(e.target.value)}
             className="password-input"
              />
           <input
             type="password"
             placeholder="Yeni Şifre"
             value={newPass}
             onChange={(e) => setNewPass(e.target.value)}
             className="password-input"
           />
            <div className="controls">
              <button
                onClick={handlePasswordChange}
                className="custom-file-button text-center w-full"
              >
                Şifreyi Güncelle
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;
