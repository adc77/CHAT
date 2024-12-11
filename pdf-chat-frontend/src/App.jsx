import { useState, useEffect } from 'react'
import { uploadPDF, askQuestion, getDocuments } from './services/api'

function App() {
  const [documents, setDocuments] = useState([]);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [question, setQuestion] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const docs = await getDocuments();
      setDocuments(docs);
    } catch (error) {
      setError('Error fetching documents');
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setLoading(true);
    try {
      await uploadPDF(file);
      await fetchDocuments();
      setError(null);
      setChatHistory(prev => [...prev, {
        type: 'system',
        content: `Successfully uploaded ${file.name}`
      }]);
    } catch (error) {
      setError('Error uploading file');
    } finally {
      setLoading(false);
    }
  };

  const handleAskQuestion = async (e) => {
    e.preventDefault();
    if (!selectedDoc || !question.trim()) return;

    setLoading(true);
    setChatHistory(prev => [...prev, { type: 'human', content: question }]);
    
    try {
      const response = await askQuestion(selectedDoc.id, question);
      setChatHistory(prev => [...prev, { type: 'assistant', content: response.answer }]);
      setQuestion('');
    } catch (error) {
      setError('Error getting answer');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1F1F1F] flex flex-col">
      {/* Header with Title and Controls */}
      <div className="w-full max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-white mb-8">PDF Chat</h1>
        
        <div className="space-y-4 mb-8">
          {/* Document Selection */}
          <div className="flex flex-col space-y-2">
            <label className="text-sm text-gray-300">Select Document</label>
            <select
              value={selectedDoc?.id || ''}
              onChange={(e) => setSelectedDoc(documents.find(d => d.id === Number(e.target.value)))}
              className="w-full p-3 rounded-lg bg-[#2D2D2D] border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Choose a PDF</option>
              {documents.map((doc) => (
                <option key={doc.id} value={doc.id}>
                  {doc.filename}
                </option>
              ))}
            </select>
          </div>

          {/* File Upload */}
          <div className="flex flex-col space-y-2">
            <label className="text-sm text-gray-300">Upload New PDF</label>
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileUpload}
              className="block w-full text-sm text-gray-300 p-2 rounded-lg bg-[#2D2D2D] border border-gray-600
                file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm 
                file:bg-gray-700 file:text-white hover:file:bg-gray-600"
            />
          </div>
        </div>
      </div>

      {/* Chat Interface */}
      <div className="flex-1 w-full max-w-4xl mx-auto px-4 pb-8 flex flex-col">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto mb-4 space-y-4 min-h-[400px]">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}
          
          {chatHistory.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.type === 'human' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] p-4 rounded-lg ${
                  message.type === 'human'
                    ? 'bg-blue-500 text-white'
                    : message.type === 'system'
                    ? 'bg-gray-700 text-gray-200'
                    : 'bg-gray-800 text-white'
                }`}
              >
                {message.content}
              </div>
            </div>
          ))}
          
          {loading && (
            <div className="flex justify-start">
              <div className="bg-gray-800 text-white p-4 rounded-lg animate-pulse">
                Thinking...
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="bg-[#2D2D2D] rounded-lg p-4">
          <form onSubmit={handleAskQuestion} className="flex gap-3">
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask about the PDF..."
              className="flex-1 p-3 rounded-lg bg-[#1F1F1F] text-white border border-gray-600 
                focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={!selectedDoc || loading}
            />
            <button
              type="submit"
              disabled={!selectedDoc || loading || !question.trim()}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 
                disabled:bg-gray-700 disabled:cursor-not-allowed"
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default App;


