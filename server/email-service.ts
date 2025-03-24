import { MailerSend, EmailParams, Recipient, Sender } from "mailersend";
import { storage } from "./storage";
import { NotificationLog, type User, type InsertNotificationLog } from "@shared/schema";

// Check if MailerSend API key is available
if (!process.env.MAILERSEND_API_KEY) {
  console.warn("MAILERSEND_API_KEY environment variable not set. Email functionality will be disabled.");
}

const mailersend = process.env.MAILERSEND_API_KEY 
  ? new MailerSend({
      apiKey: process.env.MAILERSEND_API_KEY
    })
  : null;

const DEFAULT_FROM_EMAIL = "notifications@singularis-prime.ai";
const DEFAULT_FROM_NAME = "SINGULARIS PRIME";

export type EmailTemplate = 
  | "welcome" 
  | "project_created" 
  | "quantum_simulation_completed" 
  | "ai_negotiation_completed"
  | "system_update"
  | "custom";

interface EmailTemplateContent {
  subject: string;
  plainTextContent: (user: User) => string;
  htmlContent: (user: User) => string;
}

// Email templates
const emailTemplates: Record<Exclude<EmailTemplate, "custom">, EmailTemplateContent> = {
  welcome: {
    subject: "Welcome to SINGULARIS PRIME",
    plainTextContent: (user: User) => `
      Hello ${user.displayName || user.username},
      
      Welcome to SINGULARIS PRIME - the advanced quantum computing platform that bridges the gap between quantum computing, AI governance, and interplanetary communication.
      
      Your account has been created successfully. You can now log in and start exploring the platform.
      
      Explore our tutorials and documentation to get started with quantum computing and AI-enhanced programming.
      
      Best regards,
      The SINGULARIS PRIME Team
    `,
    htmlContent: (user: User) => `
      <h1>Welcome to SINGULARIS PRIME</h1>
      <p>Hello ${user.displayName || user.username},</p>
      <p>Welcome to <strong>SINGULARIS PRIME</strong> - the advanced quantum computing platform that bridges the gap between quantum computing, AI governance, and interplanetary communication.</p>
      <p>Your account has been created successfully. You can now log in and start exploring the platform.</p>
      <p>Explore our tutorials and documentation to get started with quantum computing and AI-enhanced programming.</p>
      <p>Best regards,<br>The SINGULARIS PRIME Team</p>
    `
  },
  project_created: {
    subject: "New Project Created on SINGULARIS PRIME",
    plainTextContent: (user: User) => `
      Hello ${user.displayName || user.username},
      
      A new project has been created on your SINGULARIS PRIME account.
      
      You can access your projects at any time from your dashboard.
      
      Best regards,
      The SINGULARIS PRIME Team
    `,
    htmlContent: (user: User) => `
      <h1>New Project Created</h1>
      <p>Hello ${user.displayName || user.username},</p>
      <p>A new project has been created on your SINGULARIS PRIME account.</p>
      <p>You can access your projects at any time from your dashboard.</p>
      <p>Best regards,<br>The SINGULARIS PRIME Team</p>
    `
  },
  quantum_simulation_completed: {
    subject: "Quantum Simulation Completed",
    plainTextContent: (user: User) => `
      Hello ${user.displayName || user.username},
      
      Your quantum simulation has been successfully completed.
      
      Log in to see the results and continue your quantum computing journey.
      
      Best regards,
      The SINGULARIS PRIME Team
    `,
    htmlContent: (user: User) => `
      <h1>Quantum Simulation Completed</h1>
      <p>Hello ${user.displayName || user.username},</p>
      <p>Your quantum simulation has been successfully completed.</p>
      <p>Log in to see the results and continue your quantum computing journey.</p>
      <p>Best regards,<br>The SINGULARIS PRIME Team</p>
    `
  },
  ai_negotiation_completed: {
    subject: "AI Negotiation Results Available",
    plainTextContent: (user: User) => `
      Hello ${user.displayName || user.username},
      
      The AI negotiation process you initiated has been completed.
      
      Log in to view the outcomes and next steps in your AI governance workflow.
      
      Best regards,
      The SINGULARIS PRIME Team
    `,
    htmlContent: (user: User) => `
      <h1>AI Negotiation Results Available</h1>
      <p>Hello ${user.displayName || user.username},</p>
      <p>The AI negotiation process you initiated has been completed.</p>
      <p>Log in to view the outcomes and next steps in your AI governance workflow.</p>
      <p>Best regards,<br>The SINGULARIS PRIME Team</p>
    `
  },
  system_update: {
    subject: "SINGULARIS PRIME System Update",
    plainTextContent: (user: User) => `
      Hello ${user.displayName || user.username},
      
      We've released a new update to the SINGULARIS PRIME system with new features and improvements.
      
      Log in to explore the latest capabilities in quantum computing and AI governance.
      
      Best regards,
      The SINGULARIS PRIME Team
    `,
    htmlContent: (user: User) => `
      <h1>System Update Released</h1>
      <p>Hello ${user.displayName || user.username},</p>
      <p>We've released a new update to the SINGULARIS PRIME system with new features and improvements.</p>
      <p>Log in to explore the latest capabilities in quantum computing and AI governance.</p>
      <p>Best regards,<br>The SINGULARIS PRIME Team</p>
    `
  }
};

