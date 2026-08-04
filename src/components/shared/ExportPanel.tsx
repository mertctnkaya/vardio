import type { ExportPanelProps } from "../../types/index";

export default function ExportPanel({ 
  title = "Raporu Dışa Aktar", 
  description = "Bu ayki çalışma dökümünüzü cihazınıza indirin veya yazdırın.", 
  onExportCSV, 
  onPrintPDF, 
  onExportJSON 
}: ExportPanelProps) {
  return (
    <div className="w-full max-w-4xl mt-4 bg-[#1e2329] rounded-xl border border-base-300 p-6 shadow-lg animate-fade-in print:hidden">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <h4 className="font-bold text-base-content text-lg">{title}</h4>
          <p className="text-sm text-base-content/60 mt-1">{description}</p>
        </div>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <button onClick={onExportCSV} className="btn btn-sm sm:btn-md p-3 sm:p-3 bg-green-900/30 text-green-400 hover:bg-green-600 hover:text-white border-green-500/30 flex-1 sm:flex-none">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            Excel (CSV)
          </button>
          <button onClick={onPrintPDF} className="btn btn-sm sm:btn-md p-3 sm:p-3 bg-red-900/30 text-red-400 hover:bg-red-600 hover:text-white border-red-500/30 flex-1 sm:flex-none">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
            Yazdır / PDF
          </button>
          <button onClick={onExportJSON} className="btn btn-sm sm:btn-md p-3 sm:p-3 btn-ghost bg-gray-700 border-base-300 text-base-content/60 hover:bg-base-200 flex-1 sm:flex-none" title="Ham Veri Yedeği">
            JSON
          </button>
        </div>
      </div>
    </div>
  );
}