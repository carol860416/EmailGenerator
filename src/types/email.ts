export type EmailType = "PRE_COURSE" | "POST_COURSE" | "CUSTOM";

export type ToneStyle = 
  | "FORMAL_CLEAR" 
  | "INTERNAL_PROFESSIONAL" 
  | "PROFESSIONAL_FRIENDLY" 
  | "MATURE_NATURAL" 
  | "WARM_ENCOURAGING" 
  | "SINCERE_SUPPORTIVE" 
  | "CONCISE_DIRECT" 
  | "ACTION_ORIENTED" 
  | "LIVELY_FRIENDLY";

export type ContentLength = "CONCISE" | "STANDARD" | "COMPLETE";

export type EmailPurpose = 
  | "PRE_COURSE_REMINDER"
  | "EVENT_INVITATION"
  | "REGISTRATION_SUCCESS"
  | "EVENT_CHANGE"
  | "COURSE_CANCELLATION"
  | "POST_COURSE_REMINDER"
  | "RESOURCE_SHARING"
  | "FOLLOW_UP_NOTICE"
  | "SATISFACTION_SURVEY"
  | "INTERNAL_ANNOUNCEMENT"
  | "OTHER";

export type Language = "繁體中文" | "English";

export interface LinkItem {
  url: string;
  text: string;
  enabled: boolean;
}

export type AdjustmentType = "ORIGINAL" | "FORMAL" | "WARM" | "CONCISE" | "COMPLETE";

export interface EmailData {
  type: EmailType;
  courseName: string;
  recipientGreeting: string;
  courseDate?: string;
  courseStartTime?: string;
  courseEndTime?: string;
  courseTime?: string;
  courseLocation?: string;
  preWork?: string[];
  readingLinks?: LinkItem[];
  thinkingQuestions?: string[];
  resourceLinks?: LinkItem[];
  assignments?: string[];
  followUpDate?: string;
  courseOwners?: string[];
  courseOwner: string;
  closingGreeting: string;
  tone: ToneStyle;
  language: Language;
  contentLength: ContentLength;
  snapshots?: string[];
  
  // Custom fields
  customPurpose?: EmailPurpose;
  customPurposeOther?: string;
  customGoal?: string;
  customRecipients?: string;
  customCta?: string;
  customNotices?: string;
  customContext?: string;
}

export interface GeneratedEmail {
  subject: string;
  body: string;
}
