import React, { useState, useRef, useEffect } from 'react';
import { hvacAIAgent, aiAgentUtils } from '../services/aiAgentService';
import './AIChatWidget.css';

const AIChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'ai',
      message: "Hi! I'm K&E HVAC's AI assistant. I can help you with service questions, scheduling, or HVAC troubleshooting. How can I help you today?",
      timestamp: new Date(),
      conversationId: Date.now().toString()
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
      timestamp: new Date(),
      conversationId: conversationId
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
          timestamp: new Date(),
          conversationId: conversationId
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
        action: response.action,
        conversationId: conversationId
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
        timestamp: new Date(),
        conversationId: conversationId
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
      console.log('Starting scheduling submit with form data:', formData);
      
      // Find or create customer
      let customer = await aiAgentUtils.findExistingCustomer(formData.phone, formData.email);
      
      if (!customer) {
        console.log('Creating new customer...');
        customer = await aiAgentUtils.createCustomerFromChat(formData);
      } else {
        console.log('Found existing customer:', customer.name);
      }

      if (customer) {
        console.log('Generating work order for customer:', customer.id);
        
        // Generate work order from conversation with form data
        const workOrder = await hvacAIAgent.generateWorkOrderFromChat(messages, customer, formData);
        
        if (workOrder) {
          console.log('Work order created:', workOrder);
          
          const successMessage = {
            id: Date.now(),
            sender: 'ai',
            message: `Perfect! I've created work order ${workOrder.work_order_number || '#' + workOrder.id} for you. Our team will contact you within 24 hours to confirm the appointment. You can also call us at 201-844-3508 if you need immediate assistance.`,
            timestamp: new Date(),
            conversationId: conversationId
          };
          setMessages(prev => [...prev, successMessage]);
          
          // Notify admin
          await aiAgentUtils.notifyAdminNewLead({
            customer_id: customer.id,
            work_order_id: workOrder.id,
            work_order_number: workOrder.work_order_number,
            urgency: workOrder.priority,
            service_type: workOrder.service_type,
            source: 'ai_chat'
          });
          
          console.log('Lead notifications sent');
        } else {
          throw new Error('Failed to create work order');
        }
      } else {
        throw new Error('Failed to create or find customer');
      }
      
      setShowSchedulingForm(false);
      setCustomerInfo(customer);
    } catch (error) {
      console.error('Error handling scheduling:', error);
      const errorMessage = {
        id: Date.now(),
        sender: 'ai',
        message: "I encountered an error while creating your service request. Please call us at 201-844-3508 and we'll get you taken care of right away.",
        timestamp: new Date(),
        conversationId: conversationId
      };
      setMessages(prev => [...prev, errorMessage]);
      setShowSchedulingForm(false);
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

// Scheduling Form Component - Enhanced with better validation
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
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.serviceType) newErrors.serviceType = 'Service type is required';
    
    // Phone validation
    const phoneRegex = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
    if (formData.phone && !phoneRegex.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }
    
    // Email validation (if provided)
    if (formData.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = 'Please enter a valid email address';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (validateForm()) {
      setIsSubmitting(true);
      try {
        await onSubmit(formData);
      } catch (error) {
        console.error('Error submitting form:', error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  return (
    <div className="scheduling-form">
      <div className="form-header">
        <h4>Schedule Service</h4>
        <button onClick={onCancel} disabled={isSubmitting}>✕</button>
      </div>
      
      <div className="form-content">
        <div className="form-row">
          <div>
            <input
              type="text"
              name="name"
              placeholder="Your Name *"
              value={formData.name}
              onChange={handleChange}
              className={errors.name ? 'error' : ''}
              disabled={isSubmitting}
            />
            {errors.name && <div className="field-error">{errors.name}</div>}
          </div>
          <div>
            <input
              type="tel"
              name="phone"
              placeholder="Phone Number *"
              value={formData.phone}
              onChange={handleChange}
              className={errors.phone ? 'error' : ''}
              disabled={isSubmitting}
            />
            {errors.phone && <div className="field-error">{errors.phone}</div>}
          </div>
        </div>
        
        <div>
          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={handleChange}
            className={errors.email ? 'error' : ''}
            disabled={isSubmitting}
          />
          {errors.email && <div className="field-error">{errors.email}</div>}
        </div>
        
        <div>
          <input
            type="text"
            name="address"
            placeholder="Service Address *"
            value={formData.address}
            onChange={handleChange}
            className={errors.address ? 'error' : ''}
            disabled={isSubmitting}
          />
          {errors.address && <div className="field-error">{errors.address}</div>}
        </div>
        
        <div className="form-row">
          <input
            type="date"
            name="preferredDate"
            value={formData.preferredDate}
            onChange={handleChange}
            min={new Date().toISOString().split('T')[0]}
            disabled={isSubmitting}
          />
          
          <div>
            <select
              name="serviceType"
              value={formData.serviceType}
              onChange={handleChange}
              className={errors.serviceType ? 'error' : ''}
              disabled={isSubmitting}
            >
              <option value="">Service Type *</option>
              <option value="repair">Repair</option>
              <option value="maintenance">Maintenance</option>
              <option value="installation">Installation</option>
              <option value="inspection">Inspection</option>
            </select>
            {errors.serviceType && <div className="field-error">{errors.serviceType}</div>}
          </div>
        </div>
        
        <textarea
          name="description"
          placeholder="Describe the issue or service needed"
          value={formData.description}
          onChange={handleChange}
          rows="3"
          disabled={isSubmitting}
        ></textarea>
        
        <div className="form-actions">
          <button 
            type="button" 
            onClick={onCancel} 
            className="btn-cancel"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button 
            type="button" 
            onClick={handleSubmit} 
            className="btn-submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creating...' : 'Schedule Service'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIChatWidget;