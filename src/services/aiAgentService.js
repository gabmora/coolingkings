// src/services/aiAgentService.js - Production-safe version
import { supabase } from './supabase';

// Lazy load OpenAI only when needed and API key is available
let openai = null;

const initializeOpenAI = async () => {
  if (!process.env.REACT_APP_OPENAI_API_KEY) {
    console.log('OpenAI API key not available - using fallback responses');
    return null;
  }
  
  if (!openai) {
    try {
      const OpenAI = await import('openai');
      openai = new OpenAI.default({
        apiKey: process.env.REACT_APP_OPENAI_API_KEY,
        dangerouslyAllowBrowser: true
      });
      console.log('OpenAI initialized successfully');
    } catch (error) {
      console.error('Failed to initialize OpenAI:', error);
      return null;
    }
  }
  
  return openai;
};

class HVACAIAgent {
  constructor() {
    this.systemPrompt = `You are a professional HVAC customer service AI agent for K&E HVAC. 
You help customers with:
- Scheduling service appointments
- Answering HVAC questions
- Providing emergency service information
- Explaining maintenance plans
- Troubleshooting basic issues

Always be helpful, professional, and knowledgeable about HVAC systems.
If someone needs immediate emergency service, direct them to call 201-844-3508.
For scheduling, collect: name, phone, address, service type, preferred date/time, and issue description.`;
  }

