import React, { useEffect, useState } from 'react';
import Axios from '../utils/Axios';
import SummaryApi from '../common/SummaryApi';
import toast from 'react-hot-toast';
import AxiosToastError from '../utils/AxiosToastError';
import { FiSave, FiUploadCloud } from 'react-icons/fi';
import uploadImage from '../utils/UploadImage';

const AdminLandingPage = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({
    hero: { badgeText: '', titlePart1: '', titlePart2: '', description: '', cardTitle: '', cardSubtitle: '', cardRating: 5, cardImage: '' },
    about: { tag: '', title: '', imageTitle: '', paragraphs: ['', ''], image: '' },
    features: []
  });

  const fetchData = async () => {
    try {
      const response = await Axios({
        ...SummaryApi.getLandingPage
      });
      if (response.data.success) {
        setData(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching landing page data", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleNestedChange = (section, field, value) => {
    setData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleParagraphChange = (index, value) => {
    const updatedParagraphs = [...data.about.paragraphs];
    updatedParagraphs[index] = value;
    setData(prev => ({
      ...prev,
      about: { ...prev.about, paragraphs: updatedParagraphs }
    }));
  };

  const handleArrayChange = (section, index, field, value) => {
    const updatedArray = [...data[section]];
    updatedArray[index] = { ...updatedArray[index], [field]: value };
    setData(prev => ({ ...prev, [section]: updatedArray }));
  };

  const handleImageUpload = async (e, section, field) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setLoading(true);
      const response = await uploadImage(file);
      if (response.data.success) {
        handleNestedChange(section, field, response.data.data);
        toast.success("Image uploaded!");
      }
    } catch (error) {
      toast.error("Error uploading image");
    } finally {
      setLoading(false);
    }
  };

  const saveContent = async () => {
    try {
      setLoading(true);
      const response = await Axios({
        ...SummaryApi.updateLandingPage,
        data: data
      });
      if (response.data.success) {
        toast.success("Landing Page Updated Successfully!");
      }
    } catch (error) {
      AxiosToastError(error);
    } finally {
      setLoading(false);
    }
  };

  if (!data) return <p>Loading...</p>;

  return (
    <div className="p-6 bg-white dark:bg-neutral-900 rounded-xl shadow-sm min-h-screen">
      <div className="flex justify-between items-center mb-8 border-b dark:border-neutral-800 pb-4">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Landing Page Content</h1>
        <button 
          onClick={saveContent}
          disabled={loading}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-lg font-semibold transition-colors disabled:opacity-50"
        >
          <FiSave />
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div className="space-y-12">
        {/* HERO SECTION */}
        <section className="bg-slate-50 dark:bg-neutral-800/50 p-6 rounded-xl border border-slate-200 dark:border-neutral-700">
          <h2 className="text-xl font-bold mb-4 text-orange-600">1. Hero Section</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Badge Text</label>
              <input type="text" value={data.hero?.badgeText || ''} onChange={(e) => handleNestedChange('hero', 'badgeText', e.target.value)} className="w-full p-2 border rounded dark:bg-neutral-800 dark:border-neutral-700" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Title Part 1 (White text)</label>
              <input type="text" value={data.hero?.titlePart1 || ''} onChange={(e) => handleNestedChange('hero', 'titlePart1', e.target.value)} className="w-full p-2 border rounded dark:bg-neutral-800 dark:border-neutral-700" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Title Part 2 (Orange text)</label>
              <input type="text" value={data.hero?.titlePart2 || ''} onChange={(e) => handleNestedChange('hero', 'titlePart2', e.target.value)} className="w-full p-2 border rounded dark:bg-neutral-800 dark:border-neutral-700" />
            </div>
            <div className="col-span-full">
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea value={data.hero?.description || ''} onChange={(e) => handleNestedChange('hero', 'description', e.target.value)} className="w-full p-2 border rounded dark:bg-neutral-800 dark:border-neutral-700 h-24" />
            </div>
            <div className="col-span-full border-t pt-4 mt-2 border-slate-200 dark:border-neutral-700 grid grid-cols-1 md:grid-cols-3 gap-4">
               <div>
                  <label className="block text-sm font-medium mb-1">Product Card Title</label>
                  <input type="text" value={data.hero?.cardTitle || ''} onChange={(e) => handleNestedChange('hero', 'cardTitle', e.target.value)} className="w-full p-2 border rounded dark:bg-neutral-800 dark:border-neutral-700" />
               </div>
               <div>
                  <label className="block text-sm font-medium mb-1">Product Card Subtitle</label>
                  <input type="text" value={data.hero?.cardSubtitle || ''} onChange={(e) => handleNestedChange('hero', 'cardSubtitle', e.target.value)} className="w-full p-2 border rounded dark:bg-neutral-800 dark:border-neutral-700" />
               </div>
               <div>
                  <label className="block text-sm font-medium mb-1">Rating Stars (1-5)</label>
                  <input type="number" max="5" min="1" value={data.hero?.cardRating || 5} onChange={(e) => handleNestedChange('hero', 'cardRating', Number(e.target.value))} className="w-full p-2 border rounded dark:bg-neutral-800 dark:border-neutral-700" />
               </div>
               <div className="col-span-full">
                  <label className="block text-sm font-medium mb-1">Hero Card Image</label>
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 bg-gray-100 rounded flex items-center justify-center overflow-hidden border">
                      {data.hero?.cardImage ? <img src={data.hero.cardImage} alt="Hero" className="w-full h-full object-cover" /> : <p className="text-[10px] text-gray-400">No Image</p>}
                    </div>
                    <label className="cursor-pointer bg-white dark:bg-neutral-800 border dark:border-neutral-700 px-4 py-2 rounded shadow-sm hover:bg-gray-50 flex items-center gap-2 text-sm font-medium">
                      <FiUploadCloud /> Upload Image
                      <input type="file" className="hidden" onChange={(e) => handleImageUpload(e, 'hero', 'cardImage')} accept="image/*" />
                    </label>
                  </div>
               </div>
            </div>
          </div>
        </section>

        {/* FEATURES SECTION */}
        <section className="bg-slate-50 dark:bg-neutral-800/50 p-6 rounded-xl border border-slate-200 dark:border-neutral-700">
          <h2 className="text-xl font-bold mb-4 text-orange-600">2. Three Features Strip</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {data.features?.map((feat, index) => (
              <div key={index} className="p-4 border rounded bg-white dark:bg-neutral-800 dark:border-neutral-700">
                <label className="block text-xs font-bold text-gray-500 mb-1">Feature {index + 1}</label>
                <input type="text" placeholder="Title" value={feat.title} onChange={(e) => handleArrayChange('features', index, 'title', e.target.value)} className="w-full p-2 mb-2 border rounded dark:bg-neutral-900 dark:border-neutral-700 text-sm" />
                <textarea placeholder="Description" value={feat.description} onChange={(e) => handleArrayChange('features', index, 'description', e.target.value)} className="w-full p-2 border rounded dark:bg-neutral-900 dark:border-neutral-700 text-sm h-20" />
              </div>
            ))}
          </div>
        </section>

        {/* ABOUT SECTION */}
        <section className="bg-slate-50 dark:bg-neutral-800/50 p-6 rounded-xl border border-slate-200 dark:border-neutral-700">
          <h2 className="text-xl font-bold mb-4 text-orange-600">3. About Section</h2>
          <div className="grid grid-cols-1 gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Small Tag (e.g. OUR HERITAGE)</label>
                <input type="text" value={data.about?.tag || ''} onChange={(e) => handleNestedChange('about', 'tag', e.target.value)} className="w-full p-2 border rounded dark:bg-neutral-800 dark:border-neutral-700" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Image Title</label>
                <input type="text" value={data.about?.imageTitle || ''} onChange={(e) => handleNestedChange('about', 'imageTitle', e.target.value)} className="w-full p-2 border rounded dark:bg-neutral-800 dark:border-neutral-700" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Main Heading</label>
              <input type="text" value={data.about?.title || ''} onChange={(e) => handleNestedChange('about', 'title', e.target.value)} className="w-full p-2 border rounded dark:bg-neutral-800 dark:border-neutral-700" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">About Section Image</label>
              <div className="flex items-center gap-4">
                <div className="w-24 h-16 bg-gray-100 rounded flex items-center justify-center overflow-hidden border">
                  {data.about?.image ? <img src={data.about.image} alt="About" className="w-full h-full object-cover" /> : <p className="text-[10px] text-gray-400">No Image</p>}
                </div>
                <label className="cursor-pointer bg-white dark:bg-neutral-800 border dark:border-neutral-700 px-4 py-2 rounded shadow-sm hover:bg-gray-50 flex items-center gap-2 text-sm font-medium">
                  <FiUploadCloud /> Upload Image
                  <input type="file" className="hidden" onChange={(e) => handleImageUpload(e, 'about', 'image')} accept="image/*" />
                </label>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Paragraph 1</label>
              <textarea value={data.about?.paragraphs?.[0] || ''} onChange={(e) => handleParagraphChange(0, e.target.value)} className="w-full p-2 border rounded dark:bg-neutral-800 dark:border-neutral-700 h-24" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Paragraph 2</label>
              <textarea value={data.about?.paragraphs?.[1] || ''} onChange={(e) => handleParagraphChange(1, e.target.value)} className="w-full p-2 border rounded dark:bg-neutral-800 dark:border-neutral-700 h-24" />
            </div>
          </div>
        </section>

        {/* TESTIMONIALS SECTION */}
        <section className="bg-slate-50 dark:bg-neutral-800/50 p-6 rounded-xl border border-slate-200 dark:border-neutral-700">
          <h2 className="text-xl font-bold mb-4 text-orange-600">4. Testimonials (Live)</h2>
          <div className="p-4 border rounded bg-green-50 dark:bg-green-900/20 dark:border-green-800/50 flex flex-col items-center justify-center text-center">
            <h3 className="font-bold text-green-700 dark:text-green-400 mb-2">Testimonials are now fully automated!</h3>
            <p className="text-sm text-green-600 dark:text-green-500">
              The landing page will automatically fetch and display the 3 most recent 5-star reviews submitted by your verified customers. No manual entry required.
            </p>
          </div>
        </section>

      </div>
    </div>
  );
};

export default AdminLandingPage;
