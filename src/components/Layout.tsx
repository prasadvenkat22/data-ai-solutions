import { ReactNode } from 'react';
import Navbar from './Navbar';
import AIChatWidget from './AIChatWidget';
import { Database, Linkedin, Twitter, Mail } from 'lucide-react';
import Link from 'next/link';

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />
      <main className="flex-1 pt-16">{children}</main>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                  <Database className="w-5 h-5 text-white" />
                </div>
                <div>
                  <span className="text-white font-bold">DataAI</span>
                  <span className="text-indigo-400 font-bold"> Solutions</span>
                </div>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed">
                Bringing AI to where data lives. On-shore & off-shore consulting for data analytics
                and AI transformation.
              </p>
              <div className="flex gap-3 mt-4">
                <a href="#" className="text-slate-500 hover:text-indigo-400 transition-colors">
                  <Linkedin className="w-5 h-5" />
                </a>
                <a href="#" className="text-slate-500 hover:text-indigo-400 transition-colors">
                  <Twitter className="w-5 h-5" />
                </a>
                <a href="#" className="text-slate-500 hover:text-indigo-400 transition-colors">
                  <Mail className="w-5 h-5" />
                </a>
              </div>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Services</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><Link href="/services#cloud" className="hover:text-indigo-400 transition-colors">Cloud Platforms</Link></li>
                <li><Link href="/services#ai" className="hover:text-indigo-400 transition-colors">AI & ML Solutions</Link></li>
                <li><Link href="/services#analytics" className="hover:text-indigo-400 transition-colors">Data Analytics</Link></li>
                <li><Link href="/services#custom" className="hover:text-indigo-400 transition-colors">Custom AI</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Platform</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><Link href="/customers" className="hover:text-indigo-400 transition-colors">Customers</Link></li>
                <li><Link href="/users" className="hover:text-indigo-400 transition-colors">Users</Link></li>
                <li><Link href="/registrations" className="hover:text-indigo-400 transition-colors">Demo Registration</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Contact</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="mailto:venkatangirala@gmail.com" className="hover:text-indigo-400 transition-colors">venkatangirala@gmail.com</a></li>
                <li><a href="tel:12018884128" className="hover:text-indigo-400 transition-colors">1-201-888-4128</a></li>
                <li>On-shore & Off-shore</li>
                <li>24/7 Incident Support</li>
              </ul>
            </div>
          </div>

          <div className="mt-10 pt-6 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-slate-500 text-sm">
              © {new Date().getFullYear()} DataAI Solutions. All rights reserved.
            </p>
            <p className="text-slate-600 text-xs">
              Cloud · Databricks · Snowflake · Azure · AWS · GCP
            </p>
          </div>
        </div>
      </footer>

      <AIChatWidget />
    </div>
  );
}
