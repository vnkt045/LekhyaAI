import Link from 'next/link';
import Image from 'next/image';
import { Check, Shield, Zap, BarChart3, Users, Receipt } from 'lucide-react';

export default function MarketingPage() {
    return (
        <div className="bg-white">
            {/* HERO SECTION */}
            <section className="relative pt-20 pb-32 overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-5xl md:text-6xl font-black text-slate-900 mb-6 tracking-tight">
                        Accounting Intelligence for <br />
                        <span className="bg-gradient-to-r from-lekhya-primary to-blue-500 bg-clip-text text-transparent">Modern India</span>
                    </h1>
                    <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto">
                        Stop managing books. Start managing business. LekhyaAI brings Tally-like speed with Enterprise-grade AI insights, creating the perfect financial OS for Indian SMEs.
                    </p>
                    <div className="flex justify-center gap-4 mb-16">
                        <Link href="/" className="px-8 py-4 bg-lekhya-primary text-white rounded-xl font-bold text-lg shadow-xl hover:bg-blue-800 transition-all hover:-translate-y-1">
                            Get Started Free
                        </Link>
                        <Link href="/marketing/handbook" className="px-8 py-4 bg-white text-slate-700 border border-slate-200 rounded-xl font-bold text-lg hover:bg-slate-50 transition-all">
                            Read Handbook
                        </Link>
                    </div>

                    {/* Hero Image */}
                    <div className="relative max-w-5xl mx-auto rounded-2xl shadow-2xl border border-slate-200 overflow-hidden transform hover:scale-[1.01] transition-transform duration-500">
                        <Image
                            src="/images/dashboard.png"
                            alt="LekhyaAI Dashboard"
                            width={1200}
                            height={800}
                            priority
                            className="w-full h-auto"
                        />
                    </div>
                </div>
            </section>

            {/* FEATURES */}
            <section id="features" className="py-24 bg-slate-50">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-slate-900 mb-4">Everything you need to grow</h2>
                        <p className="text-slate-500">Built for speed, compliance, and growth.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {/* F1 */}
                        <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-6 text-lekhya-primary">
                                <Receipt className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold mb-3 text-slate-800">GST Compliance</h3>
                            <p className="text-slate-600">Auto-generate GSTR-1 & 3B. Validate GSTINs instantly. E-Invoicing ready for the future.</p>
                        </div>
                        {/* F2 */}
                        <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-6 text-yellow-700">
                                <Users className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold mb-3 text-slate-800">Complete Payroll</h3>
                            <p className="text-slate-600">Manage Employee Salary Structures, Attendance, Pay Heads, and generate Payslips in one click.</p>
                        </div>
                        {/* F3 */}
                        <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-6 text-green-700">
                                <BarChart3 className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold mb-3 text-slate-800">AI Financial Insights</h3>
                            <p className="text-slate-600">Predict cash flow gaps, analyze revenue trends, and get smart alerts on anomalies.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* PRODUCT TOUR */}
            <section className="py-24 bg-white border-b border-slate-100">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-slate-900 mb-4">See LekhyaAI in Action</h2>
                        <p className="text-slate-500">Powerful modules detailed for your clarity.</p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-12">
                        {/* GST */}
                        <div className="group">
                            <div className="rounded-xl overflow-hidden shadow-lg border border-slate-200 mb-6 relative hover:shadow-2xl transition-all duration-300">
                                <Image src="/images/gst.png" alt="GST Dashboard" width={600} height={400} className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-500" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                                    <span className="text-white font-bold">GST Compliance</span>
                                </div>
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 mb-2">GST Reporting</h3>
                            <p className="text-slate-600 text-sm">Seamless GSTR-1 & 3B filing with JSON export.</p>
                        </div>

                        {/* Payroll */}
                        <div className="group">
                            <div className="rounded-xl overflow-hidden shadow-lg border border-slate-200 mb-6 relative hover:shadow-2xl transition-all duration-300">
                                <Image src="/images/payroll.png" alt="Payroll Module" width={600} height={400} className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-500" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                                    <span className="text-white font-bold">Payroll Management</span>
                                </div>
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 mb-2">Smart Payroll</h3>
                            <p className="text-slate-600 text-sm">Define salary structures and automate payslips.</p>
                        </div>

                        {/* Vouchers */}
                        <div className="group">
                            <div className="rounded-xl overflow-hidden shadow-lg border border-slate-200 mb-6 relative hover:shadow-2xl transition-all duration-300">
                                <Image src="/images/vouchers.png" alt="Voucher Entry" width={600} height={400} className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-500" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                                    <span className="text-white font-bold">Vouchers</span>
                                </div>
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 mb-2">Rapid Voucher Entry</h3>
                            <p className="text-slate-600 text-sm">Keyboard-first interface for lightning fast accounting.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* PRICING */}
            <section id="pricing" className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-slate-900 mb-4">Simple, Transparent Pricing</h2>
                        <p className="text-slate-500">Choose the plan that fits your business stage.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                        {/* SILVER */}
                        <div className="border border-slate-200 rounded-2xl p-8 hover:border-blue-300 transition-colors">
                            <h3 className="font-bold text-slate-500 uppercase tracking-wide text-sm mb-2">Silver</h3>
                            <div className="text-4xl font-black text-slate-900 mb-6">₹4,999<span className="text-lg font-medium text-slate-400">/yr</span></div>
                            <ul className="space-y-4 mb-8">
                                <li className="flex gap-3 text-slate-700"><Check className="w-5 h-5 text-green-500" /> Core Accounting</li>
                                <li className="flex gap-3 text-slate-700"><Check className="w-5 h-5 text-green-500" /> GST Reports</li>
                                <li className="flex gap-3 text-slate-700"><Check className="w-5 h-5 text-green-500" /> Bank Reconciliation</li>
                                <li className="flex gap-3 text-slate-400"><Check className="w-5 h-5 text-slate-300" /> Inventory (Basic)</li>
                                <li className="flex gap-3 text-slate-400"><Check className="w-5 h-5 text-slate-300" /> Payroll</li>
                            </ul>
                            <Link href="/" className="block w-full py-3 text-center border-2 border-lekhya-primary text-lekhya-primary font-bold rounded-lg hover:bg-blue-50 transition-colors">Get Started</Link>
                        </div>

                        {/* GOLD */}
                        <div className="border-2 border-lekhya-primary rounded-2xl p-8 relative shadow-xl transform scale-[1.03] bg-white">
                            <div className="absolute top-0 right-0 bg-lekhya-primary text-white text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-lg">MOST POPULAR</div>
                            <h3 className="font-bold text-lekhya-primary uppercase tracking-wide text-sm mb-2">Gold</h3>
                            <div className="text-4xl font-black text-slate-900 mb-6">₹9,999<span className="text-lg font-medium text-slate-400">/yr</span></div>
                            <ul className="space-y-4 mb-8">
                                <li className="flex gap-3 text-slate-700"><Check className="w-5 h-5 text-green-500" /> All Silver Features</li>
                                <li className="flex gap-3 text-slate-700"><Check className="w-5 h-5 text-green-500" /> Advanced Inventory</li>
                                <li className="flex gap-3 text-slate-700"><Check className="w-5 h-5 text-green-500" /> E-Invoicing API</li>
                                <li className="flex gap-3 text-slate-700"><Check className="w-5 h-5 text-green-500" /> Batches & Expiry</li>
                                <li className="flex gap-3 text-slate-400"><Check className="w-5 h-5 text-slate-300" /> Payroll</li>
                            </ul>
                            <Link href="/" className="block w-full py-3 text-center bg-lekhya-primary text-white font-bold rounded-lg hover:bg-blue-700 transition-colors">Start Free Trial</Link>
                        </div>

                        {/* PLATINUM */}
                        <div className="border border-slate-200 rounded-2xl p-8 hover:border-purple-300 transition-colors bg-slate-50">
                            <h3 className="font-bold text-purple-600 uppercase tracking-wide text-sm mb-2">Platinum</h3>
                            <div className="text-4xl font-black text-slate-900 mb-6">₹19,999<span className="text-lg font-medium text-slate-400">/yr</span></div>
                            <ul className="space-y-4 mb-8">
                                <li className="flex gap-3 text-slate-700"><Check className="w-5 h-5 text-green-500" /> All Gold Features</li>
                                <li className="flex gap-3 text-slate-700"><Check className="w-5 h-5 text-green-500" /> <b>Full Payroll Module</b></li>
                                <li className="flex gap-3 text-slate-700"><Check className="w-5 h-5 text-green-500" /> Multi-Currency</li>
                                <li className="flex gap-3 text-slate-700"><Check className="w-5 h-5 text-green-500" /> AI Insights</li>
                                <li className="flex gap-3 text-slate-700"><Check className="w-5 h-5 text-green-500" /> Audit Trail</li>
                            </ul>
                            <Link href="/" className="block w-full py-3 text-center border-2 border-slate-300 text-slate-600 font-bold rounded-lg hover:bg-white transition-colors">Contact Sales</Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-24 bg-lekhya-primary text-white text-center">
                <h2 className="text-3xl font-bold mb-6">Ready to upgrade your accounting?</h2>
                <Link href="/" className="px-8 py-4 bg-white text-lekhya-primary rounded-xl font-bold text-lg shadow-xl hover:bg-blue-50 transition-all">
                    Launch Application
                </Link>
            </section>
        </div>
    );
}
