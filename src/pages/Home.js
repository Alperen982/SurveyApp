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
    if (!file) return alert('Önce bir dosya seçin.');
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
    <div style={{ textAlign: 'center', padding: 20 }}>
      <h2>Profil Resmi Yükle</h2>

      {/* Local preview or post-upload Cloudinary image */}
      {img && (
        <div style={{ marginBottom: 20 }}>
          <AdvancedImage cldImg={img} />
        </div>
      )}

      {/* File input */}
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
      />

      {/* Upload button */}
      <div style={{ marginTop: 10 }}>
        <button
          onClick={handleUpload}
          disabled={uploading || !file}
        >
          {uploading ? 'Yükleniyor...' : 'Yükle'}
        </button>
      </div>
    </div>
  );
}

export default Home;