import React, { useEffect, useState } from 'react';
import axios from '../../../../utils/axiosConfig';
import { useNavigate } from 'react-router-dom';
import Navbares from "../../../../components/Navbares";
import Sidebares from "../../../../components/Sidebares";
import { FaCrown, FaShieldAlt, FaLeaf, FaUserFriends, FaUserTie, FaArrowLeft, FaEnvelope, FaPhone, FaSearch, FaSortAlphaDown, FaSortAlphaUp } from 'react-icons/fa';

const placeholderImg = "/assets/images/logo.jpg"; // You can replace this with real staff images later

// Icon mapping for positions
const positionIcons = {
  Captain: <FaCrown className="inline text-yellow-500 mr-1" />, // Captain
  Peace: <FaShieldAlt className="inline text-green-700 mr-1" />, // Peace & Order
  Health: <FaLeaf className="inline text-emerald-600 mr-1" />, // Health
  Public: <FaUserFriends className="inline text-green-500 mr-1" />, // Public Order
  Committee: <FaUserTie className="inline text-emerald-700 mr-1" />, // Committee
};

// Helper to pick icon based on position
function getPositionIcon(position) {
  if (position.includes('Captain')) return positionIcons.Captain;
  if (position.includes('Peace')) return positionIcons.Peace;
  if (position.includes('Health')) return positionIcons.Health;
  if (position.includes('Public')) return positionIcons.Public;
  return positionIcons.Committee;
}

// Badge for special staff roles
const getRoleBadge = (position) => {
  if (position.toLowerCase().includes('captain')) return (
    <span className="inline-flex items-center px-4 py-1 bg-gradient-to-r from-yellow-200 to-yellow-300 text-yellow-800 rounded-full text-xs font-bold shadow-sm" style={{boxShadow:'0 1px 6px 0 #fde68a', fontWeight:600, letterSpacing:'0.02em'}}>
      <FaCrown className="mr-1 text-yellow-500" /> Captain
    </span>
  );
  if (position.toLowerCase().includes('secretary')) return (
    <span className="inline-flex items-center px-4 py-1 bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 rounded-full text-xs font-bold shadow-sm" style={{boxShadow:'0 1px 6px 0 #bfdbfe', fontWeight:600, letterSpacing:'0.02em'}}>
      <FaUserTie className="mr-1 text-blue-500" /> Secretary
    </span>
  );
  if (position.toLowerCase().includes('treasurer')) return (
    <span className="inline-flex items-center px-4 py-1 bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 rounded-full text-xs font-bold shadow-sm" style={{boxShadow:'0 1px 6px 0 #e9d5ff', fontWeight:600, letterSpacing:'0.02em'}}>
      <FaUserTie className="mr-1 text-purple-500" /> Treasurer
    </span>
  );
  if (position.toLowerCase().includes('sk chairman')) return (
    <span className="inline-flex items-center px-4 py-1 bg-gradient-to-r from-green-100 to-green-200 text-green-800 rounded-full text-xs font-bold shadow-sm" style={{boxShadow:'0 1px 6px 0 #bbf7d0', fontWeight:600, letterSpacing:'0.02em'}}>
      <FaUserTie className="mr-1 text-green-500" /> SK Chairman
    </span>
  );
  return null;
};

