import React from 'react';
import { FaArrowLeft } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import Navbares from "../../components/Navbares";
import Sidebares from "../../components/Sidebares";

const CharterList = () => {
  const navigate = useNavigate();

  return (
    <>
      <Navbares />
      <Sidebares />
      <main className="min-h-screen ml-64 pt-24 bg-green-50 font-sans px-4 sm:px-10">
        {/* Back Button */}
        <div className="mb-4">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center bg-green-200 text-green-800 hover:bg-green-300 font-semibold px-4 py-2 rounded-lg transition"
          >
            <FaArrowLeft className="mr-2" />
            Back
          </button>
        </div>

        {/* Title & Subtitle */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-green-800">📄 Blotter Instructions</h1>
          <p className="text-green-700 text-sm">Mga Kaalaman sa Pagsusumite ng Sigalot sa Barangay</p>
        </div>

        {/* Instruction Container */}
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg px-6 py-10 mb-12 space-y-8 text-gray-800">
          {/* Section 1 */}
          <section>
            <h2 className="text-xl font-semibold text-green-700">
              🕊️ Kailan Dapat Idulog ang Sigalot sa Barangay
            </h2>
            <p className="mt-2 text-justify leading-relaxed">
              Ang bawat tao ay may karapatang magdulog ng kanilang mga sumbong, reklamo o sigalot laban sa isa o higit pang tao na inaakala nilang
              umapi sa kanilang mga karapatan. Subalit hindi lahat ng reklamo o sumbong ay sakop ng barangay at maaaring ayusin dito.
            </p>
          </section>

          {/* Section 2 */}
          <section>
            <h2 className="text-xl font-semibold text-green-700">
              📌 Mga Bagay na Dapat Isaalang-alang Bago Makapagdulog ng Usapin sa Barangay (Sibil o Kriminal)
            </h2>
            <ul className="list-disc ml-6 mt-2 space-y-1 text-justify">
              <li>Ang mga panig ba ay nakatira sa nasasakupan ng Lungsod ng Cabuyao?</li>
              <li>Kung nakatira, ang nagrereklamo ay maaaring dumulog o magreklamo sa Barangay kung saan nakatira ang ipinagsusumbong.</li>
              <li>Kung hindi, ang dalawang panig ay maaaring maghain ng kanilang usapin ng tuwiran sa Hukuman.</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section>
            <h2 className="text-xl font-semibold text-green-700">
              ⚖️ Mga Kasong Sakop ng Katarungang Pambarangay
            </h2>
            <p className="mt-2 text-justify">
              Lahat ng kasong <strong>SIBIL</strong> at <strong>KRIMINAL</strong>, <span className="italic">maliban kung</span>:
            </p>
            <ul className="list-disc ml-6 mt-2 space-y-1 text-justify">
              <li>Kung ang isang panig ay Pamahalaan o Kawani ng Pamahalaan.</li>
              <li>Mga pagkakasalang may hatol na pagkabilanggo ng higit sa isang (1) taon at multang higit sa Php 5,000.00.</li>
              <li>Mga sigalot na kinakasangkutan ng mga panig na aktwal na naninirahan sa magkaibang Barangay ng magkaibang Lungsod o Bayan.</li>
              <li>Kung ang sumbong ay magmumula sa Korporasyon o Sosyohan.</li>
            </ul>
          </section>
        </div>
      </main>
    </>
  );
};

export default CharterList;
