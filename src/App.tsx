/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Phone, Mail, Building2, User, ChevronRight, ChevronLeft, CheckCircle2, MessageSquare, Video } from 'lucide-react';
import { ATT_PACKAGES, ATTPackage } from './constants';
import { db, LeadStatus } from './firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export default function App() {
  const [step, setStep] = useState(1);
  const [selectedPackage, setSelectedPackage] = useState<ATTPackage | null>(null);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    companyName: '',
    rfc: '',
    linesOfInterest: '',
    employeeCount: ''
  });
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [adminPasscode, setAdminPasscode] = useState('');
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [leads, setLeads] = useState<any[]>([]);
  const [isLoadingLeads, setIsLoadingLeads] = useState(false);
  const [emailError, setEmailError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorHeader, setErrorHeader] = useState<string | null>(null);

  const validateEmail = (email: string) => {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(email);
  };

  const handleNext = () => {
    if (step === 2) {
      if (!validateEmail(formData.email)) {
        setEmailError(true);
        return;
      }
      setEmailError(false);
    }
    setStep(s => s + 1);
  };

  const handleBack = () => {
    setErrorHeader(null);
    setEmailError(false);
    setStep(s => s - 1);
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPasscode === 'TTDS2024') {
      setIsAdminAuthenticated(true);
      fetchLeads();
    } else {
      alert('Contraseña incorrecta');
    }
  };

  const fetchLeads = async () => {
    const { getDocs, query, orderBy } = await import('firebase/firestore');
    setIsLoadingLeads(true);
    try {
      const q = query(collection(db, 'leads'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const leadsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setLeads(leadsData);
    } catch (error) {
      console.error('Error fetching leads:', error);
    } finally {
      setIsLoadingLeads(false);
    }
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPackage) return;
    
    setIsSubmitting(true);
    setErrorHeader(null);
    try {
      await addDoc(collection(db, 'leads'), {
        ...formData,
        linesOfInterest: formData.linesOfInterest ? parseInt(formData.linesOfInterest) : null,
        employeeCount: formData.employeeCount ? parseInt(formData.employeeCount) : null,
        selectedPackage: selectedPackage.name,
        status: LeadStatus.PENDING,
        createdAt: serverTimestamp()
      });
      setStep(4);
    } catch (error) {
      console.error("Error submitting lead:", error);
      setErrorHeader("Hubo un error al enviar tus datos. Por favor verifica tu conexión e intenta de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-att-gray flex flex-col">
      {/* Header */}
      <header className="bg-att-blue px-8 py-6 flex justify-between items-center shadow-md sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-inner">
            <img 
              src="/logo.png" 
              alt="AT&T Logo" 
              className="h-7 w-auto"
              referrerPolicy="no-referrer"
            />
          </div>
          <h1 className="text-white font-bold text-2xl tracking-tight">PLANES CONTROLADOS AT&T <span className="font-light text-xl opacity-90">Negocios</span></h1>
        </div>
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600">
            <button 
              onClick={() => setIsAdminOpen(true)}
              className="text-white/70 hover:text-white transition-colors flex items-center gap-2 px-3 py-1 border border-white/20 rounded-md"
            >
              <User className="w-4 h-4" />
              Admin
            </button>
            <div className="text-white text-sm font-medium tracking-wide opacity-90">
              Soluciones Personalizadas de Conectividad
            </div>
          </div>
        <div className="md:hidden">
           <a href="tel:5611055692" className="text-white">
             <Phone className="w-6 h-6" />
           </a>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-8 py-10 grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Section: Context or Progress */}
        <div className="lg:col-span-7 space-y-8">
          <div className="space-y-3">
            <h2 className="text-3xl font-display font-bold text-slate-800">
              {step === 1 && "Elige tu Plan Ideal"}
              {step === 2 && "Tus Datos de Contacto"}
              {step === 3 && "Confirma tu Selección"}
              {step === 4 && "¡Solicitud Enviada!"}
            </h2>
            <p className="text-slate-500 text-lg leading-relaxed">
              {step === 1 && "Selecciona la solución que mejor se adapte a las necesidades de tu empresa."}
              {step === 2 && "Déjanos tu información para que un asesor especializado te contacte."}
              {step === 3 && "Por favor revisa que la información sea correcta antes de confirmar."}
              {step === 4 && "Gracias por tu interés. Nos comunicaremos contigo muy pronto."}
            </p>
          </div>

          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="grid grid-cols-1 gap-4"
              >
                {ATT_PACKAGES.map((pkg) => (
                  <div
                    key={pkg.id}
                    onClick={() => {
                      setSelectedPackage(pkg);
                      handleNext();
                    }}
                    className={`att-card p-6 flex justify-between items-center cursor-pointer transition-all relative overflow-hidden group ${
                      selectedPackage?.id === pkg.id ? 'att-card-selected' : ''
                    }`}
                  >
                    {pkg.id === 'p499' && (
                      <div className="absolute top-0 right-0 bg-att-blue text-white px-4 py-1 text-[10px] font-bold uppercase tracking-widest">Recomendado</div>
                    )}
                    <div className="flex flex-col pr-4">
                      {pkg.id === 'p499' && (
                        <span className="text-[10px] font-bold text-att-blue uppercase tracking-widest mb-1">Pyme Pro</span>
                      )}
                      <h3 className="text-xl font-bold text-slate-800 group-hover:text-att-blue transition-colors">{pkg.name}</h3>
                      <p className="text-sm text-slate-500 mt-1 line-clamp-1">{pkg.features[1]}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-2xl font-bold text-slate-900">${pkg.price}<span className="text-xs font-normal text-slate-400">/mes</span></div>
                      <div className="mt-2 text-[10px] font-bold text-att-orange border border-att-orange/30 px-2 py-1 rounded uppercase group-hover:bg-att-orange group-hover:text-white transition-all">Seleccionar</div>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-white border border-slate-200 rounded-xl border-l-4 border-l-att-blue">
                    <div className="text-xs font-bold text-slate-400 uppercase mb-2">Paquete Seleccionado</div>
                    <div className="text-lg font-bold text-att-blue">{selectedPackage?.name}</div>
                  </div>
                  <div className="p-4 bg-white border border-slate-200 rounded-xl border-l-4 border-l-att-orange">
                    <div className="text-xs font-bold text-slate-400 uppercase mb-2">Costo Mensual</div>
                    <div className="text-lg font-bold text-att-orange">${selectedPackage?.price} MXN</div>
                  </div>
                </div>
                <button 
                  onClick={handleBack}
                  className="text-xs font-bold text-slate-500 flex items-center gap-1 hover:text-att-blue transition-colors px-1"
                >
                  <ChevronLeft className="w-4 h-4" /> Cambiar Paquete
                </button>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="bg-blue-50 border border-blue-100 p-6 rounded-2xl space-y-4 border-l-4 border-l-att-orange">
                  <div className="grid grid-cols-2 gap-y-6">
                    <div>
                      <label className="text-[10px] font-bold text-blue-400 uppercase tracking-widest block mb-1">Nombre</label>
                      <span className="font-bold text-slate-800">{formData.fullName}</span>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-blue-400 uppercase tracking-widest block mb-1">Empresa</label>
                      <span className="font-bold text-slate-800">{formData.companyName}</span>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-blue-400 uppercase tracking-widest block mb-1">Email</label>
                      <span className="font-bold text-slate-800 break-all">{formData.email}</span>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-blue-400 uppercase tracking-widest block mb-1">Paquete</label>
                      <span className="font-bold text-slate-800">{selectedPackage?.name}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-slate-200 p-6 rounded-2xl space-y-4 border-l-4 border-l-att-blue">
                  <h4 className="text-xs font-bold text-att-blue uppercase tracking-widest border-b border-slate-100 pb-2">Ventajas AT&T Negocios</h4>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[
                      'AHORRO EN LA FACTURACIÓN MENSUAL DE LA EMPRESA',
                      'MAS MEGAS POR PORTABILIDAD',
                      'FLEX CONTROL INCLUIDO',
                      'DISPOSITIVO CELULAR INCLUIDO',
                      'EQUIPOS FINANCIADOS SIN INTERESES',
                      'APPS A ELEGIR CON BASE A SU REQUERIMIENTO',
                      'OMITIR GARANTÍAS AL PRESENTAR SU ESTADO ACTUAL CON LA COMPETENCIA'
                    ].map((advantage, index) => (
                      <li key={index} className="flex items-start gap-2 text-[11px] font-bold text-slate-600 leading-tight">
                        <CheckCircle2 className="w-3.5 h-3.5 text-att-orange shrink-0 mt-0.5" />
                        {advantage}
                      </li>
                    ))}
                  </ul>
                </div>

                <button 
                  onClick={handleBack}
                  className="text-xs font-bold text-slate-500 flex items-center gap-1 hover:text-att-blue transition-colors px-1"
                >
                  <ChevronLeft className="w-4 h-4" /> Editar Información
                </button>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-10 bg-white rounded-3xl border border-slate-100 shadow-2xl text-center space-y-6"
              >
                 <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto border border-green-100">
                    <CheckCircle2 className="w-10 h-10" />
                 </div>
                 <div className="space-y-2">
                    <h3 className="text-2xl font-bold text-slate-800">¡Todo listo!</h3>
                    <p className="text-slate-500">Un asesor de <b>TTDS</b> te buscará pronto para finalizar tu contratación.</p>
                 </div>
                 <button 
                  onClick={() => { setStep(1); setSelectedPackage(null); setFormData({ fullName: '', email: '', phone: '', companyName: '' }); }}
                  className="px-8 py-3 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-black transition-all"
                 >
                   Regresar
                 </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Section: Form (The shadow card) */}
        <aside className="lg:col-span-5">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 p-8 flex flex-col h-full sticky top-30">
            {step < 4 ? (
              <div className="flex flex-col h-full">
                <div className="mb-8">
                  <h2 className="text-xl font-bold text-slate-800">
                    {step === 1 ? "Selecciona un plan" : step === 2 ? "Datos de contacto" : "Confirma tu solicitud"}
                  </h2>
                  <p className="text-sm text-slate-400 mt-1">
                    {step === 1 ? "Haz clic en el plan de tu interés." : "Completa el formulario para asesoría."}
                  </p>
                </div>

                {errorHeader && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-xs font-medium">
                    {errorHeader}
                  </div>
                )}

                <form className="space-y-5 flex-1" onSubmit={(e) => {
                  e.preventDefault();
                  if (step === 2) handleNext();
                  if (step === 3) handleSubmit(e);
                }}>
                  {step === 1 && (
                    <div className="flex flex-col items-center justify-center py-6 text-center space-y-4 border-2 border-dashed border-slate-100 rounded-3xl overflow-hidden bg-slate-50 relative min-h-[300px]">
                      <img 
                        src="https://images.unsplash.com/photo-1556761175-b413da4baf72?q=80&w=1000&auto=format&fit=crop" 
                        alt="Business Connectivity" 
                        className="absolute inset-0 w-full h-full object-cover opacity-20"
                        referrerPolicy="no-referrer"
                      />
                      <div className="relative z-10 flex flex-col items-center p-6">
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg mb-4">
                          <ChevronRight className="w-8 h-8 text-att-blue animate-pulse" />
                        </div>
                        <p className="text-sm text-slate-600 font-bold leading-tight">
                          Selecciona un plan de la lista <br /> para comenzar tu asesoría <br /> personalizada.
                        </p>
                        <div className="mt-6 flex flex-wrap justify-center gap-2">
                           <span className="px-3 py-1 bg-white/80 rounded-full text-[10px] font-bold text-att-blue shadow-sm">5G Ready</span>
                           <span className="px-3 py-1 bg-white/80 rounded-full text-[10px] font-bold text-att-blue shadow-sm">FlexControl</span>
                           <span className="px-3 py-1 bg-white/80 rounded-full text-[10px] font-bold text-att-blue shadow-sm">Pyme Expert</span>
                        </div>

                        <div className="mt-8 flex flex-col items-center gap-4 w-full">
                          <div className="flex flex-wrap justify-center gap-4">
                            <a 
                              href="https://wa.me/525611055692" 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 px-6 py-3 bg-[#25D366] text-white rounded-full font-bold shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1"
                            >
                              <MessageSquare className="w-5 h-5 fill-current" />
                              WhatsApp
                            </a>
                            <a 
                              href="https://meet.google.com/hdk-hfdh-fhh" 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-700 rounded-full font-bold shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1"
                            >
                              <Video className="w-5 h-5 text-att-blue" />
                              Google Meet
                            </a>
                          </div>
                          <p className="text-[10px] font-black text-att-blue uppercase tracking-widest bg-blue-50 px-4 py-1 rounded-full">
                            Agenda tu cita de negocios
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {step >= 2 && (
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Nombre Completo</label>
                        <input
                          required
                          readOnly={step === 3}
                          type="text"
                          value={formData.fullName}
                          onChange={e => setFormData(f => ({ ...f, fullName: e.target.value }))}
                          className={`w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none transition-all focus:ring-2 focus:ring-att-blue/20 focus:border-att-blue ${step === 3 ? 'opacity-70 bg-slate-100' : ''}`}
                          placeholder="Ej. Roberto Jiménez"
                        />
                      </div>
                      <div className="space-y-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Teléfono</label>
                          <input
                            required
                            readOnly={step === 3}
                            type="tel"
                            pattern="[0-9]{10}"
                            value={formData.phone}
                            onChange={e => setFormData(f => ({ ...f, phone: e.target.value }))}
                            className={`w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none transition-all focus:ring-2 focus:ring-att-blue/20 focus:border-att-blue ${step === 3 ? 'opacity-70 bg-slate-100' : ''}`}
                            placeholder="55 1234 5678"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className={`text-[10px] font-bold uppercase tracking-widest ${emailError ? 'text-red-500' : 'text-slate-500'}`}>Correo</label>
                          <input
                            required
                            readOnly={step === 3}
                            type="email"
                            value={formData.email}
                            onChange={e => {
                                setFormData(f => ({ ...f, email: e.target.value }));
                                if (emailError) setEmailError(false);
                            }}
                            className={`w-full px-4 py-3 bg-slate-50 border rounded-xl text-sm outline-none transition-all focus:ring-2 focus:ring-att-blue/20 focus:border-att-blue ${step === 3 ? 'opacity-70 bg-slate-100 border-slate-200' : emailError ? 'border-red-300 bg-red-50' : 'border-slate-200'}`}
                            placeholder="negocio@empresa.com"
                          />
                          {emailError && <p className="text-[10px] text-red-500 font-bold mt-1">Por favor ingresa un correo válido.</p>}
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Empresa</label>
                          <input
                            readOnly={step === 3}
                            type="text"
                            value={formData.companyName}
                            onChange={e => setFormData(f => ({ ...f, companyName: e.target.value }))}
                            className={`w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none transition-all focus:ring-2 focus:ring-att-blue/20 focus:border-att-blue ${step === 3 ? 'opacity-70 bg-slate-100' : ''}`}
                            placeholder="Nombre de tu negocio"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">RFC (Opcional)</label>
                          <input
                            readOnly={step === 3}
                            type="text"
                            value={formData.rfc}
                            onChange={e => setFormData(f => ({ ...f, rfc: e.target.value }))}
                            className={`w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none transition-all focus:ring-2 focus:ring-att-blue/20 focus:border-att-blue ${step === 3 ? 'opacity-70 bg-slate-100' : ''}`}
                            placeholder="RFC de la empresa"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Líneas de interés</label>
                            <input
                              readOnly={step === 3}
                              type="number"
                              value={formData.linesOfInterest}
                              onChange={e => setFormData(f => ({ ...f, linesOfInterest: e.target.value }))}
                              className={`w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none transition-all focus:ring-2 focus:ring-att-blue/20 focus:border-att-blue ${step === 3 ? 'opacity-70 bg-slate-100' : ''}`}
                              placeholder="Ej. 5"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Empleados</label>
                            <input
                              readOnly={step === 3}
                              type="number"
                              value={formData.employeeCount}
                              onChange={e => setFormData(f => ({ ...f, employeeCount: e.target.value }))}
                              className={`w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none transition-all focus:ring-2 focus:ring-att-blue/20 focus:border-att-blue ${step === 3 ? 'opacity-70 bg-slate-100' : ''}`}
                              placeholder="Ej. 10"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedPackage && (
                    <div className="mt-8 p-5 bg-orange-50 rounded-2xl border border-orange-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
                      <h4 className="text-[10px] font-bold text-att-orange uppercase tracking-widest mb-3">Resumen de Selección</h4>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-bold text-slate-700">{selectedPackage.name}</span>
                        <span className="text-sm font-black text-att-orange">${selectedPackage.price} MXN</span>
                      </div>
                      <p className="text-[10px] text-orange-600 mt-2 italic flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Un asesor validará cobertura y promociones.
                      </p>
                    </div>
                  )}

                  {step === 2 && (
                    <button 
                      type="submit"
                      className="w-full bg-att-blue hover:bg-att-blue/90 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-200 transition-all text-xs lg:text-sm uppercase tracking-widest mt-6"
                    >
                      Continuar a Resumen
                    </button>
                  )}

                  {step === 3 && (
                    <button 
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-att-orange hover:bg-att-orange/90 text-white font-bold py-4 rounded-xl shadow-lg shadow-orange-200 transition-all text-xs lg:text-sm uppercase tracking-widest mt-6 disabled:opacity-50"
                    >
                      {isSubmitting ? 'Enviando...' : 'Confirmar y Contactar'}
                    </button>
                  )}
                </form>

                <p className="text-[10px] text-center text-slate-400 mt-8 leading-relaxed">
                  Al enviar tus datos, aceptas recibir información sobre soluciones de <b>AT&T Negocios</b> y nuestro aviso de privacidad.
                </p>
              </div>
            ) : (
                <div className="flex flex-col items-center justify-center h-full py-10 space-y-6">
                    <img 
                        src="https://ais-dev-hjhaqwtp4d4wgbhjt4wkiv-167705619913.us-east1.run.app/input_file_1.png" 
                        alt="TTDS Logo" 
                        className="h-20 w-auto opacity-50 grayscale"
                        referrerPolicy="no-referrer"
                    />
                    <div className="text-center space-y-2">
                        <h4 className="font-bold text-slate-500">Sesión Finalizada</h4>
                        <p className="text-xs text-slate-400">Tus datos han sido registrados en nuestro sistema de atención.</p>
                    </div>
                </div>
            )}
          </div>
        </aside>
      </main>

      {/* Footer Minimalist */}
      {/* Admin Modal */}
      <AnimatePresence>
        {isAdminOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white w-full max-w-4xl max-h-[80vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="px-6 py-4 bg-slate-900 text-white flex justify-between items-center">
                <h3 className="font-bold flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Panel de Administración
                </h3>
                <button 
                  onClick={() => {
                    setIsAdminOpen(false);
                    setIsAdminAuthenticated(false);
                    setAdminPasscode('');
                  }}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors"
                >
                  ✕
                </button>
              </div>

              {!isAdminAuthenticated ? (
                <div className="p-12 flex flex-col items-center justify-center space-y-6">
                  <div className="text-center">
                    <h4 className="text-xl font-bold text-slate-800">Acceso Restringido</h4>
                    <p className="text-sm text-slate-400 mt-1">Ingresa la clave para ver los registros.</p>
                  </div>
                  <form onSubmit={handleAdminLogin} className="w-full max-w-xs space-y-4">
                    <input 
                      autoFocus
                      type="password"
                      value={adminPasscode}
                      onChange={e => setAdminPasscode(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-center font-bold tracking-widest outline-none focus:ring-2 focus:ring-att-blue"
                      placeholder="••••••••"
                    />
                    <button className="w-full py-3 bg-att-blue text-white rounded-xl font-bold hover:bg-att-dark transition-all">
                      Ingresar
                    </button>
                  </form>
                </div>
              ) : (
                <div className="flex-1 overflow-auto p-6">
                  {isLoadingLeads ? (
                    <div className="flex items-center justify-center h-64 text-slate-400 font-medium">Cargando registros...</div>
                  ) : leads.length === 0 ? (
                    <div className="flex items-center justify-center h-64 text-slate-400 font-medium">No hay registros aún.</div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 text-slate-500 uppercase tracking-widest font-black">
                          <tr>
                            <th className="px-4 py-3">Fecha</th>
                            <th className="px-4 py-3">Nombre</th>
                            <th className="px-4 py-3">Contacto</th>
                            <th className="px-4 py-3">Empresa / RFC</th>
                            <th className="px-4 py-3">Paquete</th>
                            <th className="px-4 py-3">Detalles</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {leads.map((lead) => (
                            <tr key={lead.id} className="hover:bg-slate-50 transition-colors">
                              <td className="px-4 py-3 whitespace-nowrap text-slate-400">
                                {lead.createdAt?.toDate ? new Date(lead.createdAt.toDate()).toLocaleDateString() : 'Reciente'}
                              </td>
                              <td className="px-4 py-3 font-bold text-slate-800">{lead.fullName}</td>
                              <td className="px-4 py-3">
                                <div className="flex flex-col">
                                  <span>{lead.phone}</span>
                                  <span className="text-slate-400 italic">{lead.email}</span>
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex flex-col">
                                  <span className="font-medium">{lead.companyName || '-'}</span>
                                  <span className="text-slate-400">{lead.rfc || '-'}</span>
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <span className="px-2 py-1 bg-att-blue/10 text-att-blue rounded-md font-bold uppercase text-[9px]">{lead.selectedPackage}</span>
                              </td>
                              <td className="px-4 py-3">
                                <div className="text-slate-400 flex flex-col">
                                  <span>Líneas: {lead.linesOfInterest || '-'}</span>
                                  <span>Emp: {lead.employeeCount || '-'}</span>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <footer className="bg-slate-900 py-10 mt-10">
        <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row justify-between items-center gap-8">
           <div className="flex items-center gap-6">
              <img 
                src="/logo2.png" 
                alt="AT&T Distribuidor Autorizado Logo Footer" 
                className="h-12 w-auto opacity-100"
                referrerPolicy="no-referrer"
              />
              <div className="h-6 w-px bg-white/20 hidden md:block"></div>
              <p className="text-white/40 text-xs max-w-xs leading-relaxed">
                TVTELCO & DATA SOLUTIONS S.A DE C.V. Distribuidor Autorizado AT&T. Ciudad de México y cobertura nacional.
              </p>
           </div>
           <div className="flex items-center gap-4">
              <a href="tel:5611055692" className="text-white text-sm font-bold flex items-center gap-2 px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-all">
                <Phone className="w-4 h-4" /> 5611055692
              </a>
           </div>
        </div>
        <div className="max-w-7xl mx-auto px-8 mt-10 pt-10 border-t border-white/5 text-center md:text-left">
           <p className="text-white/20 text-[10px] uppercase tracking-widest font-bold">© 2024 TTDS | Más que números, personas.</p>
        </div>
      </footer>
    </div>
  );
}
