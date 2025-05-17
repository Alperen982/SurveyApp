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
  <div className="upload-container">
  {img && (
    <div className="image-preview">
      <AdvancedImage cldImg={img} className="uploaded-image" />
    </div>
  )}

  <div className="controls">
    <input
      type="file"
      accept="image/*"
      onChange={handleFileChange}
    />

    <button
      type="button"
      onClick={handleUpload}
      disabled={uploading || !file}
      className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
    >
      {uploading ? "Yükleniyor…" : "Yükle"}
    </button>
  </div>
</div>
);
}

export default Home;