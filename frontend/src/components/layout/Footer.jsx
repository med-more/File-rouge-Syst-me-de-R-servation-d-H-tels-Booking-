"use client"

import { Link } from "react-router-dom"
import {
  Mail,
  Phone,
  MapPin,
  Facebook,
  Twitter,
  Hotel,
  Linkedin,
  Instagram,
  Youtube,
  Send,
  Heart,
  Shield,
  Award,
  Clock,
} from "lucide-react"
import hotelLogo from "../../data/Hotel.svg"

import React from 'react'

const Footer = () => {
  return (
     <footer className="bg-gray-800 text-white py-12">
          <div className="container-custom grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <Link to="/" className="flex pb-4 items-center space-x-3 group">
            <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl p-2 group-hover:from-primary-700 group-hover:to-primary-800 transition-all duration-200">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                <span className="text-primary-600 font-bold text-lg">H</span>
              </div>
            </div>
            <span
              className="text-2xl font-bold transition-colors duration-200"
            >
              HotelBook
            </span>
          </Link>
              <p className="text-gray-400 text-sm leading-relaxed">
                Your ultimate destination for booking hotels worldwide. Discover amazing places and make your trips unforgettable.
              </p>
              <div className="flex space-x-4 mt-6">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Facebook className="h-6 w-6" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Twitter className="h-6 w-6" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Instagram className="h-6 w-6" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Linkedin className="h-6 w-6" />
                </a>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-4 text-white">Quick Links</h3>
              <ul className="space-y-2">
                <li>
                  <Link to="/about" className="text-gray-400 hover:text-white transition-colors text-sm">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="text-gray-400 hover:text-white transition-colors text-sm">
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link to="/privacy" className="text-gray-400 hover:text-white transition-colors text-sm">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link to="/terms" className="text-gray-400 hover:text-white transition-colors text-sm">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link to="/faq" className="text-gray-400 hover:text-white transition-colors text-sm">
                    FAQ
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-4 text-white">Support</h3>
              <ul className="space-y-2">
                <li>
                  <a href="tel:+1234567890" className="text-gray-400 hover:text-white transition-colors text-sm">
                    <Phone className="inline-block h-4 w-4 mr-2" /> +1 (234) 567-890
                  </a>
                </li>
                <li>
                  <a href="mailto:info@hotelbook.com" className="text-gray-400 hover:text-white transition-colors text-sm">
                    <Mail className="inline-block h-4 w-4 mr-2" /> info@hotelbook.com
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                    <MapPin className="inline-block h-4 w-4 mr-2" /> 123 Hotel St, Travel City, WB 54321
                  </a>
                </li>
              </ul>
            </div>

            <div className="flex justify-center items-center">
              <img src={hotelLogo} alt="Hotel Logo" className="max-w-full h-auto max-h-48 object-contain" />
            </div>
          </div>

          <div className="container-custom border-t border-gray-700 mt-8 pt-8 text-center text-gray-500 text-sm">
            <p>&copy; {new Date().getFullYear()} HotelBook. All rights reserved.</p>
          </div>
        </footer>
  )
}

export default Footer