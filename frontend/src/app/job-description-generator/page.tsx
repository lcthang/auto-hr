'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { llmService } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { 
  DocumentTextIcon,
  ClipboardDocumentIcon,
  ArrowLeftIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

interface JDGeneratorForm {
  job_title: string;
  company_name: string;
  location: string;
  tone: string;
  job_details: string;
}

interface Template {
  title: string;
}

export default function JDGenerator() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedJD, setGeneratedJD] = useState<string>('');
  const [showPreview, setShowPreview] = useState(false);
  const [templates, setTemplates] = useState<Record<string, Template>>({});
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');

  const [form, setForm] = useState<JDGeneratorForm>({
    job_title: '',
    company_name: '',
    location: '',
    tone: 'professional',
    job_details: ''
  });

  const tones = ['Professional', 'Casual', 'Formal', 'Creative'];

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const data = await llmService.getJobDescriptionTemplates();
      setTemplates(data.templates);
    } catch (error) {
      console.error('Error fetching templates:', error);
    }
  };

  const handleInputChange = (field: keyof JDGeneratorForm, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };



  const applyTemplate = (templateKey: string) => {
    const template = templates[templateKey];
    if (template) {
      setForm(prev => ({
        ...prev,
        job_title: template.title
      }));
      setSelectedTemplate(templateKey);
    }
  };

  const generateJobDescription = async () => {
    setIsGenerating(true);
    try {
      const data = await llmService.generateJobDescription(form);
      setGeneratedJD(data.job_description);
      setShowPreview(true);
    } catch (error) {
      console.error('Error generating job description:', error);
      alert('Failed to generate job description. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedJD);
      alert('Job description copied to clipboard!');
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => router.push('/dashboard')}
                className="flex items-center text-gray-600 hover:text-gray-900 mr-4"
              >
                <ArrowLeftIcon className="h-5 w-5 mr-2" />
                Back to Dashboard
              </button>
              <div className="flex items-center space-x-3">
                <div className="inline-flex items-center justify-center w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl">
                  <DocumentTextIcon className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900">JD Generator</span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Header */}
          <div className="bg-white overflow-hidden shadow rounded-lg mb-6">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <SparklesIcon className="h-8 w-8 text-blue-600 mr-3" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Job Description Generator
                  </h1>
                  <p className="text-gray-600 mt-1">
                    Create professional job descriptions with AI assistance
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Form Section */}
            <div className="lg:col-span-1">
              <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">
                    Job Details
                  </h3>

                  {/* Templates */}
                  {Object.keys(templates).length > 0 && (
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Quick Templates
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(templates).map(([key, template]) => (
                          <button
                            key={key}
                            onClick={() => applyTemplate(key)}
                            className={`px-3 py-1 text-sm rounded-full border ${
                              selectedTemplate === key
                                ? 'bg-blue-100 border-blue-300 text-blue-700'
                                : 'bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100'
                            }`}
                          >
                            {template.title}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="space-y-4">
                    {/* Basic Information */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Job Title *
                      </label>
                      <input
                        type="text"
                        value={form.job_title}
                        onChange={(e) => handleInputChange('job_title', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="e.g., Senior Software Engineer"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Company Name *
                      </label>
                      <input
                        type="text"
                        value={form.company_name}
                        onChange={(e) => handleInputChange('company_name', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="e.g., TechCorp Inc."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Location
                      </label>
                      <input
                        type="text"
                        value={form.location}
                        onChange={(e) => handleInputChange('location', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="e.g., San Francisco, CA"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tone
                      </label>
                      <select
                        value={form.tone}
                        onChange={(e) => handleInputChange('tone', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        {tones.map(tone => (
                          <option key={tone} value={tone.toLowerCase()}>{tone}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Job Details
                    </label>
                    <textarea
                      value={form.job_details}
                      onChange={(e) => handleInputChange('job_details', e.target.value)}
                      rows={5}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Include details such as Skills, Education, Certification, Industry, Years of Experience or Salary requirements."
                    />
                  </div>



                  {/* Generate Button */}
                  <div className="mt-8">
                    <button
                      onClick={generateJobDescription}
                      disabled={isGenerating || !form.job_title || !form.company_name}
                      className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                      {isGenerating ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          Generating...
                        </>
                      ) : (
                        <>
                          <SparklesIcon className="h-5 w-5 mr-2" />
                          Generate Job Description
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Preview Section */}
            <div className="lg:col-span-1">
              <div className="bg-white shadow rounded-lg sticky top-6">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">
                    Preview
                  </h3>
                  
                  {showPreview && generatedJD ? (
                    <div className="space-y-4">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="prose prose-sm max-w-none">
                          <div dangerouslySetInnerHTML={{ 
                            __html: generatedJD
                              .replace(/\*\*(.+?)\*\*/g, '<strong>$1<\/strong>')
                              .replace(/\n/g, '<br>')
                              .replace(/# (.*)/g, '<h1 class="text-xl font-bold text-gray-900">$1<\/h1>')
                              .replace(/## (.*)/g, '<h2 class="text-lg font-semibold text-gray-800 mt-4">$1<\/h2>')
                              .replace(/• (.*)/g, '<li class="ml-4">$1<\/li>')
                          }} />
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <button
                          onClick={copyToClipboard}
                          className="flex-1 bg-blue-600 text-white py-2 px-3 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center justify-center"
                        >
                          <ClipboardDocumentIcon className="h-4 w-4 mr-2" />
                          Copy
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <DocumentTextIcon className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                      <p>Fill out the form and generate a job description to see the preview here.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
