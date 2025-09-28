import React from 'react';
import { FaArrowLeft, FaFileAlt, FaGavel, FaShieldAlt, FaExclamationTriangle, FaCheckCircle, FaInfoCircle, FaBalanceScale, FaUserShield, FaHandshake, FaBuilding } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import Navbares from "../../components/Navbares";
import Sidebares from "../../components/Sidebares";

const CharterList = () => {
  const navigate = useNavigate();

  return (
    <>
      <Navbares />
      <Sidebares />
      <main className="bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50 min-h-screen ml-64 pt-36 px-6 py-12 font-sans relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-emerald-200/30 to-blue-200/30 rounded-full blur-3xl animate-float"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-200/30 to-pink-200/30 rounded-full blur-3xl animate-float-delayed"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-yellow-200/20 to-orange-200/20 rounded-full blur-3xl animate-pulse-slow"></div>
        </div>

        <div className="w-full max-w-6xl mx-auto relative z-10">
          {/* Back Button */}
          <div className="mb-8">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center bg-white/80 backdrop-blur-sm text-gray-700 hover:bg-white hover:text-gray-900 font-semibold px-6 py-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl border border-white/50"
            >
              <FaArrowLeft className="mr-2" />
              Back to Blotter Management
            </button>
          </div>

          {/* Enhanced Header */}
          <div className="text-center mb-12">
            <div className="relative inline-flex items-center justify-center mb-6">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-600 rounded-full blur-xl opacity-30 animate-pulse-slow"></div>
              <div className="relative w-24 h-24 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 rounded-full shadow-2xl flex items-center justify-center transform hover:scale-110 transition-all duration-300">
                <FaFileAlt className="w-10 h-10 text-white drop-shadow-lg" />
              </div>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent tracking-tight leading-tight mb-4">
              Blotter Guidelines
            </h1>
            <p className="text-gray-600 text-lg max-w-3xl mx-auto leading-relaxed font-medium">
              Comprehensive guidelines and procedures for filing barangay blotter reports.
              <span className="text-blue-600 font-semibold"> Mga Kaalaman sa Pagsusumite ng Sigalot sa Barangay.</span>
            </p>
          </div>

          {/* Main Content Card */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/50 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-8 py-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <FaGavel className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-white font-bold text-xl">Legal Guidelines & Procedures</h2>
                  <p className="text-white/80 text-sm">Understanding your rights and responsibilities when filing blotter reports</p>
                </div>
              </div>
            </div>

            <div className="p-8 lg:p-12 space-y-10">
              {/* Section 1 */}
              <section className="bg-gradient-to-r from-emerald-50 to-blue-50 rounded-2xl p-8 border border-emerald-200">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-blue-500 rounded-xl flex items-center justify-center flex-shrink-0">
                    <FaShieldAlt className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                      <span className="text-2xl">🕊️</span>
                      Kailan Dapat Idulog ang Sigalot sa Barangay
                    </h2>
                    <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-white/50">
                      <p className="text-gray-700 leading-relaxed text-lg">
                        Ang bawat tao ay may karapatang magdulog ng kanilang mga sumbong, reklamo o sigalot laban sa isa o higit pang tao na inaakala nilang
                        umapi sa kanilang mga karapatan. Subalit hindi lahat ng reklamo o sumbong ay sakop ng barangay at maaaring ayusin dito.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Section 2 */}
              <section className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-200">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center flex-shrink-0">
                    <FaInfoCircle className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                      <span className="text-2xl">📌</span>
                      Mga Bagay na Dapat Isaalang-alang Bago Makapagdulog ng Usapin sa Barangay
                    </h2>
                    <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-white/50">
                      <p className="text-gray-700 mb-4 text-lg font-medium">(Sibil o Kriminal)</p>
                      <ul className="space-y-4">
                        <li className="flex items-start gap-3">
                          <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-white text-sm font-bold">1</span>
                          </div>
                          <p className="text-gray-700 leading-relaxed">
                            <strong>Ang mga panig ba ay nakatira sa nasasakupan ng Lungsod ng Cabuyao?</strong>
                          </p>
                        </li>
                        <li className="flex items-start gap-3">
                          <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-white text-sm font-bold">2</span>
                          </div>
                          <p className="text-gray-700 leading-relaxed">
                            <strong>Kung nakatira:</strong> Ang nagrereklamo ay maaaring dumulog o magreklamo sa Barangay kung saan nakatira ang ipinagsusumbong.
                          </p>
                        </li>
                        <li className="flex items-start gap-3">
                          <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-white text-sm font-bold">3</span>
                          </div>
                          <p className="text-gray-700 leading-relaxed">
                            <strong>Kung hindi:</strong> Ang dalawang panig ay maaaring maghain ng kanilang usapin ng tuwiran sa Hukuman.
                          </p>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </section>

              {/* Section 3 */}
              <section className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-8 border border-purple-200">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center flex-shrink-0">
                    <FaBalanceScale className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                      <span className="text-2xl">⚖️</span>
                      Mga Kasong Sakop ng Katarungang Pambarangay
                    </h2>
                    <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-white/50">
                      <p className="text-gray-700 leading-relaxed text-lg mb-6">
                        Lahat ng kasong <strong className="text-purple-700">SIBIL</strong> at <strong className="text-purple-700">KRIMINAL</strong>, 
                        <span className="italic text-gray-600"> maliban kung</span>:
                      </p>
                      <ul className="space-y-4">
                        <li className="flex items-start gap-3">
                          <div className="w-6 h-6 bg-gradient-to-br from-red-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <FaExclamationTriangle className="w-3 h-3 text-white" />
                          </div>
                          <p className="text-gray-700 leading-relaxed">
                            Kung ang isang panig ay <strong>Pamahalaan o Kawani ng Pamahalaan</strong>.
                          </p>
                        </li>
                        <li className="flex items-start gap-3">
                          <div className="w-6 h-6 bg-gradient-to-br from-red-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <FaExclamationTriangle className="w-3 h-3 text-white" />
                          </div>
                          <p className="text-gray-700 leading-relaxed">
                            Mga pagkakasalang may hatol na pagkabilanggo ng higit sa isang (1) taon at multang higit sa <strong>Php 5,000.00</strong>.
                          </p>
                        </li>
                        <li className="flex items-start gap-3">
                          <div className="w-6 h-6 bg-gradient-to-br from-red-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <FaExclamationTriangle className="w-3 h-3 text-white" />
                          </div>
                          <p className="text-gray-700 leading-relaxed">
                            Mga sigalot na kinakasangkutan ng mga panig na aktwal na naninirahan sa magkaibang Barangay ng magkaibang Lungsod o Bayan.
                          </p>
                        </li>
                        <li className="flex items-start gap-3">
                          <div className="w-6 h-6 bg-gradient-to-br from-red-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <FaExclamationTriangle className="w-3 h-3 text-white" />
                          </div>
                          <p className="text-gray-700 leading-relaxed">
                            Kung ang sumbong ay magmumula sa <strong>Korporasyon o Sosyohan</strong>.
                          </p>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </section>

              {/* Additional Information Section */}
              <section className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-8 border border-green-200">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center flex-shrink-0">
                    <FaHandshake className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                      <span className="text-2xl">🤝</span>
                      Important Reminders
                    </h2>
                    <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-white/50">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex items-start gap-3">
                          <FaCheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                          <div>
                            <h4 className="font-semibold text-green-800 mb-1">Confidentiality</h4>
                            <p className="text-sm text-green-700">All blotter reports are handled with strict confidentiality and professionalism.</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <FaUserShield className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                          <div>
                            <h4 className="font-semibold text-green-800 mb-1">Protection</h4>
                            <p className="text-sm text-green-700">Your rights and safety are our top priority throughout the process.</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <FaBuilding className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                          <div>
                            <h4 className="font-semibold text-green-800 mb-1">Fair Process</h4>
                            <p className="text-sm text-green-700">All cases are processed according to established legal procedures.</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <FaGavel className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                          <div>
                            <h4 className="font-semibold text-green-800 mb-1">Legal Compliance</h4>
                            <p className="text-sm text-green-700">All proceedings follow barangay justice system guidelines.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/residents/generateBlotter')}
              className="inline-flex items-center bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 text-white font-semibold px-8 py-4 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <FaGavel className="mr-3" />
              Generate Blotter Report
            </button>
            <button
              onClick={() => navigate('/residents/statusBlotterRequests')}
              className="inline-flex items-center bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold px-8 py-4 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <FaFileAlt className="mr-3" />
              View My Requests
            </button>
          </div>
        </div>
      </main>
    </>
  );
};

export default CharterList;
