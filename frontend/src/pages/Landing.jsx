import React from 'react';

const Landing = () => {
  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary to-secondary text-white py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h1 className="text-5xl md:text-6xl font-bold">Modern Solutions for Electronic Repairs</h1>
            <p className="text-lg text-gray-100">
              Book your repair, track progress in real-time, and get your devices back faster with <strong>SureFix</strong> Professional service for smartphones, laptops, and more.
            </p>
            <div className="flex gap-4 flex-wrap">
              <button className="btn-accent">
                <i className="fas fa-tools mr-2"></i>Book a repair
              </button>
              <button className="btn-secondary">
                <i className="fas fa-map-location-dot mr-2"></i>Find Repair Shop
              </button>
            </div>
          </div>
          <div className="hidden md:block">
            <img src="/electronics-repair.jpg" alt="Electronics repair" className="w-full rounded-lg shadow-xl" />
          </div>
        </div>
      </section>

      {/* Why Choose SureFix Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose SureFix?</h2>
            <p className="text-xl text-gray-600">A better way to repair your tech</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature Card 1 */}
            <div className="bg-white p-8 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="text-4xl text-primary mb-4">
                <i className="fas fa-person-hiking"></i>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Expert Technicians</h3>
              <p className="text-gray-600">Our certified professionals have years of experience with all major electronic brands.</p>
            </div>

            {/* Feature Card 2 */}
            <div className="bg-white p-8 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="text-4xl text-primary mb-4">
                <i className="fas fa-bolt"></i>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Fast Turnaround</h3>
              <p className="text-gray-600">Most common repairs are completed within 24-48 hours with genuine replacement parts.</p>
            </div>

            {/* Feature Card 3 */}
            <div className="bg-white p-8 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="text-4xl text-primary mb-4">
                <i className="fas fa-chart-line"></i>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Real-time Tracking</h3>
              <p className="text-gray-600">Know exactly where your device is in the repair process with live status updates.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-primary to-secondary text-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to fix your device?</h2>
          <p className="text-xl text-gray-100 mb-2">Join thousands of happy customers who trust ERAA for their electronic repairs.</p>
          <p className="text-lg font-semibold text-accent mb-8">Fast, reliable, and transparent.</p>
          <button className="btn-accent text-lg px-8 py-4">
            <i className="fas fa-play mr-2"></i>Start Your Repair
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto mb-12">
          <div className="grid md:grid-cols-4 gap-8">
            {/* Brand */}
            <div>
              <h3 className="text-xl font-bold mb-4">SureFix</h3>
              <p className="text-gray-400">The SureFix simplifies the way you manage and book electronic repairs. Modern, efficient, and reliable.</p>
            </div>

            {/* Support Links */}
            <div>
              <h4 className="text-lg font-bold mb-4">SUPPORT</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="/help" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="/warranty" className="hover:text-white transition-colors">Warranty Policy</a></li>
                <li><a href="/contact" className="hover:text-white transition-colors">Contact Us</a></li>
              </ul>
            </div>

            {/* Legal Links */}
            <div>
              <h4 className="text-lg font-bold mb-4">LEGAL</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="/privacy" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="/terms" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="/cookies" className="hover:text-white transition-colors">Cookie Policy</a></li>
              </ul>
            </div>

            {/* Social */}
            <div>
              <h4 className="text-lg font-bold mb-4">FOLLOW US</h4>
              <div className="flex gap-4 text-gray-400">
                <a href="#" className="hover:text-white transition-colors text-xl">
                  <i className="fab fa-facebook"></i>
                </a>
                <a href="#" className="hover:text-white transition-colors text-xl">
                  <i className="fab fa-twitter"></i>
                </a>
                <a href="#" className="hover:text-white transition-colors text-xl">
                  <i className="fab fa-linkedin"></i>
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8">
          <p className="text-center text-gray-400">&copy; 2026 SureFix System. All rights reserved</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