// Glassmorphic Popover for staff details (copied and adapted from Officials)
const StaffPopover = ({ member, show, onClose }) => show && member ? (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in" onClick={onClose}>
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      <div className="w-96 h-96 bg-green-200/30 rounded-full blur-3xl animate-float-slow" />
    </div>
    <div className="relative bg-white/70 backdrop-blur-2xl border-2 border-green-200 shadow-2xl shadow-green-300/40 rounded-2xl p-8 sm:p-12 max-w-xs w-full flex flex-col items-center animate-popover-in ring-2 ring-green-300/30" onClick={e => e.stopPropagation()} tabIndex={0} aria-modal="true" role="dialog">
      <button className="absolute top-3 right-3 text-gray-400 hover:text-emerald-600 text-2xl transition-colors duration-200" onClick={onClose} aria-label="Close popover">&times;</button>
      <img src={getImageUrl(member.image)} alt={member.name} className="w-28 h-28 rounded-full mx-auto border-4 border-green-300 mb-4 shadow-md bg-white/80" onError={e => { e.target.onerror = null; e.target.src = placeholderImg; }} />
      <div className="text-center space-y-2">
        <span className="text-emerald-800 font-extrabold text-2xl sm:text-3xl drop-shadow-sm block">{member.name}</span>
        <div className="text-green-700 text-base sm:text-lg font-semibold flex items-center justify-center gap-1 mb-2">
          {member.position}
          {getRoleBadge(member.position)}
        </div>
        <div className="text-gray-600 text-base sm:text-lg font-light mt-2">
          {member.description || <span className="italic text-gray-400">No additional info.</span>}
        </div>
        <div className="flex justify-center gap-4 mt-4">
          {member.email && <a href={`mailto:${member.email}`} className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full hover:bg-green-200 transition" aria-label="Email"><FaEnvelope /> Email</a>}
          {member.phone && <a href={`tel:${member.phone}`} className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full hover:bg-green-200 transition" aria-label="Call"><FaPhone /> Call</a>}
        </div>
      </div>
    </div>
    <style>{`
      @keyframes popover-in {
        0% { opacity: 0; transform: scale(0.85) translateY(40px); }
        100% { opacity: 1; transform: scale(1) translateY(0); }
      }
      .animate-popover-in { animation: popover-in 0.5s cubic-bezier(0.23, 1, 0.32, 1); }
      @keyframes fade-in {
        0% { opacity: 0; }
        100% { opacity: 1; }
      }
      .animate-fade-in { animation: fade-in 0.7s ease; }
    `}</style>
  </div>
) : null;

// --- Card Enhancements ---
const EnhancedOrgCard = ({ member, large, onClick }) => {
  const [ripple, setRipple] = useState(false);
  const badge = getRoleBadge(member.position);
  const watermarkIcon = getPositionIcon(member.position);
  // Determine if this is a Captain card for extra emphasis
  const isCaptain = member.position.toLowerCase().includes('captain');
  return (
    <div
      className={`relative flex flex-col items-center bg-white/80 backdrop-blur-2xl ${isCaptain ? 'border-4 border-gradient-to-r from-emerald-400 via-green-300 to-emerald-400' : 'border-2 border-emerald-300'} rounded-3xl shadow-xl px-8 py-8 ${large ? 'w-80 min-h-[22rem]' : 'w-64 min-h-[18rem]'} transition-transform duration-300 hover:scale-105 hover:shadow-emerald-300/60 group overflow-hidden cursor-pointer before:absolute before:inset-0 before:rounded-3xl before:bg-emerald-100/30 before:blur-2xl before:-z-10`}
      style={{ boxShadow: isCaptain ? '0 12px 48px 0 rgba(52,211,153,0.18), 0 2px 12px 0 rgba(52,211,153,0.12)' : '0 8px 32px 0 rgba(52,211,153,0.10), 0 1.5px 8px 0 rgba(52,211,153,0.08)' }}
      onClick={e => { setRipple(true); setTimeout(() => setRipple(false), 500); if (onClick) onClick(e); }}
      tabIndex={0}
      aria-label={`View details for ${member.name}`}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { onClick(e); } }}
    >
      {/* Centered, large, blurred, and very transparent watermark icon behind avatar */}
      <span className={`absolute left-1/2 top-16 transform -translate-x-1/2 ${large ? 'text-[8rem]' : 'text-[5rem]'} text-emerald-200 opacity-10 blur-[2px] pointer-events-none select-none z-0`}>{watermarkIcon}</span>
      {/* Soft radial glow behind avatar */}
      <span className="absolute left-1/2 top-14 transform -translate-x-1/2 w-32 h-32 rounded-full bg-emerald-100/60 blur-2xl z-0" />
      {/* Ripple effect */}
      {ripple && <span className="absolute inset-0 rounded-3xl bg-emerald-200/30 animate-ripple pointer-events-none z-30" />}
      <div className="relative mb-4 z-10">
      <img
        src={getImageUrl(member.image)}
        alt={member.name}
          className={`rounded-full object-cover border-4 ${isCaptain ? 'border-emerald-400' : 'border-emerald-300'} shadow-lg ${large ? 'w-28 h-28' : 'w-20 h-20'} transition-all duration-300 group-hover:shadow-emerald-400/80 group-hover:border-emerald-400`}
          style={{ boxShadow: isCaptain ? '0 0 0 10px #a7f3d0, 0 6px 32px 0 #6ee7b7' : '0 0 0 8px #d1fae5, 0 4px 24px 0 #6ee7b7' }}
        onError={e => { e.target.onerror = null; e.target.src = placeholderImg; }}
      />
      </div>
      <span className="text-emerald-900 font-extrabold text-2xl mb-1 text-center drop-shadow-lg z-10">{member.name}</span>
      {badge ? (
        <span className="inline-flex items-center px-4 py-1 mb-2 z-10">{badge}</span>
      ) : (
        <span className="text-emerald-700 text-base font-semibold mb-2 text-center z-10">{member.position}</span>
      )}
      {member.description && (
        <span className="text-gray-500 text-sm font-light mb-4 text-center block z-10">{member.description}</span>
      )}
      {/* More Info Button */}
      <button className="flex items-center gap-1 px-4 py-2 bg-emerald-100 text-emerald-700 rounded-full shadow hover:bg-emerald-200 transition font-semibold mt-auto z-10" onClick={e => { e.stopPropagation(); onClick(e); }} title="More Info">
        <FaEnvelope /> More Info
      </button>
    </div>
  );
};

