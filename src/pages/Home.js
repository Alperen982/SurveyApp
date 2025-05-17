import React, { useState } from 'react';
import { Cloudinary } from '@cloudinary/url-gen';
import { fill } from '@cloudinary/url-gen/actions/resize';
import { autoGravity } from '@cloudinary/url-gen/qualifiers/gravity';
import { AdvancedImage } from '@cloudinary/react';
import axios from 'axios';

function Home() {
  const [userData, setUserData] = useState(null);
  const user = auth.currentUser;

  const [publicId, setPublicId] = useState('PlaceHolder');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        const userDocRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userDocRef);
        if (userSnap.exists()) {
          setUserData(userSnap.data());
        } else {
          console.log("Kullanıcı verisi bulunamadı.");
        }
      }
    };

    fetchUserData();
  }, [user]);

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
      setPublicId(res.data.public_id);
    } catch {
      alert('Yükleme başarısız oldu.');
    } finally {
      setUploading(false);
    }
  };

  return (
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
      <div className="text-center mt-2 text-gray-700">
        <p><strong>Kullanıcı:</strong> {userData.email}</p>
        <p><strong>Anket Sayısı:</strong> {userData.surveyCount ?? 0}</p>
      </div>
    )}
  </div>
);
}

export default Home;