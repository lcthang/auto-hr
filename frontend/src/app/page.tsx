'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

interface UploadResult {
  filename: string;
  success: boolean;
  message: string;
}

export default function Home() {
  const [uploading, setUploading] = useState(false);
  const [results, setResults] = useState<UploadResult[]>([]);
  const [dragActive, setDragActive] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setUploading(true);
    const newResults: UploadResult[] = [];

    for (const file of acceptedFiles) {
      if (file.type !== 'application/pdf') {
        newResults.push({
          filename: file.name,
          success: false,
          message: 'Only PDF files are supported'
        });
        continue;
      }

      try {
        const formData = new FormData();
        formData.append('resume', file);

        const response = await fetch('http://localhost:3001/api/resumes/upload', {
          method: 'POST',
          body: formData,
        });

        const result = await response.json();

        newResults.push({
          filename: file.name,
          success: response.ok,
          message: response.ok ? 'Upload successful' : result.message || 'Upload failed'
        });
      } catch (error) {
        newResults.push({
          filename: file.name,
          success: false,
          message: 'Network error occurred'
        });
      }
    }

    setResults(newResults);
    setUploading(false);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    multiple: true
  });

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Auto-HR Resume Upload
          </h1>
          <p className="text-lg text-gray-600">
            Upload resumes in PDF format for parsing and storage
          </p>
        </div>

        {/* Upload Area */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <input {...getInputProps()} />
            <div className="space-y-4">
              <div className="text-6xl text-gray-400">📄</div>
              <div>
                <p className="text-xl font-semibold text-gray-700 mb-2">
                  {isDragActive ? 'Drop resumes here' : 'Drag & drop resumes here'}
                </p>
                <p className="text-gray-500 mb-4">
                  or click to select files
                </p>
                <p className="text-sm text-gray-400">
                  Supports PDF files only
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Upload Progress */}
        {uploading && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-700">Processing resumes...</span>
            </div>
          </div>
        )}

        {/* Results */}
        {results.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Upload Results
            </h2>
            <div className="space-y-3">
              {results.map((result, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border ${
                    result.success
                      ? 'bg-green-50 border-green-200'
                      : 'bg-red-50 border-red-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="text-lg mr-3">
                        {result.success ? '✅' : '❌'}
                      </span>
                      <span className="font-medium text-gray-900">
                        {result.filename}
                      </span>
                    </div>
                    <span
                      className={`text-sm ${
                        result.success ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {result.message}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