// Responsive EnhancedOrgChart
const EnhancedOrgChart = ({ data, onCardClick }) => (
  <div className="flex flex-col items-center w-full gap-14 md:gap-20 lg:gap-28 relative">
    {/* Animated gradient background and floating particles */}
    <div className="absolute inset-0 -z-10 pointer-events-none">
      <div className="absolute top-10 left-1/4 w-40 h-40 sm:w-56 sm:h-56 md:w-72 md:h-72 bg-green-200/40 rounded-full blur-3xl animate-float-slow" />
      <div className="absolute bottom-10 right-1/4 w-32 h-32 sm:w-44 sm:h-44 md:w-56 md:h-56 bg-emerald-100/50 rounded-full blur-2xl animate-float-slower" />
      <div className="absolute top-1/2 left-1/2 w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 bg-green-300/30 rounded-full blur-2xl animate-float" />
      {/* Animated particles */}
      {[...Array(8)].map((_, i) => (
        <div key={i} className={`absolute bg-green-200/30 rounded-full blur-xl animate-particle${i%4+1}`} style={{ width: 12 + i*3, height: 12 + i*3, top: `${10+i*8}%`, left: `${5+i*12}%` }} />
      ))}
    </div>
    {/* Top: Captain */}
    <div className="flex flex-col items-center z-10 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
      <EnhancedOrgCard member={data.captain} large onClick={() => onCardClick(data.captain)} />
    </div>
    {/* Animated SVG connector from Captain to officials with pulsing effect */}
    <svg width="100%" height="48" className="-mb-6 z-0 animate-dash-move pulse-connector" style={{marginTop: '-1.5rem', minWidth: '200px'}} preserveAspectRatio="none">
      <defs>
        <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#34d399" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
      </defs>
      <line x1="50%" y1="0" x2="50%" y2="48" stroke="url(#lineGrad)" strokeWidth="4" strokeDasharray="10,7" />
    </svg>
    {/* Middle: Officials */}
    <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-6 sm:gap-8 md:gap-12 lg:gap-16 w-full max-w-6xl animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
      {data.officials.map((member, idx) => (
        <EnhancedOrgCard key={member.name} member={member} onClick={() => onCardClick(member)} />
      ))}
    </div>
    {/* Animated SVG connectors from officials to committees with pulsing effect */}
    <svg width="100%" height="48" className="-mb-6 z-0 animate-dash-move pulse-connector" style={{marginTop: '-1.5rem', minWidth: '200px'}} preserveAspectRatio="none">
      <defs>
        <linearGradient id="lineGrad2" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#34d399" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
      </defs>
      <line x1="15%" y1="0" x2="15%" y2="48" stroke="url(#lineGrad2)" strokeWidth="3" strokeDasharray="10,7" />
      <line x1="40%" y1="0" x2="40%" y2="48" stroke="url(#lineGrad2)" strokeWidth="3" strokeDasharray="10,7" />
      <line x1="65%" y1="0" x2="65%" y2="48" stroke="url(#lineGrad2)" strokeWidth="3" strokeDasharray="10,7" />
      <line x1="90%" y1="0" x2="90%" y2="48" stroke="url(#lineGrad2)" strokeWidth="3" strokeDasharray="10,7" />
    </svg>
    {/* Bottom: Committees */}
    <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-6 sm:gap-8 md:gap-12 lg:gap-16 w-full max-w-7xl animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
      {data.committees.map((member, idx) => (
        <EnhancedOrgCard key={member.name} member={member} onClick={() => onCardClick(member)} />
      ))}
    </div>
    {/* Animations for floating shapes, connectors, border, ripple, popover, and particles */}
    <style>{`
      @keyframes spin-slow { 0% { transform: rotate(0deg);} 100% { transform: rotate(360deg);} }
      .animate-spin-slow { animation: spin-slow 18s linear infinite; }
      @keyframes pulse-connector { 0%,100%{opacity:1;} 50%{opacity:0.5;} }
      .pulse-connector line { animation: pulse-connector 2s infinite; }
    `}</style>
  </div>
);

const getImageUrl = (img) => {
  if (!img) return placeholderImg;
  if (img.startsWith('/storage/')) return `http://localhost:8000${img}`;
  return img;
};

const Staff = () => {
  const navigate = useNavigate();
  const [staff, setStaff] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);
  const [showPopover, setShowPopover] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [sortAsc, setSortAsc] = useState(true);

  useEffect(() => {
    setLoading(true);
    setError(null);
    axios.get('/organizational-chart/staff')
      .then(res => setStaff(res.data))
      .catch(() => setError('Failed to load staff.'))
      .finally(() => setLoading(false));
  }, []);

  // Filter and group staff by position
  let captain = null, secretary = null, treasurer = null, skChairman = null, others = [];
  staff.forEach(o => {
    const pos = o.position.toLowerCase();
    if (pos.includes('captain')) captain = o;
    else if (pos.includes('secretary')) secretary = o;
    else if (pos.includes('treasurer')) treasurer = o;
    else if (pos.includes('sk chairman')) skChairman = o;
    else others.push(o);
  });

  // Search filter (applied after grouping)
  function matchesSearch(member) {
    return member.name.toLowerCase().includes(search.toLowerCase()) ||
      member.position.toLowerCase().includes(search.toLowerCase());
  }
  const filteredCaptain = captain && matchesSearch(captain) ? captain : null;
  const filteredSecretary = secretary && matchesSearch(secretary) ? secretary : null;
  const filteredTreasurer = treasurer && matchesSearch(treasurer) ? treasurer : null;
  const filteredSkChairman = skChairman && matchesSearch(skChairman) ? skChairman : null;
  const filteredOthers = others.filter(matchesSearch);

  // Optionally sort 'others' by name
  filteredOthers.sort((a, b) => sortAsc ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name));

  return (
    <>
      <Navbares />
      <Sidebares />
      {/* Animated floating blurred background shapes (copied from Officials) */}
      <div className="fixed inset-0 -z-30 bg-gradient-to-br from-green-100 via-emerald-50 to-white animate-bg-move" />
      <div className="fixed left-1/2 top-44 -translate-x-1/2 w-[80vw] h-[60vh] rounded-3xl bg-green-200/20 blur-2xl shadow-2xl -z-20 animate-float-slow pointer-events-none" />
      {/* Extra floating shapes */}
      <div className="absolute top-24 left-1/4 w-40 h-40 bg-green-200/40 rounded-full blur-3xl animate-float-slow -z-10 pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-32 h-32 bg-emerald-100/50 rounded-full blur-2xl animate-float-slower -z-10 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 w-24 h-24 bg-green-300/30 rounded-full blur-2xl animate-float -z-10 pointer-events-none" />
      {/* Animated SVG wave header (copied from Officials) */}
      <div className="absolute left-0 top-0 w-full h-32 sm:h-48 md:h-64 lg:h-80 z-0 -mt-4">
        <svg viewBox="0 0 1440 320" width="100%" height="100%" className="w-full h-full" preserveAspectRatio="none" style={{ display: 'block' }}>
          <defs>
            <linearGradient id="staffGradient" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#34d399">
                <animate attributeName="stop-color" values="#34d399;#059669;#34d399" dur="6s" repeatCount="indefinite" />
              </stop>
              <stop offset="100%" stopColor="#059669">
                <animate attributeName="stop-color" values="#059669;#34d399;#059669" dur="6s" repeatCount="indefinite" />
              </stop>
            </linearGradient>
          </defs>
          <path fill="url(#staffGradient)" fillOpacity="1"
            d="M0,160 Q360,80 720,160 T1440,160 L1440,0 L0,0 Z">
            <animate attributeName="d" dur="8s" repeatCount="indefinite"
              values="M0,160 Q360,80 720,160 T1440,160 L1440,0 L0,0 Z;
                      M0,160 Q360,120 720,80 T1440,160 L1440,0 L0,0 Z;
                      M0,160 Q360,200 720,120 T1440,160 L1440,0 L0,0 Z;
                      M0,160 Q360,80 720,160 T1440,160 L1440,0 L0,0 Z" />
          </path>
        </svg>
      </div>
      <main className="relative min-h-screen ml-64 pt-36 px-6 pb-16 font-sans overflow-x-hidden flex flex-col items-center justify-center">
        {/* Back Button Row */}
        <div className="w-full max-w-7xl flex items-start justify-between mb-4">
          <button
            onClick={() => navigate('/residents/OrganizationalChart')}
            className="flex items-center gap-2 px-6 py-3 bg-white/80 backdrop-blur-xl border-2 border-green-200 rounded-full shadow-lg text-green-700 font-semibold hover:bg-green-100 hover:text-green-900 hover:shadow-green-300/60 hover:scale-105 transition-all duration-200 z-20 group"
            style={{ boxShadow: '0 4px 16px 0 rgba(52,211,153,0.15)' }}
            title="Back to Organizational Chart"
          >
            <FaArrowLeft className="text-green-500 text-xl" />
            <span className="text-base sm:text-lg">Back</span>
          </button>
          <div className="flex gap-2 items-center">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-green-400" />
              <input
                type="text"
                className="pl-10 pr-4 py-2 rounded-full border border-green-200 bg-white/70 focus:outline-none focus:ring-2 focus:ring-green-300 text-green-900 placeholder:text-green-400"
                placeholder="Search by name or position..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                aria-label="Search staff"
              />
            </div>
            <button
              className="flex items-center px-3 py-2 rounded-full border border-green-200 bg-white/70 hover:bg-green-100 text-green-700 ml-2"
              onClick={() => setSortAsc(s => !s)}
              aria-label="Toggle sort order"
            >
              {sortAsc ? <FaSortAlphaDown /> : <FaSortAlphaUp />}
            </button>
          </div>
        </div>
        {loading && <div className="text-green-700 text-lg font-semibold mt-10 animate-pulse">Loading staff...</div>}
        {error && <div className="text-red-600 text-lg font-semibold mt-10">{error}</div>}
        {!loading && !error && !filteredCaptain && !filteredSecretary && !filteredTreasurer && !filteredSkChairman && filteredOthers.length === 0 && (
          <div className="text-gray-500 text-lg font-semibold mt-10">No staff found.</div>
        )}
        {/* Top row: Barangay Captain */}
        {!loading && !error && filteredCaptain && (
          <>
            <div className="w-full flex flex-col items-center mt-10 animate-fade-in-up">
              <h2 className="text-emerald-800 text-3xl font-extrabold mb-1 text-center tracking-tight drop-shadow-lg">Barangay Captain</h2>
              <span className="block w-24 h-1 rounded-full bg-gradient-to-r from-emerald-400 via-green-300 to-emerald-400 mb-4"></span>
            </div>
            <div className="flex justify-center mb-8 animate-fade-in-up">
              <EnhancedOrgCard member={filteredCaptain} large onClick={() => { setSelectedMember(filteredCaptain); setShowPopover(true); }} />
          </div>
          </>
        )}
        {/* Key Staff: Secretary, Treasurer, SK Chairman */}
        {!loading && !error && (filteredSecretary || filteredTreasurer || filteredSkChairman) && (
          <>
            <div className="w-full flex flex-col items-center mt-4 animate-fade-in-up">
              <h2 className="text-emerald-700 text-xl font-semibold mb-2 text-center w-full">Key Staff</h2>
            </div>
            <div className="flex flex-wrap justify-center gap-10 mb-8 animate-fade-in-up">
              {filteredSecretary && <EnhancedOrgCard member={filteredSecretary} large onClick={() => { setSelectedMember(filteredSecretary); setShowPopover(true); }} />}
              {filteredTreasurer && <EnhancedOrgCard member={filteredTreasurer} large onClick={() => { setSelectedMember(filteredTreasurer); setShowPopover(true); }} />}
              {filteredSkChairman && <EnhancedOrgCard member={filteredSkChairman} large onClick={() => { setSelectedMember(filteredSkChairman); setShowPopover(true); }} />}
            </div>
          </>
        )}
        {/* Other Staff */}
        {!loading && !error && filteredOthers.length > 0 && (
          <>
            <div className="w-full flex flex-col items-center mt-4 animate-fade-in-up">
              <h2 className="text-emerald-600 text-lg font-medium mb-2 text-center w-full">Other Staff</h2>
          </div>
            <div className="flex flex-wrap justify-center gap-10 animate-fade-in-up mt-2">
              {filteredOthers.map((member, idx) => (
                <EnhancedOrgCard key={member.id || member.name} member={member} onClick={() => { setSelectedMember(member); setShowPopover(true); }} />
            ))}
          </div>
          </>
        )}
        <StaffPopover member={selectedMember} show={showPopover} onClose={() => setShowPopover(false)} />
        {/* Animations for background movement and header */}
        <style>{`
          @keyframes bg-move {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
          .animate-bg-move { background-size: 200% 200%; animation: bg-move 18s ease-in-out infinite; }
          @keyframes slide-in {
            0% { opacity: 0; transform: translateY(-40px); }
            100% { opacity: 1; transform: translateY(0); }
          }
          .animate-slide-in { animation: slide-in 1.2s cubic-bezier(0.23, 1, 0.32, 1); }
          @keyframes fade-in-up {
            0% { opacity: 0; transform: translateY(40px); }
            100% { opacity: 1; transform: translateY(0); }
          }
          .animate-fade-in-up { animation: fade-in-up 1s cubic-bezier(0.23, 1, 0.32, 1); }
          @keyframes fade-in {
            0% { opacity: 0; }
            100% { opacity: 1; }
          }
          .animate-fade-in { animation: fade-in 1.5s ease; }
          @keyframes spin-slow { 0% { transform: rotate(0deg);} 100% { transform: rotate(360deg);} }
          .animate-spin-slow { animation: spin-slow 18s linear infinite; }
          @keyframes border-gradient {
            0% { border-color: #34d399; }
            50% { border-color: #059669; }
            100% { border-color: #34d399; }
          }
          .animate-border-gradient { animation: border-gradient 3s linear infinite; }
          @keyframes ripple {
            0% { opacity: 0.5; transform: scale(1); }
            100% { opacity: 0; transform: scale(2.2); }
          }
          .animate-ripple { animation: ripple 0.5s linear; }
          @keyframes float {
            0%,100%{transform:translateY(0);}
            50%{transform:translateY(-18px);}
          }
          .animate-float { animation: float 6s ease-in-out infinite; }
          @keyframes float-slow {
            0%,100%{transform:translateY(0);}
            50%{transform:translateY(-32px);}
          }
          .animate-float-slow { animation: float-slow 12s ease-in-out infinite; }
          @keyframes float-slower {
            0%,100%{transform:translateY(0);}
            50%{transform:translateY(-48px);}
          }
          .animate-float-slower { animation: float-slower 18s ease-in-out infinite; }
          @keyframes dash-move { to { stroke-dashoffset: 30; } }
          .animate-dash-move line { animation: dash-move 2s linear infinite; }
          @keyframes particle1 { 0%,100%{transform:translateY(0);} 50%{transform:translateY(-10px);} }
          .animate-particle1 { animation: particle1 7s ease-in-out infinite; }
          @keyframes particle2 { 0%,100%{transform:translateY(0);} 50%{transform:translateY(12px);} }
          .animate-particle2 { animation: particle2 9s ease-in-out infinite; }
          @keyframes particle3 { 0%,100%{transform:translateY(0);} 50%{transform:translateY(-16px);} }
          .animate-particle3 { animation: particle3 11s ease-in-out infinite; }
          @keyframes particle4 { 0%,100%{transform:translateY(0);} 50%{transform:translateY(8px);} }
          .animate-particle4 { animation: particle4 13s ease-in-out infinite; }
        `}</style>
      </main>
    </>
  );
};

export default Staff;
