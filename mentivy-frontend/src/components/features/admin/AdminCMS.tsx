'use client';

import React, { useState, useEffect } from 'react';
import { 
  FolderTree, FileQuestion, Plus, Trash2, 
  Loader2, AlertCircle, CheckCircle2 
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { 
  adminCreateTopic, adminDeleteTopic, 
  adminGetQuestions, adminCreateQuestion, adminDeleteQuestion 
} from '@/app/actions/admin-actions';

interface Topic {
  _id: string;
  subjectName: string;
  name: string;
  weightage: number;
}

interface Question {
  _id: string;
  content: string;
  difficulty: number;
  topicId: string;
}

export default function AdminCMS({ initialTopics }: { initialTopics: Topic[] }) {
  const [activeTab, setActiveTab] = useState<'topics' | 'questions'>('topics');
  const [topics, setTopics] = useState<Topic[]>(initialTopics);
  
  // Topic Modal State
  const [isTopicModalOpen, setIsTopicModalOpen] = useState(false);
  const [newTopic, setNewTopic] = useState({ subjectName: '', name: '', weightage: 5 });
  
  // Questions State
  const [selectedTopicId, setSelectedTopicId] = useState<string>('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);
  
  // Question Modal State
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [newQuestion, setNewQuestion] = useState({
    content: '', options: ['', '', '', ''], correctOptionIndex: 0, explanation: '', difficulty: 3, tags: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const fetchQuestions = async (tId: string) => {
    setIsLoadingQuestions(true);
    const result = await adminGetQuestions(tId);
    if (result.success) {
      setQuestions(result.data);
    }
    setIsLoadingQuestions(false);
  };

  useEffect(() => {
    if (activeTab === 'questions' && selectedTopicId) {
      fetchQuestions(selectedTopicId);
    }
  }, [activeTab, selectedTopicId]);

  const handleCreateTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const res = await adminCreateTopic(newTopic);
    if (res.success) {
      setTopics([...topics, res.data]);
      setIsTopicModalOpen(false);
      setNewTopic({ subjectName: '', name: '', weightage: 5 });
    } else {
      setMessage(res.error);
    }
    setIsLoading(false);
  };

  const handleDeleteTopic = async (id: string) => {
    if (!confirm('Are you sure? This will delete the topic and all its questions.')) return;
    const res = await adminDeleteTopic(id);
    if (res.success) {
      setTopics(topics.filter(t => t._id !== id));
      if (selectedTopicId === id) setSelectedTopicId('');
    } else {
      alert(res.error);
    }
  };

  const handleCreateQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const payload = {
      ...newQuestion,
      topicId: selectedTopicId,
      tags: newQuestion.tags.split(',').map(t => t.trim()).filter(Boolean)
    };
    const res = await adminCreateQuestion(payload);
    if (res.success) {
      setQuestions([res.data, ...questions]);
      setIsQuestionModalOpen(false);
      setNewQuestion({ content: '', options: ['', '', '', ''], correctOptionIndex: 0, explanation: '', difficulty: 3, tags: '' });
    } else {
      setMessage(res.error);
    }
    setIsLoading(false);
  };

  const handleDeleteQuestion = async (id: string) => {
    if (!confirm('Are you sure?')) return;
    const res = await adminDeleteQuestion(id);
    if (res.success) {
      setQuestions(questions.filter(q => q._id !== id));
    } else {
      alert(res.error);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
      
      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('topics')}
          className={`flex items-center gap-2 px-8 py-4 font-bold text-sm transition-colors ${
            activeTab === 'topics' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <FolderTree className="w-4 h-4" /> Topics
        </button>
        <button
          onClick={() => setActiveTab('questions')}
          className={`flex items-center gap-2 px-8 py-4 font-bold text-sm transition-colors ${
            activeTab === 'questions' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <FileQuestion className="w-4 h-4" /> Questions
        </button>
      </div>

      <div className="p-8">
        {/* TOPICS TAB */}
        {activeTab === 'topics' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-900">Manage Topics</h3>
              <Button onClick={() => setIsTopicModalOpen(true)} className="gap-2">
                <Plus className="w-4 h-4" /> Add Topic
              </Button>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-800 font-semibold">
                  <tr>
                    <th className="px-6 py-4">Subject</th>
                    <th className="px-6 py-4">Topic Name</th>
                    <th className="px-6 py-4">Weightage</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {topics.map(topic => (
                    <tr key={topic._id} className="hover:bg-slate-50">
                      <td className="px-6 py-4">{topic.subjectName}</td>
                      <td className="px-6 py-4 font-medium text-slate-900">{topic.name}</td>
                      <td className="px-6 py-4">{topic.weightage}</td>
                      <td className="px-6 py-4 text-right">
                        <button onClick={() => handleDeleteTopic(topic._id)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {topics.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-slate-500">No topics found. Create one above!</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* QUESTIONS TAB */}
        {activeTab === 'questions' && (
          <div>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
              <h3 className="text-xl font-bold text-slate-900">Manage Questions</h3>
              
              <div className="flex items-center gap-4 w-full md:w-auto">
                <select 
                  className="flex h-10 w-full md:w-64 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                  value={selectedTopicId}
                  onChange={(e) => setSelectedTopicId(e.target.value)}
                >
                  <option value="" disabled>Select a Topic</option>
                  {topics.map(t => <option key={t._id} value={t._id}>{t.subjectName} - {t.name}</option>)}
                </select>

                <Button 
                  onClick={() => setIsQuestionModalOpen(true)} 
                  disabled={!selectedTopicId}
                  className="gap-2 shrink-0"
                >
                  <Plus className="w-4 h-4" /> Add Question
                </Button>
              </div>
            </div>

            {!selectedTopicId ? (
              <div className="py-12 text-center text-slate-500 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50">
                Please select a topic from the dropdown to view its questions.
              </div>
            ) : isLoadingQuestions ? (
              <div className="py-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary-500" /></div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-left text-sm text-slate-600">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-800 font-semibold">
                    <tr>
                      <th className="px-6 py-4 w-2/3">Question Content</th>
                      <th className="px-6 py-4">Difficulty</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {questions.map(q => (
                      <tr key={q._id} className="hover:bg-slate-50">
                        <td className="px-6 py-4 truncate max-w-md">{q.content}</td>
                        <td className="px-6 py-4">{q.difficulty}</td>
                        <td className="px-6 py-4 text-right">
                          <button onClick={() => handleDeleteQuestion(q._id)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {questions.length === 0 && (
                      <tr>
                        <td colSpan={3} className="px-6 py-8 text-center text-slate-500">No questions found for this topic.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* TOPIC MODAL */}
      {isTopicModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-xl">
            <h3 className="text-xl font-bold mb-6">Create New Topic</h3>
            <form onSubmit={handleCreateTopic} className="space-y-4">
              {message && <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">{message}</div>}
              <div>
                <Label>Subject Name</Label>
                <Input value={newTopic.subjectName} onChange={e => setNewTopic({...newTopic, subjectName: e.target.value})} placeholder="e.g. Quantitative Aptitude" required />
              </div>
              <div>
                <Label>Topic Name</Label>
                <Input value={newTopic.name} onChange={e => setNewTopic({...newTopic, name: e.target.value})} placeholder="e.g. Percentage" required />
              </div>
              <div>
                <Label>Weightage (1-10)</Label>
                <Input type="number" min="1" max="10" value={newTopic.weightage} onChange={e => setNewTopic({...newTopic, weightage: parseInt(e.target.value)})} required />
              </div>
              <div className="flex gap-3 mt-6">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setIsTopicModalOpen(false)}>Cancel</Button>
                <Button type="submit" className="flex-1" isLoading={isLoading}>Create</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QUESTION MODAL */}
      {isQuestionModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-8 max-w-2xl w-full shadow-xl my-8">
            <h3 className="text-xl font-bold mb-6">Add New Question</h3>
            <form onSubmit={handleCreateQuestion} className="space-y-4">
              {message && <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">{message}</div>}
              <div>
                <Label>Question Content</Label>
                <textarea 
                  className="flex w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 mt-1 min-h-[80px]"
                  value={newQuestion.content} onChange={e => setNewQuestion({...newQuestion, content: e.target.value})} required 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                {newQuestion.options.map((opt, i) => (
                  <div key={i}>
                    <Label>Option {String.fromCharCode(65 + i)}</Label>
                    <Input value={opt} onChange={e => {
                      const newOpts = [...newQuestion.options];
                      newOpts[i] = e.target.value;
                      setNewQuestion({...newQuestion, options: newOpts});
                    }} required />
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Correct Option Index (0-3)</Label>
                  <select 
                    className="flex h-10 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 mt-1"
                    value={newQuestion.correctOptionIndex}
                    onChange={e => setNewQuestion({...newQuestion, correctOptionIndex: parseInt(e.target.value)})}
                  >
                    {[0,1,2,3].map(n => <option key={n} value={n}>Option {String.fromCharCode(65 + n)}</option>)}
                  </select>
                </div>
                <div>
                  <Label>Difficulty (1-5)</Label>
                  <Input type="number" min="1" max="5" value={newQuestion.difficulty} onChange={e => setNewQuestion({...newQuestion, difficulty: parseInt(e.target.value)})} required />
                </div>
              </div>
              <div>
                <Label>Explanation</Label>
                <textarea 
                  className="flex w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 mt-1 min-h-[60px]"
                  value={newQuestion.explanation} onChange={e => setNewQuestion({...newQuestion, explanation: e.target.value})} 
                />
              </div>
              <div>
                <Label>Tags (comma separated)</Label>
                <Input value={newQuestion.tags} onChange={e => setNewQuestion({...newQuestion, tags: e.target.value})} placeholder="e.g. basics, hard" />
              </div>

              <div className="flex gap-3 mt-8">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setIsQuestionModalOpen(false)}>Cancel</Button>
                <Button type="submit" className="flex-1" isLoading={isLoading}>Add Question</Button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
