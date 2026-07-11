import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiDownload, FiVideo, FiImage } from 'react-icons/fi';

const MediaHub = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      const { data } = await axios.get('http://localhost:5000/api/properties');
      setProperties(data.data);
    } catch (error) {
      console.error("Failed to fetch properties", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in w-full max-w-7xl mx-auto pb-12">
      <div className="mb-8">
        <h1 className="text-3xl font-headline-lg font-bold text-primary mb-2">Marketing Media Hub</h1>
        <p className="text-on-surface-variant font-body-lg">Download high-quality flyers, videos, and property images to use in your WhatsApp and social media marketing campaigns.</p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 bg-white border border-trust-slate rounded-lg shadow-sm">
          <svg className="animate-spin h-10 w-10 text-primary mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="font-body-md text-outline">Loading media assets...</span>
        </div>
      ) : properties.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 bg-white border border-trust-slate rounded-lg shadow-sm">
          <span className="material-symbols-outlined block text-6xl mb-4 text-outline opacity-50">photo_library</span>
          <p className="text-on-surface-variant font-body-md italic text-center max-w-md">No properties or media available yet. Check back later once the admin uploads new estates.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {properties.map(property => (
            <div key={property._id} className="bg-white rounded-xl overflow-hidden border border-trust-slate shadow-sm hover:shadow-md transition-shadow flex flex-col group">
              <div className="relative h-56 bg-surface-container overflow-hidden">
                {property.featuredImage ? (
                  <img src={property.featuredImage} alt={property.propertyName} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-outline opacity-50">
                    <FiImage size={64} />
                  </div>
                )}
                <div className="absolute top-4 right-4 bg-inverse-surface/80 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm">
                  {property.badge || 'New'}
                </div>
              </div>
              
              <div className="p-6 flex flex-col flex-1">
                <h3 className="font-bold text-lg font-headline-md text-on-surface mb-2 line-clamp-1" title={property.propertyName}>{property.propertyName}</h3>
                <p className="text-on-surface-variant font-body-md text-sm mb-6 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">location_on</span>
                  {property.location} <span className="mx-1 text-outline">•</span> 
                  <span className="font-mono font-bold text-primary">₦{(property.pricePerPlot || 0).toLocaleString()}</span>
                </p>
                
                <div className="mt-auto flex flex-col gap-3">
                  {property.images && property.images.length > 0 ? (
                    <a href={property.images[0]} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-surface text-primary border border-trust-slate hover:bg-primary-container hover:text-white hover:border-primary font-bold text-sm rounded-md transition-colors shadow-sm">
                      <FiDownload size={16} /> Download Images ({property.images.length})
                    </a>
                  ) : (
                     property.featuredImage && (
                       <a href={property.featuredImage} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-surface text-primary border border-trust-slate hover:bg-primary-container hover:text-white hover:border-primary font-bold text-sm rounded-md transition-colors shadow-sm">
                        <FiDownload size={16} /> Download Cover
                      </a>
                     )
                  )}
                  
                  {property.cloudinaryVideoUrl && (
                    <a href={property.cloudinaryVideoUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-red-50 text-red-600 border border-red-200 hover:bg-red-600 hover:text-white font-bold text-sm rounded-md transition-colors shadow-sm">
                      <FiVideo size={16} /> Watch / Download Video
                    </a>
                  )}
                  
                  {(!property.images?.length && !property.featuredImage && !property.cloudinaryVideoUrl) && (
                    <p className="text-sm text-outline italic text-center py-2 bg-surface rounded-md border border-trust-slate border-dashed">No additional media</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MediaHub;
