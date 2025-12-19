// components/documents/IntelligentSearch.tsx
import React, { useState, useEffect } from 'react';
import { searchApi } from '../../lib/documentApi';
import type { PatientDocument } from '../../lib/document.types';
import { Search, Sparkles, X, TrendingUp } from 'lucide-react';

interface Props {
  patientId: number;
  onDocumentClick?: (document: PatientDocument) => void;
}

export const IntelligentSearch: React.FC<Props> = ({ patientId, onDocumentClick }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<PatientDocument[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [searching, setSearching] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSuggestions();
  }, [patientId]);

  const loadSuggestions = async () => {
    try {
      const response = await searchApi.getSuggestions(patientId);
      if (response.data) {
        setSuggestions(response.data.suggested_searches);
      }
    } catch (err) {
      console.error('Error loading suggestions:', err);
    }
  };

  const handleSearch = async () => {
    if (query.trim().length < 3) {
      setError('Veuillez entrer au moins 3 caractères');
      return;
    }

    setSearching(true);
    setError(null);
    setSearched(false);

    try {
      const response = await searchApi.search(patientId, query);
      setResults(response.data);
      setSearched(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la recherche');
      setResults([]);
    } finally {
      setSearching(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    // Auto-search après sélection
    setTimeout(() => {
      handleSearch();
    }, 100);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setSearched(false);
    setError(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      {/* Barre de recherche */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="h-6 w-6" />
          <h3 className="text-lg font-semibold">Recherche Intelligente</h3>
        </div>
        <p className="text-blue-100 mb-4 text-sm">
          Posez votre question en langage naturel. L'IA comprendra votre demande.
        </p>

        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ex: Mes dernières analyses de sang de mars..."
            className="w-full px-4 py-3 pr-24 rounded-lg text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-white focus:outline-none"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
            {query && (
              <button
                onClick={clearSearch}
                className="p-1 hover:bg-gray-200 rounded transition-colors"
              >
                <X className="h-5 w-5 text-gray-600" />
              </button>
            )}
            <button
              onClick={handleSearch}
              disabled={searching || query.trim().length < 3}
              className="px-4 py-2 bg-white text-blue-600 rounded-lg hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors flex items-center gap-2"
            >
              {searching ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
              ) : (
                <Search className="h-5 w-5" />
              )}
              <span>Chercher</span>
            </button>
          </div>
        </div>

        {/* Suggestions */}
        {!searched && suggestions.length > 0 && (
          <div className="mt-4">
            <p className="text-sm text-blue-100 mb-2 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Suggestions :
            </p>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((suggestion, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="px-3 py-1 bg-white/20 hover:bg-white/30 rounded-full text-sm transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Erreur */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error}
        </div>
      )}

      {/* Résultats */}
      {searched && (
        <div>
          <h4 className="text-lg font-semibold text-gray-900 mb-4">
            Résultats de recherche {results.length > 0 && `(${results.length})`}
          </h4>

          {results.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <Search className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-600">Aucun document trouvé pour cette recherche</p>
              <p className="text-sm text-gray-500 mt-2">
                Essayez avec d'autres mots-clés ou reformulez votre question
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {results.map((doc) => (
                <div
                  key={doc.id}
                  onClick={() => onDocumentClick?.(doc)}
                  className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md hover:border-blue-300 transition-all cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h5 className="font-semibold text-gray-900 flex-1">
                      {doc.file_name}
                    </h5>
                    {doc.relevance_score !== undefined && doc.relevance_score > 0 && (
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium ml-2">
                        Pertinence: {doc.relevance_score}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded">
                      {doc.document_type_label}
                    </span>
                    <span>{formatDate(doc.uploaded_at)}</span>
                    <span>{doc.file_size_human}</span>
                  </div>

                  {/* Tags */}
                  {doc.ai_tags && doc.ai_tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {doc.ai_tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-purple-50 text-purple-700 text-xs rounded-full"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Extrait de texte */}
                  {doc.extracted_text && (
                    <p className="mt-3 text-sm text-gray-600 line-clamp-2">
                      {doc.extracted_text.substring(0, 200)}...
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};