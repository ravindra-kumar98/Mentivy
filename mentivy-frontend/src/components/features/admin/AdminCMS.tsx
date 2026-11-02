'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  FolderTree, FileQuestion, Plus, Trash2, Edit3, 
  UploadCloud, Download, Search, Sparkles, Loader2, 
  AlertCircle, CheckCircle2, Eye, Code, HelpCircle, X
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import LatexRenderer from '@/components/ui/LatexRenderer';
import { 
  adminCreateTopic, adminUpdateTopic, adminDeleteTopic, 
  adminGetQuestions, adminCreateQuestion, adminUpdateQuestion, 
  adminDeleteQuestion, adminBulkImportQuestions 
} from '@/app/actions/admin-actions';
import { useAuthStore } from '@/store/useAuthStore';

interface Topic {
  _id: string;
  subjectName: string;
  name: string;
  weightage: number;
}

interface Question {
  _id: string;
  content: string;
  options: string[];
  correctOptionIndex: number;
  explanation?: string;
  difficulty: number;
  tags?: string[];
  topicId: string;
}

interface AdminCMSProps {
  initialTopics: Topic[];
  initialFields?: string[];
  allFields?: string[];
  userRole?: string;
}

export default function AdminCMS({ 
  initialTopics, 
  initialFields = [], 
  allFields = [], 
  userRole 
}: AdminCMSProps) {
  const { user: currentAuthUser } = useAuthStore();
  const effectiveRole = userRole || currentAuthUser?.role || 'ADMIN';
  const isTeacher = effectiveRole === 'ADMIN';

  // Live fields directly from database session with fallback to auth store
  const teacherFields = initialFields.length > 0 
    ? initialFields 
    : (currentAuthUser?.assignedFields || []);

  const [activeTab, setActiveTab] = useState<'topics' | 'questions'>('topics');
  const [topics, setTopics] = useState<Topic[]>(initialTopics);

  useEffect(() => {
    if (initialFields.length > 0 && currentAuthUser) {
      if (!currentAuthUser.assignedFields || currentAuthUser.assignedFields.length !== initialFields.length) {
        useAuthStore.getState().updateUser({ assignedFields: initialFields });
      }
    }
  }, [initialFields, currentAuthUser]);
  
  // ─── TOPIC MODALS & EDIT STATE ──────────────────────────────────────────────
  const [isTopicModalOpen, setIsTopicModalOpen] = useState(false);
  const [editingTopic, setEditingTopic] = useState<Topic | null>(null);
  const [topicForm, setTopicForm] = useState({ subjectName: '', name: '', weightage: 5 });
  const [topicSearch, setTopicSearch] = useState('');
  
  // ─── QUESTIONS STATE & FILTERS ──────────────────────────────────────────────
  const [selectedTopicId, setSelectedTopicId] = useState<string>('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);
  const [questionSearch, setQuestionSearch] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('ALL');
  
  // ─── QUESTION CREATE / EDIT MODAL ───────────────────────────────────────────
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState<'edit' | 'preview'>('edit');
  const [questionForm, setQuestionForm] = useState({
    content: '',
    options: ['', '', '', ''],
    correctOptionIndex: 0,
    explanation: '',
    difficulty: 3,
    tags: ''
  });

  // ─── BULK IMPORT MODAL ──────────────────────────────────────────────────────
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [bulkFileText, setBulkFileText] = useState('');
  const [parsedBulkQuestions, setParsedBulkQuestions] = useState<any[]>([]);
  const [bulkParseError, setBulkParseError] = useState('');
  const [isImportingBulk, setIsImportingBulk] = useState(false);
  const [bulkImportSuccess, setBulkImportSuccess] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  // ─── FETCH QUESTIONS ────────────────────────────────────────────────────────
  const fetchQuestions = async (tId: string, q = questionSearch, diff = difficultyFilter) => {
    if (!tId) return;
    setIsLoadingQuestions(true);
    const result = await adminGetQuestions(tId, q, diff);
    if (result.success && result.data) {
      setQuestions(result.data);
    }
    setIsLoadingQuestions(false);
  };

  useEffect(() => {
    if (activeTab === 'questions' && selectedTopicId) {
      fetchQuestions(selectedTopicId, questionSearch, difficultyFilter);
    }
  }, [activeTab, selectedTopicId, difficultyFilter]);

  // Set default selected topic if none selected
  useEffect(() => {
    if (topics.length > 0 && !selectedTopicId) {
      setSelectedTopicId(topics[0]._id);
    }
  }, [topics]);

  // ─── TOPIC ACTIONS ──────────────────────────────────────────────────────────
  const openCreateTopic = () => {
    setEditingTopic(null);
    setTopicForm({ subjectName: '', name: '', weightage: 5 });
    setMessage('');
    setIsTopicModalOpen(true);
  };

  const openEditTopic = (topic: Topic) => {
    setEditingTopic(topic);
    setTopicForm({ subjectName: topic.subjectName, name: topic.name, weightage: topic.weightage });
    setMessage('');
    setIsTopicModalOpen(true);
  };

  const handleSaveTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    if (editingTopic) {
      const res = await adminUpdateTopic(editingTopic._id, topicForm);
      if (res.success) {
        setTopics(topics.map(t => t._id === editingTopic._id ? res.data : t));
        setIsTopicModalOpen(false);
      } else {
        setMessage(res.error || 'Failed to update topic');
      }
    } else {
      const res = await adminCreateTopic(topicForm);
      if (res.success) {
        setTopics([...topics, res.data]);
        if (!selectedTopicId) setSelectedTopicId(res.data._id);
        setIsTopicModalOpen(false);
      } else {
        setMessage(res.error || 'Failed to create topic');
      }
    }
    setIsLoading(false);
  };

  const handleDeleteTopic = async (id: string) => {
    if (!confirm('Are you sure? This will delete the topic and all its questions.')) return;
    const res = await adminDeleteTopic(id);
    if (res.success) {
      setTopics(topics.filter(t => t._id !== id));
      if (selectedTopicId === id) {
        const remaining = topics.filter(t => t._id !== id);
        setSelectedTopicId(remaining.length > 0 ? remaining[0]._id : '');
      }
    } else {
      alert(res.error || 'Failed to delete topic');
    }
  };

  // ─── QUESTION ACTIONS ───────────────────────────────────────────────────────
  const openCreateQuestion = () => {
    setEditingQuestionId(null);
    setPreviewMode('edit');
    setQuestionForm({
      content: '',
      options: ['', '', '', ''],
      correctOptionIndex: 0,
      explanation: '',
      difficulty: 3,
      tags: ''
    });
    setMessage('');
    setIsQuestionModalOpen(true);
  };

  const openEditQuestion = (q: Question) => {
    setEditingQuestionId(q._id);
    setPreviewMode('edit');
    setQuestionForm({
      content: q.content,
      options: q.options && q.options.length >= 4 ? q.options : [...(q.options || []), '', '', '', ''].slice(0, 4),
      correctOptionIndex: q.correctOptionIndex || 0,
      explanation: q.explanation || '',
      difficulty: q.difficulty || 3,
      tags: (q.tags || []).join(', ')
    });
    setMessage('');
    setIsQuestionModalOpen(true);
  };

  const handleSaveQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    const payload = {
      ...questionForm,
      topicId: selectedTopicId,
      tags: questionForm.tags.split(',').map(t => t.trim()).filter(Boolean)
    };

    if (editingQuestionId) {
      const res = await adminUpdateQuestion(editingQuestionId, payload);
      if (res.success) {
        setQuestions(questions.map(q => q._id === editingQuestionId ? res.data : q));
        setIsQuestionModalOpen(false);
      } else {
        setMessage(res.error || 'Failed to update question');
      }
    } else {
      const res = await adminCreateQuestion(payload);
      if (res.success) {
        setQuestions([res.data, ...questions]);
        setIsQuestionModalOpen(false);
      } else {
        setMessage(res.error || 'Failed to create question');
      }
    }
    setIsLoading(false);
  };

  const handleDeleteQuestion = async (id: string) => {
    if (!confirm('Are you sure you want to delete this question?')) return;
    const res = await adminDeleteQuestion(id);
    if (res.success) {
      setQuestions(questions.filter(q => q._id !== id));
    } else {
      alert(res.error || 'Failed to delete question');
    }
  };

  // ─── BULK IMPORT ACTIONS ────────────────────────────────────────────────────
  const handleDownloadSampleCsv = () => {
    const csvContent = `content,optionA,optionB,optionC,optionD,correctOptionIndex,explanation,difficulty,tags
"What is the derivative of $f(x) = x^3 + 2x$?","3x^2 + 2","3x^2","2x + 3","6x",0,"Using power rule: $\\frac{d}{dx}(x^3) = 3x^2$ and $\\frac{d}{dx}(2x) = 2$.",2,"calculus, derivatives"
"Which element has atomic number 6?","Carbon","Oxygen","Nitrogen","Hydrogen",0,"Carbon (C) has atomic number 6.",1,"chemistry, periodic-table"
"Solve for $x$: $\\sqrt{x + 5} = 4$","x = 11","x = 9","x = 16","x = 21",0,"Square both sides: $x + 5 = 16 \\implies x = 11$.",2,"algebra"`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'mentivy_questions_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const parseCsvOrJson = (text: string) => {
    setBulkFileText(text);
    setBulkParseError('');
    setBulkImportSuccess(null);

    const trimmed = text.trim();
    if (!trimmed) {
      setParsedBulkQuestions([]);
      return;
    }

    // Try JSON first
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      try {
        const json = JSON.parse(trimmed);
        if (Array.isArray(json)) {
          setParsedBulkQuestions(json);
          return;
        }
      } catch (err: any) {
        setBulkParseError('Invalid JSON format: ' + err.message);
        return;
      }
    }

    // Parse CSV
    try {
      const rows: string[][] = [];
      let currentRow: string[] = [];
      let currentField = '';
      let inQuotes = false;

      for (let i = 0; i < trimmed.length; i++) {
        const char = trimmed[i];
        const nextChar = trimmed[i + 1];

        if (char === '"') {
          if (inQuotes && nextChar === '"') {
            currentField += '"';
            i++; // skip escaped quote
          } else {
            inQuotes = !inQuotes;
          }
        } else if (char === ',' && !inQuotes) {
          currentRow.push(currentField.trim());
          currentField = '';
        } else if ((char === '\r' || char === '\n') && !inQuotes) {
          if (char === '\r' && nextChar === '\n') i++;
          currentRow.push(currentField.trim());
          if (currentRow.some(field => field.length > 0)) {
            rows.push(currentRow);
          }
          currentRow = [];
          currentField = '';
        } else {
          currentField += char;
        }
      }
      if (currentField || currentRow.length > 0) {
        currentRow.push(currentField.trim());
        if (currentRow.some(field => field.length > 0)) {
          rows.push(currentRow);
        }
      }

      if (rows.length < 2) {
        setBulkParseError('CSV must have a header row and at least 1 question row.');
        return;
      }

      const headers = rows[0].map(h => h.toLowerCase().replace(/[^a-z0-9]/g, ''));
      const parsed: any[] = [];

      for (let r = 1; r < rows.length; r++) {
        const row = rows[r];
        if (row.length < 4) continue;

        const rowObj: any = {};
        headers.forEach((h, idx) => {
          rowObj[h] = row[idx] || '';
        });

        const content = rowObj['content'] || row[0];
        const optA = rowObj['optiona'] || row[1] || '';
        const optB = rowObj['optionb'] || row[2] || '';
        const optC = rowObj['optionc'] || row[3] || '';
        const optD = rowObj['optiond'] || row[4] || '';
        const correctIdx = parseInt(rowObj['correctoptionindex'] || rowObj['correctindex'] || row[5] || '0');
        const explanation = rowObj['explanation'] || row[6] || '';
        const difficulty = parseInt(rowObj['difficulty'] || row[7] || '3');
        const tags = rowObj['tags'] || row[8] || '';

        parsed.push({
          content,
          options: [optA, optB, optC, optD].filter(Boolean),
          correctOptionIndex: isNaN(correctIdx) ? 0 : correctIdx,
          explanation,
          difficulty: isNaN(difficulty) ? 3 : difficulty,
          tags: typeof tags === 'string' ? tags.split(',').map(t => t.trim()).filter(Boolean) : []
        });
      }

      setParsedBulkQuestions(parsed);
    } catch (err: any) {
      setBulkParseError('Error parsing CSV: ' + err.message);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      parseCsvOrJson(text);
    };
    reader.readAsText(file);
  };

  const handleExecuteBulkImport = async () => {
    if (!selectedTopicId || parsedBulkQuestions.length === 0) return;
    setIsImportingBulk(true);
    setBulkParseError('');

    const res = await adminBulkImportQuestions({
      topicId: selectedTopicId,
      questions: parsedBulkQuestions
    });

    if (res.success && res.data) {
      setBulkImportSuccess(`🎉 Successfully imported ${res.data.importedCount} questions!`);
      fetchQuestions(selectedTopicId);
      setTimeout(() => {
        setIsBulkModalOpen(false);
        setBulkImportSuccess(null);
        setParsedBulkQuestions([]);
        setBulkFileText('');
      }, 1500);
    } else {
      setBulkParseError(res.error || 'Failed to bulk import questions.');
    }
    setIsImportingBulk(false);
  };

  // Filtered topics list
  const filteredTopics = useMemo(() => {
    if (!topicSearch.trim()) return topics;
    return topics.filter(t => 
      t.name.toLowerCase().includes(topicSearch.toLowerCase()) || 
      t.subjectName.toLowerCase().includes(topicSearch.toLowerCase())
    );
  }, [topics, topicSearch]);

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
      
      {/* CMS Navigation Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          type="button"
          onClick={() => setActiveTab('topics')}
          className={`flex items-center gap-2 px-8 py-4 font-bold text-sm transition-colors cursor-pointer ${
            activeTab === 'topics' ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50/20' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <FolderTree className="w-4 h-4" /> Topics & Syllabus
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('questions')}
          className={`flex items-center gap-2 px-8 py-4 font-bold text-sm transition-colors cursor-pointer ${
            activeTab === 'questions' ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50/20' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <FileQuestion className="w-4 h-4" /> Question Bank Studio
        </button>
      </div>

      <div className="p-6 lg:p-8 space-y-6">

        {/* Teacher Subject Assignment Banner */}
        {isTeacher && (
          <div className="p-4 rounded-2xl bg-indigo-50/80 border border-indigo-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5 text-indigo-950 font-semibold">
              <span className="p-1.5 rounded-xl bg-indigo-100 text-indigo-700">👨‍🏫</span>
              <span>Teacher Subject Access: You are assigned to manage questions & syllabus for:</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {teacherFields.length > 0 ? (
                teacherFields.map((f, i) => (
                  <span key={i} className="px-2.5 py-1 rounded-lg text-xs font-bold bg-white text-indigo-700 border border-indigo-200 shadow-2xs">
                    {f}
                  </span>
                ))
              ) : (
                <span className="text-amber-700 font-bold italic">No subjects assigned yet by Super Admin</span>
              )}
            </div>
          </div>
        )}

        {/* ─── 1. TOPICS TAB ─── */}
        {activeTab === 'topics' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Manage Topics & Exam Weightage</h3>
                <p className="text-xs text-slate-500 mt-1">Organize curriculum chapters across Quantitative Aptitude, Physics, Chemistry, Math, etc.</p>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search topics..."
                    value={topicSearch}
                    onChange={(e) => setTopicSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                  />
                </div>

                <Button onClick={openCreateTopic} className="gap-2 shrink-0 cursor-pointer">
                  <Plus className="w-4 h-4" /> Add Topic
                </Button>
              </div>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-800 font-semibold text-xs uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Subject</th>
                    <th className="px-6 py-4">Chapter / Topic Name</th>
                    <th className="px-6 py-4">Exam Weightage</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {filteredTopics.map((topic) => (
                    <tr key={topic._id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 text-slate-700">
                          {topic.subjectName}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-900">{topic.name}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600">
                          ★ {topic.weightage} / 10
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right space-x-1">
                        <button 
                          type="button"
                          onClick={() => openEditTopic(topic)} 
                          className="text-slate-500 hover:text-primary-600 hover:bg-primary-50 p-2 rounded-xl transition-colors cursor-pointer"
                          title="Edit Topic"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button 
                          type="button"
                          onClick={() => handleDeleteTopic(topic._id)} 
                          className="text-red-500 hover:bg-red-50 p-2 rounded-xl transition-colors cursor-pointer"
                          title="Delete Topic"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredTopics.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                        No topics found. Create a topic using the button above.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ─── 2. QUESTIONS TAB (STUDIO) ─── */}
        {activeTab === 'questions' && (
          <div className="space-y-6">
            
            {/* Action Bar */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
              
              {/* Topic Selector */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full lg:w-auto">
                <Label className="text-xs font-bold uppercase tracking-wider text-slate-500 shrink-0">Select Topic:</Label>
                <select 
                  className="flex h-10 w-full sm:w-64 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary-500"
                  value={selectedTopicId}
                  onChange={(e) => setSelectedTopicId(e.target.value)}
                >
                  <option value="" disabled>Select a Topic</option>
                  {topics.map(t => <option key={t._id} value={t._id}>{t.subjectName} — {t.name}</option>)}
                </select>
              </div>

              {/* Search & Buttons */}
              <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto justify-end">
                
                {/* Search Bar */}
                <form 
                  onSubmit={(e) => { e.preventDefault(); fetchQuestions(selectedTopicId, questionSearch, difficultyFilter); }}
                  className="relative w-full sm:w-56"
                >
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search in questions..."
                    value={questionSearch}
                    onChange={(e) => setQuestionSearch(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                  />
                </form>

                {/* Bulk Import Button */}
                <Button 
                  type="button"
                  variant="outline"
                  onClick={() => setIsBulkModalOpen(true)}
                  disabled={!selectedTopicId}
                  className="gap-1.5 text-xs font-bold cursor-pointer"
                >
                  <UploadCloud className="w-4 h-4 text-primary-600" />
                  <span>Bulk Import</span>
                </Button>

                {/* Add Question Button */}
                <Button 
                  type="button"
                  onClick={openCreateQuestion} 
                  disabled={!selectedTopicId}
                  className="gap-1.5 text-xs font-bold cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Question</span>
                </Button>
              </div>
            </div>

            {/* Difficulty Filter Chips */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
              <span className="text-slate-400 font-semibold shrink-0">Difficulty:</span>
              {[
                { id: 'ALL', label: 'All Levels' },
                { id: '1', label: 'Level 1 (Easy)' },
                { id: '2', label: 'Level 2 (Easy-Med)' },
                { id: '3', label: 'Level 3 (Medium)' },
                { id: '4', label: 'Level 4 (Hard)' },
                { id: '5', label: 'Level 5 (Expert)' },
              ].map((diff) => (
                <button
                  key={diff.id}
                  type="button"
                  onClick={() => setDifficultyFilter(diff.id)}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                    difficultyFilter === diff.id
                      ? 'bg-primary-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {diff.label}
                </button>
              ))}
            </div>

            {/* Questions Table */}
            {!selectedTopicId ? (
              <div className="py-16 text-center text-slate-500 border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50">
                <FileQuestion className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="font-semibold text-slate-700">Please select a topic to view its question bank.</p>
              </div>
            ) : isLoadingQuestions ? (
              <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-400">
                <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
                <p className="text-xs font-semibold">Loading questions...</p>
              </div>
            ) : questions.length === 0 ? (
              <div className="py-16 text-center text-slate-500 border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50">
                <FileQuestion className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="font-bold text-slate-700">No questions found</p>
                <p className="text-xs text-slate-400 mt-1">Add a new question or use Bulk Import to populate this topic.</p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-slate-200">
                <table className="w-full text-left text-sm text-slate-600">
                  <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-800 font-semibold text-xs uppercase tracking-wider">
                    <tr>
                      <th className="px-6 py-4 w-1/2">Question & Formulas</th>
                      <th className="px-6 py-4">Options</th>
                      <th className="px-6 py-4">Difficulty</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {questions.map((q) => (
                      <tr key={q._id} className="hover:bg-slate-50/60 transition-colors">
                        {/* Question Content with Math rendering */}
                        <td className="px-6 py-4">
                          <div className="text-slate-900 font-medium text-xs leading-relaxed max-w-md line-clamp-2">
                            <LatexRenderer content={q.content} inline />
                          </div>
                          {q.tags && q.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1.5">
                              {q.tags.map((tag, tIdx) => (
                                <span key={tIdx} className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-600">
                                  #{tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </td>

                        {/* Options count & correct index */}
                        <td className="px-6 py-4">
                          <div className="text-xs space-y-0.5">
                            <p className="font-bold text-slate-700">{q.options?.length || 0} Options</p>
                            <p className="text-[11px] text-emerald-600 font-semibold">
                              Correct: Option {String.fromCharCode(65 + (q.correctOptionIndex || 0))}
                            </p>
                          </div>
                        </td>

                        {/* Difficulty */}
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${
                            q.difficulty <= 2 
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                              : q.difficulty === 3 
                              ? 'bg-amber-50 text-amber-700 border border-amber-200' 
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}>
                            Lvl {q.difficulty}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4 text-right space-x-1">
                          <button 
                            type="button"
                            onClick={() => openEditQuestion(q)} 
                            className="text-slate-500 hover:text-primary-600 hover:bg-primary-50 p-2 rounded-xl transition-colors cursor-pointer"
                            title="Edit Question"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button 
                            type="button"
                            onClick={() => handleDeleteQuestion(q._id)} 
                            className="text-red-500 hover:bg-red-50 p-2 rounded-xl transition-colors cursor-pointer"
                            title="Delete Question"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

          </div>
        )}

      </div>

      {/* ─── TOPIC CREATE / EDIT MODAL ─── */}
      {isTopicModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold text-slate-900 mb-4">
              {editingTopic ? 'Edit Topic' : 'Create New Topic'}
            </h3>
            
            {message && (
              <div className="mb-4 p-3 bg-red-50 border border-red-100 text-red-600 rounded-xl text-xs font-medium">
                {message}
              </div>
            )}

            <form onSubmit={handleSaveTopic} className="space-y-4">
              <div>
                <Label>Subject Name</Label>
                {isTeacher ? (
                  teacherFields.length > 0 ? (
                    <select
                      value={topicForm.subjectName}
                      onChange={e => setTopicForm({ ...topicForm, subjectName: e.target.value })}
                      className="flex h-10 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary-500 mt-1"
                      required
                    >
                      <option value="" disabled>Select an Assigned Subject</option>
                      {teacherFields.map(f => <option key={f} value={f}>{f}</option>)}
                    </select>
                  ) : (
                    <div className="p-2.5 bg-amber-50 text-amber-800 text-xs rounded-xl border border-amber-200 mt-1 font-medium">
                      No assigned subject fields. Please contact the Super Admin.
                    </div>
                  )
                ) : (
                  <Input 
                    value={topicForm.subjectName} 
                    onChange={e => setTopicForm({ ...topicForm, subjectName: e.target.value })} 
                    placeholder="e.g. Quantitative Aptitude, Physics, Mathematics" 
                    required 
                  />
                )}
              </div>

              <div>
                <Label>Topic / Chapter Name</Label>
                <Input 
                  value={topicForm.name} 
                  onChange={e => setTopicForm({ ...topicForm, name: e.target.value })} 
                  placeholder="e.g. Differentiation, Percentage" 
                  required 
                />
              </div>

              <div>
                <Label>Exam Weightage (1 - 10)</Label>
                <Input 
                  type="number" 
                  min="1" 
                  max="10" 
                  value={topicForm.weightage} 
                  onChange={e => setTopicForm({ ...topicForm, weightage: parseInt(e.target.value) || 5 })} 
                  required 
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-100">
                <Button type="button" variant="outline" className="flex-1 cursor-pointer" onClick={() => setIsTopicModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="flex-1 cursor-pointer" isLoading={isLoading}>
                  {editingTopic ? 'Save Changes' : 'Create Topic'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── QUESTION CREATE / EDIT MODAL WITH LATEX PREVIEW ─── */}
      {isQuestionModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-3xl w-full shadow-2xl border border-slate-100 my-8 animate-in fade-in zoom-in-95 duration-200">
            
            {/* Modal Header with Live Preview Mode Toggle */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
              <div>
                <h3 className="text-xl font-bold text-slate-900">
                  {editingQuestionId ? 'Edit Question & Formulas' : 'Add New Question'}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Use <code>$formula$</code> for inline math or <code>$$formula$$</code> for block formulas.</p>
              </div>

              {/* Mode Toggle Buttons */}
              <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setPreviewMode('edit')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    previewMode === 'edit' ? 'bg-white text-primary-700 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <Code className="w-3.5 h-3.5" />
                  <span>Editor</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewMode('preview')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    previewMode === 'preview' ? 'bg-white text-primary-700 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>LaTeX Preview</span>
                </button>
              </div>
            </div>

            {message && (
              <div className="mb-4 p-3 bg-red-50 border border-red-100 text-red-600 rounded-xl text-xs font-medium">
                {message}
              </div>
            )}

            {/* PREVIEW MODE */}
            {previewMode === 'preview' ? (
              <div className="space-y-6 py-2">
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Question Prompt</span>
                  <div className="mt-2 text-slate-900 text-base font-medium leading-relaxed">
                    {questionForm.content ? <LatexRenderer content={questionForm.content} /> : <span className="text-slate-400 italic">No question prompt entered.</span>}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {questionForm.options.map((opt, i) => (
                    <div 
                      key={i} 
                      className={`p-4 rounded-2xl border-2 transition-all ${
                        questionForm.correctOptionIndex === i
                          ? 'border-emerald-500 bg-emerald-50/50'
                          : 'border-slate-200 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-slate-500">Option {String.fromCharCode(65 + i)}</span>
                        {questionForm.correctOptionIndex === i && (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                            Correct Answer
                          </span>
                        )}
                      </div>
                      <div className="text-sm font-medium text-slate-900">
                        {opt ? <LatexRenderer content={opt} inline /> : <span className="text-slate-400 italic">Empty</span>}
                      </div>
                    </div>
                  ))}
                </div>

                {questionForm.explanation && (
                  <div className="p-5 rounded-2xl bg-indigo-50/50 border border-indigo-100">
                    <span className="text-[10px] uppercase font-bold text-indigo-500 tracking-wider">Explanation</span>
                    <div className="mt-1 text-slate-800 text-xs leading-relaxed">
                      <LatexRenderer content={questionForm.explanation} />
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* EDIT MODE */
              <form onSubmit={handleSaveQuestion} className="space-y-4">
                
                {/* Question Prompt */}
                <div>
                  <Label>Question Content (LaTeX formulas supported)</Label>
                  <textarea 
                    className="flex w-full rounded-2xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 mt-1 min-h-[90px]"
                    placeholder="e.g. Find the value of $\int_{0}^{1} x^2 dx$."
                    value={questionForm.content} 
                    onChange={e => setQuestionForm({ ...questionForm, content: e.target.value })} 
                    required 
                  />
                </div>

                {/* 4 Options */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {questionForm.options.map((opt, i) => (
                    <div key={i}>
                      <Label>Option {String.fromCharCode(65 + i)}</Label>
                      <Input 
                        value={opt} 
                        onChange={e => {
                          const newOpts = [...questionForm.options];
                          newOpts[i] = e.target.value;
                          setQuestionForm({ ...questionForm, options: newOpts });
                        }} 
                        placeholder={`Option ${String.fromCharCode(65 + i)} (e.g. 1/3)`}
                        required 
                      />
                    </div>
                  ))}
                </div>

                {/* Correct Option & Difficulty */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label>Correct Option</Label>
                    <select 
                      className="flex h-10 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 mt-1"
                      value={questionForm.correctOptionIndex}
                      onChange={e => setQuestionForm({ ...questionForm, correctOptionIndex: parseInt(e.target.value) })}
                    >
                      {[0, 1, 2, 3].map(n => (
                        <option key={n} value={n}>Option {String.fromCharCode(65 + n)}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <Label>Difficulty Level (1 = Easy, 5 = Expert)</Label>
                    <select 
                      className="flex h-10 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 mt-1"
                      value={questionForm.difficulty}
                      onChange={e => setQuestionForm({ ...questionForm, difficulty: parseInt(e.target.value) || 3 })}
                    >
                      <option value={1}>Level 1 - Easy</option>
                      <option value={2}>Level 2 - Easy-Medium</option>
                      <option value={3}>Level 3 - Medium</option>
                      <option value={4}>Level 4 - Hard</option>
                      <option value={5}>Level 5 - Expert</option>
                    </select>
                  </div>
                </div>

                {/* Explanation */}
                <div>
                  <Label>Step-by-Step Explanation (Optional)</Label>
                  <textarea 
                    className="flex w-full rounded-2xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 mt-1 min-h-[70px]"
                    placeholder="e.g. Integrate using $\int x^n dx = \frac{x^{n+1}}{n+1}$."
                    value={questionForm.explanation} 
                    onChange={e => setQuestionForm({ ...questionForm, explanation: e.target.value })} 
                  />
                </div>

                {/* Tags */}
                <div>
                  <Label>Tags (Comma separated)</Label>
                  <Input 
                    value={questionForm.tags} 
                    onChange={e => setQuestionForm({ ...questionForm, tags: e.target.value })} 
                    placeholder="e.g. calculus, integrals, jee-main" 
                  />
                </div>

                {/* Footer Buttons */}
                <div className="flex gap-3 pt-4 border-t border-slate-100">
                  <Button type="button" variant="outline" className="flex-1 cursor-pointer" onClick={() => setIsQuestionModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1 cursor-pointer" isLoading={isLoading}>
                    {editingQuestionId ? 'Update Question' : 'Save Question'}
                  </Button>
                </div>
              </form>
            )}

            {previewMode === 'preview' && (
              <div className="flex gap-3 pt-4 border-t border-slate-100">
                <Button type="button" variant="outline" className="flex-1 cursor-pointer" onClick={() => setPreviewMode('edit')}>
                  Back to Edit
                </Button>
                <Button type="button" className="flex-1 cursor-pointer" onClick={handleSaveQuestion} isLoading={isLoading}>
                  {editingQuestionId ? 'Update Question' : 'Save Question'}
                </Button>
              </div>
            )}

          </div>
        </div>
      )}

      {/* ─── 3. BULK CSV / JSON IMPORT MODAL ─── */}
      {isBulkModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl border border-slate-100 my-8 animate-in fade-in zoom-in-95 duration-200">
            
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center">
                  <UploadCloud className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Bulk Import Questions</h3>
                  <p className="text-xs text-slate-500">Upload multiple questions at once into the selected topic.</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsBulkModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {bulkImportSuccess && (
              <div className="mt-4 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl text-emerald-700 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>{bulkImportSuccess}</span>
              </div>
            )}

            {bulkParseError && (
              <div className="mt-4 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-xs font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                <span>{bulkParseError}</span>
              </div>
            )}

            <div className="mt-6 space-y-4">
              
              {/* Sample Template Download */}
              <div className="p-4 rounded-2xl bg-sky-50 border border-sky-100 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-sky-900">Need a template spreadsheet?</p>
                  <p className="text-[11px] text-sky-700 mt-0.5">Download our pre-formatted CSV template with sample math formulas.</p>
                </div>
                <Button 
                  type="button"
                  size="sm"
                  onClick={handleDownloadSampleCsv}
                  className="gap-1.5 bg-sky-600 hover:bg-sky-700 text-white text-xs cursor-pointer shrink-0"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download CSV</span>
                </Button>
              </div>

              {/* Upload File Box */}
              <div>
                <Label className="mb-1 block">Upload CSV or JSON file</Label>
                <input
                  type="file"
                  accept=".csv,.json"
                  onChange={handleFileUpload}
                  className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 file:cursor-pointer cursor-pointer border border-slate-200 rounded-2xl p-2"
                />
              </div>

              {/* Or Paste Raw Text */}
              <div>
                <Label className="mb-1 block">Or paste CSV / JSON content directly</Label>
                <textarea
                  value={bulkFileText}
                  onChange={(e) => parseCsvOrJson(e.target.value)}
                  placeholder={`content,optionA,optionB,optionC,optionD,correctOptionIndex,explanation,difficulty,tags\n"What is 2+2?","3","4","5","6",1,"Basic addition",1,"math"`}
                  className="w-full h-32 p-3 text-xs font-mono bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                />
              </div>

              {/* Parsed Questions Count & Preview */}
              {parsedBulkQuestions.length > 0 && (
                <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-900">
                      ✓ Ready to import {parsedBulkQuestions.length} questions
                    </span>
                    <span className="text-[11px] text-emerald-700">Target Topic: {topics.find(t => t._id === selectedTopicId)?.name}</span>
                  </div>

                  <div className="max-h-36 overflow-y-auto space-y-1.5 text-xs text-slate-700 pr-1">
                    {parsedBulkQuestions.slice(0, 5).map((pq, idx) => (
                      <div key={idx} className="p-2 rounded-xl bg-white border border-emerald-100 truncate">
                        <span className="font-bold text-slate-900 mr-2">Q{idx + 1}.</span>
                        <span>{pq.content}</span>
                      </div>
                    ))}
                    {parsedBulkQuestions.length > 5 && (
                      <p className="text-[11px] text-slate-500 italic text-center">
                        ...and {parsedBulkQuestions.length - 5} more questions
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Footer Actions */}
              <div className="flex gap-3 pt-4 border-t border-slate-100">
                <Button 
                  type="button" 
                  variant="outline" 
                  className="flex-1 cursor-pointer" 
                  onClick={() => setIsBulkModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="button" 
                  className="flex-1 cursor-pointer" 
                  disabled={parsedBulkQuestions.length === 0}
                  isLoading={isImportingBulk}
                  onClick={handleExecuteBulkImport}
                >
                  Import {parsedBulkQuestions.length > 0 ? `${parsedBulkQuestions.length} Questions` : ''}
                </Button>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
