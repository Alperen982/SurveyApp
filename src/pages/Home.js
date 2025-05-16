import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import React from 'react';
import { Cloudinary } from '@cloudinary/url-gen';
import { auto } from '@cloudinary/url-gen/actions/resize';
import { autoGravity } from '@cloudinary/url-gen/qualifiers/gravity';
import { AdvancedImage } from '@cloudinary/react';

function Home() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);

  const onChange = (e) => {
    const f = e.target.files[0];
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;
    // upload logic below...
  };

  return (
    <form onSubmit={onSubmit}>
      <div>
        {preview && <img src={preview} alt="preview" style={{ width: 100, borderRadius: "50%" }} />}
      </div>
      <input type="file" accept="image/*" onChange={onChange} />
      <button type="submit">Upload Picture</button>
    </form>
  );
}

const App = () => {
  const cld = new Cloudinary({ cloud: { cloudName: 'dq4iweuoy' } });
  
  // Use this sample image or upload your own via the Media Explorer
  const img = cld
        .image('cld-sample-5')
        .format('auto') // Optimize delivery by resizing and applying auto-format and auto-quality
        .quality('auto')
        .resize(auto().gravity(autoGravity()).width(500).height(500)); // Transform the image: auto-crop to square aspect_ratio

  return (<AdvancedImage cldImg={img}/>);
};

export default Home; 