// Create a notification log in the database
async function logNotification(params: {
  userId: number | null;
  template: string | null;
  subject: string;
  content: string;
  status: 'sent' | 'failed';
  errorMessage?: string;
}): Promise<NotificationLog> {
  return await storage.createNotificationLog({
    userId: params.userId,
    type: 'email',
    template: params.template,
    subject: params.subject,
    content: params.content,
    status: params.status,
    errorMessage: params.errorMessage || null
  });
}

/**
 * Send an email to a user using a predefined template
 */
export async function sendTemplateEmail(
  user: User, 
  template: Exclude<EmailTemplate, "custom">,
  customFields: {
    recipientEmail?: string;
    recipientName?: string;
    [key: string]: any;
  } = {}
): Promise<{ success: boolean; message: string; logId?: number }> {
  // Check if user has email notifications enabled
  if (!user.emailNotifications) {
    return {
      success: false,
      message: "User has email notifications disabled"
    };
  }

  // Check if user has a valid email
  if (!user.email) {
    return {
      success: false,
      message: "User does not have an email address"
    };
  }

  // Check if MailerSend is configured
  if (!mailersend) {
    // Log the attempt even if we can't send
    const log = await logNotification({
      userId: user.id,
      template,
      subject: `Failed to send ${template} email`,
      content: "MailerSend API key not configured",
      status: "failed",
      errorMessage: "MailerSend API key not configured"
    });

    return {
      success: false,
      message: "MailerSend API key not configured",
      logId: log.id
    };
  }

  const templateContent = emailTemplates[template];
  
  try {
    // Create email parameters with proper structure for MailerSend
    const emailParams = new EmailParams({
      from: {
        email: DEFAULT_FROM_EMAIL,
        name: DEFAULT_FROM_NAME
      },
      to: [
        {
          email: user.email || customFields.recipientEmail || "",
          name: user.displayName || user.username || customFields.recipientName || ""
        }
      ],
      subject: templateContent.subject,
      text: templateContent.plainTextContent(user),
      html: templateContent.htmlContent(user)
    });

    // Send the email
    await mailersend.email.send(emailParams);

    // Log the successful email
    const log = await logNotification({
      userId: user.id,
      template,
      subject: templateContent.subject,
      content: templateContent.plainTextContent(user),
      status: "sent"
    });

    // Update the user's last notification timestamp
    await storage.updateUserProfile(user.id, {
      lastNotificationSent: new Date()
    });

    return {
      success: true,
      message: "Email sent successfully",
      logId: log.id
    };
  } catch (error) {
    console.error("Error sending email:", error);
    
    // Log the failed attempt
    const log = await logNotification({
      userId: user.id,
      template,
      subject: templateContent.subject,
      content: templateContent.plainTextContent(user),
      status: "failed",
      errorMessage: error instanceof Error ? error.message : String(error)
    });

    return {
      success: false,
      message: `Failed to send email: ${error instanceof Error ? error.message : String(error)}`,
      logId: log.id
    };
  }
}

/**
 * Send a custom email
 */
export async function sendCustomEmail(
  email: string,
  name: string,
  subject: string,
  textContent: string,
  htmlContent: string,
  userId?: number
): Promise<{ success: boolean; message: string; logId?: number }> {
  // Check if MailerSend is configured
  if (!mailersend) {
    // Log the attempt even if we can't send
    const log = await logNotification({
      userId: userId || null,
      template: "custom",
      subject: "Failed to send custom email",
      content: textContent,
      status: "failed",
      errorMessage: "MailerSend API key not configured"
    });

    return {
      success: false,
      message: "MailerSend API key not configured",
      logId: log.id
    };
  }

  try {
    // Create email parameters with proper structure for MailerSend
    const emailParams = new EmailParams({
      from: {
        email: DEFAULT_FROM_EMAIL,
        name: DEFAULT_FROM_NAME
      },
      to: [
        {
          email: email,
          name: name
        }
      ],
      subject: subject,
      text: textContent,
      html: htmlContent
    });

    // Send the email
    await mailersend.email.send(emailParams);

    // Log the successful email
    const log = await logNotification({
      userId: userId || null,
      template: "custom",
      subject,
      content: textContent,
      status: "sent"
    });

    return {
      success: true,
      message: "Email sent successfully",
      logId: log.id
    };
  } catch (error) {
    console.error("Error sending custom email:", error);
    
    // Log the failed attempt
    const log = await logNotification({
      userId: userId || null,
      template: "custom",
      subject,
      content: textContent,
      status: "failed",
      errorMessage: error instanceof Error ? error.message : String(error)
    });

    return {
      success: false,
      message: `Failed to send email: ${error instanceof Error ? error.message : String(error)}`,
      logId: log.id
    };
  }
}