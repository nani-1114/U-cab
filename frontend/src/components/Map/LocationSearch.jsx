import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const LocationSearch = ({ placeholder, onSelect, value = '', label }) => {
  const [query, setQuery] = useState(value);
  const [results, setResults] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (value && value !== query) {
      setQuery(value);
    }
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const searchLocations = async (searchQuery) => {
    if (!searchQuery || searchQuery.length < 3) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      // External third-party geocoding API — keep full URL
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=5&countrycodes=in`
      );
      setResults(response.data);
      setIsOpen(true);
    } catch (error) {
      console.error('Error fetching locations:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      // Don't search if the query is the same as the selected value
      if (query && query !== value) {
        searchLocations(query);
      }
    }, 600);
    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const handleSelect = (item) => {
    setQuery(item.display_name);
    setIsOpen(false);
    onSelect({
      address: item.display_name,
      lat: parseFloat(item.lat),
      lng: parseFloat(item.lon),
    });
  };

  return (
    <div className="position-relative mb-3" ref={dropdownRef}>
      {label && <label className="form-label fw-semibold">{label}</label>}
      <div className="input-group input-group-lg shadow-sm rounded-3">
        <span className="input-group-text bg-white border-end-0 rounded-start-3 text-muted">
          <i className="bi bi-geo-alt-fill"></i>
        </span>
        <input
          type="text"
          className="form-control border-start-0 rounded-end-3 fs-6"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (results.length > 0) setIsOpen(true);
          }}
          style={{ boxShadow: 'none' }}
        />
        {loading && (
          <span className="input-group-text bg-white border-start-0 rounded-end-3">
            <span className="spinner-border spinner-border-sm text-secondary" role="status"></span>
          </span>
        )}
      </div>

      {isOpen && results.length > 0 && (
        <ul className="list-group position-absolute w-100 mt-1 shadow-lg rounded-3 border-0" style={{ zIndex: 1050, maxHeight: '250px', overflowY: 'auto' }}>
          {results.map((item) => (
            <li
              key={item.place_id}
              className="list-group-item list-group-item-action d-flex align-items-center p-3 border-bottom"
              onClick={() => handleSelect(item)}
              style={{ cursor: 'pointer' }}
            >
              <i className="bi bi-geo text-muted me-3 fs-5"></i>
              <span className="fs-6 text-truncate" title={item.display_name}>{item.display_name}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default LocationSearch;
