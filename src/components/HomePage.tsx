import React, { useRef, useState } from 'react';
import {
  Upload,
  Sparkles,
  Printer,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Lock,
  ArrowRight,
  CreditCard,
  FileCheck,
  Layers,
  HelpCircle,
  FileText,
  Sliders,
  X,
} from 'lucide-react';
import { AazmiLogo } from './AazmiLogo';
import { SERVICES_LIST, ServiceItem } from '../data/serviceData';
import { CardTemplate, OFFICIAL_TEMPLATES } from '../types';

interface HomePageProps {
  onStartCrop: (template?: CardTemplate) => void;
  onFileUpload: (file: File) => void;
  onOpenHelp: () => void;
  onOpenPrivacy: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  onStartCrop,
  onFileUpload,
  onOpenHelp,
  onOpenPrivacy,
}) => {
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'identity' | 'healthcare' | 'transport' | 'welfare' | 'employment'>('all');
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [previewImage, setPreviewImage] = useState<{ src: string; title: string; subtitle: string } | null>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileUpload(e.target.files[0]);
    }
  };

  const handleSelectService = (service: ServiceItem) => {
    const tmpl = OFFICIAL_TEMPLATES.find((t) => t.id === service.templateId) || OFFICIAL_TEMPLATES[0];
    onStartCrop(tmpl);
  };

  const filteredServices = SERVICES_LIST.filter((s) => {
    if (selectedFilter === 'all') return true;
    return s.category === selectedFilter;
  });

  return (
    <div className="space-y-12 pb-16">
      {/* HERO SECTION WITH OFFICIAL AAZMI LOGO & BRAND CARD */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-[#002B5B] via-[#0A192F] to-[#0B1528] text-white p-6 sm:p-10 lg:p-12 shadow-xl border border-blue-900/50">
        {/* Subtle Background Glow Elements */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-[#C5A059]/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 rounded-full bg-blue-600/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Column: Official Logo Visual & Badge */}
          <div className="lg:col-span-5 flex flex-col items-center lg:items-start text-center lg:text-left">
            <div className="p-2 sm:p-3 bg-white/5 rounded-3xl backdrop-blur-md border border-[#C5A059]/40 shadow-2xl transition-transform hover:scale-[1.02] duration-300">
              <AazmiLogo size="full" variant="full-card" className="w-64 sm:w-72 md:w-80" />
            </div>
            
            <div className="flex items-center gap-2 mt-4 px-3.5 py-1.5 rounded-full bg-white/10 border border-[#C5A059]/40 text-[#E5C158] text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-[#E5C158]" />
              <span>Official Card Printing &amp; Smart Crop Portal</span>
            </div>
          </div>

          {/* Right Column: Hero Heading, CTAs & Quick Drop */}
          <div className="lg:col-span-7 space-y-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-medium">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>100% Client-Side Privacy • Zero Server Uploads</span>
              </div>

              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
                Precision Card Cropping &amp; <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E5C158] via-[#F3E5AB] to-[#D4AF37]">
                  Instant 1-Sheet Printing
                </span>
              </h1>

              <p className="text-sm sm:text-base text-gray-300 max-w-xl leading-relaxed">
                Seamlessly crop, enhance, and print government identity cards (Aadhaar, PAN, Voter ID, Driving License, Ayushman Bharat, e-Shram) to exact <strong>86 × 54 mm CR80 PVC dimensions</strong> with studio-grade <strong>up to 1800 DPI sharpness</strong> and smart 1-page layout.
              </p>
            </div>

            {/* Main Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => onStartCrop()}
                className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#C5A059] via-[#D4AF37] to-[#B8860B] hover:from-[#D4AF37] hover:to-[#C5A059] text-gray-950 font-bold text-sm sm:text-base shadow-lg shadow-[#C5A059]/20 flex items-center gap-2.5 transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
              >
                <Printer className="w-5 h-5" />
                <span>Open Card Studio</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-5 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold text-sm sm:text-base backdrop-blur-sm flex items-center gap-2 transition-all cursor-pointer"
              >
                <Upload className="w-4.5 h-4.5 text-[#E5C158]" />
                <span>Upload PDF / Scan</span>
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,application/pdf,image/jpeg,image/jpg,image/png,image/webp"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>

            {/* Quick Feature Stats */}
            <div className="grid grid-cols-3 gap-3 pt-4 border-t border-white/10 text-left">
              <div>
                <span className="text-xl sm:text-2xl font-extrabold text-[#E5C158] block">86 × 54 mm</span>
                <span className="text-[11px] text-gray-400 uppercase tracking-wider">Exact CR80 PVC</span>
              </div>
              <div>
                <span className="text-xl sm:text-2xl font-extrabold text-[#E5C158] block">1800 DPI</span>
                <span className="text-[11px] text-gray-400 uppercase tracking-wider">Ultra Max Sharpness</span>
              </div>
              <div>
                <span className="text-xl sm:text-2xl font-extrabold text-emerald-400 block">1-Sheet</span>
                <span className="text-[11px] text-gray-400 uppercase tracking-wider">Front &amp; Back Print</span>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* QUICK DRAG & DROP STRIP */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all duration-200 cursor-pointer ${
          isDragOver
            ? 'border-[#C5A059] bg-amber-50/80 ring-4 ring-amber-400/20'
            : 'border-blue-200 bg-white hover:border-[#002B5B] hover:bg-blue-50/40 shadow-xs'
        }`}
      >
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#002B5B] flex items-center justify-center shrink-0 border border-blue-200 shadow-2xs">
            <Upload className="w-6 h-6" />
          </div>
          <div className="text-center sm:text-left">
            <h3 className="text-sm font-bold text-gray-900">
              Drag and drop any PDF or Card Image anywhere to begin immediately
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Supports e-Aadhaar, e-PAN, Voter ID, Ayushman Bharat, DL, e-Shram PDFs &amp; high-res camera scans
            </p>
          </div>
          <span className="px-3.5 py-1.5 bg-[#002B5B] text-white text-xs font-bold rounded-lg shrink-0 shadow-2xs">
            Browse Document
          </span>
        </div>
      </div>

      {/* ALL CARD SERVICES SHOWCASE WITH REAL IMAGES */}
      <section className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-gray-200 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-[#002B5B]" />
              <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">
                All Available Card Services
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Select any service to load its official dimensions, auto-crop ratios, and tailored color enhancements.
            </p>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            {(
              [
                { id: 'all', label: 'All Services' },
                { id: 'identity', label: 'Identity' },
                { id: 'healthcare', label: 'Health' },
                { id: 'transport', label: 'Transport' },
                { id: 'welfare', label: 'Welfare' },
                { id: 'employment', label: 'ID Cards' },
              ] as const
            ).map((filter) => (
              <button
                key={filter.id}
                type="button"
                onClick={() => setSelectedFilter(filter.id)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  selectedFilter === filter.id
                    ? 'bg-[#002B5B] text-white shadow-2xs'
                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {/* Real Services Visual Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((service) => (
            <div
              key={service.id}
              className="bg-white border border-gray-200 hover:border-[#C5A059] rounded-2xl p-4 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between group"
            >
              <div>
                {/* Real Full HD Cropped Card Visual Representation */}
                <div className="p-2.5 bg-white rounded-xl border border-gray-200/90 mb-4 group-hover:border-[#C5A059] group-hover:shadow-md transition-all relative overflow-hidden shadow-xs">
                  <div className="relative aspect-[86/54] rounded-lg overflow-hidden bg-white border border-gray-100 flex items-center justify-center p-0.5">
                    <img
                      src={service.imageSrc}
                      alt={service.name}
                      className="w-full h-full object-contain drop-shadow-xs transition-transform duration-300 group-hover:scale-105"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-1.5 right-1.5 px-2 py-0.5 rounded-full bg-white/95 backdrop-blur-xs text-[9px] font-bold text-[#002B5B] font-mono border border-gray-200 shadow-xs">
                      1800 DPI CR80
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPreviewImage({
                          src: service.imageSrc,
                          title: service.name,
                          subtitle: service.hindiName + ' — ' + service.tagline,
                        });
                      }}
                      title="Inspect High-Res Card Image"
                      className="absolute bottom-1.5 right-1.5 px-2 py-1 rounded-lg bg-white/95 hover:bg-white text-[#002B5B] border border-gray-200 text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity shadow-sm cursor-pointer flex items-center gap-1"
                    >
                      <Sparkles className="w-3 h-3 text-[#C5A059]" />
                      <span>Preview</span>
                    </button>
                  </div>
                </div>

                {/* Service Metadata & Tag */}
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div>
                    <h3 className="text-base font-bold text-gray-900 group-hover:text-[#002B5B] transition-colors">
                      {service.name}
                    </h3>
                    <p className="text-xs text-gray-500 font-medium">{service.hindiName}</p>
                  </div>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-blue-50 text-[#002B5B] border border-blue-200/60 shrink-0">
                    {service.badge}
                  </span>
                </div>

                <p className="text-xs text-gray-600 line-clamp-2 mt-2">
                  {service.description}
                </p>

                {/* Dimension & Resolution Badges */}
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100 text-[11px] font-mono">
                  <span className="font-bold text-gray-800 bg-gray-100 px-2 py-0.5 rounded">
                    {service.dimensionsMm}
                  </span>
                  <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-semibold border border-emerald-200/50">
                    {service.resolution}
                  </span>
                </div>

                {/* Feature Bullet Points */}
                <ul className="mt-3 space-y-1 text-[11px] text-gray-500">
                  {service.features.slice(0, 3).map((feat, idx) => (
                    <li key={idx} className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* 1-Click Launch Button */}
              <div className="pt-4 mt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => handleSelectService(service)}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#002B5B] hover:bg-[#0A192F] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
                >
                  <span>Crop &amp; Print {service.name}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#E5C158]" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS 3-STEP GUIDE */}
      <section className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-10 shadow-xs">
        <div className="text-center max-w-2xl mx-auto mb-8 space-y-2">
          <span className="text-xs font-extrabold uppercase tracking-widest text-[#002B5B] bg-blue-50 px-3 py-1 rounded-full border border-blue-200/60">
            Simple 3-Step Process
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
            How Aazmi Card Studio Works
          </h2>
          <p className="text-xs sm:text-sm text-gray-500">
            Effortlessly transform government digital letters and raw scans into ready-to-laminate physical cards.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Step 1 */}
          <div className="p-5 rounded-2xl bg-gray-50 border border-gray-200/80 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#002B5B] text-[#E5C158] font-black text-base flex items-center justify-center shadow-xs">
              1
            </div>
            <h3 className="text-base font-bold text-gray-900">Select Card &amp; Upload</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Choose your card template (Aadhaar, PAN, Voter, DL, etc.) and drop your downloaded PDF or image scan. Password-protected PDFs are decrypted instantly in memory.
            </p>
          </div>

          {/* Step 2 */}
          <div className="p-5 rounded-2xl bg-gray-50 border border-gray-200/80 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#002B5B] text-[#E5C158] font-black text-base flex items-center justify-center shadow-xs">
              2
            </div>
            <h3 className="text-base font-bold text-gray-900">Crop Front &amp; Back Sides</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Position the precision CR80 guides over the front and reverse sides. Enhance brightness, contrast, and sharpen text/QR codes with 1 click.
            </p>
          </div>

          {/* Step 3 */}
          <div className="p-5 rounded-2xl bg-gray-50 border border-gray-200/80 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#002B5B] text-[#E5C158] font-black text-base flex items-center justify-center shadow-xs">
              3
            </div>
            <h3 className="text-base font-bold text-gray-900">Print on 1 Single Page</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Preview your exact 86 × 54 mm card layout side-by-side or stacked on an A4/Photo sheet with pure white background and zero blank second pages.
            </p>
          </div>
        </div>
      </section>

      {/* TRUST & PRIVACY BANNER */}
      <section className="rounded-2xl bg-emerald-900/90 text-white p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 border border-emerald-700/50 shadow-md">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center shrink-0">
            <Lock className="w-6 h-6 text-emerald-300" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Your Trust • Our Service</h3>
            <p className="text-xs text-emerald-200 mt-0.5 max-w-xl">
              All PDF rendering, cropping, image sharpening, and layout formatting happens 100% locally in your browser. No Aadhaar numbers, PAN IDs, or personal photos are sent to any external server.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onOpenPrivacy}
            className="px-4 py-2 bg-emerald-800 hover:bg-emerald-700 text-xs font-bold rounded-xl border border-emerald-600 text-white transition-colors cursor-pointer"
          >
            Privacy Guarantee
          </button>
          <button
            type="button"
            onClick={onOpenHelp}
            className="px-4 py-2 bg-white text-emerald-950 hover:bg-emerald-50 text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            Help &amp; Guide
          </button>
        </div>
      </section>

      {/* LIGHTBOX PREVIEW MODAL */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setPreviewImage(null)}
        >
          <div
            className="bg-white border border-gray-200 rounded-3xl p-6 max-w-2xl w-full shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="text-lg font-bold text-gray-950">{previewImage.title}</h3>
                <p className="text-xs text-gray-500">{previewImage.subtitle}</p>
              </div>
              <button
                type="button"
                onClick={() => setPreviewImage(null)}
                className="p-2 rounded-xl bg-gray-100 text-gray-600 hover:text-gray-900 hover:bg-gray-200 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="rounded-2xl overflow-hidden bg-white p-4 border border-gray-200/80 shadow-xs flex items-center justify-center">
              <img
                src={previewImage.src}
                alt={previewImage.title}
                className="w-full max-h-[60vh] object-contain rounded-xl drop-shadow-md"
                referrerPolicy="no-referrer"
              />
            </div>

            <div className="flex items-center justify-between text-xs text-gray-600 pt-2">
              <span className="font-mono text-[#002B5B] font-semibold">Standard CR80 Size • 1800 DPI Ultra Sharp</span>
              <button
                type="button"
                onClick={() => {
                  const s = SERVICES_LIST.find((item) => item.name === previewImage.title);
                  if (s) handleSelectService(s);
                  setPreviewImage(null);
                }}
                className="px-5 py-2.5 rounded-xl bg-[#002B5B] hover:bg-[#001f42] text-white font-bold transition-colors cursor-pointer shadow-sm flex items-center gap-1.5"
              >
                <Sparkles className="w-4 h-4 text-[#C5A059]" />
                <span>Crop &amp; Print This Card</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
