'use client';

import React, { useState, useEffect } from 'react';
import { Trash2, Share2, Minus, Plus, ExternalLink, Smartphone, Globe } from 'lucide-react';

export default function ListaSpesa() {
  const weekDays = ['Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato', 'Domenica'];
  const allSections = ['extra', ...weekDays];
  
  // Stati base
  const [shoppingLists, setShoppingLists] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('shoppingLists');
      return saved ? JSON.parse(saved) : {
        ...weekDays.reduce((acc, day) => ({ ...acc, [day]: [] }), {}),
        extra: []
      };
    }
    return {
      ...weekDays.reduce((acc, day) => ({ ...acc, [day]: [] }), {}),
      extra: []
    };
  });
  
  const [activeDay, setActiveDay] = useState('extra');
  const [showAllDays, setShowAllDays] = useState(false);
  const [newItem, setNewItem] = useState('');
  
  // Stato per preferenza app/sito
  const [preferApp, setPreferApp] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('preferApp');
      return saved ? JSON.parse(saved) : true;
    }
    return true;
  });

  // Salvataggio automatico
  useEffect(() => {
    localStorage.setItem('shoppingLists', JSON.stringify(shoppingLists));
  }, [shoppingLists]);

  useEffect(() => {
    localStorage.setItem('preferApp', JSON.stringify(preferApp));
  }, [preferApp]);

  // Funzioni di gestione lista
  const addItem = (e) => {
    e.preventDefault();
    if (newItem.trim()) {
      setShoppingLists(prev => ({
        ...prev,
        [activeDay]: [...prev[activeDay], { 
          name: newItem.trim(), 
          checked: false,
          quantity: 1
        }]
      }));
      setNewItem('');
    }
  };

  const removeItem = (day, index) => {
    setShoppingLists(prev => ({
      ...prev,
      [day]: prev[day].filter((_, i) => i !== index)
    }));
  };

  const toggleItem = (day, index) => {
    setShoppingLists(prev => ({
      ...prev,
      [day]: prev[day].map((item, i) => 
        i === index ? { ...item, checked: !item.checked } : item
      )
    }));
  };

  const updateQuantity = (day, index, delta) => {
    setShoppingLists(prev => ({
      ...prev,
      [day]: prev[day].map((item, i) => 
        i === index 
          ? { ...item, quantity: Math.max(1, (item.quantity || 1) + delta) }
          : item
      )
    }));
  };

  // Formattazione lista
  const formatList = () => {
    const allItems = [];
    
    // Prima i prodotti extra
    const extraItems = shoppingLists.extra
      .filter(item => !item.checked)
      .map(item => `${item.name} ${item.quantity > 1 ? `(${item.quantity})` : ''}`);
    
    if (extraItems.length > 0) {
      allItems.push('PRODOTTI EXTRA:', ...extraItems, '');
    }

    // Poi i prodotti dei giorni
    weekDays.forEach(day => {
      const dayItems = shoppingLists[day]
        .filter(item => !item.checked)
        .map(item => `${item.name} ${item.quantity > 1 ? `(${item.quantity})` : ''}`);
      
      if (dayItems.length > 0) {
        allItems.push(day.toUpperCase() + ':', ...dayItems, '');
      }
    });

    return allItems.join('\n').trim();
  };

  const handleShare = async () => {
    const formattedList = formatList();
    
    const esselungaAppUrl = 'esselungaacasa://';
    const esselungaWebUrl = 'https://www.esselungaacasa.it/ecommerce/';
    const targetUrl = preferApp ? esselungaAppUrl : esselungaWebUrl;

    localStorage.setItem('pendingShoppingList', JSON.stringify({
      items: formattedList,
      timestamp: Date.now()
    }));

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Lista della Spesa Esselunga',
          text: formattedList,
          url: targetUrl
        });
      } catch (error) {
        window.location.href = targetUrl;
      }
    } else {
      window.location.href = targetUrl;
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 space-y-4 pb-24 bg-white">
      {/* Header */}
      <div className="py-3">
        <h1 className="text-xl font-bold flex justify-between items-center">
          Lista della Spesa
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setShowAllDays(!showAllDays)}
              className="text-sm bg-gray-100 px-3 py-1 rounded-full"
            >
              {showAllDays ? 'Vista Giorno' : 'Vista Settimana'}
            </button>
          </div>
        </h1>
      </div>

      {/* Toggle App/Sito */}
      <div className="flex gap-2 justify-center p-2 bg-gray-50 rounded-lg">
        <button
          onClick={() => setPreferApp(true)}
          className={`flex items-center gap-1 px-3 py-1 rounded-full ${
            preferApp 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-100'
          }`}
        >
          <Smartphone className="w-4 h-4" />
          App
        </button>
        <button
          onClick={() => setPreferApp(false)}
          className={`flex items-center gap-1 px-3 py-1 rounded-full ${
            !preferApp 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-100'
          }`}
        >
          <Globe className="w-4 h-4" />
          Sito
        </button>
      </div>

      {/* Selezione Giorno */}
      {!showAllDays && (
        <div className="overflow-x-auto -mx-4 px-4 mb-4">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveDay('extra')}
              className={`px-4 py-2 rounded-full w-full ${
                activeDay === 'extra' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-100'
              }`}
            >
              Prodotti Extra
            </button>
            <div className="flex gap-2 flex-wrap">
              {weekDays.map(day => (
                <button
                  key={day}
                  onClick={() => setActiveDay(day)}
                  className={`flex-1 px-4 py-2 rounded-full ${
                    activeDay === day 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-100'
                  }`}
                >
                  {day.slice(0, 3)}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Form Aggiunta */}
      <form onSubmit={addItem} className="mb-4">
        <input
          type="text"
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          placeholder="Aggiungi prodotto..."
          className="w-full p-3 border rounded-xl text-lg"
        />
      </form>
      
      {/* Lista Prodotti */}
      <div className="space-y-4">
        {(showAllDays ? allSections : [activeDay]).map(section => (
          <div key={section}>
            {showAllDays && (
              <h3 className="font-medium mb-2">
                {section === 'extra' ? 'Prodotti Extra' : section}
              </h3>
            )}
            <ul className="space-y-2">
              {shoppingLists[section].map((item, index) => (
                <li 
                  key={index}
                  className="flex items-center justify-between gap-2 p-3 bg-white rounded-xl shadow-sm border"
                >
                  <div className="flex items-center gap-3 flex-grow" 
                       onClick={() => toggleItem(section, index)}>
                    <input
                      type="checkbox"
                      checked={item.checked}
                      onChange={() => toggleItem(section, index)}
                      className="w-5 h-5 rounded-lg"
                    />
                    <span className={`text-lg ${item.checked ? 'line-through text-gray-500' : ''}`}>
                      {item.name}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => updateQuantity(section, index, -1)}
                      className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-6 text-center text-lg">{item.quantity || 1}</span>
                    <button
                      onClick={() => updateQuantity(section, index, 1)}
                      className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => removeItem(section, index)}
                      className="w-8 h-8 flex items-center justify-center bg-red-100 text-red-500 rounded-full ml-2"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Pulsante Condivisione */}
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 flex gap-3">
        <button
          onClick={handleShare}
          className="flex items-center gap-2 px-6 py-3 bg-green-500 text-white rounded-full shadow-lg hover:bg-green-600"
        >
          <ExternalLink className="w-5 h-5" />
          {preferApp ? 'Apri in App Esselunga' : 'Apri sul Sito'}
        </button>
      </div>
    </div>
  );
}