  // Main AI response method with fallback
  async processCustomerMessage(message, context = {}) {
    try {
      // Try to get quick response first (doesn't need OpenAI)
      const quickResponse = this.getQuickResponse(message);
      if (quickResponse) {
        await this.logConversation({
          conversation_id: context.conversationId || 'unknown',
          customer_id: context.customerInfo?.id || null,
          user_message: message,
          ai_response: quickResponse,
          intent: this.detectIntent(message),
          created_at: new Date().toISOString()
        });

        return {
          message: quickResponse,
          action: this.detectSchedulingIntent(quickResponse) || this.detectSchedulingIntent(message) ? 'show_scheduling_form' : null,
          intent: this.detectIntent(message)
        };
      }

      // Try to initialize OpenAI
      const aiClient = await initializeOpenAI();
      
      if (!aiClient) {
        // Fallback response when OpenAI is not available
        const fallbackResponse = this.getFallbackResponse(message);
        
        await this.logConversation({
          conversation_id: context.conversationId || 'unknown',
          customer_id: context.customerInfo?.id || null,
          user_message: message,
          ai_response: fallbackResponse.message,
          intent: fallbackResponse.intent,
          created_at: new Date().toISOString()
        });

        return fallbackResponse;
      }

      // Use OpenAI if available
      const completion = await aiClient.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: 'system', content: this.systemPrompt },
          { role: 'user', content: message }
        ],
        temperature: 0.7,
        max_tokens: 500
      });

      const aiResponse = completion.choices[0].message.content;

      // Log conversation to database
      await this.logConversation({
        conversation_id: context.conversationId || 'unknown',
        customer_id: context.customerInfo?.id || null,
        user_message: message,
        ai_response: aiResponse,
        intent: this.detectIntent(message),
        created_at: new Date().toISOString()
      });

      // Check if response contains scheduling intent
      if (this.detectSchedulingIntent(aiResponse) || this.detectSchedulingIntent(message)) {
        return {
          message: aiResponse,
          action: 'show_scheduling_form',
          intent: 'schedule_service'
        };
      }

      return {
        message: aiResponse,
        action: null,
        intent: this.detectIntent(message)
      };

    } catch (error) {
      console.error('Error processing AI message:', error);
      
      // Enhanced fallback for different error types
      let fallbackMessage = "I'm having trouble responding right now. Please call us at 201-844-3508 for immediate assistance.";
      
      if (error.status === 429) {
        fallbackMessage = "I'm getting a lot of requests right now. Please try again in a moment or call us at 201-844-3508 for immediate assistance.";
      } else if (error.status === 401) {
        fallbackMessage = "I'm having trouble with my authentication. Please call us at 201-844-3508 for immediate assistance.";
      }

      return {
        message: fallbackMessage,
        action: null,
        intent: 'error'
      };
    }
  }

  // Enhanced fallback responses when OpenAI is not available
  getFallbackResponse(message) {
    const lowerMessage = message.toLowerCase();
    
    // Emergency responses
    if (lowerMessage.includes('emergency') || lowerMessage.includes('urgent') || 
        lowerMessage.includes('not working') || lowerMessage.includes('broken')) {
      return {
        message: "I understand this is urgent! For immediate emergency HVAC service, please call us right now at 201-844-3508. We provide 24/7 emergency service and can have a technician dispatched quickly.",
        action: null,
        intent: 'emergency'
      };
    }

    // Scheduling requests
    if (lowerMessage.includes('schedule') || lowerMessage.includes('appointment') || 
        lowerMessage.includes('service') || lowerMessage.includes('repair') ||
        lowerMessage.includes('maintenance') || lowerMessage.includes('install')) {
      return {
        message: "I'd be happy to help you schedule HVAC service! Let me get some information from you to set up an appointment with our technicians.",
        action: 'show_scheduling_form',
        intent: 'schedule_service'
      };
    }

    // AC/Cooling issues
    if (lowerMessage.includes('ac') || lowerMessage.includes('cooling') || 
        lowerMessage.includes('air condition') || lowerMessage.includes('cold')) {
      return {
        message: "For AC issues, try these quick checks: 1) Make sure thermostat is set to 'cool' and temperature is lower than current room temp, 2) Check if air filter needs replacing, 3) Ensure circuit breakers are on. If these don't help, I can schedule a technician visit for you!",
        action: null,
        intent: 'repair_needed'
      };
    }

    // Heating issues
    if (lowerMessage.includes('heat') || lowerMessage.includes('furnace') || 
        lowerMessage.includes('warm') || lowerMessage.includes('hot')) {
      return {
        message: "For heating issues, check: 1) Thermostat is set to 'heat' mode, 2) Temperature setting is higher than current room temp, 3) Air filter isn't clogged, 4) Circuit breakers are on. Still having trouble? Let me schedule a service call for you!",
        action: null,
        intent: 'repair_needed'
      };
    }

    // Pricing questions
    if (lowerMessage.includes('price') || lowerMessage.includes('cost') || 
        lowerMessage.includes('estimate') || lowerMessage.includes('quote')) {
      return {
        message: "Our service call fee starts at $89, and we provide free estimates for installations and major repairs. The exact cost depends on your specific needs. I can schedule an appointment for a technician to assess your situation and provide an accurate quote.",
        action: null,
        intent: 'pricing_inquiry'
      };
    }

    // Default response
    return {
      message: "Thanks for contacting K&E HVAC! I'm here to help with your heating and cooling needs. Whether you need emergency service, routine maintenance, or have questions about your HVAC system, I can assist you. What can I help you with today?",
      action: null,
      intent: 'general_inquiry'
    };
  }

  // Detect intent from user message
  detectIntent(message) {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('emergency') || lowerMessage.includes('urgent')) return 'emergency';
    if (lowerMessage.includes('schedule') || lowerMessage.includes('appointment')) return 'schedule_service';
    if (lowerMessage.includes('price') || lowerMessage.includes('cost')) return 'pricing_inquiry';
    if (lowerMessage.includes('not working') || lowerMessage.includes('broken')) return 'repair_needed';
    if (lowerMessage.includes('maintenance')) return 'maintenance_inquiry';
    if (lowerMessage.includes('hours') || lowerMessage.includes('open')) return 'business_hours';
    
    return 'general_inquiry';
  }

  // Detect if customer wants to schedule service
  detectSchedulingIntent(message) {
    const schedulingKeywords = [
      'schedule', 'appointment', 'service call', 'repair',
      'maintenance', 'installation', 'visit', 'technician',
      'book', 'set up', 'when can', 'available'
    ];
    
    return schedulingKeywords.some(keyword => 
      message.toLowerCase().includes(keyword)
    );
  }

  // Create lead from chat interaction
  async createLeadFromChat(conversationHistory, customerInfo, formData = null) {
    try {
      // Qualify the lead based on conversation
      const leadQualification = await this.qualifyLead(conversationHistory);
      
      // Determine urgency from conversation and form data
      const urgency = this.determineUrgency(conversationHistory, formData);
      
      // Create lead record
      const leadData = {
        customer_id: customerInfo.id,
        conversation_id: conversationHistory[0]?.conversationId || Date.now().toString(),
        lead_score: leadQualification.score,
        urgency: urgency,
        service_type: formData?.serviceType || 'repair',
        status: 'new',
        source: 'ai_chat',
        notes: `AI Chat Lead
${formData?.description ? `Customer Issue: ${formData.description}` : ''}
${formData?.preferredDate ? `Preferred Date: ${formData.preferredDate}` : ''}

Conversation Summary:
${conversationHistory.map(msg => `${msg.sender}: ${msg.message}`).join('\n')}

Lead Qualification:
Score: ${leadQualification.score}/10
Reasons: ${leadQualification.reasons.join(', ')}`
      };

      const { data: createdLead, error } = await supabase
        .from('ai_leads')
        .insert([leadData])
        .select()
        .single();

      if (error) {
        console.error('Error creating lead:', error);
        return null;
      }

      return createdLead;
    } catch (error) {
      console.error('Error in createLeadFromChat:', error);
      return null;
    }
  }

  // Determine urgency from conversation and form data
  determineUrgency(conversationHistory, formData) {
    const allMessages = conversationHistory.map(msg => msg.message).join(' ').toLowerCase();
    
    if (allMessages.includes('emergency') || allMessages.includes('not working') || 
        allMessages.includes('broken') || allMessages.includes('urgent')) {
      return 'high';
    }
    
    if (allMessages.includes('soon') || allMessages.includes('this week') || 
        formData?.serviceType === 'repair') {
      return 'medium';
    }
    
    return 'low';
  }

  // Auto-qualify leads based on conversation (with fallback)
  async qualifyLead(conversationHistory) {
    const messages = conversationHistory.map(msg => ({
      role: msg.sender === 'ai' ? 'assistant' : 'user',
      content: msg.message
    }));

    try {
      const aiClient = await initializeOpenAI();
      
      if (!aiClient) {
        // Simple fallback qualification
        const urgency = this.determineUrgency(conversationHistory, null);
        const score = urgency === 'high' ? 8 : urgency === 'medium' ? 6 : 4;
        return { 
          score, 
          reasons: ['Basic qualification - AI unavailable'], 
          urgency 
        };
      }

      const completion = await aiClient.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: 'system',
            content: `Analyze this HVAC conversation and rate the lead quality from 1-10.
Consider: urgency, budget indicators, specific needs mentioned, contact information provided.
Return JSON: {"score": number, "reasons": ["reason1", "reason2"], "urgency": "low|medium|high"}`
          },
          ...messages
        ],
        temperature: 0.3
      });

      return JSON.parse(completion.choices[0].message.content);
    } catch (error) {
      console.error('Error qualifying lead:', error);
      return { score: 5, reasons: ['Qualification failed'], urgency: 'medium' };
    }
  }

  // Generate work order details from conversation
  async generateWorkOrderFromChat(conversationHistory, customerInfo, formData = null) {
    try {
      // First create the lead
      const lead = await this.createLeadFromChat(conversationHistory, customerInfo, formData);
      
      const aiClient = await initializeOpenAI();
      
      if (!aiClient) {
        // Fallback work order creation
        const workOrder = {
          title: formData?.serviceType ? `${formData.serviceType.charAt(0).toUpperCase() + formData.serviceType.slice(1)} Service` : "AI Chat Service Request",
          service_type: formData?.serviceType || "repair",
          priority: this.mapUrgencyToPriority(lead?.urgency || 'medium'),
          description: formData?.description || "Service request from AI chat",
          notes: `AI Generated Work Order${formData?.preferredDate ? `\nPreferred Date: ${formData.preferredDate}` : ''}\n\nCustomer Description: ${formData?.description || 'Not provided'}\n\nConversation Summary:\n${conversationHistory.map(msg => `${msg.sender}: ${msg.message}`).join('\n')}`,
          customer_id: customerInfo.id,
          service_date: formData?.preferredDate || this.suggestServiceDate(lead?.urgency || 'medium'),
          time_preference: 'anytime',
          status: 'pending'
        };

        const { data: createdOrder, error } = await supabase
          .from('work_orders')
          .insert([workOrder])
          .select()
          .single();

        if (error) {
          console.error('Error creating work order:', error);
          return null;
        }

        // Update lead with work order ID
        if (lead) {
          await supabase
            .from('ai_leads')
            .update({ 
              work_order_id: createdOrder.id,
              status: 'converted'
            })
            .eq('id', lead.id);
        }

        return createdOrder;
      }

      // Use AI to generate work order details if available
      const messages = conversationHistory.map(msg => ({
        role: msg.sender === 'ai' ? 'assistant' : 'user',
        content: msg.message
      }));

      const completion = await aiClient.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: 'system',
            content: `Extract work order details from this HVAC conversation.
Return JSON with ONLY these fields: {
  "title": "Brief work order title",
  "service_type": "repair|maintenance|installation|inspection",
  "priority": "low|normal|high|emergency",
  "description": "Detailed description of the issue/work needed"
}`
          },
          ...messages
        ],
        temperature: 0.3
      });

      const workOrderDetails = JSON.parse(completion.choices[0].message.content);

      const workOrder = {
        title: formData?.serviceType ? `${formData.serviceType.charAt(0).toUpperCase() + formData.serviceType.slice(1)} Service` : (workOrderDetails.title || "AI Chat Service Request"),
        service_type: formData?.serviceType || workOrderDetails.service_type || "repair",
        priority: workOrderDetails.priority || this.mapUrgencyToPriority(lead?.urgency || 'medium'),
        description: formData?.description || workOrderDetails.description || "Service request from AI chat",
        notes: `AI Generated Work Order${formData?.preferredDate ? `\nPreferred Date: ${formData.preferredDate}` : ''}\n\nCustomer Description: ${formData?.description || 'Not provided'}\n\nConversation Summary:\n${conversationHistory.map(msg => `${msg.sender}: ${msg.message}`).join('\n')}`,
        customer_id: customerInfo.id,
        service_date: formData?.preferredDate || this.suggestServiceDate(workOrderDetails.priority || "normal"),
        time_preference: 'anytime',
        status: 'pending'
      };

      const { data: createdOrder, error } = await supabase
        .from('work_orders')
        .insert([workOrder])
        .select()
        .single();

      if (error) {
        console.error('Error creating work order:', error);
        return null;
      }

      // Update lead with work order ID
      if (lead) {
        await supabase
          .from('ai_leads')
          .update({ 
            work_order_id: createdOrder.id,
            status: 'converted'
          })
          .eq('id', lead.id);
      }

      return createdOrder;
    } catch (error) {
      console.error('Error generating work order:', error);
      return null;
    }
  }

  // Map urgency to priority
  mapUrgencyToPriority(urgency) {
    switch (urgency) {
      case 'emergency': return 'emergency';
      case 'high': return 'high';
      case 'medium': return 'normal';
      case 'low': return 'low';
      default: return 'normal';
    }
  }

  // Suggest service date based on priority
  suggestServiceDate(priority) {
    const now = new Date();
    switch (priority) {
      case 'emergency':
        return now.toISOString().split('T')[0];
      case 'high':
        now.setDate(now.getDate() + 1);
        return now.toISOString().split('T')[0];
      case 'normal':
      case 'medium':
        now.setDate(now.getDate() + 3);
        return now.toISOString().split('T')[0];
      default:
        now.setDate(now.getDate() + 7);
        return now.toISOString().split('T')[0];
    }
  }

  // Log conversation to database
  async logConversation(conversationData) {
    try {
      const { error } = await supabase
        .from('ai_conversations')
        .insert([conversationData]);
      
      if (error) console.error('Error logging conversation:', error);
    } catch (error) {
      console.error('Error in logConversation:', error);
    }
  }

  // Auto-respond to common HVAC questions
  getQuickResponse(message) {
    const quickResponses = {
      'hours': "We're open Monday-Friday 8AM-6PM, Saturday 9AM-4PM. For emergencies, call 201-844-3508 anytime!",
      'emergency': "For HVAC emergencies, please call us immediately at 201-844-3508. We provide 24/7 emergency service!",
      'pricing': "Our service call fee starts at $89. We provide free estimates for installations and major repairs. Would you like to schedule an appointment?",
      'maintenance': "We offer three maintenance plans: Essential ($150/year), Advanced ($250/year), and Premium ($350/year). Each includes tune-ups and discounts on repairs.",
      'ac not cooling': "If your AC isn't cooling, check: 1) Thermostat settings, 2) Air filter (replace if dirty), 3) Circuit breakers. If these don't help, we can send a technician today!",
      'heating not working': "For heating issues, check: 1) Thermostat is set to heat mode, 2) Circuit breakers, 3) Gas supply (if applicable). Need a technician? We can help!"
    };

    const lowerMessage = message.toLowerCase();
    for (const [key, response] of Object.entries(quickResponses)) {
      if (lowerMessage.includes(key)) {
        return response;
      }
    }
    return null;
  }

  // Test function to verify OpenAI connection
  async testConnection() {
    try {
      const aiClient = await initializeOpenAI();
      if (!aiClient) {
        console.log('OpenAI not available - using fallback responses');
        return false;
      }
      
      const completion = await aiClient.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "user", content: "write a haiku about HVAC" }
        ],
      });
      
      console.log('OpenAI Test Success:', completion.choices[0].message.content);
      return true;
    } catch (error) {
      console.error('OpenAI Test Failed:', error);
      return false;
    }
  }
}

