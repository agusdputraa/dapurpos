import React from 'react';
import { Download, FileDown } from 'lucide-react';
import { exportData, downloadExportFile, generateTemplateFile } from '../utils/export';

interface DataImportExportProps {
  onComplete: () => void;
}

export default function DataImportExport({ onComplete }: DataImportExportProps) {
  const handleExport = () => {
    const data = exportData();
    downloadExportFile(data);
    onComplete();
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={handleExport}
          className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center gap-2"
        >
          <Download className="w-4 h-4" />
          Export Data
        </button>

        <button
          onClick={generateTemplateFile}
          className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center justify-center gap-2"
        >
          <FileDown className="w-4 h-4" />
          Download Template
        </button>
      </div>
    </div>
  );
}