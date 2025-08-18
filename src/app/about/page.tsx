'use client';
import { Info, MapPin, Phone } from 'lucide-react';

export default function AboutUs() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-yellow-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Info className="w-8 h-8 text-blue-600 mr-3" />
          <h1 className="text-3xl font-bold text-blue-800">About Parts Wala</h1>
        </div>

        {/* Company Overview */}
        <div className="bg-white rounded-xl shadow-md border border-blue-100 p-6 mb-8">
          <h2 className="text-2xl font-semibold text-blue-700 mb-4 border-b-2 border-yellow-400 pb-2">Our Story</h2>
          <p className="text-gray-700 mb-4">
            Founded in the heart of Cuttack, Odisha, Parts Wala has been a trusted name in automotive parts since 2001. With additional presence in Bhubaneswar, we are committed to powering vehicles across Odisha and beyond with high-quality spare parts for two-wheelers, cars, and commercial vehicles. Our journey began with a simple mission: to provide reliable, durable, and affordable automotive solutions to every mechanic, garage, and vehicle enthusiast.
          </p>
          <p className="text-gray-700">
            At Parts Wala, we pride ourselves on our deep understanding of the automotive industry, offering a vast range of products from gears and clutches to brakes and suspension parts. Our stores in Cuttack and Bhubaneswar are stocked with genuine parts from top brands, ensuring your vehicle runs smoothly and safely.
          </p>
        </div>

        {/* Mission and Vision */}
        <div className="bg-white rounded-xl shadow-md border border-blue-100 p-6 mb-8">
          <h2 className="text-2xl font-semibold text-blue-700 mb-4 border-b-2 border-yellow-400 pb-2">Our Mission & Vision</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-blue-800 mb-2 flex items-center">
                <span className="w-3 h-3 bg-yellow-400 rounded-full mr-2"></span>
                Mission
              </h3>
              <p className="text-gray-700">
                To deliver top-quality automotive parts with unmatched customer service, ensuring every vehicle in Odisha is equipped for the road ahead. We aim to be the go-to destination for mechanics and vehicle owners seeking reliability and performance.
              </p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-blue-800 mb-2 flex items-center">
                <span className="w-3 h-3 bg-yellow-400 rounded-full mr-2"></span>
                Vision
              </h3>
              <p className="text-gray-700">
                To become Odisha's leading automotive parts provider, fostering a community of empowered drivers and mechanics through innovation, quality, and trust.
              </p>
            </div>
          </div>
        </div>

        {/* Founder Section (simplified without photo) */}
        <div className="bg-white rounded-xl shadow-md border border-blue-100 p-6 mb-8">
          <h2 className="text-2xl font-semibold text-blue-700 mb-4 border-b-2 border-yellow-400 pb-2">Our Leadership</h2>
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-800">Jyeshtha Mohapatra</h3>
            <p className="text-yellow-600 font-medium mb-2">Founder</p>
            <p className="text-gray-700">
              With a vision to revolutionize automotive parts retail in Odisha, Jyestha Mohapatra founded Parts Wala in 2010. His leadership and deep industry knowledge have been instrumental in establishing Parts Wala as a trusted name in automotive parts.
            </p>
          </div>
        </div>

        {/* Contact Section */}
        <div className="bg-white rounded-xl shadow-md border border-blue-100 p-6">
          <h2 className="text-2xl font-semibold text-blue-700 mb-4 border-b-2 border-yellow-400 pb-2">Get in Touch</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-blue-800 mb-2">Cuttack Store</h3>
              <p className="text-gray-700 flex items-center mb-2">
                <MapPin className="w-5 h-5 text-yellow-600 mr-2" />
                Khata No.74, Plot No. 7, Manguli, Near Eicher Show Room, Sangam Ware House, Choudwar, Cuttack, Odisha 754025
              </p>
              <p className="text-gray-700 flex items-center">
                <Phone className="w-5 h-5 text-yellow-600 mr-2" />
                +91 95839 67497
              </p>
            </div>
            
          </div>
          <div className="mt-6 text-center">
            <a
              href="https://api.whatsapp.com/send/?phone=%2B919583967497"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-md text-base font-medium"
            >
              <Phone className="w-5 h-5 mr-2" />
              Contact Us on WhatsApp
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}