export const hvacAIAgent = new HVACAIAgent();

// Utility functions for AI agent features
export const aiAgentUtils = {
  // Check if customer exists in database
  async findExistingCustomer(phone, email) {
    try {
      let query = supabase
        .from('customers')
        .select('*');
        
      if (phone) {
        query = query.eq('phone', phone);
      } else if (email) {
        query = query.eq('email', email);
      } else {
        return null;
      }
      
      const { data, error } = await query.maybeSingle();
      
      if (error) {
        console.error('Error finding customer:', error);
        return null;
      }
      
      return data;
    } catch (error) {
      console.error('Error finding customer:', error);
      return null;
    }
  },

  // Create new customer from chat conversation
  async createCustomerFromChat(customerData) {
    try {
      const newCustomer = {
        name: customerData.name,
        phone: customerData.phone,
        email: customerData.email || '',
        address: customerData.address || '',
        city: customerData.city || 'Bluffton',
        state: customerData.state || 'SC',
        zip: customerData.zip || '',
        type: 'residential',
        notes: `Created via AI chat on ${new Date().toLocaleDateString()}`
      };

      const { data, error } = await supabase
        .from('customers')
        .insert([newCustomer])
        .select()
        .single();
      
      if (error) {
        console.error('Error creating customer:', error);
        return null;
      }
      
      return data;
    } catch (error) {
      console.error('Error creating customer:', error);
      return null;
    }
  },

  // Send notification to admin about new AI-generated lead
  async notifyAdminNewLead(leadData) {
    try {
      const { error } = await supabase
        .from('admin_notifications')
        .insert([{
          type: 'new_ai_lead',
          title: 'New Lead from AI Agent',
          message: `AI agent generated a new ${leadData.urgency || 'normal'} priority lead for ${leadData.service_type || 'service'}`,
          data: leadData
        }]);
      
      if (error) console.error('Error sending admin notification:', error);
    } catch (error) {
      console.error('Error in notifyAdminNewLead:', error);
    }
  }
};

export default hvacAIAgent;