import React, { useState } from 'react';
import { Cloudinary } from '@cloudinary/url-gen';
import { fill } from '@cloudinary/url-gen/actions/resize';
import { autoGravity } from '@cloudinary/url-gen/qualifiers/gravity';
import { AdvancedImage } from '@cloudinary/react';
import axios from 'axios';

function Home() {
  const [publicId, setPublicId] = useState('PlaceHolder');
  const [uploading, setUploading] = useState(false);

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
    <div className="upload-container">
      <div className="image-preview">
        <AdvancedImage
          cldImg={cldImage}
          className="uploaded-image"
          alt="Profil"
        />
      </div>
      <div className="controls">
        <input
          id="fileInput"
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          style={{ display: 'none' }}
          disabled={uploading}
        />
        <label htmlFor="fileInput" className="custom-file-button">
          {uploading ? 'Yükleniyor…' : 'Profil resmini güncelle'}
        </label>
      </div>
    </div>
  );
}

export default Home;