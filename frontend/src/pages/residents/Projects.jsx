import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbares from '../../components/Navbares';
import Sidebares from '../../components/Sidebares';
import axios from '../../utils/axiosConfig';
import { useAuth } from '../../contexts/AuthContext';
import {
  HandThumbUpIcon,
  HeartIcon,
  ChatBubbleLeftRightIcon,
  UserGroupIcon,
  CalendarIcon,
  DocumentTextIcon,
  EyeIcon,
  CheckCircleIcon,
  ClockIcon,
  SparklesIcon,
  TrophyIcon,
  RocketLaunchIcon,
} from "@heroicons/react/24/solid";

const reactionTypes = [
  { type: 'like', icon: HandThumbUpIcon, label: 'Like', color: 'text-blue-600' },
  { type: 'love', icon: HeartIcon, label: 'Love', color: 'text-pink-600' },
];

const Project = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reactionCounts, setReactionCounts] = useState({});
  const [feedbacks, setFeedbacks] = useState({}); // { [projectId]: [feedback, ...] }
  const [commentInput, setCommentInput] = useState({}); // { [projectId]: 'text' }
  const [selectedProject, setSelectedProject] = useState(null);

  // Fetch all projects
  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/projects');
      setProjects(response.data);
    } catch (err) {
      setError('Failed to fetch projects');
    } finally {
      setLoading(false);
    }
  };

  // Fetch reactions and feedbacks for each project
  useEffect(() => {
    if (projects.length > 0) {
      projects.forEach(project => {
        fetchReactionCounts(project.id);
        fetchFeedbacks(project.id);
      });
    }
  }, [projects]);

  const fetchReactionCounts = async (projectId) => {
    try {
      const res = await axios.get(`/projects/${projectId}/reactions`);
      setReactionCounts(prev => ({ ...prev, [projectId]: res.data }));
    } catch {}
  };

  const fetchFeedbacks = async (projectId) => {
    try {
      // You need an endpoint to get feedbacks for a project, e.g. `/projects/{id}/feedbacks`
      const res = await axios.get(`/feedbacks?project_id=${projectId}`);
      setFeedbacks(prev => ({ ...prev, [projectId]: res.data }));
    } catch {}
  };

  const handleReact = async (projectId, reactionType) => {
    if (!user) {
      alert('You must be logged in to react.');
      navigate('/login');
      return;
    }
    try {
      await axios.post(`/projects/${projectId}/react`, { reaction_type: reactionType });
      fetchReactionCounts(projectId);
    } catch (err) {
      alert('You must be logged in to react.');
    }
  };

  const handleAddFeedback = async (e, projectId) => {
    e.preventDefault();
    const message = commentInput[projectId];
    if (!message || !message.trim()) return;
    try {
      await axios.post('/feedbacks', {
        message,
        subject: 'Comment',
        category: 'Project',
        project_id: projectId,
      });
      setCommentInput(prev => ({ ...prev, [projectId]: '' }));
      fetchFeedbacks(projectId);
    } catch (err) {
      alert('You must be logged in to comment.');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Completed':
        return <TrophyIcon className="w-4 h-4" />;
      case 'In Progress':
        return <RocketLaunchIcon className="w-4 h-4" />;
      case 'Planned':
        return <ClockIcon className="w-4 h-4" />;
      default:
        return <DocumentTextIcon className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed':
        return 'from-green-500 to-emerald-500';
      case 'In Progress':
        return 'from-yellow-500 to-orange-500';
      case 'Planned':
        return 'from-blue-500 to-indigo-500';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  return (
    <>
      <Navbares />
      <Sidebares />
      <main className="bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 min-h-screen ml-64 pt-36 px-6 pb-16 font-sans">
        <div className="w-full max-w-7xl mx-auto space-y-8">
          
          {/* Enhanced Header with Animation */}
          <div className="text-center space-y-6 animate-fade-in">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-green-500 via-emerald-500 to-teal-500 rounded-full shadow-2xl mb-6 transform hover:scale-110 transition-all duration-300">
              <SparklesIcon className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-6xl font-bold bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent tracking-tight">
              Community Projects
            </h1>
            <p className="text-gray-600 text-xl max-w-3xl mx-auto leading-relaxed">
              Discover and engage with ongoing barangay development initiatives and community projects
            </p>
            <div className="flex justify-center gap-4">
              <div className="bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 px-6 py-2 rounded-full text-sm font-medium border border-green-200">
                {projects.length} Total Projects
              </div>
              <div className="bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 px-6 py-2 rounded-full text-sm font-medium border border-blue-200">
                {projects.filter(p => p.status === 'Completed').length} Completed
              </div>
            </div>
          </div>

          {/* Enhanced Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-3xl p-8 shadow-xl border border-green-100 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 group">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2">Total Projects</p>
                  <p className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent group-hover:from-emerald-600 group-hover:to-teal-600 transition-all duration-300">{projects.length}</p>
                </div>
                <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-all duration-300">
                  <DocumentTextIcon className="w-8 h-8 text-green-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-3xl p-8 shadow-xl border border-blue-100 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 group">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2">In Progress</p>
                  <p className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent group-hover:from-indigo-600 group-hover:to-blue-600 transition-all duration-300">
                    {projects.filter(p => p.status === 'In Progress').length}
                  </p>
                </div>
                <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-all duration-300">
                  <RocketLaunchIcon className="w-8 h-8 text-blue-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-3xl p-8 shadow-xl border border-emerald-100 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 group">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2">Completed</p>
                  <p className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent group-hover:from-teal-600 group-hover:to-emerald-600 transition-all duration-300">
                    {projects.filter(p => p.status === 'Completed').length}
                  </p>
                </div>
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-all duration-300">
                  <TrophyIcon className="w-8 h-8 text-emerald-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Projects Feed */}
          <div className="space-y-8">
            {loading ? (
              <div className="text-center py-16">
                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-600 mx-auto mb-6"></div>
                <p className="text-gray-600 text-xl font-semibold">Loading community projects...</p>
                <p className="text-gray-400 mt-2">Please wait while we fetch the latest updates</p>
              </div>
            ) : error ? (
              <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 text-red-700 px-8 py-6 rounded-2xl shadow-lg animate-bounce">
                <div className="flex items-center">
                  <svg className="w-8 h-8 mr-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span className="text-lg font-semibold">{error}</span>
                </div>
              </div>
            ) : projects.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                  <DocumentTextIcon className="w-12 h-12 text-gray-400" />
                </div>
                <p className="text-gray-500 text-xl font-semibold mb-2">No projects available</p>
                <p className="text-gray-400">Check back later for new community initiatives</p>
              </div>
            ) : (
              projects.map((project, index) => (
                <div
                  key={project.id}
                  className="bg-white rounded-3xl shadow-xl border border-green-100 p-8 mb-8 transition-all duration-500 hover:shadow-2xl hover:border-green-300 group transform hover:-translate-y-1"
                >
                  {/* Enhanced Header */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex-1">
                      <h2 className="text-3xl font-extrabold text-gray-900 mb-2 tracking-tight group-hover:text-green-600 transition-colors duration-300">
                        {project.name}
                      </h2>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-2">
                          <UserGroupIcon className="w-5 h-5 text-green-500" />
                          <span className="font-medium">{project.owner}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CalendarIcon className="w-5 h-5 text-blue-500" />
                          <span className="font-medium">{formatDate(project.deadline)}</span>
                        </div>
                      </div>
                    </div>
                    {/* Enhanced Status Badge */}
                    <div className={`px-6 py-3 rounded-full text-sm font-bold shadow-lg border-2 border-white bg-gradient-to-r ${getStatusColor(project.status)} text-white flex items-center gap-2`}>
                      {getStatusIcon(project.status)}
                      {project.status}
                    </div>
                  </div>

                  {/* Enhanced Project Photo */}
                  {project.photo && (
                    <div className="flex justify-center mb-8">
                      <div className="relative group">
                        <img
                          src={`http://localhost:8000/${project.photo}`}
                          alt={project.name}
                          className="rounded-2xl w-full max-w-2xl max-h-80 object-cover shadow-2xl border-4 border-white group-hover:scale-105 group-hover:shadow-3xl transition-all duration-500"
                          style={{ aspectRatio: '16/9' }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      </div>
                    </div>
                  )}

                  {/* Enhanced Reactions Bar */}
                  <div className="flex items-center gap-4 mb-8">
                    {reactionTypes.map(({ type, icon: Icon, label, color }) => (
                      <button
                        key={type}
                        onClick={() => handleReact(project.id, type)}
                        className={`flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-green-100 to-emerald-100 hover:from-green-200 hover:to-emerald-200 transition-all duration-300 text-sm font-semibold shadow-md border border-green-200 ${color} transform hover:scale-105`}
                        title={label}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="font-bold">{reactionCounts[project.id]?.[type] || 0}</span>
                      </button>
                    ))}
                    <div className="ml-auto flex items-center gap-2 bg-gradient-to-r from-blue-100 to-indigo-100 px-4 py-2 rounded-full border border-blue-200">
                      <ChatBubbleLeftRightIcon className="w-5 h-5 text-blue-600" />
                      <span className="text-blue-800 font-semibold">{feedbacks[project.id]?.length || 0} Comments</span>
                    </div>
                  </div>

                  {/* Enhanced Comments Section */}
                  <div className="space-y-4 mb-8 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200 shadow-inner">
                    <div className="flex items-center justify-between mb-4">
                      <span className="font-bold text-gray-800 text-xl tracking-tight">Community Comments</span>
                      <span className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-md">
                        {(feedbacks[project.id]?.length || 0)} total
                      </span>
                    </div>
                    {(feedbacks[project.id] || []).length === 0 ? (
                      <div className="text-center py-8">
                        <ChatBubbleLeftRightIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p className="text-gray-400 text-lg">No comments yet. Be the first to share your thoughts!</p>
                      </div>
                    ) : (
                      (feedbacks[project.id] || []).slice(0, 3).map((fb, idx, arr) => (
                        <div key={fb.id} className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 transform hover:scale-105 transition-all duration-300">
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-400 rounded-full flex items-center justify-center font-bold text-white text-lg shadow-lg">
                              {fb.user?.name?.[0] || "R"}
                            </div>
                            <div className="flex-1">
                              <div className="text-base font-bold text-gray-900 mb-1">{fb.user?.name || "Resident"}</div>
                              <div className="text-gray-700 leading-relaxed mb-3">{fb.message}</div>
                              <div className="text-sm text-gray-400 flex items-center gap-2">
                                <CalendarIcon className="w-4 h-4" />
                                {new Date(fb.created_at).toLocaleString()}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                    {(feedbacks[project.id]?.length || 0) > 3 && (
                      <button
                        className="flex items-center gap-3 text-blue-600 hover:text-blue-800 font-bold mt-4 mx-auto px-6 py-3 rounded-full bg-blue-50 hover:bg-blue-100 transition-all duration-300 shadow-md transform hover:scale-105"
                        onClick={() => navigate(`/projects/${project.id}/comments`)}
                      >
                        <ChatBubbleLeftRightIcon className="w-5 h-5" />
                        View all comments
                      </button>
                    )}
                  </div>

                  {/* Enhanced Add Comment Box */}
                  <div className="bg-gradient-to-br from-white to-green-50 rounded-2xl p-8 border-2 border-green-200 shadow-lg">
                    <label htmlFor={`comment-input-${project.id}`} className="block text-lg font-bold text-green-700 mb-4">Share Your Thoughts</label>
                    <form onSubmit={e => handleAddFeedback(e, project.id)} className="space-y-4">
                      <textarea
                        id={`comment-input-${project.id}`}
                        value={commentInput[project.id] || ''}
                        onChange={e => setCommentInput({ ...commentInput, [project.id]: e.target.value })}
                        placeholder="Write your comment about this project..."
                        rows={4}
                        className="w-full border-2 border-green-200 rounded-xl px-6 py-4 text-base focus:outline-none focus:ring-4 focus:ring-green-100 focus:border-green-500 resize-none bg-white transition-all duration-300 shadow-sm"
                        required
                      />
                      <div className="flex justify-end">
                        <button
                          type="submit"
                          className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-8 py-3 rounded-xl text-base font-bold transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center gap-2"
                        >
                          <ChatBubbleLeftRightIcon className="w-5 h-5" />
                          Post Comment
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </>
  );
};

export default Project;
