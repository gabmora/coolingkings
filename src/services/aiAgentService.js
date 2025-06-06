// src/services/aiAgentService.js - Updated with proper lead generation
import OpenAI from "openai";
import { supabase } from './supabase';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.REACT_APP_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

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

  // Main AI response method using OpenAI SDK
  async processCustomerMessage(message, context = {}) {
    try {
      if (!process.env.REACT_APP_OPENAI_API_KEY) {
        console.error('OpenAI API key not configured');
        return {
          message: "I'm having trouble connecting to our AI service. Please call us at 201-844-3508 for immediate assistance.",
          action: null,
          intent: 'error'
        };
      }

      const completion = await openai.chat.completions.create({
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
      
      if (error.status === 429) {
        return {
          message: "I'm getting a lot of requests right now. Please try again in a moment or call us at 201-844-3508 for immediate assistance.",
          action: null,
          intent: 'error'
        };
      } else if (error.status === 401) {
        return {
          message: "I'm having trouble with my authentication. Please call us at 201-844-3508 for immediate assistance.",
          action: null,
          intent: 'error'
        };
      } else {
        return {
          message: "I'm having trouble responding right now. Please call us at 201-844-3508 for immediate assistance.",
          action: null,
          intent: 'error'
        };
      }
    }
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

  // Create lead from chat interaction - NEW FUNCTION
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

  // Auto-qualify leads based on conversation
  async qualifyLead(conversationHistory) {
    const messages = conversationHistory.map(msg => ({
      role: msg.sender === 'ai' ? 'assistant' : 'user',
      content: msg.message
    }));

    try {
      if (!process.env.REACT_APP_OPENAI_API_KEY) {
        return { score: 5, reasons: ['AI qualification unavailable'], urgency: 'medium' };
      }

      const completion = await openai.chat.completions.create({
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

  // Generate work order details from conversation - UPDATED
  async generateWorkOrderFromChat(conversationHistory, customerInfo, formData = null) {
    try {
      // First create the lead
      const lead = await this.createLeadFromChat(conversationHistory, customerInfo, formData);
      
      if (!process.env.REACT_APP_OPENAI_API_KEY) {
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

      // Use AI to generate work order details
      const messages = conversationHistory.map(msg => ({
        role: msg.sender === 'ai' ? 'assistant' : 'user',
        content: msg.message
      }));

      const completion = await openai.chat.completions.create({
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
      const completion = await openai.chat.completions.create({
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

// Utility functions for AI agent features - UPDATED
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

// Test OpenAI connection on import (for debugging)
if (process.env.NODE_ENV === 'development') {
  hvacAIAgent.testConnection();
}

export default hvacAIAgent;