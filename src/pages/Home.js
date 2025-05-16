import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import React from 'react';
import { Cloudinary } from '@cloudinary/url-gen';
import { auto } from '@cloudinary/url-gen/actions/resize';
import { autoGravity } from '@cloudinary/url-gen/qualifiers/gravity';
import { AdvancedImage } from '@cloudinary/react';
import { fill } from "@cloudinary/url-gen/actions/resize";
import axios from 'axios';

function Home() {
  const [file, setFile] = useState(null);
  const [imgUrl, setImgUrl] = useState('');
  const [uploading, setUploading] = useState(false);

  // Initialize Cloudinary for display
  const cld = new Cloudinary({ cloud: { cloudName: 'dq4iweuoy' } });
  const img = imgUrl
    ? cld
        .image(imgUrl.split('/').pop().split('.')[0]) // assumes the public_id is the filename without extension
        .format('auto')
        .quality('auto')
        .resize(fill().width(300).height(300).gravity(autoGravity()))
    : null;

  // Handle file select
  const handleFileChange = e => {
    if (e.target.files.length) {
      setFile(e.target.files[0]);
      // Optionally preview locally
      setImgUrl(URL.createObjectURL(e.target.files[0]));
    }
  };

  // Upload to Cloudinary
  const handleUpload = async () => {
    if (!file) return alert('Önce bir      seçin.');
    setUploading(true);

    const data = new FormData();
    data.append('file', file);
    data.append('upload_preset', 'SurveyApp'); // replace with your unsigned preset

    try {
      const res = await axios.post(
        'https://api.cloudinary.com/v1_1/dq4iweuoy/image/upload',
        data
      );
      setImgUrl(res.data.secure_url);      // show the uploaded image
      setFile(null);                       // clear selection
    } catch (err) {
      console.error('Upload hatası:', err);
      alert('Yükleme başarısız oldu.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="upload-container">
    {img && (
      <div className="image-preview">
        <AdvancedImage cldImg={img} className="uploaded-image" />
      </div>
    )}

    {/* Controls below the image */}
    <div className="controls" style={{ marginTop: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        style={{ cursor: 'pointer' }}
      />

      <button
        onClick={handleUpload}
        disabled={uploading || !file}
        style={{
          width: '40px',
          height: '40px',
          borderRadius: '5px',
          backgroundColor: '#eee',
          border: '1px solid #ccc',
          cursor: uploading || !file ? 'not-allowed' : 'pointer'
        }}
      >
        {/* Optional: You could add an icon here instead of empty */}
      </button>
    </div>
  </div>
  );
}

export default Home;