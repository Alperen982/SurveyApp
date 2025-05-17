import { useState } from 'react';
import { Cloudinary } from '@cloudinary/url-gen';
import { fill } from '@cloudinary/url-gen/actions/resize';
import { autoGravity } from '@cloudinary/url-gen/qualifiers/gravity';
import { AdvancedImage } from '@cloudinary/react';
import axios from 'axios';
import React from 'react';

function Home() {
  const [file, setFile] = useState(null);
  const [imgUrl, setImgUrl] = useState('');
  const [uploading, setUploading] = useState(false);

  // Cloudinary client for display
  const cld = new Cloudinary({ cloud: { cloudName: 'dq4iweuoy' } });
  const cldImage = imgUrl
    ? cld
        .image(imgUrl.split('/').pop().split('.')[0])
        .resize(fill().width(300).height(300).gravity(autoGravity()))
        .format('auto')
        .quality('auto')
    : null;

  const handleFileChange = e => {
    if (e.target.files.length) {
      const selected = e.target.files[0];
      setFile(selected);
      setImgUrl(URL.createObjectURL(selected));  // local preview
    }
  };

  const handleUpload = async () => {
    if (!file) return alert('Önce bir dosya seçin.');
    setUploading(true);

    const data = new FormData();
    data.append('file', file);
    data.append('upload_preset', 'SurveyApp'); 
    // Ensure your unsigned preset enforces c_crop,w_300,h_300

    try {
      const res = await axios.post(
        'https://api.cloudinary.com/v1_1/dq4iweuoy/image/upload',
        data
      );
      setImgUrl(res.data.secure_url);
      setFile(null);
    } catch (err) {
      console.error('Upload hatası:', err);
      alert('Yükleme başarısız oldu.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="upload-container">
      {cldImage && (
        <div className="image-preview">
          <AdvancedImage
            cldImg={cldImage}
            className="uploaded-image"
            alt="Profil"
          />
        </div>
      )}

      <div className="controls">
        {/* Hidden native input */}
        <input
          id="fileInput"
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
        {/* Custom label button */}
        <label htmlFor="fileInput" className="custom-file-button">
          Profil resmini güncelle
        </label>

        <button
          type="button"
          onClick={handleUpload}
          disabled={uploading}
          className="upload-btn"
        >
          {uploading ? 'Yükleniyor…' : 'Yükle'}
        </button>
      </div>
    </div>
  );
}

export default Home;