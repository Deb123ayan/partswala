'use client';
import { Images, MapPin } from 'lucide-react';
import { useState } from 'react';

export default function Gallery() {
  const [selectedImage, setSelectedImage] = useState(null);

  // Sample gallery images (replace with your actual images)
  const galleryImages = [
    { id: 1, src: 'https://th.bing.com/th/id/OIP.hn_oIQ8d-_JeJih_FRmAFgAAAA?w=214&h=180&c=7&r=0&o=7&pid=1.7&rm=3', alt: ' Store logo', category: 'store' },
    { id: 2, src: 'https://th.bing.com/th/id/OIP.7hitkkwegH0JiNdleEdwJQHaE6?w=290&h=193&c=7&r=0&o=7&pid=1.7&rm=3', alt: 'Store Interior', category: 'store' },
    { id: 3, src: 'https://th.bing.com/th/id/OIP.KZIuuw4dJ_ZT-KQfiTF0ygHaDt?w=328&h=175&c=7&r=0&o=7&pid=1.7&rm=3', alt: 'Automotive Parts Collection', category: 'products' },
   
    { id: 5, src: 'data:image/webp;base64,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', alt: 'Quality Spare Parts', category: 'products' },
    { id: 6, src: 'https://th.bing.com/th/id/OIP.bTHh7iETNOvfwoaSvEL3lgHaEF?w=297&h=180&c=7&r=0&o=7&pid=1.7&rm=3', alt: 'Customer Service', category: 'team' },
    { id: 7, src: 'https://th.bing.com/th/id/OIP.vEbteR_OTNUdDdzaKZuWxwHaE7?w=285&h=190&c=7&r=0&o=7&pid=1.7&rm=3', alt: 'Well-Stocked Shelves', category: 'store' },
    { id: 8, src: 'https://th.bing.com/th/id/OIP.UdT2XrWtkQKbp2PAftOqDAHaE8?w=294&h=196&c=7&r=0&o=7&pid=1.7&rm=3', alt: 'Genuine Parts', category: 'products' },
  ];

  const categories = ['all', 'store', 'products', 'team'];
  const [activeCategory, setActiveCategory] = useState('all');

  const filteredImages = activeCategory === 'all' 
    ? galleryImages 
    : galleryImages.filter(img => img.category === activeCategory);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-yellow-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Images className="w-8 h-8 text-blue-600 mr-3" />
          <h1 className="text-3xl font-bold text-blue-800">Parts Wala Gallery</h1>
        </div>

        {/* Gallery Description */}
        <div className="bg-white rounded-xl shadow-md border border-blue-100 p-6 mb-8">
          <h2 className="text-2xl font-semibold text-blue-700 mb-4 border-b-2 border-yellow-400 pb-2">
            Explore Our World
          </h2>
          <p className="text-gray-700">
            Take a visual journey through our stores, products, and team. These images showcase the quality and variety of automotive parts we offer, our well-organized stores, and the dedicated team that makes Parts Wala your trusted automotive partner.
          </p>
        </div>

        {/* Category Filters */}
        <div className="bg-white rounded-xl shadow-md border border-blue-100 p-4 mb-8">
          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium capitalize transition-colors ${
                  activeCategory === category
                    ? 'bg-blue-600 text-white'
                    : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredImages.map((image) => (
            <div 
              key={image.id} 
              className="bg-white rounded-xl shadow-md overflow-hidden border border-blue-100 hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => setSelectedImage(image)}
            >
              <div className="aspect-square bg-blue-50 flex items-center justify-center">
                <img
                  src={image.src}
                  alt={image.alt}
                  className="w-full h-full object-cover hover:scale-105 transition-transform"
                  onError={(e) => {
                    e.currentTarget.src = '/fallback-image.jpg';
                    e.currentTarget.className = 'w-full h-full object-contain p-4';
                  }}
                />
              </div>
              <div className="p-4">
                <p className="text-blue-800 font-medium">{image.alt}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Image Modal */}
        {selectedImage && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedImage(null)}
          >
            <div className="relative max-w-4xl w-full">
              <button 
                className="absolute -top-10 right-0 text-white hover:text-yellow-400 transition-colors"
                onClick={() => setSelectedImage(null)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <div className="bg-white rounded-lg overflow-hidden">
                <img
                  src={selectedImage.src}
                  alt={selectedImage.alt}
                  className="w-full max-h-[80vh] object-contain"
                />
                <div className="p-4 bg-blue-50 border-t border-blue-200">
                  <h3 className="text-lg font-semibold text-blue-800">{selectedImage.alt}</h3>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Call to Action */}
        
      </div>
    </div>
  );
}