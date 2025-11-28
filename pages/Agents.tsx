
import React, { useState } from 'react';
import { Agent } from '../types';
import { AgentMap } from '../components/AgentMap';
import { Modal } from '../components/Modal';
import { mockStore } from '../services/mockStore';
import { GoogleAd } from '../components/GoogleAd';

interface AgentsProps {
  agents: Agent[];
}

export const Agents: React.FC<AgentsProps> = ({ agents }) => {
  const [view, setView] = useState<'list' | 'map'>('list');
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [contactModal, setContactModal] = useState<{ type: 'call' | 'whatsapp', value: string, name: string } | null>(null);

  const handleBook = (agentId: string) => {
    const user = mockStore.getCurrentUser();
    if (!user) {
        alert("Please login to book agents.");
        return;
    }
    const result = mockStore.createServiceRequest(user.id, agentId, "Service Request");
    alert(result.message);
    setSelectedAgent(null);
  };

  const handleContactClick = (type: 'call' | 'whatsapp', agent: Agent) => {
      // In a real app, user phone would be used. Here we use a placeholder or agent.phone
      const contactVal = agent.phone || '+2348012345678';
      setContactModal({ type, value: contactVal, name: agent.businessName });
  };

  const confirmContact = () => {
      if (!contactModal) return;
      
      let url = '';
      if (contactModal.type === 'call') {
          url = `tel:${contactModal.value}`;
      } else {
          // Remove '+' and non-digits for whatsapp api
          const cleanPhone = contactModal.value.replace(/\D/g, '');
          url = `https://wa.me/${cleanPhone}`;
      }
      
      window.open(url, '_blank');
      setContactModal(null);
  };

  return (
    <div className="p-6 pb-24 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Find Agents</h2>
        <div className="flex bg-gray-100 p-1 rounded-lg">
          <button 
            onClick={() => setView('list')}
            className={`px-3 py-1 rounded-md text-sm font-medium ${view === 'list' ? 'bg-white shadow text-black' : 'text-gray-500'}`}
          >
            List
          </button>
          <button 
            onClick={() => setView('map')}
            className={`px-3 py-1 rounded-md text-sm font-medium ${view === 'map' ? 'bg-white shadow text-black' : 'text-gray-500'}`}
          >
            Map
          </button>
        </div>
      </div>

      {view === 'map' && (
        <div className="mb-6">
          <AgentMap agents={agents} onSelectAgent={setSelectedAgent} />
        </div>
      )}

      {/* Insert Ad Here */}
      <GoogleAd slotId="9876543210" className="mb-4" />

      <div className="flex-1 overflow-y-auto space-y-4 no-scrollbar">
        {agents.map((agent) => (
          <div 
            key={agent.id} 
            className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:border-black transition-colors group relative"
          >
            <div className="flex items-start gap-4 mb-3" onClick={() => setSelectedAgent(agent)}>
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-xl shrink-0">
                {agent.avatarUrl ? <img src={agent.avatarUrl} className="w-full h-full rounded-full object-cover" /> : '🏪'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between">
                    <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors truncate">{agent.businessName}</h3>
                    <span className="text-[10px] bg-gray-100 px-1.5 py-0.5 rounded text-gray-500 font-mono">{agent.agentNumber}</span>
                </div>
                <p className="text-xs text-gray-500 mb-1">{agent.category} • {agent.subcategories.slice(0, 2).join(', ')}</p>
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-yellow-100 px-1.5 py-0.5 rounded text-yellow-800 font-bold">⭐ {agent.rating}</span>
                  <span className={`text-[10px] font-bold ${agent.isOnline ? 'text-green-600' : 'text-red-500'}`}>{agent.isOnline ? '● Online' : '○ Offline'}</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-3 gap-2 border-t border-gray-50 pt-3">
                <button 
                    onClick={() => handleContactClick('call', agent)}
                    className="flex items-center justify-center gap-1 py-2 bg-gray-50 rounded text-xs font-bold text-gray-700 hover:bg-gray-100"
                >
                    📞 Call
                </button>
                <button 
                    onClick={() => handleContactClick('whatsapp', agent)}
                    className="flex items-center justify-center gap-1 py-2 bg-green-50 rounded text-xs font-bold text-green-700 hover:bg-green-100"
                >
                    💬 WhatsApp
                </button>
                <button 
                    onClick={() => handleBook(agent.id)}
                    className="flex items-center justify-center gap-1 py-2 bg-blue-600 rounded text-xs font-bold text-white hover:bg-blue-700"
                >
                    Book Now
                </button>
            </div>
          </div>
        ))}
      </div>

      {/* Safety Modal */}
      {contactModal && (
          <Modal isOpen={true} onClose={() => setContactModal(null)} title="Confirm Action">
              <div className="text-center p-4">
                  <p className="text-sm text-gray-600 mb-6">
                      You are about to leave the app to contact <strong>{contactModal.name}</strong> via {contactModal.type === 'whatsapp' ? 'WhatsApp' : 'Phone'}.
                  </p>
                  <p className="text-xs text-gray-400 mb-6">
                      For safety, always keep transactions recorded within the POS Wallet app.
                  </p>
                  <div className="flex gap-3">
                      <button onClick={() => setContactModal(null)} className="flex-1 py-3 bg-gray-100 rounded-lg text-sm font-bold">Cancel</button>
                      <button onClick={confirmContact} className="flex-1 py-3 bg-black text-white rounded-lg text-sm font-bold">Continue</button>
                  </div>
              </div>
          </Modal>
      )}

      {/* Agent Details Modal */}
      <Modal 
        isOpen={!!selectedAgent} 
        onClose={() => setSelectedAgent(null)}
        title={selectedAgent?.businessName || 'Agent Details'}
      >
        {selectedAgent && (
          <div className="space-y-4">
             <div className="flex items-center gap-4 mb-4">
                <img src={selectedAgent.avatarUrl || `https://picsum.photos/seed/${selectedAgent.id}/200`} className="w-16 h-16 rounded-full bg-gray-200 object-cover" alt="Agent" />
                <div>
                   <p className="font-bold text-lg">{selectedAgent.name}</p>
                   <p className="text-sm text-gray-500 mb-1">{selectedAgent.isOnline ? '🟢 Online Now' : '⚪ Offline'}</p>
                   <p className="text-xs font-mono bg-gray-100 inline-block px-1 rounded">{selectedAgent.agentNumber}</p>
                </div>
             </div>
             
             <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">Services Offered:</p>
                <div className="flex flex-wrap gap-2">
                  {selectedAgent.subcategories?.map(s => (
                    <span key={s} className="px-2 py-1 bg-gray-100 rounded text-xs text-gray-600">{s}</span>
                  ))}
                </div>
             </div>

             <div className="space-y-2 bg-gray-50 p-3 rounded-lg text-xs text-gray-600">
                 <p>{selectedAgent.description}</p>
                 <p><strong>Hours:</strong> {selectedAgent.workingHours}</p>
                 
                 {selectedAgent.posDetails && (
                     <div className="mt-2 pt-2 border-t border-gray-200">
                         <p><strong>Shop:</strong> {selectedAgent.posDetails.shopAddress}</p>
                     </div>
                 )}
                 {selectedAgent.driverDetails && (
                     <div className="mt-2 pt-2 border-t border-gray-200">
                         <p><strong>Vehicle:</strong> {selectedAgent.driverDetails.vehicleMake} {selectedAgent.driverDetails.vehicleModel} ({selectedAgent.driverDetails.plateNumber})</p>
                     </div>
                 )}
             </div>

             <div className="bg-blue-50 p-4 rounded-lg mt-4">
               <button 
                 className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold shadow-md hover:bg-blue-700"
                 onClick={() => handleBook(selectedAgent.id)}
               >
                 Book Now
               </button>
             </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
