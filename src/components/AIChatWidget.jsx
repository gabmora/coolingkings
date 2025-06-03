import React, { useState, useRef, useEffect } from 'react';
import { hvacAIAgent, aiAgentUtils } from '../services/aiAgentService';
import './AIChatWidget.css'; // We'll create separate CSS file

const AIChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'ai',
      message: "Hi! I'm K&E HVAC's AI assistant. I can help you with service questions, scheduling, or HVAC troubleshooting. How can I help you today?",
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [customerInfo, setCustomerInfo] = useState(null);
  const [showSchedulingForm, setShowSchedulingForm] = useState(false);
  const [conversationId] = useState(() => Date.now().toString());
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      sender: 'user',
      message: inputMessage.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    try {
      // Check for quick responses first
      const quickResponse = hvacAIAgent.getQuickResponse(inputMessage);
      if (quickResponse) {
        const aiMessage = {
          id: Date.now() + 1,
          sender: 'ai',
          message: quickResponse,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, aiMessage]);
        setIsTyping(false);
        return;
      }

      // Process with AI
      const response = await hvacAIAgent.processCustomerMessage(
        inputMessage, 
        { conversationId, customerInfo }
      );

      const aiMessage = {
        id: Date.now() + 1,
        sender: 'ai',
        message: response.message,
        timestamp: new Date(),
        action: response.action
      };

      setMessages(prev => [...prev, aiMessage]);

      // Handle special actions
      if (response.action === 'show_scheduling_form') {
        setShowSchedulingForm(true);
      }

    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = {
        id: Date.now() + 1,
        sender: 'ai',
        message: "I'm having trouble responding right now. Please call us at 201-844-3508 for immediate assistance.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSchedulingSubmit = async (formData) => {
    try {
      // Find or create customer
      let customer = await aiAgentUtils.findExistingCustomer(formData.phone, formData.email);
      
      if (!customer) {
        customer = await aiAgentUtils.createCustomerFromChat(formData);
      }

      if (customer) {
        // Generate work order from conversation
        const workOrder = await hvacAIAgent.generateWorkOrderFromChat(messages, customer);
        
        if (workOrder) {
          const successMessage = {
            id: Date.now(),
            sender: 'ai',
            message: `Perfect! I've created work order #${workOrder.id} for you. Our team will contact you within 24 hours to confirm the appointment. You can also call us at 201-844-3508 if you need immediate assistance.`,
            timestamp: new Date()
          };
          setMessages(prev => [...prev, successMessage]);
          
          // Notify admin
          await aiAgentUtils.notifyAdminNewLead({
            customer_id: customer.id,
            work_order_id: workOrder.id,
            urgency: workOrder.priority,
            service_type: workOrder.service_type,
            source: 'ai_chat'
          });
        }
      }
      
      setShowSchedulingForm(false);
      setCustomerInfo(customer);
    } catch (error) {
      console.error('Error handling scheduling:', error);
    }
  };

  return (
    <div className="ai-chat-widget">
      {/* Chat Bubble Button */}
      {!isOpen && (
        <button 
          className="chat-bubble"
          onClick={() => setIsOpen(true)}
          aria-label="Open chat"
        >
          <div className="chat-icon">💬</div>
          <div className="chat-notification">
            Need Help?
          </div>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="chat-window">
          <div className="chat-header">
            <div className="chat-header-info">
              <h3>K&E HVAC Assistant</h3>
              <span className="online-status">🟢 Online</span>
            </div>
            <button 
              className="close-chat"
              onClick={() => setIsOpen(false)}
              aria-label="Close chat"
            >
              ✕
            </button>
          </div>

          <div className="chat-messages">
            {messages.map((message) => (
              <div 
                key={message.id} 
                className={`message ${message.sender}`}
              >
                <div className="message-content">
                  {message.message}
                </div>
                <div className="message-time">
                  {message.timestamp.toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="message ai typing">
                <div className="message-content">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {showSchedulingForm && (
            <SchedulingForm 
              onSubmit={handleSchedulingSubmit}
              onCancel={() => setShowSchedulingForm(false)}
            />
          )}

          <div className="chat-input">
            <div className="input-container">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                rows="1"
                disabled={isTyping}
              />
              <button 
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isTyping}
                className="send-button"
              >
                🚀
              </button>
            </div>
          </div>

          <div className="chat-footer">
            <div className="quick-actions">
              <button onClick={() => setInputMessage("What are your hours?")}>
                📅 Hours
              </button>
              <button onClick={() => setInputMessage("I need emergency service")}>
                🚨 Emergency
              </button>
              <button onClick={() => setInputMessage("My AC isn't cooling")}>
                ❄️ AC Issues
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Scheduling Form Component
const SchedulingForm = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    preferredDate: '',
    serviceType: '',
    description: ''
  });

  const handleSubmit = () => {
    if (formData.name && formData.phone && formData.address && formData.serviceType) {
      onSubmit(formData);
    } else {
      alert('Please fill in all required fields');
    }
  };

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="scheduling-form">
      <div className="form-header">
        <h4>Schedule Service</h4>
        <button onClick={onCancel}>✕</button>
      </div>
      
      <div className="form-content">
        <div className="form-row">
          <input
            type="text"
            name="name"
            placeholder="Your Name *"
            value={formData.name}
            onChange={handleChange}
          />
          <input
            type="tel"
            name="phone"
            placeholder="Phone Number *"
            value={formData.phone}
            onChange={handleChange}
          />
        </div>
        
        <input
          type="email"
          name="email"
          placeholder="Email Address"
          value={formData.email}
          onChange={handleChange}
        />
        
        <input
          type="text"
          name="address"
          placeholder="Service Address *"
          value={formData.address}
          onChange={handleChange}
        />
        
        <div className="form-row">
          <input
            type="date"
            name="preferredDate"
            value={formData.preferredDate}
            onChange={handleChange}
            min={new Date().toISOString().split('T')[0]}
          />
          
          <select
            name="serviceType"
            value={formData.serviceType}
            onChange={handleChange}
          >
            <option value="">Service Type *</option>
            <option value="repair">Repair</option>
            <option value="maintenance">Maintenance</option>
            <option value="installation">Installation</option>
            <option value="inspection">Inspection</option>
          </select>
        </div>
        
        <textarea
          name="description"
          placeholder="Describe the issue or service needed"
          value={formData.description}
          onChange={handleChange}
          rows="3"
        ></textarea>
        
        <div className="form-actions">
          <button type="button" onClick={onCancel} className="btn-cancel">
            Cancel
          </button>
          <button type="button" onClick={handleSubmit} className="btn-submit">
            Schedule Service
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIChatWidget;