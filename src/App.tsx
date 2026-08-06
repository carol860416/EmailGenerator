import React, { useState, useEffect, useCallback } from "react";
import { 
  Mail, 
  Send, 
  Files,
  Upload,
  CheckCircle2, 
  Clock, 
  MapPin, 
  User, 
  Link as LinkIcon, 
  FileText, 
  Image as ImageIcon, 
  Copy, 
  Trash2, 
  RefreshCw,
  Sparkles,
  ChevronDown,
  Info,
  ExternalLink,
  Plus,
  X,
  Check,
  Calendar,
  UserCheck
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "./lib/utils";
import { EmailData, EmailType, ToneStyle, Language, GeneratedEmail, LinkItem, AdjustmentType, EmailPurpose, ContentLength } from "./types/email";
import ReactMarkdown from 'react-markdown';

const TONES: { value: ToneStyle; label: string }[] = [
  { value: "FORMAL_CLEAR", label: "正式清楚" },
  { value: "INTERNAL_PROFESSIONAL", label: "內部專業公告" },
  { value: "PROFESSIONAL_FRIENDLY", label: "專業親切" },
  { value: "MATURE_NATURAL", label: "成熟自然" },
  { value: "WARM_ENCOURAGING", label: "溫暖鼓勵" },
  { value: "SINCERE_SUPPORTIVE", label: "真誠支持陪伴" },
  { value: "CONCISE_DIRECT", label: "精簡直接" },
  { value: "ACTION_ORIENTED", label: "行動導向" },
  { value: "LIVELY_FRIENDLY", label: "活潑親切自然" },
];

const CONTENT_LENGTHS: { value: ContentLength; label: string }[] = [
  { value: "CONCISE", label: "精煉版" },
  { value: "STANDARD", label: "適中版" },
  { value: "COMPLETE", label: "完整版" },
];

const PURPOSES: { value: EmailPurpose; label: string }[] = [
  { value: "PRE_COURSE_REMINDER", label: "課前提醒信" },
  { value: "EVENT_INVITATION", label: "活動邀請信" },
  { value: "REGISTRATION_SUCCESS", label: "報名成功通知" },
  { value: "EVENT_CHANGE", label: "活動異動通知" },
  { value: "COURSE_CANCELLATION", label: "課程取消通知" },
  { value: "POST_COURSE_REMINDER", label: "課後提醒信" },
  { value: "RESOURCE_SHARING", label: "課後資源分享信" },
  { value: "FOLLOW_UP_NOTICE", label: "回訓通知" },
  { value: "SATISFACTION_SURVEY", label: "滿意度填答提醒" },
  { value: "INTERNAL_ANNOUNCEMENT", label: "其他內部公告" },
  { value: "OTHER", label: "其他（請自行輸入）" },
];

const ADJUSTMENTS: { value: AdjustmentType; label: string }[] = [
  { value: "FORMAL", label: "較正式版" },
  { value: "WARM", label: "較溫暖版" },
  { value: "CONCISE", label: "更精簡版" },
  { value: "COMPLETE", label: "更完整版" },
];

const GREETINGS = ["Hi all", "親愛的夥伴們", "各位同仁大家好"];
const CLOSINGS = ["Best Regards", "祝 學習愉快", "由衷感謝您的參與", "有任何問題歡迎隨時聯繫"];

const LOCATION_OPTIONS = [
  "宏匯 1335, 1336",
  "宏匯 1401",
  "悅塔 1306",
  "iTower 2204, 2205",
  "線上 Teams 會議",
  "其他 (自訂)"
];

const COORDINATOR_OPTIONS = [
  "Carol Chan",
  "PeiChun Liao",
  "Ann Chen",
  "Jason Kuo",
  "Julie Lin"
];

const INITIAL_LINK: LinkItem = { url: "", text: "", enabled: true };

const INITIAL_DATA: EmailData = {
  type: "PRE_COURSE",
  courseName: "",
  recipientGreeting: GREETINGS[1],
  courseDate: "",
  courseStartTime: "09:30",
  courseEndTime: "12:00",
  courseTime: "",
  courseLocation: LOCATION_OPTIONS[0],
  preWork: [""],
  readingLinks: [{ ...INITIAL_LINK }],
  thinkingQuestions: [""],
  resourceLinks: [{ ...INITIAL_LINK }],
  assignments: [""],
  followUpDate: "",
  courseOwners: ["Carol Chan"],
  courseOwner: "Carol Chan",
  closingGreeting: CLOSINGS[1],
  tone: "PROFESSIONAL_FRIENDLY",
  language: "繁體中文",
  contentLength: "STANDARD",
  snapshots: [],
  customPurpose: "PRE_COURSE_REMINDER",
  customPurposeOther: "",
  customGoal: "",
  customRecipients: "",
  customCta: "",
  customNotices: "",
  customContext: "",
};

function markdownToHtml(md: string): string {
  if (!md) return "";
  
  let html = md
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // Bold
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  
  // Links [text](url)
  html = html.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" style="color: #008B8B; text-decoration: underline; font-weight: 500;">$1</a>');
  
  // Horizontal Rule ---
  html = html.replace(/^---$/gm, '<hr style="border: 0; border-top: 1px solid #E5E7EB; margin: 16px 0;" />');

  // Split lines
  const lines = html.split("\n");
  let result: string[] = [];
  let inList = false;

  for (let line of lines) {
    line = line.trim();
    if (line.startsWith("• ") || line.startsWith("- ")) {
      if (!inList) {
        inList = true;
        result.push('<ul style="margin: 8px 0; padding-left: 20px;">');
      }
      result.push(`<li style="margin-bottom: 4px;">${line.substring(2)}</li>`);
    } else {
      if (inList) {
        inList = false;
        result.push("</ul>");
      }
      if (line === "") {
        result.push('<br/>');
      } else if (line.startsWith("<hr")) {
        result.push(line);
      } else {
        result.push(`<p style="margin: 6px 0; line-height: 1.6; font-family: Arial, sans-serif;">${line}</p>`);
      }
    }
  }
  if (inList) {
    result.push("</ul>");
  }

  return `<div style="font-family: Arial, sans-serif; font-size: 15px; color: #1F2937; line-height: 1.6;">${result.join("")}</div>`;
}

export default function App() {
  const [data, setData] = useState<EmailData>(INITIAL_DATA);
  const [generated, setGenerated] = useState<GeneratedEmail | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedSubject, setCopiedSubject] = useState(false);
  const [copiedBody, setCopiedBody] = useState(false);
  const [copiedFormatted, setCopiedFormatted] = useState(false);
  const [adjustment, setAdjustment] = useState<AdjustmentType>("ORIGINAL");

  const handleInputChange = (field: keyof EmailData, value: any) => {
    setData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleCoordinator = (name: string) => {
    const current = data.courseOwners || [];
    let updated: string[];
    if (current.includes(name)) {
      updated = current.filter((n) => n !== name);
    } else {
      updated = [...current, name];
    }
    setData((prev) => ({
      ...prev,
      courseOwners: updated,
      courseOwner: updated.join(", "),
    }));
  };

  const handleArrayChange = (field: "preWork" | "thinkingQuestions" | "assignments", index: number, value: string) => {
    const newArray = [...(data[field] || [])];
    newArray[index] = value;
    setData((prev) => ({ ...prev, [field]: newArray }));
  };

  const handleLinkChange = (field: "readingLinks" | "resourceLinks", index: number, link: LinkItem) => {
    const newArray = [...(data[field] || [])];
    newArray[index] = link;
    setData((prev) => ({ ...prev, [field]: newArray }));
  };

  const addArrayItem = (field: "preWork" | "thinkingQuestions" | "assignments") => {
    setData((prev) => ({ ...prev, [field]: [...(prev[field] || []), ""] }));
  };

  const addLinkItem = (field: "readingLinks" | "resourceLinks") => {
    setData((prev) => ({ ...prev, [field]: [...(prev[field] || []), { ...INITIAL_LINK }] }));
  };

  const removeArrayItem = (field: "preWork" | "thinkingQuestions" | "assignments" | "readingLinks" | "resourceLinks", index: number) => {
    const newArray = [...(data[field] as any[] || [])];
    if (newArray.length > 1) {
      newArray.splice(index, 1);
      setData((prev) => ({ ...prev, [field]: newArray }));
    }
  };

  const clearForm = () => {
    setData(INITIAL_DATA);
    setGenerated(null);
    setAdjustment("ORIGINAL");
  };

  const getFormattedTime = useCallback(() => {
    if (data.courseStartTime && data.courseEndTime) {
      return `${data.courseStartTime} - ${data.courseEndTime}`;
    }
    return data.courseStartTime || data.courseEndTime || data.courseTime || "";
  }, [data.courseStartTime, data.courseEndTime, data.courseTime]);

  const getFormattedOwner = useCallback(() => {
    if (data.courseOwners && data.courseOwners.length > 0) {
      return data.courseOwners.join(", ");
    }
    return data.courseOwner || "L&D Team";
  }, [data.courseOwners, data.courseOwner]);

  const getFormattedDate = useCallback(() => {
    if (!data.courseDate) return "";
    return data.courseDate.replace(/-/g, "/");
  }, [data.courseDate]);

  const generateEmail = async (useAI: boolean = false, adj: AdjustmentType = "ORIGINAL") => {
    setIsGenerating(true);
    setAdjustment(adj);
    
    const formattedTime = getFormattedTime();
    const formattedOwner = getFormattedOwner();
    const formattedDate = getFormattedDate();

    if (useAI) {
      try {
        const promptAdjustment = adj === "ORIGINAL" ? "" : `\nAdjustment Request: Please make the email ${adj === "FORMAL" ? "more formal" : adj === "WARM" ? "warmer and more personal" : adj === "CONCISE" ? "more concise and direct" : "more detailed and complete"}.`;
        
        const enabledReadingLinks = data.readingLinks?.filter(l => l.enabled && l.url);
        const enabledResourceLinks = data.resourceLinks?.filter(l => l.enabled && l.url);

        let details = "";
        if (data.type === "PRE_COURSE") {
          details = `
- Date: ${formattedDate}
- Start Time: ${data.courseStartTime || ""}
- End Time: ${data.courseEndTime || ""}
- Combined Time: ${formattedTime}
- Location: ${data.courseLocation}
- Pre-work: ${data.preWork?.join(", ")}
- Reading/Video Links: ${enabledReadingLinks?.map(l => `${l.text || l.url} (${l.url})`).join(", ")}
- Questions: ${data.thinkingQuestions?.join(", ")}`;
        } else if (data.type === "POST_COURSE") {
          details = `
- Resource Links: ${enabledResourceLinks?.map(l => `${l.text || l.url} (${l.url})`).join(", ")}
- Assignments: ${data.assignments?.join(", ")}
- Next session: ${data.followUpDate}`;
        } else {
          const purpose = data.customPurpose === "OTHER" ? data.customPurposeOther : PURPOSES.find(p => p.value === data.customPurpose)?.label;
          details = `
- Email Purpose: ${purpose}
- Email Goal: ${data.customGoal}
- Target Recipients: ${data.customRecipients}
- Date: ${formattedDate}
- Time: ${formattedTime}
- Required Action from User: ${data.customCta}
- Important Notices: ${data.customNotices}
- Context/Background: ${data.customContext}`;
        }

        const prompt = `Please generate an internal professional email based on the following information:
Course/Event Type: ${data.type}
Course/Event Name: ${data.courseName}
Recipient Greeting: ${data.recipientGreeting}
Tone: ${data.tone}
Content Length Preferred: ${data.contentLength}
Language: ${data.language}
Details: ${details}
Email Coordinators/Senders: ${formattedOwner}
Closing: ${data.closingGreeting}${promptAdjustment}

Output strictly in JSON format with "subject" and "body" keys. Keep it professional for a corporate environment at Moxa.`;

        const response = await fetch("/api/generate-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            prompt,
            systemInstruction: `You are a professional corporate communications specialist at Moxa. 
Your goal is to write clear, engaging, and professional internal emails. 
Adhere to the requested TONE and CONTENT LENGTH exactly.
- TONE GUIDELINES:
  - FORMAL_CLEAR: Professional, objective, easy to understand.
  - INTERNAL_PROFESSIONAL: Corporate style, standard for internal announcements.
  - PROFESSIONAL_FRIENDLY: Professional but with a warm touch.
  - MATURE_NATURAL: Sophisticated, not over-the-top, authentic.
  - WARM_ENCOURAGING: Supportive, positive, motivating.
  - SINCERE_SUPPORTIVE: Genuine care, helping the recipient.
  - CONCISE_DIRECT: Efficient, straight to the point.
  - ACTION_ORIENTED: Focused on what needs to be done next.
  - LIVELY_FRIENDLY: Energetic, casual but respectful.

Always output JSON with 'subject' and 'body' fields.`
          }),
        });

        if (!response.ok) {
          let errDetail = "";
          try {
            const errJson = await response.json();
            errDetail = errJson.error || errJson.message || "";
          } catch {
            errDetail = await response.text();
          }
          throw new Error(`Server returned ${response.status}: ${errDetail}`);
        }
        
        const resData = await response.json();
        if (!resData.text) {
          throw new Error("Empty response from AI server.");
        }

        try {
          const jsonMatch = resData.text.match(/\{[\s\S]*\}/);
          const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : resData.text);
          setGenerated(parsed);
        } catch {
          setGenerated({
            subject: `[${data.courseName}] Email Notification`,
            body: resData.text
          });
        }
      } catch (error: any) {
        console.error("AI Generation Failed:", error);
        alert(`AI 生成失敗 (${error?.message || "網路或伺服器異常"})，將為您改用系統模板生成。`);
        generateEmail(false, adj);
      }
    } else {
      // Template-based generation fallback
      const isEn = data.language === "English";
      let subject = "";
      let body = "";
      const enabledReadingLinks = data.readingLinks?.filter(l => l.enabled && l.url);
      const enabledResourceLinks = data.resourceLinks?.filter(l => l.enabled && l.url);

      if (data.type === "PRE_COURSE") {
        subject = isEn 
          ? `[Pre-course] ${data.courseName} - Notification` 
          : `【課前通知】${data.courseName} 課程提醒`;
        
        body = `${data.recipientGreeting},

${isEn ? `You've successfully registered for the "${data.courseName}" course! Here are the details:` : `您好，感謝您報名參加「${data.courseName}」課程！
為了讓課程順利進行並達到最佳學習效果，在此提供課程相關資訊與課前準備事項：`}

---
${isEn ? "📅 Date:" : "📅 課程日期："} ${formattedDate || "TBD"}
${isEn ? "⏰ Time:" : "⏰ 課程時間："} ${formattedTime || "TBD"}
${isEn ? "📍 Location:" : "📍 課程地點："} ${data.courseLocation || "TBD"}
---

${(data.preWork?.filter(i => i.trim())?.length || 0) > 0 ? `
${isEn ? "✅ Pre-work Tasks:" : "✅ 課前準備事項："}
${data.preWork?.filter(i => i.trim()).map(item => `• ${item}`).join("\n")}
` : ""}

${(enabledReadingLinks?.length || 0) > 0 ? `
${isEn ? "📚 Required Resources:" : "📚 學習資源："}
${enabledReadingLinks?.map(l => `• [${l.text || l.url}](${l.url})`).join("\n")}
` : ""}

${isEn ? "We look forward to your active participation. Let's learn and grow together!" : "期待能在課程中與您共同學習、交流成長！"}

${data.closingGreeting},
${formattedOwner}`;
      } else if (data.type === "POST_COURSE") {
        subject = isEn 
          ? `[Post-course] ${data.courseName} - Resources & Follow-up` 
          : `【課後資源】${data.courseName} 課程重點回顧與追蹤`;
        
        body = `${data.recipientGreeting},

${isEn ? `Thank you for participating in "${data.courseName}". We hope the session was valuable to you!` : `感謝您參與「${data.courseName}」課程！
希望當天的課程內容對您的工作有所啟發，我們也將當天的精華整理如下：`}

${(enabledResourceLinks?.length || 0) > 0 ? `
${isEn ? "📁 Course Materials & Resources:" : "📁 課程相關資源："}
${enabledResourceLinks?.map(l => `• [${l.text || l.url}](${l.url})`).join("\n")}
` : ""}

${isEn ? "Apply what you've learned to your daily work." : "期待您能將課程所學應用於實務工作中。"}

${data.closingGreeting},
${formattedOwner}`;
        } else {
          subject = isEn 
            ? `[Notice] ${data.courseName}` 
            : `【通知】${data.courseName}`;
          
          body = `${data.recipientGreeting},

${isEn ? `This is a notification regarding ${data.courseName}.` : `此封信件是關於「${data.courseName}」的相關事宜通知。`}

${data.customGoal ? `**${isEn ? "Purpose" : "信件目的"}:** ${data.customGoal}` : ""}
${formattedDate ? `**${isEn ? "Date" : "日期"}:** ${formattedDate}` : ""}
${formattedTime ? `**${isEn ? "Time" : "時間"}:** ${formattedTime}` : ""}
${data.customCta ? `**${isEn ? "Action Required" : "行動要求"}:** ${data.customCta}` : ""}
${data.customNotices ? `\n---\n**${isEn ? "Important Notes" : "注意事項"}:**\n${data.customNotices}` : ""}

${isEn ? "Best regards," : "順頌時祺，"}
${formattedOwner}`;
        }
        
        setGenerated({ subject, body });
      }
      
      setIsGenerating(false);
    };

  const copyToClipboard = (text: string, type: 'subject' | 'body') => {
    navigator.clipboard.writeText(text);
    if (type === 'subject') {
      setCopiedSubject(true);
      setTimeout(() => setCopiedSubject(false), 2000);
    } else {
      setCopiedBody(true);
      setTimeout(() => setCopiedBody(false), 2000);
    }
  };

  const copyFormattedToClipboard = async () => {
    if (!generated?.body) return;
    const htmlContent = markdownToHtml(generated.body);
    const plainText = generated.body;

    try {
      if (navigator.clipboard && window.ClipboardItem) {
        const blobHtml = new Blob([htmlContent], { type: "text/html" });
        const blobText = new Blob([plainText], { type: "text/plain" });
        const item = new ClipboardItem({
          "text/html": blobHtml,
          "text/plain": blobText,
        });
        await navigator.clipboard.write([item]);
        setCopiedFormatted(true);
        setTimeout(() => setCopiedFormatted(false), 2000);
        return;
      }
    } catch (e) {
      console.warn("ClipboardItem failed, fallback to plain text:", e);
    }

    // Fallback
    navigator.clipboard.writeText(plainText);
    setCopiedFormatted(true);
    setTimeout(() => setCopiedFormatted(false), 2000);
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-moxa-light">
      {/* Header */}
      <header className="bg-white border-b border-border px-6 py-3 flex items-center justify-between shrink-0 z-20 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-moxa-green border-2 border-moxa-yellow rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-inner">
            M
          </div>
          <div>
            <h1 className="text-lg font-bold text-moxa-dark leading-none mb-0.5">Moxa Email</h1>
            <p className="text-[10px] text-gray-500 font-medium tracking-wide uppercase">課程 Email 小幫手</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={clearForm}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-border text-gray-700 rounded text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            <Trash2 size={16} />
            清空表單
          </button>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden">
        {/* Left Panel: Configuration */}
        <aside className="w-[420px] bg-white border-r border-border overflow-y-auto p-6 flex flex-col gap-6 shrink-0 custom-scrollbar">
          <div className="space-y-6">
            {/* Email Type */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Email 類型</label>
              <div className="grid grid-cols-1 gap-2">
                {(["PRE_COURSE", "POST_COURSE", "CUSTOM"] as EmailType[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => handleInputChange("type", t)}
                    className={cn(
                      "py-2.5 px-4 rounded border text-left text-sm font-medium transition-all flex items-center justify-between group",
                      data.type === t 
                        ? "bg-moxa-green/5 border-moxa-green text-moxa-green ring-1 ring-moxa-green/20" 
                        : "bg-white border-border text-gray-600 hover:border-gray-300"
                    )}
                  >
                    {t === "PRE_COURSE" ? "課前通知信 (Pre-course)" : t === "POST_COURSE" ? "課後提醒信 (Post-course)" : "自定義客製模板"}
                    {data.type === t && <CheckCircle2 size={14} />}
                  </button>
                ))}
              </div>
            </div>

            {/* Basic Info */}
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">課程/活動名稱</label>
                <input 
                  type="text" 
                  placeholder="例如：2024 數位轉型實戰營"
                  value={data.courseName}
                  onChange={(e) => handleInputChange("courseName", e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-border rounded text-sm outline-none focus:border-moxa-green transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">收件對象</label>
                  <select 
                    value={data.recipientGreeting}
                    onChange={(e) => handleInputChange("recipientGreeting", e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-border rounded text-sm outline-none focus:border-moxa-green transition-colors cursor-pointer"
                  >
                    {GREETINGS.map(g => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">內文長度</label>
                  <select 
                    value={data.contentLength}
                    onChange={(e) => handleInputChange("contentLength", e.target.value as ContentLength)}
                    className="w-full px-3 py-2 bg-white border border-border rounded text-sm outline-none focus:border-moxa-green transition-colors cursor-pointer"
                  >
                    {CONTENT_LENGTHS.map(l => (
                      <option key={l.value} value={l.value}>{l.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">語氣風格</label>
                <select 
                  value={data.tone}
                  onChange={(e) => handleInputChange("tone", e.target.value as ToneStyle)}
                  className="w-full px-3 py-2 bg-white border border-border rounded text-sm outline-none focus:border-moxa-green transition-colors cursor-pointer"
                >
                  {TONES.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>

              {/* Course Coordinators Multi-select */}
              <div className="space-y-2">
                <div className="flex items-center justify-between px-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                    <UserCheck size={12} className="text-moxa-green" />
                    課程負責人 (可多選)
                  </label>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {COORDINATOR_OPTIONS.map((name) => {
                    const isSelected = (data.courseOwners || []).includes(name);
                    return (
                      <button
                        key={name}
                        type="button"
                        onClick={() => toggleCoordinator(name)}
                        className={cn(
                          "px-2.5 py-1 rounded text-xs font-medium border transition-all flex items-center gap-1",
                          isSelected 
                            ? "bg-moxa-green text-white border-moxa-green shadow-sm"
                            : "bg-gray-50 text-gray-600 border-border hover:bg-gray-100"
                        )}
                      >
                        {isSelected && <Check size={12} />}
                        {name}
                      </button>
                    );
                  })}
                </div>
                <input 
                  type="text" 
                  placeholder="可手動修改/補充負責人姓名"
                  value={data.courseOwner}
                  onChange={(e) => {
                    const val = e.target.value;
                    const names = val.split(",").map(s => s.trim()).filter(Boolean);
                    setData(prev => ({ ...prev, courseOwner: val, courseOwners: names }));
                  }}
                  className="w-full px-3 py-1.5 bg-white border border-border rounded text-xs outline-none focus:border-moxa-green transition-colors"
                />
              </div>
            </div>

            {/* Dynamic Fields for PRE_COURSE */}
            {data.type === "PRE_COURSE" && (
              <div className="space-y-4 pt-4 border-t border-gray-100">
                {/* Date Picker */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1 flex items-center gap-1">
                    <Calendar size={12} className="text-moxa-green" />
                    課程日期 (日曆選擇)
                  </label>
                  <input 
                    type="date" 
                    value={data.courseDate || ""}
                    onChange={(e) => handleInputChange("courseDate", e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-border rounded text-sm outline-none focus:border-moxa-green transition-colors cursor-pointer"
                  />
                </div>

                {/* Start & End Time */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1 flex items-center gap-1">
                    <Clock size={12} className="text-moxa-green" />
                    課程時間 (開始與結束)
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] text-gray-400 shrink-0">從</span>
                      <input 
                        type="time" 
                        value={data.courseStartTime || ""}
                        onChange={(e) => handleInputChange("courseStartTime", e.target.value)}
                        className="w-full px-2 py-1.5 bg-white border border-border rounded text-xs outline-none focus:border-moxa-green transition-colors cursor-pointer"
                      />
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] text-gray-400 shrink-0">至</span>
                      <input 
                        type="time" 
                        value={data.courseEndTime || ""}
                        onChange={(e) => handleInputChange("courseEndTime", e.target.value)}
                        className="w-full px-2 py-1.5 bg-white border border-border rounded text-xs outline-none focus:border-moxa-green transition-colors cursor-pointer"
                      />
                    </div>
                  </div>
                </div>

                {/* Location Dropdown */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1 flex items-center gap-1">
                    <MapPin size={12} className="text-moxa-green" />
                    課程地點
                  </label>
                  <select 
                    value={LOCATION_OPTIONS.includes(data.courseLocation || "") ? data.courseLocation : "其他 (自訂)"}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === "其他 (自訂)") {
                        handleInputChange("courseLocation", "");
                      } else {
                        handleInputChange("courseLocation", val);
                      }
                    }}
                    className="w-full px-3 py-2 bg-white border border-border rounded text-sm outline-none focus:border-moxa-green transition-colors cursor-pointer"
                  >
                    {LOCATION_OPTIONS.map(loc => (
                      <option key={loc} value={loc}>{loc}</option>
                    ))}
                  </select>
                  {(!LOCATION_OPTIONS.includes(data.courseLocation || "") || data.courseLocation === "") && (
                    <input 
                      type="text" 
                      placeholder="請輸入自訂地點"
                      value={data.courseLocation || ""}
                      onChange={(e) => handleInputChange("courseLocation", e.target.value)}
                      className="w-full mt-1.5 px-3 py-1.5 bg-white border border-border rounded text-xs outline-none focus:border-moxa-green transition-colors"
                    />
                  )}
                </div>

                <ArrayField 
                  label="課前準備事項" 
                  items={data.preWork || []} 
                  onChange={(idx, val) => handleArrayChange("preWork", idx, val)}
                  onAdd={() => addArrayItem("preWork")}
                  onRemove={(idx) => removeArrayItem("preWork", idx)}
                />
                
                <LinkArrayField 
                  label="課前資源連結" 
                  items={data.readingLinks || []} 
                  onChange={(idx, val) => handleLinkChange("readingLinks", idx, val)}
                  onAdd={() => addLinkItem("readingLinks")}
                  onRemove={(idx) => removeArrayItem("readingLinks", idx)}
                />
              </div>
            )}

            {/* Dynamic Fields for POST_COURSE */}
            {data.type === "POST_COURSE" && (
              <div className="space-y-4 pt-4 border-t border-gray-100">
                <LinkArrayField 
                  label="課後資源連結" 
                  items={data.resourceLinks || []} 
                  onChange={(idx, val) => handleLinkChange("resourceLinks", idx, val)}
                  onAdd={() => addLinkItem("resourceLinks")}
                  onRemove={(idx) => removeArrayItem("resourceLinks", idx)}
                />

                <ArrayField 
                  label="課後作業/實作任務" 
                  items={data.assignments || []} 
                  onChange={(idx, val) => handleArrayChange("assignments", idx, val)}
                  onAdd={() => addArrayItem("assignments")}
                  onRemove={(idx) => removeArrayItem("assignments", idx)}
                />

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">後續行動 (日期/回訓)</label>
                  <input 
                    type="date" 
                    value={data.followUpDate || ""}
                    onChange={(e) => handleInputChange("followUpDate", e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-border rounded text-sm outline-none focus:border-moxa-green transition-colors cursor-pointer"
                  />
                </div>
              </div>
            )}

            {/* Dynamic Fields for CUSTOM */}
            {data.type === "CUSTOM" && (
              <div className="space-y-4 pt-4 border-t border-gray-100">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">本封信的用途</label>
                  <select 
                    value={data.customPurpose}
                    onChange={(e) => handleInputChange("customPurpose", e.target.value as EmailPurpose)}
                    className="w-full px-3 py-2 bg-white border border-border rounded text-sm outline-none focus:border-moxa-green transition-colors cursor-pointer"
                  >
                    {PURPOSES.map(p => (
                      <option key={p.value} value={p.value}>{p.label}</option>
                    ))}
                  </select>
                </div>

                {data.customPurpose === "OTHER" && (
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">自行輸入用途</label>
                    <input 
                      type="text" 
                      placeholder="請輸入此封信的具體用途"
                      value={data.customPurposeOther}
                      onChange={(e) => handleInputChange("customPurposeOther", e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-border rounded text-sm outline-none focus:border-moxa-green transition-colors"
                    />
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">信件目的</label>
                  <textarea 
                    placeholder="例如：通知同仁課程已取消並說明原因"
                    value={data.customGoal}
                    onChange={(e) => handleInputChange("customGoal", e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 bg-white border border-border rounded text-sm outline-none focus:border-moxa-green transition-colors resize-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">收件對象</label>
                  <input 
                    type="text" 
                    placeholder="例如：所有報名過此專案的同仁"
                    value={data.customRecipients}
                    onChange={(e) => handleInputChange("customRecipients", e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-border rounded text-sm outline-none focus:border-moxa-green transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">日期 (日曆選擇)</label>
                    <input 
                      type="date" 
                      value={data.courseDate || ""}
                      onChange={(e) => handleInputChange("courseDate", e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-border rounded text-sm outline-none focus:border-moxa-green transition-colors cursor-pointer"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">開始時間</label>
                      <input 
                        type="time" 
                        value={data.courseStartTime || ""}
                        onChange={(e) => handleInputChange("courseStartTime", e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-border rounded text-sm outline-none focus:border-moxa-green transition-colors cursor-pointer"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">結束時間</label>
                      <input 
                        type="time" 
                        value={data.courseEndTime || ""}
                        onChange={(e) => handleInputChange("courseEndTime", e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-border rounded text-sm outline-none focus:border-moxa-green transition-colors cursor-pointer"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">希望收件者採取的行動</label>
                  <input 
                    type="text" 
                    placeholder="例如：請於 6/30 前填寫回饋表單"
                    value={data.customCta}
                    onChange={(e) => handleInputChange("customCta", e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-border rounded text-sm outline-none focus:border-moxa-green transition-colors"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">注意事項</label>
                  <textarea 
                    placeholder="例如：請記得攜帶員工證、此課程不計入必修學分"
                    value={data.customNotices}
                    onChange={(e) => handleInputChange("customNotices", e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 bg-white border border-border rounded text-sm outline-none focus:border-moxa-green transition-colors resize-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">背景資訊與情境</label>
                  <textarea 
                    placeholder="其他額外要補充的背景資訊..."
                    value={data.customContext}
                    onChange={(e) => handleInputChange("customContext", e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 bg-white border border-border rounded text-sm outline-none focus:border-moxa-green transition-colors resize-none"
                  />
                </div>
              </div>
            )}

            {/* Footer Actions */}
            <div className="pt-6 mt-4 border-t border-gray-100 space-y-3">
              <div className="flex items-center justify-between mb-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">輸出語言</label>
                <div className="flex bg-gray-100 p-0.5 rounded text-[10px]">
                  {["繁體中文", "English"].map(l => (
                    <button 
                      key={l}
                      onClick={() => handleInputChange("language", l)}
                      className={cn("px-2 py-0.5 rounded", data.language === l ? "bg-white text-gray-900 shadow-sm font-semibold" : "text-gray-500")}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-1 gap-2">
                <button 
                  onClick={() => generateEmail(true)}
                  disabled={isGenerating || !data.courseName}
                  className="w-full py-2.5 px-4 bg-moxa-green text-white rounded font-semibold text-sm hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                >
                  {isGenerating ? <RefreshCw className="animate-spin" size={16} /> : <Sparkles size={16} />}
                  一鍵產出Email
                </button>
              </div>
            </div>
          </div>
        </aside>

        {/* Right Panel: Preview Canvas */}
        <section className="flex-1 bg-moxa-light p-8 overflow-y-auto relative">
          <div className="max-w-3xl mx-auto flex flex-col h-full gap-4">
            <div className="flex items-center justify-between px-1 flex-wrap gap-2">
              <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                <Send size={14} className="text-moxa-green" />
                即時預覽 (Draft Preview)
              </h2>
              <div className="flex flex-wrap gap-2 items-center">
                {generated && (
                  <div className="relative group/adj">
                    <button className="px-3 py-1 bg-white border border-border text-[11px] font-semibold text-gray-600 rounded hover:bg-gray-50 transition-colors flex items-center gap-1">
                      <RefreshCw size={12} className={isGenerating ? "animate-spin" : ""} />
                      調整風格
                      <ChevronDown size={12} />
                    </button>
                    <div className="absolute right-0 top-full mt-1 w-32 bg-white border border-border rounded shadow-lg opacity-0 invisible group-hover/adj:opacity-100 group-hover/adj:visible transition-all z-50">
                      {ADJUSTMENTS.map(a => (
                        <button
                          key={a.value}
                          onClick={() => generateEmail(true, a.value)}
                          className="w-full text-left px-3 py-2 text-[10px] font-medium text-gray-600 hover:bg-gray-50 transition-colors border-b last:border-0 border-border"
                        >
                          {a.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                <button 
                  onClick={() => generated && copyToClipboard(generated.subject, 'subject')}
                  disabled={!generated}
                  className="px-3 py-1 bg-white border border-border text-[11px] font-semibold text-gray-600 rounded hover:bg-gray-50 disabled:opacity-30 transition-colors shadow-sm"
                >
                  {copiedSubject ? "已複製 ✅" : "複製主旨"}
                </button>
                <button 
                  onClick={copyFormattedToClipboard}
                  disabled={!generated}
                  className="px-3 py-1 bg-moxa-green/10 text-moxa-green border border-moxa-green/30 text-[11px] font-semibold rounded hover:bg-moxa-green/20 disabled:opacity-30 transition-colors shadow-sm"
                  title="可直接貼上至 Outlook / Gmail 包含粗體與超連結格式"
                >
                  {copiedFormatted ? "已複製排版 ✅" : "複製排版文字"}
                </button>
                <button 
                  onClick={() => generated && copyToClipboard(generated.body, 'body')}
                  disabled={!generated}
                  className="px-3 py-1 bg-moxa-green text-white text-[11px] font-semibold rounded hover:opacity-90 disabled:opacity-30 transition-colors shadow-sm"
                >
                   {copiedBody ? "已複製 ✅" : "複製內文純文字"}
                </button>
              </div>
            </div>

            {/* Email Canvas */}
            <div className="flex flex-col gap-4 min-h-0 flex-1">
              <div className="bg-white border border-border rounded-lg shadow-xl shadow-gray-200/50 flex flex-col min-h-0">
                <AnimatePresence mode="wait">
                  {!generated ? (
                    <motion.div 
                      key="empty"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex-1 p-20 text-center flex flex-col items-center justify-center text-gray-400"
                    >
                      <Mail size={48} strokeWidth={1} className="mb-4 opacity-20" />
                      <p className="text-sm">設定完成後，點擊左側產出按鈕開始預覽。</p>
                    </motion.div>
                  ) : (
                    <motion.div 
                      key="content"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex flex-col h-full overflow-hidden"
                    >
                      <div className="px-6 py-4 bg-gray-50/50 border-b border-border">
                        <p className="text-sm text-gray-700">
                          <strong className="text-gray-400 font-medium tracking-tight mr-2">Subject:</strong> 
                          <span className="font-semibold">{generated.subject}</span>
                        </p>
                      </div>
                      <div className="flex-1 overflow-y-auto p-8 md:p-12 text-gray-800 font-sans leading-relaxed text-[15px]">
                        <div className="prose prose-sm max-w-none">
                          <ReactMarkdown>{generated.body}</ReactMarkdown>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

            </div>
            
            <div className="text-[11px] text-center text-gray-400 mt-4 font-medium italic">
              Designed for Moxa L&D
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

function ArrayField({ label, items, onChange, onAdd, onRemove }: { 
  label: string; 
  items: string[]; 
  onChange: (i: number, v: string) => void;
  onAdd: () => void;
  onRemove: (i: number) => void;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between px-1">
        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{label}</label>
        <button 
          onClick={onAdd}
          className="text-[10px] text-moxa-green hover:underline font-bold"
        >
          + 新增
        </button>
      </div>
      <div className="space-y-1.5">
        {items.map((item, idx) => (
          <div key={idx} className="flex items-center gap-1.5 group">
            <input 
              type="text" 
              value={item}
              onChange={(e) => onChange(idx, e.target.value)}
              placeholder={`內容 ${idx + 1}`}
              className="flex-1 px-3 py-1.5 bg-gray-50 border border-border rounded text-xs outline-none focus:border-moxa-green focus:bg-white transition-all"
            />
            {items.length > 1 && (
              <button 
                onClick={() => onRemove(idx)}
                className="p-1.5 text-gray-300 hover:text-red-500 transition-colors"
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function LinkArrayField({ label, items, onChange, onAdd, onRemove }: { 
  label: string; 
  items: LinkItem[]; 
  onChange: (i: number, v: LinkItem) => void;
  onAdd: () => void;
  onRemove: (i: number) => void;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between px-1">
        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{label}</label>
        <button onClick={onAdd} className="text-[10px] text-moxa-green hover:underline font-bold">+ 新增連結</button>
      </div>
      <div className="space-y-2">
        {items.map((item, idx) => (
          <div key={idx} className="flex gap-2 p-3 bg-gray-50 rounded-lg border border-border relative group">
            <div className="flex flex-col gap-2 flex-1">
              <div className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  checked={item.enabled}
                  onChange={(e) => onChange(idx, { ...item, enabled: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-300 text-moxa-green focus:ring-moxa-green"
                />
                <input 
                  type="text" 
                  value={item.text}
                  onChange={(e) => onChange(idx, { ...item, text: e.target.value })}
                  placeholder="連結呈現文字 (如: 下載講義)"
                  className="flex-1 px-2 py-1 bg-white border border-border rounded text-xs outline-none focus:border-moxa-green"
                />
              </div>
              <input 
                type="text" 
                value={item.url}
                onChange={(e) => onChange(idx, { ...item, url: e.target.value })}
                placeholder="貼上連結 URL"
                className="w-full px-2 py-1 bg-white border border-border rounded text-xs outline-none focus:border-moxa-green"
              />
            </div>
            {items.length > 1 && (
              <button 
                onClick={() => onRemove(idx)}
                className="text-gray-300 hover:text-red-500 transition-colors self-start"
              >
                <X size={14} />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}


function FileUploadField({ label, files, onUpload, onRemove, accept, isImage }: { 
  label: string; 
  files: string[]; 
  onUpload: (f: FileList | null) => void;
  onRemove: (i: number) => void;
  accept: string;
  isImage?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">{label}</label>
      <div className="space-y-2">
        <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-200 rounded-lg hover:border-moxa-green hover:bg-moxa-green/5 cursor-pointer transition-all">
          <Upload className="text-gray-400 mb-1" size={20} />
          <span className="text-[10px] text-gray-500 font-medium">點擊或拖放檔案上傳</span>
          <input type="file" multiple accept={accept} className="hidden" onChange={(e) => onUpload(e.target.files)} />
        </label>
        {files.length > 0 && (
          <div className="grid grid-cols-1 gap-1">
            {files.map((file, idx) => (
              <div key={idx} className="flex items-center justify-between py-1 px-2 bg-gray-50 rounded text-[10px] text-gray-600 border border-border">
                <div className="flex items-center gap-2 overflow-hidden">
                  {isImage ? <ImageIcon size={12} /> : <FileText size={12} />}
                  <span className="truncate">{file}</span>
                </div>
                <button onClick={() => onRemove(idx)} className="text-gray-400 hover:text-red-500">
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
